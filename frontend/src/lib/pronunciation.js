// Pronunciation correction layer for the Mandarin TTS engine.
//
// Motivation
// ----------
// The zh-CN Web Speech engine picks *general-purpose* readings for polyphonic
// Hanzi characters. That works fine for everyday text but produces several
// well-known wrong readings for TCM acupuncture terminology, e.g.:
//
//     俞  →  the engine reads it as "yú" (surname/general reading),
//            but in every Back-Shū point (肺俞, 心俞, 肝俞, …, 腰俞, 俞府)
//            it MUST be read as "shù/shū".
//     行  →  the engine may read it as "háng" (a bank/row) instead of
//            "xíng" in 行间.
//     郄  →  read as "qiè" instead of the correct "xì" (cleft point suffix).
//     泺  →  read as "huò" instead of "luò" in 消泺.
//     攒  →  read as "zǎn" instead of "cuán" in 攒竹.
//     膻  →  read as "shān" instead of the TCM reading "dàn" in 膻中.
//
// Strategy
// --------
// Rather than shipping a per-point audio-file table, we transform the Hanzi
// *before* it reaches the TTS engine by substituting the ambiguous characters
// with unambiguous homophones (or near-homophones) that the same zh-CN voice
// will read with the correct sound. The upstream data file (meridians.js) and
// the on-screen Hanzi + Pinyin remain untouched.
//
// Two levels are supported:
//
//   1. WORD_OVERRIDES  — full-string, exact-match replacement. Used for
//                        context-dependent characters where a global char
//                        swap would be unsafe (e.g. 行 is xíng here but
//                        háng elsewhere in general Chinese).
//
//   2. CHAR_OVERRIDES  — single-character substitutions applied after the
//                        word-level lookup. Only add characters here whose
//                        TCM point-name reading is context-invariant.
//
// The result flows straight into `speakHanzi()` in `audio.js`, preserving the
// locked rate 0.55 / single-utterance / zh-CN voice configuration untouched.

// ─── Word-level overrides ────────────────────────────────────────────────
// key   : the exact Hanzi string as stored in `src/data/meridians.js`
// value : the substituted Hanzi that the zh-CN engine reads correctly
export const WORD_OVERRIDES = {
  // 行间 (Xíng Jiān) — engine reads 行 as háng. Swap → 形 (xíng).
  "行间": "形间",
  // 消泺 (Xiāo Luò) — engine reads 泺 as huò. Swap → 洛 (luò).
  "消泺": "消洛",
  // 攒竹 (Cuán Zhú) — engine reads 攒 as zǎn. No Chinese char is a perfect
  // homophone for cuán; 窜 (cuàn) is the closest common substitute — it
  // gives the correct initial "c-" sound so learners recognise the word.
  "攒竹": "窜竹",
  // 膻中 (Dàn Zhōng) — engine reads 膻 as shān. Swap → 但 (dàn).
  "膻中": "但中",
};

// ─── Character-level overrides ───────────────────────────────────────────
// Applied to every remaining character after WORD_OVERRIDES has run.
// Only include characters whose TCM point-name reading is unambiguous.
export const CHAR_OVERRIDES = {
  // 俞 as the Back-Shū suffix (肺俞, 心俞, 肝俞, 胆俞, 脾俞, 胃俞, 肾俞,
  // 三焦俞, 大肠俞, 小肠俞, 膀胱俞, 关元俞, 气海俞, 中膂俞, 白环俞,
  // 厥阴俞, 督俞, 膈俞, 肩外俞, 肩中俞, 臑俞, 肓俞, 腰俞, 俞府, …)
  // is always read Shū in TCM. Swap → 腧 (an actual TCM character read Shù,
  // no other reading).
  "俞": "腧",
  // 郄 in cleft-point names (浮郄, 温溜郄, 梁丘郄, …) is always Xì. Swap → 隙.
  "郄": "隙",
};

/**
 * Return the pronunciation-corrected Hanzi string that should be handed to
 * the TTS engine. The visible Hanzi in the UI is NEVER changed — only what
 * the synthesiser sees is transformed.
 *
 * @param {string} hanzi The original Hanzi string from meridians.js.
 * @returns {string}     The Hanzi string with pronunciation corrections
 *                       applied. Falls back to the input if no rules match.
 */
export const applyPronunciation = (hanzi) => {
  if (!hanzi) return hanzi;
  const whole = WORD_OVERRIDES[hanzi];
  const base = whole !== undefined ? whole : hanzi;
  return Array.from(base)
    .map((ch) => CHAR_OVERRIDES[ch] || ch)
    .join("");
};
