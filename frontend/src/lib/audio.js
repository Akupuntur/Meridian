// Audio abstraction. Currently uses Web Speech API for Mandarin (zh-CN).
// Later, this can be replaced with pre-recorded MP3s without changing the UI.
// If a point has `audioUrl`, an <Audio> element will be preferred over TTS.

const isBrowser = typeof window !== "undefined";

export const isSpeechSupported = () =>
  isBrowser &&
  "speechSynthesis" in window &&
  typeof window.SpeechSynthesisUtterance === "function";

// Load voices (some browsers populate them asynchronously).
const loadVoices = () =>
  new Promise((resolve) => {
    if (!isSpeechSupported()) return resolve([]);
    const existing = window.speechSynthesis.getVoices();
    if (existing && existing.length) return resolve(existing);
    const handler = () => {
      window.speechSynthesis.removeEventListener("voiceschanged", handler);
      resolve(window.speechSynthesis.getVoices() || []);
    };
    window.speechSynthesis.addEventListener("voiceschanged", handler);
    // Safety timeout
    setTimeout(() => resolve(window.speechSynthesis.getVoices() || []), 800);
  });

const pickMandarinVoice = (voices) => {
  if (!voices || !voices.length) return null;
  const zhCN = voices.find((v) => /zh[-_]CN/i.test(v.lang));
  if (zhCN) return zhCN;
  const zhAny = voices.find((v) => /^zh/i.test(v.lang));
  return zhAny || null;
};

export const hasMandarinVoice = async () => {
  if (!isSpeechSupported()) return false;
  const voices = await loadVoices();
  return !!pickMandarinVoice(voices);
};

/**
 * Play the pronunciation of a Hanzi phrase.
 * @param {Object} params
 * @param {string} params.text - Chinese characters to speak.
 * @param {string} [params.audioUrl] - Optional pre-recorded audio URL (future).
 * @param {() => void} [params.onStart]
 * @param {() => void} [params.onEnd]
 * @param {(err: Error) => void} [params.onError]
 * @returns {Promise<{ stop: () => void }>}
 */
export const playPronunciation = async ({
  text,
  audioUrl,
  onStart,
  onEnd,
  onError,
}) => {
  // Future path: pre-recorded audio
  if (audioUrl) {
    const audio = new Audio(audioUrl);
    audio.addEventListener("play", () => onStart && onStart());
    audio.addEventListener("ended", () => onEnd && onEnd());
    audio.addEventListener("error", () => {
      const err = new Error("audio-file-error");
      onError && onError(err);
    });
    try {
      await audio.play();
    } catch (e) {
      onError && onError(e);
    }
    return { stop: () => audio.pause() };
  }

  if (!isSpeechSupported()) {
    const err = new Error("speech-not-supported");
    onError && onError(err);
    return { stop: () => {} };
  }

  const voices = await loadVoices();
  const voice = pickMandarinVoice(voices);
  if (!voice) {
    const err = new Error("no-mandarin-voice");
    onError && onError(err);
    return { stop: () => {} };
  }

  // Cancel anything currently speaking so buttons behave predictably.
  window.speechSynthesis.cancel();

  const utter = new window.SpeechSynthesisUtterance(text);
  utter.voice = voice;
  utter.lang = voice.lang || "zh-CN";
  utter.rate = 0.85;
  utter.pitch = 1;

  utter.onstart = () => onStart && onStart();
  utter.onend = () => onEnd && onEnd();
  utter.onerror = (event) => {
    // "canceled" and "interrupted" are expected when a new utterance starts.
    if (event && (event.error === "canceled" || event.error === "interrupted")) {
      return;
    }
    onError && onError(new Error(event?.error || "speech-error"));
  };

  window.speechSynthesis.speak(utter);
  return { stop: () => window.speechSynthesis.cancel() };
};
