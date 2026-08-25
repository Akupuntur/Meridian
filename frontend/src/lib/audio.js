// Audio system for TCM point pronunciation.
//
// ─── LOCKED MASTER AUDIO CONFIGURATION (approved 2026-02) ───────────────────
// The following behaviour is the approved reference standard for the entire
// project — do NOT change any of these without explicit user approval:
//
//   • Engine    : Browser Web Speech API (native TTS).
//   • Voice     : Best available native Mandarin (zh-CN) voice on the
//                 user's device, selected strictly by pickMandarinVoice().
//                 Cantonese and non-Mandarin voices are rejected.
//   • Rate      : 0.55 (slow, classroom tempo).
//   • Pitch     : 1.0 (unchanged).
//   • Volume    : 1.0 (unchanged).
//   • Delivery  : The whole Hanzi word is spoken as ONE continuous utterance
//                 (e.g. 列缺 → "lièquē"). No syllable splitting, no chained
//                 speak() calls, no inter-syllable timeouts, no <break>s.
//   • Filtering : Only characters matching \p{Script=Han} are voiced. Pinyin,
//                 letters, digits, and punctuation are stripped so the drill
//                 is pure Mandarin.
//   • Fallback  : If no Mandarin voice is available, refuse to speak (no
//                 English/Indonesian fallback) and surface a friendly toast.
//   • MP3 route : Kept as an inert abstraction (resolveAudioUrl). No entries
//                 are wired, so all 361 points always use the TTS path.
//
// This configuration applies uniformly to every acupuncture point across
// all 14 meridians. No per-point overrides.
// ────────────────────────────────────────────────────────────────────────────
//
// Playback priority for each acupuncture point:
//   1. Pre-recorded MP3 (per-point `audioUrl` or entry in `audioSources.js`).
//   2. Web Speech API using a native Mandarin (zh-CN) voice.
//   3. If neither is available -> onError('no-mandarin-voice' | 'speech-not-supported').
//
// The synthesizer speaks ONLY the Hanzi string passed in. It never speaks
// Pinyin, point codes, English, or Indonesian text.

import { resolveAudioSource } from "@/lib/audioSources";
import { applyPronunciation } from "@/lib/pronunciation";

const isBrowser = typeof window !== "undefined";

export const isSpeechSupported = () =>
  isBrowser &&
  "speechSynthesis" in window &&
  typeof window.SpeechSynthesisUtterance === "function";

// ---------------------------------------------------------------------------
// Voice loading + priming
// ---------------------------------------------------------------------------
//
// On mobile browsers (iOS Safari, Chrome Android), `speechSynthesis.getVoices()`
// initially returns [] and only populates asynchronously via `voiceschanged`.
// If the click handler awaits that async load, the browser drops the user-
// gesture context by the time `.speak()` is finally called, and the first
// utterance is queued but never actually vocalized.
//
// Fix: prime and cache the voice list as soon as this module is imported
// (which happens at app load via the frontend bundle). By the time the user
// taps an audio button, `cachedVoices` is already populated and `speakHanzi`
// can call `.speak()` synchronously in the same click event.

let cachedVoices = null;
let primePromise = null;

/**
 * Kick off (or reuse) an asynchronous fetch of the browser's voice list.
 * Once resolved, the voices are cached at module scope so subsequent calls
 * are instantaneous.
 * @returns {Promise<SpeechSynthesisVoice[]>}
 */
export const primeVoices = () => {
  if (!isSpeechSupported()) return Promise.resolve([]);
  if (cachedVoices && cachedVoices.length) return Promise.resolve(cachedVoices);
  if (primePromise) return primePromise;

  primePromise = new Promise((resolve) => {
    const finish = (voices) => {
      window.speechSynthesis.removeEventListener("voiceschanged", onChanged);
      clearInterval(pollId);
      clearTimeout(timeoutId);
      if (voices && voices.length) cachedVoices = voices;
      resolve(cachedVoices || voices || []);
    };

    const initial = window.speechSynthesis.getVoices();
    if (initial && initial.length) {
      cachedVoices = initial;
      resolve(initial);
      return;
    }

    const onChanged = () => {
      const v = window.speechSynthesis.getVoices();
      if (v && v.length) finish(v);
    };
    window.speechSynthesis.addEventListener("voiceschanged", onChanged);

    // Some Safari builds never fire `voiceschanged` after the initial empty
    // read — poll every 100ms as a fallback.
    const pollId = setInterval(() => {
      const v = window.speechSynthesis.getVoices();
      if (v && v.length) finish(v);
    }, 100);

    const timeoutId = setTimeout(
      () => finish(window.speechSynthesis.getVoices() || []),
      3000
    );
  });
  return primePromise;
};

