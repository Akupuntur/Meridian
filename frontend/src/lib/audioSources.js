// Static mapping of `<MERIDIAN>-<POINT_NUM>` -> MP3 URL.
//
// This module exists so pre-recorded MP3s can be added later without touching
// the UI or the data file. Whenever an entry is present, the audio system
// prefers it over Web Speech API synthesis.
//
// Recommended workflow when recordings are ready:
//   1. Drop the file at `/app/frontend/public/audio/<code>-<num>.mp3`
//      (e.g. `/app/frontend/public/audio/LU-1.mp3`).
//   2. Add an entry below:
//        "LU-1": "/audio/LU-1.mp3",
//   3. The point card audio button will automatically use it — no UI change.
//
// The key format is `${meridianCode.toUpperCase()}-${pointNum}`.

const AUDIO_SOURCES = {
  // Example (uncomment when files exist):
  // "LU-1": "/audio/LU-1.mp3",
  // "LU-2": "/audio/LU-2.mp3",
};

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
