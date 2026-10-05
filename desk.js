// Interactive 3D-style desk: draggable objects on a desk with drawers, a sleeping cat, and BYTE.
const STAGE_W = 760, STAGE_H = 600;

// ---------- 3D helpers (oblique projection: depth d goes up-right by d*KX, -d*KY) ----------
const KX = 0.5, KY = 0.42;
function shade(hex, p) {
  const n = parseInt(hex.slice(1), 16), t = p < 0 ? 0 : 255, k = Math.abs(p);
  const c = [n >> 16, (n >> 8) & 255, n & 255].map((v) => Math.round(v + (t - v) * k));
  return `rgb(${c})`;
}
const EDGE = 'stroke="rgba(8,9,16,.55)" stroke-width="1.1" stroke-linejoin="round"';
// a box: front face at (x, y, w, h), top and right side faces shaded from the same colour
function box(x, y, w, h, d, c, { top = 0.2, side = -0.35, sideColor, frontColor } = {}) {
  const dx = d * KX, dy = d * KY;
  return `<path d="M${x} ${y} h${w} l${dx} ${-dy} h${-w} Z" fill="${shade(c, top)}" ${EDGE}/>
    <path d="M${x + w} ${y} l${dx} ${-dy} v${h} l${-dx} ${dy} Z" fill="${sideColor || shade(c, side)}" ${EDGE}/>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${frontColor || c}" ${EDGE}/>`;
}
// point on the top face of a box: u across the width, v into the depth (both 0..1)
const onTop = (x, y, w, d, u, v) => [x + u * w + v * d * KX, y - v * d * KY];
function topQuad(x, y, w, d, u0, v0, u1, v1) {
  return [onTop(x, y, w, d, u0, v0), onTop(x, y, w, d, u1, v0), onTop(x, y, w, d, u1, v1), onTop(x, y, w, d, u0, v1)]
    .map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ") + " Z";
}
const svg = (w, h, body) => `<svg viewBox="0 0 ${w} ${h}" overflow="visible">${body}</svg>`;

// shared gradients
document.body.insertAdjacentHTML("afterbegin", `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
  <radialGradient id="fur" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#f6c98f"/><stop offset=".6" stop-color="${YEL}"/><stop offset="1" stop-color="#b9813c"/></radialGradient>
  <linearGradient id="cyl" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".28" stop-color="#fff" stop-opacity=".35"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".4"/></linearGradient>
  <radialGradient id="dome" cx=".35" cy=".3" r=".75"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".35"/></radialGradient>
  <linearGradient id="glare" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".1"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/></linearGradient>
  <linearGradient id="leaf" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#c3e88d"/><stop offset="1" stop-color="#5f8a3a"/></linearGradient>
  <radialGradient id="floor" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#000" stop-opacity=".45"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
</defs></svg>`);

// ---------- objects ----------
const CODE = `<g stroke-width="4" stroke-linecap="round"><path d="M28 36h28" stroke="${PINK}"/><path d="M62 36h50" stroke="${CYAN}"/><path d="M40 50h42" stroke="${YEL}"/><path d="M40 64h66" stroke="${GREEN}"/><path d="M52 78h34" stroke="${PURPLE}"/><path d="M40 92h56" stroke="${CYAN}"/><path d="M28 106h22" stroke="${PINK}"/></g>
  <rect x="56" y="100" width="7" height="11" fill="${INK}" class="cursor-blink"/>
  <g stroke="#2a2e45" stroke-width="4" stroke-linecap="round"><path d="M136 36h44M136 50h30M136 64h40"/></g>`;
