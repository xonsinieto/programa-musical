(function () {
  const VF = Vex.Flow;

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
      // Una octava des del Do fins al Do següent (més senzill per començar)
      treble: ["c/4","d/4","e/4","f/4","g/4","a/4","b/4","c/5"],
      bass:   ["c/3","d/3","e/3","f/3","g/3","a/3","b/3","c/4"]
    },
    2: {
      treble: ["c/4","d/4","e/4","f/4","g/4","a/4","b/4","c/5","d/5","e/5","f/5","g/5","a/5"],
      bass:   ["e/2","f/2","g/2","a/2","b/2","c/3","d/3","e/3","f/3","g/3","a/3","b/3","c/4"]
    },
    3: null // serà RANGES complet
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

  const profileExportBtn = document.getElementById("profile-export-btn");
  const profileImportBtn = document.getElementById("profile-import-btn");

  profileExportBtn.addEventListener("click", () => {
    const name = currentProfile();
    if (name === "Convidat") {
      alert("El perfil 'Convidat' no es pot exportar. Crea un perfil amb nom primer (botó +).");
      return;
    }
    const all = loadAllStats();
    const payload = { v: 1, name, stats: all[name] || {} };
    const code = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
    prompt(
      `Codi del perfil "${name}". Copia'l i enganxa'l a l'altre dispositiu (botó 📥 Importar):`,
      code
    );
  });

  profileImportBtn.addEventListener("click", () => {
    const code = prompt("Enganxa el codi del perfil que vols importar:");
    if (!code) return;
    try {
      const payload = JSON.parse(decodeURIComponent(escape(atob(code.trim()))));
      if (!payload || !payload.name || typeof payload.stats !== "object") {
        throw new Error("Format invàlid");
      }
      const p = loadProfiles();
      if (!p.list.includes(payload.name)) p.list.push(payload.name);
      p.current = payload.name;
      saveProfiles(p);
      const all = loadAllStats();
      all[payload.name] = payload.stats;
      saveAllStats(all);
      refreshProfileUI();
      alert(`Perfil "${payload.name}" importat correctament.`);
    } catch (e) {
      alert("Codi invàlid. Assegura't d'enganxar-lo sencer.");
    }
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
      "c/4","d/4","e/4"
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
  const noteButtons    = document.querySelectorAll("#screen-train .note-btn");

  let sequence    = [];   // [{ clef, note, status: "pending"|"correct"|"wrong" }]
  let currentStep = 0;
  let answered    = false;
  let correct     = 0;
  let wrong       = 0;
  let roundStartMs  = 0;
  let roundEndedMs  = 0;
  let roundTimerRAF = null;
  let roundConfigKey = "";

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
    const trebleNotes = sequence.map((step) => {
      const d = step.dur || "q";
      return step.clef === "treble"
        ? new VF.StaveNote({ clef: "treble", keys: [step.note], duration: d })
        : new VF.StaveNote({ clef: "treble", keys: ["b/4"],      duration: d + "r" });
    });
    const bassNotes = sequence.map((step) => {
      const d = step.dur || "q";
      return step.clef === "bass"
        ? new VF.StaveNote({ clef: "bass", keys: [step.note], duration: d })
        : new VF.StaveNote({ clef: "bass", keys: ["d/3"],      duration: d + "r" });
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
    noteButtons.forEach(b => b.classList.remove("correct-flash","wrong-flash"));
    if (currentStep >= sequence.length) {
      const elapsed = endRoundTimer();
      let message = "Seqüència completada!";
      if (elapsed > 0 && sequence.length > 1) {
        const key = currentConfigKey();
        const best = getBestTime(key);
        const diff = best ? elapsed - best : null;
        if (!best || elapsed < best - 0.05) {
          // Nou rècord
          setBestTime(key, elapsed);
          message = `🎉 ${formatSec(elapsed)} — Bé! Estàs millorant!`;
          playCongratulations();
        } else if (diff !== null && Math.abs(diff) <= 0.1) {
          // Empat (dins 0.1s)
          message = `🎉 ${formatSec(elapsed)} — Empat amb el millor!`;
          playCongratulations();
        } else if (diff !== null && diff <= 3) {
          // Dins de 3 segons del millor → encoratjament
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

  function handleAnswer(answerCa, btn) {
    if (answered || currentStep >= sequence.length) return;
    answered = true;

    // Primer click → arrenca cronòmetre
    if (!roundStartMs && sequence.length > 1) startRoundTimer();

    const step          = sequence[currentStep];
    const correctLetter = noteLetter(step.note);
    const correctCa     = NOTE_NAMES_CA[correctLetter];

    if (answerCa === correctCa) {
      correct++;
      step.status = "correct";
      feedbackEl.textContent = "Correcte!";
      feedbackEl.className   = "feedback correct";
      btn.classList.add("correct-flash");
      playNote(step.note);
      recordTrainAnswer(step.clef, step.note, true);
      render();
      setTimeout(advance, 600);
    } else {
      wrong++;
      step.status = "wrong";
      feedbackEl.textContent = `Era ${correctCa.toUpperCase()}`;
      feedbackEl.className   = "feedback wrong";
      btn.classList.add("wrong-flash");
      playErrorSound();
      recordTrainAnswer(step.clef, step.note, false);
      render();
      setTimeout(advance, 1200);
    }
    updateStats();
  }

  function startRound() {
    buildSequence();
    answered = false;
    feedbackEl.textContent = "";
    feedbackEl.className   = "feedback";
    noteButtons.forEach(b => b.classList.remove("correct-flash","wrong-flash"));
    roundStartMs = 0;
    roundEndedMs = 0;
    if (roundTimerRAF) cancelAnimationFrame(roundTimerRAF);
    runTimeEl.textContent = "—";
    refreshBestTimeUI();
    render();
  }

  noteButtons.forEach(btn => {
    btn.addEventListener("click", () => handleAnswer(btn.dataset.note, btn));
  });

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
              const btn = document.querySelector('#screen-train .note-btn[data-note="' + bestNote + '"]');
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
    if (document.getElementById("screen-flashcards").classList.contains("active") && fcCurrent) {
      renderSingleOnGrandStaff(fcContainer, fcCurrent.clef, fcCurrent.note, "#3498db");
    }
    if (document.getElementById("screen-speed").classList.contains("active") && spRunning) {
      spBuildStage();
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
      let fill = "#ffffff";
      if (isMain) fill = COLOR_MAIN;
      else if (isSec) fill = COLOR_SEC;
      rect.setAttribute("fill", fill);
      rect.setAttribute("stroke", "#333");
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

  // ---------- FLASHCARDS ----------
  const fcClefSelect  = document.getElementById("fc-clef-select");
  const fcLevelSelect = document.getElementById("fc-level-select");
  const fcResetBtn    = document.getElementById("fc-reset-btn");
  const fcContainer  = document.getElementById("fc-staff-container");
  const fcAnswerEl   = document.getElementById("fc-answer");
  const fcRevealBtn  = document.getElementById("fc-reveal-btn");
  const fcKnewBtn    = document.getElementById("fc-knew-btn");
  const fcDidntBtn   = document.getElementById("fc-didnt-btn");
  const fcSeenEl     = document.getElementById("fc-seen");
  const fcKnewEl     = document.getElementById("fc-knew");
  const fcRateEl     = document.getElementById("fc-rate");

  let fcCurrent = null;
  let fcRevealed = false;
  let fcSeen = 0;
  let fcKnew = 0;

  function fcPickClef() {
    const sel = fcClefSelect.value;
    if (sel === "both") return Math.random() < 0.5 ? "treble" : "bass";
    return sel;
  }

  function fcNewCard() {
    const clef = fcPickClef();
    const note = pickNoteForLevel(clef, fcLevelSelect.value);
    fcCurrent = { clef, note };
    fcRevealed = false;
    fcAnswerEl.textContent = "";
    fcRevealBtn.disabled = false;
    fcKnewBtn.disabled = true;
    fcDidntBtn.disabled = true;
    renderSingleOnGrandStaff(fcContainer, clef, note, "#3498db");
  }

  function fcReveal() {
    if (!fcCurrent || fcRevealed) return;
    fcRevealed = true;
    const name = NOTE_NAMES_CA[noteLetter(fcCurrent.note)].toUpperCase();
    fcAnswerEl.textContent = name;
    fcRevealBtn.disabled = true;
    fcKnewBtn.disabled = false;
    fcDidntBtn.disabled = false;
    playNote(fcCurrent.note);
  }

  function fcMark(knew) {
    if (!fcRevealed) return;
    fcSeen++;
    if (knew) fcKnew++;
    fcSeenEl.textContent = fcSeen;
    fcKnewEl.textContent = fcKnew;
    fcRateEl.textContent = fcSeen === 0 ? "—" : Math.round((fcKnew / fcSeen) * 100) + "%";
    fcNewCard();
  }

  function fcReset() {
    fcSeen = 0; fcKnew = 0;
    fcSeenEl.textContent = 0;
    fcKnewEl.textContent = 0;
    fcRateEl.textContent = "—";
    fcNewCard();
  }

  fcRevealBtn.addEventListener("click", fcReveal);
  fcKnewBtn.addEventListener("click", () => fcMark(true));
  fcDidntBtn.addEventListener("click", () => fcMark(false));
  fcResetBtn.addEventListener("click", fcReset);
  fcClefSelect.addEventListener("change", fcNewCard);
  fcLevelSelect.addEventListener("change", fcNewCard);

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
  const spNoteButtons  = document.querySelectorAll(".sp-note-btn");

  const SP_MAX_SPEED = 10;
  const SP_STREAK_TO_ADVANCE = 10;

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
    return Math.max(500, 200000 / spPxPerSec());
  }

  function spUpdateStats() {
    spCorrectEl.textContent    = spCorrect;
    spWrongEl.textContent      = spWrong;
    spSpeedLevelEl.textContent = spCurrentSpeed;
    spStreakEl.textContent     = spStreak;
    spSpeedSelect.value        = String(spCurrentSpeed);
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
    // Negra: cap ple + pal. Pal amunt si la nota és sota la línia central, avall altrament.
    const midLine = clef === "treble" ? spTrebleCenterY : spBassCenterY;
    const stemUp = y >= midLine;

    const wrap = document.createElementNS(SVG_NS, "g");
    wrap.setAttribute("class", "sp-note-shape");

    const head = document.createElementNS(SVG_NS, "ellipse");
    head.setAttribute("cx", 0);
    head.setAttribute("cy", 0);
    head.setAttribute("rx", 6);
    head.setAttribute("ry", 4.5);
    head.setAttribute("fill", "#2c3e50");
    head.setAttribute("stroke", "none");
    head.setAttribute("transform", "rotate(-18)");
    wrap.appendChild(head);

    const stem = document.createElementNS(SVG_NS, "line");
    const stemX = stemUp ? 5.5 : -5.5;
    const stemY1 = stemUp ? -1 : 1;
    const stemY2 = stemUp ? -34 : 34;
    stem.setAttribute("x1", stemX);
    stem.setAttribute("y1", stemY1);
    stem.setAttribute("x2", stemX);
    stem.setAttribute("y2", stemY2);
    stem.setAttribute("stroke", "#2c3e50");
    stem.setAttribute("stroke-width", "1.8");
    stem.setAttribute("stroke-linecap", "square");
    wrap.appendChild(stem);

    parent.appendChild(wrap);
  }

  function spColorNote(g, color) {
    const shape = g.querySelector(".sp-note-shape");
    if (!shape) return;
    shape.querySelectorAll("ellipse").forEach(el => {
      el.setAttribute("fill", color);
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
    spDrawLedgers(g, SVG_NS, y, clef);
    spDrawQuarterNote(g, SVG_NS, y, clef);
    g.setAttribute("transform", `translate(${spSpawnX}, ${y})`);
    spNoteGroup.appendChild(g);
    spActive.push({ clef, note, x: spSpawnX, y, el: g, state: "pending" });
  }

  function spGameLoop(ts) {
    if (!spRunning || spState !== "playing") return;
    if (!spLastFrame) spLastFrame = ts;
    const dt = ts - spLastFrame;
    spLastFrame = ts;

    const dx = spPxPerMs() * dt;

    for (let i = spActive.length - 1; i >= 0; i--) {
      const n = spActive[i];
      n.x -= dx;
      n.el.setAttribute("transform", `translate(${n.x}, ${n.y})`);

      if (n.state === "pending" && n.x < spHitLineX - 20) {
        // Nota perduda → fail
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

  function spHandleAnswer(answerCa, btn) {
    if (spState !== "playing") return;
    let target = null;
    for (const n of spActive) {
      if (n.state !== "pending") continue;
      if (!target || n.x < target.x) target = n;
    }
    if (!target) return;
    const correctCa = NOTE_NAMES_CA[noteLetter(target.note)];

    if (answerCa === correctCa) {
      target.state = "hit";
      spCorrect++;
      spStreak++;
      btn.classList.add("correct-flash");
      playNote(target.note);
      spColorNote(target.el, "#27ae60");
      const el = target.el;
      setTimeout(() => { if (el.parentNode) el.parentNode.removeChild(el); }, 160);
      const idx = spActive.indexOf(target);
      if (idx >= 0) spActive.splice(idx, 1);
      spUpdateStats();
      setTimeout(() => {
        spNoteButtons.forEach(b => b.classList.remove("correct-flash"));
      }, 200);
      if (spStreak >= SP_STREAK_TO_ADVANCE) {
        spLevelUp();
      }
    } else {
      spWrong++;
      btn.classList.add("wrong-flash");
      spUpdateStats();
      spOnFail(target);
    }
  }

  function spOnFail(failedNote) {
    if (spState !== "playing") return;
    spState = "paused";
    if (spRAF) cancelAnimationFrame(spRAF);
    playErrorSound();
    const name = NOTE_NAMES_CA[noteLetter(failedNote.note)].toUpperCase();

    // Pinta la nota fallada de vermell i afegeix etiqueta SOBRE la nota
    spColorNote(failedNote.el, "#e74c3c");
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
    spRetryBar.classList.remove("hidden");
    setTimeout(() => {
      spNoteButtons.forEach(b => b.classList.remove("correct-flash","wrong-flash"));
    }, 200);
  }

  function spLevelUp() {
    if (spCurrentSpeed >= SP_MAX_SPEED) {
      spWin();
      return;
    }
    const passed = spCurrentSpeed;
    spCurrentSpeed++;
    spStreak = 0;
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

  function spStart() {
    spRunning = true;
    spCurrentSpeed = 1;
    spStreak = 0;
    spCorrect = 0;
    spWrong = 0;
    spUpdateStats();
    spEnterPlay();
  }

  function spRetry() {
    spStreak = 0;
    spUpdateStats();
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
      spStreak = 0;
      spUpdateStats();
    }
  });
  spNoteButtons.forEach(btn => {
    btn.addEventListener("click", () => spHandleAnswer(btn.dataset.note, btn));
  });

  // ---------- NAVEGACIÓ PESTANYES ----------
  const tabs    = document.querySelectorAll(".tab");
  const screens = document.querySelectorAll(".screen");

  function switchScreen(screenId) {
    tabs.forEach(t => t.classList.toggle("active", t.dataset.screen === screenId));
    screens.forEach(s => s.classList.toggle("active", s.id === "screen-" + screenId));
    if (screenId === "reference")   renderReference();
    if (screenId === "train") {
      if (sequence.length === 0) startRound();
      else render();
    }
    if (screenId === "flashcards" && !fcCurrent) fcNewCard();
    else if (screenId === "flashcards") renderSingleOnGrandStaff(fcContainer, fcCurrent.clef, fcCurrent.note, "#3498db");
    if (screenId === "speed" && !spRunning) {
      spShowOverlay(spOvStart);
      spFeedbackEl.textContent = "";
      spFeedbackEl.className = "feedback";
    }
  }

  tabs.forEach(tab => {
    tab.addEventListener("click", () => switchScreen(tab.dataset.screen));
  });

  renderReference();
})();
