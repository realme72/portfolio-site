// About-page illustration: Gaurav's room, seen from behind his desk chair.
// Night (moon): he's coding and sipping coffee. Day (sun): he stands up,
// stretches, walks to bed and sleeps; the window turns to a sunny garden.
// Screens animate with CSS; the person is drawn every frame in JS (2-bone IK
// arms, simple stand/walk/sit poses) driven by a small state machine.
(() => {
  const svg = document.querySelector(".scene");
  if (!svg) return;

  const C = {
    ink: "#7aa2f7", desk: "#f3dcae", deskEdge: "#d9b77c", deskLeg: "#e3c48c",
    bezel: "#2b2e3f", editor: "#1d2046", term: "#12142e", lap: "#1f2335",
    tee: "#17161f", teeHi: "#2a2836", rim: "#565f89", skin: "#c98d64", skinDk: "#ad7450", hair: "#1c1513",
    shorts: "#2f6bff", chair: "#ff5d7a", chairDk: "#d9435f", metal: "#9aa3b8",
    pink: "#ffb8f0", yellow: "#fff97a", cyan: "#5ff4ff", white: "#ffffff",
    wood: "#8a5a3c", woodLt: "#a8704a", sheet: "#e6e9f5", blanket: "#7aa2f7", blanketDk: "#5a7ed6",
  };
  const DX = 300; // the desk setup sits on the right half of the room
  const rnd = (n) => { const x = Math.sin(n * 91.7 + 7.3) * 43758.5453; return x - Math.floor(x); };
  const ease = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x < 0.5 ? 2 * x * x : 1 - (-2 * x + 2) ** 2 / 2);
  const clamp01 = (x) => Math.max(0, Math.min(1, x));
  const lerp = (a, b, k) => a + (b - a) * k;
  const lerp2 = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];

  // ---------- screen contents ----------
  function codeLines(n, x0, w, lh, seed, colors) {
    let s = "";
    for (let i = 0; i < n; i++) {
      const indent = [0, 8, 16, 8, 24, 16][Math.floor(rnd(seed + i) * 6)];
      let x = x0 + indent;
      const segs = 1 + Math.floor(rnd(seed + i + 50) * 3);
      if (rnd(seed + i + 9) < 0.12) continue; // blank line
      for (let k = 0; k < segs && x < x0 + w - 10; k++) {
        const sw = 8 + rnd(seed + i * 3 + k) * 34;
        s += `<rect x="${x.toFixed(1)}" y="${(i * lh).toFixed(1)}" width="${Math.min(sw, x0 + w - x).toFixed(1)}" height="3" rx="1.5" fill="${colors[Math.floor(rnd(seed + i * 7 + k) * colors.length)]}"/>`;
        x += sw + 4;
      }
    }
    return s;
  }
  const EDIT_LINES = 26, LH = 7;
  const editor = codeLines(EDIT_LINES, 34, 130, LH, 3, [C.pink, C.cyan, C.yellow, "#8b93d8", C.white]);
  const term = codeLines(24, 6, 112, 6, 40, ["#7CFFB2", "#7CFFB2", C.white, C.yellow, "#8b93d8"]);
  const stars = Array.from({ length: 16 }, (_, i) => `<circle class="twinkle" cx="${(82 + rnd(i + 3) * 176).toFixed(1)}" cy="${(84 + rnd(i + 30) * 90).toFixed(1)}" r="${(0.8 + rnd(i + 60) * 1.4).toFixed(1)}" fill="#fff" style="animation-delay:${(rnd(i + 90) * 3).toFixed(2)}s"/>`).join("");
  const tree = (x, y, s, crown, crown2) => `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-3" y="-6" width="6" height="22" fill="#6b4a2f"/><circle cx="0" cy="-16" r="16" fill="${crown}"/><circle cx="-10" cy="-8" r="11" fill="${crown}"/><circle cx="10" cy="-9" r="12" fill="${crown2}"/></g>`;

  svg.innerHTML = `
  <style>
    .scroll-code { animation: scrollCode 16s linear infinite; }
    @keyframes scrollCode { from { transform: translateY(0); } to { transform: translateY(-${EDIT_LINES * LH}px); } }
    .term-log { animation: termLog 9s steps(18) infinite; }
    @keyframes termLog { from { transform: translateY(0); } to { transform: translateY(-${24 * 6}px); } }
    .caret { animation: caret 1s steps(1) infinite; }
    @keyframes caret { 50% { opacity: 0; } }
    .bar { transform-box: fill-box; transform-origin: bottom; animation: bar 2.4s ease-in-out infinite alternate; }
    @keyframes bar { from { transform: scaleY(.35); } to { transform: scaleY(1); } }
    .led { animation: led 1.2s steps(1) infinite; }
    @keyframes led { 50% { opacity: .25; } }
    .steam path { animation: steam 2.6s ease-in-out infinite; }
    .steam path:nth-child(2) { animation-delay: .5s; } .steam path:nth-child(3) { animation-delay: 1s; }
    @keyframes steam { 0% { opacity: 0; transform: translateY(4px); } 40% { opacity: .8; } 100% { opacity: 0; transform: translateY(-10px); } }
    .glow { animation: glow 5s ease-in-out infinite alternate; }
    @keyframes glow { from { opacity: .14; } to { opacity: .24; } }
    .breathing { transform-box: fill-box; transform-origin: 50% 100%; animation: breathe 3.2s ease-in-out infinite; }
    @keyframes breathe { 0%, 100% { transform: scaleY(1); } 50% { transform: scaleY(1.06); } }
    .dog-tail { transform-box: fill-box; transform-origin: 100% 50%; animation: dogTail 7s ease-in-out infinite; }
    @keyframes dogTail { 0%, 85%, 100% { transform: rotate(0); } 89% { transform: rotate(10deg); } 93% { transform: rotate(-4deg); } }
    .zzz text { animation: zzz 4.5s ease-out infinite; opacity: 0; }
    .zzz text:nth-child(2) { animation-delay: 1.5s; } .zzz text:nth-child(3) { animation-delay: 3s; }
    .zzz.slow text { animation-duration: 5.2s; }
    @keyframes zzz { 0% { opacity: 0; transform: translate(0, 0); } 20% { opacity: .9; } 100% { opacity: 0; transform: translate(14px, -26px); } }
    .twinkle { animation: twinkle 3s ease-in-out infinite; }
    @keyframes twinkle { 0%, 100% { opacity: .9; } 50% { opacity: .2; } }
    .sun-rays { transform-box: fill-box; transform-origin: 50% 50%; animation: spin 30s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .cloud { animation: cloud 26s linear infinite; }
    .cloud.c2 { animation-duration: 38s; animation-delay: -14s; }
    @keyframes cloud { from { transform: translateX(-90px); } to { transform: translateX(230px); } }
    .scene.paused * { animation-play-state: paused !important; }
  </style>
  <defs>
    <clipPath id="edClip"><rect x="206" y="114" width="188" height="112" rx="2"/></clipPath>
    <clipPath id="tmClip"><rect x="8" y="16" width="126" height="94"/></clipPath>
    <clipPath id="winClip"><rect x="78" y="78" width="184" height="164" rx="3"/></clipPath>
    <clipPath id="roomClip"><rect x="0" y="16" width="900" height="532" rx="28"/></clipPath>
    <radialGradient id="screenGlow" cx="50%" cy="40%" r="60%"><stop offset="0" stop-color="${C.cyan}"/><stop offset="1" stop-color="${C.cyan}" stop-opacity="0"/></radialGradient>
    <linearGradient id="daySky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7cc8ff"/><stop offset="1" stop-color="#d9f1ff"/></linearGradient>
    <linearGradient id="nightSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b1026"/><stop offset="1" stop-color="#1b2448"/></linearGradient>
    <linearGradient id="beam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe9a8" stop-opacity=".55"/><stop offset="1" stop-color="#ffe9a8" stop-opacity="0"/></linearGradient>
  </defs>

  <!-- room -->
  <g clip-path="url(#roomClip)">
    <rect x="0" y="16" width="900" height="532" fill="#1f2335" opacity=".6"/>
    <rect id="dayTint" x="0" y="16" width="900" height="532" fill="#ffe9c4" opacity="0"/>
    <rect x="0" y="476" width="900" height="72" fill="#16161e" opacity=".75"/>
    <path d="M0 476 H900" stroke="#3b4261" stroke-width="2"/>
  </g>

  <!-- window -->
  <g>
    <g clip-path="url(#winClip)">
      <g id="winNight">
        <rect x="78" y="78" width="184" height="164" fill="url(#nightSky)"/>
        ${stars}
        <circle cx="222" cy="116" r="17" fill="#f5efcf"/><circle cx="230" cy="110" r="15" fill="#141c3c"/>
        <path d="M78 214 Q130 196 180 210 T262 206 V242 H78 Z" fill="#101a2e"/>
        ${tree(104, 214, 0.9, "#14243a", "#162a42")}${tree(160, 220, 0.7, "#14243a", "#162a42")}${tree(236, 214, 1, "#14243a", "#162a42")}
      </g>
      <g id="winDay" opacity="0">
        <rect x="78" y="78" width="184" height="164" fill="url(#daySky)"/>
        <g transform="translate(214 116)">
          <g class="sun-rays">${Array.from({ length: 12 }, (_, i) => `<rect x="-1.5" y="-36" width="3" height="10" rx="1.5" fill="#ffd166" transform="rotate(${i * 30})"/>`).join("")}</g>
          <circle r="20" fill="#ffd166"/><circle r="14" fill="#ffe08a"/>
        </g>
        <g class="cloud"><ellipse cx="100" cy="110" rx="18" ry="8" fill="#fff"/><ellipse cx="114" cy="104" rx="12" ry="8" fill="#fff"/></g>
        <g class="cloud c2"><ellipse cx="96" cy="140" rx="14" ry="6" fill="#fff" opacity=".9"/><ellipse cx="106" cy="135" rx="9" ry="6" fill="#fff" opacity=".9"/></g>
        <path d="M78 212 Q130 192 180 206 T262 200 V242 H78 Z" fill="#8fd17e"/>
        <path d="M78 226 Q140 214 200 224 T262 222 V242 H78 Z" fill="#6cbf6a"/>
        ${tree(104, 214, 0.9, "#4caf6a", "#62c27b")}${tree(160, 222, 0.7, "#58b86f", "#72cc86")}${tree(236, 212, 1, "#4caf6a", "#62c27b")}
        <path d="M120 236 h40M128 230 v10M152 230 v10" stroke="#f7f1e3" stroke-width="2"/>
      </g>
    </g>
    <rect x="72" y="72" width="196" height="176" rx="6" fill="none" stroke="#3b4261" stroke-width="10"/>
    <path d="M170 78 V242M78 160 H262" stroke="#3b4261" stroke-width="5"/>
    <rect x="62" y="246" width="216" height="10" rx="3" fill="#3b4261"/>
    <path d="M60 64 Q70 150 58 262 L86 262 Q78 160 92 64 Z" fill="#bb9af7" opacity=".85"/>
    <path d="M280 64 Q270 150 282 262 L254 262 Q262 160 248 64 Z" fill="#bb9af7" opacity=".85"/>
    <rect x="52" y="58" width="236" height="8" rx="4" fill="#565f89"/>
  </g>
  <path id="dayBeam" d="M80 250 H262 L460 540 H150 Z" fill="url(#beam)" opacity="0"/>

  <!-- bed -->
  <g>
    <rect x="28" y="384" width="18" height="102" rx="7" fill="${C.wood}"/>
    <rect x="34" y="484" width="10" height="26" fill="${C.wood}"/><rect x="272" y="484" width="10" height="26" fill="${C.wood}"/>
    <rect x="28" y="460" width="264" height="26" rx="5" fill="${C.woodLt}"/>
    <rect x="44" y="442" width="244" height="22" rx="9" fill="${C.sheet}"/>
    <ellipse cx="84" cy="438" rx="32" ry="12" fill="#fff"/>
    <rect x="280" y="426" width="14" height="60" rx="6" fill="${C.wood}"/>
    <g id="blanketFlat">
      <path d="M100 446 C150 438 240 438 280 444 L280 466 L100 466 Z" fill="${C.blanket}"/>
      <path d="M100 446 C150 438 240 438 280 444" fill="none" stroke="#fff" stroke-width="5" opacity=".9"/>
    </g>
    <g id="sleeper" opacity="0">
      <ellipse cx="94" cy="432" rx="12" ry="13" fill="${C.skin}" stroke="#1a1b26" stroke-width="1.4"/>
      <path d="M96 432 q3 2 6 0" fill="none" stroke="#1a1b26" stroke-width="1.4" stroke-linecap="round"/>
      <g fill="${C.hair}">${[[78, 420, 8], [86, 413, 8], [96, 414, 7], [74, 430, 7], [82, 426, 9], [103, 420, 5]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}"/>`).join("")}</g>
      <g class="breathing">
        <path d="M100 446 C108 418 150 412 192 418 C232 422 262 430 280 444 L280 466 L100 466 Z" fill="${C.blanket}"/>
        <path d="M140 424 q10 18 4 40M200 422 q8 20 0 42M246 432 q6 16 0 32" fill="none" stroke="${C.blanketDk}" stroke-width="3" stroke-linecap="round"/>
        <path d="M100 446 C110 430 118 424 130 420" fill="none" stroke="#fff" stroke-width="5" opacity=".9"/>
      </g>
      <g class="zzz" font-family="Afacad, sans-serif" font-weight="700" fill="#c0caf5">
        <text x="94" y="404" font-size="10">z</text><text x="99" y="399" font-size="13">z</text><text x="104" y="394" font-size="16">Z</text>
      </g>
    </g>
  </g>

  <!-- desk setup -->
  <g transform="translate(${DX} 0)">
    <ellipse cx="300" cy="530" rx="275" ry="22" fill="#000" opacity=".35"/>
    <g id="glowWrap"><ellipse class="glow" cx="300" cy="190" rx="250" ry="120" fill="url(#screenGlow)"/></g>

    <rect x="78" y="330" width="12" height="150" fill="${C.deskEdge}"/>
    <rect x="510" y="330" width="12" height="150" fill="${C.deskEdge}"/>
    <g fill="none" stroke="${C.bezel}" stroke-width="3" stroke-linecap="round">
      <path d="M300 272 C300 330 210 350 160 420"/><path d="M500 280 C520 340 470 380 470 420"/>
      <path d="M150 300 C120 360 110 400 125 420"/><path d="M520 470 C540 440 560 420 572 400"/>
    </g>

    <g>
      <rect x="96" y="392" width="62" height="124" rx="5" fill="${C.bezel}"/>
      <rect x="104" y="402" width="46" height="8" rx="2" fill="#3c4058"/><rect x="104" y="416" width="46" height="8" rx="2" fill="#3c4058"/>
      <circle cx="127" cy="446" r="6" fill="#3c4058"/><circle class="led" cx="127" cy="446" r="2.5" fill="${C.cyan}"/>
      <rect x="104" y="470" width="46" height="36" rx="3" fill="#24273a"/>
    </g>
    <g>
      <rect x="420" y="346" width="92" height="170" fill="${C.desk}"/>
      <rect x="420" y="346" width="92" height="170" fill="none" stroke="${C.deskEdge}" stroke-width="3"/>
      <rect x="428" y="356" width="76" height="62" fill="#e8cf9c"/>
      <rect x="434" y="388" width="44" height="12" fill="${C.chair}"/><rect x="434" y="400" width="44" height="12" fill="#fff"/>
      <rect x="482" y="372" width="14" height="40" fill="#3fbf8f"/><path d="M485 380h8M485 388h8M485 396h8" stroke="#1d6b50" stroke-width="2"/>
      <rect x="428" y="428" width="76" height="80" fill="#f7e6c2" stroke="${C.deskEdge}" stroke-width="2"/>
      <rect x="490" y="458" width="5" height="20" rx="2.5" fill="${C.deskEdge}"/>
    </g>
    <g>
      <path d="M556 492 L562 452" stroke="${C.bezel}" stroke-width="3" stroke-linecap="round"/>
      <rect x="530" y="490" width="56" height="22" rx="4" fill="${C.bezel}"/>
      <circle class="led" cx="542" cy="501" r="2.5" fill="#7CFFB2"/>
      <circle class="led" cx="552" cy="501" r="2.5" fill="#7CFFB2" style="animation-delay:.3s"/>
      <circle class="led" cx="562" cy="501" r="2.5" fill="${C.yellow}" style="animation-delay:.7s"/>
      <rect x="530" y="378" width="48" height="22" rx="3" fill="#e7ebf5" stroke="#c8cede" stroke-width="2"/>
      <rect x="540" y="384" width="6" height="10" fill="#9aa3b8"/><rect x="558" y="384" width="6" height="10" fill="#9aa3b8"/>
    </g>

    <path d="M60 266 H540 L550 332 H50 Z" fill="${C.desk}"/>
    <rect x="50" y="332" width="500" height="16" fill="${C.deskEdge}"/>
    <rect x="58" y="348" width="14" height="170" fill="${C.deskLeg}"/>
    <rect x="528" y="348" width="14" height="170" fill="${C.deskLeg}"/>

    <g>
      <path d="M78 302 L196 302 L214 326 L62 326 Z" fill="#c9cfe0"/>
      <path d="M86 308 H194 L204 320 H76 Z" fill="#b3bad0"/>
      <g transform="translate(90 214) skewY(-3)">
        <rect width="112" height="88" rx="5" fill="${C.bezel}"/>
        <rect x="6" y="6" width="100" height="74" rx="2" fill="${C.lap}"/>
        <rect x="6" y="6" width="100" height="10" fill="#16161e"/>
        <circle cx="12" cy="11" r="2" fill="${C.chair}"/><circle cx="18" cy="11" r="2" fill="${C.yellow}"/><circle cx="24" cy="11" r="2" fill="#7CFFB2"/>
        <rect x="12" y="22" width="40" height="22" rx="3" fill="#292e42"/>
        <text x="16" y="31" font-family="Afacad, sans-serif" font-size="6" fill="#7a80a8">p99 latency</text>
        <text x="16" y="40" font-family="Afacad, sans-serif" font-weight="700" font-size="9" fill="#9ece6a">42ms</text>
        <rect x="58" y="22" width="42" height="22" rx="3" fill="#292e42"/>
        <text x="62" y="31" font-family="Afacad, sans-serif" font-size="6" fill="#7a80a8">orders/day</text>
        <text x="62" y="40" font-family="Afacad, sans-serif" font-weight="700" font-size="9" fill="#9ece6a">30k+</text>
        ${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<rect class="bar" x="${14 + i * 11}" y="50" width="7" height="24" rx="1.5" fill="${[C.cyan, C.pink, C.ink, C.yellow][i % 4]}" style="animation-delay:${(i * 0.3).toFixed(1)}s"/>`).join("")}
        <rect class="screen-off" x="6" y="6" width="100" height="74" rx="2" fill="#07080f" opacity="0"/>
      </g>
    </g>

    <g transform="rotate(-14 236 312)">
      <rect x="212" y="296" width="54" height="36" fill="#fff"/>
      <path d="M218 304h30M218 310h40M218 316h24M218 322h34" stroke="#b9bfd8" stroke-width="2"/>
    </g>

    <g>
      <rect x="292" y="232" width="16" height="40" fill="#3c4058"/>
      <ellipse cx="300" cy="276" rx="36" ry="7" fill="#3c4058"/>
      <rect x="196" y="104" width="208" height="132" rx="8" fill="${C.bezel}"/>
      <rect x="206" y="114" width="188" height="112" rx="2" fill="${C.editor}"/>
      <g clip-path="url(#edClip)">
        <rect x="206" y="114" width="188" height="9" fill="#151838"/>
        <circle cx="212" cy="118.5" r="2" fill="${C.chair}"/><circle cx="218" cy="118.5" r="2" fill="${C.yellow}"/><circle cx="224" cy="118.5" r="2" fill="#7CFFB2"/>
        <rect x="206" y="123" width="30" height="103" fill="#171a3d"/>
        ${[0, 1, 2, 3, 4, 5, 6].map((i) => `<rect x="${i % 3 ? 214 : 210}" y="${130 + i * 9}" width="${(14 + rnd(i) * 10).toFixed(1)}" height="3" rx="1.5" fill="#5c6399"/>`).join("")}
        <g transform="translate(206 128)"><g class="scroll-code">${editor}<g transform="translate(0 ${EDIT_LINES * LH})">${editor}</g></g></g>
        <rect class="caret" x="${206 + 34 + 60}" y="196" width="2" height="7" fill="${C.white}"/>
      </g>
      <rect class="screen-off" x="206" y="114" width="188" height="112" rx="2" fill="#07080f" opacity="0"/>
      <rect x="404" y="112" width="14" height="12" fill="${C.yellow}" transform="rotate(4 411 118)"/>
      <rect x="404" y="128" width="14" height="12" fill="${C.pink}" transform="rotate(-3 411 134)"/>
      <rect x="404" y="144" width="14" height="12" fill="${C.yellow}" transform="rotate(2 411 150)"/>
    </g>

    <g>
      <rect x="486" y="250" width="14" height="28" fill="#3c4058"/>
      <ellipse cx="494" cy="282" rx="30" ry="6" fill="#3c4058"/>
      <g transform="translate(420 128) skewY(7)">
        <rect width="142" height="124" rx="6" fill="${C.bezel}"/>
        <rect x="8" y="8" width="126" height="102" rx="2" fill="${C.term}"/>
        <rect x="8" y="8" width="126" height="8" fill="#0b0d22"/>
        <text x="12" y="14.5" font-family="monospace" font-size="5.5" fill="#8b93d8">~/services/payments $ tail -f app.log</text>
        <g clip-path="url(#tmClip)"><g transform="translate(8 20)"><g class="term-log">${term}<g transform="translate(0 ${24 * 6})">${term}</g></g></g></g>
        <rect class="screen-off" x="8" y="8" width="126" height="102" rx="2" fill="#07080f" opacity="0"/>
      </g>
    </g>

    <rect x="250" y="300" width="100" height="18" rx="3" fill="#3c4058"/>
    <path d="M256 306h88M256 311h88" stroke="#55597a" stroke-width="2" stroke-dasharray="5 2"/>
    <ellipse cx="370" cy="316" rx="7" ry="10" fill="#3c4058"/>
    <g transform="rotate(8 452 306)">
      <rect x="436" y="290" width="34" height="40" rx="4" fill="${C.bezel}"/>
      <rect x="439" y="294" width="28" height="32" rx="2" fill="#20244a"/>
      <path d="M443 300h16M443 306h10M443 312h18M443 318h12" stroke="#8b93d8" stroke-width="2"/>
    </g>

    <!-- cat curled up asleep on the right end of the desk -->
    <g transform="translate(506 330)">
      <ellipse cx="0" cy="1" rx="32" ry="4" fill="#000" opacity=".15"/>
      <g class="breathing">
        <path d="M-26 0 C-30 -22 -6 -32 14 -29 C31 -26 35 -11 30 0 Z" fill="#f4a259"/>
        <path d="M2 -29 q2 7 -1 12M12 -28 q2 7 -1 12M21 -24 q1 6 -2 10" fill="none" stroke="#d9772b" stroke-width="2.2" stroke-linecap="round"/>
      </g>
      <path d="M29 -3 C26 6 -12 7 -27 1 C-12 3 12 1 25 -9 Z" fill="#e8893a"/>
      <g>
        <path d="M-29 -20 L-30 -34 L-21 -26 Z" fill="#f4a259"/><path d="M-27.5 -23 L-28 -30 L-23.5 -26 Z" fill="${C.pink}"/>
        <path d="M-13 -24 L-8 -36 L-4 -24 Z" fill="#f4a259"/><path d="M-11 -25 L-8 -32 L-6 -25 Z" fill="${C.pink}"/>
        <ellipse cx="-18" cy="-14" rx="14" ry="12" fill="#f4a259"/>
        <ellipse cx="-20" cy="-8" rx="7.5" ry="5" fill="#fff6ea"/>
        <path d="M-26 -15 q3 2.5 6 0M-16 -15 q3 2.5 6 0" fill="none" stroke="#2b2e3f" stroke-width="1.4" stroke-linecap="round"/>
        <path d="M-21.5 -10 h3 l-1.5 1.8 z" fill="#ff8fab"/>
        <path d="M-24 -21 v4M-19 -22 v4M-14 -21 v4" stroke="#d9772b" stroke-width="1.8" stroke-linecap="round"/>
        <ellipse cx="-30" cy="-2" rx="6" ry="3.5" fill="#fff6ea"/>
      </g>
      <g class="zzz slow" font-family="Afacad, sans-serif" font-weight="700" fill="#c0caf5">
        <text x="-34" y="-38" font-size="8">z</text><text x="-30" y="-42" font-size="10">z</text><text x="-26" y="-46" font-size="12">Z</text>
      </g>
    </g>
    <ellipse cx="402" cy="314" rx="13" ry="4" fill="#000" opacity=".12"/>
  </g>

  <!-- the person + cup (drawn by JS) -->
  <g id="actor"></g>

  <!-- chair (rolls back a little when he stands) -->
  <g id="chair">
    <rect x="294" y="466" width="12" height="44" fill="${C.metal}"/>
    <g stroke="${C.bezel}" stroke-width="7" stroke-linecap="round">
      <path d="M300 512 L242 530M300 512 L358 530M300 512 L300 540M300 512 L268 522M300 512 L332 522"/>
    </g>
    ${[[240, 534], [360, 534], [300, 546], [266, 525], [334, 525]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="7" fill="${C.bezel}"/>`).join("")}
    <rect x="234" y="440" width="132" height="30" rx="14" fill="${C.chairDk}"/>
    <rect x="246" y="326" width="108" height="124" rx="24" fill="${C.chair}"/>
    <rect x="260" y="342" width="80" height="92" rx="18" fill="${C.bezel}"/>
    <path d="M268 350 Q300 344 332 350" fill="none" stroke="#3c4058" stroke-width="3"/>
  </g>

  <!-- dog asleep on the floor between the bed and the desk -->
  <g transform="translate(372 540) scale(1.15)">
    <ellipse cx="0" cy="2" rx="62" ry="6" fill="#000" opacity=".12"/>
    <path class="dog-tail" d="M42 -6 C58 -8 64 -20 54 -26 C60 -14 50 -12 40 -12 Z" fill="#b97a45"/>
    <g class="breathing">
      <path d="M-30 0 C-36 -26 -10 -40 16 -38 C42 -36 52 -20 48 0 Z" fill="#d79a5e"/>
      <path d="M2 -34 C16 -40 34 -34 40 -24 C28 -30 14 -30 2 -26 Z" fill="#b97a45"/>
      <path d="M-4 -10 q8 -6 18 -2" fill="none" stroke="#b97a45" stroke-width="2" stroke-linecap="round"/>
    </g>
    <ellipse cx="-30" cy="-3" rx="15" ry="5" fill="#e9b783"/>
    <ellipse cx="-14" cy="-2" rx="12" ry="4.5" fill="#e9b783"/>
    <g>
      <ellipse cx="-40" cy="-14" rx="18" ry="13" fill="#d79a5e"/>
      <ellipse cx="-55" cy="-10" rx="8" ry="6" fill="#e9b783"/>
      <ellipse cx="-61" cy="-12" rx="3.2" ry="2.6" fill="#2b2e3f"/>
      <path d="M-30 -24 C-20 -26 -16 -14 -24 -6 C-28 -10 -30 -16 -30 -24 Z" fill="#9c6233"/>
      <path d="M-50 -18 q4 3 8 0" fill="none" stroke="#2b2e3f" stroke-width="1.6" stroke-linecap="round"/>
    </g>
    <g class="zzz" font-family="Afacad, sans-serif" font-weight="700" fill="#c0caf5">
      <text x="-54" y="-30" font-size="9">z</text><text x="-50" y="-34" font-size="11">z</text><text x="-46" y="-38" font-size="13">Z</text>
    </g>
  </g>
  `;

  const $ = (sel) => svg.querySelector(sel);
  const actor = $("#actor"), chair = $("#chair"), sleeper = $("#sleeper"), blanketFlat = $("#blanketFlat");
  const winDay = $("#winDay"), dayTint = $("#dayTint"), dayBeam = $("#dayBeam"), glowWrap = $("#glowWrap");
  const screensOff = [...svg.querySelectorAll(".screen-off")];

  // messy curly hair: a cluster of overlapping curls + a few loose ringlet strokes
  // (cx, cy) = top of head centre, w = half width, seed = layout variation
  function curls(cx, cy, w, h, seed, front) {
    let fill = "", lines = "";
    const n = 15;
    for (let i = 0; i < n; i++) {
      const a = Math.PI * (1.05 + 0.9 * (i / (n - 1))); // over the crown
      const x = cx + Math.cos(a) * w * (0.92 + rnd(seed + i) * 0.16), y = cy + Math.sin(a) * h * (0.9 + rnd(seed + i + 9) * 0.2) + h * 0.55;
      const r = 8 + rnd(seed + i + 20) * 5;
      fill += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}"/>`;
      if (i % 2 === 0) lines += `<path d="M${(x - r * 0.5).toFixed(1)} ${(y + r * 0.2).toFixed(1)} q${(r * 0.5).toFixed(1)} ${(-r * 0.9).toFixed(1)} ${(r * 0.9).toFixed(1)} ${(-r * 0.1).toFixed(1)}"/>`;
    }
    fill += `<ellipse cx="${cx}" cy="${(cy + h * 0.55).toFixed(1)}" rx="${(w * 0.92).toFixed(1)}" ry="${(h * 0.75).toFixed(1)}"/>`;
    // loose curls dropping onto the forehead / sides
    const drops = front ? [[-0.55, 0.9], [-0.15, 1.05], [0.3, 0.95], [0.7, 0.75]] : [[-0.9, 1.0], [0.9, 1.0], [-0.4, 1.25], [0.35, 1.2]];
    for (const [fx, fy] of drops) {
      const x = cx + fx * w, y = cy + fy * h;
      fill += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="6.5"/>`;
      lines += `<path d="M${(x - 3).toFixed(1)} ${(y + 5).toFixed(1)} c-3 4 2 8 5 5"/>`;
    }
    return `<g fill="${C.hair}">${fill}</g><g fill="none" stroke="#5a4a44" stroke-width="1.6" stroke-linecap="round">${lines}</g>`;
  }

  // ---------- person ----------
  const L1 = 44, L2 = 40;
  // 2-bone IK; elbow picked to hang down and slightly out (natural, not "wings")
  function ik(S, T, side) {
    const dx = T[0] - S[0], dy = T[1] - S[1];
    const d = Math.max(Math.abs(L1 - L2) + 1, Math.min(L1 + L2 - 0.5, Math.hypot(dx, dy)));
    const base = Math.atan2(dy, dx);
    const a = Math.acos(Math.max(-1, Math.min(1, (L1 * L1 + d * d - L2 * L2) / (2 * L1 * d))));
    const cands = [base + a, base - a].map((ang) => [S[0] + Math.cos(ang) * L1, S[1] + Math.sin(ang) * L1]);
    const score = (e) => e[1] + 0.5 * side * e[0];
    const E = score(cands[0]) >= score(cands[1]) ? cands[0] : cands[1];
    const ang2 = Math.atan2(T[1] - E[1], T[0] - E[0]);
    return { E, H: [E[0] + Math.cos(ang2) * L2, E[1] + Math.sin(ang2) * L2] };
  }
  const pt = (a) => `${a[0].toFixed(1)} ${a[1].toFixed(1)}`;
  function armSVG(S, E, H) {
    const sl = [S[0] + (E[0] - S[0]) * 0.55, S[1] + (E[1] - S[1]) * 0.55];
    return `<path d="M${pt(S)} L${pt(E)} L${pt(H)}" fill="none" stroke="${C.skin}" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M${pt(S)} L${pt(sl)}" stroke="${C.rim}" stroke-width="25" stroke-linecap="round"/><path d="M${pt(S)} L${pt(sl)}" stroke="${C.tee}" stroke-width="21" stroke-linecap="round"/>
      <circle cx="${H[0].toFixed(1)}" cy="${H[1].toFixed(1)}" r="8" fill="${C.skinDk}"/>`;
  }
  const cupSVG = (x, y, tilt, steam) => `
    <g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${tilt.toFixed(1)})">
      <g class="steam" fill="none" stroke="#b9bfd8" stroke-width="2" stroke-linecap="round" opacity="${steam.toFixed(2)}">
        <path d="M4 -34 q-4 -5 0 -10 q4 -5 0 -10"/><path d="M11 -34 q-4 -5 0 -10 q4 -5 0 -10"/><path d="M18 -34 q-4 -5 0 -10 q4 -5 0 -10"/>
      </g>
      <path d="M0 -26 H22 L19 2 H3 Z" fill="#fff"/>
      <rect x="1" y="-17" width="20" height="9" fill="${C.chair}"/>
      <rect x="-1" y="-30" width="24" height="5" rx="2" fill="${C.bezel}"/>
    </g>`;
  const CUP_REST = [DX + 394, 312];

  // pose: x (body centre), r (0 seated .. 1 standing), hl/hr hand targets,
  // headTilt, walk phase (or null), cup {held, tilt}, alpha
  function drawPerson(pose) {
    const { x: cx, r, headTilt = 0, walk = null, alpha = 1 } = pose;
    if (walk != null) return drawWalker(cx, walk, pose.dir || -1, alpha);
    const lift = 58 * r, bob = walk == null ? 0 : Math.abs(Math.sin(walk)) * 2;
    const hy = 238 - lift - bob, shY = 296 - lift - bob, tTop = 278 - lift - bob, tBot = 424 - 58 * r - bob;
    const sTop = 420 - 60 * r - bob, sBot = 460 - 55 * r, sHalf = 64 - 18 * r, legX = 30.5 - 13 * r, lTop = 458 - 53 * r;
    let g = "";
    // legs + shoes (walk cycle lifts alternate feet)
    for (const side of [-1, 1]) {
      const ph = walk == null ? 0 : Math.sin(walk) * side;
      const up = Math.max(0, ph) * 7, sx = cx + side * legX + (walk == null ? 0 : ph * 3);
      g += `<rect x="${(sx - 7.5).toFixed(1)}" y="${lTop.toFixed(1)}" width="15" height="${(514 - up - lTop).toFixed(1)}" rx="6" fill="${C.skin}"/>`;
      g += `<path d="M${(sx - 15).toFixed(1)} ${(524 - up).toFixed(1)} v-6 q0 -6 6 -6 h18 q6 0 6 6 v6 z" fill="#fff"/><path d="M${(sx - 16).toFixed(1)} ${(522 - up).toFixed(1)} h32" stroke="${C.cyan}" stroke-width="3"/>`;
    }
    g += `<rect x="${(cx - sHalf).toFixed(1)}" y="${sTop.toFixed(1)}" width="${(sHalf * 2).toFixed(1)}" height="${(sBot - sTop).toFixed(1)}" rx="15" fill="${C.shorts}"/>`;
    g += `<path d="M${cx} ${(sTop + 4).toFixed(1)} V${(sBot - 2).toFixed(1)}" stroke="#1d4fd6" stroke-width="2"/>`;
    // arms
    const SL = [cx - 48, shY + 2], SR = [cx + 48, shY + 2];
    const l = ik(SL, pose.hl, -1), rr = ik(SR, pose.hr, 1);
    const arms = armSVG(SL, l.E, l.H) + armSVG(SR, rr.E, rr.H);
    const cup = pose.cup && pose.cup.held ? cupSVG(rr.H[0] + 2, rr.H[1] + 6, pose.cup.tilt, pose.cup.steam) : "";
    const armsInFront = r > 0.5;
    if (!armsInFront) g += arms + cup;
    // torso
    g += `<path d="M${cx - 56} ${(tTop + 26).toFixed(1)} Q${cx - 54} ${(tTop + 6).toFixed(1)} ${cx - 30} ${tTop.toFixed(1)} H${cx + 30} Q${cx + 54} ${(tTop + 6).toFixed(1)} ${cx + 56} ${(tTop + 26).toFixed(1)} L${cx + 62} ${tBot.toFixed(1)} H${cx - 62} Z" fill="${C.tee}" stroke="${C.rim}" stroke-width="2"/>`;
    g += `<path d="M${cx - 56} ${(tTop + 26).toFixed(1)} Q${cx - 54} ${(tTop + 6).toFixed(1)} ${cx - 30} ${tTop.toFixed(1)} L${cx - 28} ${(tTop + 22).toFixed(1)} Q${cx - 42} ${(tTop + 26).toFixed(1)} ${cx - 48} ${(tTop + 52).toFixed(1)} Z" fill="${C.teeHi}"/>`;
    g += `<path d="M${cx - 14} ${(tTop + 2).toFixed(1)} Q${cx} ${(tTop + 12).toFixed(1)} ${cx + 14} ${(tTop + 2).toFixed(1)}" fill="none" stroke="#3a384a" stroke-width="3"/>`;
    g += `<path d="M${cx - 30} ${(tTop + 52).toFixed(1)} Q${cx - 24} ${(tTop + 82).toFixed(1)} ${cx - 32} ${(tTop + 112).toFixed(1)}M${cx + 32} ${(tTop + 52).toFixed(1)} Q${cx + 26} ${(tTop + 84).toFixed(1)} ${cx + 34} ${(tTop + 114).toFixed(1)}" fill="none" stroke="${C.teeHi}" stroke-width="3"/>`;
    // head
    g += `<g transform="rotate(${headTilt.toFixed(2)} ${cx} ${(hy + 44).toFixed(1)})">
      <rect x="${cx - 10}" y="${(hy + 24).toFixed(1)}" width="20" height="22" fill="${C.skinDk}"/>
      <ellipse cx="${cx - 35}" cy="${(hy + 8).toFixed(1)}" rx="7" ry="10" fill="${C.skin}"/>
      <ellipse cx="${cx + 35}" cy="${(hy + 8).toFixed(1)}" rx="7" ry="10" fill="${C.skin}"/>
      <ellipse cx="${cx}" cy="${(hy + 2).toFixed(1)}" rx="34" ry="36" fill="${C.hair}"/>
      ${curls(cx, hy - 34, 36, 30, 3, false)}
      ${[[-22, 22], [-8, 30], [8, 30], [22, 22], [-30, 8], [30, 8]].map(([dx, dy], i) => `<circle cx="${cx + dx}" cy="${(hy + dy).toFixed(1)}" r="${7 + (i % 2) * 2}" fill="${C.hair}"/>`).join("")}
      <path d="M${cx - 14} ${(hy + 4).toFixed(1)} c-4 5 2 9 5 5M${cx + 10} ${(hy + 12).toFixed(1)} c-4 5 2 9 5 5M${cx - 2} ${(hy - 8).toFixed(1)} c-4 5 2 9 5 5" fill="none" stroke="#5a4a44" stroke-width="1.6" stroke-linecap="round"/>
      <path d="M${cx - 34} ${(hy - 2).toFixed(1)} q-4 6 0 13M${cx + 34} ${(hy - 2).toFixed(1)} q4 6 0 13" fill="none" stroke="#1a1b26" stroke-width="2.2" stroke-linecap="round"/>
    </g>`;
    if (armsInFront) g += arms + cup;
    return `<g opacity="${alpha.toFixed(2)}">${g}</g>`;
  }

  // side-view walk cycle: hip/knee angles per leg, feet kept on the floor,
  // arms swing opposite to the legs, head faces the walking direction
  function drawWalker(cx, ph, d, alpha) {
    const deg = Math.PI / 180, Lt = 58, Ls = 56, La = 40, Lf = 36;
    const legs = [0, Math.PI].map((off) => {
      const p = ph + off, hip = 24 * Math.sin(p) * deg, bend = (6 + 44 * Math.max(0, Math.cos(p))) * deg;
      const K = [d * Math.sin(hip) * Lt, Math.cos(hip) * Lt];
      const A = [K[0] + d * Math.sin(hip - bend) * Ls, K[1] + Math.cos(hip - bend) * Ls];
      return { p, K, A };
    });
    const hipY = 510 - Math.max(legs[0].A[1], legs[1].A[1]);
    const H = [cx, hipY], top = hipY - 168, hem = hipY - 22, hy = top - 40;
    const abs = (v) => [cx + v[0], hipY + v[1]];
    const legSVG = (L, skin) => {
      const K = abs(L.K), A = abs(L.A), thighEnd = [H[0] + (K[0] - H[0]) * 0.5, H[1] + (K[1] - H[1]) * 0.5];
      const x1 = Math.min(A[0] - d * 9, A[0] + d * 25), x2 = Math.max(A[0] - d * 9, A[0] + d * 25);
      return `<path d="M${pt(H)} L${pt(K)} L${pt(A)}" fill="none" stroke="${skin}" stroke-width="15" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M${pt(H)} L${pt(thighEnd)}" stroke="${C.shorts}" stroke-width="23" stroke-linecap="round"/>
        <rect x="${x1.toFixed(1)}" y="${(A[1] - 6).toFixed(1)}" width="${(x2 - x1).toFixed(1)}" height="14" rx="6" fill="#fff"/>
        <path d="M${x1.toFixed(1)} ${(A[1] + 6).toFixed(1)} H${x2.toFixed(1)}" stroke="${C.cyan}" stroke-width="3"/>`;
    };
    const armSVG2 = (p, skin) => {
      const S = [cx + d * 2, top + 20], a = -22 * Math.sin(p) * deg, a2 = a + (14 + 14 * Math.max(0, -Math.sin(p))) * deg;
      const E = [S[0] + d * Math.sin(a) * La, S[1] + Math.cos(a) * La];
      const Hd = [E[0] + d * Math.sin(a2) * Lf, E[1] + Math.cos(a2) * Lf];
      const sl = [S[0] + (E[0] - S[0]) * 0.55, S[1] + (E[1] - S[1]) * 0.55];
      return `<path d="M${pt(S)} L${pt(E)} L${pt(Hd)}" fill="none" stroke="${skin}" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M${pt(S)} L${pt(sl)}" stroke="${C.rim}" stroke-width="24" stroke-linecap="round"/><path d="M${pt(S)} L${pt(sl)}" stroke="${C.tee}" stroke-width="20" stroke-linecap="round"/>
        <circle cx="${Hd[0].toFixed(1)}" cy="${Hd[1].toFixed(1)}" r="7.5" fill="${C.skinDk}"/>`;
    };
    const X = (v) => (cx + d * v).toFixed(1);
    let g = `<ellipse cx="${cx}" cy="522" rx="38" ry="5" fill="#000" opacity=".25"/>`;
    g += armSVG2(legs[0].p, C.skinDk) + legSVG(legs[1], C.skinDk) + legSVG(legs[0], C.skin);
    g += `<rect x="${cx - 25}" y="${(hipY - 30).toFixed(1)}" width="50" height="36" rx="12" fill="${C.shorts}"/>`;
    g += `<path d="M${X(-28)} ${top + 12} Q${X(-30)} ${top} ${X(-10)} ${top - 2} L${X(16)} ${top - 2} Q${X(32)} ${top + 4} ${X(33)} ${top + 30} L${X(35)} ${hem} L${X(-34)} ${hem} Z" fill="${C.tee}" stroke="${C.rim}" stroke-width="2"/>`;
    g += `<path d="M${X(-20)} ${top + 40} Q${X(-14)} ${top + 80} ${X(-22)} ${hem - 10}" fill="none" stroke="${C.teeHi}" stroke-width="3"/>`;
    // head, three-quarter view toward the walking direction: line-art face,
    // round glasses, dot eyes, curly hair (mirrored for d = -1)
    g += `<rect x="${cx - 9}" y="${top - 18}" width="18" height="22" fill="${C.skinDk}"/>
      <g transform="translate(${X(0)} ${hy}) scale(${d} 1)">
        <ellipse cx="-27" cy="4" rx="6" ry="9" fill="${C.skin}" stroke="#1a1b26" stroke-width="1.6"/>
        <path d="M-28 -6 C-30 -30 -10 -38 6 -36 C22 -34 31 -22 31 -6 C31 4 33 8 34 12 C35 14 32 15 31 16 C31 24 26 32 14 34 C2 36 -14 32 -22 22 C-26 16 -28 8 -28 -6 Z" fill="${C.skin}" stroke="#1a1b26" stroke-width="1.8"/>
        ${curls(0, -40, 30, 20, 11, true)}
        <circle cx="0" cy="2" r="9" fill="#fff" fill-opacity=".14" stroke="#1a1b26" stroke-width="2"/>
        <circle cx="23" cy="2" r="7.5" fill="#fff" fill-opacity=".14" stroke="#1a1b26" stroke-width="2"/>
        <path d="M9 1 q3 -2 6.5 0M-9 0 L-26 -2" fill="none" stroke="#1a1b26" stroke-width="1.8" stroke-linecap="round"/>
        <circle cx="1.5" cy="2.5" r="1.8" fill="#1a1b26"/><circle cx="24" cy="2.5" r="1.6" fill="#1a1b26"/>
        <path d="M-5 -10 q5 -2 9 0M19 -9 q4 -1.5 7 0" fill="none" stroke="#1a1b26" stroke-width="1.5" stroke-linecap="round"/>
        <path d="M16 10 q2 6 -1 9 q3 1 5 0" fill="none" stroke="#1a1b26" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M10 25 q5 1.5 9 -0.5" fill="none" stroke="#1a1b26" stroke-width="1.5" stroke-linecap="round"/>
      </g>`;
    g += armSVG2(legs[1].p, C.skin);
    return `<g opacity="${alpha.toFixed(2)}">${g}</g>`;
  }

  // ---------- poses ----------
  const SEAT_X = DX + 300, BED_X = 205;
  const workHands = (t, sipK) => {
    const typing = sipK < 0.05;
    const hl = [SEAT_X - 70 + (typing ? Math.sin(t * 17) * 2 : 0), 318 + (typing ? -Math.abs(Math.sin(t * 23)) * 3 : 0)];
    const REST = [SEAT_X + 92, 306], SIP = [SEAT_X + 32, 244];
    const hr = [lerp(REST[0], SIP[0], sipK), lerp(REST[1], SIP[1], sipK) - Math.sin(sipK * Math.PI) * 14];
    return { hl, hr };
  };
  const idleHands = (x, r, swing = 0) => ({
    hl: [x - 60 + swing * 2, 296 - 58 * r + 62 + swing * 5],
    hr: [x + 60 - swing * 2, 296 - 58 * r + 62 - swing * 5],
  });
  const stretchHands = (x, r, k, t) => {
    const top = 238 - 58 * r - 84;
    const idle = idleHands(x, r);
    return {
      hl: lerp2(idle.hl, [x - 26 + Math.sin(t * 3) * 3, top], k),
      hr: lerp2(idle.hr, [x + 26 + Math.sin(t * 3) * 3, top], k),
    };
  };
  function sipState(t) {
    const u = t % 10;
    let k = 0, tilt = 0, headTilt = 0;
    if (u > 3.5 && u <= 4.8) k = ease((u - 3.5) / 1.3);
    else if (u > 4.8 && u <= 6.4) { k = 1; const q = (u - 4.8) / 1.6; tilt = -38 * Math.sin(Math.min(1, q * 1.3) * Math.PI / 2) * (q > 0.85 ? (1 - q) / 0.15 : 1); headTilt = tilt / 5.5; }
    else if (u > 6.4 && u <= 7.6) k = 1 - ease((u - 6.4) / 1.2);
    return { k, tilt, headTilt };
  }

  // ---------- state machine ----------
  let clock = 0, mode = "work", seqStart = 0, workStart = 0, want = "night", dayBlend = 0;
  const TO_DAY = 6.6, TO_NIGHT = 6.0;

  function render(dt) {
    clock += dt;
    // window / room light eases toward the wanted time of day
    dayBlend = clamp01(dayBlend + (want === "day" ? 1 : -1) * dt / 1.5);
    winDay.setAttribute("opacity", dayBlend.toFixed(3));
    dayTint.setAttribute("opacity", (dayBlend * 0.06).toFixed(3));
    dayBeam.setAttribute("opacity", (dayBlend * 0.5).toFixed(3));

    let pose, screens = 0, bed = 0, chairRoll = 0;
    if (mode === "work") {
      const t = clock - workStart, s = sipState(t);
      const u = t % 10;
      if (want === "day" && s.k === 0 && (u < 3.4 || u > 7.6)) { mode = "toDay"; seqStart = clock; return render(0); }
      const { hl, hr } = workHands(t, s.k);
      pose = { x: SEAT_X, r: 0, hl, hr, headTilt: s.headTilt, cup: { held: true, tilt: s.tilt - s.k * 6, steam: 1 - s.k * 0.8 } };
    } else if (mode === "toDay") {
      const q = clock - seqStart;
      if (q < 1.0) { // stand up, hands come off the desk
        const k = ease(q / 1.0), w = workHands(clock, 0), idle = idleHands(SEAT_X, k);
        pose = { x: SEAT_X, r: k, hl: lerp2(w.hl, idle.hl, k), hr: lerp2(w.hr, idle.hr, k) };
        chairRoll = k;
      } else if (q < 2.8) { // big stretch + yawn
        const s = (q - 1.0) / 1.8, k = s < 0.35 ? ease(s / 0.35) : s > 0.8 ? 1 - ease((s - 0.8) / 0.2) : 1;
        pose = { x: SEAT_X, r: 1, ...stretchHands(SEAT_X, 1, k, clock), headTilt: -9 * k };
        chairRoll = 1;
      } else if (q < 5.6) { // walk to bed
        const s = (q - 2.8) / 2.8, x = lerp(SEAT_X, BED_X, s), ph = (q - 2.8) * 5.2;
        pose = { x, r: 1, ...idleHands(x, 1), walk: ph, dir: -1 };
        chairRoll = 1; screens = clamp01((q - 2.8) / 0.8);
      } else { // slip into bed
        const k = clamp01((q - 5.6) / 0.8);
        pose = { x: BED_X, r: 1, ...idleHands(BED_X, 1), alpha: 1 - k };
        bed = k; screens = 1; chairRoll = 1;
        if (q >= TO_DAY) mode = "sleep";
      }
    } else if (mode === "sleep") {
      pose = null; bed = 1; screens = 1; chairRoll = 1;
      if (want === "night") { mode = "toNight"; seqStart = clock; }
    } else if (mode === "toNight") {
      const q = clock - seqStart;
      if (q < 0.8) { // get out of bed
        const k = ease(q / 0.8);
        pose = { x: BED_X, r: 1, ...idleHands(BED_X, 1), alpha: k };
        bed = 1 - k; screens = 1; chairRoll = 1;
      } else if (q < 1.8) { // quick morning... er, evening stretch
        const s = (q - 0.8) / 1.0, k = Math.sin(s * Math.PI);
        pose = { x: BED_X, r: 1, ...stretchHands(BED_X, 1, k, clock), headTilt: -6 * k };
        screens = 1; chairRoll = 1;
      } else if (q < 4.6) { // walk back to the desk, screens wake up
        const s = (q - 1.8) / 2.8, x = lerp(BED_X, SEAT_X, s), ph = (q - 1.8) * 5.2;
        pose = { x, r: 1, ...idleHands(x, 1), walk: ph, dir: 1 };
        screens = 1 - clamp01((q - 1.8) / 0.8); chairRoll = 1;
      } else { // sit down and get typing
        const k = ease(clamp01((q - 4.6) / 1.0)), w = workHands(clock, 0), idle = idleHands(SEAT_X, 1 - k);
        pose = { x: SEAT_X, r: 1 - k, hl: lerp2(idle.hl, w.hl, k), hr: lerp2(idle.hr, w.hr, k) };
        chairRoll = 1 - k;
        if (q >= TO_NIGHT) { mode = "work"; workStart = clock; }
      }
    }

    // cup stays on the desk unless he is holding it
    const holding = pose && pose.cup && pose.cup.held;
    const restCup = holding ? "" : cupSVG(CUP_REST[0], CUP_REST[1], 0, 1);
    actor.innerHTML = restCup + (pose ? drawPerson(pose) : "");
    chair.setAttribute("transform", `translate(${(DX + chairRoll * 14).toFixed(1)} ${(chairRoll * 8).toFixed(1)})`);
    sleeper.setAttribute("opacity", bed.toFixed(3));
    blanketFlat.setAttribute("opacity", (1 - bed).toFixed(3));
    screensOff.forEach((el) => el.setAttribute("opacity", (screens * 0.92).toFixed(3)));
    glowWrap.setAttribute("opacity", (1 - screens).toFixed(3));
  }

  // ---------- playback + controls ----------
  let playing = !matchMedia("(prefers-reduced-motion: reduce)").matches, last = performance.now(), raf;
  const loop = (now) => { render(Math.min(0.25, (now - last) / 1000)); last = now; raf = requestAnimationFrame(loop); };
  render(0);
  if (playing) raf = requestAnimationFrame(loop); else svg.classList.add("paused");

  const dnButtons = [...document.querySelectorAll(".daynight [data-mode]")];
  const syncButtons = () => dnButtons.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.mode === want)));
  dnButtons.forEach((b) => b.addEventListener("click", () => {
    want = b.dataset.mode;
    syncButtons();
    if (!playing) { // jump straight to the end state when paused / reduced motion
      if (want === "day") { mode = "sleep"; dayBlend = 1; } else { mode = "work"; workStart = clock; dayBlend = 0; }
      render(0);
    }
  }));
  syncButtons();

  const btn = document.querySelector(".play");
  if (!btn) return;
  const PAUSE = btn.innerHTML;
  const PLAY = '<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M6 3 L20 12 L6 21 Z"/></svg>';
  if (!playing) btn.innerHTML = PLAY;
  btn.addEventListener("click", () => {
    playing = !playing;
    if (playing) { last = performance.now(); raf = requestAnimationFrame(loop); } else cancelAnimationFrame(raf);
    svg.classList.toggle("paused", !playing);
    btn.innerHTML = playing ? PAUSE : PLAY;
    btn.setAttribute("aria-label", playing ? "Pause animation" : "Play animation");
  });
})();