// Start priming as soon as the module is imported (i.e. at app load).
if (isBrowser && isSpeechSupported()) {
  primeVoices();
}

// Alias kept for backwards compatibility with the rest of the module.
const loadVoices = () => primeVoices();

// ---------------------------------------------------------------------------
// Voice selection (strict Mandarin only)
// ---------------------------------------------------------------------------

// Known high-quality Mandarin voice name fragments across platforms.
const PREFERRED_NAME_FRAGMENTS = [
  "Google 普通话",       // Chrome desktop / Android
  "Google Mandarin",
  "Microsoft Xiaoxiao",  // Windows 10+ neural
  "Microsoft Xiaoyi",
  "Microsoft Yunxi",
  "Microsoft Yunyang",
  "Microsoft Yaoyao",    // Windows 8/10
  "Microsoft Huihui",
  "Microsoft Kangkang",
  "Tingting",            // macOS / iOS
  "Ting-Ting",
];

const normLang = (l) => String(l || "").toLowerCase().replace(/_/g, "-");

// Bucket a voice by how close it is to native zh-CN Mandarin.
// Lower score = better. Cantonese (zh-HK, zh-yue) is excluded entirely.
const scoreVoice = (voice) => {
  const lang = normLang(voice.lang);

  // Reject Cantonese and any non-Chinese language outright.
  if (!lang.startsWith("zh")) return null;
  if (lang.startsWith("zh-hk") || lang.startsWith("zh-yue")) return null;

  let bucket;
  if (lang === "zh-cn" || lang.startsWith("zh-cn-")) bucket = 0;
  else if (lang.startsWith("zh-hans")) bucket = 1;
  else if (lang === "zh") bucket = 2;
  else if (lang.startsWith("zh-sg")) bucket = 3; // Singapore Mandarin
  else if (lang.startsWith("zh-tw") || lang.startsWith("zh-hant")) bucket = 4;
  else bucket = 5;

  // Prefer local/offline voices — they load instantly and are usually higher
  // fidelity than remote/network voices.
  const localBonus = voice.localService === false ? 0.5 : 0;

  // Prefer well-known Mandarin voice names.
  const name = String(voice.name || "");
  const nameHit = PREFERRED_NAME_FRAGMENTS.some((frag) => name.includes(frag));
  const nameBonus = nameHit ? -0.25 : 0;

  // Prefer the browser default zh voice when everything else is equal.
  const defaultBonus = voice.default ? -0.1 : 0;

  return bucket + localBonus + nameBonus + defaultBonus;
};

const pickMandarinVoice = (voices) => {
  if (!voices || !voices.length) return null;
  let best = null;
  let bestScore = Infinity;
  for (const v of voices) {
    const s = scoreVoice(v);
    if (s === null) continue;
    if (s < bestScore) {
      bestScore = s;
      best = v;
    }
  }
  return best;
};

export const hasMandarinVoice = async () => {
  if (!isSpeechSupported()) return false;
  const voices = await loadVoices();
  return !!pickMandarinVoice(voices);
};

// ---------------------------------------------------------------------------
// Source resolution (MP3 preferred, TTS fallback)
// ---------------------------------------------------------------------------

/**
 * Resolve the best available audio source for a point.
 * Priority:
 *   1. Explicit `audioUrl` (per-point override, e.g. from data file).
 *   2. Static MP3 mapping in `audioSources.js` (populated as recordings ship).
 *   3. `null` -> caller should use TTS.
 */
export const resolveAudioUrl = ({ audioUrl, meridianCode, pointNum }) => {
  if (audioUrl) return audioUrl;
  return resolveAudioSource(meridianCode, pointNum) || null;
};

// ---------------------------------------------------------------------------
// Playback
// ---------------------------------------------------------------------------

const playAudioFile = (url, { onStart, onEnd, onError }) => {
  const audio = new Audio(url);
  audio.preload = "auto";
  audio.addEventListener("play", () => onStart && onStart());
  audio.addEventListener("ended", () => onEnd && onEnd());
  audio.addEventListener("error", () => {
    onError && onError(new Error("audio-file-error"));
  });
  const playPromise = audio.play();
  if (playPromise && typeof playPromise.catch === "function") {
    playPromise.catch((e) => onError && onError(e));
  }
  return { stop: () => audio.pause() };
};

