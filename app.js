(function () {
  const VF = Vex.Flow;

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
  const countSelect    = document.getElementById("count-select");
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
    const count = mode === "single" ? 1 : parseInt(countSelect.value, 10);
    sequence    = [];
    const level = levelSelect.value;
    for (let i = 0; i < count; i++) {
      const c = pickClef();
      sequence.push({ clef: c, note: pickNoteForLevel(c, level), status: "pending" });
    }
    currentStep = 0;
  }

  function render() {
    staffContainer.innerHTML = "";

    const isMobile       = window.innerWidth < 600;
    const mult           = isMobile ? 1.82 : 1;
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

    const duration = "q";     // quarter notes
    const restDur  = "qr";

    const trebleNotes = sequence.map((step) =>
      step.clef === "treble"
        ? new VF.StaveNote({ clef: "treble", keys: [step.note], duration })
        : new VF.StaveNote({ clef: "treble", keys: ["b/4"],      duration: restDur })
    );
    const bassNotes = sequence.map((step) =>
      step.clef === "bass"
        ? new VF.StaveNote({ clef: "bass", keys: [step.note], duration })
        : new VF.StaveNote({ clef: "bass", keys: ["d/3"],      duration: restDur })
    );

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

    const totalBeats = sequence.length;
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
      feedbackEl.textContent = "Seqüència completada!";
      feedbackEl.className   = "feedback correct";
      setTimeout(startRound, 1400);
    } else {
      feedbackEl.textContent = "";
      feedbackEl.className   = "feedback";
      render();
    }
  }

  function handleAnswer(answerCa, btn) {
    if (answered || currentStep >= sequence.length) return;
    answered = true;

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
      render();
      setTimeout(advance, 600);
    } else {
      wrong++;
      step.status = "wrong";
      feedbackEl.textContent = `Era ${correctCa.toUpperCase()}`;
      feedbackEl.className   = "feedback wrong";
      btn.classList.add("wrong-flash");
      playErrorSound();
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
    render();
  }

  noteButtons.forEach(btn => {
    btn.addEventListener("click", () => handleAnswer(btn.dataset.note, btn));
  });

  newNoteBtn.addEventListener("click", startRound);
  clefSelect.addEventListener("change", startRound);
  levelSelect.addEventListener("change", startRound);
  modeSelect.addEventListener("change", startRound);
  countSelect.addEventListener("change", startRound);

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
      const isMobileLbl = window.innerWidth < 600;
      const fontSize = isMobileLbl
        ? Math.min(22, Math.max(16, noteSpace * 0.55))
        : Math.min(12, Math.max(8, noteSpace * 0.3));
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

      // Zona clicable
      const rect = document.createElementNS(SVG_NS, "rect");
      rect.setAttribute("x", x - 6);
      rect.setAttribute("y", y - 18);
      rect.setAttribute("width", w + 12);
      rect.setAttribute("height", h + 32);
      rect.setAttribute("fill", "transparent");
      rect.setAttribute("stroke", "none");
      rect.style.pointerEvents = "all";
      rect.style.cursor = "pointer";
      rect.addEventListener("click", () => openNoteModal(clef, notes[i]));
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

    const containerWidth = Math.max(400, container.clientWidth);
    const height         = 460;
    const staveWidth     = Math.min(340, containerWidth - 40);
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

    const trebleElements = [new VF.GhostNote({ duration: "w" }), trebleNote];
    const bassElements   = [new VF.GhostNote({ duration: "w" }), bassNote];

    const tv = new VF.Voice({ num_beats: 8, beat_value: 4 }).addTickables(trebleElements);
    const bv = new VF.Voice({ num_beats: 8, beat_value: 4 }).addTickables(bassElements);

    new VF.Formatter()
      .joinVoices([tv, bv])
      .format([tv, bv], Math.max(150, staveWidth - 60));

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
    const mult     = isMobile ? 1.82 : 1;
    const containerWidth = Math.max(400, refStaffContainer.clientWidth) * mult;
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

    const isMobile       = window.innerWidth < 600;
    const mult           = isMobile ? 1.82 : 1;
    const containerWidth = Math.max(400, container.clientWidth) * mult;
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

    const isMobile = window.innerWidth < 600;
    const mult     = isMobile ? 1.82 : 1;
    const width    = Math.max(600, spContainer.clientWidth) * mult;
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
