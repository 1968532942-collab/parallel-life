/* =========================================================
   engine.js — 状态机、镜头、文案、互动系统、存档
   依赖：STORY(story.js) SCENES(scenes-*.js) AUDIO(audio.js) POSTER(poster.js)
   ========================================================= */
(function () {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const app = $('#app'), stage = $('#stage'), cap = $('#cap'), hits = $('#hits');
  const capLines = $('.cap-lines', cap), capMeta = $('.cap-meta', cap), capHint = $('.cap-hint', cap);
  const btnNext = $('#next'), btnSkip = $('#skipAct'), choiceBox = $('.cap-choices', cap);
  const KEY = 'parallel-life-v4';

  const S = { screen: 'title', route: null, actIdx: 0, beatIdx: 0, root: null, token: 0, busy: false, done: { home: false, far: false }, pending: null, track: 0 };
  window.__H5 = S; // 测试钩子

  /* ---------- 存档 ---------- */
  function save() { try { localStorage.setItem(KEY, JSON.stringify({ route: S.route, actIdx: S.actIdx, done: S.done, screen: S.screen })); } catch (e) {} }
  function load() { try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { return null; } }

  /* ---------- 基础 UI ---------- */
  let toastT;
  function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('on'), 2200); }
  function clearHits() { cancelAnimationFrame(S.track); hits.innerHTML = ''; hits.className = ''; }
  function setCap(mode) { cap.className = 'cap ' + (mode || ''); }

  function showLines(lines, meta) {
    capLines.innerHTML = '';
    capMeta.textContent = meta || '';
    (lines || []).forEach((t, i) => {
      const p = document.createElement('p');
      p.textContent = t;
      if (/^“/.test(t)) p.className = 'quote';
      p.style.animationDelay = (0.15 + i * 0.55) + 's';
      capLines.appendChild(p);
    });
    capLines.scrollTop = 0;
  }
  function revealAllLines() { capLines.querySelectorAll('p').forEach(p => { p.style.animationDelay = '0s'; p.classList.add('shown'); }); }

  /* ---------- 镜头 ---------- */
  function setCam(cam, t) {
    if (!S.root || !cam) return;
    const c = $('.cam', S.root);
    const [fx, fy, s] = cam;
    c.style.transitionDuration = (t == null ? 2.2 : t) + 's';
    // 限制平移范围，镜头永远不会移出画面边缘
    const lim = Math.max(0, (s - 1) * 50), cl = v => Math.max(-lim, Math.min(lim, v));
    c.style.transform = `translate(${cl(-(fx - 50) * s).toFixed(2)}%, ${cl(-(fy - 50) * s).toFixed(2)}%) scale(${s})`;
  }
  function flag(name, on) {
    if (!S.root) return;
    S.root.classList.toggle('f-' + name, on);
    const sc = SCENES[S.root.dataset.scene];
    if (sc && sc.flag) sc.flag(S.root, name, on);
  }
  function shot(name) {
    if (!S.root || !name) return;
    S.root.querySelectorAll('.shot').forEach(el => el.classList.toggle('on', el.dataset.shot === name));
    S.root.dataset.shot = name;
  }

  /* ---------- 场景装载 ---------- */
  function mountScene(name, init) {
    const sc = SCENES[name];
    const built = sc.build(init || []);
    const root = document.createElement('div');
    root.className = 'act';
    root.dataset.scene = name;
    root.innerHTML = `<div class="cam">${built.cam}</div><div class="fp">${built.fp || ''}</div><div class="paper"></div><div class="vig"></div>`;
    const old = stage.querySelector('.act');
    if (old) { old.classList.add('leaving'); const sco = SCENES[old.dataset.scene]; if (sco && sco.leave) sco.leave(old); setTimeout(() => old.remove(), 900); }
    stage.appendChild(root);
    S.root = root;
    (init || []).forEach(f => flag(f, true));
    const first = root.querySelector('.shot');
    if (first) shot(first.dataset.shot);
    setCam([50, 50, 1], 0);
    if (sc.enter) sc.enter(root);
    return root;
  }

  /* ---------- 标题卡（幕间） ---------- */
  function titleCard(no, title, route, cb) {
    const tc = $('#chapter');
    tc.innerHTML = `<div class="tc-route">${route}</div><div class="tc-no">${no}</div><div class="tc-title">${title}</div><div class="tc-tap">轻触继续</div>`;
    tc.classList.add('on');
    let done = false;
    const close = () => { if (done) return; done = true; tc.classList.remove('on'); tc.removeEventListener('click', close); setTimeout(cb, 300); };
    tc.addEventListener('click', close);
    setTimeout(close, 2600);
  }

  /* ---------- 剧情推进 ---------- */
  function currentBeats() {
    if (S.screen === 'prologue') return STORY.prologue.beats;
    return STORY.routes[S.route].acts[S.actIdx].beats;
  }
  function startPrologue(atRoad) {
    S.screen = 'prologue'; S.route = null; S.actIdx = 0;
    MUSIC.play('prologue');
    $('#progress').classList.remove('on');
    mountScene('prologue');
    runBeat(atRoad ? STORY.prologue.beats.length - 1 : 0);
  }
  function startRoute(route, actIdx) {
    S.screen = 'act'; S.route = route; S.actIdx = actIdx || 0;
    startAct();
  }
  function startAct() {
    const R = STORY.routes[S.route], A = R.acts[S.actIdx];
    MUSIC.play(A.id);
    const nextA = R.acts[S.actIdx + 1];
    MUSIC.preload(nextA ? nextA.id : (S.route === 'home' ? 'endHome' : 'endFar'));
    save();
    updateProgress();
    S.token++; btnNext.hidden = true; btnSkip.hidden = true; // 防止连点把下一幕也跳过
    clearHits(); setCap('hidden');
    mountScene(A.scene, A.init);
    titleCard(A.no, A.title, R.name, () => runBeat(0));
  }
  function updateProgress() {
    const p = $('#progress');
    if (!S.route) { p.classList.remove('on'); return; }
    const n = STORY.routes[S.route].acts.length;
    p.innerHTML = Array.from({ length: n }, (_, i) => `<i class="${i < S.actIdx ? 'done' : i === S.actIdx ? 'cur' : ''}"></i>`).join('');
    p.classList.add('on');
  }

  function runBeat(i) {
    const beats = currentBeats();
    S.beatIdx = i;
    const b = beats[i];
    const tok = ++S.token;
    clearHits();
    if (b.shot) shot(b.shot);
    (b.rm || []).forEach(f => flag(f, false));
    (b.add || []).forEach(f => flag(f, true));
    if (b.cam) setCam(b.cam, b.camT);
    if (b.sfx) AUDIO.sfx(b.sfx);
    if (b.music != null) MUSIC.level(b.music);
    const meta = S.screen === 'act' ? (() => { const A = STORY.routes[S.route].acts[S.actIdx]; return `${A.no} · ${A.title}`; })() : '';
    showLines(b.lines || [], meta);
    choiceBox.innerHTML = '';
    btnSkip.hidden = true;
    const isLast = i === beats.length - 1;
    if (b.act) {
      setCap((b.lines && b.lines.length ? '' : 'slim') + ' pending');
      capHint.textContent = b.act.hint || '';
      btnNext.hidden = true;
      setupAct(b.act, tok);
    } else {
      setCap((b.letter ? 'bare' : (b.lines && b.lines.length ? '' : 'slim')) + ' tapnext');
      capHint.textContent = '';
      btnNext.hidden = false;
      btnNext.textContent = isLast ? (S.screen === 'act' ? (S.actIdx === STORY.routes[S.route].acts.length - 1 ? '走向结局 →' : '下一幕 →') : '继续 →') : '继续';
      btnNext.onclick = () => {
        if (S.token !== tok) return;
        const unread = [...capLines.querySelectorAll('p')].some(p => getComputedStyle(p).opacity < 0.95);
        if (unread) { revealAllLines(); return; }
        AUDIO.sfx('tap');
        advance();
      };
    }
  }

  function advance() {
    const beats = currentBeats();
    if (S.beatIdx < beats.length - 1) return runBeat(S.beatIdx + 1);
    if (S.screen === 'act') {
      const R = STORY.routes[S.route];
      if (S.actIdx < R.acts.length - 1) { S.actIdx++; startAct(); }
      else showEnding(S.route);
    }
  }

  function completeAct(a, tok, extra) {
    if (S.token !== tok) return;
    S.token++;
    const t2 = S.token;
    clearHits();
    capHint.textContent = '';
    btnSkip.hidden = true;
    (a.rm || []).forEach(f => flag(f, false));
    (a.add || []).forEach(f => flag(f, true));
    if (a.cam) setCam(a.cam, a.camT);
    if (a.sfx) AUDIO.sfx(a.sfx);
    if (a.music != null) MUSIC.level(a.music, a.musicT);
    if (navigator.vibrate) try { navigator.vibrate(12); } catch (e) {}
    if (a.type === 'choice') return extra && extra();
    setTimeout(() => { if (S.token === t2) advance(); }, a.wait || 900);
  }

  /* ---------- 互动 ---------- */
  function target(name) { return S.root && S.root.querySelector(`[data-hit="${name}"]`); }
  function track(el, btn, minW, minH) {
    const loop = () => {
      if (!el.isConnected || !btn.isConnected) return;
      const r0 = el.getBoundingClientRect(), a = app.getBoundingClientRect();
      // 点击区只取画面里真正露出来的部分：不超出屏幕，也不落在文字面板下面
      const capTop = cap.classList.contains('hidden') ? a.bottom : cap.querySelector('.cap-meta, .cap-lines, .cap-foot').getBoundingClientRect().top - 8;
      const top = Math.max(r0.top, a.top), bottom = Math.min(r0.bottom, a.bottom, Math.max(capTop, top + 60));
      const r = { left: r0.left, width: r0.width, top, height: Math.max(0, bottom - top) };
      const w = Math.max(minW || 70, Math.min(r.width, 240)), h = Math.max(minH || 70, Math.min(r.height, 240));
      btn.style.left = (r.left - a.left + r.width / 2 - w / 2) + 'px';
      btn.style.top = (r.top - a.top + r.height / 2 - h / 2) + 'px';
      btn.style.width = w + 'px'; btn.style.height = h + 'px';
      S.track = requestAnimationFrame(loop);
    };
    loop();
  }
  function armSkip(a, tok) {
    setTimeout(() => {
      if (S.token !== tok) return;
      btnSkip.hidden = false;
      btnSkip.onclick = () => completeAct(a, tok);
    }, a.type === 'choice' ? 1e9 : 7000);
  }

  function setupAct(a, tok) {
    armSkip(a, tok);
    if (a.type === 'tap' || a.type === 'hold') {
      const el = target(a.hit);
      if (!el) { console.warn('missing hit', a.hit); completeAct(a, tok); return; }
      const btn = document.createElement('button');
      btn.className = 'hit ' + a.type;
      btn.setAttribute('aria-label', a.hint);
      btn.innerHTML = a.type === 'hold'
        ? '<span class="ring"></span><svg class="prog" viewBox="0 0 60 60"><circle cx="30" cy="30" r="26"/></svg><span class="hold-tip">长按</span>'
        : '<span class="ring"></span>';
      hits.appendChild(btn);
      track(el, btn);
      if (a.type === 'tap') btn.addEventListener('click', () => { btn.classList.add('hit-done'); burst(btn); completeAct(a, tok); });
      else holdLogic(btn, () => completeAct(a, tok));
    } else if (a.type === 'swipe') {
      const zone = document.createElement('div');
      zone.className = 'swipe-zone dir-' + a.dir;
      zone.innerHTML = `<div class="swipe-guide"><span>${a.dir === 'left' ? '←' : a.dir === 'up' ? '↑' : '→'}</span></div>`;
      hits.appendChild(zone);
      let sx = null, sy = null;
      zone.addEventListener('pointerdown', e => { sx = e.clientX; sy = e.clientY; zone.setPointerCapture(e.pointerId); });
      zone.addEventListener('pointermove', e => {
        if (sx == null) return;
        const dx = e.clientX - sx;
        if (S.root) S.root.style.setProperty('--drag', Math.max(-1, Math.min(0, dx / 140)).toFixed(3));
      });
      const end = e => {
        if (sx == null) return;
        const dx = e.clientX - sx, dy = e.clientY - sy; sx = null;
        const ok = a.dir === 'left' ? dx < -45 : a.dir === 'right' ? dx > 45 : dy < -45;
        if (S.root) S.root.style.removeProperty('--drag');
        if (ok) completeAct(a, tok);
      };
      zone.addEventListener('pointerup', end);
      zone.addEventListener('pointercancel', () => { sx = null; if (S.root) S.root.style.removeProperty('--drag'); });
    } else if (a.type === 'drag') {
      dragLogic(a, tok);
    } else if (a.type === 'pan') {
      panLogic(a, tok);
    } else if (a.type === 'choice') {
      setCap('pick');
      choiceBox.innerHTML = a.options.map(o => `<button class="choice" data-id="${o.id}"><b>${o.label}</b><small>${o.sub}</small></button>`).join('');
      choiceBox.querySelectorAll('.choice').forEach(btn => btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        AUDIO.sfx('choose');
        MUSIC.level(.6, 1.2); MUSIC.preload(STORY.routes[id].acts[0].id);
        S.root.classList.add('pick-' + id);
        setCam(id === 'home' ? [36, 44, 1.5] : [64, 44, 1.5], 1.6);
        completeAct(a, tok, () => setTimeout(() => startRoute(id, 0), 1300));
      }));
    }
  }

  /* 点中后的反馈：金色涟漪 + 几颗光点，从点击位置散开 */
  function burst(btn) {
    const r = btn.getBoundingClientRect(), a = app.getBoundingClientRect();
    const b = document.createElement('div');
    b.className = 'tap-burst';
    b.style.left = (r.left - a.left + r.width / 2) + 'px'; b.style.top = (r.top - a.top + r.height / 2) + 'px';
    b.innerHTML = '<span></span>' + Array.from({ length: 8 }, (_, i) => `<i style="--a:${i * 45}deg"></i>`).join('');
    app.appendChild(b); setTimeout(() => b.remove(), 1300);
  }

  function holdLogic(btn, done) {
    let start = 0, raf = 0, ok = false;
    const circ = 2 * Math.PI * 26, c = btn.querySelector('.prog circle');
    c.style.strokeDasharray = circ; c.style.strokeDashoffset = circ;
    const step = () => {
      const p = Math.min(1, (performance.now() - start) / 1000);
      c.style.strokeDashoffset = circ * (1 - p);
      if (S.root) S.root.style.setProperty('--hold', p.toFixed(3));
      if (p >= 1) { ok = true; btn.classList.add('hit-done'); done(); return; }
      raf = requestAnimationFrame(step);
    };
    const down = e => { if (ok) return; e.preventDefault(); start = performance.now(); try { btn.setPointerCapture(e.pointerId); } catch (_) {} AUDIO.sfx('hum'); step(); };
    const up = () => { if (ok) return; cancelAnimationFrame(raf); c.style.strokeDashoffset = circ; if (S.root) S.root.style.setProperty('--hold', 0); };
    btn.addEventListener('pointerdown', down);
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(t => btn.addEventListener(t, up));
    btn.addEventListener('keydown', e => { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) { start = performance.now(); step(); } });
    btn.addEventListener('keyup', up);
    btn.addEventListener('contextmenu', e => e.preventDefault());
  }

  function dragLogic(a, tok) {
    const el = target(a.hit), drop = target(a.drop);
    if (!el || !drop) { completeAct(a, tok); return; }
    const handle = document.createElement('div');
    handle.className = 'hit drag';
    handle.innerHTML = '<span class="ring"></span><span class="drag-arrow"></span>';
    hits.appendChild(handle);
    const dz = document.createElement('div');
    dz.className = 'drop-zone';
    hits.appendChild(dz);
    const posDz = () => { const r = drop.getBoundingClientRect(), ap = app.getBoundingClientRect(); Object.assign(dz.style, { left: r.left - ap.left + 'px', top: r.top - ap.top + 'px', width: r.width + 'px', height: r.height + 'px' }); };
    posDz();
    track(el, handle, 90, 90);
    // 拖动距离要除以镜头缩放，物体才能精确跟手
    const scale = () => { const w = el.offsetWidth || (el.getBBox && el.getBBox().width) || 1; return el.getBoundingClientRect().width / w || 1; };
    let start = null, k = 1;
    handle.addEventListener('pointerdown', e => { start = { x: e.clientX, y: e.clientY }; k = scale(); handle.setPointerCapture(e.pointerId); el.style.transition = 'none'; handle.classList.add('grab'); AUDIO.sfx('roll'); });
    handle.addEventListener('pointermove', e => {
      if (!start) return;
      el.style.transform = `translate(${(e.clientX - start.x) / k}px, ${(e.clientY - start.y) / k}px)`;
      posDz();
    });
    const end = () => {
      if (!start) return;
      start = null; handle.classList.remove('grab');
      const r = drop.getBoundingClientRect(), er = el.getBoundingClientRect();
      const cx = er.left + er.width / 2, cy = er.bottom - er.height * .15;
      const inside = cx > r.left - 30 && cx < r.right + 30 && cy > r.top - 40 && cy < r.bottom + 50;
      el.style.transition = 'transform .6s cubic-bezier(.2,.8,.2,1), opacity .6s';
      if (inside) {
        // 停在放下的位置，不弹回
        completeAct(a, tok);
      } else {
        el.style.transform = 'translate(0px,0px)';
        toast('再往房间里拖一点');
      }
    };
    handle.addEventListener('pointerup', end);
    handle.addEventListener('pointercancel', end);
  }

  function panLogic(a, tok) {
    let idx = 0;
    const n = a.stops;
    const wrap = document.createElement('div');
    wrap.className = 'pan-ui';
    wrap.innerHTML = `<button class="pan-btn prev" aria-label="向左看">‹</button><div class="pan-dots">${Array.from({ length: n }, (_, i) => `<i class="${i ? '' : 'on'}"></i>`).join('')}</div><button class="pan-btn next" aria-label="向右看">›</button>`;
    const zone = document.createElement('div');
    zone.className = 'swipe-zone pan';
    hits.appendChild(zone); hits.appendChild(wrap);
    const go = d => {
      idx = Math.max(0, Math.min(n - 1, idx + d));
      S.root.style.setProperty('--pan', idx);
      flag('pan' + idx, true);
      AUDIO.sfx('step');
      wrap.querySelectorAll('.pan-dots i').forEach((el, i) => el.classList.toggle('on', i === idx));
      if (idx === n - 1) setTimeout(() => completeAct(a, tok), 900);
    };
    wrap.querySelector('.prev').onclick = () => go(-1);
    wrap.querySelector('.next').onclick = () => go(1);
    let sx = null;
    zone.addEventListener('pointerdown', e => { sx = e.clientX; zone.setPointerCapture(e.pointerId); });
    zone.addEventListener('pointerup', e => { if (sx == null) return; const dx = e.clientX - sx; sx = null; if (dx < -40) go(1); else if (dx > 40) go(-1); });
    zone.addEventListener('wheel', e => { if (Math.abs(e.deltaX) + Math.abs(e.deltaY) > 30) go(e.deltaY > 0 || e.deltaX > 0 ? 1 : -1); }, { passive: true });
  }

  /* ---------- 结局 / 终章 ---------- */
  function showEnding(route) {
    S.screen = 'ending'; S.done[route] = true; save();
    S.token++; btnNext.hidden = true;
    clearHits(); setCap('hidden');
    $('#progress').classList.remove('on');
    const E = STORY.endings[route];
    MUSIC.play(route === 'home' ? 'endHome' : 'endFar', 1.2);
    MUSIC.preload('finale');
    const root = mountScene(E.scene);
    root.classList.add('ending');
    const panel = document.createElement('div');
    panel.className = 'end-panel';
    panel.innerHTML = `<div class="end-scroll"><div class="end-tag">${STORY.routes[route].en} · 结局</div><h2 class="end-title">${E.title}</h2><div class="end-en">${E.en}</div><p class="end-sub">${E.sub}</p><div class="end-poem">${E.lines.map(l => l ? `<p>${l}</p>` : '<p class="gap"></p>').join('')}</div></div>
      <div class="end-actions"><button class="primary" id="mkPoster">生成我的结局海报</button><button class="secondary" id="toFinale">进入终章 →</button></div>`;
    root.appendChild(panel);
    setTimeout(() => panel.classList.add('on'), 400);
    $('#mkPoster').onclick = () => POSTER.open(route);
    $('#toFinale').onclick = () => { AUDIO.sfx('tap'); showFinale(); };
    AUDIO.sfx('ending');
  }

  function showFinale() {
    S.screen = 'finale'; save();
    MUSIC.play('finale', 1.2);
    clearHits();
    const root = mountScene('finale');
    root.classList.add('finale');
    const L = STORY.finale.lines;
    let i = 0;
    const tok = ++S.token;
    const box = document.createElement('div');
    box.className = 'finale-lines';
    root.appendChild(box);
    setCap('slim finale-cap');
    capLines.innerHTML = ''; capMeta.textContent = '终章'; capHint.textContent = ''; choiceBox.innerHTML = ''; btnSkip.hidden = true;
    const step = () => {
      if (S.token !== tok) return;
      if (i < L.length) {
        const p = document.createElement('p');
        p.textContent = '“' + L[i] + '”';
        if (i === L.length - 1) p.className = 'last';
        box.appendChild(p);
        box.querySelectorAll('p').forEach((el, k) => el.classList.toggle('old', k < box.children.length - 2 && i < L.length - 1));
        if (i === L.length - 1) { box.classList.add('end'); root.classList.add('f-dawn'); }
        i++;
        btnNext.hidden = false;
        btnNext.textContent = i === L.length ? '完' : '继续';
      } else {
        btnNext.hidden = true;
        const other = S.route === 'home' ? 'far' : 'home';
        const otherName = STORY.routes[other].name;
        choiceBox.innerHTML = `<button class="choice" id="fPoster"><b>再看我的海报</b><small>${STORY.endings[S.route].title}</small></button><button class="choice" id="fOther"><b>体验另一条人生</b><small>${otherName}</small></button><button class="choice wide" id="fRestart"><b>从头开始</b><small>回到那封信</small></button>`;
        setCap('pick finale-cap');
        $('#fPoster').onclick = () => POSTER.open(S.route);
        $('#fOther').onclick = () => { AUDIO.sfx('choose'); startRoute(other, 0); };
        $('#fRestart').onclick = () => restart();
      }
    };
    btnNext.onclick = () => { AUDIO.sfx('tap'); step(); };
    setTimeout(step, 900);
  }

  /* ---------- 开始 / 菜单 ---------- */
  function restart() { S.token++; clearHits(); closeMenu(); showTitle(); }
  function showTitle() {
    S.screen = 'title'; S.route = null;
    MUSIC.play('prologue');
    $('#progress').classList.remove('on');
    setCap('hidden');
    mountScene('title');
    const saved = load();
    if (saved) S.done = saved.done || S.done;
    const resume = $('#resume');
    if (saved && saved.route && saved.screen === 'act') {
      const A = STORY.routes[saved.route].acts[saved.actIdx];
      resume.hidden = false;
      resume.innerHTML = `继续上次 · ${STORY.routes[saved.route].name} ${A.no}`;
      resume.onclick = () => begin(() => startRoute(saved.route, saved.actIdx));
    } else resume.hidden = true;
    $('#titleUi').classList.add('on');
  }
  function begin(fn) {
    AUDIO.unlock(); MUSIC.unlock();
    $('#titleUi').classList.remove('on');
    setTimeout(fn, 500);
  }
  function openMenu() { $('#menu').classList.add('on'); }
  function closeMenu() { $('#menu').classList.remove('on'); }

  $('#start').onclick = () => begin(() => startPrologue(false));
  $('#menuBtn').onclick = openMenu;
  $('#menuClose').onclick = closeMenu;
  $('#menu').addEventListener('click', e => { if (e.target.id === 'menu') closeMenu(); });
  $('#mRoad').onclick = () => { closeMenu(); $('#titleUi').classList.remove('on'); AUDIO.unlock(); MUSIC.unlock(); startPrologue(true); };
  $('#mRestart').onclick = () => { try { localStorage.removeItem(KEY); } catch (e) {} restart(); };
  $('#mHome').onclick = () => { closeMenu(); $('#titleUi').classList.remove('on'); AUDIO.unlock(); MUSIC.unlock(); startRoute('home', 0); };
  $('#mFar').onclick = () => { closeMenu(); $('#titleUi').classList.remove('on'); AUDIO.unlock(); MUSIC.unlock(); startRoute('far', 0); };
  $('#sound').onclick = () => { const on = AUDIO.toggle(); MUSIC.setOn(on); $('#sound').classList.toggle('off', !on); $('#sound').setAttribute('aria-label', on ? '关闭声音' : '开启声音'); toast(on ? '声音已开启' : '已静音'); };
  /* 轻触画面任意位置继续：只在当前这一拍没有待完成的互动时生效 */
  let lastTap = 0;
  app.addEventListener('click', e => {
    if (btnNext.hidden || S.screen === 'title' || S.screen === 'ending') return;
    if (e.target.closest('button, a, .topbar, .menu, .poster-modal, .chapter.on, .title-ui, .end-panel, #hits > *')) return;
    if ($('#chapter').classList.contains('on') || $('#menu').classList.contains('on') || $('#posterModal').classList.contains('open')) return;
    const now = Date.now(); if (now - lastTap < 380) return; lastTap = now;
    btnNext.click();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeMenu(); POSTER.close(); }
    if ((e.key === 'ArrowRight' || e.key === 'Enter') && !btnNext.hidden && document.activeElement === document.body) btnNext.click();
  });

  window.ENGINE = { startPrologue, startRoute, showEnding, showFinale, restart, toast, state: S, advance, flag, setCam };

  /* 加载：等待主角图片解码后进入标题页 */
  const img = new Image();
  const ready = () => { $('#loader').classList.add('done'); showTitle(); };
  img.onload = ready; img.onerror = ready;
  img.src = window.HEROINE_SRC;
  setTimeout(() => { if (!$('#loader').classList.contains('done')) ready(); }, 4000);
})();
