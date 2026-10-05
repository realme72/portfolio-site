// ---------- work: dotted globe with threads from where I worked to where the team was ----------
// The original bento cards are still in the page; the globe/grid toggle switches between them.
(() => {
  const section = document.querySelector(".projects");
  const view = section && section.querySelector(".globe-view");
  if (!view) return;

  const css = getComputedStyle(document.documentElement);
  const color = (v) => css.getPropertyValue(v).trim();
  const C = { ink: color("--ink"), muted: color("--muted"), green: color("--green"), pink: color("--pink"), yellow: color("--yellow"), cyan: color("--cyan"), blue: color("--blue") };
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- data ----------
  const PLACES = {
    blr: { name: "Bengaluru", at: [77.59, 12.97] },
    ggn: { name: "Gurgaon", at: [77.03, 28.46] },
    eu: { name: "Europe", at: [-0.13, 51.5] },
    ca: { name: "Canada", at: [-79.38, 43.65] },
    sg: { name: "Singapore", at: [103.82, 1.35] },
  };
  // spread of points used for "across India" threads (unlabelled)
  const INDIA = [[72.88, 19.08], [77.21, 28.61], [78.49, 17.39], [80.27, 13.08], [88.36, 22.57], [73.86, 18.52], [72.57, 23.02], [77.59, 12.97], [91.74, 26.14], [76.27, 9.93]];

  const JOBS = [
    {
      id: "wizcommerce", name: "Wizcommerce", role: "SDE II", when: "Jun 2025 – Present", years: "2025–now", color: C.green, base: "blr", india: true,
      team: "across India",
      points: [
        "Payments platform moving <b>$10M+/year</b>: Revolut Pay end to end, idempotent webhooks, <b>10+ gateways</b> behind one interface.",
        "Multi-tenant order IDs for <b>30,000+ orders/day</b> across <b>400+ tenants</b>, zero collisions.",
        "Customizable payment terms service: <b>10,000+ transactions/day</b> with <b>99.9% accuracy</b>.",
        "Multi-cart system that removed a single-cart bottleneck, so sales reps run parallel orders across businesses.",
      ],
      tags: ["payments", "state machines", "multi-tenancy"],
    },
    {
      id: "morgan-stanley", name: "Morgan Stanley", via: "via Teamware Solutions", role: "Software Engineer", when: "Apr 2024 – May 2025", years: "2024–25", color: C.pink, base: "blr",
      links: ["eu", "ca", "sg"], team: "Europe · Canada · Singapore",
      points: [
        "Real-time vulnerability alerts securing <b>100+ enterprise apps</b>, with time-to-notification down <b>20%</b>.",
        "Dedup engine with composite-key fingerprinting: idempotent processing, <b>100%</b> of redundant alerts gone.",
        "One error-handling middleware across <b>250+ REST APIs</b>; debugging time down <b>~30%</b>.",
      ],
      tags: ["python", "alerting", "middleware"],
    },
    {
      id: "tata-1mg", name: "Tata 1mg", role: "SDE I", when: "Jul 2022 – Mar 2024", years: "2022–24", color: C.yellow, base: "ggn", india: true,
      team: "across India",
      points: [
        "Checkout for <b>1M+ orders/month</b>: inventory, pricing and SLA checks run in parallel, not one by one.",
        "Built the SMS notification service 0→1: order updates to <b>millions of users</b>.",
        "Integrated partner APIs (<b>eKincare, MediBuddy</b>) with webhook handlers and idempotent event processing.",
      ],
      tags: ["asyncio", "performance", "system design"],
    },
    {
      id: "resumesmith", name: "ResumeSmith", role: "Where my ideas come to life", when: "live", years: "idea → live", color: C.blue, base: "blr", india: true, solo: true,
      team: "users across India", link: "https://resumesmith.in",
      points: [
        "A free resume builder with real-time preview and <b>PDF/DOCX export</b>.",
        "Designed, built and deployed <b>solo</b>, from idea to production.",
      ],
      tags: ["full stack", "shipped"],
    },
  ];

  // ---------- sphere maths (unit vectors, orthographic view) ----------
  const RAD = Math.PI / 180;
  const vec = ([lon, lat]) => { const l = lon * RAD, p = lat * RAD; return [Math.cos(p) * Math.cos(l), Math.cos(p) * Math.sin(l), Math.sin(p)]; };
  const angle = (a, b) => Math.acos(Math.max(-1, Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2])));
  function slerp(a, b, t, w) {
    const s = Math.sin(w), k0 = Math.sin((1 - t) * w) / s, k1 = Math.sin(t * w) / s;
    return [a[0] * k0 + b[0] * k1, a[1] * k0 + b[1] * k1, a[2] * k0 + b[2] * k1];
  }
  // a thread: great-circle points lifted off the surface, higher for longer hops
  function thread(from, to, lift = 1) {
    const a = vec(from), b = vec(to), w = angle(a, b), n = 48, hMax = (0.05 + 0.34 * w / Math.PI) * lift, pts = [];
    for (let i = 0; i <= n; i++) {
      const t = i / n, p = slerp(a, b, t, w), h = 1 + hMax * Math.sin(Math.PI * t);
      pts.push([p[0] * h, p[1] * h, p[2] * h]);
    }
    return pts;
  }
  const cam = { lon: 60, lat: 18, zoom: 1 }; // view centre
  let cl, sl, cp, sp;
  function setCam() { cl = Math.cos(cam.lon * RAD); sl = Math.sin(cam.lon * RAD); cp = Math.cos(cam.lat * RAD); sp = Math.sin(cam.lat * RAD); }
  // -> [x, y (up), z (towards viewer)], same length as the input
  function project(v) {
    const c = v[0] * cl + v[1] * sl;
    return [v[1] * cl - v[0] * sl, cp * v[2] - sp * c, sp * v[2] + cp * c];
  }
  const hidden = (p) => p[2] < 0 && p[0] * p[0] + p[1] * p[1] < 1;

  // ---------- precomputed geometry ----------
  for (const j of JOBS) {
    const base = PLACES[j.base].at;
    j.threads = (j.links || []).map((k) => ({ pts: thread(base, PLACES[k].at), label: k }));
    if (j.india && !j.solo) INDIA.filter((p) => angle(vec(p), vec(base)) > 4 * RAD).forEach((p) => j.threads.push({ pts: thread(base, p, 2.2) }));
    // look at the middle of everything this job touches, slightly from above
    const all = [base, ...(j.links || []).map((k) => PLACES[k].at), ...(j.india ? INDIA : [])].map(vec);
    const m = all.reduce((s, v) => [s[0] + v[0], s[1] + v[1], s[2] + v[2]], [0, 0, 0]);
    j.center = { lon: Math.atan2(m[1], m[0]) / RAD, lat: Math.atan2(m[2], Math.hypot(m[0], m[1])) / RAD - (j.india ? 2 : 6), zoom: j.india ? 2.1 : 1 };
    j.baseVec = vec(base);
  }

  let dots = null, indiaDots = null, coast = null;
  function buildMap(world) {
    const countries = topojson.feature(world, world.objects.countries).features.map((f) => ({ f, b: d3.geoBounds(f), india: f.id === "356" }));
    const land = [], india = [], step = 1.1;
    for (let lat = -56; lat <= 80; lat += step) {
      const n = Math.max(1, Math.round((360 * Math.cos(lat * RAD)) / step));
      for (let i = 0; i < n; i++) {
        const lon = -180 + (i * 360) / n;
        for (const c of countries) {
          const [[x0, y0], [x1, y1]] = c.b;
          if (lat < y0 || lat > y1) continue;
          if (x0 <= x1 ? lon < x0 || lon > x1 : lon < x0 && lon > x1) continue;
          if (!d3.geoContains(c.f, [lon, lat])) continue;
          (c.india ? india : land).push(...vec([lon, lat]));
          break;
        }
      }
    }
    dots = new Float32Array(land);
    indiaDots = new Float32Array(india);
    coast = topojson.mesh(world, world.objects.countries).coordinates.map((line) => line.map(vec));
  }

  // ---------- panel ----------
  const list = view.querySelector(".job-list");
  const card = view.querySelector(".job-card");
  list.innerHTML = JOBS.map((j, i) => `<li><button type="button" data-i="${i}" style="--c:${j.color}">
      <span class="dot"></span><b>${j.name}</b><small>${j.years}</small></button></li>`).join("");
  const buttons = [...list.querySelectorAll("button")];

  let active = 0, selectedAt = 0, cycling = !reduce, tween = null;
  function select(i, byUser) {
    active = i; selectedAt = performance.now();
    if (byUser) cycling = false;
    const j = JOBS[i];
    buttons.forEach((b, k) => b.setAttribute("aria-pressed", k === i));
    card.style.setProperty("--accent", j.color);
    card.innerHTML = `<header class="win"><i></i><i></i><i></i><span>${j.link ? j.link.replace("https://", "") : `work/${j.id}.md`}</span><em${j.link ? ' class="live-dot"' : ""}>${j.when}</em></header>
      <div class="card-body">
        <h3>${j.link ? `<a href="${j.link}" target="_blank" rel="noopener">${j.name} <span class="at">↗</span></a>` : `${j.role} <span class="at">@</span> ${j.name}`}</h3>
        ${j.via || j.link ? `<p class="via">${j.via || j.role}</p>` : ""}
        <p class="route"><span>${PLACES[j.base].name}</span><b>⟶</b><span class="to">${j.team}</span></p>
        <ul class="job-wins">${j.points.map((p) => `<li>${p}</li>`).join("")}</ul>
        <ul class="tags">${j.tags.map((t) => `<li>${t}</li>`).join("")}</ul>
      </div>`;
    card.classList.remove("swap"); void card.offsetWidth; card.classList.add("swap");
    // turn the globe the short way round
    let dLon = ((j.center.lon - cam.lon + 540) % 360) - 180;
    tween = { from: { ...cam }, dLon, dLat: j.center.lat - cam.lat, dZoom: j.center.zoom - cam.zoom, t0: performance.now(), dur: reduce ? 0 : 1300 };
  }
  buttons.forEach((b) => b.addEventListener("click", () => select(+b.dataset.i, true)));

  // ---------- canvas ----------
  const wrap = view.querySelector(".globe-wrap");
  const canvas = wrap.querySelector("canvas");
  const ctx = canvas.getContext("2d");
  let W = 0, dpr = 1;
  function resize() {
    dpr = Math.min(2, devicePixelRatio || 1);
    W = wrap.clientWidth;
    if (!W) return;
    canvas.width = canvas.height = Math.round(W * dpr);
    draw(performance.now());
  }
  new ResizeObserver(resize).observe(wrap);

  // drag to spin (horizontal on touch, so vertical swipes still scroll the page)
  let drag = null;
  canvas.addEventListener("pointerdown", (e) => {
    drag = { x: e.clientX, y: e.clientY, lon: cam.lon, lat: cam.lat };
    canvas.setPointerCapture(e.pointerId); tween = null; cycling = false; wrap.classList.add("touched");
  });
  canvas.addEventListener("pointermove", (e) => {
    if (!drag) return;
    const k = 115 / (W * 0.4 * cam.zoom);
    cam.lon = drag.lon - (e.clientX - drag.x) * k;
    cam.lat = Math.max(-60, Math.min(70, drag.lat + (e.clientY - drag.y) * k));
  });
  const end = () => (drag = null);
  canvas.addEventListener("pointerup", end);
  canvas.addEventListener("pointercancel", end);

  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  function rgba(hex, a) {
    const n = parseInt(hex.slice(1), 16);
    return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`;
  }

  function strokeThread(pts, cx, cy, R, upto = 1) {
    const last = Math.max(1, Math.round((pts.length - 1) * upto));
    ctx.beginPath();
    let pen = false;
    for (let i = 0; i <= last; i++) {
      const p = project(pts[i]);
      if (hidden(p)) { pen = false; continue; }
      const x = cx + p[0] * R, y = cy - p[1] * R;
      pen ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      pen = true;
    }
    ctx.stroke();
  }

  function place(at, cx, cy, R) {
    const p = project(vec(at));
    return p[2] > 0 ? [cx + p[0] * R, cy - p[1] * R, p[2]] : null;
  }

  function label(text, x, y, col, z) {
    ctx.font = "600 11.5px 'JetBrains Mono', monospace";
    const w = ctx.measureText(text).width + 14;
    ctx.globalAlpha = Math.min(1, z * 2.5);
    ctx.fillStyle = "rgba(22,22,30,.85)";
    ctx.strokeStyle = rgba(col, 0.55);
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.roundRect(x + 9, y - 10, w, 20, 6); ctx.fill(); ctx.stroke();
    ctx.fillStyle = col;
    ctx.fillText(text, x + 16, y + 4);
    ctx.globalAlpha = 1;
  }

  function draw(now) {
    if (!W) return;
    setCam();
    const cx = W / 2, cy = W / 2, R = W * 0.4 * cam.zoom, job = JOBS[active];
    const t = reduce ? 0 : now / 1000;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, W);
    // zoomed past the frame: look at the globe through a round window
    const lens = R > W * 0.46 ? W * 0.47 : 0;
    ctx.save();
    if (lens) { ctx.beginPath(); ctx.arc(cx, cy, lens, 0, 7); ctx.clip(); }

    // atmosphere + sphere
    let g = ctx.createRadialGradient(cx, cy, R * 0.92, cx, cy, Math.min(R * 1.15, W / 2));
    g.addColorStop(0, rgba(C.cyan, 0.16)); g.addColorStop(1, rgba(C.cyan, 0));
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, Math.min(R * 1.15, W / 2), 0, 7); ctx.fill();
    g = ctx.createRadialGradient(cx - R * 0.35, cy - R * 0.4, R * 0.1, cx, cy, R);
    g.addColorStop(0, "#272c45"); g.addColorStop(1, "#14151d");
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.fill();
    ctx.strokeStyle = rgba(C.cyan, 0.28); ctx.lineWidth = 1.2; ctx.stroke();

    if (dots) {
      // coastlines and borders, faint
      ctx.strokeStyle = rgba(C.muted, 0.22); ctx.lineWidth = 0.7;
      ctx.beginPath();
      for (const line of coast) {
        let pen = false;
        for (const v of line) {
          const p = project(v);
          if (p[2] <= 0) { pen = false; continue; }
          const x = cx + p[0] * R, y = cy - p[1] * R;
          pen ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
          pen = true;
        }
      }
      ctx.stroke();

      // land dots, brighter towards the viewer (4 brightness buckets = 4 fills)
      const s = Math.min(2.4, Math.max(1.2, R / 190)), h = s / 2;
      const buckets = [[], [], [], []];
      const v = [0, 0, 0];
      for (let i = 0; i < dots.length; i += 3) {
        v[0] = dots[i]; v[1] = dots[i + 1]; v[2] = dots[i + 2];
        const p = project(v);
        if (p[2] <= 0.02) continue;
        buckets[Math.min(3, (p[2] * 4) | 0)].push(cx + p[0] * R - h, cy - p[1] * R - h);
      }
      buckets.forEach((b, k) => {
        ctx.fillStyle = rgba(C.ink, 0.12 + k * 0.1);
        ctx.beginPath();
        for (let i = 0; i < b.length; i += 2) ctx.rect(b[i], b[i + 1], s, s);
        ctx.fill();
      });

      // India: lit in the job's colour with a ripple out from the base when the team was here
      const ripple = [[], [], [], []];
      for (let i = 0; i < indiaDots.length; i += 3) {
        v[0] = indiaDots[i]; v[1] = indiaDots[i + 1]; v[2] = indiaDots[i + 2];
        const p = project(v);
        if (p[2] <= 0.02) continue;
        let k = Math.min(3, (p[2] * 4) | 0);
        if (job.india) k = Math.round(1.5 + 1.5 * Math.cos(angle(v, job.baseVec) * 40 - t * 3));
        ripple[k].push(cx + p[0] * R - h, cy - p[1] * R - h);
      }
      ripple.forEach((b, k) => {
        ctx.fillStyle = job.india ? rgba(job.color, 0.3 + k * 0.23) : rgba(C.ink, 0.12 + k * 0.1);
        ctx.beginPath();
        for (let i = 0; i < b.length; i += 2) ctx.rect(b[i] - h * 0.3, b[i + 1] - h * 0.3, s * 1.3, s * 1.3);
        ctx.fill();
      });
    }

    ctx.lineCap = "round";
    // other jobs' threads, faint
    JOBS.forEach((j, k) => {
      if (k === active || job.solo) return;
      ctx.strokeStyle = rgba(j.color, 0.14); ctx.lineWidth = 1;
      j.threads.forEach((th) => strokeThread(th.pts, cx, cy, R));
    });

    // active threads: draw in, then send pulses along them
    const grow = reduce ? 1 : ease(Math.min(1, (now - selectedAt) / 1100));
    ctx.strokeStyle = rgba(job.color, 0.45); ctx.lineWidth = 1.6;
    job.threads.forEach((th) => strokeThread(th.pts, cx, cy, R, grow));
    if (grow === 1 && !reduce) {
      ctx.shadowColor = job.color; ctx.shadowBlur = 10;
      job.threads.forEach((th, n) => {
        const head = (t * 0.45 + n * 0.37) % 1;
        for (let seg = 0; seg < 6; seg++) {
          const a = head - (seg + 1) * 0.025, b = head - seg * 0.025;
          if (a < 0) break;
          ctx.strokeStyle = rgba(job.color, 1 - seg / 6); ctx.lineWidth = 2.6 - seg * 0.3;
          const i0 = Math.floor(a * (th.pts.length - 1)), i1 = Math.ceil(b * (th.pts.length - 1));
          strokeThread(th.pts.slice(i0, i1 + 1), cx, cy, R);
        }
      });
      ctx.shadowBlur = 0;
    }

    // places
    JOBS.forEach((j, k) => {
      const p = place(PLACES[j.base].at, cx, cy, R);
      if (!p || k === active) return;
      ctx.fillStyle = rgba(j.color, 0.6); ctx.beginPath(); ctx.arc(p[0], p[1], 2.6, 0, 7); ctx.fill();
    });
    const base = place(PLACES[job.base].at, cx, cy, R);
    if (base) {
      const pulse = (t * 0.8) % 1;
      ctx.strokeStyle = rgba(job.color, 1 - pulse); ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(base[0], base[1], 4 + pulse * 16, 0, 7); ctx.stroke();
      ctx.fillStyle = job.color; ctx.shadowColor = job.color; ctx.shadowBlur = 12;
      ctx.beginPath(); ctx.arc(base[0], base[1], 4.2, 0, 7); ctx.fill(); ctx.shadowBlur = 0;
      if (job.solo) {
        // built solo: one dot orbiting the base, doing every job, instead of threads to a team
        const a = t * 2.2, rx = 34, ry = 14;
        ctx.strokeStyle = rgba(job.color, 0.35); ctx.lineWidth = 1;
        ctx.beginPath(); ctx.ellipse(base[0], base[1], rx, ry, -0.35, 0, 7); ctx.stroke();
        ctx.shadowColor = job.color; ctx.shadowBlur = 10;
        for (let k = 0; k < 8; k++) {
          const b = a - k * 0.12, x = Math.cos(b) * rx, y = Math.sin(b) * ry, c = Math.cos(-0.35), sn = Math.sin(-0.35);
          ctx.fillStyle = rgba(job.color, 1 - k / 8);
          ctx.beginPath(); ctx.arc(base[0] + x * c - y * sn, base[1] + x * sn + y * c, 3.4 - k * 0.3, 0, 7); ctx.fill();
        }
        ctx.shadowBlur = 0;
        label(`${PLACES[job.base].name} · built solo`, base[0] + 30, base[1] - 4, C.ink, base[2]);
      } else label(PLACES[job.base].name, base[0], base[1], C.ink, base[2]);
    }
    job.threads.forEach((th) => {
      if (!th.label) return;
      const end = th.pts[th.pts.length - 1], p = project(end);
      if (p[2] <= 0 || grow < 1) return;
      const x = cx + p[0] * R, y = cy - p[1] * R;
      ctx.fillStyle = job.color; ctx.beginPath(); ctx.arc(x, y, 3.4, 0, 7); ctx.fill();
      label(PLACES[th.label].name, x, y, job.color, p[2]);
    });
    ctx.restore();
    if (lens) {
      g = ctx.createRadialGradient(cx, cy, lens * 0.8, cx, cy, lens);
      g.addColorStop(0, "rgba(20,21,29,0)"); g.addColorStop(1, "rgba(20,21,29,.75)");
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, lens, 0, 7); ctx.fill();
      ctx.strokeStyle = rgba(C.cyan, 0.28); ctx.lineWidth = 1.2; ctx.stroke();
    }
  }

  // ---------- loop: only while the globe is on screen ----------
  let visible = false, raf = 0;
  function frame(now) {
    raf = 0;
    if (!visible || section.classList.contains("view-grid")) return;
    if (tween) {
      const k = tween.dur ? ease(Math.min(1, (now - tween.t0) / tween.dur)) : 1;
      cam.lon = tween.from.lon + tween.dLon * k;
      cam.lat = tween.from.lat + tween.dLat * k;
      cam.zoom = tween.from.zoom + tween.dZoom * k;
      if (k === 1) tween = null;
    } else if (!drag && !reduce) {
      cam.lon += 0.012; // slow drift
    }
    if (cycling && now - selectedAt > 7000) select((active + 1) % JOBS.length);
    draw(now);
    if (!reduce || tween) raf = requestAnimationFrame(frame);
  }
  const kick = () => { if (!raf) raf = requestAnimationFrame(frame); };
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) kick(); else selectedAt = performance.now(); }).observe(wrap);
  buttons.forEach((b) => b.addEventListener("click", kick));
  canvas.addEventListener("pointermove", () => { if (drag) { draw(performance.now()); } });

  // ---------- globe / grid toggle ----------
  const toggles = [...section.querySelectorAll(".view-toggle button")];
  function setView(v, remember) {
    section.classList.toggle("view-grid", v === "grid");
    section.classList.toggle("view-globe", v !== "grid");
    toggles.forEach((b) => b.setAttribute("aria-pressed", b.dataset.v === v));
    if (remember) try { localStorage.setItem("workView", v); } catch {}
    if (v !== "grid") { resize(); kick(); }
  }
  toggles.forEach((b) => b.addEventListener("click", () => setView(b.dataset.v, true)));
  let saved = null;
  try { saved = localStorage.getItem("workView"); } catch {}
  setView(saved === "grid" ? "grid" : "globe");
  select(0);

  // ---------- map data (falls back to the grid if it can't load) ----------
  if (!window.d3 || !window.topojson) return setView("grid");
  fetch("assets/countries-110m.json")
    .then((r) => r.json())
    .then((world) => { buildMap(world); draw(performance.now()); kick(); })
    .catch(() => setView("grid"));
})();
