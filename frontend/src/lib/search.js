// Search over the meridians dataset.
//
// Matching rules:
//   - Case-insensitive.
//   - Diacritics stripped (so "Lie Que" matches "Liè Quē").
//   - Spaces and hyphens stripped (so "LU 7" matches "LU7", "Taiyin Tangan
//     Paru" matches "Meridian Taiyin Tangan Paru-Paru").
//   - Substring match against every searchable field.
//
// Alternate WHO codes are accepted as inputs (display codes never change):
//     SJ ↔ TE   (San Jiao / Triple Energizer)
//     LV ↔ LR   (Liver)
//     REN ↔ CV  (Conception Vessel)
//     DU ↔ GV   (Governing Vessel)

import { meridians } from "@/data/meridians";

const stripDiacritics = (s) =>
  String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const norm = (s) =>
  stripDiacritics(s).toLowerCase().replace(/[\s\-·]+/g, "");

// Extra input-only aliases for meridian codes. The canonical `.code` on each
// meridian record stays authoritative; these are only added to the pool of
// tokens the search will match against.
const CODE_ALIASES = {
  SJ: ["te"],
  LV: ["lr"],
  REN: ["cv"],
  DU: ["gv"],
};

const meridianCodes = (m) => {
  const base = m.code.toLowerCase();
  const aliases = (CODE_ALIASES[m.code.toUpperCase()] || []).map((c) =>
    c.toLowerCase()
  );
  return [base, ...aliases];
};

const meridianTokens = (m) =>
  [
    ...meridianCodes(m),
    m.hanzi,
    m.pinyin,
    m.indonesian,
    m.english,
  ].map(norm);

const pointTokens = (m, p) => {
  const codes = meridianCodes(m).flatMap((c) => [
    `${c}${p.num}`,
    `${c} ${p.num}`,
  ]);
  return [...codes, p.hanzi, p.pinyin].map(norm);
};

/**
 * Run a search across all meridians and points.
 * @param {string} query
 * @returns {{
 *   meridians: Array<object>,
 *   points: Array<{ meridian: object, point: object }>
 * }}
 */
export const searchAll = (query) => {
  const q = norm(query);
  if (!q) return { meridians: [], points: [] };

  const matchedMeridians = [];
  const matchedPoints = [];

  for (const m of meridians) {
    const meridianHit = meridianTokens(m).some((tok) => tok.includes(q));
    if (meridianHit) matchedMeridians.push(m);

    for (const p of m.points) {
      const pointHit = pointTokens(m, p).some((tok) => tok.includes(q));
      // If the meridian itself matched (e.g. "LU"), include all its points too
      // so "Searching LU shows the Lung Meridian and its points".
      if (pointHit || meridianHit) {
        matchedPoints.push({ meridian: m, point: p });
      }
    }
  }

  return { meridians: matchedMeridians, points: matchedPoints };
};