const DASH = `<circle cx="64" cy="76" r="36" fill="#1f2335" stroke="#3b4261"/>
  <g fill="${INK}" opacity=".5">${Array.from({ length: 40 }, (_, i) => { const a = i * 2.4, r = 6 + (i % 7) * 4.4; return `<circle cx="${(64 + Math.cos(a) * r).toFixed(1)}" cy="${(76 + Math.sin(a) * r * 0.9).toFixed(1)}" r="1.2"/>`; }).join("")}</g>
  <path d="M70 84 Q60 50 40 58 M70 84 Q90 50 88 62" fill="none" stroke="${PINK}" stroke-width="1.6"/><circle cx="70" cy="84" r="3" fill="${GREEN}" class="ping"/>
  <g fill="${CYAN}"><rect x="118" y="86" width="9" height="20"/><rect x="131" y="74" width="9" height="32"/><rect x="144" y="80" width="9" height="26"/><rect x="157" y="60" width="9" height="46" fill="${GREEN}"/><rect x="170" y="68" width="9" height="38"/></g>
  <text x="118" y="46" font-family="JetBrains Mono, monospace" font-size="10" fill="${INK}" opacity=".6">uptime</text><text x="118" y="62" font-family="JetBrains Mono, monospace" font-weight="700" font-size="14" fill="${GREEN}">99.9%</text>`;
function monitor(screen) {
  return svg(220, 200, `
    ${box(64, 186, 90, 7, 44, "#414868")}
    ${box(103, 128, 14, 50, 14, "#565f89")}
    ${box(8, 12, 200, 124, 14, "#1f2335", { top: 0.25, side: -0.3 })}
    <rect x="16" y="20" width="184" height="108" rx="2" fill="#13141c"/>
    <g transform="translate(16 20) scale(.92 .9)">${screen}</g>
    <path d="M16 20 h120 l-60 108 h-60 Z" fill="url(#glare)"/>
    <circle cx="108" cy="132" r="1.6" fill="${GREEN}"/>`);
}
const KEYS = (() => {
  let s = "";
  for (let r = 0; r < 4; r++) for (let c = 0; c < 13; c++) {
    const u0 = 0.03 + c * 0.0735, v0 = 0.12 + r * 0.2;
    s += `<path d="${topQuad(4, 26, 196, 52, u0, v0, u0 + 0.06, v0 + 0.15)}" fill="#3b4261" stroke="rgba(0,0,0,.35)" stroke-width=".6"/>`;
  }
  return s + `<path d="${topQuad(4, 26, 196, 52, 0.25, 0.86, 0.7, 0.96)}" fill="#3b4261"/>`;
})();
function cylinder(x, y, w, h, c) {
  const rx = w / 2, ry = w * 0.2;
  return `<path d="M${x} ${y} v${h} a${rx} ${ry} 0 0 0 ${w} 0 v${-h} Z" fill="${c}" ${EDGE}/>
    <path d="M${x} ${y} v${h} a${rx} ${ry} 0 0 0 ${w} 0 v${-h} Z" fill="url(#cyl)"/>
    <ellipse cx="${x + rx}" cy="${y}" rx="${rx}" ry="${ry}" fill="${shade(c, 0.25)}" ${EDGE}/>`;
}
function rubik() {
  const C = [PINK, YEL, GREEN, CYAN, PURPLE, "#e8eaf4"], S = 13, D = 39;
  let s = "";
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
    s += `<rect x="${4 + j * S}" y="${24 + i * S}" width="${S}" height="${S}" rx="2" fill="${C[(i * 3 + j * 2) % 6]}" ${EDGE}/>`;
    s += `<path d="${topQuad(4, 24, D, D, j / 3, i / 3, (j + 1) / 3, (i + 1) / 3)}" fill="${shade(C[(i + j * 4 + 1) % 6], 0.25)}" ${EDGE}/>`;
    const x = 4 + D, y = 24, dx = D * KX, dy = D * KY;
    const p = (a, b) => `${(x + a * dx).toFixed(1)} ${(y - a * dy + b * S * 3).toFixed(1)}`;
    s += `<path d="M${p(j / 3, i / 3)} L${p((j + 1) / 3, i / 3)} L${p((j + 1) / 3, (i + 1) / 3)} L${p(j / 3, (i + 1) / 3)} Z" fill="${shade(C[(i * 2 + j + 3) % 6], -0.3)}" ${EDGE}/>`;
  }
  return svg(66, 66, s);
}

