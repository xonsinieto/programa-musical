# 🎵 Entrenador de Lectura de Notes

App web PWA per aprendre a llegir notes musicals al pentagrama (clau de Sol i clau de Fa), amb mecàniques de memòria, reflex i velocitat.

**Desplegada a:** [https://xonsinieto.github.io/programa-musical/](https://xonsinieto.github.io/programa-musical/) (GitHub Pages, auto-deploy via push a `main`)

**Autor:** Alfons Vigas

---

## 🎮 Pantalles

### 📖 Referència
Gran chart amb totes les notes del piano distribuïdes sobre els dos pentagrames, amb etiquetes `DO RE MI FA SOL LA SI` al damunt. Pensada per consultar ràpidament la posició d'una nota. Cada nota és clicable → obre un modal amb:
- Pentagrama gran amb la nota aïllada
- Piano interactiu que indica la tecla corresponent
- So de la nota en prémer-la

### 🎼 Lectura
Exercicis d'identificació de notes. Tria clau (Sol / Fa / les dues), nivell (1-3) i mode:
- **Una nota** — practica una nota fixa
- **Aleatori** — seqüència il·limitada de notes del rang
- **Les més fallades** — el sistema et pregunta les notes que fallàs més
- **Cançó** — tocar una melodia preestablerta

Respostes via botons `Do/Re/Mi/Fa/Sol/La/Si` o via micròfon/piano (🎹 So — detecció de pitch en viu).

Estadístiques per nota (encerts, fallades, precisió) persistides per perfil.

### ⚡ Velocitat
Mode Guitar-Hero: les notes escombren d'esquerra a dreta cap a una línia d'impacte. Has d'apretar el botó de la nota correcta abans que passi la línia. 10 velocitats progressives (necessites 30 encerts seguits per pujar). Rècord per cada clau × nivell × velocitat.

### 🎯 Caça
Joc de memòria + reflex. Tries una nota-diana (ex: DO) i:
1. **Fase memoritzar** (sense temps): el pentagrama mostra totes les posicions on apareix la diana al rang del nivell triat. Les memoritzes.
2. **Fase joc** (prems Començar): vénen notes aleatòries escombrant. Cliques sobre les que són diana; si en cliques una d'errònia o deixes passar una diana, fi de partida.

Progressió idèntica a Velocitat: 30 clicks bons → puja velocitat (1→10). Rècord per clau × nivell × diana × velocitat.

---

## 🛠️ Stack tècnic

- **HTML + CSS + JS vanilla** (sense build step, sense framework)
- **[VexFlow 4.2.3](https://github.com/0xfe/vexflow)** — render de pentagrames SVG
- **[Tone.js 14.8.49](https://tonejs.github.io/)** + samples Salamander Grand Piano — reproducció d'àudio
- **Web Animations API** — animació de notes mòbils (Velocitat + Caça) al compositor GPU per màxima fluïdesa
- **Service Worker** (network-first, auto-update amb `controllerchange`) — cachegem l'app per funcionar offline i recarreguem automàticament al pujar nova versió
- **PWA** instal·lable amb manifest + icones 192/512 PNG + SVG. FAB flotant d'install amb fallback d'instruccions específiques per iOS/Android.

---

## 🎨 Disseny — "Aurora Neo-Studio"

Estètica cosmic dark amb accents neó cian + magenta + or:

| Variable CSS | Valor | Ús |
|---|---|---|
| `--bg` | `#05070F` | Fons cosmic base |
| `--primary` | `#00F0FF` | Cian electric |
| `--accent` | `#FF10F0` | Magenta neó |
| `--gold` | `#FFB800` | Or d'accent |
| `--success` | `#00FF94` | Verd menta |
| `--error` | `#FF3366` | Vermell-rosa |
| `--ink` | `#E8ECF1` | Text principal |

**Tipografia:** Unbounded (display), Outfit (body), JetBrains Mono (accents/nombres).

**Regla absoluta:** els **pentagrames sempre sobre paper cream `#F6EFE0`** (amb textura noise SVG) — el cervell associa la lectura musical amb fons paper. Cap fons blanc pur a l'app.

**Efectes globals:**
- Aurora animada (`body::before` amb radial-gradients + filter blur + animació `auroraShift`)
- Estrelles titil·lants (`body::after`)
- Parallax cursor (desktop)
- Cursor glow
- Noise grain overlay global subtil
- Splash d'entrada amb aurora cònica rotant, logo de nota amb gradient i title shine animat (visible ~2.8s a primer load)
- Ripple universal a botons
- Bursts de partícules Guitar-Hero a encerts
- Shake + flash rojos als errors
- Confetti a records i level-ups
- Dropdowns custom `.xsel` amb popover inline cream (substitueix picker natiu mòbil)

---

## 📱 Optimització mòbil

- Viewport meta + `user-scalable=no`
- Splash + theme-color `#05070F` (no flash blanc a l'obrir la PWA)
- Controls `.controls` amb **flex-wrap** (2 files si no caben), labels compactes (0.52rem) + valors de select truncats amb ellipsis
- Pentagrames a 300px d'alçada amb transform scale 0.62 → grand staff sencer visible (treble + clau de Fa + notes amb línies addicionals)
- Caça amb pentagrama 260px + memo-bar i retry-bar FORA del contenidor (no tapa cap nota)
- Marquee oculta al mòbil
- Header h1 clamp 0.98-1.5rem
- Tabs amb scroll horitzontal si cal
- Note buttons 34px, stats 0.5rem

---

## 👤 Sistema de perfils

- Múltiples perfils (local, localStorage)
- Un perfil "Convidat" per defecte (estadístiques netejades en cada sessió)
- Botó `+` per crear perfils nomenats (estadístiques persistides)
- Selector dropdown a la barra superior

---

## 📂 Estructura

```
index.html        HTML principal + splash inline + registre SW + install FAB
style.css         Estètica Aurora Neo-Studio + responsive + animacions
app.js            Tota la lògica (IIFE) — render, state, àudio, jocs
manifest.json     PWA manifest (fons cosmic dark)
sw.js             Service Worker (network-first, cache auto-updated)
icon.svg          Icona vectorial
icon-192.png      Icona PNG 192px (PWA install)
icon-512.png      Icona PNG 512px (PWA install)
```

Tot el JS en un sol fitxer, sense build. Desenvolupament: editar → `git push` → GitHub Pages desplega automàticament.

---

## 🔄 Cache-busting

El Service Worker fa `network-first` amb `cache: "no-cache"` → sempre revalida amb servidor. Quan hi ha un nou SW actiu (perquè `CACHE` ha canviat), es recarrega la pàgina automàticament via `controllerchange`. Cada canvi important al codi incrementa la versió `CACHE` a `sw.js` (`lectura-notes-vNN-topic`).

---

## 🚀 Desenvolupament

```bash
# Clonar
git clone https://github.com/xonsinieto/programa-musical.git

# Editar (sense build step)
# — modificar index.html / style.css / app.js
# — bump de CACHE a sw.js si cal forçar recarrega client

# Desplegar
git push origin main   # GitHub Pages auto-deploya
```
