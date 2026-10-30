/* =========================================================
   scenes-far.js — 远方线六幕 + 逐光者结局
   色彩：深海蓝、城市灰蓝、暖橙灯光、音乐厅香槟金、美术馆米白、出租屋柔和暖黄
   ========================================================= */
(function () {
  'use strict';
  const U = window.SCN, F = window.FIG, H = F.HERO;
  const person = (o, i) => F.fig(Object.assign({ hs: ['short', 'bob', 'long', 'pony', 'short'][i % 5], hair: ['#2a2a30', '#3a2f2c', '#1f2430', '#4a3a30', '#2c2c2c'][i % 5], coat: ['#4a5a74', '#7a5a52', '#5f6f5a', '#8a7a6a', '#3d4a5f', '#6a5470'][i % 6] }, o));
  const skyline = (w, base, seed, col, win) => {
    let s = '', x = 0, k = seed;
    while (x < w) { const bw = 24 + (k * 37) % 40, bh = 90 + (k * 53) % 170; s += `<rect x="${x}" y="${base - bh}" width="${bw}" height="${bh + 40}" fill="${col}"/>`; if (win) for (let j = 0; j < bh / 14; j++) for (let q = 0; q < bw / 9 - 1; q++) if ((j * 7 + q * 3 + k) % 9 < 2) s += `<rect x="${x + 4 + q * 9}" y="${base - bh + 8 + j * 14}" width="4" height="6" fill="${win}" opacity="${.5 + ((j + q + k) % 4) * .12}"/>`; x += bw + 2; k++; }
    return s;
  };

  /* =========================================================
     出租屋（第一幕 / 第六幕共用同一套房型，保证门窗家具位置一致）
     ========================================================= */
  function roomArt(lived) {
    const planks = Array.from({ length: 9 }, (_, i) => `<path d="M${70 + i * 32.5} 470L${-60 + i * 65} 780" stroke="#8a6a4f" stroke-width="1.2" opacity=".5"/>`).join('');
    return U.svg(`<defs>${U.lg('rmSkyD', [[0, '#9db4cc'], [.55, '#efc39a'], [1, '#f6d6ae']])}${U.lg('rmSkyN', [[0, '#0f1a30'], [1, '#2b3555']])}${U.rg('rmLamp', [[0, '#ffe2a6', .85], [1, '#ffd08a', 0]])}${U.rg('rmCeil', [[0, '#fff0cc', .7], [1, '#ffe6b0', 0]])}${U.lg('rmWall', [[0, '#e3d6c2'], [1, '#d2c2aa']])}
        <clipPath id="rmWin${lived ? 'L' : 'F'}"><rect x="152" y="202" width="96" height="126"/></clipPath></defs>
      <!-- 墙与地面 -->
      <path d="M0 0H400V90L330 170H70L0 90Z" fill="#cfc3b0"/>
      <path d="M70 170H330V470H70Z" fill="url(#rmWall)"/>
      <path d="M0 90L70 170V470L0 560Z" fill="#c8b9a2"/><path d="M400 90L330 170V470L400 560Z" fill="#c2b29a"/>
      <path d="M70 470H330L400 560V780H0V560Z" fill="#b48c68"/>${planks}
      <path d="M70 470H330" stroke="#a58466" stroke-width="3"/>
      <!-- 窗 -->
      <g clip-path="url(#rmWin${lived ? 'L' : 'F'})">
        <rect x="150" y="200" width="100" height="130" fill="url(#rmSkyD)" class="sky-day"/>
        <rect x="150" y="200" width="100" height="130" fill="url(#rmSkyN)" class="sky-night"/>
        <g class="win-city">${[[150, 290, 18], [170, 262, 16], [188, 300, 14], [204, 250, 20], [226, 282, 14], [242, 270, 12]].map(([x, y, w]) => `<rect x="${x}" y="${y}" width="${w}" height="${340 - y}" fill="#3a4766"/>`).join('')}</g>
        <g class="win-lights">${Array.from({ length: 26 }, (_, i) => `<rect x="${154 + (i * 13) % 92}" y="${266 + (i * 17) % 66}" width="3" height="4" fill="#ffd79a" style="transition-delay:${(i % 9) * .35}s"/>`).join('')}</g>
      </g>
      <rect x="146" y="196" width="108" height="138" fill="none" stroke="#f1e8da" stroke-width="8"/><path d="M200 200V330M150 266H250" stroke="#f1e8da" stroke-width="4"/>
      <rect x="140" y="332" width="120" height="8" fill="#efe5d6"/>
      <!-- 天花板灯 -->
      <path d="M200 0V96" stroke="#7a6a5a" stroke-width="2"/><path d="M182 96h36l-6 14h-24z" fill="#efe2cc"/>
      <circle class="ceil-glow" cx="200" cy="140" r="260" fill="url(#rmCeil)"/>
      <!-- 冰箱（后墙左） -->
      <rect x="76" y="340" width="52" height="130" rx="4" fill="#e9e7e2"/><path d="M76 386H128" stroke="#c9c6bf" stroke-width="2"/><rect x="120" y="350" width="3" height="26" fill="#b9b6ae"/><rect x="120" y="394" width="3" height="40" fill="#b9b6ae"/>
      <g class="lived">${['#e2a35a', '#7aa0b8', '#d9787a'].map((c, i) => `<circle cx="${86 + i * 12}" cy="${356 + i * 5}" r="4" fill="${c}"/>`).join('')}<rect x="86" y="400" width="22" height="16" fill="#f6f1e6" stroke="#bbb"/></g>
      <!-- 书桌 + 台灯 -->
      <rect x="148" y="384" width="124" height="10" fill="#9a7457"/><path d="M154 394V468M266 394V468" stroke="#7d5c44" stroke-width="5"/>
      <rect x="168" y="420" width="44" height="40" fill="#8b6b52" opacity=".9"/><path d="M174 420V470M206 420V470" stroke="#6d5240" stroke-width="3"/>
      <g data-hit="lamp"><path d="M252 384V346" stroke="#4a4a4a" stroke-width="3"/><path d="M252 346L238 330" stroke="#4a4a4a" stroke-width="3"/><path d="M226 320h28l-6 14h-16z" fill="#e3c98f" transform="rotate(-20 240 327)"/><ellipse cx="252" cy="384" rx="10" ry="3" fill="#4a4a4a"/></g>
      <circle class="lamp-glow" cx="236" cy="350" r="110" fill="url(#rmLamp)"/>
      <g class="desk-items"><rect x="160" y="366" width="16" height="18" fill="#f3ead8" stroke="#8a6a4a"/><rect x="180" y="372" width="20" height="12" fill="#6f8fa8"/><rect x="182" y="366" width="18" height="6" fill="#c98f6a"/><path d="M212 384v-14h8v14" fill="#efe6d6"/></g>
      <g class="fruit"><ellipse cx="226" cy="382" rx="16" ry="5" fill="#d9cbb3"/><circle cx="220" cy="376" r="6" fill="#e2884e"/><circle cx="231" cy="375" r="6" fill="#c9443e"/><circle cx="226" cy="370" r="5" fill="#9fb35a"/></g>
      <rect data-hit="desk" x="150" y="356" width="120" height="34" fill="transparent"/>
      <!-- 开关（左墙） -->
      <rect data-hit="switch" x="34" y="290" width="14" height="22" rx="2" fill="#f2ede4" stroke="#b9ae9c" transform="skewY(20)"/>
      <!-- 衣架（左） -->
      <path d="M22 270L22 470M86 290L86 470M22 276L86 296" stroke="#5a4a3a" stroke-width="3" fill="none"/>
      <g class="clothes">
        <path d="M30 282l10 4v80l-14 -4z" fill="${H.coat}"/><path d="M33 284l4 2" stroke="${H.scarf}" stroke-width="6"/><path d="M36 290q6 30 2 60" stroke="${H.scarf}" stroke-width="5" fill="none"/>
        <path d="M46 286l12 4v62l-14 -4z" fill="#d7c9b6"/><path d="M62 290l12 4v70l-14 -4z" fill="${H.dress}"/><path d="M76 294l8 2v48l-10 -3z" fill="#9b6a5a"/>
      </g>
      <!-- 床（右） -->
      <g data-hit="bed">
        <path d="M262 380h68v86h-68z" fill="#8f7058"/>
        <path d="M250 440L330 428L400 486V600L300 600L250 520Z" fill="#efe8dc"/>
        <path d="M250 520L300 600H400V620H296L250 540Z" fill="#cfc4b4"/>
        <g class="bed-messy"><path d="M256 452Q300 430 340 446Q372 470 396 492L392 590Q340 560 300 584Q270 540 262 500Z" fill="#a9b8c6"/><path d="M270 470q30 20 60 6t50 30M282 520q40 -10 70 20" stroke="#8798a8" stroke-width="3" fill="none"/><ellipse cx="292" cy="438" rx="22" ry="9" fill="#f5f1ea" transform="rotate(-18 292 438)"/></g>
        <g class="bed-made"><path d="M254 470L332 458L400 520V600H300L254 530Z" fill="#9fb2c4"/><path d="M254 470L332 458L340 466L262 480Z" fill="#f4efe6"/><ellipse cx="290" cy="446" rx="24" ry="8" fill="#f8f4ee"/><ellipse cx="316" cy="442" rx="20" ry="7" fill="#f2ede4"/></g>
      </g>
      <!-- 小沙发（左前） -->
      <path d="M0 560Q60 540 140 556L146 640H0Z" fill="#8a7d6a"/><path d="M0 590Q70 576 150 590V650H0Z" fill="#9c8f7a"/><rect x="132" y="560" width="22" height="90" rx="8" fill="#7e715e"/>
      <g class="lived"><ellipse cx="60" cy="580" rx="26" ry="14" fill="#e3b68a"/><ellipse cx="104" cy="584" rx="20" ry="12" fill="#c7d3c4"/></g>
      <!-- 生活痕迹（第六幕） -->
      <g class="lived">
        <path d="M156 332q4 -24 -4 -40q14 14 10 40ZM166 332q8 -30 2 -50q16 22 4 50ZM176 332q4 -18 14 -30q-2 18 -8 30Z" fill="#6d8f62"/><rect x="152" y="326" width="28" height="10" fill="#c98f6a"/>
        <path d="M232 332q-4 -18 6 -32q4 18 0 32Z" fill="#7a9a6a"/><rect x="228" y="326" width="16" height="10" fill="#e8dccb"/>
        <path d="M274 230Q300 246 326 232" stroke="#6a5a4a" stroke-width="1" fill="none"/>${[[280, 236], [296, 242], [312, 240]].map(([x, y], i) => `<rect x="${x - 6}" y="${y}" width="13" height="16" fill="#f6f2ea" transform="rotate(${(i - 1) * 6} ${x} ${y})"/><rect x="${x - 4}" y="${y + 2}" width="9" height="9" fill="${['#e2a35a', '#7aa0b8', '#c98f9a'][i]}" transform="rotate(${(i - 1) * 6} ${x} ${y})"/>`).join('')}
        ${Array.from({ length: 9 }, (_, i) => `<circle class="twinkle" style="--d:-${i * .4}s" cx="${268 + i * 8}" cy="${226 + Math.sin(i) * 4 + i * .8}" r="1.6" fill="#ffd98a"/>`).join('')}
        <rect x="236" y="364" width="14" height="18" fill="#f6f2ea" stroke="#8a6a4a"/><rect x="238" y="366" width="10" height="10" fill="#d99a72"/>
        <path d="M20 700q6 -60 -14 -100q34 34 30 100Z M36 700q12 -50 4 -86q24 40 8 86Z M8 700q-4 -40 -20 -60q26 20 28 60Z" fill="#5f8a5a"/><path d="M4 690h44l-6 40h-32z" fill="#c4865e"/>
        <ellipse cx="200" cy="640" rx="130" ry="34" fill="#c9a98a" opacity=".55"/>
      </g>
      <!-- 行李箱：拖动目标区（地板中央） -->
      <rect data-hit="dropzone" x="160" y="490" width="96" height="70" fill="transparent"/>
      <g class="case-open" data-hit="suitcase-open">
        <path d="M150 548L250 548L262 584L138 584Z" fill="#33465f"/><path d="M150 548L250 548L246 520L154 520Z" fill="#41587a"/>
        <g class="case-clothes"><path d="M156 556h40v10h-40z" fill="#d7c9b6"/><path d="M200 556h44v12h-44z" fill="${H.dress}"/><path d="M160 568h80v8h-80z" fill="#9b6a5a"/><path d="M170 552q20 -6 40 0" stroke="${H.scarf}" stroke-width="5" fill="none"/></g>
      </g>
      <rect class="room-dark" x="-10" y="-10" width="420" height="800" fill="#0b1426"/>
      <rect class="room-warm" x="-10" y="-10" width="420" height="800" fill="#ffb066"/>
      <circle class="lamp-glow2" cx="236" cy="360" r="170" fill="url(#rmLamp)"/>`);
  }
  function suitcaseUpright() {
    return `<svg class="art case-layer" viewBox="0 0 400 780" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><g data-hit="suitcase"><g transform="translate(70 600)">
      <ellipse cx="0" cy="4" rx="46" ry="8" fill="#0003"/><path d="M-12 -150V-118M12 -150V-118M-14 -152H14" stroke="#2c3442" stroke-width="5" stroke-linecap="round" fill="none"/>
      <rect x="-40" y="-118" width="80" height="114" rx="10" fill="#41587a"/><path d="M-26 -118V-4M0 -118V-4M26 -118V-4" stroke="#33465f" stroke-width="2"/><rect x="-40" y="-118" width="80" height="16" rx="8" fill="#4d6890"/>
      <circle cx="-26" cy="0" r="6" fill="#222"/><circle cx="26" cy="0" r="6" fill="#222"/><rect x="18" y="-96" width="14" height="10" fill="${H.scarf}" opacity=".8"/></g></g></svg>`;
  }
  function corridorArt() {
    return U.svg(`<defs>${U.lg('cor', [[0, '#2b3044'], [1, '#4a4a58']])}${U.rg('corL', [[0, '#ffe6b8', .6], [1, '#ffe6b8', 0]])}</defs>
      <rect width="400" height="780" fill="url(#cor)"/>
      <path d="M0 0H400L300 180H100Z" fill="#3a3e52"/><path d="M0 0L100 180V560L0 700Z" fill="#363a4c"/><path d="M400 0L300 180V560L400 700Z" fill="#30344a"/>
      <path d="M100 560H300L400 700V780H0V700Z" fill="#5a5560"/>
      <rect x="180" y="40" width="40" height="8" fill="#fff4d8"/><circle cx="200" cy="80" r="140" fill="url(#corL)"/>
      <rect x="130" y="230" width="140" height="330" fill="#6b4f3e"/>
      <g class="door-panel"><rect x="138" y="238" width="124" height="322" fill="#7d5c47"/><rect x="154" y="260" width="92" height="120" fill="none" stroke="#6a4c3a" stroke-width="3"/><rect x="154" y="400" width="92" height="140" fill="none" stroke="#6a4c3a" stroke-width="3"/><circle cx="244" cy="400" r="6" fill="#d9b46f"/><text x="200" y="300" text-anchor="middle" font-size="16" fill="#e9d2a8" font-family="Georgia,serif">602</text></g>
      <rect class="door-inside" x="138" y="238" width="124" height="322" fill="#1a2234"/>
      <rect data-hit="door" x="138" y="238" width="124" height="322" fill="transparent"/>
      <g transform="translate(300 600)"><path d="M-20 0L-26 -70H26L20 0Z" fill="#e8dcc6"/><path d="M-14 -70q0 -26 14 -26t14 26" stroke="#c9b48e" stroke-width="3" fill="none"/><circle cx="-8" cy="-78" r="9" fill="#e2884e"/><path d="M6 -86q8 -20 2 -30" stroke="#6f8f52" stroke-width="5"/></g>
      <rect x="70" y="560" width="54" height="40" fill="#b7946c"/><path d="M70 572h54" stroke="#9b7a56" stroke-width="3"/>`);
  }

  SCENES.room = {
    build(init) {
      const lived = init.indexOf('lived') >= 0;
      const chat = `<div class="chat"><div class="chat-top">妈</div>
        <div class="bub in">到了吗？房间怎么样</div>
        <div class="bub me sent-b">我收拾好了，房间还不错。</div>
        <div class="chat-input"><span class="typed">我收拾好了，房间还不错。</span><button class="send" data-hit="send" aria-label="发送">发送</button></div></div>`;
      const album = `<div class="album"><div class="chat-top">相册 · 一年前</div><div class="thumbs"><div class="th"></div><div class="th"></div><div class="th big" data-hit="photo">${roomThumb()}</div><div class="th"></div><div class="th"></div><div class="th"></div></div></div>`;
      const room = U.shot('room', roomArt(lived), lived ? '' : suitcaseUpright());
      const cor = lived ? U.shot('corridor', corridorArt()) : '';
      return { cam: (lived ? cor + room : room) + '<div class="past-tint"></div>', fp: `<div class="fp-phone">${F.phoneHand(lived ? album : chat)}</div>` };
    }
  };
  function roomThumb() { return `<svg viewBox="0 0 80 100" preserveAspectRatio="xMidYMid slice"><rect width="80" height="100" fill="#d9ccb6"/><rect x="14" y="20" width="52" height="40" fill="#cdbfa8"/><rect x="30" y="26" width="20" height="20" fill="#f0c49a"/><path d="M0 60H80V100H0Z" fill="#b48c68"/><rect x="26" y="66" width="28" height="12" fill="#41587a"/><path d="M50 56L70 52L80 64V80H60Z" fill="#a9b8c6"/></svg>`; }

  /* =========================================================
     第二幕 末班地铁（窗外景物向左移动 = 列车向右行驶，方向始终一致）
     ========================================================= */
  SCENES.metro = {
    build() {
      const out = `<svg class="art metro-out" viewBox="0 0 400 780" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="400" height="780" fill="#0d1628"/>
        <g class="mv far">${skyline(800, 360, 5, '#1f2c48', '#ffcf8f')}${skyline(800, 360, 5, '#1f2c48', '#ffcf8f').replace(/x="(\d+)"/g, (m, x) => `x="${800 + +x}"`)}</g>
        <g class="mv near">${Array.from({ length: 16 }, (_, i) => `<rect x="${i * 100}" y="170" width="10" height="220" fill="#0a0f1a"/><circle cx="${i * 100 + 50}" cy="250" r="4" fill="#ffd9a0" opacity=".8"/><rect x="${i * 100 + 20}" y="248" width="60" height="3" fill="#ffd9a066"/>`).join('')}</g></svg>`;
      const car = U.svg(`<defs>${U.lg('mCar', [[0, '#c9ccd2'], [1, '#9aa0aa']])}${U.lg('mFloor', [[0, '#6a6e78'], [1, '#3a3e48']])}
          <clipPath id="mWin"><rect x="24" y="176" width="210" height="196" rx="16"/></clipPath></defs>
        <path fill-rule="evenodd" fill="url(#mCar)" d="M0 0H400V780H0Z M24 192Q24 176 40 176H218Q234 176 234 192V356Q234 372 218 372H40Q24 372 24 356Z M262 200H300V350H262Z M330 200H368V350H330Z"/>
        <path d="M0 0H400V120H0Z" fill="#e3e5e8"/><rect x="40" y="70" width="320" height="10" rx="5" fill="#fffef6"/><rect x="40" y="70" width="320" height="10" rx="5" fill="#fffef6" opacity=".5" transform="translate(0 4)"/>
        <path d="M20 140H380" stroke="#8d939c" stroke-width="4"/>${[60, 120, 180].map(x => `<path d="M${x} 140v24" stroke="#8d939c" stroke-width="2"/><ellipse cx="${x}" cy="170" rx="8" ry="5" fill="none" stroke="#7d838c" stroke-width="3"/>`).join('')}
        <rect class="platform" x="250" y="160" width="130" height="420" fill="#e8d2a8"/><g class="mdoor-l"><rect x="250" y="160" width="62" height="420" fill="#b4b9c2"/><rect x="262" y="200" width="38" height="150" rx="6" fill="#152035"/></g>
        <g class="mdoor-r"><rect x="318" y="160" width="62" height="420" fill="#aeb3bc"/><rect x="330" y="200" width="38" height="150" rx="6" fill="#152035"/></g>
        <path d="M244 156H386V584H244Z" fill="none" stroke="#7d838c" stroke-width="6"/>
        <g clip-path="url(#mWin)"><image class="reflection" href="${window.HEROINE_SRC}" x="46" y="192" width="150" height="314" preserveAspectRatio="xMidYMin meet"/></g>
        <rect data-hit="window" x="30" y="182" width="198" height="184" fill="transparent"/>
        <rect x="16" y="372" width="226" height="10" fill="#7d838c"/>
        <path d="M0 420H240V512H0Z" fill="#5a6e8c"/><path d="M0 500H240V514H0Z" fill="#6f84a3"/><path d="M0 514H240V556H0Z" fill="#3c4a62"/>
        ${person({ x: 66, y: 556, s: .74, view: 'front', sit: true, nod: true }, 1)}${person({ x: 176, y: 556, s: .76, view: 'front', sit: true, hs: 'short', glasses: true }, 4)}
        <path d="M0 560H400V780H0Z" fill="url(#mFloor)"/>
        <rect x="240" y="120" width="8" height="660" fill="#c7ccd4"/><rect x="241" y="120" width="2" height="660" fill="#fff" opacity=".6"/>
        <g class="leavers"><g class="leaver" style="--lx:-12px;--ly:-104px">${person({ x: 330, y: 700, s: 1.2, view: 'back', walk: true }, 2)}</g><g class="leaver" style="--lx:-44px;--ly:-118px;--ld:.6s">${person({ x: 378, y: 720, s: 1.24, view: 'back', walk: true, delay: -.5 }, 3)}</g></g>
        <g class="arrive-sign"><rect x="60" y="96" width="120" height="22" rx="4" fill="#1a2234"/><text x="120" y="112" text-anchor="middle" font-size="11" fill="#ffd79a" font-family="sans-serif" letter-spacing="2">下一站 · 江湾路</text></g>`);
      const screen = `<div class="chat"><div class="chat-top">妈</div><div class="bub in msg-b">今天忙不忙？记得好好吃饭。</div><div class="bub me reply-b">挺好的，不用担心。</div>
        <div class="chat-input"><span class="typed">挺好的，不用担心。</span><button class="send" data-hit="reply" aria-label="回复">回复</button></div><div class="lock">23:41<small>妈：今天忙不忙？…</small></div></div>`;
      return { cam: U.shot('m', out + car), fp: `<div class="fp-phone peek" data-hit="myphone">${F.phoneHand(screen)}</div>` };
    },
    flag(root, name) {
      const anims = () => [...root.querySelectorAll('.mv')].flatMap(el => el.getAnimations ? el.getAnimations() : []);
      const ramp = (to, ms) => { const list = anims(); const from = list.length ? list[0].playbackRate : 1; const t0 = performance.now(); const step = () => { const p = Math.min(1, (performance.now() - t0) / ms); const r = from + (to - from) * (1 - Math.pow(1 - p, 2)); list.forEach(a => { a.playbackRate = Math.max(0.0001, r); if (to === 0 && p === 1) a.pause(); }); if (p < 1) requestAnimationFrame(step); }; step(); };
      if (name === 'slow') ramp(.3, 2600);
      if (name === 'stop') ramp(0, 1800);
    }
  };

  /* =========================================================
     第三幕 音乐会
     ========================================================= */
  SCENES.concert = {
    build() {
      const lobby = U.svg(`<defs>${U.lg('lb', [[0, '#3a2a28'], [1, '#6a4a3a']])}${U.rg('chd', [[0, '#ffe8b8', .8], [1, '#ffd590', 0]])}</defs>
        <rect width="400" height="780" fill="url(#lb)"/>
        ${[70, 200, 330].map(x => `<circle cx="${x}" cy="110" r="90" fill="url(#chd)"/><path d="M${x} 40v40" stroke="#c9a46a"/><path d="M${x - 24} 90q24 30 48 0" stroke="#e9c88f" stroke-width="3" fill="none"/>${[-18, -6, 6, 18].map(d => `<circle cx="${x + d}" cy="${96 + Math.abs(d) * .4}" r="3" fill="#fff2cc"/>`).join('')}`).join('')}
        ${[40, 130, 270, 360].map(x => `<rect x="${x - 12}" y="160" width="24" height="420" fill="#8a6a52"/><rect x="${x - 16}" y="160" width="32" height="14" fill="#a8845f"/>`).join('')}
        <rect x="150" y="200" width="100" height="140" fill="#1f1622"/><rect x="156" y="206" width="88" height="128" fill="#5a3a4a"/><text x="200" y="250" text-anchor="middle" font-size="12" fill="#f3dcae" font-family="STSong,Songti SC,serif" letter-spacing="3">城市之夜</text><text x="200" y="272" text-anchor="middle" font-size="9" fill="#e9c88f" font-family="Georgia,serif" letter-spacing="2">CONCERT</text>
        <path d="M0 580H400V780H0Z" fill="#5a3a30"/><path d="M0 580H400" stroke="#c9a46a" stroke-width="2"/>
        <rect x="140" y="400" width="120" height="180" fill="#2a1e22"/><rect x="146" y="406" width="54" height="174" fill="#3a2a2e"/><rect x="200" y="406" width="54" height="174" fill="#352629"/>
        ${person({ x: 110, y: 600, s: .95, view: 'back', walk: true }, 0)}${person({ x: 300, y: 610, s: 1, view: 'back', walk: true, delay: -.4 }, 1)}${person({ x: 210, y: 590, s: .8, view: 'back', walk: true, delay: -.7 }, 5)}`);
      const ticket = `<div class="ticket" data-hit="ticket"><div class="tk-head">电子门票</div><div class="tk-name">城市之夜 · 室内乐音乐会</div><div class="tk-row"><span>周六 19:30</span><span>二楼 · 后排 27 座</span></div><div class="qr">${Array.from({ length: 49 }, (_, i) => `<i class="${(i * 7 + (i >> 2)) % 3 ? '' : 'b'}${[0, 1, 7, 8, 5, 6, 12, 13, 35, 36, 42, 43].includes(i) ? ' b' : ''}"></i>`).join('')}</div><div class="tk-stamp">已检票 ✓</div></div>`;
      const hall = U.svg(`<defs>${U.lg('hl', [[0, '#2a1b24'], [1, '#4a2e30']])}${U.rg('hCh', [[0, '#ffe2a8', .8], [1, '#ffd590', 0]])}${U.lg('stg', [[0, '#b4825a'], [1, '#6a4630']])}${U.lg('spot', [[0, '#fff1d0', .75], [1, '#fff1d0', 0]])}</defs>
        <rect width="400" height="780" fill="url(#hl)"/>
        <g class="house-lights">${[60, 200, 340].map(x => `<circle cx="${x}" cy="60" r="70" fill="url(#hCh)"/>`).join('')}</g>
        <rect class="house-dim" x="-10" y="-10" width="420" height="800" fill="#0a0408"/>
        <path d="M40 150Q200 100 360 150V440H40Z" fill="#1a1016"/>
        <path d="M40 150Q200 100 360 150" stroke="#c9a46a" stroke-width="6" fill="none"/><path d="M40 150V440M360 150V440" stroke="#8a5a3e" stroke-width="12"/>
        <path d="M52 158Q200 114 348 158V200H52Z" fill="#6a2a32"/>${Array.from({ length: 12 }, (_, i) => `<path d="M${60 + i * 25} 160v38" stroke="#4a1a22" stroke-width="2"/>`).join('')}
        <rect x="70" y="210" width="260" height="120" fill="#3a2a2a"/>${Array.from({ length: 11 }, (_, i) => `<rect x="${80 + i * 22}" y="${222 - Math.abs(i - 5) * 3}" width="10" height="${96 + Math.abs(i - 5) * 3}" rx="5" fill="#b49464" opacity=".55"/>`).join('')}
        <path d="M46 400L354 400L380 450H20Z" fill="url(#stg)"/><path d="M20 450H380V470H20Z" fill="#4a2e22"/>
        <g class="stage-wash"><path d="M60 330H340L370 450H30Z" fill="#ffd9a0" opacity=".14"/></g>
        <g class="spots"><path d="M150 0L90 450H230L180 0Z" fill="url(#spot)"/><path d="M250 0L190 450H320L270 0Z" fill="url(#spot)"/></g>
        <g class="players">
          <g transform="translate(92 412)"><path d="M0 0V-34H70V-28L60 -26V0Z" fill="#141016"/><path d="M0 -34Q20 -60 60 -40L70 -34Z" fill="#1b1520"/>${F.fig({ x: 86, y: 0, s: .34, view: 'side', flip: true, hs: 'short', coat: '#1b1b22', coat2: '#141218', pants: '#141418', half: true, nod: true, arm: 'push' })}</g>
          ${['violin', 'violin', 'violin', 'cello'].map((k, i) => `<g class="player" style="--d:-${(i * .37).toFixed(2)}s"><path d="M${186 + i * 40} 442v-26h18v26" stroke="#2a1a14" stroke-width="2" fill="none"/>${F.fig({ x: 195 + i * 40, y: 444, s: .4, view: 'front', sit: true, arm: k, hs: i % 2 ? 'long' : 'short', hair: '#15151a', coat: '#1d1a22', coat2: '#151219', pants: '#141418' })}</g>`).join('')}
        </g>
        <path d="M0 470H400V780H0Z" fill="#1e1418"/>
        <path d="M0 500Q200 486 400 500V520Q200 506 0 520Z" fill="#7a4a32"/><path d="M0 500Q200 486 400 500" stroke="#d9b06a" stroke-width="2" fill="none"/>
        <g class="audience">${Array.from({ length: 3 }, (_, r) => Array.from({ length: 9 }, (_, i) => `<g class="aud" style="--d:-${(i + r) * .7}s"><ellipse cx="${-6 + i * 52 + (r % 2) * 26}" cy="${560 + r * 46}" rx="${17 + r * 3}" ry="${21 + r * 3}" fill="${['#140c10', '#1a1014', '#22161a'][r]}"/><path d="M${-34 + i * 52 + (r % 2) * 26} ${600 + r * 46}q28 -24 56 0v40h-56z" fill="${['#140c10', '#1a1014', '#22161a'][r]}"/></g>`).join('')).join('')}</g>
        <rect data-hit="stage" x="70" y="300" width="260" height="150" fill="transparent"/>`);
      const street = U.svg(`<defs>${U.lg('cs', [[0, '#0e1830'], [1, '#2a3452']])}${U.lampGlowDef}${U.lg('wet', [[0, '#3a4058'], [1, '#1a1e2c']])}</defs>
        <rect width="400" height="780" fill="url(#cs)"/>${U.stars(20, 160)}
        <g class="walk-bg">${skyline(420, 470, 9, '#26304c', '#ffcf8f')}
          <path d="M0 470H400V780H0Z" fill="url(#wet)"/>
          <path d="M60 780L186 474H214L340 780Z" fill="#2c3246"/>
          ${[[110, 520, .7], [290, 516, .66], [150, 484, .36], [252, 482, .34]].map(([x, y, s]) => U.lamp(x, y, s)).join('')}
          <g opacity=".5">${[[127, 520], [306, 516]].map(([x, y]) => `<path d="M${x - 6} ${y + 4}h12l18 200h-48z" fill="#ffd59a" opacity=".25"/>`).join('')}</g>
          <g transform="translate(330 500)"><rect x="-4" y="-80" width="6" height="80" fill="#3a3e4a"/><rect x="-22" y="-112" width="40" height="34" rx="4" fill="#c9443e"/><text x="-2" y="-88" text-anchor="middle" font-size="22" fill="#fff" font-family="Georgia,serif">M</text></g>
          ${person({ x: 240, y: 520, s: .4, view: 'back', walk: true }, 2)}${person({ x: 160, y: 530, s: .44, view: 'front', walk: true, delay: -.5 }, 0)}
        </g>
        <path d="M0 780V700Q100 690 200 700T400 696V780Z" fill="#141826" opacity=".6"/>`);
      return { cam: U.shot('ticket', lobby) + U.shot('hall', hall, U.fall('glow', 10, { t0: 16, t1: 24, s0: 2, s1: 3, cls: 'dust' })) + U.shot('street', street), fp: `<div class="fp-phone">${F.phoneHand(ticket)}</div>` };
    }
  };

  /* =========================================================
     第四幕 美术馆（左右滑动探索）+ 咖啡馆
     ========================================================= */
  SCENES.gallery = {
    build() {
      const frames = [
        [70, 250, 110, 80, `<rect width="110" height="80" fill="#e9c9a0"/><path d="M0 56q30 -20 56 -6t54 -14v44H0z" fill="#a8845a"/><circle cx="80" cy="22" r="10" fill="#f6e2b8"/>`],
        [230, 230, 120, 140, `<rect width="120" height="140" fill="#cfd9d2"/><path d="M0 90q40 -40 70 -10t50 -30v90H0z" fill="#7a9a8a"/><path d="M20 30h60" stroke="#e9e2d0" stroke-width="12"/>`],
        [470, 220, 90, 120, `<rect width="90" height="120" fill="#e6d7c6"/><ellipse cx="45" cy="52" rx="22" ry="28" fill="#b98a6a"/><path d="M14 120q30 -50 62 0" fill="#6a5a6a"/>`],
        [610, 260, 130, 90, `<rect width="130" height="90" fill="#efe1c9"/>${Array.from({ length: 8 }, (_, i) => `<circle cx="${12 + i * 15}" cy="${45 + Math.sin(i) * 20}" r="${5 + i % 3 * 3}" fill="${['#c98f6a', '#7a9ab0', '#e2c57d'][i % 3]}"/>`).join('')}`]
      ];
      const art = U.svg(`<defs>${U.lg('gw', [[0, '#f3eee4'], [1, '#e2d8c8']])}${U.lg('gf', [[0, '#c4a888'], [1, '#9a7c60']])}${U.lg('blue', [[0, '#1e3a68'], [.6, '#335d92'], [1, '#6f95b8']])}${U.rg('gl', [[0, '#fffaf0', .9], [1, '#fffaf0', 0]])}</defs>
        <g class="pan-strip">
          <rect x="-40" y="0" width="1280" height="520" fill="url(#gw)"/>
          ${[0, 1, 2].map(i => `<circle cx="${200 + i * 400}" cy="120" r="200" fill="url(#gl)"/><rect x="${150 + i * 400}" y="40" width="100" height="10" fill="#fffef8"/>`).join('')}
          <rect x="-40" y="520" width="1280" height="260" fill="url(#gf)"/><path d="M-40 520H1240" stroke="#8a6e52" stroke-width="3"/>
          ${frames.map(([x, y, w, h, inner]) => `<g transform="translate(${x} ${y})"><rect x="-6" y="-6" width="${w + 12}" height="${h + 12}" fill="#8a6e52"/>${inner}</g><rect x="${x + w / 2 - 14}" y="${y + h + 22}" width="28" height="10" fill="#d9cfbe"/>`).join('')}
          <g transform="translate(400 380)"><rect x="-26" y="0" width="52" height="140" fill="#ece6da"/><path d="M-14 0q-6 -50 10 -80q20 30 8 80z" fill="#b9b2a6"/></g>
          <g data-hit="painting"><rect x="828" y="134" width="304" height="304" fill="#d9c9ae"/><rect x="840" y="146" width="280" height="280" fill="url(#blue)"/>
            <path d="M840 330q60 -80 140 -40t140 -50v186H840z" fill="#4f7aa8" opacity=".8"/><path d="M840 380q80 -40 150 -10t130 -30v86H840z" fill="#a9c4d2" opacity=".85"/><circle cx="1030" cy="220" r="26" fill="#f2d6ae"/><path d="M870 200q40 -10 70 6" stroke="#9fbcd6" stroke-width="3" fill="none" opacity=".6"/></g>
          <rect x="930" y="460" width="100" height="10" fill="#d9cfbe"/>
          <rect x="880" y="560" width="200" height="26" rx="4" fill="#6a5242"/><path d="M890 586v40M1070 586v40" stroke="#5a4232" stroke-width="6"/>
          <g class="visitors a">${person({ x: 140, y: 600, s: .95, view: 'back' }, 1)}${person({ x: 520, y: 610, s: 1, view: 'side', walk: true }, 2)}${person({ x: 900, y: 640, s: 1.05, view: 'back' }, 3)}${person({ x: 1110, y: 630, s: 1, view: 'back', hs: 'long' }, 5)}</g>
          <g class="visitors b">${person({ x: 300, y: 620, s: 1, view: 'side', flip: true, walk: true }, 4)}${person({ x: 960, y: 650, s: 1.08, view: 'back', hs: 'pony' }, 0)}${person({ x: 1160, y: 640, s: 1, view: 'side', flip: true }, 2)}</g>
        </g>`);
      const cafe = U.svg(`<defs>${U.lg('cf', [[0, '#5a4636'], [1, '#3a2c24']])}${U.lg('cfOut', [[0, '#b9c6cc'], [1, '#e2d6c2']])}${U.rg('cfL', [[0, '#ffe2a8', .6], [1, '#ffe2a8', 0]])}</defs>
        <rect width="400" height="780" fill="url(#cf)"/>
        <rect x="20" y="110" width="360" height="300" fill="url(#cfOut)"/>
        <g class="street-out">
          <path d="M20 330H380V410H20Z" fill="#b5aa98"/><path d="M20 300H380V330H20Z" fill="#cfc4b2"/>
          ${skyline(380, 300, 12, '#a49a8e', '#f6e2c0').replace(/x="(\d+)"/g, (m, x) => `x="${20 + +x}"`)}
          ${U.tree(60, 332, .5, 'green')}${U.tree(330, 332, .48, 'green')}
          <g class="peds">${[0, 1, 2, 3, 4].map(i => `<g class="ped" style="--pd:${-i * 3.6}s;--pt:${16 + i * 2}s">${person({ x: 0, y: 372 + (i % 2) * 18, s: .42 + (i % 2) * .06, view: 'side', walk: true, flip: i % 2 === 1 }, i)}</g>`).join('')}</g>
        </g>
        <path d="M20 110H380V410H20Z" fill="none" stroke="#2a201a" stroke-width="10"/><path d="M200 110V410" stroke="#2a201a" stroke-width="6"/>
        <text x="110" y="150" text-anchor="middle" font-size="16" fill="#fff8ee" opacity=".55" font-family="Georgia,serif" letter-spacing="4">CAFÉ</text>
        <circle cx="300" cy="80" r="120" fill="url(#cfL)"/><path d="M300 0v60" stroke="#2a201a" stroke-width="2"/><path d="M284 60h32l-6 12h-20z" fill="#e8c68a"/>
        <path d="M0 410H400V430H0Z" fill="#7a5a44"/><path d="M40 404q4 -30 -6 -50q18 18 14 50ZM56 404q10 -40 0 -60q20 28 6 60Z" fill="#6f8f62"/><rect x="34" y="398" width="34" height="14" fill="#c98f6a"/>
        <path d="M-20 450Q200 430 420 450V780H-20Z" fill="#a07c5c"/><path d="M-20 450Q200 430 420 450" stroke="#c49c74" stroke-width="3" fill="none"/>
        <g data-hit="cup"><ellipse cx="200" cy="470" rx="54" ry="13" fill="#efe6d6"/><path d="M168 430h64l-6 36q-26 8 -52 0z" fill="#f6efe2"/><ellipse cx="200" cy="430" rx="32" ry="8" fill="#a8744a"/><path d="M188 430q12 -6 24 0q-12 6 -24 0" fill="#f2dfc4"/><path d="M232 438q18 0 14 14t-18 8" stroke="#f6efe2" stroke-width="5" fill="none"/></g>
        <g class="steam"><path class="wisp" d="M190 418q-8 -20 4 -36" stroke="#fff8ec" stroke-width="8"/><path class="wisp" d="M208 418q8 -22 -2 -40" stroke="#fff8ec" stroke-width="8"/></g>
        <rect x="270" y="470" width="70" height="8" fill="#6a5242" transform="rotate(-6 300 474)"/><rect x="276" y="458" width="56" height="12" fill="#e8dccb" transform="rotate(-6 300 464)"/>`);
      return { cam: U.shot('gallery', art) + U.shot('cafe', cafe) };
    },
    enter(root) { root.style.setProperty('--pan', 0); }
  };

  /* =========================================================
     第五幕 夜宵 + 独自走回家
     ========================================================= */
  SCENES.friends = {
    build() {
      const friend = (o, i) => F.fig(Object.assign({ talk: true }, o), i);
      const table = U.svg(`<defs>${U.lg('fw', [[0, '#3a2a30'], [1, '#5a3c34']])}${U.rg('fl', [[0, '#ffd9a0', .7], [1, '#ffd9a0', 0]])}${U.rg('neon', [[0, '#ff9a8a', .7], [1, '#ff9a8a', 0]])}</defs>
        <rect width="400" height="780" fill="url(#fw)"/>
        <circle cx="290" cy="170" r="110" fill="url(#neon)"/>
        <rect x="230" y="120" width="130" height="70" rx="10" fill="none" stroke="#ffb3a6" stroke-width="4"/><text x="295" y="168" text-anchor="middle" font-size="32" fill="#ffd2c8" font-family="STSong,Songti SC,serif" letter-spacing="8">夜宵</text>
        <rect x="40" y="130" width="140" height="120" fill="#24323e"/>${skyline(140, 250, 2, '#33435a', '#ffd59a').replace(/x="(\d+)"/g, (m, x) => `x="${40 + (+x % 140)}"`).replace(/height="(\d+)"/g, (m, h) => `height="${Math.min(+h, 110)}"`)}<rect x="40" y="130" width="140" height="120" fill="none" stroke="#2a1a16" stroke-width="6"/>
        <path d="M0 60Q100 90 200 70T400 80" stroke="#6a5040" stroke-width="1.5" fill="none"/>${Array.from({ length: 12 }, (_, i) => `<circle class="twinkle" style="--d:-${i * .3}s" cx="${10 + i * 34}" cy="${68 + Math.sin(i * 1.3) * 8}" r="4" fill="#ffd38a"/>`).join('')}
        <circle cx="200" cy="420" r="200" fill="url(#fl)"/>
        <path d="M0 300H400V780H0Z" fill="#2c1e1e" opacity=".55"/>
        <path d="M30 360h76v80h-76zM294 360h76v80h-76z" fill="#4a2e26"/><path d="M164 330h72v80h-72z" fill="#43291f"/>
        ${friend({ x: 200, y: 476, s: .96, view: 'front', sit: true, hs: 'short', coat: '#5f6f5a', arm: 'table', delay: -.6 }, 0)}
        ${friend({ x: 68, y: 500, s: 1.08, view: 'front', sit: true, hs: 'pony', coat: '#8a5a4a', hair: '#3a2a24', arm: 'table' }, 1)}
        ${friend({ x: 332, y: 500, s: 1.08, view: 'front', sit: true, hs: 'long', coat: '#4a5a7a', arm: 'table', delay: -1.2 }, 2)}
        <ellipse cx="200" cy="470" rx="190" ry="54" fill="#8a5a3a"/><ellipse cx="200" cy="462" rx="182" ry="48" fill="#a06a44"/>
        <ellipse cx="140" cy="456" rx="34" ry="10" fill="#efe6d6"/>${[0, 1, 2, 3, 4].map(i => `<path d="M${118 + i * 10} 452l14 -18" stroke="#b9875a" stroke-width="2.4"/><circle cx="${126 + i * 10}" cy="${444 - i}" r="3" fill="#8a3a2a"/>`).join('')}
        <ellipse cx="250" cy="452" rx="30" ry="10" fill="#efe6d6"/><ellipse cx="250" cy="448" rx="22" ry="6" fill="#d98a4a"/>
        <ellipse cx="196" cy="476" rx="26" ry="8" fill="#e8dccb"/><path d="M184 474q12 -6 24 0" stroke="#7aa05a" stroke-width="5"/>
        <g data-hit="cups" class="cups">
          ${[[96, 470, -1], [164, 448, -1], [236, 448, 1], [304, 470, 1]].map(([x, y, d], i) => `<g class="cup" style="--cx:${(200 - x) * .7}px;--cy:${(440 - y) * .7 - 10}px"><path d="M${x - 9} ${y - 34}h18l-2 32h-14z" fill="#f2c56a" opacity=".85"/><path d="M${x - 9} ${y - 34}h18v6h-18z" fill="#fff6e4"/><path d="M${x - 9} ${y - 34}h18l-2 32h-14z" fill="none" stroke="#fff" stroke-width="1" opacity=".6"/></g>`).join('')}
        </g>
        <g class="spark">${[0, 1, 2, 3, 4, 5].map(i => `<path d="M200 386l${Math.cos(i) * 16} ${Math.sin(i) * 16 - 12}" stroke="#fff3cc" stroke-width="2"/>`).join('')}</g>
        <g class="ask-bubble"><path d="M196 236h188q10 0 10 10v40q0 10 -10 10h-120l-12 14l-4 -14h-52q-10 0 -10 -10v-40q0 -10 10 -10z" fill="#fff6ea"/><text x="290" y="272" text-anchor="middle" font-size="15" fill="#4a3a30" font-family="STSong,Songti SC,serif">下周有空吗？我们再约！</text></g>
        <path d="M0 520H400V780H0Z" fill="#241818"/>`);
      const night = U.svg(`<defs>${U.lg('nw', [[0, '#0d1730'], [1, '#2a3048']])}${U.lampGlowDef}</defs>
        <rect width="400" height="780" fill="url(#nw)"/>${U.stars(24, 200)}
        <g class="walk-bg">${skyline(420, 460, 21, '#222c46', '#ffcf8f')}
          <path d="M0 460H400V780H0Z" fill="#323646"/><path d="M80 780L188 464H212L320 780Z" fill="#3c4152"/>
          ${[[120, 520, .74], [280, 516, .7], [156, 482, .4], [246, 480, .38], [176, 468, .24], [226, 467, .22]].map(([x, y, s]) => U.lamp(x, y, s)).join('')}
          <path d="M0 520L150 470V490L0 560Z" fill="#2a2e3c"/><path d="M400 520L250 470V490L400 560Z" fill="#2a2e3c"/>
          ${[30, 360].map((x, i) => `<rect x="${x - 20}" y="480" width="40" height="40" fill="#ffcf8f" opacity=".75"/><text x="${x}" y="506" text-anchor="middle" font-size="10" fill="#5a3a2a" font-family="sans-serif">${i ? '24h' : '便利店'}</text>`).join('')}
        </g>`);
      return { cam: U.shot('table', table) + U.shot('night', night) };
    }
  };

  /* ---------------- 结局：逐光者 ---------------- */
  function cityNight(withHero) {
    return U.svg(`<defs>${U.lg('efSky', [[0, '#0b1530'], [.55, '#26355a'], [.85, '#6a5a72'], [1, '#c48a6a']])}${U.rg('efWarm', [[0, '#ffcf8f', .5], [1, '#ffcf8f', 0]])}${U.lampGlowDef}</defs>
      <rect width="400" height="780" fill="url(#efSky)"/>${U.stars(40, 260)}
      <circle cx="320" cy="236" r="16" fill="#f6ead2"/><circle cx="320" cy="236" r="36" fill="#f6ead2" opacity=".12"/>
      ${skyline(420, 520, 7, '#2a3654', '#ffcf8f')}
      <circle cx="200" cy="470" r="200" fill="url(#efWarm)"/>
      <rect x="96" y="404" width="12" height="14" fill="#ffd38a"/><circle cx="102" cy="411" r="20" fill="#ffd38a" opacity=".25" class="twinkle"/>
      <path d="M0 520H400V780H0Z" fill="#20283a"/><path d="M0 540H400" stroke="#8a93a6" stroke-width="3"/>${Array.from({ length: 11 }, (_, i) => `<path d="M${i * 40} 540v40" stroke="#8a93a6" stroke-width="3"/>`).join('')}<path d="M0 580H400" stroke="#8a93a6" stroke-width="3"/>
      ${U.lamp(40, 600, .9)}${U.lamp(370, 600, .9)}
      ${withHero ? F.heroineBack({ x: 200, y: 600, s: .5 }) : ''}`);
  }
  SCENES.endFar = { build() { return { cam: U.shot('e', cityNight(true), U.fall('glow', 12, { t0: 14, t1: 22, s0: 2, s1: 4, to: 60 })) }; } };
  window.CITY_NIGHT = cityNight;
})();