const OBJECTS = [
  { id: "plant", x: 684, y: 188, w: 62, svg: svg(62, 112, `
    <path d="M31 58 Q8 48 4 18 Q26 30 31 58 Z" fill="url(#leaf)"/><path d="M31 58 Q54 48 58 18 Q36 30 31 58 Z" fill="url(#leaf)"/><path d="M31 58 Q20 26 31 0 Q42 26 31 58 Z" fill="url(#leaf)"/>
    ${cylinder(10, 58, 42, 40, PURPLE)}
    <circle cx="24" cy="76" r="2" fill="#1a1b26"/><circle cx="38" cy="76" r="2" fill="#1a1b26"/><path d="M26 83 q5 4 10 0" fill="none" stroke="#1a1b26" stroke-width="1.8" stroke-linecap="round"/>`) },
  { id: "cube", x: 600, y: 232, w: 66, svg: rubik() },
  { id: "monitor-left", x: 126, y: 122, w: 220, svg: monitor(CODE) },
  { id: "monitor-right", x: 348, y: 122, w: 220, svg: monitor(DASH) },
  { id: "books", x: 32, y: 274, w: 150, svg: svg(150, 82, `
    ${box(4, 60, 124, 18, 58, CYAN, { sideColor: "#e9e2cf" })}
    ${box(12, 42, 112, 18, 54, YEL, { sideColor: "#ddd5bf" })}
    ${box(2, 24, 122, 18, 56, PINK, { sideColor: "#efe8d6" })}
    <text x="63" y="37.5" text-anchor="middle" font-family="Afacad, sans-serif" font-weight="700" font-size="12" letter-spacing="1" fill="#1a1b26">SYS DESIGN</text>
    <text x="68" y="55.5" text-anchor="middle" font-family="Afacad, sans-serif" font-weight="700" font-size="11" letter-spacing="1" fill="#1a1b26">DDIA</text>`) },
  { id: "pencil", x: 52, y: 254, w: 120, r: -6, svg: svg(120, 22, `
    <path d="M22 4 h84 v14 h-84 Z" fill="${YEL}" ${EDGE}/><path d="M22 4 h84 v4.5 h-84 Z" fill="${shade(YEL, 0.35)}"/><path d="M22 13.5 h84 v4.5 h-84 Z" fill="${shade(YEL, -0.25)}"/>
    <path d="M106 4 h5 v14 h-5 Z" fill="#a9b1d6" ${EDGE}/><path d="M111 4 h5 q3 0 3 7 q0 7 -3 7 h-5 Z" fill="${PINK}" ${EDGE}/>
    <path d="M22 4 L4 11 L22 18 Z" fill="#e6c9a0" ${EDGE}/><path d="M9 9 L4 11 L9 13 Z" fill="#1a1b26"/>`) },
  { id: "mug", x: 172, y: 280, w: 62, svg: svg(62, 74, `
    <g class="steam" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round" opacity=".6"><path d="M20 10 q-5 -6 0 -12 q5 -6 0 -12"/><path d="M32 12 q-5 -6 0 -12 q5 -6 0 -12"/></g>
    <path d="M44 32 q16 0 16 13 q0 13 -16 13" fill="none" stroke="${shade(PINK, -0.25)}" stroke-width="6" stroke-linecap="round"/>
    ${cylinder(4, 24, 40, 40, PINK)}
    <ellipse cx="24" cy="25" rx="16" ry="5.6" fill="#3b2a24"/>
    <text x="24" y="52" text-anchor="middle" font-family="JetBrains Mono, monospace" font-weight="700" font-size="12" fill="#1a1b26">&lt;/&gt;</text>`) },
  { id: "keyboard", x: 222, y: 318, w: 236, svg: svg(236, 40, `${box(4, 26, 196, 9, 52, "#24283b", { top: 0.12 })}${KEYS}`) },
  { id: "mouse", x: 444, y: 312, w: 66, svg: svg(66, 46, `
    ${box(2, 42, 42, 3, 36, "#2a2e45", { top: 0.06 })}
    <path d="M38 22 q4 -10 14 -14 q8 -3 12 -10" fill="none" stroke="#565f89" stroke-width="1.6" stroke-linecap="round"/>
    <g transform="translate(32 31) rotate(50)">
      <path d="M0 -14 C8 -14 10 -5 10 2 C10 11 6 15 0 15 C-6 15 -10 11 -10 2 C-10 -5 -8 -14 0 -14 Z" fill="#565f89" transform="translate(1.5 2.5)"/>
      <path d="M0 -14 C8 -14 10 -5 10 2 C10 11 6 15 0 15 C-6 15 -10 11 -10 2 C-10 -5 -8 -14 0 -14 Z" fill="#c0caf5" ${EDGE}/>
      <path d="M0 -14 C8 -14 10 -5 10 2 C10 11 6 15 0 15 C-6 15 -10 11 -10 2 C-10 -5 -8 -14 0 -14 Z" fill="url(#dome)"/>
      <path d="M0 -14 V-3 M-9.6 -2.5 Q0 1 9.6 -2.5" fill="none" stroke="rgba(10,11,18,.45)" stroke-width="1"/>
      <rect x="-1.6" y="-11" width="3.2" height="6" rx="1.6" fill="${CYAN}"/>
    </g>`) },
  { id: "phone", x: 512, y: 302, w: 96, svg: svg(96, 54, `
    ${box(4, 46, 44, 5, 92, "#1f2335", { top: 0.18 })}
    <path d="${topQuad(4, 46, 44, 92, 0.1, 0.06, 0.9, 0.94)}" fill="url(#phoneGrad)" opacity=".85"/>
    <path d="${topQuad(4, 46, 44, 92, 0.3, 0.7, 0.7, 0.76)}" fill="#fff" opacity=".7"/>`) },
  { id: "cat", x: 598, y: 262, w: 142, svg: `<svg viewBox="-10 -40 190 140" overflow="visible">
    <text class="pet-hint" x="150" y="-22" text-anchor="middle">pet me ♡</text>
    <g class="zzz"><text x="64" y="14">z</text><text x="78" y="0">z</text><text x="94" y="-16">Z</text></g>
    <text class="purr" x="98" y="-6">purrr…</text>
    <g class="cat-hearts" fill="${PINK}"><path d="M58 4 c-6 -5 -9 -9 -6 -12 c2 -2 5 -1 6 1 c1 -2 4 -3 6 -1 c3 3 0 7 -6 12 Z"/><path d="M84 -2 c-6 -5 -9 -9 -6 -12 c2 -2 5 -1 6 1 c1 -2 4 -3 6 -1 c3 3 0 7 -6 12 Z"/><path d="M110 6 c-6 -5 -9 -9 -6 -12 c2 -2 5 -1 6 1 c1 -2 4 -3 6 -1 c3 3 0 7 -6 12 Z"/></g>
    <g class="cat-breathe">
      <path d="M28 86 Q14 40 68 30 Q132 20 154 58 Q166 86 140 88 Z" fill="url(#fur)" ${EDGE}/>
      <path d="M96 30 q7 10 2 20 M116 33 q7 10 2 18 M134 42 q5 8 0 16" fill="none" stroke="#b9813c" stroke-width="3" stroke-linecap="round"/>
      <path d="M150 66 Q156 94 112 92 Q86 90 74 84" fill="none" stroke="#c98d45" stroke-width="10" stroke-linecap="round"/>
      <path d="M22 48 L24 22 L41 37 Z M51 37 L68 22 L70 48 Z" fill="#d99a4e" ${EDGE}/><path d="M26 40 L27 29 L35 36 Z M57 36 L65 29 L66 40 Z" fill="${PINK}" opacity=".6"/>
      <path d="M18 62 q0 -26 28 -27 q28 1 28 27 q0 23 -28 23 q-28 0 -28 -23 Z" fill="url(#fur)" ${EDGE}/>
      <g class="cat-sleep" fill="none" stroke="#1a1b26" stroke-width="2.2" stroke-linecap="round"><path d="M29 61 q5 4 10 0 M53 61 q5 4 10 0"/></g>
      <g class="cat-happy"><path d="M29 63 q5 -6 10 0 M53 63 q5 -6 10 0" fill="none" stroke="#1a1b26" stroke-width="2.2" stroke-linecap="round"/><ellipse cx="28" cy="70" rx="5" ry="3" fill="${PINK}" opacity=".7"/><ellipse cx="64" cy="70" rx="5" ry="3" fill="${PINK}" opacity=".7"/></g>
      <path d="M43 68 h6 l-3 3.5 Z" fill="${PINK}"/>
      <path d="M46 72 q-3 4 -6 2 M46 72 q3 4 6 2 M14 66 l-12 -2 M14 71 l-12 2 M78 66 l12 -2 M78 71 l12 2" fill="none" stroke="#1a1b26" stroke-width="1.3" stroke-linecap="round" opacity=".7"/>
    </g></svg>` },

  // tucked in the drawers: hidden until a drawer opens, then draggable like everything else
  { id: "duck", drawer: 0, x: 540, y: 368, w: 48, r: -4, svg: svg(48, 44, `
    <path d="M8 30 q-2 -12 9 -14 q-3 -13 10 -14 q12 0 12 12 q9 0 13 -5 q3 16 -5 26 q-7 8 -21 8 q-16 0 -18 -13 Z" fill="${YEL}" ${EDGE}/>
    <path d="M8 30 q-2 -12 9 -14 q-3 -13 10 -14 q12 0 12 12 q9 0 13 -5 q3 16 -5 26 q-7 8 -21 8 q-16 0 -18 -13 Z" fill="url(#dome)"/>
    <path d="M17 7 l-9 3 l9 3 Z" fill="${PINK}"/><circle cx="23" cy="8" r="2" fill="#1a1b26"/>`) },
  { id: "resume", drawer: 1, x: 508, y: 470, w: 104, svg: svg(104, 30, `
    <path d="${topQuad(4, 28, 80, 40, 0, 0, 1, 1)}" fill="#e8eaf4" ${EDGE}/>
    <text x="52" y="21" text-anchor="middle" font-family="Caveat, cursive" font-weight="700" font-size="15" fill="#1a1b26" transform="skewX(-20) translate(8 0)">résumé.pdf</text>`) },
];

