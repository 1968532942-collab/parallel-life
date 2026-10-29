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

  function make(src) {
    const el = new Audio();
    el.preload = 'auto'; el.setAttribute('playsinline', ''); el.src = src;
    const t = { src, el, g: null, vol: 0, timer: 0, looping: false };
    if (useGraph()) {
      try { const node = ctx.createMediaElementSource(el); t.g = ctx.createGain(); t.g.gain.value = 0; node.connect(t.g); t.g.connect(ctx.destination); } catch (e) { t.g = null; }
    }
    if (!t.g) el.volume = 0;
    el.addEventListener('error', () => { broken[src] = true; if (cur === t) { cur = null; sync(); } });
    el.addEventListener('ended', () => { if (cur === t && on) start(src); });
    return t;
  }
  function fade(t, to, dur) {
    if (t.g) {
      const g = t.g.gain, now = ctx.currentTime;
      g.cancelScheduledValues(now); g.setValueAtTime(g.value, now); g.linearRampToValueAtTime(to, now + dur);
      return;
    }
    clearInterval(t.timer);
    const from = t.el.volume, t0 = performance.now();
    t.timer = setInterval(() => {
      const p = Math.min(1, (performance.now() - t0) / (dur * 1000));
      t.el.volume = Math.max(0, Math.min(1, from + (to - from) * p));
      if (p >= 1) clearInterval(t.timer);
    }, 50);
  }
  function retire(t) {
    fade(t, 0, FADE);
    setTimeout(() => { try { t.el.pause(); t.el.removeAttribute('src'); t.el.load(); if (t.g) t.g.disconnect(); } catch (e) {} }, FADE * 1000 + 300);
  }
  function start(src) {
    const t = make(src);
    const p = t.el.play(); if (p && p.catch) p.catch(() => {});
    fade(t, VOL, FADE);
    if (cur) retire(cur);
    cur = t;
  }
  function sync() {
    if (!unlocked) return;
    const src = on ? srcFor(want) : null;
    // 有配乐文件：停掉合成背景乐；没有：交给合成背景乐
    if (window.AUDIO) AUDIO.theme(src || !on ? null : SYNTH(want || 'prologue'));
    if (!src) { if (cur) { retire(cur); cur = null; } return; }
    if (cur && cur.src === src) { if (cur.el.paused && !document.hidden) cur.el.play().catch(() => {}); return; }
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
    if (document.hidden) cur.el.pause();
    else if (on) cur.el.play().catch(() => {});
  });

  window.MUSIC = {
    unlock() {
      if (!ctx) { try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { ctx = null; } }
      if (ctx && ctx.state === 'suspended') ctx.resume();
      unlocked = true; sync();
    },
    play(key) { want = key; sync(); },
    setOn(v) { on = v; sync(); },
    state: () => ({ on, want, src: cur && cur.src, unlocked })
  };
})();
