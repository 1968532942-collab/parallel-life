/* =========================================================
   music.js — 背景音乐播放器（用户提供的钢琴配乐）
   - 每幕一首，切换时约 2 秒交叉淡入淡出
   - 默认音量 20%，给环境音效留出空间
   - 循环：每首快结束时与自身的开头交叉淡化，不会突然停止
   - 全局开关：关闭后切换场景也不会自动播放
   - 手机自动播放限制：用户点击“打开那封信”后才开始（unlock）
   - 某首加载失败时，自动退回程序合成的背景乐，不会无声
   ========================================================= */
(function () {
  'use strict';
  const VOL = 0.2, FADE = 2;
  // 场景 → 文件（js/music-map.js 里填写）
  const FILES = window.MUSIC_FILES || {};
  // 指定复用：远方最后一幕、两个结局、终章
  const ALIAS = { c6: 'c1', endFar: 'c1', endHome: 'h2', finale: 'h5' };
  // 文件缺失或加载失败时，退回的合成主题
  const SYNTH = k => k === 'prologue' ? 'night' : /^h/.test(k) ? 'home' : /^c/.test(k) ? 'far' : 'end';

  let on = true, unlocked = false, want = null, cur = null, ctx = null;
  const broken = {};

  const srcFor = key => {
    if (!key) return null;
    const k = FILES[key] ? key : ALIAS[key];
    const f = k && FILES[k];
    return f && !broken[f] ? f : null;
  };
  const useGraph = () => !!ctx && /^https?:/.test(location.protocol);

  let level = 1;              // 场景内的情绪强弱（1 = 默认 20%）
  const cache = {};           // 预加载的音频元素
  const target = () => VOL * level;

  function make(src) {
    let el = cache[src];
    if (el) delete cache[src]; else { el = new Audio(); el.preload = 'auto'; el.src = src; }
    el.setAttribute('playsinline', '');
    const t = { src, el, g: null, timer: 0, looping: false, live: false };
    if (useGraph()) {
      try { const node = ctx.createMediaElementSource(el); t.g = ctx.createGain(); t.g.gain.value = 0; node.connect(t.g); t.g.connect(ctx.destination); } catch (e) { t.g = null; }
    }
    if (!t.g) el.volume = 0;
    el.addEventListener('error', () => { broken[src] = true; if (cur === t) { cur = null; sync(); } });
    el.addEventListener('ended', () => { if (cur === t && on) start(src); });
    return t;
  }
  /* 等功率曲线：淡入用正弦、淡出用余弦，两首交叠时总响度不会塌陷 */
  function fade(t, to, dur) {
    const fromV = t.g ? t.g.gain.value : t.el.volume;
    const up = to > fromV;
    const shape = p => up ? Math.sin(p * Math.PI / 2) : 1 - Math.cos(p * Math.PI / 2);
    if (t.g) {
      const g = t.g.gain, now = ctx.currentTime, n = 32, curve = new Float32Array(n);
      for (let i = 0; i < n; i++) curve[i] = Math.max(0.0001, fromV + (to - fromV) * shape(i / (n - 1)));
      g.cancelScheduledValues(now);
      try { g.setValueCurveAtTime(curve, now, dur); } catch (e) { g.setValueAtTime(fromV, now); g.linearRampToValueAtTime(to, now + dur); }
      return;
    }
    clearInterval(t.timer);
    const t0 = performance.now();
    t.timer = setInterval(() => {
      const p = Math.min(1, (performance.now() - t0) / (dur * 1000));
      t.el.volume = Math.max(0, Math.min(1, fromV + (to - fromV) * shape(p)));
      if (p >= 1) clearInterval(t.timer);
    }, 40);
  }
  function retire(t, dur) {
    fade(t, 0, dur || FADE);
    setTimeout(() => { try { t.el.pause(); t.el.removeAttribute('src'); t.el.load(); if (t.g) t.g.disconnect(); } catch (e) {} }, (dur || FADE) * 1000 + 300);
  }
  /* 新曲真正开始发声（playing 事件）后才开始交叉淡化：
     网络慢时旧曲继续放着等它，不会出现“先断掉、再突然冒出来”的空档 */
  function start(src) {
    const t = make(src), old = cur;
    cur = t;
    let begun = false;
    const go = () => {
      if (begun) return; begun = true; t.live = true;
      if (cur !== t) return;
      fade(t, target(), FADE);
      if (old) retire(old);
    };
    t.el.addEventListener('playing', go, { once: true });
    setTimeout(() => { if (!begun && old && cur === t) retire(old); }, 6000);
    const p = t.el.play(); if (p && p.catch) p.catch(() => {});
  }
  function sync() {
    if (!unlocked) return;
    const src = on ? srcFor(want) : null;
    // 有配乐文件：停掉合成背景乐；没有：交给合成背景乐
    if (window.AUDIO) AUDIO.theme(src || !on ? null : SYNTH(want || 'prologue'));
    if (!src) { if (cur) { retire(cur, 1.2); cur = null; } return; }
    if (cur && cur.src === src) {
      if (cur.el.paused && !document.hidden) cur.el.play().catch(() => {});
      if (cur.live) fade(cur, target(), 2.5);
      return;
    }
    start(src);
  }

  // 循环：快到结尾时与自身开头交叉淡化
  setInterval(() => {
    if (!cur || !on || cur.looping) return;
    const d = cur.el.duration, t = cur.el.currentTime;
    if (d && isFinite(d) && d - t < FADE + 0.3) { cur.looping = true; start(cur.src); }
  }, 300);

  document.addEventListener('visibilitychange', () => {
    if (!cur) return;
    if (document.hidden) { cur.el.pause(); return; }
    if (!on) return;
    // 回到页面时轻轻淡入，而不是从原音量直接响起
    if (cur.g) cur.g.gain.value = 0.0001; else cur.el.volume = 0;
    cur.el.play().catch(() => {}); fade(cur, target(), 1.2);
  });

  window.MUSIC = {
    unlock() {
      if (!ctx) { try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { ctx = null; } }
      if (ctx && ctx.state === 'suspended') ctx.resume();
      unlocked = true; sync();
    },
    /* 切换场景：level 回到默认，可指定这一段的情绪强弱 */
    play(key, lv) { const changed = srcFor(key) !== (cur && cur.src); want = key; if (changed || lv != null) level = lv == null ? 1 : lv; sync(); },
    /* 同一首曲子里的情绪起伏：如舞台灯亮起时音乐稍稍推高 */
    level(lv, dur) { level = lv; if (cur && cur.live && on) fade(cur, target(), dur || 2.5); },
    /* 提前缓冲下一幕的曲子，切换时更快接上 */
    preload(key) { const src = srcFor(key); if (!src || cache[src] || (cur && cur.src === src)) return; const el = new Audio(); el.preload = 'auto'; el.src = src; cache[src] = el; },
    setOn(v) { on = v; sync(); },
    state: () => ({ on, want, src: cur && cur.src, unlocked })
  };
})();
