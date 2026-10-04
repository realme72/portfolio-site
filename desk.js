// Interactive desk: draggable illustrated objects + chatty desk bot.
const STAGE_W = 1400, STAGE_H = 540;
// Doodle style: thin wobbly ink outline over a slightly offset colour blob,
// like a quick marker sketch coloured in a little outside the lines.
const INKD = "#c0caf5";
const L = `fill="none" stroke="${INKD}" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"`;
const T = `fill="none" stroke="${INKD}" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"`;
const blob = (d, c, dx = 5, dy = 5) => `<path d="${d}" fill="${c}" opacity=".9" transform="translate(${dx} ${dy})"/>`;
const ink = (d, extra = "") => `<path d="${d}" ${L} ${extra}/>`;
const doodle = (vb, body) => `<svg viewBox="${vb}" overflow="visible"><g filter="url(#sketch)">${body}</g></svg>`;

const OBJECTS = [
  { id: "bot", x: 150, y: 24, w: 92, r: -6, svg: doodle("0 0 150 150", `
    ${blob("M22 18 h106 q8 0 8 8 v72 q0 8 -8 8 h-106 q-8 0 -8 -8 v-72 q0 -8 8 -8 Z", PURPLE)}
    ${ink("M22 18 h106 q8 0 8 8 v72 q0 8 -8 8 h-106 q-8 0 -8 -8 v-72 q0 -8 8 -8 Z")}
    ${ink("M34 30 h82 v58 h-82 Z")}
    <g class="bot-eyes"><circle cx="58" cy="54" r="5" fill="${GREEN}"/><circle cx="92" cy="54" r="5" fill="${GREEN}"/></g>
    <path d="M64 70 q11 9 22 0" fill="none" stroke="${GREEN}" stroke-width="3" stroke-linecap="round"/>
    ${ink("M64 106 l-8 20 h38 l-8 -20 M44 128 h62")}
    ${ink("M75 18 v-12")}<circle cx="75" cy="5" r="4" fill="${PINK}"/>`) },

  { id: "books", x: 60, y: 250, w: 240, r: 0, svg: doodle("0 0 300 190", `
    ${blob("M20 130 h250 v40 h-250 Z", CYAN, 6, 6)}${ink("M20 130 h250 v40 h-250 Z")}${ink("M34 142 h200 M34 150 h170", 'stroke-width="1.4" opacity=".6"')}
    ${blob("M40 86 h220 v40 h-220 Z", YEL, -5, 6)}<g transform="rotate(-2 150 106)">${ink("M40 86 h220 v40 h-220 Z")}${ink("M58 98 h150", 'stroke-width="1.4" opacity=".6"')}${ink("M226 86 v46 l7 -6 l7 6 v-46")}</g>
    ${blob("M60 40 h190 v42 h-190 Z", PINK, 6, 5)}<g transform="rotate(-6 150 60)">${ink("M60 40 h190 v42 h-190 Z")}<text x="150" y="68" text-anchor="middle" font-family="Caveat, cursive" font-weight="700" font-size="22" fill="${INKD}">sys design</text></g>`) },

  { id: "mug", x: 380, y: 330, w: 92, r: 0, svg: doodle("0 0 140 170", `
    <g class="steam">${ink("M48 34 q-8 -10 0 -20 q8 -10 0 -20")}${ink("M72 38 q-8 -10 0 -20 q8 -10 0 -20")}</g>
    ${blob("M24 54 h82 v76 q0 20 -20 20 h-42 q-20 0 -20 -20 Z", PINK)}
    ${ink("M24 54 h82 v76 q0 20 -20 20 h-42 q-20 0 -20 -20 Z")}${ink("M106 76 q26 0 26 22 q0 22 -26 22")}
    ${ink("M24 54 q41 12 82 0")}
    <text x="65" y="114" text-anchor="middle" font-family="JetBrains Mono, monospace" font-weight="700" font-size="18" fill="${INKD}">&lt;/&gt;</text>`) },

  { id: "pen", x: 530, y: 250, w: 150, r: 16, svg: doodle("0 0 240 50", `
    ${blob("M30 14 h170 q14 0 14 11 q0 11 -14 11 h-170 Z", CYAN, 4, 4)}
    ${ink("M30 14 h170 q14 0 14 11 q0 11 -14 11 h-170 L8 25 Z")}${ink("M30 14 v22 M150 14 v22")}${ink("M160 8 h50 v8", 'stroke-width="2"')}`) },

  { id: "sticky", x: 610, y: 320, w: 118, r: -4, svg: doodle("0 0 160 150", `
    ${blob("M12 22 h96 v96 h-96 Z", CYAN, 6, 6)}<g transform="rotate(-8 60 70)">${ink("M12 22 h96 v96 h-96 Z")}${ink("M24 46 h56 M24 62 h66 M24 78 h44", 'stroke-width="1.6"')}</g>
    ${blob("M54 10 h96 v96 h-96 Z", YEL, 5, 6)}<g transform="rotate(6 100 58)">${ink("M54 10 h96 v96 h-96 Z")}${ink("M66 34 h58 M66 50 h70 M66 66 h40", 'stroke-width="1.6"')}${ink("M68 84 l7 7 l14 -16")}</g>`) },

  { id: "cube", x: 800, y: 370, w: 86, r: 0, svg: doodle("0 0 120 130", `
    ${blob("M60 8 L110 34 V94 L60 122 L10 94 V34 Z", PURPLE, 5, 5)}
    ${ink("M60 8 L110 34 V94 L60 122 L10 94 V34 Z M10 34 L60 60 L110 34 M60 60 V122")}
    ${ink("M27 43 V103 M43 51 V112 M77 51 V112 M93 43 V103 M10 54 L60 80 L110 54 M10 74 L60 100 L110 74 M27 25 L77 51 M43 17 L93 43", 'stroke-width="1.4" opacity=".75"')}`) },

  { id: "laptop", x: 900, y: 200, w: 240, r: -3, svg: doodle("0 0 300 210", `
    ${blob("M50 12 h200 q8 0 8 8 v128 h-216 v-128 q0 -8 8 -8 Z", "#2a2e45", 0, 0)}
    ${ink("M50 12 h200 q8 0 8 8 v128 h-216 v-128 q0 -8 8 -8 Z")}${ink("M58 24 h184 v112 h-184 Z", 'stroke-width="1.6"')}
    <g stroke-width="4" stroke-linecap="round"><path d="M72 42h30" stroke="${PINK}"/><path d="M108 42h52" stroke="${CYAN}"/><path d="M84 58h44" stroke="${YEL}"/><path d="M84 74h70" stroke="${GREEN}"/><path d="M96 90h36" stroke="${PURPLE}"/><path d="M72 106h22" stroke="${PINK}"/></g>
    <rect x="100" y="100" width="7" height="11" fill="${INKD}" class="cursor-blink"/>
    ${blob("M24 150 h252 l20 34 q2 8 -8 8 h-276 q-10 0 -8 -8 Z", PINK, 5, 5)}
    ${ink("M24 150 h252 l20 34 q2 8 -8 8 h-276 q-10 0 -8 -8 Z")}${ink("M120 176 h60", 'stroke-width="2"')}`) },

  { id: "phone", x: 1160, y: 340, w: 58, r: -14, svg: doodle("0 0 80 150", `
    ${blob("M14 6 h52 q10 0 10 10 v118 q0 10 -10 10 h-52 q-10 0 -10 -10 v-118 q0 -10 10 -10 Z", GREEN, 5, 5)}
    ${ink("M14 6 h52 q10 0 10 10 v118 q0 10 -10 10 h-52 q-10 0 -10 -10 v-118 q0 -10 10 -10 Z")}${ink("M32 14 h16")}
    <text x="40" y="66" text-anchor="middle" font-family="Caveat, cursive" font-weight="700" font-size="24" fill="${INKD}">9:41</text>
    ${ink("M20 84 h40 M20 98 h30", 'stroke-width="2"')}`) },

  { id: "headphones", x: 1240, y: 230, w: 120, r: 10, svg: doodle("0 0 170 160", `
    ${ink("M28 96 Q28 14 85 14 Q142 14 142 96", 'stroke-width="5"')}
    ${blob("M14 86 h34 v56 h-34 Z", YEL, 4, 4)}${blob("M122 86 h34 v56 h-34 Z", YEL, 4, 4)}
    ${ink("M18 84 q-8 0 -8 10 v40 q0 10 10 10 h22 q8 0 8 -10 v-40 q0 -10 -8 -10 Z")}
    ${ink("M130 84 q-8 0 -8 10 v40 q0 10 8 10 h22 q10 0 10 -10 v-40 q0 -10 -8 -10 Z")}`) },

  { id: "plant", x: 1260, y: 30, w: 86, r: 0, svg: doodle("0 0 120 170", `
    ${blob("M60 92 Q24 76 18 34 Q50 52 60 92 Z M60 92 Q96 76 102 34 Q70 52 60 92 Z M60 92 Q46 44 60 8 Q74 44 60 92 Z", GREEN, 3, 3)}
    ${ink("M60 92 Q24 76 18 34 Q50 52 60 92 Z M60 92 Q96 76 102 34 Q70 52 60 92 Z M60 92 Q46 44 60 8 Q74 44 60 92 Z")}
    ${blob("M24 92 h72 l-10 70 h-52 Z", PINK, 5, 4)}${ink("M24 92 h72 l-10 70 h-52 Z")}
    <circle cx="48" cy="120" r="2.6" fill="${INKD}"/><circle cx="72" cy="120" r="2.6" fill="${INKD}"/>${ink("M50 130 q10 8 20 0", 'stroke-width="2"')}`) },

  // little scribbles to make the desk feel drawn
  { id: "spark1", x: 470, y: 130, w: 46, r: 0, svg: doodle("0 0 60 60", `${ink("M30 4 L34 24 L54 30 L34 36 L30 56 L26 36 L6 30 L26 24 Z")}${blob("M30 12 L32 26 L46 30 L32 34 L30 48 L28 34 L14 30 L28 26 Z", YEL, 0, 0)}`) },
  { id: "spark2", x: 1120, y: 110, w: 34, r: 12, svg: doodle("0 0 60 60", `${ink("M30 4 L34 24 L54 30 L34 36 L30 56 L26 36 L6 30 L26 24 Z")}${blob("M30 12 L32 26 L46 30 L32 34 L30 48 L28 34 L14 30 L28 26 Z", PINK, 0, 0)}`) },
  { id: "squiggle", x: 760, y: 200, w: 90, r: -8, svg: doodle("0 0 120 40", ink("M6 24 q12 -20 24 0 t24 0 t24 0 t24 0 t24 0", 'stroke="#7dcfff" stroke-width="3.5"')) },
  { id: "heart", x: 330, y: 200, w: 40, r: -12, svg: doodle("0 0 60 56", `${blob("M30 50 C10 36 4 24 10 14 C16 4 28 8 30 18 C32 8 44 4 50 14 C56 24 50 36 30 50 Z", PINK, 0, 0)}${ink("M30 50 C10 36 4 24 10 14 C16 4 28 8 30 18 C32 8 44 4 50 14 C56 24 50 36 30 50 Z")}`) },
];

