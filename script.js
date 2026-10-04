// ---------- config: edit your details here ----------
const SITE = {
  email: "gauravbharti586@gmail.com",
  linkedin: "https://www.linkedin.com/in/gaurav-bharti-6b3b4717b/",
  github: "https://github.com/realme72",
  resume: "assets/Gaurav_Bharti_Resume.pdf",
  careerStart: new Date(2022, 6, 1), // Jul 2022, first job: drives the "N years" text
};

const INK = "#c0caf5", DARK = "#1a1b26", PINK = "#f7768e", YEL = "#e0af68", CYAN = "#7dcfff", GREEN = "#9ece6a", PURPLE = "#bb9af7";

// ---------- round badge logos ----------
const BADGE_ICONS = {
  cursor: `<path d="M44 34 L78 52 L63 56 L72 72 L65 76 L56 60 L46 70 Z" fill="${DARK}" stroke="${DARK}" stroke-width="4" stroke-linejoin="round"/>`,
  bolt: `<path d="M64 30 L44 62 H58 L52 90 L76 54 H62 L68 30 Z" fill="${DARK}" stroke="${DARK}" stroke-width="3" stroke-linejoin="round"/><circle cx="60" cy="60" r="5" fill="${YEL}"/>`,
  code: `<rect x="36" y="40" width="48" height="38" rx="6" fill="${DARK}" stroke="${DARK}" stroke-width="4"/><path d="M50 52 L43 59 L50 66 M70 52 L77 59 L70 66 M63 50 L57 68" fill="none" stroke="${GREEN}" stroke-width="3.5" stroke-linecap="round"/>`,
};
let badgeId = 0;
function badgeSVG(text, fill, icon) {
  const id = "bp" + badgeId++;
  return `<svg class="badge" viewBox="0 0 120 120" aria-hidden="true">
    <defs><path id="${id}" d="M60 60 m-37 0 a37 37 0 1 1 74 0 a37 37 0 1 1 -74 0"/></defs>
    <circle cx="60" cy="60" r="56" fill="${fill}" stroke="${INK}" stroke-width="6"/>
    <text font-family="Afacad, sans-serif" font-weight="700" font-size="20" letter-spacing="3" text-anchor="middle" fill="${DARK}">
      <textPath href="#${id}" startOffset="25%">${text}</textPath></text>
    ${BADGE_ICONS[icon]}
  </svg>`;
}
// contact-section emotes: three doodled characters (ghost, star, cat-blob).
// Each has a normal face and a "wow" face shown briefly when clicked.
const EMOTES = {
  ghost: {
    body: "M30 104 V58 C30 22 90 22 90 58 V104 L80 96 L70 104 L60 96 L50 104 L40 96 Z",
    face: `<path d="M44 58 q4 -5 8 0" fill="none" stroke="${DARK}" stroke-width="3" stroke-linecap="round"/><circle cx="72" cy="58" r="4" fill="${DARK}"/><circle cx="73.5" cy="56.5" r="1.3" fill="#fff"/>
      <ellipse cx="42" cy="68" rx="5" ry="3" fill="${PINK}" opacity=".7"/><ellipse cx="78" cy="68" rx="5" ry="3" fill="${PINK}" opacity=".7"/>
      <path d="M52 70 q8 8 16 0" fill="none" stroke="${DARK}" stroke-width="3" stroke-linecap="round"/><path d="M60 74 q2 6 6 2" fill="${PINK}" stroke="${DARK}" stroke-width="1.5"/>`,
    extra: `<path d="M94 34 l4 -8 M100 42 l8 -3 M98 50 l7 2" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>`,
  },
  star: {
    body: "M60 14 C64 14 66 34 70 38 C74 42 96 40 98 44 C100 48 82 60 81 66 C80 72 90 92 87 96 C84 99 66 86 60 86 C54 86 36 99 33 96 C30 92 40 72 39 66 C38 60 20 48 22 44 C24 40 46 42 50 38 C54 34 56 14 60 14 Z",
    face: `<ellipse cx="50" cy="56" rx="4.5" ry="6" fill="${DARK}"/><ellipse cx="70" cy="56" rx="4.5" ry="6" fill="${DARK}"/><circle cx="51.5" cy="53.5" r="1.8" fill="#fff"/><circle cx="71.5" cy="53.5" r="1.8" fill="#fff"/>
      <path d="M50 66 Q60 80 70 66 Z" fill="${DARK}"/><path d="M54 72 q6 4 12 0" fill="${PINK}"/>`,
    extra: `<path d="M98 16 L90 30 H97 L92 42 L104 26 H97 L101 16 Z" fill="${YEL}" stroke="${DARK}" stroke-width="2" stroke-linejoin="round"/>`,
  },
  cat: {
    body: "M26 98 C20 80 22 50 30 40 L28 16 L46 30 C54 27 66 27 74 30 L92 16 L90 40 C98 50 100 80 94 98 C80 106 40 106 26 98 Z",
    face: `<path d="M40 56 q6 -7 12 0M68 56 q6 -7 12 0" fill="none" stroke="${DARK}" stroke-width="3" stroke-linecap="round"/>
      <path d="M57 64 h6 l-3 3 z" fill="${PINK}"/><path d="M60 67 q-3 5 -7 2M60 67 q3 5 7 2" fill="none" stroke="${DARK}" stroke-width="2" stroke-linecap="round"/>
      <path d="M36 66 l-12 -2M36 70 l-12 2M84 66 l12 -2M84 70 l12 2" stroke="${DARK}" stroke-width="1.5" stroke-linecap="round"/>
      <text x="60" y="92" text-anchor="middle" font-family="JetBrains Mono, monospace" font-weight="700" font-size="12" fill="${DARK}">&lt;/&gt;</text>`,
    extra: `<path d="M33 22 l-2 -6M87 22 l2 -6" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>`,
  },
};
const WOW = `<g class="face-wow"><path d="M44 52 l6 6 l-6 6 M76 52 l-6 6 l6 6" fill="none" stroke="${DARK}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><ellipse cx="60" cy="74" rx="6" ry="8" fill="${DARK}"/></g>`;
function emoteSVG(text, fill, kind) {
  const e = EMOTES[kind];
  return `<svg class="badge emote" viewBox="0 0 120 130" aria-hidden="true">
    <path d="${e.body}" fill="${fill}"/>
    <path d="${e.body}" fill="none" stroke="${INK}" stroke-width="3.2" stroke-linejoin="round"/>
    <path d="${e.body}" fill="none" stroke="${INK}" stroke-width="1.3" opacity=".6" stroke-dasharray="50 8 80 6" transform="translate(2 -1.5) rotate(1.5 60 60)"/>
    <g class="face-normal">${e.face}</g>${WOW}
    ${e.extra}
    <text x="60" y="126" text-anchor="middle" font-family="Caveat, cursive" font-weight="700" font-size="20" fill="${INK}">${text.toLowerCase()}</text>
  </svg>`;
}
const BADGES = [["GAURAV", PURPLE, "cursor", "ghost"], ["BHARTI", CYAN, "bolt", "star"], ["BUILDS", GREEN, "code", "cat"]];
document.querySelectorAll("[data-badges]").forEach((el) => {
  const big = el.hasAttribute("data-big");
  el.innerHTML = BADGES.map(([t, f, i, emote]) =>
    big ? `<button type="button" aria-label="Surprise! (${t.toLowerCase()})">${emoteSVG(t, f, emote)}</button>` : badgeSVG(t, f, i)
  ).join("");
});