// ---------- the desk: fixed furniture behind the objects ----------
const WOOD = "#7a5a44";
const DRAWERS = [
  { x: 482, y: 396, label: "debug kit" },
  { x: 482, y: 488, label: "top secret" },
];
const GRAIN = [[0.1, 0.3, 0.35], [0.45, 0.62, 0.55], [0.7, 0.92, 0.2], [0.05, 0.25, 0.8], [0.55, 0.8, 0.85]]
  .map(([a, b, v]) => { const p = onTop(30, 360, 640, 150, a, v), q = onTop(30, 360, 640, 150, b, v); return `M${p[0]} ${p[1]} L${q[0]} ${q[1]}`; }).join(" ");
const DESK_SVG = `<svg class="desk-svg" viewBox="0 0 ${STAGE_W} ${STAGE_H}" overflow="visible">
  <ellipse cx="400" cy="584" rx="380" ry="22" fill="url(#floor)"/>
  ${box(119, 321, 20, 250, 20, "#232637")}
  ${box(44, 384, 22, 196, 22, "#2a2e45")}
  ${box(470, 384, 190, 196, 130, "#2f334d", { side: -0.4 })}
  ${box(30, 360, 640, 24, 150, WOOD, { top: 0.12, side: -0.35 })}
  <path d="${GRAIN}" opacity=".18" stroke="#000" stroke-width="1.2" fill="none"/>
  <path d="M30 360 h640" stroke="#fff" stroke-opacity=".18" stroke-width="1.5"/>
  ${DRAWERS.map((d, i) => `<g class="drawer" data-d="${i}" tabindex="0" role="button" aria-label="Open the ${d.label} drawer">
    <g class="tray">
      <path d="M${d.x} ${d.y} h166 l-20 17 h-166 Z" fill="#101118" ${EDGE}/>
      <path d="M${d.x + 166} ${d.y} v84 l-20 17 v-84 Z" fill="#3b4261" ${EDGE}/>
    </g>
    <g class="front">
      <rect x="${d.x}" y="${d.y}" width="166" height="84" fill="#3b4261" ${EDGE}/>
      <path d="M${d.x} ${d.y} h166" stroke="#fff" stroke-opacity=".15" stroke-width="1.5"/>
      ${box(d.x + 58, d.y + 30, 50, 6, 8, "#a9b1d6", { top: 0.3 })}
      <text x="${d.x + 83}" y="${d.y + 64}" text-anchor="middle" font-family="Caveat, cursive" font-weight="700" font-size="18" fill="${INK}" opacity=".55">${d.label}</text>
    </g>
  </g>`).join("")}
</svg>`;