const stage = document.querySelector(".stage");
const wrap = document.querySelector(".stage-wrap");
let scale = 1, topZ = 10;

OBJECTS.forEach((o, i) => {
  const el = document.createElement("div");
  el.className = "obj";
  el.dataset.id = o.id;
  el.innerHTML = o.svg;
  Object.assign(el.style, { left: o.x + "px", top: o.y + "px", width: o.w + "px", transform: `rotate(${o.r}deg)`, zIndex: i + 1 });
  stage.appendChild(el);
  o.el = el;
});

function fit() {
  scale = wrap.clientWidth / STAGE_W;
  stage.style.transform = `scale(${scale})`;
  wrap.style.height = STAGE_H * scale + "px";
}
addEventListener("resize", fit);
fit();

// drag
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
  const move = (ev) => {
    el.style.left = ox + (ev.clientX - sx) / scale + "px";
    el.style.top = oy + (ev.clientY - sy) / scale + "px";
  };
  const up = () => {
    el.classList.remove("dragging");
    el.removeEventListener("pointermove", move);
    el.removeEventListener("pointerup", up);
    el.removeEventListener("pointercancel", up);
  };
  el.addEventListener("pointermove", move);
  el.addEventListener("pointerup", up);
  el.addEventListener("pointercancel", up);
});