// tiny ghost mascot in the header logo
document.querySelectorAll("[data-mascot]").forEach((el) => {
  const e = EMOTES.ghost;
  el.innerHTML = `<svg viewBox="22 18 76 90" width="30" height="36"><path d="${e.body}" fill="${PURPLE}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>${e.face}</svg>`;
});

// ---------- confetti on big badges ----------
document.querySelectorAll("[data-big] button").forEach((btn) => {
  btn.addEventListener("click", () => {
    btn.classList.add("wow");
    clearTimeout(btn._wow);
    btn._wow = setTimeout(() => btn.classList.remove("wow"), 1100);
    const colors = [PINK, YEL, CYAN, GREEN, PURPLE];
    for (let i = 0; i < 34; i++) {
      const c = document.createElement("span");
      c.className = "confetti";
      const size = 6 + Math.random() * 10;
      const ang = Math.random() * Math.PI * 2, dist = 80 + Math.random() * 120;
      Object.assign(c.style, {
        width: size + "px", height: size + "px",
        left: "50%", top: "50%",
        background: colors[i % colors.length],
      });
      c.style.setProperty("--dx", Math.cos(ang) * dist + "px");
      c.style.setProperty("--dy", Math.sin(ang) * dist + "px");
      btn.appendChild(c);
      setTimeout(() => c.remove(), 1200);
    }
  });
});

// ---------- contact details + copy ----------
document.querySelectorAll("[data-email]").forEach((a) => { a.textContent = SITE.email; a.href = "mailto:" + SITE.email; });
document.querySelectorAll("[data-mailto]").forEach((a) => (a.href = "mailto:" + SITE.email));
document.querySelectorAll("[data-linkedin]").forEach((a) => (a.href = SITE.linkedin));
document.querySelectorAll("[data-github]").forEach((a) => (a.href = SITE.github));
document.querySelectorAll("[data-resume]").forEach((a) => (a.href = SITE.resume));
document.querySelectorAll("[data-copy]").forEach((b) => {
  b.addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(SITE.email); } catch {}
    const t = b.textContent; b.textContent = "Copied! ✓";
    setTimeout(() => (b.textContent = t), 1500);
  });
});

// years of experience, grows automatically
const years = Math.floor((Date.now() - SITE.careerStart) / (365.25 * 864e5));
document.querySelectorAll("[data-years]").forEach((el) => (el.textContent = years));

// draw doodles when they scroll into view
const doodles = document.querySelectorAll(".doodle");
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add("drawn"); io.unobserve(e.target); }
  }), { threshold: 0.6 });
  doodles.forEach((d) => io.observe(d));
} else doodles.forEach((d) => d.classList.add("drawn"));

// work cards: glow follows the cursor
document.querySelectorAll(".card").forEach((c) => c.addEventListener("pointermove", (e) => {
  const r = c.getBoundingClientRect();
  c.style.setProperty("--mx", `${e.clientX - r.left}px`);
  c.style.setProperty("--my", `${e.clientY - r.top}px`);
}));

// about scene: gentle 3D tilt toward the cursor
const tiltWrap = document.querySelector(".boy-wrap");
const tiltEl = document.querySelector(".scene");
if (tiltWrap && tiltEl && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
  tiltEl.style.transition = "transform .4s cubic-bezier(.2,.8,.2,1)";
  tiltWrap.addEventListener("pointermove", (e) => {
    const r = tiltEl.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
    tiltEl.style.transform = `perspective(900px) rotateY(${(x * 7).toFixed(2)}deg) rotateX(${(-y * 7).toFixed(2)}deg) scale(1.01)`;
  });
  tiltWrap.addEventListener("pointerleave", () => (tiltEl.style.transform = ""));
}

// ---------- loader ----------
window.addEventListener("load", () => {
  const l = document.querySelector(".loader");
  if (l) setTimeout(() => l.classList.add("done"), 700);
});