const stage = document.querySelector(".stage");
const wrap = document.querySelector(".stage-wrap");
let scale = 1, topZ = 20;
stage.insertAdjacentHTML("afterbegin", DESK_SVG);

OBJECTS.forEach((o, i) => {
  const el = document.createElement("div");
  el.className = "obj";
  el.dataset.id = o.id;
  el.innerHTML = o.svg;
  Object.assign(el.style, { left: o.x + "px", top: o.y + "px", width: o.w + "px", transform: `rotate(${o.r || 0}deg)`, zIndex: i + 1 });
  if (o.drawer !== undefined) el.hidden = true;
  stage.appendChild(el);
  o.el = el;
});
const byId = (id) => OBJECTS.find((o) => o.id === id);

function fit() {
  scale = wrap.clientWidth / STAGE_W;
  stage.style.transform = `scale(${scale})`;
  wrap.style.height = STAGE_H * scale + "px";
}
new ResizeObserver(fit).observe(wrap);
fit();

// ---------- drag (a press that barely moves counts as a tap) ----------
const TAPS = {
  cat: () => pet(),
  resume: () => window.open(SITE.resume, "_blank", "noopener"),
};
stage.addEventListener("pointerdown", (e) => {
  const el = e.target.closest(".obj");
  if (!el) return;
  e.preventDefault();
  el.setPointerCapture(e.pointerId);
  el.style.transition = "none";
  el.classList.add("dragging");
  el.style.zIndex = ++topZ;
  const sx = e.clientX, sy = e.clientY;
  const ox = parseFloat(el.style.left), oy = parseFloat(el.style.top);
  let moved = false;
  const move = (ev) => {
    if (Math.hypot(ev.clientX - sx, ev.clientY - sy) > 5) moved = true;
    el.style.left = ox + (ev.clientX - sx) / scale + "px";
    el.style.top = oy + (ev.clientY - sy) / scale + "px";
  };
  const up = () => {
    el.classList.remove("dragging");
    el.removeEventListener("pointermove", move);
    el.removeEventListener("pointerup", up);
    el.removeEventListener("pointercancel", up);
    const o = byId(el.dataset.id);
    if (moved) o.out = true; // taken out of its drawer, stays on the desk
    else TAPS[o.id]?.();
  };
  el.addEventListener("pointermove", move);
  el.addEventListener("pointerup", up);
  el.addEventListener("pointercancel", up);
});