document.querySelector(".reset").addEventListener("click", () => {
  OBJECTS.forEach((o, i) => {
    o.el.style.transition = "left .7s cubic-bezier(.3,1.4,.5,1), top .7s cubic-bezier(.3,1.4,.5,1)";
    o.el.style.left = o.x + "px";
    o.el.style.top = o.y + "px";
    o.el.style.zIndex = i + 1;
  });
  topZ = 10;
});

// bot speech bubble
const LINES = [
  "Hi, I'm BYTE.",
  "Gaurav's off shipping code, but…",
  "if you move his stuff around, I won't tell. ▶",
  "Scroll down to see his work.",
];
const say = document.querySelector(".say");
const dots = document.querySelector(".dots");
const count = document.querySelector(".count");
let step = 0, typer, auto;
dots.innerHTML = LINES.map((_, i) => `<button type="button" aria-label="line ${i + 1}"></button>`).join("");
function show(i) {
  step = i;
  clearInterval(typer); clearTimeout(auto);
  [...dots.children].forEach((d, j) => d.classList.toggle("on", j === i));
  count.textContent = `${i + 1} of ${LINES.length}`;
  let n = 0;
  const txt = LINES[i];
  typer = setInterval(() => {
    n++;
    say.innerHTML = txt.slice(0, n) + '<span class="caret"></span>';
    if (n >= txt.length) {
      clearInterval(typer);
      if (i < LINES.length - 1) auto = setTimeout(() => show(i + 1), 2200);
    }
  }, 38);
}
dots.addEventListener("click", (e) => {
  const i = [...dots.children].indexOf(e.target);
  if (i >= 0) show(i);
});
document.querySelector(".bubble").addEventListener("click", (e) => {
  if (!e.target.closest(".dots")) show((step + 1) % LINES.length);
});
setTimeout(() => show(0), 1100);
