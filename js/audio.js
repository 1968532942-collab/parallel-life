/* =========================================================
   audio.js — 全部音效与音乐均为 Web Audio 实时合成（原创，无外部音频文件、无版权素材）
   浏览器限制：需用户点击后才能发声（在“开始”按钮里 unlock）
   ========================================================= */
(function () {
  'use strict';
  let ctx = null, master = null, on = true, music = null, noiseBuf = null;

  function unlock() {
    try {
      if (!ctx) {
        ctx = new (window.AudioContext || window.webkitAudioContext)();
        master = ctx.createGain(); master.gain.value = on ? 0.8 : 0; master.connect(ctx.destination);
        noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
        const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      }
      if (ctx.state === 'suspended') ctx.resume();
    } catch (e) { ctx = null; }
  }
  function toggle() { on = !on; if (master) master.gain.setTargetAtTime(on ? 0.8 : 0, ctx.currentTime, 0.05); return on; }

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

  function sfx(name) {
    if (!ctx || !on) { if (name === 'stopmusic') stopMusic(); return; }
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
      case 'music': startMusic(); break;
      case 'stopmusic': stopMusic(); break;
      case 'wind': noise(t, 2.6, { f: 300, fTo: 900, ft: 'bandpass', q: 0.6, vol: 0.06, attack: 1 }); break;
      case 'cup': bellTone(2100, t, 0.5, 0.04); break;
      case 'clink': bellTone(2600, t, 0.8, 0.05); bellTone(3100, t + 0.06, 0.8, 0.04); bellTone(2350, t + 0.11, 0.8, 0.04); break;
      case 'step': noise(t, 0.18, { f: 500, vol: 0.03 }); break;
      case 'ending': [N.D4, N.Fs4, N.A4, N.D5].forEach((f, i) => tone(f, t + i * 0.18, 3, { type: 'triangle', vol: 0.04, attack: 0.05 })); break;
    }
  }
  window.AUDIO = { unlock, toggle, sfx, isOn: () => on };
})();
