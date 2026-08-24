// Audio system for TCM point pronunciation.
//
// Playback priority for each acupuncture point:
//   1. Pre-recorded MP3 (per-point `audioUrl` or entry in `audioSources.js`).
//   2. Web Speech API using a native Mandarin (zh-CN) voice.
//   3. If neither is available -> onError('no-mandarin-voice' | 'speech-not-supported').
//
// The synthesizer speaks ONLY the Hanzi string passed in. It never speaks
// Pinyin, point codes, English, or Indonesian text. Non-Mandarin voices are
// intentionally rejected so the app does not mispronounce Chinese characters
// with an Indonesian or English voice.

import { resolveAudioSource } from "@/lib/audioSources";

const isBrowser = typeof window !== "undefined";

export const isSpeechSupported = () =>
  isBrowser &&
  "speechSynthesis" in window &&
  typeof window.SpeechSynthesisUtterance === "function";

// ---------------------------------------------------------------------------
// Voice loading
// ---------------------------------------------------------------------------

// Some browsers populate voices asynchronously (Chrome/Edge). We wait for the
// `voiceschanged` event, poll for a short window, then resolve with whatever
// is available so callers can decide.
const loadVoices = () =>
  new Promise((resolve) => {
    if (!isSpeechSupported()) return resolve([]);

    const initial = window.speechSynthesis.getVoices();
    if (initial && initial.length) return resolve(initial);

    let settled = false;
    const finish = (voices) => {
      if (settled) return;
      settled = true;
      window.speechSynthesis.removeEventListener("voiceschanged", onChanged);
      clearInterval(pollId);
      clearTimeout(timeoutId);
      resolve(voices || []);
    };

    const onChanged = () => {
      const v = window.speechSynthesis.getVoices();
      if (v && v.length) finish(v);
    };
    window.speechSynthesis.addEventListener("voiceschanged", onChanged);

    // Fallback: poll every 100ms up to ~2s. Some Safari builds never fire
    // `voiceschanged` after the initial empty read.
    const pollId = setInterval(() => {
      const v = window.speechSynthesis.getVoices();
      if (v && v.length) finish(v);
    }, 100);

    const timeoutId = setTimeout(() => {
      finish(window.speechSynthesis.getVoices() || []);
    }, 2000);
  });

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

  const voices = await loadVoices();
  const voice = pickMandarinVoice(voices);
  if (!voice) {
    // Strict rule: never speak Chinese characters with a non-Mandarin voice.
    onError && onError(new Error("no-mandarin-voice"));
    return { stop: () => {} };
  }

  // Teaching-mode delivery for beginner Indonesian learners:
  //   - Rate 0.55 (~55% of default) so tones are clearly audible.
  //   - The full Chinese word is sent to the engine as ONE utterance so it
  //     is spoken as one continuous phonetic unit (e.g. 列缺 -> "lièquē"),
  //     NOT split into disconnected syllables. Slow speech ≠ pauses.
  //   - Non-CJK characters (letters, digits, punctuation) are filtered out
  //     so the drill remains a pure Mandarin pronunciation drill.
  const HAN_RE = /\p{Script=Han}/u;
  const spoken = Array.from(hanzi).filter((ch) => HAN_RE.test(ch)).join("");
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
