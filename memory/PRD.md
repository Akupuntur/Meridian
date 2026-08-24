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
- Full dataset: 331 standard acupuncture points across 14 meridians.
- Web Speech API integration with visual playing state (pulse) and Sonner
  toast fallback ("Audio tidak tersedia di perangkat ini").
- Design tokens (jade/sage/ivory) + custom fonts (Cormorant Garamond, Outfit,
  Noto Serif SC, JetBrains Mono).
- Testing agent iteration 1: 100% pass, no failures.

## Backlog (P1)
- Replace TTS with high-quality pre-recorded MP3s (audioUrl field is ready).
- Search / filter points by code or Pinyin.
- "Favorite" points and quick-review list (localStorage only).
- Simple flashcard / quiz mode.

## Backlog (P2)
- Print-friendly meridian cheat sheet.
- Offline PWA install.
