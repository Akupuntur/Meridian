# PRD — Jīng Luò (TCM Meridian Pronunciation)

## Original problem statement
Clean, elegant, mobile-first educational web app for learning the pronunciation
of the 14 TCM meridians and their acupuncture point names. Homepage shows 14
clickable meridian cards. Detail page shows all points with Hanzi + Pinyin and
a Mandarin audio button (Web Speech API zh-CN, later replaceable with MP3s).
No auth, no DB, no chatbot, no payments. Bahasa Indonesia labels, jade/sage +
ivory theme.

## Architecture
- Static frontend (React 19 + React Router 7 + Tailwind).
- Backend template left untouched (only /api hello world). No DB writes.
- Data in `src/data/meridians.js` — decoupled from UI.
- Audio abstraction in `src/lib/audio.js` — Web Speech API today, checks for a
  `point.audioUrl` field so pre-recorded MP3s can drop in later with no UI
  changes.

## User personas
- TCM students memorising meridian & point pronunciation on mobile.

## Core requirements (static)
- 14 meridians (LU, LI, ST, SP, HT, SI, BL, KI, PC, SJ, GB, LV, REN, DU).
- Standard WHO nomenclature; no invented names; no per-point translations.
- Mandarin TTS with graceful "audio not available" toast in Bahasa Indonesia.
- Mobile-first, responsive, accessible.

## Implemented (2026-02)
- Homepage with hero + 14 meridian card grid (`HomePage.jsx`).
- Meridian detail route `/meridian/:code` (`MeridianDetailPage.jsx`) with
  redirect to `/` for unknown codes.
- `MeridianCard`, `PointCard`, `AudioButton`, `SiteHeader` components.
- Full dataset: 361 standard acupuncture points across 14 meridians
  (12 primary meridians + Ren Mai 24 + Du Mai 28).
- **LOCKED master audio configuration (approved 2026-02):**
  Browser Web Speech API (native zh-CN voice), rate `0.55`, whole Hanzi word
  spoken as ONE continuous utterance (no syllable splitting, no inter-syllable
  pauses, no `<break>` tags), non-Han characters filtered out, strict Mandarin
  voice picker with friendly fallback toast if no zh-CN voice is installed.
  Applies uniformly to every point across all 14 meridians. See lock header
  in `frontend/src/lib/audio.js`. Do not modify without explicit approval.
- Design tokens (jade/sage/ivory) + custom fonts (Cormorant Garamond, Outfit,
  Noto Serif SC, JetBrains Mono).
- Testing agent iteration 1: 100% pass, no failures.
- Meridian-name audio button on detail page (`MeridianDetailPage.jsx`)
  reusing the existing `AudioButton` + locked `audio.js` config, so tapping
  it speaks the full Meridian Chinese name (e.g. 手太阴肺经) with the same
  rate 0.55 / zh-CN / primed-voice first-tap behaviour as the point buttons.
  Existing point audio and layout untouched. (2026-02)

## Backlog (P1)
- Replace TTS with high-quality pre-recorded MP3s (audioUrl field is ready).
- Search / filter points by code or Pinyin.
- "Favorite" points and quick-review list (localStorage only).
- Simple flashcard / quiz mode.

## Backlog (P2)
- Print-friendly meridian cheat sheet.
- Offline PWA install.