const speakHanzi = async (hanzi, { onStart, onEnd, onError }) => {
  if (!isSpeechSupported()) {
    onError && onError(new Error("speech-not-supported"));
    return { stop: () => {} };
  }

  // Fast path — use the module-level cached voices (primed at app load) so
  // this whole function stays synchronous within the click event. On mobile
  // browsers this is what preserves the user-gesture context that
  // `speechSynthesis.speak()` requires.
  let voices = cachedVoices;
  if (!voices || !voices.length) {
    // Try one more synchronous read in case voices became available between
    // module load and this click.
    const now = window.speechSynthesis.getVoices();
    if (now && now.length) {
      cachedVoices = now;
      voices = now;
    } else {
      // Truly not ready yet — wait for the priming promise. This path only
      // hits on very cold starts before voiceschanged has fired.
      voices = await loadVoices();
    }
  }

  const voice = pickMandarinVoice(voices);
  if (!voice) {
    // Strict rule: never speak Chinese characters with a non-Mandarin voice.
    onError && onError(new Error("no-mandarin-voice"));
    return { stop: () => {} };
  }

  // Apply the pronunciation-correction dictionary FIRST so any ambiguous
  // TCM characters (e.g. 俞 → 腧 for Shū, 膻 → 但 for Dàn) get swapped for
  // unambiguous homophones before the Han-only filter runs. The upstream
  // data (meridians.js) and the on-screen Hanzi/Pinyin are unaffected —
  // this transformation only shapes what the TTS engine hears.
  const corrected = applyPronunciation(hanzi);

  // Teaching-mode delivery for beginner Indonesian learners:
  //   - Rate 0.55 (~55% of default) so tones are clearly audible.
  //   - The full Chinese word is sent to the engine as ONE utterance so it
  //     is spoken as one continuous phonetic unit (e.g. 列缺 -> "lièquē"),
  //     NOT split into disconnected syllables. Slow speech ≠ pauses.
  //   - Non-CJK characters (letters, digits, punctuation) are filtered out
  //     so the drill remains a pure Mandarin pronunciation drill.
  const HAN_RE = /\p{Script=Han}/u;
  const spoken = Array.from(corrected).filter((ch) => HAN_RE.test(ch)).join("");
  if (!spoken) {
    onError && onError(new Error("no-chinese-chars"));
    return { stop: () => {} };
  }

  // Cancel anything currently speaking so buttons behave predictably.
  window.speechSynthesis.cancel();

  const utter = new window.SpeechSynthesisUtterance(spoken);
  utter.voice = voice;
  utter.lang = voice.lang || "zh-CN";
  utter.rate = 0.55;
  utter.pitch = 1;
  utter.volume = 1;

  utter.onstart = () => onStart && onStart();
  utter.onend = () => onEnd && onEnd();
  utter.onerror = (event) => {
    if (event && (event.error === "canceled" || event.error === "interrupted")) {
      return; // expected when a new utterance starts / stop() called
    }
    onError && onError(new Error(event?.error || "speech-error"));
  };

  window.speechSynthesis.speak(utter);
  return { stop: () => window.speechSynthesis.cancel() };
};

/**
 * Play the pronunciation of a single acupuncture point.
 *
 * Only the Hanzi string is ever sent to the speech engine. Pinyin, point
 * codes, Indonesian, and English are never spoken.
 *
 * @param {Object} params
 * @param {string} params.text         Hanzi to pronounce (required).
 * @param {string} [params.audioUrl]   Explicit MP3 URL (highest priority).
 * @param {string} [params.meridianCode] Meridian code for MP3 lookup.
 * @param {number} [params.pointNum]   Point number for MP3 lookup.
 * @param {() => void} [params.onStart]
 * @param {() => void} [params.onEnd]
 * @param {(err: Error) => void} [params.onError]
 * @returns {Promise<{ stop: () => void }>}
 */
export const playPronunciation = async ({
  text,
  audioUrl,
  meridianCode,
  pointNum,
  onStart,
  onEnd,
  onError,
}) => {
  const resolvedUrl = resolveAudioUrl({ audioUrl, meridianCode, pointNum });
  if (resolvedUrl) {
    return playAudioFile(resolvedUrl, { onStart, onEnd, onError });
  }
  return speakHanzi(text, { onStart, onEnd, onError });
};
