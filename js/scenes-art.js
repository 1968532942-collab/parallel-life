/* =========================================================
   scenes-art.js — 用 AI 生成的水彩插画替换程序绘制的场景
   - 每张插画放在一个保持原比例的 .frame 里，铺满画面（类似 object-fit: cover）
   - 互动点、透明素材都用相对 .frame 的百分比定位，所以不同手机尺寸下也能对准画面里的物体
   - 场景名、互动点名称（data-hit）、状态标记与旧版完全一致，剧情数据无需改动
   ========================================================= */
(function () {
  'use strict';
  const U = window.SCN, A = 'art/';
  const AR = 941 / 1672;

  /* 一张插画 + 叠加层；extra 里的元素用 frame 百分比坐标 */
  const Q = window.ASSET_V ? '?v=' + window.ASSET_V : '';
  const frame = (img, extra, opt) => {
    opt = opt || {};
    return `<div class="frame ${opt.cls || ''}" data-ar="${opt.ar || AR}"><img class="bg" src="${A}${img}.webp${Q}" alt="" draggable="false">${extra || ''}</div>`;
  };
  const layer = (img, cls, style) => `<img class="lay ${cls || ''}" src="${A}${img}.webp${Q}" alt="" draggable="false" style="${style || ''}">`;
  const hit = (name, x, y, w, h) => `<i class="hitbox" data-hit="${name}" style="left:${x}%;top:${y}%;width:${w}%;height:${h}%"></i>`;
  const shot = (name, inner, extra) => U.shot(name, inner, extra);
  /* 视频层：on = 'mount'（场景出现即播放）或某个状态标记；mode = loop（无缝循环）/ once（播一次停在最后一帧）；off = 让视频淡出的标记 */
  const vid = (name, mode, on, off, hold) => `<video class="vid" data-mode="${mode}" data-on="${on}"${off ? ` data-off="${off}"` : ''}${hold ? ` data-hold="${hold}"` : ''} src="video/${name}.mp4${Q}" muted playsinline webkit-playsinline preload="auto"${mode === 'loop' ? ' loop' : ''}></video>`;
  const steam = (x, y, w) => `<svg class="steam-ov" viewBox="0 0 100 120" style="left:${x}%;top:${y}%;width:${w}%"><g class="steam"><path class="wisp" d="M30 110q-10 -26 4 -52t-4 -50" stroke="#fffaf0" stroke-width="10"/><path class="wisp" d="M52 112q12 -30 -4 -58t6 -50" stroke="#fffaf0" stroke-width="12"/><path class="wisp" d="M72 110q-10 -26 4 -54t-2 -48" stroke="#fffaf0" stroke-width="10"/></g></svg>`;

  /* 第一人称：拿手机的手（插画），屏幕内容叠在手机黑屏的位置上 */
  window.FIG.phoneHand = function (screenHtml, extraCls) {
    return `<div class="phone-hand art ${extraCls || ''}" style="--hand-img:url('${new URL(A + 'hand_phone.webp', location.href).href}')"><img src="${A}hand_phone.webp" alt="" draggable="false"><div class="phone-screen"><div class="screen">${screenHtml}</div></div></div>`;
  };

  /* 画框适配：按场景实际可见区域计算，保证铺满且比例不变 */
  function fitFrames(root) {
    (root || document).querySelectorAll('.frame').forEach(f => {
      const box = f.closest('.cam') || f.parentElement;
      const W = box.clientWidth, H = box.clientHeight, ar = +f.dataset.ar;
      let w = W, h = W / ar;
      if (h < H) { h = H; w = H * ar; }
      const pan = f.classList.contains('pan');
      Object.assign(f.style, { width: w + 'px', height: h + 'px', left: (pan ? 0 : (W - w) / 2) + 'px', top: (H - h) / 2 + 'px' });
      if (pan) f.style.setProperty('--span', (w - W) + 'px');
    });
  }
  window.fitFrames = fitFrames;
  let rz; window.addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => fitFrames(), 120); });
  new MutationObserver(() => fitFrames()).observe(document.getElementById('stage'), { childList: true });

  /* ---------------- 标题页 ---------------- */
  SCENES.title = { build() { return { cam: shot('t', frame('p_night', `<img class="title-hero art" src="${A}heroine.webp" alt="">`), U.fall('glow', 14, { t0: 14, t1: 22, s0: 2, s1: 4 })) }; } };

  /* ---------------- 序章 ---------------- */
  SCENES.prologue = {
    build() {
      const letter = `<div class="envelope" data-hit="envelope"><div class="env-back"></div><div class="env-paper"></div><div class="env-front"></div><div class="env-flap"></div><div class="env-seal">✦</div></div>
        <article class="letter"><div class="lt-to">TO · 另一个时空的我</div>${STORY.letter.map((t, i) => `<p class="ln ln${i + 1}">${t}</p>`).join('')}<div class="lt-sign">—— 来自平行时空的我</div></article>`;
      const labels = `<div class="road-label l" style="left:20%;top:44%">家乡</div><div class="road-label r" style="right:16%;left:auto;top:41%">远方</div>`;
      return { cam: shot('night', frame('p_night'), letter + U.fall('glow', 12, { t0: 14, t1: 22, s0: 2, s1: 4 })) + shot('road', frame('p_road', labels)) };
    }
  };

  /* ---------------- 家乡一：桂花 ---------------- */
  SCENES.osmanthus = {
    build() {
      const art = frame('h1_street', layer('h1_trees', 'trees') + hit('blossom', 34, 26, 32, 24));
      const fall = U.fall('osm', 30, { x0: 4, x1: 96, t0: 7, t1: 11, s0: 5, s1: 8 }) + U.fall('osm', 22, { x0: 0, x1: 100, t0: 6, t1: 9, s0: 5, s1: 8, cls: 'windy' });
      const palm = `<div class="palm art"><img src="${A}hand_palm.webp" alt="" draggable="false"><span class="caught"></span></div>`;
      return { cam: shot('s', art, fall), fp: palm };
    }
  };

  /* ---------------- 家乡二：晚风、校门、闪回 ---------------- */
  SCENES.walk = {
    build() {
      const walk = frame('h2_walk', vid('v_walk', 'loop', 'mount') + `<div class="family-wrap">${layer('h2_family', 'family walker')}</div>`);
      const gate = frame('h2_gate', hit('gate', 34, 34, 32, 26) + vid('v_gate', 'once', 'out', 'far') + `<div class="students-wrap">${layer('h2_students', 'students walker')}</div>`);
      const flash = frame('h2_flash', vid('v_flash', 'once', 'flashback'));
      return { cam: shot('walk', walk, U.fall('leaf', 9, { t0: 11, t1: 17, s0: 9, s1: 14 })) + shot('gate', gate, U.fall('leaf', 5, { t0: 13, t1: 18, s0: 8, s1: 12 })) + shot('flash', flash, '<div class="flash-frame"></div>' + U.fall('glow', 14, { t0: 12, t1: 18, s0: 2, s1: 5 })) };
    }
  };

  /* ---------------- 家乡三：面馆 ---------------- */
  SCENES.noodle = {
    build() {
      const ext = frame('h3_outside', layer('h3_outside_open', 'door-open') + hit('door', 30, 32, 40, 40));
      const int = frame('h3_inside', vid('v_noodle', 'loop', 'open') + `<div class="bowl-g" data-hit="bowl" style="left:24%;top:63%;width:52%">${layer('h3_bowl', '', 'position:static;width:100%')}</div>` + `<div class="steam big" style="position:absolute;left:30%;top:44%;width:40%">${steam(0, 0, 100).replace('class="steam-ov"', 'class="steam-ov" style="position:static;width:100%"')}</div>` + steam(64, 14, 14).replace('<svg', '<svg data-idle="1"'));
      return { cam: shot('ext', ext, U.fall('snow', 26, { t0: 9, t1: 15, s0: 2, s1: 5 })) + shot('int', int) };
    }
  };

  /* ---------------- 家乡四：樱花 ---------------- */
  SCENES.cherry = {
    build() {
      const art = frame('h4_cherry', hit('tree', 58, 30, 36, 30) + hit('canopy', 26, 6, 48, 22));
      const fall = U.fall('petal', 10, { t0: 12, t1: 18, s0: 7, s1: 10 }) + U.fall('petal', 26, { t0: 8, t1: 13, s0: 7, s1: 11, cls: 'windy' });
      return { cam: shot('c', art, fall + '<i class="follow-petal"></i>') };
    }
  };

  /* ---------------- 家乡五：生活蒙太奇 ---------------- */
  SCENES.montage = {
    build() {
      const M = window.MINI;
      const screen = `<div class="feed"><div class="feed-bar">附近 · 推荐</div>
        <div class="post p0"><div class="ph"></div><div class="tx"></div><div class="tx s"></div></div>
        <div class="post p1"><div class="ph city">${M.miniCity()}</div><div class="pcap">另一座城市的夜晚</div></div>
        <div class="post p2"><div class="ph hall">${M.miniHall()}</div><div class="pcap">今晚的音乐会</div></div>
        <div class="post p3"><div class="ph gal">${M.miniGallery()}</div><div class="pcap">周末去了美术馆</div></div></div>`;
      return {
        cam: shot('market', frame('h5_market', vid('v_market', 'once', 'mount'))) + shot('tidy', frame('h5_tidy'), U.fall('glow', 12, { t0: 14, t1: 20, s0: 2, s1: 3 })) + shot('kitchen', frame('h5_kitchen') + steam(56, 18, 16)) + shot('sofa', frame('h5_sofa')),
        fp: `<div class="fp-phone" data-hit="phone">${FIG.phoneHand(screen)}</div>`
      };
    }
  };

  /* ---------------- 远方一 / 六：出租屋（四张同构图插画，局部渐显） ---------------- */
  SCENES.room = {
    build(init) {
      const lived = init.indexOf('lived') >= 0;
      // 第一幕：空房间为底，逐步显出布置好的部分（同一构图，局部遮罩渐显）
      const reveal = (cls, mask) => layer('c_room_done', 'reveal ' + cls, `-webkit-mask-image:${mask};mask-image:${mask}`);
      const firstRoom = frame('c_room_empty',
        reveal('rv-bed', 'radial-gradient(ellipse 34% 26% at 84% 49%, #000 62%, transparent 100%)') +
        reveal('rv-clothes', 'radial-gradient(ellipse 22% 22% at 13% 30%, #000 60%, transparent 100%)') +
        reveal('rv-items', 'radial-gradient(ellipse 22% 9% at 46% 27%, #000 55%, transparent 100%)') +
        reveal('rv-case', 'radial-gradient(ellipse 28% 13% at 51% 63%, #000 60%, transparent 100%)') +
        layer('c_room_night', 'night-room') +
        `<div class="case-drag" data-hit="suitcase" style="left:6%;top:47%;width:21%">${layer('c_suitcase', '', 'position:static;width:100%')}</div>` +
        hit('dropzone', 34, 54, 34, 18) + hit('bed', 70, 40, 28, 22) + hit('suitcase-open', 36, 56, 30, 14) + hit('lamp', 34, 20, 12, 10) +
        '<div class="room-dark"></div>');
      const livedRoom = frame('c_room_lived',
        layer('c_room_empty', 'past-room') +
        hit('switch', 90, 36, 9, 14) + hit('desk', 34, 24, 34, 12) +
        '<div class="room-dark"></div><div class="ceil-warm"></div>');
      const chat = `<div class="chat"><div class="chat-top">妈</div><div class="bub in">到了吗？房间怎么样</div><div class="bub me sent-b">我收拾好了，房间还不错。</div><div class="chat-input"><span class="typed">我收拾好了，房间还不错。</span><button class="send" data-hit="send" aria-label="发送">发送</button></div></div>`;
      const album = `<div class="album"><div class="chat-top">相册 · 一年前</div><div class="thumbs"><div class="th"></div><div class="th"></div><div class="th big" data-hit="photo"><img src="${A}c_room_empty.webp" alt=""></div><div class="th"></div><div class="th"></div><div class="th"></div></div></div>`;
      const cam = lived ? shot('corridor', frame('c6_corridor', layer('c6_corridor', 'door-swing') + hit('door', 24, 22, 50, 54))) + shot('room', livedRoom) : shot('room', firstRoom);
      return { cam: cam + '<div class="past-tint"></div>', fp: `<div class="fp-phone">${FIG.phoneHand(lived ? album : chat)}</div>` };
    }
  };

  const SCENES_METRO_OLD = SCENES.metro && SCENES.metro.flag;
  /* ---------------- 远方二：末班地铁 ---------------- */
  SCENES.metro = {
    build() {
      // 车窗外夜景和倒影都已画在插画里；叠一层向左流动的光带，表现列车向右行驶
      const streaks = `<div class="win-streaks"><div class="mv far">${Array.from({ length: 2 }, () => '<i></i>').join('')}</div><div class="mv near">${Array.from({ length: 12 }, () => '<i></i>').join('')}</div></div>`;
      const art = frame('c2_carriage', vid('v_metro', 'loop', 'mount') + streaks + '<div class="reflect-glow"></div>' + hit('window', 2, 14, 84, 25) + '<div class="door-glow"></div><div class="exit-light"></div>', { cls: 'carriage' }) + '<div class="night-out"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>';
      const screen = `<div class="chat"><div class="chat-top">妈</div><div class="bub in msg-b">今天忙不忙？记得好好吃饭。</div><div class="bub me reply-b">挺好的，不用担心。</div><div class="chat-input"><span class="typed">挺好的，不用担心。</span><button class="send" data-hit="reply" aria-label="回复">回复</button></div><div class="lock">23:41<small>妈：今天忙不忙？…</small></div></div>`;
      return { cam: shot('m', art), fp: `<div class="fp-phone peek" data-hit="myphone">${FIG.phoneHand(screen)}</div>` };
    },
    // 列车减速、停站：视频跟着放慢、停下；之前的光带层同样处理
    flag(root, name, on) {
      if (SCENES_METRO_OLD) SCENES_METRO_OLD(root, name, on);
      const v = root.querySelector('video.vid'); if (!v || !on) return;
      if (name === 'slow') { const t0 = performance.now(); const step = () => { const p = Math.min(1, (performance.now() - t0) / 2600); try { v.playbackRate = 1 - .55 * p; } catch (e) {} if (p < 1) requestAnimationFrame(step); }; step(); }
      if (name === 'stop') setTimeout(() => { try { v.pause(); } catch (e) {} }, 1600);
    }
  };

  /* ---------------- 远方三：音乐会 ---------------- */
  SCENES.concert = {
    build() {
      const ticket = `<div class="ticket" data-hit="ticket"><div class="tk-head">电子门票</div><div class="tk-name">城市之夜 · 室内乐音乐会</div><div class="tk-row"><span>周六 19:30</span><span>二楼 · 后排 27 座</span></div><div class="qr">${Array.from({ length: 49 }, (_, i) => `<i class="${(i * 7 + (i >> 2)) % 3 ? '' : 'b'}${[0, 1, 7, 8, 5, 6, 12, 13, 35, 36, 42, 43].includes(i) ? ' b' : ''}"></i>`).join('')}</div><div class="tk-stamp">已检票 ✓</div></div>`;
      const hall = frame('c3_hall', layer('c3_hall_dark', 'hall-dark') + vid('v_concert', 'loop', 'play') + '<div class="house-dim"></div><div class="stage-glow"></div>' + hit('stage', 30, 38, 40, 20));
      return { cam: shot('ticket', frame('c3_lobby', vid('v_lobby', 'loop', 'mount'))) + shot('hall', hall, U.fall('glow', 10, { t0: 16, t1: 24, s0: 2, s1: 3, cls: 'dust' })) + shot('street', frame('c3_street')), fp: `<div class="fp-phone">${FIG.phoneHand(ticket)}</div>` };
    }
  };

  /* ---------------- 远方四：美术馆（横幅长图，左右滑动）+ 咖啡馆 ---------------- */
  SCENES.gallery = {
    build() {
      const gal = frame('c4_gallery', hit('painting', 74, 8, 20, 30), { cls: 'pan', ar: 1637 / 961 });
      const cafe = frame('c4_cafe', `<div class="cup-g" data-hit="cup" style="left:33%;top:62%;width:34%">${layer('c4_cup', '', 'position:static;width:100%')}</div>` + steam(41, 52, 18));
      return { cam: shot('gallery', gal) + shot('cafe', cafe) };
    },
    enter(root) { root.style.setProperty('--pan', 0); }
  };

  /* ---------------- 远方五：夜宵 ---------------- */
  SCENES.friends = {
    build() {
      const table = frame('c5_table', vid('v_cheers', 'once', 'cheers') + hit('cups', 24, 34, 52, 16) + '<div class="spark-ring"></div><div class="ask-bubble">下周有空吗？我们再约！</div><div class="laugh-light"></div>');
      return { cam: shot('table', table) + shot('night', frame('c5_walk')) };
    }
  };

  /* ---------------- 结局与终章 ---------------- */
  SCENES.endHome = { build() { return { cam: U.shot('e', frame('end_home', vid('v_end_home', 'once', 'mount')), U.fall('osm', 14, { t0: 10, t1: 15, s0: 4, s1: 7, to: 60 })) }; } };
  SCENES.endFar = { build() { return { cam: U.shot('e', frame('end_far', vid('v_end_far', 'once', 'mount', null, 3.2)), U.fall('glow', 12, { t0: 14, t1: 22, s0: 2, s1: 4, to: 60 })) }; } };
  SCENES.finale = { build() { return { cam: U.shot('f', frame('finale'), U.fall('glow', 18, { t0: 16, t1: 24, s0: 2, s1: 4 })) }; } };

  /* ---------------- 视频控制 ----------------
     视频真正开始播放后才淡入盖住插画；手机拒绝播放或加载失败时，插画照常显示，剧情不受影响 */
  function startVid(v) {
    if (v.dataset.started) return;
    v.dataset.started = '1';
    const show = () => v.classList.add('playing');
    v.addEventListener('playing', show, { once: true });
    // 结局等镜头：推到指定时间点就停住，避免主角被下方文字面板挡住
    if (v.dataset.hold) v.addEventListener('timeupdate', () => { if (v.currentTime >= +v.dataset.hold) { v.pause(); v.dataset.held = '1'; } });
    v.addEventListener('error', () => v.classList.remove('playing'));
    try { v.currentTime = 0; } catch (e) {}
    const p = v.play(); if (p && p.catch) p.catch(() => {});
  }
  function vids(root, name, on) {
    root.querySelectorAll('video.vid').forEach(v => {
      if (on && v.dataset.on === name) startVid(v);
      if (on && v.dataset.off === name) v.classList.add('gone');
    });
  }
  Object.keys(SCENES).forEach(k => {
    const sc = SCENES[k], f0 = sc.flag, e0 = sc.enter, l0 = sc.leave;
    sc.flag = (root, name, on) => { vids(root, name, on); if (f0) f0(root, name, on); };
    sc.enter = root => { root.querySelectorAll('video.vid[data-on="mount"]').forEach(startVid); if (e0) e0(root); };
    sc.leave = root => { root.querySelectorAll('video.vid').forEach(v => { try { v.pause(); } catch (e) {} }); if (l0) l0(root); };
  });
  // 切到后台时暂停，回来继续
  document.addEventListener('visibilitychange', () => {
    document.querySelectorAll('.act:not(.leaving) video.vid.playing').forEach(v => {
      if (document.hidden) v.pause(); else if (!v.dataset.held && (v.dataset.mode === 'loop' || !v.ended)) v.play().catch(() => {});
    });
  });

  /* 海报和地铁倒影使用插画版主角 */
  const hero = new Image(); hero.src = A + 'heroine.webp';
  window.POSTER_ART = { home: A + 'end_home.webp', far: A + 'end_far.webp' };
})();