// ---------- drawers ----------
const drawerEls = [...stage.querySelectorAll(".drawer")];
function setDrawer(i, open) {
  const d = drawerEls[i];
  d.classList.toggle("open", open);
  d.setAttribute("aria-label", `${open ? "Close" : "Open"} the ${DRAWERS[i].label} drawer`);
  OBJECTS.filter((o) => o.drawer === i && !o.out).forEach((o) => {
    if (open) {
      Object.assign(o.el.style, { transition: "none", left: o.x + "px", top: o.y + "px", zIndex: ++topZ });
      o.el.hidden = false;
      o.el.classList.remove("pop"); void o.el.offsetWidth; o.el.classList.add("pop");
    } else o.el.hidden = true;
  });
}
drawerEls.forEach((d, i) => {
  d.addEventListener("click", () => setDrawer(i, !d.classList.contains("open")));
  d.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setDrawer(i, !d.classList.contains("open")); }
  });
});

// ---------- the cat: sleeps until petted (tap it, or stroke it with the cursor) ----------
const cat = byId("cat").el;
let petTimer, stroke = 0, lastX = null, petted = 0;
function pet() {
  cat.classList.remove("petted"); void cat.offsetWidth; cat.classList.add("petted");
  clearTimeout(petTimer);
  petTimer = setTimeout(() => cat.classList.remove("petted"), 2800);
  if (++petted === 1) speak("The cat approves. ♡");
}
cat.addEventListener("pointermove", (e) => {
  if (e.buttons) return;
  if (lastX !== null) stroke += Math.abs(e.clientX - lastX);
  lastX = e.clientX;
  if (stroke > 160) { stroke = 0; pet(); }
});
cat.addEventListener("pointerleave", () => { lastX = null; stroke = 0; });

