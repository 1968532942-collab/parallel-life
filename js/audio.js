/* =========================================================
   audio.js — 全部音效与音乐均为 Web Audio 实时合成（原创，无外部音频文件、无版权素材）
   浏览器限制：需用户点击后才能发声（在“开始”按钮里 unlock）
   背景音乐：BGM 主题（night / home / far / end）由程序实时生成：铺底和弦 + 钢琴感琶音 + 混响，切换时交叉淡化
   iPhone 静音键：把音频会话切到 playback（iOS 17+ audioSession，旧版用一段无声 <audio> 激活），静音键打开时也能出声
   ========================================================= */
(function () {
  'use strict';
  const BGM_GAIN = 3.4;
  let ctx = null, master = null, on = true, music = null, noiseBuf = null, reverb = null, bgmBus = null, bgm = null, wantTheme = null, silentEl = null;

  function silentWavUrl() {
    const n = 4000, b = new ArrayBuffer(44 + n), v = new DataView(b), w = (o, t) => { for (let i = 0; i < t.length; i++) v.setUint8(o + i, t.charCodeAt(i)); };
    w(0, 'RIFF'); v.setUint32(4, 36 + n, true); w(8, 'WAVE'); w(12, 'fmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
    v.setUint32(24, 8000, true); v.setUint32(28, 8000, true); v.setUint16(32, 1, true); v.setUint16(34, 8, true); w(36, 'data'); v.setUint32(40, n, true);
    for (let i = 0; i < n; i++) v.setUint8(44 + i, 128);
    return URL.createObjectURL(new Blob([b], { type: 'audio/wav' }));
  }
  function iosPlayback() {
    try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) {}
    try {
      if (!silentEl) { silentEl = document.createElement('audio'); silentEl.setAttribute('playsinline', ''); silentEl.loop = true; silentEl.src = silentWavUrl(); silentEl.volume = 0.01; }
      const p = silentEl.play(); if (p && p.catch) p.catch(() => {});
    } catch (e) {}
  }
  function makeReverb() {
    const len = ctx.sampleRate * 3, buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) { const d = buf.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6); }
    const cv = ctx.createConvolver(); cv.buffer = buf;
    const wet = ctx.createGain(); wet.gain.value = 0.55; cv.connect(wet); wet.connect(master);
    return cv;
  }

  function unlock() {
    try {
      if (!ctx) {
        ctx = new (window.AudioContext || window.webkitAudioContext)();
        master = ctx.createGain(); master.gain.value = on ? 0.8 : 0; master.connect(ctx.destination);
        noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
        const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
        reverb = makeReverb();
        bgmBus = ctx.createGain(); bgmBus.gain.value = BGM_GAIN; bgmBus.connect(master);
        document.addEventListener('visibilitychange', () => { if (!ctx) return; if (document.hidden) ctx.suspend(); else if (on) ctx.resume(); });
      }
      iosPlayback();
      if (ctx.state === 'suspended') ctx.resume();
      if (wantTheme) theme(wantTheme);
    } catch (e) { ctx = null; }
  }
  function toggle() {
    on = !on;
    if (master) master.gain.setTargetAtTime(on ? 0.8 : 0, ctx.currentTime, 0.05);
    if (on) { iosPlayback(); if (ctx && ctx.state === 'suspended') ctx.resume(); } else if (silentEl) silentEl.pause();
    return on;
  }

  function tone(f, t0, dur, o) {
    o = o || {};
    const osc = ctx.createOscillator(), g = ctx.createGain();
    osc.type = o.type || 'sine'; osc.frequency.setValueAtTime(f, t0);
    if (o.slide) osc.frequency.exponentialRampToValueAtTime(o.slide, t0 + dur);
    const v = o.vol || 0.12, a = o.attack || 0.01;
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(v, t0 + a); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    let node = osc;
    if (o.lp) { const f2 = ctx.createBiquadFilter(); f2.type = 'lowpass'; f2.frequency.value = o.lp; osc.connect(f2); node = f2; }
    node.connect(g); g.connect(o.dest || master);
    osc.start(t0); osc.stop(t0 + dur + 0.05);
  }
  function noise(t0, dur, o) {
    o = o || {};
    const src = ctx.createBufferSource(); src.buffer = noiseBuf;
    const f = ctx.createBiquadFilter(); f.type = o.ft || 'lowpass'; f.frequency.value = o.f || 1200; f.Q.value = o.q || 0.7;
    if (o.fTo) f.frequency.exponentialRampToValueAtTime(o.fTo, t0 + dur);
    const g = ctx.createGain(); const v = o.vol || 0.08;
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(v, t0 + (o.attack || 0.02)); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(f); f.connect(g); g.connect(master); src.start(t0); src.stop(t0 + dur + 0.05);
  }
  function bellTone(f, t0, dur, vol) { [1, 2.76, 5.4].forEach((m, i) => tone(f * m, t0, dur / (i + 1), { vol: (vol || 0.08) / (i + 1.5), attack: 0.004 })); }

  const N = { C4: 261.6, D4: 293.7, E4: 329.6, F4: 349.2, G4: 392, A4: 440, B4: 493.9, C5: 523.3, D5: 587.3, E5: 659.3, Fs5: 740, G5: 784, A5: 880, Fs4: 370, A3: 220, B3: 246.9, G3: 196, D3: 146.8, E3: 164.8, Fs3: 185 };

  /* 原创短旋律：D 大调，钢琴感拨弦 + 弦乐铺底，循环播放 */
  function startMusic() {
    if (music) return;
    const bus = ctx.createGain(); bus.gain.value = 0.0001; bus.connect(master);
    bus.gain.exponentialRampToValueAtTime(1, ctx.currentTime + 1.5);
    const rev = ctx.createDelay(); rev.delayTime.value = 0.23; const fb = ctx.createGain(); fb.gain.value = 0.32;
    rev.connect(fb); fb.connect(rev); const wet = ctx.createGain(); wet.gain.value = 0.35; rev.connect(wet); wet.connect(bus);
    const chords = [[N.D3, N.Fs4, N.A4, N.D5], [N.B3, N.Fs4, N.B4, N.D5], [N.G3, N.D4, N.G4, N.B4], [N.A3, N.E4, N.A4, N.Cs5 || 554.4]];
    const melody = [[N.Fs5, N.E5, N.D5, N.A4], [N.D5, N.Fs5, N.E5, N.B4], [N.D5, N.B4, N.G4, N.B4], [N.Cs5 || 554.4, N.E5, N.A5, N.G5]];
    let bar = 0, alive = true;
    const beat = 0.62;
    const sched = () => {
      if (!alive) return;
      const t = ctx.currentTime + 0.05, c = chords[bar % 4], m = melody[bar % 4];
      c.forEach((f, i) => { tone(f, t + i * beat / 2, beat * 3.2, { type: 'triangle', vol: 0.05, attack: 0.008, dest: bus }); tone(f, t + i * beat / 2, beat * 3.2, { type: 'triangle', vol: 0.02, dest: rev }); });
      tone(c[0] / 2, t, beat * 4, { type: 'sawtooth', vol: 0.025, attack: 0.6, lp: 600, dest: bus });
      m.forEach((f, i) => { tone(f, t + i * beat, beat * 1.6, { type: 'sine', vol: 0.06, attack: 0.01, dest: bus }); tone(f, t + i * beat, beat * 1.6, { type: 'sine', vol: 0.03, dest: rev }); });
      bar++;
      music.timer = setTimeout(sched, beat * 4 * 1000);
    };
    music = { bus, timer: 0, stop: () => { alive = false; clearTimeout(music.timer); bus.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.6); setTimeout(() => bus.disconnect(), 3000); } };
    sched();
  }
  function stopMusic() { if (music) { music.stop(); music = null; } }


  /* ---------------- 背景音乐（原创、程序生成） ---------------- */
  const hz = m => 440 * Math.pow(2, (m - 69) / 12);
  // 每个主题：速度、和弦（MIDI 音高）、琶音型、铺底音色、是否有轻柔低音脉动
  const THEMES = {
    night: { bpm: 60, vol: .5, chords: [[57, 60, 64, 69], [53, 57, 60, 65], [48, 55, 60, 64], [55, 59, 62, 67]], arp: [3, null, 2, null, 1, null, 2, null], lead: [76, null, 74, null, 72, null, 71, null], leadEvery: 2, pad: .05 },
    home: { bpm: 72, vol: .55, chords: [[50, 57, 62, 66], [47, 54, 59, 62], [43, 50, 55, 59], [45, 52, 57, 61]], arp: [0, 2, 3, 2, 1, 2, 3, 2], lead: [78, 76, 74, null, 73, 74, 76, null], leadEvery: 2, pad: .045 },
    far: { bpm: 84, vol: .5, chords: [[48, 55, 60, 63], [44, 51, 56, 60], [51, 58, 63, 67], [46, 53, 58, 62]], arp: [0, 3, 2, 3, 1, 3, 2, 3], lead: [75, null, 74, 72, null, 70, 72, null], leadEvery: 2, pad: .04, pulse: true },
    end: { bpm: 58, vol: .55, chords: [[41, 53, 57, 60], [40, 52, 55, 60], [38, 50, 57, 62], [46, 53, 58, 62]], arp: [1, null, 2, 3, null, 2, null, null], lead: [77, null, 76, null, 74, null, 72, null], leadEvery: 1, pad: .055 }
  };
  function voice(f, t0, dur, vol, type, dest, att) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.value = f;
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol, t0 + (att || .012)); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(dest); o.start(t0); o.stop(t0 + dur + .05);
    return g;
  }
  function piano(f, t0, dur, vol, out) {
    const g = voice(f, t0, dur, vol, 'triangle', out);
    voice(f * 2, t0, dur * .45, vol * .25, 'sine', out);
    g.connect(reverb);
  }
  function startTheme(name, horizon) {
    const T = THEMES[name]; if (!T) return null;
    const out = ctx.createGain(); out.gain.value = 0.0001; out.connect(bgmBus);
    out.gain.exponentialRampToValueAtTime(T.vol, ctx.currentTime + 3);
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 900; lp.connect(out);
    const step = 60 / T.bpm / 2; // 八分音符
    let next = ctx.currentTime + .1, i = 0, bar = 0;
    const tick = () => {
      while (next < ctx.currentTime + (horizon || 1.2)) {
        const chord = T.chords[bar % T.chords.length], k = i % 8;
        if (k === 0) {
          chord.forEach((m, j) => { const g = voice(hz(m), next, step * 8.6, T.pad / (j ? 1.5 : 1), j ? 'sine' : 'triangle', lp, 1.2); g.connect(reverb); });
          voice(hz(chord[0] - 12), next, step * 8, T.pad * 1.2, 'sine', out, .4);
        }
        const a = T.arp[k]; if (a != null) piano(hz(chord[a] + 12), next, step * 5, .045, out);
        if (T.pulse && k % 2 === 0) voice(hz(chord[0] - 12), next, step * .9, .03, 'sine', out, .01);
        if (bar % (T.leadEvery * 2) >= T.leadEvery * 2 - T.leadEvery && T.lead[k] != null) piano(hz(T.lead[k]), next + .01, step * 6, .05, out);
        next += step; i++; if (k === 7) bar++;
      }
    };
    tick();
    if (horizon) return { name };
    const timer = setInterval(tick, 250);
    return { name, stop() { clearInterval(timer); out.gain.cancelScheduledValues(ctx.currentTime); out.gain.setTargetAtTime(0.0001, ctx.currentTime, .9); setTimeout(() => out.disconnect(), 5000); } };
  }
  function theme(name) {
    wantTheme = name;
    if (!ctx) return;
    if (music) { stopMusic(); }
    duck(false);
    if (bgm && bgm.name === name) return;
    if (bgm) bgm.stop();
    bgm = name ? startTheme(name) : null;
  }
  function duck(down) { if (bgmBus) bgmBus.gain.setTargetAtTime(down ? 0.0001 : BGM_GAIN, ctx.currentTime, down ? .6 : 1.5); }

  function sfx(name) {
    if (!ctx || !on) { if (name === 'stopmusic') { stopMusic(); duck(false); } return; }
    const t = ctx.currentTime + 0.01;
    switch (name) {
      case 'tap': tone(880, t, 0.12, { vol: 0.03 }); break;
      case 'chime': bellTone(N.A5, t, 1.6, 0.06); bellTone(N.E5, t + 0.12, 1.8, 0.05); break;
      case 'paper': noise(t, 0.6, { f: 3000, ft: 'bandpass', vol: 0.05, attack: 0.1 }); noise(t + 0.4, 0.5, { f: 2200, ft: 'bandpass', vol: 0.04 }); break;
      case 'hum': tone(330, t, 1.1, { vol: 0.03, slide: 520, attack: 0.3 }); break;
      case 'choose': tone(N.D5, t, 0.5, { vol: 0.06 }); tone(N.A5, t + 0.14, 0.9, { vol: 0.06 }); break;
      case 'bell': for (let i = 0; i < 14; i++) tone(i % 2 ? 1180 : 1320, t + i * 0.09, 0.12, { type: 'square', vol: 0.012, lp: 2400 }); break;
      case 'flash': noise(t, 1.2, { f: 400, fTo: 4000, ft: 'bandpass', vol: 0.05, attack: 0.5 }); bellTone(N.D5, t + 0.4, 2.4, 0.03); break;
      case 'door': noise(t, 0.5, { f: 500, vol: 0.06 }); tone(140, t, 0.4, { vol: 0.04, slide: 110 }); bellTone(1400, t + 0.15, 1.2, 0.04); break;
      case 'cloth': noise(t, 0.45, { f: 1800, ft: 'bandpass', vol: 0.035, attack: 0.12 }); break;
      case 'click': tone(1800, t, 0.04, { type: 'square', vol: 0.03, lp: 3000 }); tone(900, t + 0.05, 0.05, { vol: 0.03 }); break;
      case 'send': tone(600, t, 0.18, { vol: 0.05, slide: 1200 }); break;
      case 'msg': tone(N.E5, t, 0.25, { vol: 0.05 }); tone(N.A5, t + 0.16, 0.4, { vol: 0.05 }); break;
      case 'arrive': [N.E5, N.C5 || 523, N.G4].forEach((f, i) => tone(f, t + i * 0.32, 0.5, { vol: 0.05 })); break;
      case 'doors': tone(N.G5, t, 0.3, { vol: 0.04 }); tone(N.E5, t + 0.3, 0.4, { vol: 0.04 }); noise(t + 0.5, 1.2, { f: 700, vol: 0.05, attack: 0.3 }); break;
      case 'roll': noise(t, 0.7, { f: 260, vol: 0.06, attack: 0.08 }); break;
      case 'music': duck(true); startMusic(); break;
      case 'stopmusic': stopMusic(); duck(false); break;
      case 'wind': noise(t, 2.6, { f: 300, fTo: 900, ft: 'bandpass', q: 0.6, vol: 0.06, attack: 1 }); break;
      case 'cup': bellTone(2100, t, 0.5, 0.04); break;
      case 'clink': bellTone(2600, t, 0.8, 0.05); bellTone(3100, t + 0.06, 0.8, 0.04); bellTone(2350, t + 0.11, 0.8, 0.04); break;
      case 'step': noise(t, 0.18, { f: 500, vol: 0.03 }); break;
      case 'ending': [N.D4, N.Fs4, N.A4, N.D5].forEach((f, i) => tone(f, t + i * 0.18, 3, { type: 'triangle', vol: 0.04, attack: 0.05 })); break;
    }
  }
  /* 开发用：离线渲染一段主题为 WAV（用于试听与检查音量），不影响正常播放 */
  async function renderTheme(name, secs) {
    const keep = [ctx, master, reverb, bgmBus];
    ctx = new OfflineAudioContext(2, 44100 * secs, 44100);
    master = ctx.createGain(); master.gain.value = .8; master.connect(ctx.destination);
    reverb = makeReverb(); bgmBus = ctx.createGain(); bgmBus.gain.value = BGM_GAIN; bgmBus.connect(master);
    startTheme(name, secs);
    const buf = await ctx.startRendering();
    [ctx, master, reverb, bgmBus] = keep;
    return buf;
  }
  window.AUDIO = { unlock, toggle, sfx, theme, isOn: () => on, renderTheme };
})();
