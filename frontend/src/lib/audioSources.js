// Static mapping of `<MERIDIAN>-<POINT_NUM>` -> MP3 URL.
//
// This module exists so pre-recorded MP3s can drop in later without touching
// the UI or the data file. Whenever an entry is present, the audio system
// prefers it over Web Speech API synthesis.
//
// Intentionally empty — after evaluation the browser Web Speech API (zh-CN)
// gave better Mandarin pronunciation than ElevenLabs for this teaching
// use-case, so all points fall through to native browser TTS with the
// slow, syllable-isolated teaching delivery configured in `audio.js`.
//
// To re-enable a specific point later:
//   1. Drop the file at `/app/frontend/public/audio/<CODE>-<NUM>.mp3`
//   2. Add an entry:    "LU-7": "/audio/LU-7.mp3",
// The key format is `${meridianCode.toUpperCase()}-${pointNum}`.

const AUDIO_SOURCES = {};

/**
 * Resolve a static MP3 URL for a given point, if one is registered.
 * @param {string} meridianCode e.g. "LU"
 * @param {number|string} pointNum e.g. 1
 * @returns {string|undefined}
 */
export const resolveAudioSource = (meridianCode, pointNum) => {
  if (!meridianCode || pointNum === undefined || pointNum === null) return undefined;
  const key = `${String(meridianCode).toUpperCase()}-${pointNum}`;
  return AUDIO_SOURCES[key];
};

export default AUDIO_SOURCES;