document.querySelector(".reset").addEventListener("click", () => {
  drawerEls.forEach((_, i) => setDrawer(i, false));
  OBJECTS.forEach((o, i) => {
    if (o.drawer !== undefined) { o.out = false; o.el.hidden = true; }
    o.el.style.transition = "left .7s cubic-bezier(.3,1.4,.5,1), top .7s cubic-bezier(.3,1.4,.5,1)";
    o.el.style.left = o.x + "px";
    o.el.style.top = o.y + "px";
    o.el.style.zIndex = i + 1;
  });
  topZ = 20;
});

// ---------- BYTE ----------
const LINES = [
  "Hi, I'm BYTE.",
  "Gaurav stepped out for a walk, but…",
  "you can move his stuff around. I won't tell. ▶",
  "Psst: the drawers open. And the cat likes pets.",
  "Scroll down to see his work.",
];
const say = document.querySelector(".say");
const dots = document.querySelector(".dots");
const count = document.querySelector(".count");
let step = 0, typer, auto;
dots.innerHTML = LINES.map((_, i) => `<button type="button" aria-label="line ${i + 1}"></button>`).join("");
function type(txt, done) {
  clearInterval(typer); clearTimeout(auto);
  let n = 0;
  typer = setInterval(() => {
    n++;
    say.innerHTML = txt.slice(0, n) + '<span class="caret"></span>';
    if (n >= txt.length) { clearInterval(typer); done?.(); }
  }, 38);
}
function speak(txt) { type(txt); }
function show(i) {
  step = i;
  [...dots.children].forEach((d, j) => d.classList.toggle("on", j === i));
  count.textContent = `${i + 1} of ${LINES.length}`;
  type(LINES[i], () => { if (i < LINES.length - 1) auto = setTimeout(() => show(i + 1), 2200); });
}
dots.addEventListener("click", (e) => {
  const i = [...dots.children].indexOf(e.target);
  if (i >= 0) show(i);
});
document.querySelector(".bubble").addEventListener("click", (e) => {
  if (!e.target.closest(".dots")) show((step + 1) % LINES.length);
});
setTimeout(() => show(0), 1100);
