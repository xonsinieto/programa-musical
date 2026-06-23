(function () {
  const VF = Vex.Flow;

  // ======================================================
  // EFECTES VISUALS GLOBALS (ripples, bursts, shakes, pop)
  // ======================================================

  // Ripple universal en qualsevol botó clicable
  const RIPPLE_SELECTOR = ".note-btn, .big-start, .big-btn, nav.tabs .tab, #new-note-btn, #mic-btn, .controls button, .profile-bar button, .sp-note-btn";
  document.addEventListener("pointerdown", (e) => {
    const btn = e.target.closest(RIPPLE_SELECTOR);
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const ripple = document.createElement("span");
    ripple.className = "ripple-layer";
    ripple.style.setProperty("--rx", (e.clientX - rect.left) + "px");
    ripple.style.setProperty("--ry", (e.clientY - rect.top) + "px");
    const prev = getComputedStyle(btn).position;
    if (prev === "static") btn.style.position = "relative";
    btn.style.overflow = "hidden";
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 720);
  }, { passive: true });

  function flashClass(el, cls, ms) {
    if (!el) return;
    el.classList.remove(cls);
    // força reflow perquè l'animació es torni a disparar
    void el.offsetWidth;
    el.classList.add(cls);
    setTimeout(() => el.classList.remove(cls), ms);
  }

  function popFeedback(el) { flashClass(el, "pop", 400); }
  function burstStaff(el) { flashClass(el, "burst-correct", 720); }
  function shakeElement(el) { flashClass(el, "shake-wrong", 520); }
  function tickCounter(el) { flashClass(el, "counter-tick", 520); }

  // ---------- PARALLAX COSMIC BG ----------
  if (!window.matchMedia("(hover: none)").matches) {
    let tx = 0, ty = 0, cx = 0, cy = 0;
    function rafParallax() {
      cx += (tx - cx) * 0.06;
      cy += (ty - cy) * 0.06;
      document.documentElement.style.setProperty("--parallax-x", cx.toFixed(1) + "px");
      document.documentElement.style.setProperty("--parallax-y", cy.toFixed(1) + "px");
      requestAnimationFrame(rafParallax);
    }
    document.addEventListener("pointermove", (e) => {
      const halfW = window.innerWidth / 2;
      const halfH = window.innerHeight / 2;
      tx = ((e.clientX - halfW) / halfW) * 18;
      ty = ((e.clientY - halfH) / halfH) * 18;
    }, { passive: true });
    requestAnimationFrame(rafParallax);
  }

  // ---------- CONFETTI / PARTICLE BURST ----------
  function spawnConfetti(opts) {
    opts = opts || {};
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const canvas = document.createElement("canvas");
    canvas.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:10000";
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);
    const ctx = canvas.getContext("2d");
    const colors = opts.colors || ["#00F0FF", "#FF10F0", "#A855F7", "#FFB800", "#00FF94"];
    const n = opts.count || 80;
    const ox = opts.x != null ? opts.x : window.innerWidth / 2;
    const oy = opts.y != null ? opts.y : window.innerHeight / 2;
    const particles = [];
    for (let i = 0; i < n; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 6 + Math.random() * 12;
      particles.push({
        x: ox, y: oy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 3 + Math.random() * 5,
        life: 1,
        rotation: Math.random() * Math.PI,
        rotSpeed: (Math.random() - 0.5) * 0.3,
        drag: 0.97
      });
    }
    let frames = 0;
    function tick() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      for (const p of particles) {
        p.vx *= p.drag;
        p.vy = p.vy * p.drag + 0.45;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotSpeed;
        p.life -= 0.013;
        if (p.life > 0) {
          alive = true;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.globalAlpha = Math.max(0, p.life);
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 14;
          ctx.fillRect(-p.size / 2, -p.size, p.size, p.size * 2);
          ctx.restore();
        }
      }
      if (alive && frames < 200) {
        frames++;
        requestAnimationFrame(tick);
      } else {
        canvas.remove();
      }
    }
    tick();
  }

  // Petit sparkle burst (per correct answers - menys intens que confetti)
  function spawnSparkles(rect) {
    spawnConfetti({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
      count: 22,
      colors: ["#00F0FF", "#00FF94", "#FFB800"]
    });
  }

  // Burst de partícules a la posició d'una nota (Guitar Hero style hit)
  function burstNoteAt(noteEl, colors, count) {
    if (!noteEl) return;
    try {
      const rect = noteEl.getBoundingClientRect();
      if (rect.width === 0) return;
      spawnConfetti({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        count: count || 22,
        colors: colors || ["#00F0FF", "#00FF94", "#FFB800"]
      });
    } catch (e) {}
  }

  // Flash de la línia d'impacte (brilla breument)
  function flashHitLine() {
    if (!spSvg) return;
    const line = spSvg.querySelector("line");
    if (!line) return;
    const origWidth = line.getAttribute("stroke-width") || "3";
    const origStroke = line.getAttribute("stroke");
    line.setAttribute("stroke-width", "5");
    line.setAttribute("stroke", "#00F0FF");
    line.style.filter = "drop-shadow(0 0 24px rgba(0, 240, 255, 0.9)) drop-shadow(0 0 48px rgba(255, 16, 240, 0.5))";
    setTimeout(() => {
      line.setAttribute("stroke-width", origWidth);
      line.setAttribute("stroke", origStroke || "#e74c3c");
      line.style.filter = "";
    }, 250);
  }

  // ---------- TOAST NOTIFICATION ----------
  function showToast(msg, type) {
    const toast = document.createElement("div");
    toast.className = "toast toast-" + (type || "info");
    toast.textContent = msg;
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add("toast-show"));
    setTimeout(() => {
      toast.classList.remove("toast-show");
      setTimeout(() => toast.remove(), 320);
    }, 2800);
  }

  // Cançons completes amb durades. Durades: "w"=rodona, "h"=blanca,
  // "q"=negra, "8"=corxera, "16"=semicorxera. Clef per cada nota.
  const SONGS = [
    {
      id: "ode-joy",
      name: "Oda a l'Alegria (Beethoven) — complet",
      notes: [
        // Frase 1
        {clef:"treble",note:"e/4",dur:"q"},{clef:"treble",note:"e/4",dur:"q"},
        {clef:"treble",note:"f/4",dur:"q"},{clef:"treble",note:"g/4",dur:"q"},
        {clef:"treble",note:"g/4",dur:"q"},{clef:"treble",note:"f/4",dur:"q"},
        {clef:"treble",note:"e/4",dur:"q"},{clef:"treble",note:"d/4",dur:"q"},
        {clef:"treble",note:"c/4",dur:"q"},{clef:"treble",note:"c/4",dur:"q"},
        {clef:"treble",note:"d/4",dur:"q"},{clef:"treble",note:"e/4",dur:"q"},
        {clef:"treble",note:"e/4",dur:"h"},{clef:"treble",note:"d/4",dur:"q"},
        {clef:"treble",note:"d/4",dur:"h"},
        // Frase 2 (repetició amb final)
        {clef:"treble",note:"e/4",dur:"q"},{clef:"treble",note:"e/4",dur:"q"},
        {clef:"treble",note:"f/4",dur:"q"},{clef:"treble",note:"g/4",dur:"q"},
        {clef:"treble",note:"g/4",dur:"q"},{clef:"treble",note:"f/4",dur:"q"},
        {clef:"treble",note:"e/4",dur:"q"},{clef:"treble",note:"d/4",dur:"q"},
        {clef:"treble",note:"c/4",dur:"q"},{clef:"treble",note:"c/4",dur:"q"},
        {clef:"treble",note:"d/4",dur:"q"},{clef:"treble",note:"e/4",dur:"q"},
        {clef:"treble",note:"d/4",dur:"h"},{clef:"treble",note:"c/4",dur:"q"},
        {clef:"treble",note:"c/4",dur:"h"}
      ]
    },
    {
      id: "twinkle-full",
      name: "Estrelleta on ets — complet",
      notes: [
        {clef:"treble",note:"c/4",dur:"q"},{clef:"treble",note:"c/4",dur:"q"},
        {clef:"treble",note:"g/4",dur:"q"},{clef:"treble",note:"g/4",dur:"q"},
        {clef:"treble",note:"a/4",dur:"q"},{clef:"treble",note:"a/4",dur:"q"},
        {clef:"treble",note:"g/4",dur:"h"},
        {clef:"treble",note:"f/4",dur:"q"},{clef:"treble",note:"f/4",dur:"q"},
        {clef:"treble",note:"e/4",dur:"q"},{clef:"treble",note:"e/4",dur:"q"},
        {clef:"treble",note:"d/4",dur:"q"},{clef:"treble",note:"d/4",dur:"q"},
        {clef:"treble",note:"c/4",dur:"h"},
        {clef:"treble",note:"g/4",dur:"q"},{clef:"treble",note:"g/4",dur:"q"},
        {clef:"treble",note:"f/4",dur:"q"},{clef:"treble",note:"f/4",dur:"q"},
        {clef:"treble",note:"e/4",dur:"q"},{clef:"treble",note:"e/4",dur:"q"},
        {clef:"treble",note:"d/4",dur:"h"},
        {clef:"treble",note:"g/4",dur:"q"},{clef:"treble",note:"g/4",dur:"q"},
        {clef:"treble",note:"f/4",dur:"q"},{clef:"treble",note:"f/4",dur:"q"},
        {clef:"treble",note:"e/4",dur:"q"},{clef:"treble",note:"e/4",dur:"q"},
        {clef:"treble",note:"d/4",dur:"h"},
        {clef:"treble",note:"c/4",dur:"q"},{clef:"treble",note:"c/4",dur:"q"},
        {clef:"treble",note:"g/4",dur:"q"},{clef:"treble",note:"g/4",dur:"q"},
        {clef:"treble",note:"a/4",dur:"q"},{clef:"treble",note:"a/4",dur:"q"},
        {clef:"treble",note:"g/4",dur:"h"},
        {clef:"treble",note:"f/4",dur:"q"},{clef:"treble",note:"f/4",dur:"q"},
        {clef:"treble",note:"e/4",dur:"q"},{clef:"treble",note:"e/4",dur:"q"},
        {clef:"treble",note:"d/4",dur:"q"},{clef:"treble",note:"d/4",dur:"q"},
        {clef:"treble",note:"c/4",dur:"h"}
      ]
    },
    {
      id: "frere-full",
      name: "Germà Joan — complet",
      notes: [
        // Frase 1 (x2)
        {clef:"treble",note:"c/4",dur:"q"},{clef:"treble",note:"d/4",dur:"q"},
        {clef:"treble",note:"e/4",dur:"q"},{clef:"treble",note:"c/4",dur:"q"},
        {clef:"treble",note:"c/4",dur:"q"},{clef:"treble",note:"d/4",dur:"q"},
        {clef:"treble",note:"e/4",dur:"q"},{clef:"treble",note:"c/4",dur:"q"},
        // Frase 2 (x2)
        {clef:"treble",note:"e/4",dur:"q"},{clef:"treble",note:"f/4",dur:"q"},
        {clef:"treble",note:"g/4",dur:"h"},
        {clef:"treble",note:"e/4",dur:"q"},{clef:"treble",note:"f/4",dur:"q"},
        {clef:"treble",note:"g/4",dur:"h"},
        // Frase 3 (x2) - amb corxeres
        {clef:"treble",note:"g/4",dur:"8"},{clef:"treble",note:"a/4",dur:"8"},
        {clef:"treble",note:"g/4",dur:"8"},{clef:"treble",note:"f/4",dur:"8"},
        {clef:"treble",note:"e/4",dur:"q"},{clef:"treble",note:"c/4",dur:"q"},
        {clef:"treble",note:"g/4",dur:"8"},{clef:"treble",note:"a/4",dur:"8"},
        {clef:"treble",note:"g/4",dur:"8"},{clef:"treble",note:"f/4",dur:"8"},
        {clef:"treble",note:"e/4",dur:"q"},{clef:"treble",note:"c/4",dur:"q"},
        // Frase 4 (x2)
        {clef:"treble",note:"c/4",dur:"q"},{clef:"treble",note:"g/3",dur:"q"},
        {clef:"treble",note:"c/4",dur:"h"},
        {clef:"treble",note:"c/4",dur:"q"},{clef:"treble",note:"g/3",dur:"q"},
        {clef:"treble",note:"c/4",dur:"h"}
      ]
    },
    {
      id: "bass-walk",
      name: "Walking Bass (Clau de Fa)",
      notes: [
        {clef:"bass",note:"c/3",dur:"q"},{clef:"bass",note:"e/3",dur:"q"},
        {clef:"bass",note:"g/3",dur:"q"},{clef:"bass",note:"e/3",dur:"q"},
        {clef:"bass",note:"f/3",dur:"q"},{clef:"bass",note:"a/3",dur:"q"},
        {clef:"bass",note:"g/3",dur:"q"},{clef:"bass",note:"f/3",dur:"q"},
        {clef:"bass",note:"e/3",dur:"q"},{clef:"bass",note:"c/3",dur:"q"},
        {clef:"bass",note:"d/3",dur:"q"},{clef:"bass",note:"f/3",dur:"q"},
        {clef:"bass",note:"e/3",dur:"h"},{clef:"bass",note:"c/3",dur:"h"}
      ]
    },
    {
      id: "canon-pachelbel",
      name: "Canon de Pachelbel — baix",
      notes: [
        // Progressió D-A-Bm-F#m-G-D-G-A (en bass clef, simplificada)
        {clef:"bass",note:"d/3",dur:"h"},{clef:"bass",note:"a/2",dur:"h"},
        {clef:"bass",note:"b/2",dur:"h"},{clef:"bass",note:"f/3",dur:"h"},
        {clef:"bass",note:"g/2",dur:"h"},{clef:"bass",note:"d/3",dur:"h"},
        {clef:"bass",note:"g/2",dur:"h"},{clef:"bass",note:"a/2",dur:"h"},
        {clef:"bass",note:"d/3",dur:"h"},{clef:"bass",note:"a/2",dur:"h"},
        {clef:"bass",note:"b/2",dur:"h"},{clef:"bass",note:"f/3",dur:"h"},
        {clef:"bass",note:"g/2",dur:"h"},{clef:"bass",note:"d/3",dur:"h"},
        {clef:"bass",note:"g/2",dur:"h"},{clef:"bass",note:"a/2",dur:"w"}
      ]
    },
    {
      id: "mixed-duet",
      name: "Duet — ambdues claus",
      notes: [
        {clef:"treble",note:"c/5",dur:"q"},{clef:"bass",note:"c/3",dur:"q"},
        {clef:"treble",note:"e/4",dur:"q"},{clef:"bass",note:"g/3",dur:"q"},
        {clef:"treble",note:"g/4",dur:"h"},{clef:"bass",note:"e/3",dur:"h"},
        {clef:"treble",note:"f/4",dur:"q"},{clef:"bass",note:"d/3",dur:"q"},
        {clef:"treble",note:"e/4",dur:"q"},{clef:"bass",note:"f/3",dur:"q"},
        {clef:"treble",note:"d/4",dur:"h"},{clef:"bass",note:"g/2",dur:"h"},
        {clef:"treble",note:"c/4",dur:"q"},{clef:"bass",note:"c/3",dur:"q"},
        {clef:"treble",note:"e/4",dur:"q"},{clef:"bass",note:"e/3",dur:"q"},
        {clef:"treble",note:"g/4",dur:"h"},{clef:"bass",note:"c/3",dur:"h"}
      ]
    }
  ];

  const NOTE_NAMES_CA = {
    c: "do", d: "re", e: "mi", f: "fa", g: "sol", a: "la", b: "si"
  };

  const LEVELS_DESC = {
    1: "Bàsic (dins del pentagrama)",
    2: "Intermedi (+ línies addicionals)",
    3: "Avançat (rang complet de piano)"
  };
  const LEVELS = {
    1: {
      // Una octava: Do central fins al Do següent (Sol cap a la dreta, Fa cap a l'esquerra)
      treble: ["c/4","d/4","e/4","f/4","g/4","a/4","b/4","c/5"],
      bass:   ["c/3","d/3","e/3","f/3","g/3","a/3","b/3","c/4"]
    },
    2: {
      // Dues octaves: tres Do per clau (c/4, c/5, c/6 Sol; c/2, c/3, c/4 Fa)
      treble: ["c/4","d/4","e/4","f/4","g/4","a/4","b/4",
               "c/5","d/5","e/5","f/5","g/5","a/5","b/5","c/6"],
      bass:   ["c/2","d/2","e/2","f/2","g/2","a/2","b/2",
               "c/3","d/3","e/3","f/3","g/3","a/3","b/3","c/4"]
    },
    3: null // tot el piano (rang RANGES complet)
  };

  // ---------- PERFILS + ESTADÍSTIQUES PER NOTA ----------
  const PROFILES_KEY = "profiles_v1";    // { list: [], current: "" }
  const STATS_KEY    = "statsByProfile_v1"; // { [profileName]: { "clef|note": {correct,wrong} } }

  function loadProfiles() {
    try {
      const raw = JSON.parse(localStorage.getItem(PROFILES_KEY) || "null");
      if (raw && Array.isArray(raw.list) && raw.list.length) return raw;
    } catch (e) {}
    const init = { list: ["Convidat"], current: "Convidat" };
    localStorage.setItem(PROFILES_KEY, JSON.stringify(init));
    return init;
  }
  function saveProfiles(p) {
    try { localStorage.setItem(PROFILES_KEY, JSON.stringify(p)); } catch (e) {}
  }

  function loadAllStats() {
    try { return JSON.parse(localStorage.getItem(STATS_KEY) || "{}"); }
    catch (e) { return {}; }
  }
  function saveAllStats(s) {
    try { localStorage.setItem(STATS_KEY, JSON.stringify(s)); } catch (e) {}
  }
  function currentProfile() {
    return loadProfiles().current;
  }
  function loadTrainStats() {
    const all = loadAllStats();
    return all[currentProfile()] || {};
  }
  function saveTrainStats(profileStats) {
    const all = loadAllStats();
    all[currentProfile()] = profileStats;
    saveAllStats(all);
  }
  function recordTrainAnswer(clef, note, isCorrect) {
    const s = loadTrainStats();
    const k = clef + "|" + note;
    if (!s[k]) s[k] = { correct: 0, wrong: 0 };
    if (isCorrect) s[k].correct++; else s[k].wrong++;
    saveTrainStats(s);
  }
  function pickFailedNote() {
    const s = loadTrainStats();
    const entries = Object.keys(s)
      .map(k => {
        const [clef, note] = k.split("|");
        const v = s[k];
        const total = v.correct + v.wrong;
        const rate = total > 0 ? v.wrong / total : 0;
        return { clef, note, rate, wrong: v.wrong, total };
      })
      .filter(e => e.wrong > 0 && e.total >= 2)
      .sort((a, b) => (b.rate - a.rate) || (b.wrong - a.wrong));

    const top = entries.slice(0, 12);
    if (top.length === 0) return null;
    return top[Math.floor(Math.random() * top.length)];
  }

  // UI
  const profileSelect = document.getElementById("profile-select");
  const profileNewBtn = document.getElementById("profile-new-btn");

  function refreshProfileUI() {
    const p = loadProfiles();
    profileSelect.innerHTML = "";
    p.list.forEach(name => {
      const opt = document.createElement("option");
      opt.value = name;
      opt.textContent = name;
      if (name === p.current) opt.selected = true;
      profileSelect.appendChild(opt);
    });
  }

  profileSelect.addEventListener("change", () => {
    const p = loadProfiles();
    p.current = profileSelect.value;
    saveProfiles(p);
    if (typeof refreshBestTimeUI === "function") refreshBestTimeUI();
  });

  profileNewBtn.addEventListener("click", () => {
    const name = prompt("Nom del nou perfil:");
    if (!name || !name.trim()) return;
    const trimmed = name.trim().slice(0, 20);
    const p = loadProfiles();
    if (!p.list.includes(trimmed)) p.list.push(trimmed);
    p.current = trimmed;
    saveProfiles(p);
    refreshProfileUI();
  });

  refreshProfileUI();

  // En obrir l'app amb el perfil "Convidat", netegem les seves estadístiques.
  // Els perfils nomenats mantenen la memòria entre sessions.
  (function resetGuestStats() {
    if (currentProfile() === "Convidat") {
      const all = loadAllStats();
      if (all["Convidat"]) {
        delete all["Convidat"];
        saveAllStats(all);
      }
    }
  })();

  function pickNoteForLevel(clef, level) {
    const lvl = parseInt(level, 10) || 3;
    const pool = (lvl === 3 || !LEVELS[lvl]) ? RANGES[clef] : LEVELS[lvl][clef];
    return pool[Math.floor(Math.random() * pool.length)];
  }

  const RANGES = {
    treble: [
      "c/4","d/4","e/4","f/4","g/4","a/4","b/4",
      "c/5","d/5","e/5","f/5","g/5","a/5","b/5",
      "c/6","d/6","e/6","f/6","g/6","a/6","b/6",
      "c/7","d/7","e/7","f/7","g/7","a/7","b/7",
      "c/8"
    ],
    bass: [
      "a/0","b/0",
      "c/1","d/1","e/1","f/1","g/1","a/1","b/1",
      "c/2","d/2","e/2","f/2","g/2","a/2","b/2",
      "c/3","d/3","e/3","f/3","g/3","a/3","b/3",
      "c/4"
    ]
  };

  const COLORS = {
    current: "#3498db",
    correct: "#27ae60",
    wrong:   "#e74c3c",
    neutral: "#222"
  };

  const staffContainer = document.getElementById("staff-container");
  const clefSelect     = document.getElementById("clef-select");
  const levelSelect    = document.getElementById("level-select");
  const modeSelect     = document.getElementById("mode-select");
  const songSelect     = document.getElementById("song-select");
  const songLabel      = document.getElementById("song-label");

  // Omplir el selector de cançons
  SONGS.forEach((s) => {
    const opt = document.createElement("option");
    opt.value = s.id;
    opt.textContent = s.name;
    songSelect.appendChild(opt);
  });
  const newNoteBtn     = document.getElementById("new-note-btn");
  const feedbackEl     = document.getElementById("feedback");
  const correctCountEl = document.getElementById("correct-count");
  const wrongCountEl   = document.getElementById("wrong-count");
  const accuracyEl     = document.getElementById("accuracy");
  const trainPiano     = document.getElementById("train-piano");

  let sequence    = [];   // [{ clef, note, status: "pending"|"correct"|"wrong" }]
  let currentStep = 0;
  let answered    = false;
  let correct     = 0;
  let wrong       = 0;
  let roundStartMs  = 0;
  let roundEndedMs  = 0;
  let roundTimerRAF = null;
  let roundConfigKey = "";
  let roundErrors   = 0;

  const runTimeEl  = document.getElementById("run-time");
  const bestTimeEl = document.getElementById("best-time");

  const BEST_TIMES_KEY = "bestTimesByProfile_v1";
  function loadBestTimes() {
    try { return JSON.parse(localStorage.getItem(BEST_TIMES_KEY) || "{}"); }
    catch (e) { return {}; }
  }
  function saveBestTimes(x) {
    try { localStorage.setItem(BEST_TIMES_KEY, JSON.stringify(x)); } catch (e) {}
  }
  function getBestTime(configKey) {
    const all = loadBestTimes();
    const profile = currentProfile();
    return (all[profile] && all[profile][configKey]) || null;
  }
  function setBestTime(configKey, seconds) {
    const all = loadBestTimes();
    const profile = currentProfile();
    if (!all[profile]) all[profile] = {};
    all[profile][configKey] = seconds;
    saveBestTimes(all);
  }
  function currentConfigKey() {
    const mode = modeSelect.value;
    const clef = clefSelect.value;
    const level = levelSelect.value;
    if (mode === "song") {
      return "song|" + songSelect.value;
    }
    const count = sequence.length;
    return [clef, level, mode, count].join("|");
  }
  function formatSec(sec) {
    return sec.toFixed(1) + "s";
  }
  function refreshBestTimeUI() {
    if (sequence.length <= 1) {
      bestTimeEl.textContent = "—";
      return;
    }
    const key = currentConfigKey();
    const best = getBestTime(key);
    bestTimeEl.textContent = best ? formatSec(best) : "—";
  }
  function startRoundTimer() {
    roundStartMs = performance.now();
    roundEndedMs = 0;
    if (roundTimerRAF) cancelAnimationFrame(roundTimerRAF);
    const tick = () => {
      if (roundEndedMs) return;
      const elapsed = (performance.now() - roundStartMs) / 1000;
      runTimeEl.textContent = formatSec(elapsed);
      roundTimerRAF = requestAnimationFrame(tick);
    };
    tick();
  }
  function endRoundTimer() {
    if (!roundStartMs || roundEndedMs) return 0;
    roundEndedMs = performance.now();
    if (roundTimerRAF) cancelAnimationFrame(roundTimerRAF);
    const elapsed = (roundEndedMs - roundStartMs) / 1000;
    runTimeEl.textContent = formatSec(elapsed);
    return elapsed;
  }

  function pickClef() {
    const sel = clefSelect.value;
    if (sel === "both") return Math.random() < 0.5 ? "treble" : "bass";
    return sel;
  }

  function pickRandomNote(clef) {
    const pool = RANGES[clef];
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function buildSequence() {
    const mode  = modeSelect.value;
    sequence    = [];

    if (mode === "song") {
      const song = SONGS.find(s => s.id === songSelect.value) || SONGS[0];
      song.notes.forEach((n) => {
        sequence.push({
          clef: n.clef,
          note: n.note,
          dur: n.dur || "q",
          status: "pending"
        });
      });
      currentStep = 0;
      return;
    }

    let count;
    if (mode === "single") {
      count = 1;
    } else {
      const isMobile = window.innerWidth < 600;
      const mult     = isMobile ? 1.72 : 1;
      const renderWidth = Math.max(400, staffContainer.clientWidth) * mult;
      const usableWidth = renderWidth - 40 - 60;
      const targetNoteSpace = isMobile ? 50 : 55;
      count = Math.max(4, Math.floor(usableWidth / targetNoteSpace));
    }
    const level = levelSelect.value;

    if (mode === "failed") {
      // Si no hi ha prou estadístiques, omple amb aleatori
      for (let i = 0; i < count; i++) {
        const failed = pickFailedNote();
        if (failed) {
          sequence.push({ clef: failed.clef, note: failed.note, status: "pending" });
        } else {
          const c = pickClef();
          sequence.push({ clef: c, note: pickNoteForLevel(c, level), status: "pending" });
        }
      }
      currentStep = 0;
      return;
    }

    for (let i = 0; i < count; i++) {
      const c = pickClef();
      sequence.push({ clef: c, note: pickNoteForLevel(c, level), status: "pending" });
    }
    currentStep = 0;
  }

  function render() {
    staffContainer.innerHTML = "";

    const isMobile       = window.innerWidth < 600;
    const mult           = isMobile ? 1.72 : 1;
    const containerWidth = Math.max(400, staffContainer.clientWidth) * mult;
    const height         = 460;
    const staveX         = 20;
    const staveWidth     = containerWidth - staveX - 20;
    const trebleY        = 140;
    const bassY          = 280;

    const renderer = new VF.Renderer(staffContainer, VF.Renderer.Backends.SVG);
    renderer.resize(containerWidth, height);
    const context = renderer.getContext();

    const trebleStave = new VF.Stave(staveX, trebleY, staveWidth);
    trebleStave.addClef("treble").setContext(context).draw();

    const bassStave = new VF.Stave(staveX, bassY, staveWidth);
    bassStave.addClef("bass").setContext(context).draw();

    const connectorTypes = VF.StaveConnector.type;
    new VF.StaveConnector(trebleStave, bassStave)
      .setType(connectorTypes.BRACE).setContext(context).draw();
    new VF.StaveConnector(trebleStave, bassStave)
      .setType(connectorTypes.SINGLE_LEFT).setContext(context).draw();
    new VF.StaveConnector(trebleStave, bassStave)
      .setType(connectorTypes.SINGLE_RIGHT).setContext(context).draw();

    const DUR_BEATS = { w: 4, h: 2, q: 1, "8": 0.5, "16": 0.25 };
    // A petició de l'usuari: totes les notes es dibuixen com a rodones (whole
    // notes) arreu, ignorant la durada original de la cançó/seqüència.
    const trebleNotes = sequence.map((step) => {
      return step.clef === "treble"
        ? new VF.StaveNote({ clef: "treble", keys: [step.note], duration: "w" })
        : new VF.StaveNote({ clef: "treble", keys: ["b/4"],      duration: "wr" });
    });
    const bassNotes = sequence.map((step) => {
      return step.clef === "bass"
        ? new VF.StaveNote({ clef: "bass", keys: [step.note], duration: "w" })
        : new VF.StaveNote({ clef: "bass", keys: ["d/3"],      duration: "wr" });
    });

    sequence.forEach((step, i) => {
      let color = COLORS.neutral;
      if (step.status === "correct") color = COLORS.correct;
      else if (step.status === "wrong") color = COLORS.wrong;
      else if (i === currentStep) color = COLORS.current;

      const style     = { fillStyle: color, strokeStyle: color };
      const targetNote = step.clef === "treble" ? trebleNotes[i] : bassNotes[i];
      targetNote.setStyle(style);

      if (step.status === "wrong") {
        const label = NOTE_NAMES_CA[noteLetter(step.note)].toUpperCase();
        const annotation = new VF.Annotation(label)
          .setFont("Arial", 13, "bold")
          .setVerticalJustification(VF.Annotation.VerticalJustify.TOP);
        annotation.setStyle({ fillStyle: COLORS.wrong, strokeStyle: COLORS.wrong });
        targetNote.addModifier(annotation, 0);
      }
    });

    const totalBeats = sequence.reduce((s, step) => s + (DUR_BEATS[step.dur || "q"] || 1), 0);
    const trebleVoice = new VF.Voice({ num_beats: totalBeats, beat_value: 4 })
      .setMode(VF.Voice.Mode.SOFT)
      .addTickables(trebleNotes);
    const bassVoice = new VF.Voice({ num_beats: totalBeats, beat_value: 4 })
      .setMode(VF.Voice.Mode.SOFT)
      .addTickables(bassNotes);

    const formatWidth = Math.max(150, staveWidth - 80);
    new VF.Formatter()
      .joinVoices([trebleVoice, bassVoice])
      .format([trebleVoice, bassVoice], formatWidth);

    trebleVoice.draw(context, trebleStave);
    bassVoice.draw(context, bassStave);

    const svg = context.svg;
    sequence.forEach((step, i) => {
      const target = step.clef === "treble" ? trebleNotes[i] : bassNotes[i];
      let bb = null;
      try { bb = target.getBoundingBox(); } catch (e) { bb = null; }
      if (!bb) return;
      const x = typeof bb.getX === "function" ? bb.getX() : bb.x;
      const y = typeof bb.getY === "function" ? bb.getY() : bb.y;
      const w = typeof bb.getW === "function" ? bb.getW() : bb.w;
      const h = typeof bb.getH === "function" ? bb.getH() : bb.h;
      const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      rect.setAttribute("x", x - 6);
      rect.setAttribute("y", y - 12);
      rect.setAttribute("width", w + 12);
      rect.setAttribute("height", h + 24);
      rect.setAttribute("fill", "transparent");
      rect.setAttribute("stroke", "none");
      rect.style.cursor = "pointer";
      rect.addEventListener("click", () => playNote(step.note));
      svg.appendChild(rect);
    });
  }

  function noteLetter(noteKey) {
    return noteKey.split("/")[0].toLowerCase();
  }

  function updateStats() {
    correctCountEl.textContent = correct;
    wrongCountEl.textContent   = wrong;
    const total = correct + wrong;
    accuracyEl.textContent = total === 0
      ? "—"
      : Math.round((correct / total) * 100) + "%";
  }

  function advance() {
    currentStep++;
    answered = false;
    if (trainPiano) {
      trainPiano.querySelectorAll(".nk-key").forEach(b =>
        b.classList.remove("correct-flash", "wrong-flash"));
    }
    if (currentStep >= sequence.length) {
      const elapsed = endRoundTimer();
      let message = "Seqüència completada!";
      if (elapsed > 0 && sequence.length > 1) {
        const cleanRun = roundErrors === 0;
        const key = currentConfigKey();
        const best = getBestTime(key);
        const diff = best ? elapsed - best : null;

        if (!cleanRun) {
          message = `Temps: ${formatSec(elapsed)} — ${roundErrors} error${roundErrors > 1 ? "s" : ""}` +
                    (best ? `  (millor sense errors: ${formatSec(best)})` : "");
        } else if (!best || elapsed < best - 0.05) {
          setBestTime(key, elapsed);
          message = `🎉 ${formatSec(elapsed)} — Bé! Estàs millorant!`;
          playCongratulations();
          spawnConfetti({ count: 70 });
        } else if (diff !== null && Math.abs(diff) <= 0.1) {
          message = `🎉 ${formatSec(elapsed)} — Empat amb el millor!`;
          playCongratulations();
          spawnConfetti({ count: 50 });
        } else if (diff !== null && diff <= 3) {
          message = `👍 ${formatSec(elapsed)} — Bé, segueix així! (millor: ${formatSec(best)})`;
          playEncouragement();
        } else {
          message = `Temps: ${formatSec(elapsed)}  (millor: ${formatSec(best)})`;
        }
        refreshBestTimeUI();
      }
      feedbackEl.textContent = message;
      feedbackEl.className   = "feedback correct";
      setTimeout(startRound, 2200);
    } else {
      feedbackEl.textContent = "";
      feedbackEl.className   = "feedback";
      render();
    }
  }

  function handleAnswer(answerPitch, btn) {
    if (answered || currentStep >= sequence.length) return;
    answered = true;

    // Primer click → arrenca cronòmetre
    if (!roundStartMs && sequence.length > 1) startRoundTimer();

    const step          = sequence[currentStep];
    const correctLetter = noteLetter(step.note);
    const correctCa     = NOTE_NAMES_CA[correctLetter];

    // Resposta correcta = tecla EXACTA (mateixa nota i octava)
    if (answerPitch === step.note) {
      correct++;
      step.status = "correct";
      feedbackEl.textContent = "Correcte!";
      feedbackEl.className   = "feedback correct";
      popFeedback(feedbackEl);
      burstStaff(staffContainer);
      btn.classList.add("correct-flash");
      playNote(step.note);
      recordTrainAnswer(step.clef, step.note, true);
      render();
      setTimeout(advance, 600);
    } else {
      wrong++;
      roundErrors++;
      step.status = "wrong";
      feedbackEl.textContent = `Era ${correctCa.toUpperCase()}`;
      feedbackEl.className   = "feedback wrong";
      popFeedback(feedbackEl);
      shakeElement(staffContainer);
      if (btn) btn.classList.add("wrong-flash");
      // Ressalta la tecla correcta perquè l'alumne vegi on era
      const correctKey = trainPiano.querySelector('[data-pitch="' + step.note + '"]');
      if (correctKey) correctKey.classList.add("correct-flash");
      playErrorSound();
      recordTrainAnswer(step.clef, step.note, false);
      render();
      setTimeout(advance, 1200);
    }
    updateStats();
    tickCounter(correctCountEl);
    tickCounter(wrongCountEl);
  }

  // ---------- TECLAT DE RESPOSTA DINÀMIC ----------
  // El piano de resposta s'adapta al rang del nivell: bàsic 1 octava,
  // intermedi 2 octaves, avançat tot el piano. Resposta per tecla EXACTA.
  const PITCH_SEMI = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 };
  const SEMI_PITCH = { 0: "c", 2: "d", 4: "e", 5: "f", 7: "g", 9: "a", 11: "b" };
  function pitchToMidi(p) {
    const parts = p.split("/");
    return (parseInt(parts[1], 10) + 1) * 12 + PITCH_SEMI[parts[0].toLowerCase()];
  }
  // Totes les notes naturals del piano (la/0 → do/8), ascendent
  const ALL_NATURAL_PITCHES = (function () {
    const out = [];
    for (let m = pitchToMidi("a/0"); m <= pitchToMidi("c/8"); m++) {
      const semi = ((m % 12) + 12) % 12;
      if (SEMI_PITCH[semi] !== undefined) {
        out.push(SEMI_PITCH[semi] + "/" + (Math.floor(m / 12) - 1));
      }
    }
    return out;
  })();

  // Genera l'HTML d'un piano: tecles blanques (data-pitch + data-note) i
  // negres decoratives entre naturals consecutives (excepte Mi-Fa i Si-Do).
  function pianoKeysHTML(whites, keyClass) {
    const N = whites.length;
    const blackPct = 62 / N;
    let html = "";
    whites.forEach((p) => {
      const ca = NOTE_NAMES_CA[noteLetter(p)] || "";
      const label = ca.charAt(0).toUpperCase() + ca.slice(1);
      html += '<button class="note-btn nk-key' + (keyClass ? " " + keyClass : "") +
              '" data-pitch="' + p + '" data-note="' + ca + '">' + label + '</button>';
    });
    whites.forEach((p, i) => {
      if (i >= N - 1) return;
      const l = noteLetter(p);
      if (l === "c" || l === "d" || l === "f" || l === "g" || l === "a") {
        const leftPct = ((i + 1) * 100) / N - blackPct / 2;
        html += '<span class="nk-blk" style="left:' + leftPct.toFixed(3) +
                '%;width:' + blackPct.toFixed(3) + '%" aria-hidden="true"></span>';
      }
    });
    return html;
  }

  // Rang de naturals segons nivell + clau (+ pitches extra).
  // REGLA MUSICAL: Do central (c/4) és l'àncora:
  //   bass  → notes ≤ c/4 (Fa queda a l'esquerra del Do central)
  //   treble → notes ≥ c/4 (Sol queda a la dreta del Do central)
  //   both   → les dues bandes; c/4 queda al mig.
  const C4_MIDI = pitchToMidi("c/4");

  function pitchesForLevelClef(levelVal, clefVal, extra) {
    const pool = [];
    if (levelVal !== null) {
      const lvl = parseInt(levelVal, 10) || 3;
      const addClef = (c) => {
        const arr = (lvl === 3 || !LEVELS[lvl]) ? RANGES[c] : LEVELS[lvl][c];
        arr.forEach((p) => {
          const m = pitchToMidi(p);
          if (c === "bass"   && m > C4_MIDI) return; // bass no pot passar del Do central
          if (c === "treble" && m < C4_MIDI) return; // treble no pot baixar del Do central
          pool.push(p);
        });
      };
      if (clefVal === "both") { addClef("treble"); addClef("bass"); }
      else addClef(clefVal);
    }
    if (extra) extra.forEach((p) => pool.push(p));
    // Sempre incloem c/4 com a àncora visible
    if (!pool.includes("c/4")) pool.push("c/4");
    const midis = pool.map(pitchToMidi);
    const minM = Math.min.apply(null, midis);
    const maxM = Math.max.apply(null, midis);
    return ALL_NATURAL_PITCHES.filter((p) => {
      const m = pitchToMidi(p);
      return m >= minM && m <= maxM;
    });
  }

  // Centra la vista sobre el Do central com a referència neutra (no revela la resposta)
  function scrollKeyboardToMiddle(piano) {
    const scroll = piano.parentElement;
    if (scroll && scroll.scrollWidth > scroll.clientWidth) {
      const ref = piano.querySelector('[data-pitch="c/4"]') || piano.querySelector(".nk-key");
      if (ref) scroll.scrollLeft = ref.offsetLeft - scroll.clientWidth / 2 + ref.offsetWidth / 2;
    }
  }

  function keyboardRangePitches() {
    if (modeSelect.value === "song") {
      // Cançons: rang exacte de les notes de la cançó sense restricció de clau
      return pitchesForLevelClef(null, null, sequence.map((s) => s.note));
    }
    // En modes aleatoris, les notes extra de la seqüència respeten la regla
    // d'àncora (bass ≤ c/4, treble ≥ c/4) perquè venen de LEVELS/RANGES ja filtrats
    return pitchesForLevelClef(levelSelect.value, clefSelect.value, sequence.map((s) => s.note));
  }

  function setSizeClass(el, n) {
    el.classList.remove("nk-md", "nk-lg", "nk-xl");
    if (n > 22) el.classList.add("nk-xl");
    else if (n > 12) el.classList.add("nk-lg");
    else if (n > 8)  el.classList.add("nk-md");
  }

  function renderAnswerKeyboard() {
    if (!trainPiano) return;
    const whites = keyboardRangePitches();
    trainPiano.innerHTML = pianoKeysHTML(whites);
    setSizeClass(trainPiano, whites.length);
  }

  function startRound() {
    buildSequence();
    renderAnswerKeyboard();
    answered = false;
    feedbackEl.textContent = "";
    feedbackEl.className   = "feedback";
    roundStartMs = 0;
    roundEndedMs = 0;
    roundErrors  = 0;
    if (roundTimerRAF) cancelAnimationFrame(roundTimerRAF);
    runTimeEl.textContent = "—";
    refreshBestTimeUI();
    render();
  }

  // Delegació: les tecles es regeneren a cada canvi de nivell/clau/mode
  trainPiano.addEventListener("click", (e) => {
    const key = e.target.closest(".nk-key");
    if (key && trainPiano.contains(key)) handleAnswer(key.dataset.pitch, key);
  });

  // ---------- CÀRREGA MUSICXML ----------
  const TYPE_TO_DUR = {
    whole:   "w",
    half:    "h",
    quarter: "q",
    eighth:  "8",
    "16th":  "16",
    "32nd":  "16"
  };

  function parseMusicXML(xmlText) {
    const doc = new DOMParser().parseFromString(xmlText, "text/xml");
    const parseErr = doc.querySelector("parsererror");
    if (parseErr) throw new Error("Error analitzant l'XML de la partitura");

    const result = [];
    const noteEls = doc.getElementsByTagName("note");

    for (let i = 0; i < noteEls.length; i++) {
      const noteEl = noteEls[i];
      // Saltem silencis, acords (repeticions de nota al mateix temps), gràcies
      if (noteEl.getElementsByTagName("rest").length > 0) continue;
      if (noteEl.getElementsByTagName("chord").length > 0) continue;
      if (noteEl.getElementsByTagName("grace").length > 0) continue;

      const pitchEl = noteEl.getElementsByTagName("pitch")[0];
      if (!pitchEl) continue;

      const step = (pitchEl.getElementsByTagName("step")[0]?.textContent || "").toLowerCase();
      const octave = pitchEl.getElementsByTagName("octave")[0]?.textContent;
      if (!step || !octave) continue;

      // Saltem notes amb alteració (sostinguts/bemolls) — no els suportem al sistema
      const alter = pitchEl.getElementsByTagName("alter")[0]?.textContent;
      if (alter && parseInt(alter, 10) !== 0) continue;

      const type = noteEl.getElementsByTagName("type")[0]?.textContent;
      const dur = TYPE_TO_DUR[type] || "q";

      // Determina clau pel staff (1=treble, 2=bass en piano)
      const staff = noteEl.getElementsByTagName("staff")[0]?.textContent;
      const clef = staff === "2" ? "bass" : "treble";

      result.push({ clef, note: step + "/" + octave, dur });
    }

    return result;
  }

  async function loadMusicXmlFile(file) {
    let xmlText;
    const name = file.name.toLowerCase();

    if (name.endsWith(".mxl")) {
      // Comprimit: descomprimim amb JSZip
      if (typeof JSZip === "undefined") {
        alert("No s'ha pogut carregar JSZip (necessari per .mxl)");
        return null;
      }
      const buf = await file.arrayBuffer();
      const zip = await JSZip.loadAsync(buf);
      // Busca la ruta del fitxer principal via META-INF/container.xml
      let rootPath = null;
      const containerFile = zip.file("META-INF/container.xml");
      if (containerFile) {
        const ctext = await containerFile.async("string");
        const cdoc = new DOMParser().parseFromString(ctext, "text/xml");
        const rf = cdoc.querySelector("rootfile");
        if (rf) rootPath = rf.getAttribute("full-path");
      }
      if (!rootPath) {
        // fallback: primer .xml/.musicxml
        const names = Object.keys(zip.files).filter(n => !zip.files[n].dir && /\.(xml|musicxml)$/i.test(n));
        rootPath = names[0];
      }
      if (!rootPath) throw new Error("Fitxer .mxl sense XML vàlid");
      xmlText = await zip.file(rootPath).async("string");
    } else {
      xmlText = await file.text();
    }

    return parseMusicXML(xmlText);
  }

  // (Carregador de partitures MusicXML tret temporalment — es reprendrà més endavant)

  function updateSongVisibility() {
    songLabel.style.display = modeSelect.value === "song" ? "" : "none";
  }
  updateSongVisibility();

  newNoteBtn.addEventListener("click", startRound);
  clefSelect.addEventListener("change", startRound);
  levelSelect.addEventListener("change", startRound);
  modeSelect.addEventListener("change", () => {
    updateSongVisibility();
    startRound();
  });
  songSelect.addEventListener("change", startRound);

  // ---------- DETECCIÓ DE PITCH (VEU / INSTRUMENT) ----------
  const micBtn    = document.getElementById("mic-btn");
  const micStatus = document.getElementById("mic-status");
  let micActive   = false;
  let micStream   = null;
  let micCtx      = null;
  let micAnalyser = null;
  let micDetector = null;
  let micRAF      = null;
  let micBuffer   = null;
  let micLastMatchAt = 0;
  let micHistory     = []; // últimes N deteccions de nota
  let micSilenceFramesSinceMatch = 999; // frames de silenci comptats des de l'últim match

  const NOTE_CLASS_BY_SEMITONE = {
    0: "do",  2: "re",  4: "mi",  5: "fa",  7: "sol", 9: "la", 11: "si"
  };
  const NATURAL_SEMITONES = [0, 2, 4, 5, 7, 9, 11];

  // Detecció de pitch per autocorrelació inline (sense CDN).
  // Retorna [freq_Hz, clarity_0_1].
  function autoCorrelatePitch(buffer, sampleRate) {
    const SIZE = buffer.length;
    // RMS
    let rms = 0;
    for (let i = 0; i < SIZE; i++) rms += buffer[i] * buffer[i];
    rms = Math.sqrt(rms / SIZE);
    if (rms < 0.005) return [0, 0];

    // Retalla silenci a inici/fi
    const thresh = 0.02;
    let r1 = 0, r2 = SIZE - 1;
    for (let i = 0; i < SIZE / 2; i++) {
      if (Math.abs(buffer[i]) >= thresh) { r1 = i; break; }
    }
    for (let i = 1; i < SIZE / 2; i++) {
      if (Math.abs(buffer[SIZE - i]) >= thresh) { r2 = SIZE - i; break; }
    }
    const trimStart = r1;
    const trimEnd   = r2;
    const n = trimEnd - trimStart;
    if (n < 100) return [0, 0];

    // Autocorrelació
    const minFreq = 70;
    const maxFreq = 1200;
    const maxLag = Math.min(n - 1, Math.floor(sampleRate / minFreq));
    const minLag = Math.floor(sampleRate / maxFreq);

    // Energia de referència (lag 0)
    let c0 = 0;
    for (let i = trimStart; i < trimEnd; i++) c0 += buffer[i] * buffer[i];
    if (c0 < 1e-6) return [0, 0];

    let bestLag = 0;
    let bestCorr = -1;
    for (let lag = minLag; lag <= maxLag; lag++) {
      let c = 0;
      const end = trimEnd - lag;
      for (let i = trimStart; i < end; i++) {
        c += buffer[i] * buffer[i + lag];
      }
      const normalized = c / c0;
      if (normalized > bestCorr) {
        bestCorr = normalized;
        bestLag = lag;
      }
    }
    if (bestLag < minLag) return [0, 0];

    // Interpolació parabòlica per precisió sub-mostra
    let refinedLag = bestLag;
    if (bestLag > minLag && bestLag < maxLag) {
      const lm1 = bestLag - 1, lp1 = bestLag + 1;
      let cm = 0, cp = 0;
      for (let i = trimStart; i < trimEnd - lm1; i++) cm += buffer[i] * buffer[i + lm1];
      for (let i = trimStart; i < trimEnd - lp1; i++) cp += buffer[i] * buffer[i + lp1];
      const cb = bestCorr * c0;
      const denom = cm - 2 * cb + cp;
      if (Math.abs(denom) > 1e-9) {
        const delta = 0.5 * (cm - cp) / denom;
        refinedLag = bestLag + delta;
      }
    }

    const freq = sampleRate / refinedLag;
    return [freq, Math.max(0, bestCorr)];
  }

  // Wrapper per compatibilitat amb la crida micDetector.findPitch(buffer, sampleRate)
  const micDetectorObj = { findPitch: autoCorrelatePitch };

  function freqToNoteCa(freq) {
    // MIDI (continu) a partir de freq: A4=69
    const midi = 12 * Math.log2(freq / 440) + 69;
    const semi = ((midi % 12) + 12) % 12; // 0 .. 12
    // Trobem la nota natural més propera (distància circular en semitons)
    let bestSemi = 0;
    let bestDist = 100;
    for (const n of NATURAL_SEMITONES) {
      let d = Math.abs(n - semi);
      if (d > 6) d = 12 - d;
      if (d < bestDist) {
        bestDist = d;
        bestSemi = n;
      }
    }
    // Acceptem fins a 0.85 semitons (~85 cents) de desviació
    if (bestDist > 0.85) return null;
    return NOTE_CLASS_BY_SEMITONE[bestSemi] || null;
  }

  async function startMic() {
    try {
      micStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,   // abans true → filtrava la veu com a soroll
          autoGainControl: false     // abans true → atenuava el senyal
        }
      });
    } catch (e) {
      alert("No s'ha pogut accedir al micròfon. Dona permís al navegador.");
      return;
    }

    try {
      if (!micCtx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        micCtx = new AC();
      }
      if (micCtx.state === "suspended") await micCtx.resume();

      const source = micCtx.createMediaStreamSource(micStream);
      micAnalyser = micCtx.createAnalyser();
      micAnalyser.fftSize = 2048;
      micAnalyser.smoothingTimeConstant = 0;
      // Connexió directa sense filtres per diagnosticar
      source.connect(micAnalyser);

      micDetector = micDetectorObj;
      micBuffer = new Float32Array(micAnalyser.fftSize);

      console.log("[MIC] Stream actiu. sampleRate:", micCtx.sampleRate,
                  "tracks:", micStream.getAudioTracks().map(t => t.label + " enabled=" + t.enabled + " muted=" + t.muted));
    } catch (e) {
      alert("Error inicialitzant la detecció de so: " + e.message);
      stopMic();
      return;
    }

    micActive = true;
    micHistory = [];
    micLastMatchAt = 0;
    micSilenceFramesSinceMatch = 999;
    micBtn.classList.add("active");
    micBtn.textContent = "🔴 Escoltant so...";
    micLoop();
  }

  function stopMic() {
    micActive = false;
    if (micRAF) cancelAnimationFrame(micRAF);
    if (micStream) micStream.getTracks().forEach(t => t.stop());
    micStream = null;
    micBtn.classList.remove("active");
    micBtn.textContent = "🎹 So";
    micStatus.textContent = "";
    micStatus.classList.remove("detected");
  }

  function micLoop() {
    if (!micActive || !micAnalyser || !micDetector) return;
    micAnalyser.getFloatTimeDomainData(micBuffer);

    let sumSq = 0;
    for (let i = 0; i < micBuffer.length; i++) sumSq += micBuffer[i] * micBuffer[i];
    const rms = Math.sqrt(sumSq / micBuffer.length);

    const MIN_RMS_DETECT  = 0.01;  // sensible per micròfons fluixos
    const MIN_RMS_SILENCE = 0.005;
    const MIN_CLARITY     = 0.85;
    const SILENCE_FRAMES_REQUIRED = 10;

    const isSilent = rms < MIN_RMS_SILENCE;
    if (isSilent) micSilenceFramesSinceMatch++;

    // SEMPRE mostrem el RMS per poder diagnosticar
    const rmsStr = "rms:" + rms.toFixed(3);

    if (rms > MIN_RMS_DETECT) {
      const [freq, clarity] = micDetector.findPitch(micBuffer, micCtx.sampleRate);
      if (freq > 60 && freq < 1500) {
        const noteCa = freqToNoteCa(freq);
        micStatus.textContent = (noteCa ? noteCa.toUpperCase() : "?") +
                                "  " + Math.round(freq) + "Hz  " + rmsStr +
                                "  c:" + clarity.toFixed(2);
        if (noteCa && clarity > MIN_CLARITY) {
          micStatus.classList.add("detected");

          micHistory.push(noteCa);
          if (micHistory.length > 6) micHistory.shift();

          if (micHistory.length >= 6 && micSilenceFramesSinceMatch >= SILENCE_FRAMES_REQUIRED) {
            const counts = {};
            micHistory.forEach(n => counts[n] = (counts[n] || 0) + 1);
            let bestNote = null, bestCount = 0;
            for (const n in counts) {
              if (counts[n] > bestCount) { bestCount = counts[n]; bestNote = n; }
            }
            const now = performance.now();
            if (bestCount >= 4 && now - micLastMatchAt > 1000) {
              micLastMatchAt = now;
              micSilenceFramesSinceMatch = 0;
              micHistory = [];
              // Si el nom detectat coincideix amb la nota actual, clica la tecla
              // exacta (octava correcta); si no, la primera tecla amb aquell nom.
              let btn = null;
              if (currentStep < sequence.length) {
                const cur = sequence[currentStep];
                if (NOTE_NAMES_CA[noteLetter(cur.note)] === bestNote) {
                  btn = trainPiano.querySelector('[data-pitch="' + cur.note + '"]');
                }
              }
              if (!btn) btn = trainPiano.querySelector('.nk-key[data-note="' + bestNote + '"]');
              if (btn) btn.click();
            }
          }
        } else {
          micStatus.classList.remove("detected");
        }
      } else {
        micStatus.textContent = "senyal  " + rmsStr;
        micStatus.classList.remove("detected");
      }
    } else {
      micStatus.textContent = "🔇 " + rmsStr;
      micStatus.classList.remove("detected");
      micHistory = [];
    }

    micRAF = requestAnimationFrame(micLoop);
  }

  micBtn.addEventListener("click", () => {
    if (micActive) stopMic();
    else startMic();
  });

  // Parem el mic si l'usuari canvia de pestanya
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && micActive) stopMic();
  });

  window.addEventListener("resize", () => {
    if (document.getElementById("screen-train").classList.contains("active") && sequence.length > 0) {
      render();
    }
    if (document.getElementById("screen-reference").classList.contains("active")) {
      renderReference();
    }
    const rlScreen = document.getElementById("screen-sightread");
    if (rlScreen && rlScreen.classList.contains("active") && typeof rlRender === "function") {
      rlRender();
    }
    if (document.getElementById("screen-speed").classList.contains("active") && spRunning) {
      spBuildStage();
    }
    const huScreen = document.getElementById("screen-hunt");
    if (huScreen && huScreen.classList.contains("active") && typeof huShowMemorize === "function" && huState !== "idle") {
      huShowMemorize();
    }
  });

  // ---------- REFERÈNCIA ----------
  const refClefSelect    = document.getElementById("ref-clef-select");
  const refStaffContainer = document.getElementById("ref-staff-container");

  function renderReferenceStaff(clef, xOffset, yOffset, context, staveWidth) {
    const notes     = clef === "bass" ? [...RANGES[clef]].reverse() : RANGES[clef];
    const clefSpace = 70;
    const rightPad  = 40;
    const noteSpace = Math.max(14, (staveWidth - clefSpace - rightPad) / notes.length);

    const stave = new VF.Stave(xOffset, yOffset, staveWidth);
    // Sense barres (ni inicial ni final): no tenen sentit a una carta de referència
    // i produïen marques visuals a l'extrem dret que no corresponen a cap nota.
    stave.setBegBarType(VF.Barline.type.NONE);
    stave.setEndBarType(VF.Barline.type.NONE);
    stave.addClef(clef).setContext(context).draw();

    // Notes SENSE annotation (perquè el Formatter no les separi per longitud del text)
    const staveNotes = notes.map((n) => new VF.StaveNote({ clef, keys: [n], duration: "w" }));

    const voice = new VF.Voice({ num_beats: notes.length, beat_value: 1 })
      .setMode(VF.Voice.Mode.SOFT)
      .addTickables(staveNotes);

    new VF.Formatter()
      .joinVoices([voice])
      .format([voice], staveWidth - clefSpace - rightPad);

    voice.draw(context, stave);

    const svg = context.svg;
    const SVG_NS = "http://www.w3.org/2000/svg";

    // Etiquetes de text i zones clicables, usant la posició real de cada nota
    staveNotes.forEach((sn, i) => {
      let bb = null;
      try { bb = sn.getBoundingBox(); } catch (e) { bb = null; }
      if (!bb) return;
      const x = typeof bb.getX === "function" ? bb.getX() : bb.x;
      const y = typeof bb.getY === "function" ? bb.getY() : bb.y;
      const w = typeof bb.getW === "function" ? bb.getW() : bb.w;
      const h = typeof bb.getH === "function" ? bb.getH() : bb.h;
      const cx = x + w / 2;

      // Etiqueta DO/RE/MI... centrada a sobre de la nota.
      // En mòbil, l'SVG s'escala 0.55 via CSS, així que pugem la mida intrínseca.
      const label = NOTE_NAMES_CA[noteLetter(notes[i])].toUpperCase();
      const fontSize = Math.min(13, Math.max(9, noteSpace * 0.3));
      const text = document.createElementNS(SVG_NS, "text");
      text.setAttribute("x", cx);
      text.setAttribute("y", y - 4);
      text.setAttribute("text-anchor", "middle");
      text.setAttribute("font-family", "Arial, sans-serif");
      text.setAttribute("font-size", fontSize);
      text.setAttribute("font-weight", "bold");
      text.setAttribute("fill", "#3498db");
      text.textContent = label;
      svg.appendChild(text);

      // Zona clicable: rectangle ampli centrat a la nota, tallat pel noteSpace
      const rect = document.createElementNS(SVG_NS, "rect");
      const rw = Math.max(noteSpace, 20);
      rect.setAttribute("x", cx - rw / 2);
      rect.setAttribute("y", y - 24);
      rect.setAttribute("width", rw);
      rect.setAttribute("height", h + 48);
      rect.setAttribute("fill", "rgba(0,0,0,0.001)");
      rect.setAttribute("stroke", "none");
      rect.style.pointerEvents = "all";
      rect.style.cursor = "pointer";
      const handler = (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        openNoteModal(clef, notes[i]);
      };
      rect.addEventListener("click", handler);
      rect.addEventListener("touchend", handler);
      svg.appendChild(rect);
    });

    return staveWidth;
  }

  // ---------- MODAL NOTA ----------
  // ---------- ÀUDIO ----------
  const MIDI_OFFSETS = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 };

  let piano = null;
  let pianoReady = false;

  if (typeof Tone !== "undefined") {
    try {
      piano = new Tone.Sampler({
        urls: {
          A0:  "A0.mp3",
          C1:  "C1.mp3", "D#1": "Ds1.mp3", "F#1": "Fs1.mp3", A1: "A1.mp3",
          C2:  "C2.mp3", "D#2": "Ds2.mp3", "F#2": "Fs2.mp3", A2: "A2.mp3",
          C3:  "C3.mp3", "D#3": "Ds3.mp3", "F#3": "Fs3.mp3", A3: "A3.mp3",
          C4:  "C4.mp3", "D#4": "Ds4.mp3", "F#4": "Fs4.mp3", A4: "A4.mp3",
          C5:  "C5.mp3", "D#5": "Ds5.mp3", "F#5": "Fs5.mp3", A5: "A5.mp3",
          C6:  "C6.mp3", "D#6": "Ds6.mp3", "F#6": "Fs6.mp3", A6: "A6.mp3",
          C7:  "C7.mp3", "D#7": "Ds7.mp3", "F#7": "Fs7.mp3", A7: "A7.mp3",
          C8:  "C8.mp3"
        },
        release: 1,
        baseUrl: "https://tonejs.github.io/audio/salamander/"
      }).toDestination();
      Tone.loaded().then(() => { pianoReady = true; });
    } catch (e) {
      piano = null;
    }
  }

  let audioCtx = null;
  function getAudioCtx() {
    if (!audioCtx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) audioCtx = new AC();
    }
    if (audioCtx && audioCtx.state === "suspended") audioCtx.resume();
    return audioCtx;
  }

  function noteToFrequency(noteKey) {
    const [letter, octStr] = noteKey.split("/");
    const midi = (parseInt(octStr, 10) + 1) * 12 + MIDI_OFFSETS[letter];
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  function playSynthNote(noteKey) {
    const ctx = getAudioCtx();
    if (!ctx) return;
    const freq = noteToFrequency(noteKey);
    const now  = ctx.currentTime;
    const dur  = 1.6;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.35, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
    gain.connect(ctx.destination);

    const partials = [
      { ratio: 1, gain: 1.0,  type: "triangle" },
      { ratio: 2, gain: 0.25, type: "sine" },
      { ratio: 3, gain: 0.08, type: "sine" }
    ];
    partials.forEach(p => {
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = p.type;
      osc.frequency.value = freq * p.ratio;
      oscGain.gain.value = p.gain;
      osc.connect(oscGain).connect(gain);
      osc.start(now);
      osc.stop(now + dur);
    });
  }

  function playCongratulations() {
    // Arpegi ascendent C-E-G-C alegre amb el so de piano (rècord superat)
    const notes = ["c/5", "e/5", "g/5", "c/6"];
    notes.forEach((n, i) => {
      setTimeout(() => playNote(n), i * 130);
    });
  }

  function playEncouragement() {
    // Encoratjament petit: 2 notes (no tan gratificant com el rècord)
    setTimeout(() => playNote("e/5"), 0);
    setTimeout(() => playNote("g/5"), 150);
  }

  function playErrorSound() {
    const ctx = getAudioCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.25);
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.3);
  }

  function playNote(noteKey) {
    if (piano && pianoReady) {
      try {
        if (Tone.context.state !== "running") Tone.start();
        const [letter, octStr] = noteKey.split("/");
        const name = letter.toUpperCase() + octStr;
        piano.triggerAttackRelease(name, "2n");
        return;
      } catch (e) {
        // cau al synth
      }
    }
    playSynthNote(noteKey);
  }

  const COLOR_MAIN = "#3498db";
  const COLOR_SEC  = "#f39c12";

  function getClefForNote(noteKey) {
    const [letter, octStr] = noteKey.split("/");
    const midi = (parseInt(octStr, 10) + 1) * 12 + MIDI_OFFSETS[letter];
    return midi < 60 ? "bass" : "treble";
  }

  function pitchValue(noteKey) {
    const [letter, octStr] = noteKey.split("/");
    return parseInt(octStr, 10) * 12 + MIDI_OFFSETS[letter];
  }

  const noteModal       = document.getElementById("note-modal");
  const modalStaff      = document.getElementById("modal-staff");
  const modalPiano      = document.getElementById("modal-piano");
  const modalNoteNameEl = document.getElementById("modal-note-name");
  const modalCloseBtn   = document.getElementById("modal-close-btn");
  const modalBackdrop   = noteModal.querySelector(".modal-backdrop");

  let modalMainClef  = null;
  let modalMainNote  = null;
  let modalSecondary = null; // { clef, note }

  function renderModalStaff(container, mainClef, mainNote, secondary) {
    container.innerHTML = "";

    const containerWidth = Math.max(280, container.clientWidth);
    const height         = 460;
    // Pentagrama estret centrat al contenidor; nota centrada dins el pentagrama
    const staveWidth     = 180;
    const staveX         = Math.round((containerWidth - staveWidth) / 2);
    const trebleY        = 140;
    const bassY          = 280;

    const renderer = new VF.Renderer(container, VF.Renderer.Backends.SVG);
    renderer.resize(containerWidth, height);
    const context = renderer.getContext();

    const trebleStave = new VF.Stave(staveX, trebleY, staveWidth);
    trebleStave.addClef("treble").setContext(context).draw();
    const bassStave = new VF.Stave(staveX, bassY, staveWidth);
    bassStave.addClef("bass").setContext(context).draw();

    const ct = VF.StaveConnector.type;
    new VF.StaveConnector(trebleStave, bassStave).setType(ct.BRACE).setContext(context).draw();
    new VF.StaveConnector(trebleStave, bassStave).setType(ct.SINGLE_LEFT).setContext(context).draw();
    new VF.StaveConnector(trebleStave, bassStave).setType(ct.SINGLE_RIGHT).setContext(context).draw();

    const trebleInfos = [];
    const bassInfos   = [];
    const mainTarget  = mainClef === "treble" ? trebleInfos : bassInfos;
    mainTarget.push({ note: mainNote, color: COLOR_MAIN });
    if (secondary) {
      const secTarget = secondary.clef === "treble" ? trebleInfos : bassInfos;
      secTarget.push({ note: secondary.note, color: COLOR_SEC });
    }

    function buildStaveNote(clef, infos) {
      if (infos.length === 0) {
        return new VF.StaveNote({ clef, keys: [clef === "treble" ? "b/4" : "d/3"], duration: "wr" });
      }
      infos.sort((a, b) => pitchValue(a.note) - pitchValue(b.note));
      const keys = infos.map(x => x.note);
      const sn = new VF.StaveNote({ clef, keys, duration: "w" });
      infos.forEach((info, i) => {
        sn.setKeyStyle(i, { fillStyle: info.color, strokeStyle: info.color });
      });
      return sn;
    }

    const trebleNote = buildStaveNote("treble", trebleInfos);
    const bassNote   = buildStaveNote("bass",   bassInfos);

    // [GhostNote, note] amb voice de 8 beats: la nota acaba al tick 4 = 50% de l'àrea de format
    // Combinat amb format width = (staveWidth - clefWidth*2) la nota cau al centre del pentagrama
    const trebleEls = [new VF.GhostNote({ duration: "w" }), trebleNote];
    const bassEls   = [new VF.GhostNote({ duration: "w" }), bassNote];
    const tv = new VF.Voice({ num_beats: 8, beat_value: 4 }).addTickables(trebleEls);
    const bv = new VF.Voice({ num_beats: 8, beat_value: 4 }).addTickables(bassEls);

    new VF.Formatter()
      .joinVoices([tv, bv])
      .format([tv, bv], staveWidth - 90);

    tv.draw(context, trebleStave);
    bv.draw(context, bassStave);

    // Click-to-play overlay sobre la nota principal
    const mainStaveNote = mainClef === "treble" ? trebleNote : bassNote;
    let bb = null;
    try { bb = mainStaveNote.getBoundingBox(); } catch (e) { bb = null; }
    if (bb) {
      const x = typeof bb.getX === "function" ? bb.getX() : bb.x;
      const y = typeof bb.getY === "function" ? bb.getY() : bb.y;
      const w = typeof bb.getW === "function" ? bb.getW() : bb.w;
      const h = typeof bb.getH === "function" ? bb.getH() : bb.h;
      const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      rect.setAttribute("x", x - 8);
      rect.setAttribute("y", y - 10);
      rect.setAttribute("width",  w + 16);
      rect.setAttribute("height", h + 20);
      rect.setAttribute("fill", "transparent");
      rect.setAttribute("stroke", "none");
      rect.style.cursor = "pointer";
      rect.addEventListener("click", () => playNote(mainNote));
      context.svg.appendChild(rect);
    }
  }

  function renderPiano(container, mainNote, secondaryNote) {
    container.innerHTML = "";
    const [mainLetterLower, mainOctStr] = mainNote.split("/");
    const mainLetter = mainLetterLower.toUpperCase();
    const mainOct    = parseInt(mainOctStr, 10);

    let secLetter = null, secOct = null;
    if (secondaryNote) {
      const [sl, so] = secondaryNote.split("/");
      secLetter = sl.toUpperCase();
      secOct    = parseInt(so, 10);
    }

    const letters    = ["C","D","E","F","G","A","B"];
    const blackAfter = { C: true, D: true, E: false, F: true, G: true, A: true, B: false };

    const allWhites = [];
    allWhites.push({ letter: "A", oct: 0 });
    allWhites.push({ letter: "B", oct: 0 });
    for (let oct = 1; oct <= 7; oct++) {
      for (const L of letters) allWhites.push({ letter: L, oct });
    }
    allWhites.push({ letter: "C", oct: 8 });

    const whiteWidth  = 14;
    const whiteHeight = 80;
    const blackWidth  = 9;
    const blackHeight = 50;
    const totalWidth  = allWhites.length * whiteWidth;

    const SVG_NS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("viewBox", `0 0 ${totalWidth} ${whiteHeight}`);
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");

    allWhites.forEach((k, i) => {
      const rect = document.createElementNS(SVG_NS, "rect");
      rect.setAttribute("x", i * whiteWidth);
      rect.setAttribute("y", 0);
      rect.setAttribute("width", whiteWidth);
      rect.setAttribute("height", whiteHeight);
      const isMain = (k.letter === mainLetter && k.oct === mainOct);
      const isSec  = (secondaryNote && k.letter === secLetter && k.oct === secOct);
      let fill = "#F6EFE0"; /* cream paper, coherent amb pentagrames */
      if (isMain) fill = COLOR_MAIN;
      else if (isSec) fill = COLOR_SEC;
      rect.setAttribute("fill", fill);
      rect.setAttribute("stroke", "#6B4E2E");
      rect.setAttribute("stroke-width", "1");
      rect.style.cursor = "pointer";
      const noteKey = k.letter.toLowerCase() + "/" + k.oct;
      rect.addEventListener("click", () => handlePianoKeyClick(noteKey));
      svg.appendChild(rect);

      if (k.letter === "C") {
        const label = document.createElementNS(SVG_NS, "text");
        label.setAttribute("x", i * whiteWidth + whiteWidth / 2);
        label.setAttribute("y", whiteHeight - 4);
        label.setAttribute("text-anchor", "middle");
        label.setAttribute("font-size", "7");
        label.setAttribute("fill", (isMain || isSec) ? "#fff" : "#888");
        label.setAttribute("pointer-events", "none");
        label.textContent = "C" + k.oct;
        svg.appendChild(label);
      }
    });

    allWhites.forEach((k, i) => {
      if (!blackAfter[k.letter]) return;
      if (i === allWhites.length - 1) return;
      const rect = document.createElementNS(SVG_NS, "rect");
      rect.setAttribute("x", (i + 1) * whiteWidth - blackWidth / 2);
      rect.setAttribute("y", 0);
      rect.setAttribute("width", blackWidth);
      rect.setAttribute("height", blackHeight);
      rect.setAttribute("fill", "#1a1a1a");
      rect.setAttribute("stroke", "#000");
      rect.setAttribute("stroke-width", "0.5");
      rect.setAttribute("pointer-events", "none");
      svg.appendChild(rect);
    });

    container.appendChild(svg);
  }

  function handlePianoKeyClick(noteKey) {
    playNote(noteKey);
    if (noteKey === modalMainNote) return;
    modalSecondary = { clef: getClefForNote(noteKey), note: noteKey };
    renderModalStaff(modalStaff, modalMainClef, modalMainNote, modalSecondary);
    renderPiano(modalPiano, modalMainNote, modalSecondary.note);
  }

  function openNoteModal(clef, noteKey) {
    modalMainClef  = clef;
    modalMainNote  = noteKey;
    modalSecondary = null;
    modalNoteNameEl.textContent = NOTE_NAMES_CA[noteLetter(noteKey)].toUpperCase();
    noteModal.classList.remove("hidden");
    noteModal.setAttribute("aria-hidden", "false");
    requestAnimationFrame(() => {
      renderModalStaff(modalStaff, clef, noteKey, null);
      renderPiano(modalPiano, noteKey, null);
    });
    playNote(noteKey);
  }

  function closeNoteModal() {
    noteModal.classList.add("hidden");
    noteModal.setAttribute("aria-hidden", "true");
    modalStaff.innerHTML = "";
    modalPiano.innerHTML = "";
    modalMainClef  = null;
    modalMainNote  = null;
    modalSecondary = null;
  }

  modalCloseBtn.addEventListener("click", closeNoteModal);
  modalBackdrop.addEventListener("click", closeNoteModal);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !noteModal.classList.contains("hidden")) closeNoteModal();
  });

  function renderReference() {
    refStaffContainer.innerHTML = "";
    const sel = refClefSelect.value;
    const clefs = sel === "both" ? ["treble", "bass"] : [sel];

    const isMobile = window.innerWidth < 600;
    // En mòbil rendrem més ample per llegibilitat i activem scroll horitzontal al contenidor
    const containerWidth = isMobile
      ? Math.max(900, refStaffContainer.clientWidth)
      : Math.max(400, refStaffContainer.clientWidth);
    const sideMargin = 20;
    const staveWidth = containerWidth - sideMargin * 2;
    const topPad      = 150;
    const perStave    = 200;
    const bottomPad   = 100;
    const totalHeight = topPad + clefs.length * perStave + bottomPad;

    const renderer = new VF.Renderer(refStaffContainer, VF.Renderer.Backends.SVG);
    renderer.resize(containerWidth, totalHeight);
    const context = renderer.getContext();

    clefs.forEach((clef, idx) => {
      renderReferenceStaff(clef, sideMargin, topPad + idx * perStave, context, staveWidth);
    });
  }

  refClefSelect.addEventListener("change", renderReference);

  // ---------- STAFF GENÈRIC (grand staff amb una nota) ----------
  function renderSingleOnGrandStaff(container, activeClef, noteKey, highlightColor) {
    container.innerHTML = "";

    const containerWidth = Math.max(400, container.clientWidth);
    const height         = 460;
    const staveX         = 20;
    const staveWidth     = containerWidth - staveX - 20;
    const trebleY        = 140;
    const bassY          = 280;

    const renderer = new VF.Renderer(container, VF.Renderer.Backends.SVG);
    renderer.resize(containerWidth, height);
    const context = renderer.getContext();

    const trebleStave = new VF.Stave(staveX, trebleY, staveWidth);
    trebleStave.addClef("treble").setContext(context).draw();
    const bassStave = new VF.Stave(staveX, bassY, staveWidth);
    bassStave.addClef("bass").setContext(context).draw();

    const ct = VF.StaveConnector.type;
    new VF.StaveConnector(trebleStave, bassStave).setType(ct.BRACE).setContext(context).draw();
    new VF.StaveConnector(trebleStave, bassStave).setType(ct.SINGLE_LEFT).setContext(context).draw();
    new VF.StaveConnector(trebleStave, bassStave).setType(ct.SINGLE_RIGHT).setContext(context).draw();

    const trebleNote = activeClef === "treble"
      ? new VF.StaveNote({ clef: "treble", keys: [noteKey], duration: "w" })
      : new VF.StaveNote({ clef: "treble", keys: ["b/4"],   duration: "wr" });
    const bassNote = activeClef === "bass"
      ? new VF.StaveNote({ clef: "bass", keys: [noteKey], duration: "w" })
      : new VF.StaveNote({ clef: "bass", keys: ["d/3"],   duration: "wr" });

    if (highlightColor) {
      const target = activeClef === "treble" ? trebleNote : bassNote;
      target.setStyle({ fillStyle: highlightColor, strokeStyle: highlightColor });
    }

    const tv = new VF.Voice({ num_beats: 4, beat_value: 4 }).addTickables([trebleNote]);
    const bv = new VF.Voice({ num_beats: 4, beat_value: 4 }).addTickables([bassNote]);

    new VF.Formatter()
      .joinVoices([tv, bv])
      .format([tv, bv], Math.max(150, staveWidth - 80));

    tv.draw(context, trebleStave);
    bv.draw(context, bassStave);
  }

  // ---------- PENTAGRAMA RELÀMPEC (puzzle diari estil Wordle) ----------
  const rlLevelEl     = document.getElementById("rl-level");
  const rlModeEl      = document.getElementById("rl-mode");
  const rlStartBtn    = document.getElementById("rl-start-btn");
  const rlRevealBtn   = document.getElementById("rl-reveal-btn");
  const rlCountdownEl = document.getElementById("rl-countdown");
  const rlCountdownTimeEl = document.getElementById("rl-countdown-time");
  const rlStaffEl     = document.getElementById("rl-staff-container");
  const rlCurrentNoteEl = document.getElementById("rl-current-note");
  const rlAttemptsEl  = document.getElementById("rl-attempts");
  const rlFeedbackEl  = document.getElementById("rl-feedback");
  const rlNoteButtons = document.querySelectorAll(".rl-note-btn");
  const rlPuzzleNumEl = document.getElementById("rl-puzzle-num");
  const rlDateEl      = document.getElementById("rl-date");
  const rlStreakNumEl = document.getElementById("rl-streak-num");
  const rlPlayedEl    = document.getElementById("rl-played");
  const rlWonEl       = document.getElementById("rl-won");
  const rlWinrateEl   = document.getElementById("rl-winrate");
  const rlBestStreakEl = document.getElementById("rl-best-streak");
  const rlResultModal = document.getElementById("rl-result-modal");
  const rlResultBadge = document.getElementById("rl-result-badge");
  const rlResultTitle = document.getElementById("rl-result-title");
  const rlResultSub   = document.getElementById("rl-result-sub");
  const rlResultGrid  = document.getElementById("rl-result-grid");
  const rlResultStreakNum = document.getElementById("rl-result-streak-num");
  const rlDistRowsEl  = document.getElementById("rl-dist-rows");
  const rlShareBtn    = document.getElementById("rl-share-btn");
  const rlFreeBtn     = document.getElementById("rl-free-btn");
  const rlResultCountdown = document.getElementById("rl-result-countdown");

  const RL_STATE_KEY    = "rlState_v1";
  const RL_EPOCH        = Date.UTC(2026, 0, 1); // 2026-01-01 = Relàmpec #1
  const RL_MAX_ATTEMPTS = 3;
  const RL_FAST_MS      = 1500;   // <1.5s → 🟩
  const RL_SLOW_MS      = 4000;   // >4s → 🟨 per defecte encara que sigui correcte (massa lent)

  const RL_LEVELS = {
    1: { label: "L1 · Principiant", notes: 6,  clefs: ["treble"],           pool: ["c/4","d/4","e/4","f/4","g/4","a/4","b/4","c/5"] },
    2: { label: "L2 · Bàsic",       notes: 8,  clefs: ["treble"],           pool: ["c/4","d/4","e/4","f/4","g/4","a/4","b/4","c/5","d/5","e/5","f/5","g/5"] },
    3: { label: "L3 · Intermedi",   notes: 10, clefs: ["treble","bass"],    poolTreble: ["c/4","d/4","e/4","f/4","g/4","a/4","b/4","c/5","d/5","e/5","f/5","g/5"],
                                                                            poolBass:   ["e/2","f/2","g/2","a/2","b/2","c/3","d/3","e/3","f/3","g/3","a/3","b/3","c/4"] },
    4: { label: "L4 · Avançat",     notes: 12, clefs: ["treble","bass"],    poolTreble: ["a/3","b/3","c/4","d/4","e/4","f/4","g/4","a/4","b/4","c/5","d/5","e/5","f/5","g/5","a/5","b/5","c/6"],
                                                                            poolBass:   ["c/2","d/2","e/2","f/2","g/2","a/2","b/2","c/3","d/3","e/3","f/3","g/3","a/3","b/3","c/4","d/4","e/4"] },
    5: { label: "L5 · Pro",         notes: 16, clefs: ["treble","bass"],    poolTreble: null, poolBass: null } // usa RANGES complet
  };

  // --- Mulberry32 PRNG (determinista per llavor numèrica) ---
  function rlMulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function rlSeedForDate(d, level) {
    const y = d.getUTCFullYear();
    const m = d.getUTCMonth() + 1;
    const day = d.getUTCDate();
    return (y * 10000 + m * 100 + day) * 7 + level * 97;
  }
  function rlPuzzleNumForDate(d) {
    const today = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
    return Math.floor((today - RL_EPOCH) / 86400000) + 1;
  }
  function rlToday() { return new Date(); }
  function rlFormatDateCat(d) {
    const months = ["gen","feb","mar","abr","mai","jun","jul","ago","set","oct","nov","des"];
    return d.getDate() + " " + months[d.getMonth()] + " " + d.getFullYear();
  }
  function rlDateKey(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return y + "-" + m + "-" + day;
  }
  function rlPickFrom(rng, arr) { return arr[Math.floor(rng() * arr.length)]; }

  function rlGeneratePuzzle(level, rng) {
    const cfg = RL_LEVELS[level];
    const notes = [];
    let lastKey = null;
    for (let i = 0; i < cfg.notes; i++) {
      let clef, poolArr;
      if (cfg.clefs.length === 1) {
        clef = cfg.clefs[0];
        poolArr = cfg.pool;
      } else {
        clef = cfg.clefs[Math.floor(rng() * cfg.clefs.length)];
        if (level === 5) {
          poolArr = RANGES[clef];
        } else {
          poolArr = clef === "treble" ? cfg.poolTreble : cfg.poolBass;
        }
      }
      let n = rlPickFrom(rng, poolArr);
      // evita la mateixa nota consecutiva (una mica més musical)
      let tries = 0;
      while (n === lastKey && tries < 4) { n = rlPickFrom(rng, poolArr); tries++; }
      lastKey = n;
      notes.push({ clef, note: n });
    }
    return notes;
  }

  // --- Estat persistent ---
  function rlLoadAll() {
    try { return JSON.parse(localStorage.getItem(RL_STATE_KEY) || "{}"); } catch (e) { return {}; }
  }
  function rlSaveAll(all) {
    try { localStorage.setItem(RL_STATE_KEY, JSON.stringify(all)); } catch (e) {}
  }
  function rlGetProfileState() {
    const all = rlLoadAll();
    const p = currentProfile();
    if (!all[p]) all[p] = { byLevel: {}, preferences: { mode: "daily" } };
    if (!all[p].byLevel) all[p].byLevel = {};
    if (!all[p].preferences) all[p].preferences = { mode: "daily" };
    return all[p];
  }
  function rlSaveProfileState(state) {
    const all = rlLoadAll();
    all[currentProfile()] = state;
    rlSaveAll(all);
  }
  function rlGetLevelStats(level) {
    const st = rlGetProfileState();
    if (!st.byLevel[level]) {
      st.byLevel[level] = {
        played: 0,
        won: 0,
        currentStreak: 0,
        bestStreak: 0,
        distribution: { "1": 0, "2": 0, "3": 0, "X": 0 },
        lastPuzzleNum: 0,
        lastPuzzleDone: null,
        lastPlayDate: null
      };
      rlSaveProfileState(st);
    }
    return st.byLevel[level];
  }
  function rlSetLevelStats(level, stats) {
    const st = rlGetProfileState();
    st.byLevel[level] = stats;
    rlSaveProfileState(st);
  }

  // --- Estat en memòria del joc actual ---
  let rlGame = null;
  // rlGame = {
  //   mode: "daily" | "free",
  //   level: 1-5,
  //   puzzleNum: int,
  //   notes: [{clef, note}],
  //   attempts: [[emoji...], ...],      // històric intents completats
  //   currentAttempt: [emoji...],       // en curs
  //   noteIdx: 0,
  //   noteStart: ms,
  //   state: "idle" | "playing" | "won" | "lost" | "revealed",
  // }

  function rlNewGame(mode, level) {
    const cfg = RL_LEVELS[level];
    let rng, puzzleNum;
    if (mode === "daily") {
      const d = rlToday();
      rng = rlMulberry32(rlSeedForDate(d, level));
      puzzleNum = rlPuzzleNumForDate(d);
    } else {
      rng = rlMulberry32(((Date.now() >>> 0) ^ (level * 1313)) >>> 0);
      puzzleNum = 0;
    }
    const notes = rlGeneratePuzzle(level, rng);
    rlGame = {
      mode, level, puzzleNum, notes,
      attempts: [], currentAttempt: [],
      noteIdx: 0, noteStart: 0,
      state: "idle"
    };
    return rlGame;
  }

  // --- VexFlow rendering ---
  function rlRender() {
    rlStaffEl.innerHTML = "";
    if (!rlGame) return;

    const cfg = RL_LEVELS[rlGame.level];
    const grandStaff = cfg.clefs.length === 2;
    const containerWidth = Math.max(400, rlStaffEl.clientWidth || 800);
    const height = grandStaff ? 300 : 180;
    const staveX = 16;
    const staveWidth = containerWidth - staveX - 16;
    const trebleY = 40;
    const bassY = 160;

    const renderer = new VF.Renderer(rlStaffEl, VF.Renderer.Backends.SVG);
    renderer.resize(containerWidth, height);
    const context = renderer.getContext();

    const trebleStave = new VF.Stave(staveX, trebleY, staveWidth);
    trebleStave.addClef("treble").setContext(context).draw();
    let bassStave = null;
    if (grandStaff) {
      bassStave = new VF.Stave(staveX, bassY, staveWidth);
      bassStave.addClef("bass").setContext(context).draw();
      const ct = VF.StaveConnector.type;
      new VF.StaveConnector(trebleStave, bassStave).setType(ct.BRACE).setContext(context).draw();
      new VF.StaveConnector(trebleStave, bassStave).setType(ct.SINGLE_LEFT).setContext(context).draw();
      new VF.StaveConnector(trebleStave, bassStave).setType(ct.SINGLE_RIGHT).setContext(context).draw();
    }

    const N = rlGame.notes.length;

    function colorFor(i) {
      if (rlGame.state === "revealed" || rlGame.state === "lost") return "#222";
      // Durant joc: done=segons emoji, current=cyan, upcoming=clar
      if (i < rlGame.noteIdx && rlGame.state === "playing") {
        const e = rlGame.currentAttempt[i];
        if (e === "🟩") return "#538d4e";
        if (e === "🟨") return "#b59f3b";
        if (e === "🟥") return "#c94f3f";
        return "#6B7280";
      }
      if (i === rlGame.noteIdx && rlGame.state === "playing") return "#00A8B3";
      return "#B8C2CC";
    }

    function buildVoice(clef, yStave) {
      const stave = clef === "treble" ? trebleStave : bassStave;
      const notes = rlGame.notes.map((step, i) => {
        const col = colorFor(i);
        let sn;
        if (step.clef === clef) {
          // Mostrar nota només quan està revelada o ja fet
          const mustHide = rlGame.state === "playing" && i > rlGame.noteIdx;
          if (mustHide) {
            // Nota "pendent" mostrada com a símbol neutre (cap de nota gris clar)
            sn = new VF.StaveNote({ clef, keys: [step.note], duration: "q" });
            sn.setStyle({ fillStyle: "#D0D7DE", strokeStyle: "#D0D7DE" });
          } else {
            sn = new VF.StaveNote({ clef, keys: [step.note], duration: "q" });
            sn.setStyle({ fillStyle: col, strokeStyle: col });
          }
        } else {
          // Pausa per forats de l'altra clau
          sn = new VF.StaveNote({ clef, keys: [clef === "treble" ? "b/4" : "d/3"], duration: "qr" });
          sn.setStyle({ fillStyle: "#D0D7DE", strokeStyle: "#D0D7DE" });
        }
        return sn;
      });
      return { stave, notes, voice: new VF.Voice({ num_beats: N, beat_value: 4 }).setMode(VF.Voice.Mode.SOFT).addTickables(notes) };
    }

    const vt = buildVoice("treble");
    let vb = null;
    if (grandStaff) vb = buildVoice("bass");

    const formatter = new VF.Formatter();
    if (grandStaff) formatter.joinVoices([vt.voice, vb.voice]).format([vt.voice, vb.voice], Math.max(150, staveWidth - 90));
    else formatter.joinVoices([vt.voice]).format([vt.voice], Math.max(150, staveWidth - 90));

    vt.voice.draw(context, trebleStave);
    if (grandStaff) vb.voice.draw(context, bassStave);
  }

  function rlRenderAttempts() {
    rlAttemptsEl.innerHTML = "";
    if (!rlGame) return;
    const N = rlGame.notes.length;
    for (let a = 0; a < RL_MAX_ATTEMPTS; a++) {
      const row = document.createElement("div");
      row.className = "rl-attempt-row";
      const emojis = rlGame.attempts[a] || (a === rlGame.attempts.length ? rlGame.currentAttempt : null);
      const isActive = (a === rlGame.attempts.length && rlGame.state === "playing");
      if (isActive) row.classList.add("rl-attempt-active");
      for (let i = 0; i < N; i++) {
        const tile = document.createElement("div");
        tile.className = "rl-tile";
        if (emojis && emojis[i]) {
          tile.classList.add("rl-tile-" + ({ "🟩": "green", "🟨": "gold", "🟥": "red" }[emojis[i]] || "empty"));
          tile.textContent = emojis[i];
        } else if (isActive && i === rlGame.noteIdx) {
          tile.classList.add("rl-tile-current");
        } else {
          tile.classList.add("rl-tile-empty");
        }
        row.appendChild(tile);
      }
      rlAttemptsEl.appendChild(row);
    }
  }

  function rlRefreshHeader() {
    const d = rlToday();
    const level = parseInt(rlLevelEl.value, 10);
    const puzzleNum = rlPuzzleNumForDate(d);
    rlPuzzleNumEl.textContent = "Relàmpec #" + puzzleNum;
    rlDateEl.textContent = rlFormatDateCat(d);
    const stats = rlGetLevelStats(level);
    rlStreakNumEl.textContent = stats.currentStreak || 0;
    rlPlayedEl.textContent = stats.played;
    rlWonEl.textContent = stats.won;
    rlWinrateEl.textContent = stats.played > 0 ? Math.round((stats.won / stats.played) * 100) + "%" : "—";
    rlBestStreakEl.textContent = stats.bestStreak || 0;
  }

  // --- Flow de joc ---
  function rlStart() {
    const mode = rlModeEl.value;
    const level = parseInt(rlLevelEl.value, 10);

    if (mode === "daily") {
      const stats = rlGetLevelStats(level);
      const today = rlDateKey(rlToday());
      // Ja jugat avui?
      if (stats.lastPlayDate === today && stats.lastPuzzleDone) {
        rlShowCompletedDaily(stats, level);
        return;
      }
    }

    rlNewGame(mode, level);
    rlGame.state = "playing";
    rlGame.noteStart = performance.now();
    rlCurrentNoteEl.textContent = "Quina és la primera nota?";
    rlFeedbackEl.textContent = "";
    rlFeedbackEl.className = "feedback";
    rlStartBtn.disabled = true;
    rlRevealBtn.style.display = "none";
    rlCountdownEl.style.display = "none";
    rlRender();
    rlRenderAttempts();
  }

  function rlShowCompletedDaily(stats, level) {
    // Reconstrueix el puzzle d'avui per poder mostrar la graella i resultat
    const d = rlToday();
    const rng = rlMulberry32(rlSeedForDate(d, level));
    const notes = rlGeneratePuzzle(level, rng);
    rlGame = {
      mode: "daily",
      level,
      puzzleNum: rlPuzzleNumForDate(d),
      notes,
      attempts: stats.lastPuzzleDone.attempts,
      currentAttempt: [],
      noteIdx: notes.length,
      noteStart: 0,
      state: stats.lastPuzzleDone.won ? "won" : "lost"
    };
    rlRender();
    rlRenderAttempts();
    rlFeedbackEl.textContent = stats.lastPuzzleDone.won
      ? "Ja has completat el Relàmpec d'avui. 🔥"
      : "Ja has jugat el Relàmpec d'avui.";
    rlFeedbackEl.className = "feedback";
    rlCurrentNoteEl.textContent = "Torna demà per un de nou, o juga en mode Lliure.";
    rlStartCountdown();
    rlStartBtn.disabled = true;
    rlRevealBtn.style.display = "inline-flex";
    rlShowResultModal();
  }

  function rlAnswer(answerCa, btn) {
    if (!rlGame || rlGame.state !== "playing") return;
    const current = rlGame.notes[rlGame.noteIdx];
    if (!current) return;
    const correctCa = NOTE_NAMES_CA[noteLetter(current.note)];
    const dt = performance.now() - rlGame.noteStart;

    let emoji;
    if (answerCa === correctCa) {
      emoji = dt < RL_FAST_MS ? "🟩" : (dt < RL_SLOW_MS ? "🟨" : "🟨");
      playNote(current.note);
      btn.classList.add("correct-flash");
    } else {
      emoji = "🟥";
      playErrorSound();
      shakeElement(rlStaffEl);
      btn.classList.add("wrong-flash");
    }
    rlGame.currentAttempt.push(emoji);
    rlGame.noteIdx++;
    rlGame.noteStart = performance.now();

    setTimeout(() => { btn.classList.remove("correct-flash", "wrong-flash"); }, 200);

    rlRender();
    rlRenderAttempts();

    if (rlGame.noteIdx >= rlGame.notes.length) {
      rlFinishAttempt();
    } else {
      rlCurrentNoteEl.textContent = "Nota " + (rlGame.noteIdx + 1) + " de " + rlGame.notes.length;
    }
  }

  function rlFinishAttempt() {
    const row = rlGame.currentAttempt.slice();
    rlGame.attempts.push(row);
    rlGame.currentAttempt = [];
    rlGame.noteIdx = 0;

    const anyWrong = row.includes("🟥");
    const attemptNum = rlGame.attempts.length;

    if (!anyWrong) {
      rlGame.state = "won";
      rlRender();
      rlRenderAttempts();
      rlOnWin(attemptNum);
    } else if (attemptNum >= RL_MAX_ATTEMPTS) {
      rlGame.state = "lost";
      rlRender();
      rlRenderAttempts();
      rlOnLoss();
    } else {
      // Nou intent
      rlGame.noteStart = performance.now();
      rlCurrentNoteEl.textContent = "Intent " + (attemptNum + 1) + "/" + RL_MAX_ATTEMPTS + " · endavant!";
      rlRender();
      rlRenderAttempts();
    }
  }

  function rlOnWin(attemptNum) {
    rlFeedbackEl.textContent = "🎉 Guanyat en " + attemptNum + "/" + RL_MAX_ATTEMPTS + "!";
    rlFeedbackEl.className = "feedback correct";
    flashClass(rlFeedbackEl, "pop", 400);
    playCongratulations();
    spawnConfetti({ count: 120 });

    if (rlGame.mode === "daily") {
      const stats = rlGetLevelStats(rlGame.level);
      rlUpdateStreak(stats, true);
      stats.played++;
      stats.won++;
      stats.distribution[String(attemptNum)]++;
      stats.lastPuzzleNum = rlGame.puzzleNum;
      stats.lastPuzzleDone = { won: true, attempts: rlGame.attempts, attemptNum };
      stats.lastPlayDate = rlDateKey(rlToday());
      rlSetLevelStats(rlGame.level, stats);
    }
    rlRefreshHeader();
    rlStartBtn.disabled = rlGame.mode === "daily";
    rlRevealBtn.style.display = "none";
    if (rlGame.mode === "daily") rlStartCountdown();
    setTimeout(() => rlShowResultModal(), 600);
  }

  function rlOnLoss() {
    rlFeedbackEl.textContent = "Has esgotat els intents. Prem Revelar per veure la solució.";
    rlFeedbackEl.className = "feedback wrong";
    flashClass(rlFeedbackEl, "pop", 400);
    playErrorSound();

    if (rlGame.mode === "daily") {
      const stats = rlGetLevelStats(rlGame.level);
      rlUpdateStreak(stats, false);
      stats.played++;
      stats.distribution["X"]++;
      stats.lastPuzzleNum = rlGame.puzzleNum;
      stats.lastPuzzleDone = { won: false, attempts: rlGame.attempts, attemptNum: RL_MAX_ATTEMPTS };
      stats.lastPlayDate = rlDateKey(rlToday());
      rlSetLevelStats(rlGame.level, stats);
    }
    rlRefreshHeader();
    rlStartBtn.disabled = rlGame.mode === "daily";
    rlRevealBtn.style.display = "inline-flex";
    if (rlGame.mode === "daily") rlStartCountdown();
    setTimeout(() => rlShowResultModal(), 500);
  }

  function rlUpdateStreak(stats, won) {
    if (won) {
      stats.currentStreak = (stats.currentStreak || 0) + 1;
      if (stats.currentStreak > (stats.bestStreak || 0)) stats.bestStreak = stats.currentStreak;
    } else {
      stats.currentStreak = 0;
    }
  }

  function rlReveal() {
    if (!rlGame) return;
    rlGame.state = "revealed";
    rlRender();
    rlCurrentNoteEl.textContent = "Solució revelada. Mode Lliure per jugar-ne més.";
  }

  // --- Countdown ---
  let rlCountdownTimer = null;
  function rlStartCountdown() {
    rlCountdownEl.style.display = "flex";
    function tick() {
      const now = new Date();
      const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
      const diff = tomorrow - now;
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      const txt = String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
      rlCountdownTimeEl.textContent = txt;
      if (rlResultCountdown) rlResultCountdown.textContent = "Pròxim Relàmpec en " + txt;
    }
    tick();
    clearInterval(rlCountdownTimer);
    rlCountdownTimer = setInterval(tick, 1000);
  }

  // --- Modal resultat ---
  function rlBuildShareText() {
    if (!rlGame) return "";
    const cfg = RL_LEVELS[rlGame.level];
    const lines = [];
    const header = rlGame.mode === "daily"
      ? "Pentagrama Relàmpec #" + rlGame.puzzleNum + " · " + cfg.label.split(" · ")[0]
      : "Pentagrama Relàmpec · " + cfg.label.split(" · ")[0] + " (Lliure)";
    let badge;
    if (rlGame.state === "won") badge = rlGame.attempts.length + "/" + RL_MAX_ATTEMPTS;
    else if (rlGame.state === "lost") badge = "X/" + RL_MAX_ATTEMPTS;
    else badge = "—";
    lines.push(header + " · " + badge);
    lines.push("");
    for (const row of rlGame.attempts) lines.push(row.join(""));
    lines.push("");
    const stats = rlGetLevelStats(rlGame.level);
    if (stats.currentStreak > 0) lines.push("🔥 Ratxa " + stats.currentStreak);
    lines.push("https://xonsinieto.github.io/programa-musical/");
    return lines.join("\n");
  }

  function rlShowResultModal() {
    if (!rlGame) return;
    const cfg = RL_LEVELS[rlGame.level];
    const stats = rlGetLevelStats(rlGame.level);

    let badge, title;
    if (rlGame.state === "won") {
      badge = rlGame.attempts.length + "/" + RL_MAX_ATTEMPTS;
      title = rlGame.attempts.length === 1 ? "Perfecte! ⚡" : "Guanyat!";
    } else if (rlGame.state === "lost") {
      badge = "X/" + RL_MAX_ATTEMPTS;
      title = "Sense sort avui";
    } else {
      badge = "—";
      title = "Relàmpec";
    }
    rlResultBadge.textContent = badge;
    rlResultTitle.textContent = title;
    const subBits = [];
    if (rlGame.mode === "daily") subBits.push("Relàmpec #" + rlGame.puzzleNum);
    else subBits.push("Mode Lliure");
    subBits.push(cfg.label);
    rlResultSub.textContent = subBits.join(" · ");

    // Grid
    rlResultGrid.innerHTML = "";
    for (const row of rlGame.attempts) {
      const r = document.createElement("div");
      r.className = "rl-result-row";
      for (const e of row) {
        const t = document.createElement("div");
        t.className = "rl-tile rl-tile-" + ({ "🟩": "green", "🟨": "gold", "🟥": "red" }[e] || "empty");
        t.textContent = e;
        r.appendChild(t);
      }
      rlResultGrid.appendChild(r);
    }

    rlResultStreakNum.textContent = stats.currentStreak || 0;

    // Distribució
    rlDistRowsEl.innerHTML = "";
    const buckets = ["1", "2", "3", "X"];
    const maxVal = Math.max(1, ...buckets.map(b => stats.distribution[b] || 0));
    for (const b of buckets) {
      const v = stats.distribution[b] || 0;
      const row = document.createElement("div");
      row.className = "rl-dist-row";
      const isMine = rlGame.state !== "idle" && (
        (rlGame.state === "won" && String(rlGame.attempts.length) === b) ||
        (rlGame.state === "lost" && b === "X")
      );
      if (isMine) row.classList.add("rl-dist-row-mine");
      row.innerHTML = `<span class="rl-dist-lbl">${b}</span><span class="rl-dist-bar-wrap"><span class="rl-dist-bar" style="width:${Math.max(8, Math.round(v / maxVal * 100))}%">${v}</span></span>`;
      rlDistRowsEl.appendChild(row);
    }

    // Mostrar botó free si mode daily; ocultar si mode lliure
    rlFreeBtn.style.display = rlGame.mode === "daily" ? "inline-flex" : "none";

    rlResultModal.classList.remove("hidden");
    rlResultModal.setAttribute("aria-hidden", "false");

    if (rlGame.mode === "daily") rlStartCountdown();
  }

  function rlCloseResultModal() {
    rlResultModal.classList.add("hidden");
    rlResultModal.setAttribute("aria-hidden", "true");
  }

  async function rlShare() {
    const text = rlBuildShareText();
    try {
      if (navigator.share) {
        await navigator.share({ text });
        showToast("Compartit!");
        return;
      }
    } catch (e) { /* user cancelled, continue */ }
    try {
      await navigator.clipboard.writeText(text);
      showToast("Resultat copiat al porta-retalls ✂️");
    } catch (e) {
      showToast("No s'ha pogut copiar");
    }
  }

  function rlEnterScreen() {
    rlRefreshHeader();
    const level = parseInt(rlLevelEl.value, 10);
    const mode = rlModeEl.value;
    if (mode === "daily") {
      const stats = rlGetLevelStats(level);
      const today = rlDateKey(rlToday());
      if (stats.lastPlayDate === today && stats.lastPuzzleDone) {
        rlShowCompletedDaily(stats, level);
        return;
      }
    }
    // Estat idle: mostrem la portada sense puzzle encara
    rlGame = null;
    rlStaffEl.innerHTML = "";
    rlAttemptsEl.innerHTML = "";
    rlCurrentNoteEl.textContent = "";
    rlFeedbackEl.textContent = mode === "daily"
      ? "El puzzle d'avui t'espera. 3 intents, una solució."
      : "Mode Lliure: puzzles infinits, sense pressió de ratxa.";
    rlFeedbackEl.className = "feedback";
    rlStartBtn.disabled = false;
    rlRevealBtn.style.display = "none";
    rlCountdownEl.style.display = "none";
    rlCloseResultModal();
  }

  // --- Event wiring ---
  rlStartBtn.addEventListener("click", rlStart);
  rlRevealBtn.addEventListener("click", rlReveal);
  rlNoteButtons.forEach(btn => {
    btn.addEventListener("click", () => rlAnswer(btn.dataset.note, btn));
  });
  rlLevelEl.addEventListener("change", () => {
    const st = rlGetProfileState();
    rlRefreshHeader();
    if (!rlGame || rlGame.state === "idle" || rlGame.state === "won" || rlGame.state === "lost" || rlGame.state === "revealed") {
      rlEnterScreen();
    }
  });
  rlModeEl.addEventListener("change", () => {
    const st = rlGetProfileState();
    st.preferences.mode = rlModeEl.value;
    rlSaveProfileState(st);
    rlEnterScreen();
  });
  rlResultModal.addEventListener("click", (e) => {
    const t = e.target;
    if (t && (t.dataset.rlClose !== undefined || t.getAttribute("data-rl-close") !== null)) {
      rlCloseResultModal();
    }
  });
  rlShareBtn.addEventListener("click", rlShare);
  rlFreeBtn.addEventListener("click", () => {
    rlCloseResultModal();
    rlModeEl.value = "free";
    rlModeEl.dispatchEvent(new Event("change"));
    setTimeout(() => rlStart(), 100);
  });
  // Tancar modal amb Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !rlResultModal.classList.contains("hidden")) {
      rlCloseResultModal();
    }
  });

  // ---------- VELOCITAT (joc scrolling amb progressió) ----------
  const spClefSelect   = document.getElementById("sp-clef-select");
  const spLevelSelect  = document.getElementById("sp-level-select");
  const spSpeedSelect  = document.getElementById("sp-speed-select");
  const spResetBtn     = document.getElementById("sp-reset-btn");
  const spStartBtn     = document.getElementById("sp-start-btn");
  const spRetryBtn     = document.getElementById("sp-retry-btn");
  const spRestartBtn   = document.getElementById("sp-restart-btn");
  const spContainer    = document.getElementById("sp-game-container");
  const spOverlay      = document.getElementById("sp-overlay");
  const spOvStart      = document.getElementById("sp-ov-start");
  const spOvLevelUp    = document.getElementById("sp-ov-levelup");
  const spOvWin        = document.getElementById("sp-ov-win");
  const spRetryBar     = document.getElementById("sp-retry-bar");
  const spFailNameEl   = document.getElementById("sp-fail-name");
  const spLvlUpTitle   = document.getElementById("sp-lvlup-title");
  const spLvlUpSub     = document.getElementById("sp-lvlup-sub");
  const spSpeedLevelEl = document.getElementById("sp-speed-level");
  const spStreakEl     = document.getElementById("sp-streak");
  const spFeedbackEl   = document.getElementById("sp-feedback");
  const spCorrectEl    = document.getElementById("sp-correct");
  const spWrongEl      = document.getElementById("sp-wrong");
  const spBestEl       = document.getElementById("sp-best");
  const spPiano        = document.getElementById("sp-piano");

  const SP_MAX_SPEED = 10;
  const SP_STREAK_TO_ADVANCE = 30;

  let spRunning   = false;
  let spState     = "idle"; // idle | playing | paused | levelup | won
  let spActive    = [];
  let spSvg       = null;
  let spNoteGroup = null;
  let spLastSpawn = 0;
  let spLastFrame = 0;
  let spRAF       = null;
  let spHitLineX  = 120;
  let spSpawnX    = 800;
  // VexFlow afegeix space_above_staff_ln = 4 (40px) entre el y passat al Stave
  // i la línia superior real. Per això els centres estan desplaçats +40.
  const spTrebleCenterY = 200; // B4 al mig del pentagrama de Sol (stave y=140 → top=180, middle=200)
  const spBassCenterY   = 340; // D3 al mig del pentagrama de Fa (stave y=280 → top=320, middle=340)
  // Límits absoluts de cada pentagrama (línies superior/inferior)
  const SP_TREBLE_TOP    = 180;
  const SP_TREBLE_BOTTOM = 220;
  const SP_BASS_TOP      = 320;
  const SP_BASS_BOTTOM   = 360;
  let spCurrentSpeed = 1;
  let spStreak  = 0;
  let spCorrect = 0;
  let spWrong   = 0;
  let spMaxSpeedThisRun = 1;

  // Highscores per perfil + clef + level
  const SP_HIGHSCORES_KEY = "velocitatHighScores_v1";
  function loadSpScores() {
    try { return JSON.parse(localStorage.getItem(SP_HIGHSCORES_KEY) || "{}"); }
    catch (e) { return {}; }
  }
  function saveSpScores(s) {
    try { localStorage.setItem(SP_HIGHSCORES_KEY, JSON.stringify(s)); } catch (e) {}
  }
  function spConfigKey() {
    // Inclou velocitat actual → record per cada velocitat
    return spClefSelect.value + "|" + spLevelSelect.value + "|v" + spCurrentSpeed;
  }
  function getSpBest() {
    const all = loadSpScores();
    const profile = currentProfile();
    const v = (all[profile] && all[profile][spConfigKey()]);
    return typeof v === "number" ? v : 0;
  }
  function setSpBest(notes) {
    const all = loadSpScores();
    const profile = currentProfile();
    if (!all[profile]) all[profile] = {};
    all[profile][spConfigKey()] = notes;
    saveSpScores(all);
  }

  function spPickClef() {
    const sel = spClefSelect.value;
    if (sel === "both") return Math.random() < 0.5 ? "treble" : "bass";
    return sel;
  }

  function spPxPerSec() {
    return 30 + spCurrentSpeed * 25; // 55..280
  }

  function spPxPerMs() { return spPxPerSec() / 1000; }

  function spSpawnInterval() {
    // Espai entre notes molt més apretat a alt nivell
    const lvl = spCurrentSpeed;
    const spaceBetweenPx = Math.max(35, 220 - lvl * 22); // 1→198, 5→110, 10→35
    const interval = (spaceBetweenPx / spPxPerSec()) * 1000;
    return Math.max(80, interval);
  }

  function spUpdateStats() {
    spCorrectEl.textContent    = spCorrect;
    spWrongEl.textContent      = spWrong;
    spSpeedLevelEl.textContent = spCurrentSpeed;
    spStreakEl.textContent     = spStreak;
    spSpeedSelect.value        = String(spCurrentSpeed);
    const best = getSpBest();
    spBestEl.textContent = best > 0 ? (best + "/" + SP_STREAK_TO_ADVANCE) : "—";
  }

  function spShowOverlay(panel) {
    spOverlay.classList.remove("hidden");
    [spOvStart, spOvLevelUp, spOvWin].forEach(p => p.classList.add("hidden"));
    if (panel) panel.classList.remove("hidden");
  }
  function spHideOverlay() {
    spOverlay.classList.add("hidden");
  }

  function spNoteY(noteKey, clef) {
    const [letter, octStr] = noteKey.split("/");
    const oct = parseInt(octStr, 10);
    const letterStep = { c:0, d:1, e:2, f:3, g:4, a:5, b:6 }[letter];
    if (clef === "treble") {
      const stepsAboveB4 = (oct - 4) * 7 + letterStep - 6;
      return spTrebleCenterY - stepsAboveB4 * 5;
    } else {
      const stepsAboveD3 = (oct - 3) * 7 + letterStep - 1;
      return spBassCenterY - stepsAboveD3 * 5;
    }
  }

  function spBuildStage() {
    // IMPORTANT: no fer innerHTML="" al contenidor perquè conté l'overlay.
    // Només eliminem l'SVG antic si existeix.
    const oldSvgs = spContainer.querySelectorAll("svg");
    oldSvgs.forEach(s => s.remove());

    const width    = Math.max(600, spContainer.clientWidth);
    const height   = 460;
    spSpawnX   = width - 30;
    spHitLineX = 120;

    const renderer = new VF.Renderer(spContainer, VF.Renderer.Backends.SVG);
    renderer.resize(width, height);
    const context = renderer.getContext();
    spSvg = context.svg;
    // Assegurem que l'SVG queda sota l'overlay (que té z-index:10)
    spSvg.style.position = "absolute";
    spSvg.style.left = "0";
    spSvg.style.top = "0";
    spSvg.style.zIndex = "1";

    const staveX     = 20;
    const staveWidth = width - 40;

    const trebleStave = new VF.Stave(staveX, 140, staveWidth);
    trebleStave.addClef("treble").setContext(context).draw();
    const bassStave = new VF.Stave(staveX, 280, staveWidth);
    bassStave.addClef("bass").setContext(context).draw();

    const ct = VF.StaveConnector.type;
    new VF.StaveConnector(trebleStave, bassStave).setType(ct.BRACE).setContext(context).draw();
    new VF.StaveConnector(trebleStave, bassStave).setType(ct.SINGLE_LEFT).setContext(context).draw();
    new VF.StaveConnector(trebleStave, bassStave).setType(ct.SINGLE_RIGHT).setContext(context).draw();

    const hitLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
    hitLine.setAttribute("x1", spHitLineX);
    hitLine.setAttribute("x2", spHitLineX);
    hitLine.setAttribute("y1", 40);
    hitLine.setAttribute("y2", 440);
    hitLine.setAttribute("stroke", "#e74c3c");
    hitLine.setAttribute("stroke-width", "3");
    hitLine.setAttribute("stroke-dasharray", "6,4");
    spSvg.appendChild(hitLine);

    spNoteGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    spSvg.appendChild(spNoteGroup);
  }

  function spDrawQuarterNote(parent, SVG_NS, y, clef) {
    // Rodona buida (whole note): oval horitzontal sense omplir, sense pal.
    // S'usa arreu (Velocitat + Caça) a petició de l'usuari — simple i clar.
    const wrap = document.createElementNS(SVG_NS, "g");
    wrap.setAttribute("class", "sp-note-shape");

    const head = document.createElementNS(SVG_NS, "ellipse");
    head.setAttribute("cx", 0);
    head.setAttribute("cy", 0);
    head.setAttribute("rx", 8);
    head.setAttribute("ry", 5.5);
    head.setAttribute("fill", "none");
    head.setAttribute("stroke", "#2c3e50");
    head.setAttribute("stroke-width", "2");
    wrap.appendChild(head);

    parent.appendChild(wrap);
  }

  function spColorNote(g, color) {
    const shape = g.querySelector(".sp-note-shape");
    if (!shape) return;
    // Rodones buides: només canviem l'stroke (color del perímetre); mantenim
    // fill="none" perquè la nota segueixi sent buida com una rodona real.
    shape.querySelectorAll("ellipse").forEach(el => {
      el.setAttribute("stroke", color);
    });
    shape.querySelectorAll("line").forEach(el => {
      el.setAttribute("stroke", color);
    });
  }

  function spDrawLedgers(parent, SVG_NS, y, clef) {
    // Línies addicionals per notes fora del pentagrama (amb rect = 100% fiable)
    const top    = clef === "treble" ? SP_TREBLE_TOP    : SP_BASS_TOP;
    const bottom = clef === "treble" ? SP_TREBLE_BOTTOM : SP_BASS_BOTTOM;
    const addLedger = (lyAbs) => {
      const r = document.createElementNS(SVG_NS, "rect");
      r.setAttribute("x", -13);
      r.setAttribute("y", (lyAbs - y) - 1);
      r.setAttribute("width", 26);
      r.setAttribute("height", 2);
      r.setAttribute("fill", "#2c3e50");
      r.setAttribute("stroke", "none");
      parent.appendChild(r);
    };
    if (y < top) {
      for (let ly = top - 10; ly >= y - 1; ly -= 10) addLedger(ly);
    } else if (y > bottom) {
      for (let ly = bottom + 10; ly <= y + 1; ly += 10) addLedger(ly);
    }
  }

  function spSpawnNote() {
    const clef = spPickClef();
    const note = pickNoteForLevel(clef, spLevelSelect.value);
    const y    = spNoteY(note, clef);
    const SVG_NS = "http://www.w3.org/2000/svg";
    const g = document.createElementNS(SVG_NS, "g");
    g.classList.add("sp-note");
    spDrawLedgers(g, SVG_NS, y, clef);
    spDrawQuarterNote(g, SVG_NS, y, clef);

    // ----- Web Animations API -----
    // L'animació la gestiona el compositor del navegador (GPU-thread), no JS.
    // Això elimina els "parons" causats per style writes / style recalc per frame.
    const startX = spSpawnX;
    const endX   = spHitLineX - 40;
    const distancePx = startX - endX;
    const durationMs = distancePx / spPxPerMs();
    g.style.transform = "translate3d(" + startX + "px, " + y + "px, 0)";
    spNoteGroup.appendChild(g);
    const anim = g.animate([
      { transform: "translate3d(" + startX + "px, " + y + "px, 0)" },
      { transform: "translate3d(" + endX   + "px, " + y + "px, 0)" }
    ], { duration: durationMs, easing: "linear", fill: "forwards" });

    spActive.push({
      clef, note, y, el: g, state: "pending",
      startTime: performance.now(),
      durationMs, startX, endX, x: startX,
      nearFlagged: false,
      anim
    });
  }

  function spGameLoop(ts) {
    if (!spRunning || spState !== "playing") return;
    spLastFrame = ts;

    for (let i = spActive.length - 1; i >= 0; i--) {
      const n = spActive[i];
      // Posició calculada per temps — NO llegim getBoundingClientRect ni tocquem style
      const elapsed = ts - n.startTime;
      const progress = elapsed / n.durationMs;
      const x = n.startX + (n.endX - n.startX) * progress;
      n.x = x;

      // Pulse glow quan s'acosta a la línia d'impacte (~80px abans)
      if (n.state === "pending") {
        const dist = x - spHitLineX;
        if (dist < 80 && dist > -15) {
          if (!n.nearFlagged) {
            n.el.classList.add("sp-note-near");
            n.nearFlagged = true;
          }
        } else if (n.nearFlagged) {
          n.el.classList.remove("sp-note-near");
          n.nearFlagged = false;
        }
      }

      if (n.state === "pending" && x < spHitLineX - 20) {
        spOnFail(n);
        return;
      }
    }

    if (ts - spLastSpawn >= spSpawnInterval()) {
      spSpawnNote();
      spLastSpawn = ts;
    }

    spRAF = requestAnimationFrame(spGameLoop);
  }

  function spHandleAnswer(answerPitch, btn) {
    if (spState !== "playing") return;
    let target = null;
    for (const n of spActive) {
      if (n.state !== "pending") continue;
      if (!target || n.x < target.x) target = n;
    }
    if (!target) return;

    if (answerPitch === target.note) {
      target.state = "hit";
      spCorrect++;
      spStreak++;
      if (btn) btn.classList.add("correct-flash");
      playNote(target.note);
      spColorNote(target.el, "#27ae60");
      burstStaff(spContainer);
      burstNoteAt(target.el, ["#00F0FF", "#00FF94", "#FFB800", "#FF10F0"], 26);
      flashHitLine();
      if (target.anim) { try { target.anim.pause(); } catch(e) {} }
      const el = target.el;
      setTimeout(() => { if (el.parentNode) el.parentNode.removeChild(el); }, 160);
      const idx = spActive.indexOf(target);
      if (idx >= 0) spActive.splice(idx, 1);
      spUpdateStats();
      tickCounter(spCorrectEl);
      tickCounter(spStreakEl);
      setTimeout(() => {
        if (spPiano) spPiano.querySelectorAll(".nk-key").forEach(b => b.classList.remove("correct-flash"));
      }, 200);
      if (spStreak >= SP_STREAK_TO_ADVANCE) {
        spLevelUp();
      }
    } else {
      spWrong++;
      if (btn) btn.classList.add("wrong-flash");
      shakeElement(spContainer);
      tickCounter(spWrongEl);
      spUpdateStats();
      spOnFail(target);
    }
  }

  function spOnFail(failedNote) {
    if (spState !== "playing") return;
    spState = "paused";
    if (spRAF) cancelAnimationFrame(spRAF);
    // Congela TOTES les animacions en curs perquè la pantalla quedi quieta
    spActive.forEach(n => { if (n.anim) { try { n.anim.pause(); } catch(e) {} } });
    playErrorSound();
    const name = NOTE_NAMES_CA[noteLetter(failedNote.note)].toUpperCase();

    // Pinta la nota fallada de vermell i afegeix etiqueta SOBRE la nota
    spColorNote(failedNote.el, "#e74c3c");

    // 💥 Burst de partícules vermelles (Guitar Hero style miss)
    burstNoteAt(failedNote.el, ["#FF3366", "#9A1750", "#BC4749"], 18);
    const SVG_NS = "http://www.w3.org/2000/svg";
    const label = document.createElementNS(SVG_NS, "text");
    label.setAttribute("x", 0);
    label.setAttribute("y", -18);
    label.setAttribute("text-anchor", "middle");
    label.setAttribute("font-size", "18");
    label.setAttribute("font-weight", "bold");
    label.setAttribute("fill", "#e74c3c");
    label.textContent = name;
    failedNote.el.appendChild(label);

    spFailNameEl.textContent = name;

    // Record per la velocitat actual: spCorrect (notes acertades en aquest intent)
    const prevBest = getSpBest();
    const isImprovement = spCorrect > prevBest;
    const isTie = spCorrect > 0 && spCorrect === prevBest;
    if (spCorrect > 0 && isImprovement) {
      setSpBest(spCorrect);
      playCongratulations();
    } else if (isTie) {
      playEncouragement();
    }
    spUpdateStats();

    // Omplim els 3 elements separats del retry bar (nom, score, millor)
    const scoreEl = document.getElementById("sp-fail-score");
    const bestEl  = document.getElementById("sp-fail-best");
    scoreEl.textContent = spCorrect + "/" + SP_STREAK_TO_ADVANCE;
    scoreEl.classList.remove("is-record", "is-tie");
    if (isImprovement && spCorrect > 0) {
      scoreEl.classList.add("is-record");
      bestEl.textContent = "🏆 Nou rècord vel " + spCurrentSpeed;
    } else if (isTie) {
      scoreEl.classList.add("is-tie");
      bestEl.textContent = "👍 Empat vel " + spCurrentSpeed;
    } else if (prevBest > 0) {
      bestEl.textContent = "millor: " + prevBest + "/" + SP_STREAK_TO_ADVANCE;
    } else {
      bestEl.textContent = "";
    }
    spRetryBar.classList.remove("hidden");

    setTimeout(() => {
      if (spPiano) spPiano.querySelectorAll(".nk-key").forEach(b => b.classList.remove("correct-flash","wrong-flash"));
    }, 200);
  }

  function spLevelUp() {
    if (spCurrentSpeed >= SP_MAX_SPEED) {
      spWin();
      return;
    }
    // Abans de pujar de nivell, guardem el record (30/30) per la velocitat actual
    const prevBestForLevel = getSpBest();
    if (spCorrect > prevBestForLevel) setSpBest(spCorrect);

    // Celebració visual al level up
    spawnConfetti({ count: 80 });

    const passed = spCurrentSpeed;
    spCurrentSpeed++;
    if (spCurrentSpeed > spMaxSpeedThisRun) spMaxSpeedThisRun = spCurrentSpeed;
    // Reset comptadors per la velocitat nova (cada velocitat té el seu record)
    spStreak = 0;
    spCorrect = 0;
    spWrong = 0;
    spState = "levelup";
    if (spRAF) cancelAnimationFrame(spRAF);
    spLvlUpTitle.textContent = `Velocitat ${passed} superada!`;
    spLvlUpSub.textContent   = `Avances a la velocitat ${spCurrentSpeed}`;
    spShowOverlay(spOvLevelUp);
    spUpdateStats();
    setTimeout(() => {
      if (spState === "levelup") spEnterPlay();
    }, 1800);
  }

  function spWin() {
    spState = "won";
    if (spRAF) cancelAnimationFrame(spRAF);
    spShowOverlay(spOvWin);
    // Triple confetti burst a posicions diferents per celebració completa
    spawnConfetti({ count: 100 });
    setTimeout(() => spawnConfetti({ x: window.innerWidth * 0.25, y: window.innerHeight * 0.4, count: 60 }), 250);
    setTimeout(() => spawnConfetti({ x: window.innerWidth * 0.75, y: window.innerHeight * 0.4, count: 60 }), 500);
  }

  function spEnterPlay() {
    spState   = "playing";
    spActive  = [];
    spLastSpawn = 0;
    spLastFrame = 0;
    spFeedbackEl.textContent = "";
    spHideOverlay();
    spRetryBar.classList.add("hidden");
    spBuildStage();
    spRAF = requestAnimationFrame(spGameLoop);
  }

  function renderSpKeyboard() {
    if (!spPiano) return;
    const whites = pitchesForLevelClef(spLevelSelect.value, spClefSelect.value, null);
    spPiano.innerHTML = pianoKeysHTML(whites);
    setSizeClass(spPiano, whites.length);
  }

  function spStart() {
    renderSpKeyboard();
    spRunning = true;
    spCurrentSpeed = 1;
    spMaxSpeedThisRun = 1;
    spStreak = 0;
    spCorrect = 0;
    spWrong = 0;
    spUpdateStats();
    spEnterPlay();
  }

  function spResetRunStats() {
    spCorrect = 0;
    spWrong = 0;
    spStreak = 0;
    spMaxSpeedThisRun = spCurrentSpeed;
    spUpdateStats();
  }

  function spRetry() {
    spResetRunStats();
    spEnterPlay();
  }

  function spResetToIdle() {
    spRunning = false;
    spState = "idle";
    if (spRAF) cancelAnimationFrame(spRAF);
    spActive = [];
    if (spNoteGroup) spNoteGroup.innerHTML = "";
    spCurrentSpeed = 1;
    spStreak = 0;
    spUpdateStats();
    spShowOverlay(spOvStart);
  }

  spClefSelect.addEventListener("change", () => {
    renderSpKeyboard();
    spResetRunStats();
  });
  spLevelSelect.addEventListener("change", () => {
    renderSpKeyboard();
    spResetRunStats();
  });
  renderSpKeyboard();

  spStartBtn.addEventListener("click", spStart);
  spRetryBtn.addEventListener("click", spRetry);
  spRestartBtn.addEventListener("click", () => {
    spCurrentSpeed = 1;
    spStreak = 0;
    spCorrect = 0;
    spWrong = 0;
    spStart();
  });
  spResetBtn.addEventListener("click", () => {
    spRunning = false;
    spState = "idle";
    if (spRAF) cancelAnimationFrame(spRAF);
    spActive = [];
    if (spNoteGroup) spNoteGroup.innerHTML = "";
    spRetryBar.classList.add("hidden");
    spCurrentSpeed = 1;
    spStreak = 0;
    spCorrect = 0;
    spWrong = 0;
    spUpdateStats();
    spShowOverlay(spOvStart);
  });
  spSpeedSelect.addEventListener("change", () => {
    const v = parseInt(spSpeedSelect.value, 10);
    if (!isNaN(v) && v >= 1 && v <= SP_MAX_SPEED) {
      spCurrentSpeed = v;
      spResetRunStats();
    }
  });
  spPiano.addEventListener("click", (e) => {
    const key = e.target.closest(".nk-key");
    if (key && spPiano.contains(key)) spHandleAnswer(key.dataset.pitch, key);
  });

  // ---------- CAÇA (triar nota-diana + memoritzar posicions + caçar-la entre aleatòries) ----------
  const huClefSelect    = document.getElementById("hu-clef-select");
  const huLevelSelect   = document.getElementById("hu-level-select");
  const huSpeedSelect   = document.getElementById("hu-speed-select");
  const huTargetLabelEl = document.getElementById("hu-target-label"); // pot ser null (la pill s'ha tret al mòbil)
  const huStartBtn      = document.getElementById("hu-start-btn");
  const huRetryBtn      = document.getElementById("hu-retry-btn");
  const huRestartBtn    = document.getElementById("hu-restart-btn");
  const huContainer     = document.getElementById("hu-game-container");
  const huOverlay       = document.getElementById("hu-overlay");
  const huMemoBar       = document.getElementById("hu-memo-bar");
  const huRetryBar      = document.getElementById("hu-retry-bar");
  const huOvLevelUp     = document.getElementById("hu-ov-levelup");
  const huOvWin         = document.getElementById("hu-ov-win");
  const huLvlUpTitle    = document.getElementById("hu-lvlup-title");
  const huLvlUpSub      = document.getElementById("hu-lvlup-sub");
  const huWinTargetEl   = document.getElementById("hu-win-target");
  const huFeedbackEl    = document.getElementById("hu-feedback");
  const huSpeedLevelEl  = document.getElementById("hu-speed-level");
  const huStreakEl      = document.getElementById("hu-streak");
  const huBestEl        = document.getElementById("hu-best");
  const huPiano         = document.getElementById("hu-piano");
  const huTargetButtons = document.querySelectorAll(".hu-target-btn"); // buit ara (compatibilitat)

  const HU_BEST_KEY = "huntBestByProfile_v1";
  // Mapeig del data-note del botó (català) a la lletra pitch (ús intern + NOTE_NAMES_CA)
  const HU_CA_TO_LETTER = { do: "c", re: "d", mi: "e", fa: "f", sol: "g", la: "a", si: "b" };
  const HU_LETTER_TO_CA = { c: "do", d: "re", e: "mi", f: "fa", g: "sol", a: "la", b: "si" };

  let huTarget = "c"; // lletra pitch (c/d/e/f/g/a/b); per defecte Do
  let huState  = "idle"; // "idle" | "memorize" | "playing" | "paused" | "levelup" | "won"
  let huActive = [];
  let huSvg = null;
  let huNoteGroup = null;
  let huLastSpawn = 0;
  let huLastFrame = 0;
  let huRAF = null;
  let huHitLineX = 120;
  let huSpawnX = 800;
  let huCurrentSpeed = 1;
  let huStreak = 0;
  let huCorrect = 0;

  function huLoadBest() {
    try { return JSON.parse(localStorage.getItem(HU_BEST_KEY) || "{}"); }
    catch (e) { return {}; }
  }
  function huSaveBest(all) {
    try { localStorage.setItem(HU_BEST_KEY, JSON.stringify(all)); } catch (e) {}
  }
  function huConfigKey() {
    return huClefSelect.value + "|L" + huLevelSelect.value + "|T" + huTarget + "|v" + huCurrentSpeed;
  }
  function getHuBest() {
    const all = huLoadBest();
    return (all[currentProfile()] || {})[huConfigKey()] || 0;
  }
  function setHuBest(v) {
    const all = huLoadBest();
    if (!all[currentProfile()]) all[currentProfile()] = {};
    all[currentProfile()][huConfigKey()] = v;
    huSaveBest(all);
  }

  function huPxPerSec() { return 30 + huCurrentSpeed * 25; }
  function huPxPerMs()  { return huPxPerSec() / 1000; }
  function huSpawnInterval() {
    const lvl = huCurrentSpeed;
    const spaceBetweenPx = Math.max(35, 220 - lvl * 22);
    return Math.max(80, (spaceBetweenPx / huPxPerSec()) * 1000);
  }
  function huPickClef() {
    const sel = huClefSelect.value;
    if (sel === "both") return Math.random() < 0.5 ? "treble" : "bass";
    return sel;
  }

  function huBuildStage() {
    const old = huContainer.querySelectorAll("svg");
    old.forEach(s => s.remove());
    const width  = Math.max(600, huContainer.clientWidth);
    const height = 460;
    huSpawnX  = width - 30;
    huHitLineX = 120;

    const renderer = new VF.Renderer(huContainer, VF.Renderer.Backends.SVG);
    renderer.resize(width, height);
    const context = renderer.getContext();
    huSvg = context.svg;
    huSvg.style.position = "absolute";
    huSvg.style.left = "0";
    huSvg.style.top = "0";
    huSvg.style.zIndex = "1";

    const staveX = 20, staveWidth = width - 40;
    const trebleStave = new VF.Stave(staveX, 140, staveWidth);
    trebleStave.addClef("treble").setContext(context).draw();
    const bassStave = new VF.Stave(staveX, 280, staveWidth);
    bassStave.addClef("bass").setContext(context).draw();
    const ct = VF.StaveConnector.type;
    new VF.StaveConnector(trebleStave, bassStave).setType(ct.BRACE).setContext(context).draw();
    new VF.StaveConnector(trebleStave, bassStave).setType(ct.SINGLE_LEFT).setContext(context).draw();
    new VF.StaveConnector(trebleStave, bassStave).setType(ct.SINGLE_RIGHT).setContext(context).draw();

    const hitLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
    hitLine.setAttribute("x1", huHitLineX);
    hitLine.setAttribute("x2", huHitLineX);
    hitLine.setAttribute("y1", 40);
    hitLine.setAttribute("y2", 440);
    hitLine.setAttribute("stroke", "#e74c3c");
    hitLine.setAttribute("stroke-width", "3");
    hitLine.setAttribute("stroke-dasharray", "6,4");
    huSvg.appendChild(hitLine);

    huNoteGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    huSvg.appendChild(huNoteGroup);
  }

  // Fase memoritzar: dibuixa totes les posicions de la diana, estàtiques en NEGRE
  function huShowMemorize() {
    huState = "memorize";
    if (huRAF) { cancelAnimationFrame(huRAF); huRAF = null; }
    huBuildStage();
    const clefs = huClefSelect.value === "both" ? ["treble", "bass"] : [huClefSelect.value];
    const level = parseInt(huLevelSelect.value, 10) || 3;
    const SVG_NS = "http://www.w3.org/2000/svg";
    // Recollim totes les posicions de la lletra-diana dins el rang del nivell + claus
    let targetEntries = [];
    clefs.forEach(clef => {
      const pool = (level === 3 || !LEVELS[level]) ? RANGES[clef] : LEVELS[level][clef];
      pool.filter(n => noteLetter(n) === huTarget).forEach(n => targetEntries.push({ clef, note: n }));
    });
    // Espaiat horitzontal uniforme entre hit-line i spawn
    const startX = huHitLineX + 80;
    const endX = huSpawnX - 40;
    const usable = Math.max(1, endX - startX);
    const step = targetEntries.length > 1 ? usable / (targetEntries.length - 1) : 0;
    targetEntries.forEach((e, i) => {
      const x = targetEntries.length === 1 ? (startX + usable / 2) : (startX + step * i);
      const y = spNoteY(e.note, e.clef);
      const g = document.createElementNS(SVG_NS, "g");
      g.classList.add("hu-memo-note");
      spDrawLedgers(g, SVG_NS, y, e.clef);
      spDrawQuarterNote(g, SVG_NS, y, e.clef);
      g.style.transform = "translate3d(" + x + "px, " + y + "px, 0)";
      // NO recolorem: queden negres com les del pentagrama natural
      huNoteGroup.appendChild(g);
    });
    // Mostra la barra inferior "Memoritza els XX · Començar" (fora del pentagrama)
    huShowMemoBar();
    huRefreshBestUI();
    huStreakEl.textContent = "0";
    huSpeedLevelEl.textContent = huCurrentSpeed;
  }

  function huStart() {
    huState = "playing";
    huCurrentSpeed = parseInt(huSpeedSelect.value, 10) || huCurrentSpeed;
    huStreak = 0;
    huCorrect = 0;
    if (huNoteGroup) huNoteGroup.innerHTML = "";
    huActive = [];
    huHideOverlay();
    huLastFrame = 0;
    huLastSpawn = 0;
    huUpdateStats();
    huRAF = requestAnimationFrame(huGameLoop);
  }

  function huGameLoop(ts) {
    if (huState !== "playing") return;
    huLastFrame = ts;

    for (let i = huActive.length - 1; i >= 0; i--) {
      const n = huActive[i];
      // Posició calculada per temps — NO tocquem style cada frame (compositor s'encarrega)
      const elapsed = ts - n.startTime;
      const progress = elapsed / n.durationMs;
      const x = n.startX + (n.endX - n.startX) * progress;
      n.x = x;

      if (n.state === "pending" && x < huHitLineX - 20) {
        if (noteLetter(n.note) === huTarget) {
          huFail(n, "Has deixat passar una " + NOTE_NAMES_CA[huTarget].toUpperCase());
          return;
        }
        if (n.el.parentNode) n.el.parentNode.removeChild(n.el);
        huActive.splice(i, 1);
      }
    }

    if (ts - huLastSpawn >= huSpawnInterval()) {
      huSpawnNote();
      huLastSpawn = ts;
    }

    huRAF = requestAnimationFrame(huGameLoop);
  }

  function huSpawnNote() {
    const clef = huPickClef();
    const note = pickNoteForLevel(clef, huLevelSelect.value);
    const y = spNoteY(note, clef);
    const SVG_NS = "http://www.w3.org/2000/svg";
    const g = document.createElementNS(SVG_NS, "g");
    g.classList.add("hu-note");
    spDrawLedgers(g, SVG_NS, y, clef);
    spDrawQuarterNote(g, SVG_NS, y, clef);

    const startX = huSpawnX;
    const endX = huHitLineX - 40;
    const distancePx = startX - endX;
    const durationMs = distancePx / huPxPerMs();
    g.style.transform = "translate3d(" + startX + "px, " + y + "px, 0)";
    g.style.pointerEvents = "all";
    g.style.cursor = "pointer";

    // Zona clic INVISIBLE més ampla que el cap de la nota (facilita encertar
    // amb ratolí o dit sense haver de tocar el punt exacte). La classe hu-hit
    // s'exclou del filtre drop-shadow del :hover perquè l'aurèola NO es veu
    // en forma de rectangle.
    const hit = document.createElementNS(SVG_NS, "rect");
    hit.setAttribute("class", "hu-hit");
    hit.setAttribute("x", -22);
    hit.setAttribute("y", -34);
    hit.setAttribute("width", 44);
    hit.setAttribute("height", 68);
    hit.setAttribute("fill", "transparent");
    hit.setAttribute("stroke", "none");
    hit.setAttribute("pointer-events", "all");
    g.appendChild(hit);

    huNoteGroup.appendChild(g);
    const anim = g.animate([
      { transform: "translate3d(" + startX + "px, " + y + "px, 0)" },
      { transform: "translate3d(" + endX   + "px, " + y + "px, 0)" }
    ], { duration: durationMs, easing: "linear", fill: "forwards" });

    const obj = {
      clef, note, y, el: g, state: "pending",
      startTime: performance.now(), durationMs, startX, endX, x: startX,
      anim
    };
    const handler = (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      huOnNoteClick(obj);
    };
    g.addEventListener("click", handler);
    g.addEventListener("touchend", handler);
    huActive.push(obj);
  }

  function huOnNoteClick(n) {
    if (huState !== "playing") return;
    if (n.state !== "pending") return;
    const letter = noteLetter(n.note);
    if (letter === huTarget) {
      n.state = "hit";
      huStreak++;
      huCorrect++;
      playNote(n.note);
      spColorNote(n.el, "#27ae60");
      burstNoteAt(n.el, ["#00F0FF", "#00FF94", "#FFB800", "#FF10F0"], 24);
      flashHitLine();
      tickCounter(huStreakEl);
      huUpdateStats();
      // Congela l'animació perquè la nota caçada no segueixi avançant mentre es fa fade-out
      if (n.anim) { try { n.anim.pause(); } catch(e) {} }
      const el = n.el;
      setTimeout(() => { if (el.parentNode) el.parentNode.removeChild(el); }, 160);
      const idx = huActive.indexOf(n);
      if (idx >= 0) huActive.splice(idx, 1);
      if (huStreak >= SP_STREAK_TO_ADVANCE) huLevelUp();
    } else {
      huFail(n, "Això era un " + NOTE_NAMES_CA[letter].toUpperCase() +
                ", no un " + NOTE_NAMES_CA[huTarget].toUpperCase());
    }
  }

  function huFail(n, msg) {
    if (huState !== "playing") return;
    huState = "paused";
    if (huRAF) { cancelAnimationFrame(huRAF); huRAF = null; }
    // Congela totes les animacions WAAPI en curs perquè la pantalla quedi quieta
    huActive.forEach(x => { if (x.anim) { try { x.anim.pause(); } catch(e) {} } });
    playErrorSound();
    shakeElement(huContainer);
    // Marca la nota culpable en vermell + etiqueta amb el nom. Queda visible sobre el
    // pentagrama perquè l'usuari pugui veure EXACTAMENT quina nota ha fallat.
    spColorNote(n.el, "#e74c3c");
    burstNoteAt(n.el, ["#FF3366", "#9A1750", "#BC4749"], 18);
    const SVG_NS = "http://www.w3.org/2000/svg";
    const label = document.createElementNS(SVG_NS, "text");
    label.setAttribute("x", 0);
    label.setAttribute("y", -18);
    label.setAttribute("text-anchor", "middle");
    label.setAttribute("font-size", "18");
    label.setAttribute("font-weight", "bold");
    label.setAttribute("fill", "#e74c3c");
    label.textContent = NOTE_NAMES_CA[noteLetter(n.note)].toUpperCase();
    n.el.appendChild(label);

    // Barra inferior FORA del pentagrama (igual que sp-retry-bar) — no tapa notes
    const failName  = NOTE_NAMES_CA[noteLetter(n.note)].toUpperCase();
    const failNameEl  = document.getElementById("hu-fail-name");
    const failScoreEl = document.getElementById("hu-fail-score");
    const failBestEl  = document.getElementById("hu-fail-best");
    if (failNameEl)  failNameEl.textContent  = failName;
    if (failScoreEl) failScoreEl.textContent = huCorrect + "/" + SP_STREAK_TO_ADVANCE;

    const prevBest = getHuBest();
    const isRecord = huCorrect > prevBest;
    const isTie = huCorrect > 0 && huCorrect === prevBest;
    if (isRecord) {
      setHuBest(huCorrect);
      playCongratulations();
    } else if (isTie) {
      playEncouragement();
    }
    if (failScoreEl) {
      failScoreEl.classList.remove("is-record", "is-tie");
      if (isRecord) failScoreEl.classList.add("is-record");
      else if (isTie) failScoreEl.classList.add("is-tie");
    }
    if (failBestEl) {
      if (isRecord) failBestEl.textContent = "🏆 Nou rècord";
      else if (isTie) failBestEl.textContent = "👍 Empat";
      else if (prevBest > 0) failBestEl.textContent = "millor: " + prevBest + "/" + SP_STREAK_TO_ADVANCE;
      else failBestEl.textContent = "";
    }

    // Amaga la barra de memoritzar i mostra la retry-bar
    if (huMemoBar) huMemoBar.classList.add("hidden");
    if (huRetryBar) huRetryBar.classList.remove("hidden");
    huRefreshBestUI();
  }

  function huLevelUp() {
    if (huCurrentSpeed >= SP_MAX_SPEED) {
      huWin();
      return;
    }
    huState = "levelup";
    if (huRAF) { cancelAnimationFrame(huRAF); huRAF = null; }
    const prevBest = getHuBest();
    if (huCorrect > prevBest) setHuBest(huCorrect);
    spawnConfetti({ count: 80 });
    playCongratulations();
    const passed = huCurrentSpeed;
    huCurrentSpeed++;
    huStreak = 0; huCorrect = 0;
    huLvlUpTitle.textContent = "Velocitat " + passed + " superada!";
    huLvlUpSub.textContent = "Avances a la velocitat " + huCurrentSpeed;
    huSpeedSelect.value = String(huCurrentSpeed);
    huSpeedSelect.dispatchEvent(new Event("change", { bubbles: true }));
    huUpdateStats();
    huShowOverlay(huOvLevelUp);
    huRefreshBestUI();

    setTimeout(() => {
      if (huState !== "levelup") return;
      huActive.forEach(x => { if (x.el.parentNode) x.el.parentNode.removeChild(x.el); });
      huActive = [];
      huHideOverlay();
      huState = "playing";
      huLastFrame = 0; huLastSpawn = 0;
      huRAF = requestAnimationFrame(huGameLoop);
    }, 1500);
  }

  function huWin() {
    huState = "won";
    if (huRAF) { cancelAnimationFrame(huRAF); huRAF = null; }
    const prevBest = getHuBest();
    if (huCorrect > prevBest) setHuBest(huCorrect);
    spawnConfetti({ count: 200 });
    playCongratulations();
    huWinTargetEl.textContent = NOTE_NAMES_CA[huTarget].toUpperCase();
    huShowOverlay(huOvWin);
    huRefreshBestUI();
  }

  function huRetry() {
    huActive.forEach(x => { if (x.el.parentNode) x.el.parentNode.removeChild(x.el); });
    huActive = [];
    huStreak = 0; huCorrect = 0;
    huUpdateStats();
    huShowMemorize();
  }
  function huRestart() {
    huCurrentSpeed = 1;
    huSpeedSelect.value = "1";
    huSpeedSelect.dispatchEvent(new Event("change", { bubbles: true }));
    huStreak = 0; huCorrect = 0;
    huActive.forEach(x => { if (x.el.parentNode) x.el.parentNode.removeChild(x.el); });
    huActive = [];
    huUpdateStats();
    huShowMemorize();
  }

  function huShowOverlay(panel) {
    if (huMemoBar)  huMemoBar.classList.add("hidden");
    if (huRetryBar) huRetryBar.classList.add("hidden");
    huOverlay.classList.remove("hidden");
    [huOvLevelUp, huOvWin].forEach(p => p.classList.add("hidden"));
    if (panel) panel.classList.remove("hidden");
  }
  function huHideOverlay() {
    huOverlay.classList.add("hidden");
    if (huMemoBar)  huMemoBar.classList.add("hidden");
    if (huRetryBar) huRetryBar.classList.add("hidden");
  }
  function huShowMemoBar() {
    huOverlay.classList.add("hidden");
    if (huRetryBar) huRetryBar.classList.add("hidden");
    if (huMemoBar) huMemoBar.classList.remove("hidden");
  }

  function huUpdateStats() {
    huSpeedLevelEl.textContent = huCurrentSpeed;
    huStreakEl.textContent = huStreak;
    huRefreshBestUI();
  }
  function huRefreshBestUI() {
    const best = getHuBest();
    huBestEl.textContent = best > 0 ? (best + "/" + SP_STREAK_TO_ADVANCE) : "—";
  }

  function renderHuKeyboard() {
    if (!huPiano) return;
    const whites = ["c/4","d/4","e/4","f/4","g/4","a/4","b/4"];
    huPiano.innerHTML = pianoKeysHTML(whites, "hu-target-btn");
    setSizeClass(huPiano, whites.length);
    const caName = NOTE_NAMES_CA[huTarget] || "do";
    huPiano.querySelectorAll(".nk-key").forEach(b =>
      b.classList.toggle("is-selected", b.dataset.note === caName));
  }

  function huSetTarget(letter) {
    // letter és la lletra pitch (c, d, e, f, g, a, b)
    if (!NOTE_NAMES_CA[letter]) return; // protecció per si arriba un valor estrany
    huTarget = letter;
    const caName = NOTE_NAMES_CA[letter]; // "do", "re", ...
    const caUpper = caName.toUpperCase();
    if (huTargetLabelEl) huTargetLabelEl.textContent = caUpper;
    // Actualitza els textos de la barra de memorització ("Memoritza els XX · al joc clica només les XX...")
    const memoTargetEl = document.getElementById("hu-memo-target");
    const memoTargetHintEl = document.getElementById("hu-memo-target-hint");
    if (memoTargetEl) memoTargetEl.textContent = caUpper;
    if (memoTargetHintEl) memoTargetHintEl.textContent = caUpper;
    // Marca la tecla seleccionada al piano
    if (huPiano) {
      huPiano.querySelectorAll(".nk-key").forEach(b =>
        b.classList.toggle("is-selected", b.dataset.note === caName));
    }
    // Canvi de diana → reinicia partida (nou memoritzar)
    huCurrentSpeed = parseInt(huSpeedSelect.value, 10) || huCurrentSpeed;
    huStreak = 0; huCorrect = 0;
    huActive.forEach(x => { if (x.el.parentNode) x.el.parentNode.removeChild(x.el); });
    huActive = [];
    huUpdateStats();
    huShowMemorize();
  }

  function huEnterScreen() {
    // En entrar, comencem SEMPRE amb diana DO i a velocitat 1 per començar net
    huCurrentSpeed = parseInt(huSpeedSelect.value, 10) || 1;
    huSetTarget("c"); // Do per defecte
  }

  huStartBtn.addEventListener("click", huStart);
  huRetryBtn.addEventListener("click", huRetry);
  huRestartBtn.addEventListener("click", huRestart);
  renderHuKeyboard();
  huPiano.addEventListener("click", (e) => {
    const key = e.target.closest(".nk-key");
    if (!key || !huPiano.contains(key)) return;
    const letter = HU_CA_TO_LETTER[key.dataset.note];
    if (letter) huSetTarget(letter);
  });
  huClefSelect.addEventListener("change", () => huSetTarget(huTarget));
  huLevelSelect.addEventListener("change", () => huSetTarget(huTarget));
  huSpeedSelect.addEventListener("change", () => {
    const v = parseInt(huSpeedSelect.value, 10);
    if (!isNaN(v) && v >= 1 && v <= SP_MAX_SPEED) huCurrentSpeed = v;
    // Si l'estat és levelup/won, el canvi ha vingut del huLevelUp/huWin programàtic
    // — no reiniciem la partida (deixaríem penjat el timer que torna a 'playing').
    if (huState === "levelup" || huState === "won") return;
    // Si estàvem jugant per l'usuari, qualsevol canvi reinicia (coherent amb la resta)
    if (huState !== "idle") huSetTarget(huTarget);
  });

  // ---------- PARTITURES (render MusicXML via OSMD — prototip visual) ----------
  const ptSelect       = document.getElementById("pt-select");
  const ptInfoEl       = document.getElementById("pt-info");
  const ptContainer    = document.getElementById("pt-staff-container");
  const ptAdjustBtn    = document.getElementById("pt-adjust-btn");
  const ptAdjustPanel  = document.getElementById("pt-adjust-panel");
  const ptCopyBtn      = document.getElementById("pt-copy-btn");
  const ptResetBtn     = document.getElementById("pt-reset-btn");
  const ptPracticeBtn  = document.getElementById("pt-practice-btn");
  const ptPianoEl      = document.getElementById("pt-piano");
  const ptFeedbackEl   = document.getElementById("pt-feedback");
  const ptClefBtns     = document.querySelectorAll(".pt-clef-btn");
  const ptPianoKeys    = document.querySelectorAll(".pt-key");
  let ptPracticeOn = false;
  let ptActiveStaff = 0; // 0 = Sol (treble = staff 1 XML), 1 = Fa (bass = staff 2 XML)
  const PT_STEP_TO_SEMITONE = [0, 2, 4, 5, 7, 9, 11];
  const PT_STEP_NAME = { C: 0, D: 1, E: 2, F: 3, G: 4, A: 5, B: 6 };
  // Track d'esdeveniments parsejats del MusicXML — ens dona control total
  // sobre les notes i l'ordre de lectura sense dependre de l'API d'OSMD.
  let ptTrackAll = []; // tots els events (tots els staves, voice 1)
  let ptTrack = [];    // filtrat pel staff actiu
  let ptTrackIdx = 0;
  let ptPressedInCurrent = new Set();

  // Parser MusicXML → events ordenats per (measure, time, voice).
  // Inclou TOTES les veus (voice 1 melodia + voice 2 acompanyament + ...).
  // Ús de <backup>/<forward> per calcular el temps dins el compàs correctament.
  function ptParseEvents(xmlText) {
    const doc = new DOMParser().parseFromString(xmlText, "text/xml");
    const events = [];
    const part = doc.querySelector("part");
    if (!part) return events;

    Array.from(part.querySelectorAll("measure")).forEach((mEl, mIdx) => {
      const measureNum = parseInt(mEl.getAttribute("number"), 10) || (mIdx + 1);
      let currentTime = 0; // en divisions
      let lastEvent = null; // per acord continuation

      Array.from(mEl.children).forEach(el => {
        if (el.tagName === "backup") {
          const dur = parseInt(el.querySelector("duration")?.textContent || "0", 10);
          currentTime -= dur;
          lastEvent = null;
          return;
        }
        if (el.tagName === "forward") {
          const dur = parseInt(el.querySelector("duration")?.textContent || "0", 10);
          currentTime += dur;
          lastEvent = null;
          return;
        }
        if (el.tagName !== "note") return;

        const voiceEl = el.querySelector(":scope > voice");
        const voice = voiceEl ? parseInt(voiceEl.textContent, 10) : 1;
        const isChord = !!el.querySelector(":scope > chord");
        const isRest = !!el.querySelector(":scope > rest");
        const durEl = el.querySelector(":scope > duration");
        const dur = durEl ? parseInt(durEl.textContent, 10) : 0;
        const staffEl = el.querySelector(":scope > staff");
        const staff = staffEl ? parseInt(staffEl.textContent, 10) : 1;

        const noteTime = isChord ? (lastEvent ? lastEvent.time : currentTime) : currentTime;

        if (isRest) {
          if (!isChord) currentTime += dur;
          lastEvent = null;
          return;
        }

        const pitchEl = el.querySelector(":scope > pitch");
        if (!pitchEl) {
          if (!isChord) currentTime += dur;
          return;
        }

        const step = pitchEl.querySelector("step")?.textContent || "C";
        const octave = parseInt(pitchEl.querySelector("octave")?.textContent || "4", 10);
        const alterEl = pitchEl.querySelector("alter");
        const alter = alterEl ? parseInt(alterEl.textContent, 10) : 0;
        const semiBase = PT_STEP_TO_SEMITONE[PT_STEP_NAME[step] || 0];
        const semitone = ((semiBase + alter) % 12 + 12) % 12;
        const pitch = octave * 12 + semiBase + alter;
        const note = { step, octave, alter, semitone, pitch };

        if (isChord && lastEvent && lastEvent.staff === staff && lastEvent.voice === voice) {
          lastEvent.notes.push(note);
          lastEvent.notes.sort((a, b) => b.pitch - a.pitch);
        } else {
          lastEvent = { measure: measureNum, staff, voice, time: noteTime, notes: [note] };
          events.push(lastEvent);
        }
        if (!isChord) currentTime += dur;
      });
    });

    // Ordena per (measure, time, voice). Al mateix time, voice 1 primer (melodia).
    events.sort((a, b) => {
      if (a.measure !== b.measure) return a.measure - b.measure;
      if (a.time !== b.time) return a.time - b.time;
      return a.voice - b.voice;
    });
    return events;
  }

  function ptRefreshTrack() {
    const xmlStaffNum = ptActiveStaff + 1;
    ptTrack = ptTrackAll.filter(ev => ev.staff === xmlStaffNum);
    ptTrackIdx = 0;
    ptPressedInCurrent = new Set();
  }

  function ptFormatNoteNameCA(note) {
    const names = ["DO","RE","MI","FA","SOL","LA","SI"];
    const idx = PT_STEP_NAME[note.step] || 0;
    let name = names[idx];
    if (note.alter === 1) name += "♯";
    else if (note.alter === -1) name += "♭";
    else if (note.alter === 2) name += "𝄪";
    else if (note.alter === -2) name += "𝄫";
    return name + note.octave;
  }

  function ptFormatEventName(ev) {
    return ev.notes.map(ptFormatNoteNameCA).join(" + ");
  }

  function ptSemitoneToName(st) {
    const names = ["DO","DO♯","RE","RE♯","MI","FA","FA♯","SOL","SOL♯","LA","LA♯","SI"];
    return names[st] || "?";
  }
  const PT_CFG_KEY     = "ptSpaceConfig_v1";
  // Valors per defecte calibrats per l'usuari amb el panell d'ajust (17/04/2026):
  // - padding 4: mica de respir sota el contenidor, amb el paper ja tocat a dalt
  // - ttop 0: títol al marge superior del SVG
  // - tbot 7: espai compacte però clar entre títol i primer compàs
  // - crop 70: retalla 70px del buit superior del SVG
  // - zoom 0.67: 5-6 compassos per línia com al PDF original
  const PT_DEFAULTS    = { padding: 4, ttop: 0, tbot: 7, crop: 70, zoom: 0.67 };

  function ptLoadConfig() {
    try {
      const raw = localStorage.getItem(PT_CFG_KEY);
      if (!raw) return { ...PT_DEFAULTS };
      const parsed = JSON.parse(raw);
      return { ...PT_DEFAULTS, ...parsed };
    } catch (e) { return { ...PT_DEFAULTS }; }
  }
  function ptSaveConfig(cfg) {
    try { localStorage.setItem(PT_CFG_KEY, JSON.stringify(cfg)); } catch (e) {}
  }
  let ptCfg = ptLoadConfig();

  let ptOsmd = null;
  let ptCatalog = null; // llista de partitures (del index.json)
  let ptInitialized = false;
  let ptLastLoadedId = null;

  async function ptLoadCatalog() {
    if (ptCatalog) return ptCatalog;
    try {
      const resp = await fetch("partitures/index.json", { cache: "no-cache" });
      if (!resp.ok) throw new Error("HTTP " + resp.status);
      ptCatalog = await resp.json();
    } catch (e) {
      ptCatalog = [];
      console.error("[Partitures] No s'ha pogut carregar index.json:", e);
    }
    return ptCatalog;
  }

  function ptPopulateSelect(catalog) {
    ptSelect.innerHTML = "";
    if (!catalog.length) {
      const opt = document.createElement("option");
      opt.value = "";
      opt.textContent = "(cap partitura disponible)";
      ptSelect.appendChild(opt);
      return;
    }
    catalog.forEach(item => {
      const opt = document.createElement("option");
      opt.value = item.id;
      opt.textContent = item.name + (item.author ? " — " + item.author : "");
      ptSelect.appendChild(opt);
    });
    // Si el select està dins d'un .xsel (custom dropdown), notifica el canvi d'opcions
    ptSelect.dispatchEvent(new Event("change", { bubbles: true }));
  }

  // Carrega .mxl o .xml des del repo, descomprimeix si cal i retorna XML text
  async function ptLoadMusicXmlText(fileName) {
    const url = "partitures/" + fileName;
    const resp = await fetch(url, { cache: "no-cache" });
    if (!resp.ok) throw new Error("No s'ha pogut carregar " + fileName + " (HTTP " + resp.status + ")");
    if (fileName.toLowerCase().endsWith(".mxl")) {
      if (typeof JSZip === "undefined") throw new Error("JSZip no carregat");
      const buf = await resp.arrayBuffer();
      const zip = await JSZip.loadAsync(buf);
      // Busca la ruta del fitxer principal via META-INF/container.xml
      let rootPath = null;
      const containerFile = zip.file("META-INF/container.xml");
      if (containerFile) {
        const ctext = await containerFile.async("string");
        const cdoc = new DOMParser().parseFromString(ctext, "text/xml");
        const rf = cdoc.querySelector("rootfile");
        if (rf) rootPath = rf.getAttribute("full-path");
      }
      if (!rootPath) {
        const names = Object.keys(zip.files).filter(n =>
          !zip.files[n].dir && !n.startsWith("META-INF") && /\.(xml|musicxml)$/i.test(n)
        );
        rootPath = names[0];
      }
      if (!rootPath) throw new Error("Fitxer .mxl sense XML vàlid");
      return await zip.file(rootPath).async("string");
    }
    return await resp.text();
  }

  async function ptRenderPartitura(item) {
    ptInfoEl.textContent = "Carregant " + item.name + "…";
    ptContainer.innerHTML = ""; // buida qualsevol render anterior

    try {
      const xmlText = await ptLoadMusicXmlText(item.file);

      // Parser propi: ens dona control total sobre les notes i l'ordre de lectura
      // (no depenem de l'API de cursor d'OSMD, que era inestable).
      ptTrackAll = ptParseEvents(xmlText);
      ptRefreshTrack();

      if (typeof opensheetmusicdisplay === "undefined") {
        throw new Error("OpenSheetMusicDisplay no s'ha carregat des del CDN");
      }

      // Cal una nova instància per cada re-render (evita problemes d'estat intern)
      ptOsmd = new opensheetmusicdisplay.OpenSheetMusicDisplay(ptContainer, {
        backend: "svg",
        drawTitle: true,
        drawComposer: true,
        drawCredits: false,
        drawSubtitle: false,
        drawPartNames: false,
        autoResize: false, // IMPORTANT: sinó OSMD re-renderitza sol i perd els nostres estils
        pageFormat: "Endless",
        drawingParameters: "compact"
      });

      await ptOsmd.load(xmlText);
      // Valors del ptCfg (editables pel user via panel) — amb fallback per mòbil
      const isMobile = window.innerWidth < 600;
      ptOsmd.zoom = isMobile ? 0.48 : ptCfg.zoom;
      // Aplica padding del contenidor
      ptContainer.style.paddingTop = ptCfg.padding + "px";
      try {
        const er = ptOsmd.EngravingRules;
        if (er) {
          if ("TitleTopDistance" in er) er.TitleTopDistance = ptCfg.ttop;
          if ("TitleBottomDistance" in er) er.TitleBottomDistance = ptCfg.tbot;
          if ("PageTopMargin" in er) er.PageTopMargin = 0;
          if ("PageTopMarginNarrow" in er) er.PageTopMarginNarrow = 0;
        }
      } catch (e) { /* EngravingRules diferents segons versió d'OSMD */ }
      ptOsmd.render();

      // Post-processat del SVG:
      // 1) Treure qualsevol rectangle de fons (era el "dos papers" gris)
      // 2) RETALLAR l'espai buit de dalt via CSS clip-path + margin-top negatiu
      //    (en PÍXELS, no en unitats SVG) — funciona de manera fiable.
      const svg = ptContainer.querySelector("svg");
      if (svg) {
        svg.style.background = "transparent";
        Array.from(svg.querySelectorAll("rect")).forEach(r => {
          const w = parseFloat(r.getAttribute("width") || "0");
          const h = parseFloat(r.getAttribute("height") || "0");
          const fill = r.getAttribute("fill");
          if (w > 400 && h > 400 && fill && fill !== "none") {
            r.setAttribute("fill", "transparent");
            r.setAttribute("stroke", "none");
          }
        });

      }
      // El retall del top i el padding del paper s'apliquen via CSS VARIABLE sobre
      // el contenidor (NO inline al SVG) — així sobreviuen a qualsevol re-render
      // futur d'OSMD. Veure la regla CSS '#pt-staff-container svg' a style.css.
      ptApplyCssVars();

      const info = [
        item.name,
        item.author ? "de " + item.author : "",
        item.timeSignature ? "· " + item.timeSignature : "",
        item.keySignature ? "· " + item.keySignature : "",
        item.measures ? "· " + item.measures + " compassos" : ""
      ].filter(Boolean).join(" ");
      ptInfoEl.textContent = info;
      ptLastLoadedId = item.id;
    } catch (e) {
      ptInfoEl.textContent = "⚠️ Error: " + (e.message || e);
      ptContainer.innerHTML = "<p style='padding:20px;color:#FF3366;font-family:var(--font-mono)'>No s'ha pogut renderitzar la partitura.<br>" + (e.message || "") + "</p>";
      console.error("[Partitures] Error:", e);
    }
  }

  // Aplica les variables CSS del contenidor a partir de ptCfg.
  // Aquest és l'enfoc fiable: variables CSS → les regles del style.css s'apliquen
  // automàticament a qualsevol SVG dins del contenidor, fins i tot després de
  // re-renders d'OSMD. Els canvis són instantanis al moure el slider.
  function ptApplyCssVars() {
    if (!ptContainer) return;
    ptContainer.style.setProperty("--pt-crop", (ptCfg.crop || 0) + "px");
    ptContainer.style.setProperty("--pt-padding-top", (ptCfg.padding || 0) + "px");
  }

  // --- Panell d'ajust d'espai (sliders live amb debounce) ---
  let ptAdjustDebounce = null;
  function ptBindAdjustPanel() {
    if (!ptAdjustBtn || ptAdjustBtn.dataset.bound === "1") return;
    ptAdjustBtn.dataset.bound = "1";

    // Mostra/amaga panel
    ptAdjustBtn.addEventListener("click", () => {
      ptAdjustPanel.classList.toggle("hidden");
    });

    // Sliders + labels
    const sliders = [
      { id: "padding", sel: "pt-s-padding", lbl: "pt-v-padding", fmt: v => String(Math.round(v)) },
      { id: "ttop",    sel: "pt-s-ttop",    lbl: "pt-v-ttop",    fmt: v => String(Math.round(v)) },
      { id: "tbot",    sel: "pt-s-tbot",    lbl: "pt-v-tbot",    fmt: v => String(Math.round(v)) },
      { id: "crop",    sel: "pt-s-crop",    lbl: "pt-v-crop",    fmt: v => String(Math.round(v)) },
      { id: "zoom",    sel: "pt-s-zoom",    lbl: "pt-v-zoom",    fmt: v => parseFloat(v).toFixed(2) }
    ];

    function syncSliderUI() {
      sliders.forEach(s => {
        const sl = document.getElementById(s.sel);
        const lbl = document.getElementById(s.lbl);
        if (sl) sl.value = ptCfg[s.id];
        if (lbl) lbl.textContent = s.fmt(ptCfg[s.id]);
      });
    }
    syncSliderUI();

    sliders.forEach(s => {
      const sl = document.getElementById(s.sel);
      const lbl = document.getElementById(s.lbl);
      if (!sl) return;
      sl.addEventListener("input", () => {
        const v = parseFloat(sl.value);
        ptCfg[s.id] = v;
        if (lbl) lbl.textContent = s.fmt(v);

        // Canvi INSTANTANI sense re-render per crop i padding (CSS variables).
        // Per ttop/tbot/zoom cal re-renderitzar perquè OSMD torni a dibuixar.
        if (s.id === "crop" || s.id === "padding") {
          ptApplyCssVars();
          clearTimeout(ptAdjustDebounce);
          ptAdjustDebounce = setTimeout(() => ptSaveConfig(ptCfg), 300);
        } else {
          clearTimeout(ptAdjustDebounce);
          ptAdjustDebounce = setTimeout(() => {
            ptSaveConfig(ptCfg);
            const id = ptSelect.value;
            const item = (ptCatalog || []).find(p => p.id === id);
            if (item) ptRenderPartitura(item);
          }, 350);
        }
      });
    });

    // Copiar valors al porta-retalls perquè l'usuari els pugui enviar
    if (ptCopyBtn) {
      ptCopyBtn.addEventListener("click", async () => {
        const txt = "padding: " + ptCfg.padding + "px · ttop: " + ptCfg.ttop +
                    " · tbot: " + ptCfg.tbot + " · crop: " + ptCfg.crop +
                    " · zoom: " + ptCfg.zoom.toFixed(2);
        try {
          await navigator.clipboard.writeText(txt);
          showToast("Valors copiats: " + txt, "success");
        } catch (e) {
          prompt("Valors (copia'ls):", txt);
        }
      });
    }

    // Reset als defaults
    if (ptResetBtn) {
      ptResetBtn.addEventListener("click", () => {
        ptCfg = { ...PT_DEFAULTS };
        ptSaveConfig(ptCfg);
        syncSliderUI();
        const id = ptSelect.value;
        const item = (ptCatalog || []).find(p => p.id === id);
        if (item) ptRenderPartitura(item);
      });
    }
  }

  // --- MODE LECTURA (track parsejat del MusicXML, no depenem d'OSMD cursor) ---

  function ptCurrentEvent() { return ptTrack[ptTrackIdx] || null; }

  function ptCurrentExpectedSemitones() {
    const ev = ptCurrentEvent();
    if (!ev) return new Set();
    return new Set(ev.notes.map(n => n.semitone));
  }

  function ptDisplayCurrent() {
    const ev = ptCurrentEvent();
    if (!ev) {
      ptFeedbackEl.textContent = "🎉 Fi de la partitura";
      ptFeedbackEl.className = "feedback correct";
      ptHighlightExpectedKeys();
      return;
    }
    const name = ptFormatEventName(ev);
    ptFeedbackEl.textContent = "Toca: " + name + "  (compàs " + ev.measure + ")";
    ptFeedbackEl.className = "feedback";
    ptHighlightExpectedKeys();
  }

  // Ressalta les tecles del piano que corresponen a l'acord actual perquè
  // l'usuari sàpiga quines premer (especialment útil per bemolls/sostinguts —
  // si la nota és Lab4, es ressalta la tecla 'Sol♯/La♭', no la 'La').
  function ptHighlightExpectedKeys() {
    document.querySelectorAll(".pt-key.pt-key-hint").forEach(k => {
      k.classList.remove("pt-key-hint");
    });
    const ev = ptCurrentEvent();
    if (!ev) return;
    ev.notes.forEach(n => {
      // Salta les que l'usuari ja ha premut en aquest acord
      if (ptPressedInCurrent.has(n.semitone)) return;
      const key = document.querySelector(".pt-key[data-st=\"" + n.semitone + "\"]");
      if (key) key.classList.add("pt-key-hint");
    });
  }

  const PT_BLUE = "#1E90FF";
  const PT_RED  = "#E74C3C";
  // Set d'índexs de ptTrack que l'usuari ha fallat (es mantenen vermells).
  let ptFailedTrackIdxs = new Set();
  // Noms curts en català per les etiquetes de fallada (no volem "DO5" al damunt,
  // només "Do" amb accidental si cal)
  const PT_CA_NAMES_SHORT = { C: "Do", D: "Re", E: "Mi", F: "Fa", G: "Sol", A: "La", B: "Si" };

  // Etiquetem TOTES les notes del DOM EXCEPTE els silencis. A OSMD els silencis
  // també surten com `.vf-stavenote` (mateixa classe!) però tenen una forma
  // característica: alts i estrets (h > w), mentre que les noteheads són
  // amples i curtes (w > h). Aquest heurístic funciona bé per corxeres,
  // semicorxeres i negres. Així els índexs DOM s'alineen amb els events del
  // parser (que exclou rests).
  function ptLabelSVGNotes() {
    if (!ptContainer) return;
    const stafflines = ptContainer.querySelectorAll("svg g.staffline");
    if (stafflines.length === 0) return;
    let iSol = 0, iFa = 0;
    stafflines.forEach((sl, slIdx) => {
      const isTreble = (slIdx % 2 === 0);
      const attr = isTreble ? "data-pt-sol" : "data-pt-fa";
      const notes = sl.querySelectorAll("g.vf-stavenote");
      notes.forEach(noteEl => {
        // Detecció de silenci per bbox: els silencis són més alts que amples.
        // Noteheads (blanques, negres, rodones...) són ~oval: width > height.
        let isRest = false;
        try {
          const bb = noteEl.getBBox();
          if (bb && bb.height > bb.width * 1.15) isRest = true;
        } catch (e) {}
        if (isRest) return; // saltem silencis — no els etiquetem
        noteEl.setAttribute(attr, isTreble ? iSol++ : iFa++);
      });
    });
  }

  function ptResetAllSVGNoteColors() {
    if (!ptContainer) return;
    ptContainer.querySelectorAll("[data-pt-sol], [data-pt-fa]").forEach(g => {
      g.classList.remove("pt-note-current");
      g.classList.remove("pt-note-failed");
      g.querySelectorAll("path, ellipse").forEach(el => {
        if (el.dataset.ptOrigFill !== undefined) {
          el.setAttribute("fill", el.dataset.ptOrigFill);
        }
      });
    });
    // Treu totes les etiquetes de noms de nota fallada
    ptContainer.querySelectorAll(".pt-fail-label").forEach(t => t.remove());
    ptFailedTrackIdxs.clear();
  }

  // Marca la nota actual com a fallada PERMANENT: fill vermell + text amb el
  // nom de la nota a sobre. No es treu quan avançes (a diferència del blau).
  function ptMarkCurrentAsFailed(correctName) {
    const attr = ptActiveStaff === 0 ? "data-pt-sol" : "data-pt-fa";
    const target = ptContainer.querySelector("[" + attr + "=\"" + ptTrackIdx + "\"]");
    if (!target) return;
    target.classList.add("pt-note-failed");
    target.querySelectorAll("path, ellipse").forEach(el => {
      if (el.dataset.ptOrigFill === undefined) {
        el.dataset.ptOrigFill = el.getAttribute("fill") || "#000000";
      }
      el.setAttribute("fill", PT_RED);
    });
    // Afegeix text amb el nom al damunt de la nota — BEN gran i visible perquè
    // l'usuari pugui repassar d'un cop d'ull els errors.
    try {
      const bbox = target.getBBox ? target.getBBox() : null;
      const svg = target.closest("svg");
      if (bbox && svg) {
        const ns = "http://www.w3.org/2000/svg";
        const t = document.createElementNS(ns, "text");
        t.setAttribute("x", bbox.x + bbox.width / 2);
        t.setAttribute("y", bbox.y - 6);
        t.setAttribute("text-anchor", "middle");
        t.setAttribute("font-size", "14");
        t.setAttribute("font-weight", "900");
        t.setAttribute("fill", PT_RED);
        t.setAttribute("stroke", "#FFFFFF");
        t.setAttribute("stroke-width", "0.5");
        t.setAttribute("paint-order", "stroke");
        t.setAttribute("font-family", "'Outfit', sans-serif");
        t.setAttribute("class", "pt-fail-label");
        t.textContent = correctName;
        svg.appendChild(t);
      }
    } catch (e) {}
    ptFailedTrackIdxs.add(ptTrackIdx);
  }

  function ptHighlightCurrentNote(color) {
    if (!ptContainer) return;
    // Desressaltem la que estava en blau (si n'hi ha) — PERÒ les que estan
    // fallades (pt-note-failed) les mantenim vermelles permanentment.
    ptContainer.querySelectorAll(".pt-note-current").forEach(g => {
      g.classList.remove("pt-note-current");
      if (g.classList.contains("pt-note-failed")) return; // mantenir vermell
      g.querySelectorAll("path, ellipse").forEach(el => {
        if (el.dataset.ptOrigFill !== undefined) {
          el.setAttribute("fill", el.dataset.ptOrigFill);
        }
      });
    });
    // Trobem l'element de la nota actual
    const attr = ptActiveStaff === 0 ? "data-pt-sol" : "data-pt-fa";
    const target = ptContainer.querySelector("[" + attr + "=\"" + ptTrackIdx + "\"]");
    if (!target) return;
    target.classList.add("pt-note-current");
    // Si està marcada com a fallada, no sobreescriure el vermell amb blau.
    if (!target.classList.contains("pt-note-failed")) {
      target.querySelectorAll("path, ellipse").forEach(el => {
        if (el.dataset.ptOrigFill === undefined) {
          el.dataset.ptOrigFill = el.getAttribute("fill") || "#000000";
        }
        el.setAttribute("fill", color);
      });
    }
    try { target.scrollIntoView({ behavior: "smooth", block: "center" }); } catch (e) {}
  }

  function ptAdvanceOsmdCursor() {
    // Ja no depenem del cursor d'OSMD (amagat). La funció queda per
    // compatibilitat amb crides existents.
  }

  function ptEnterPractice() {
    if (!ptOsmd) return;
    ptPracticeOn = true;
    // Amaguem el cursor d'OSMD — la nota actual la ressaltem directament al SVG
    try { ptOsmd.cursor.hide(); } catch (e) {}
    ptPianoEl.classList.remove("hidden");
    document.body.classList.add("pt-practicing");
    ptPracticeBtn.classList.add("is-active");
    ptPracticeBtn.textContent = "⏸ Aturar";
    ptRefreshTrack();
    // Si encara no hem etiquetat les notes SVG, ho fem ara
    ptLabelSVGNotes();
    ptDisplayCurrent();
    // Pinta la primera nota en blau
    ptHighlightCurrentNote(PT_BLUE);
  }

  function ptExitPractice() {
    ptPracticeOn = false;
    ptResetAllSVGNoteColors();
    try { ptOsmd && ptOsmd.cursor && ptOsmd.cursor.hide(); } catch (e) {}
    ptPianoEl.classList.add("hidden");
    document.body.classList.remove("pt-practicing");
    ptPracticeBtn.classList.remove("is-active");
    ptPracticeBtn.textContent = "▶ Practicar";
    ptFeedbackEl.textContent = "";
    ptPressedInCurrent = new Set();
    // Neteja hints del teclat
    document.querySelectorAll(".pt-key.pt-key-hint").forEach(k => k.classList.remove("pt-key-hint"));
  }

  function ptSetClef(staffIdx) {
    ptActiveStaff = staffIdx;
    ptClefBtns.forEach(b => {
      b.classList.toggle("is-active", parseInt(b.dataset.staff, 10) === staffIdx);
    });
    if (ptPracticeOn) {
      try { ptOsmd.cursor.reset(); } catch (e) {}
      ptRefreshTrack();
      ptDisplayCurrent();
    }
  }

  // Clic a una tecla del piano (12 notes: 7 naturals + 5 accidentals).
  function ptHandleKey(semitone, btn) {
    if (!ptPracticeOn) return;
    const expected = ptCurrentExpectedSemitones();
    if (expected.size === 0) {
      ptFeedbackEl.textContent = "🎉 Fi de la partitura";
      ptFeedbackEl.className = "feedback correct";
      return;
    }

    if (expected.has(semitone) && !ptPressedInCurrent.has(semitone)) {
      // Nota correcta que no havíem premut encara
      ptPressedInCurrent.add(semitone);
      btn.classList.add("correct-flash");
      setTimeout(() => btn.classList.remove("correct-flash"), 200);

      // Toca el so de la nota real (pitch + octava) que l'usuari ha premut dins
      // de l'acord actual — per reforçar l'aprenentatge auditiu.
      try {
        const ev = ptCurrentEvent();
        if (ev) {
          const note = ev.notes.find(n => n.semitone === semitone) || ev.notes[0];
          if (note && playNote) {
            const stepLow = note.step.toLowerCase();
            playNote(stepLow + "/" + note.octave);
          }
        }
      } catch (e) {}

      if (ptPressedInCurrent.size >= expected.size) {
        // Acord complet → avança + pinta la nova nota actual en blau
        ptTrackIdx++;
        ptPressedInCurrent = new Set();

        if (ptTrackIdx >= ptTrack.length) {
          ptFeedbackEl.textContent = "🎉 Felicitats, partitura completa!";
          ptFeedbackEl.className = "feedback correct";
          playCongratulations && playCongratulations();
          spawnConfetti && spawnConfetti({ count: 120 });
          ptResetAllSVGNoteColors();
          document.querySelectorAll(".pt-key.pt-key-hint").forEach(k => k.classList.remove("pt-key-hint"));
        } else {
          ptDisplayCurrent();
          ptHighlightCurrentNote(PT_BLUE);
        }
      } else {
        // Falten notes per completar l'acord — actualitza el hint
        const stillNeeded = Array.from(expected).filter(s => !ptPressedInCurrent.has(s));
        ptFeedbackEl.textContent = "✔ Falta: " + stillNeeded.map(ptSemitoneToName).join(" + ");
        ptFeedbackEl.className = "feedback correct";
        ptHighlightExpectedKeys();
      }
    } else if (expected.has(semitone)) {
      // Ja l'havia premut; ignorem sense marcar error.
      return;
    } else {
      // Tecla errònia → la nota queda marcada vermella PERMANENTMENT amb el
      // nom de la nota correcta en petit a sobre. Així l'usuari pot repassar
      // els errors al final.
      btn.classList.add("wrong-flash");
      playErrorSound && playErrorSound();
      shakeElement && shakeElement(ptContainer);
      const ev = ptCurrentEvent();
      const correctName = ev ? ptFormatEventName(ev) : "?";
      ptFeedbackEl.textContent = "✖ Era " + correctName;
      ptFeedbackEl.className = "feedback wrong";
      setTimeout(() => btn.classList.remove("wrong-flash"), 200);
      // Marca permanent: vermell + nom (primera nota de l'acord, sense octava
      // per estalviar espai al damunt del pentagrama)
      const shortName = ev && ev.notes[0]
        ? (PT_CA_NAMES_SHORT[ev.notes[0].step] || "?") +
          (ev.notes[0].alter === 1 ? "♯" : ev.notes[0].alter === -1 ? "♭" : "")
        : "?";
      ptMarkCurrentAsFailed(shortName);
    }
  }

  function ptBindReadControls() {
    if (!ptPracticeBtn || ptPracticeBtn.dataset.bound === "1") return;
    ptPracticeBtn.dataset.bound = "1";

    ptPracticeBtn.addEventListener("click", () => {
      if (ptPracticeOn) ptExitPractice();
      else ptEnterPractice();
    });
    ptClefBtns.forEach(b => {
      b.addEventListener("click", () => ptSetClef(parseInt(b.dataset.staff, 10)));
    });
    ptPianoKeys.forEach(b => {
      b.addEventListener("click", () => ptHandleKey(parseInt(b.dataset.st, 10), b));
    });
  }

  async function ptEnterScreen() {
    if (!ptInitialized) {
      ptInitialized = true;
      const catalog = await ptLoadCatalog();
      ptPopulateSelect(catalog);
      ptSelect.addEventListener("change", () => {
        if (ptPracticeOn) ptExitPractice(); // surto del mode lectura en canviar partitura
        const id = ptSelect.value;
        const item = (ptCatalog || []).find(p => p.id === id);
        if (item) ptRenderPartitura(item);
      });
      ptBindAdjustPanel();
      ptBindReadControls();
    }
    const catalog = ptCatalog || [];
    if (!catalog.length) {
      ptInfoEl.textContent = "Encara no hi ha partitures disponibles.";
      return;
    }
    const id = ptSelect.value || catalog[0].id;
    if (id !== ptLastLoadedId) {
      const item = catalog.find(p => p.id === id);
      if (item) await ptRenderPartitura(item);
    }
  }

  // ---------- NAVEGACIÓ PESTANYES ----------
  const tabs    = document.querySelectorAll(".tab");
  const screens = document.querySelectorAll(".screen");

  function switchScreen(screenId) {
    // Si sortim de Partitures mentre practiquem, aturem el mode (amaga el piano,
    // treu el padding-bottom del body, etc.)
    if (ptPracticeOn && screenId !== "partitures") {
      ptExitPractice();
    }
    tabs.forEach(t => t.classList.toggle("active", t.dataset.screen === screenId));
    screens.forEach(s => s.classList.toggle("active", s.id === "screen-" + screenId));
    if (screenId === "reference")   renderReference();
    if (screenId === "train") {
      if (sequence.length === 0) startRound();
      else render();
    }
    if (screenId === "sightread") rlEnterScreen();
    if (screenId === "speed" && !spRunning) {
      spShowOverlay(spOvStart);
      spFeedbackEl.textContent = "";
      spFeedbackEl.className = "feedback";
    }
    if (screenId === "hunt") huEnterScreen();
    if (screenId === "partitures") ptEnterScreen();
  }

  tabs.forEach(tab => {
    tab.addEventListener("click", () => switchScreen(tab.dataset.screen));
  });

  renderReference();

  // ---------- CUSTOM DROPDOWN (substitueix el picker natiu mòbil) ----------
  // Manté el <select> original (oculta però accessible per codi existent via id/value/
  // addEventListener("change") i MutationObserver detecta canvis dinàmics a <option>).
  // Mostra un popover inline amb fons cream #F6EFE0 en comptes del native full-screen picker.
  function initCustomSelects() {
    const selects = Array.from(document.querySelectorAll("select"));
    selects.forEach(sel => {
      if (sel.dataset.xselInit === "1") return;
      sel.dataset.xselInit = "1";

      const wrap = document.createElement("div");
      wrap.className = "xsel";

      const trigger = document.createElement("button");
      trigger.type = "button";
      trigger.className = "xsel-trigger";
      trigger.setAttribute("aria-haspopup", "listbox");
      trigger.setAttribute("aria-expanded", "false");

      const valueSpan = document.createElement("span");
      valueSpan.className = "xsel-value";

      const chev = document.createElement("span");
      chev.className = "xsel-chevron";
      chev.setAttribute("aria-hidden", "true");

      trigger.appendChild(valueSpan);
      trigger.appendChild(chev);

      const pop = document.createElement("div");
      pop.className = "xsel-popover";
      pop.setAttribute("role", "listbox");
      pop.hidden = true;

      function refreshLabel() {
        const opt = sel.options[sel.selectedIndex];
        valueSpan.textContent = opt ? opt.textContent : "";
      }
      function refreshOptions() {
        pop.innerHTML = "";
        Array.from(sel.options).forEach(o => {
          const div = document.createElement("div");
          div.className = "xsel-option";
          div.dataset.value = o.value;
          div.textContent = o.textContent;
          div.setAttribute("role", "option");
          if (o.selected) div.setAttribute("aria-selected", "true");
          if (o.disabled) div.classList.add("is-disabled");
          div.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (o.disabled) return;
            sel.value = o.value;
            sel.dispatchEvent(new Event("change", { bubbles: true }));
            refreshLabel();
            refreshOptions();
            closeAll();
          });
          pop.appendChild(div);
        });
      }
      function positionPop() {
        // Si el popover no està en estat obert (per ex. closeAll l'ha tancat),
        // no fem res — evita que scroll/resize "ressuscitin" un popover orfe.
        if (!wrap.classList.contains("xsel-open")) return;
        // Posicionem el popover fix (en comptes de absolute) perquè no quedi
        // tallat per cap parent amb overflow:hidden (pentagrama, controls, etc.)
        const tr = trigger.getBoundingClientRect();
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const margin = 6;
        const gap = 6;
        // Amplada: mínim com el trigger, màxim 92vw o 360px
        const triggerW = tr.width;
        pop.style.minWidth = triggerW + "px";
        // Obrir per mesurar alçada real
        pop.hidden = false;
        pop.style.left = "-9999px";
        pop.style.top = "-9999px";
        pop.style.maxHeight = Math.min(Math.floor(vh * 0.6), 420) + "px";
        const popRect = pop.getBoundingClientRect();
        const popH = popRect.height;
        const popW = Math.max(triggerW, popRect.width);
        // Decidir amunt o avall
        const spaceBelow = vh - tr.bottom - margin;
        const spaceAbove = tr.top - margin;
        const dropUp = spaceBelow < popH && spaceAbove > spaceBelow;
        let top = dropUp ? (tr.top - popH - gap) : (tr.bottom + gap);
        // Clamp vertical
        top = Math.max(margin, Math.min(top, vh - popH - margin));
        // Alinear a l'esquerra del trigger, ajustant si s'escapa
        let left = tr.left;
        if (left + popW > vw - margin) left = vw - popW - margin;
        if (left < margin) left = margin;
        pop.style.top = top + "px";
        pop.style.left = left + "px";
        wrap.classList.toggle("xsel-drop-up", dropUp);
      }

      function openPop() {
        closeAll();
        trigger.setAttribute("aria-expanded", "true");
        wrap.classList.add("xsel-open");
        positionPop();
        // Reposicionar en resize/scroll mentre és obert
        window.addEventListener("resize", positionPop, { passive: true });
        window.addEventListener("scroll", positionPop, { passive: true, capture: true });
      }
      function closePop() {
        pop.hidden = true;
        trigger.setAttribute("aria-expanded", "false");
        wrap.classList.remove("xsel-open", "xsel-drop-up");
        window.removeEventListener("resize", positionPop, { passive: true });
        window.removeEventListener("scroll", positionPop, { passive: true, capture: true });
      }

      trigger.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (sel.disabled) return;
        if (pop.hidden) openPop();
        else closePop();
      });

      // Si codi extern canvia el valor del <select>, refresquem UI
      sel.addEventListener("change", () => { refreshLabel(); refreshOptions(); });
      // Canvis a opcions (ex: song-select populat dinàmicament)
      const mo = new MutationObserver(() => { refreshLabel(); refreshOptions(); });
      mo.observe(sel, { childList: true, subtree: true });
      // Canvis a l'atribut disabled → reflectir-ho al trigger
      const mo2 = new MutationObserver(() => {
        trigger.disabled = sel.disabled;
      });
      mo2.observe(sel, { attributes: true, attributeFilter: ["disabled"] });

      // Inserim al DOM: wrap agafa el lloc del select, el select queda ocult dins del wrap.
      // IMPORTANT: el popover es penja directament al <body>, NO dins del wrap, perquè
      // ancestres com .screen.active > .controls tenen `transform` (animació gentleRise)
      // que trenca `position:fixed` (el converteix en relatiu a aquell ancestre).
      const parent = sel.parentNode;
      parent.insertBefore(wrap, sel);
      wrap.appendChild(trigger);
      wrap.appendChild(sel);
      document.body.appendChild(pop);
      sel.setAttribute("aria-hidden", "true");
      sel.tabIndex = -1;

      refreshLabel();
      refreshOptions();
    });

    function closeAll() {
      document.querySelectorAll(".xsel-popover").forEach(p => p.hidden = true);
      document.querySelectorAll(".xsel-trigger").forEach(t => t.setAttribute("aria-expanded", "false"));
      document.querySelectorAll(".xsel").forEach(w => w.classList.remove("xsel-open", "xsel-drop-up"));
    }

    if (!window.__xselGlobalsWired) {
      window.__xselGlobalsWired = true;
      document.addEventListener("click", (e) => {
        // Ignorem clicks dins d'un trigger o d'un popover (el popover ara viu al <body>)
        if (e.target.closest(".xsel")) return;
        if (e.target.closest(".xsel-popover")) return;
        closeAll();
      });
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeAll();
      });
    }
  }

  initCustomSelects();
})();
