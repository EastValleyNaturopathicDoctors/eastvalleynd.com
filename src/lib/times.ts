/**
 * Clinic times that never break across lines (tracker K11): a time keeps its
 * am/pm ("1:00 pm") and a range keeps both ends together ("12:00 – 1:00 pm"),
 * so a narrow card never leaves "pm" or the second time alone on a line. Only
 * the spaces change, to U+00A0; the words are the same.
 */
const NBSP = ' ';

export const keepTimes = (s: string): string =>
  s
    // "1:00 pm", "9 am": the time and its am/pm.
    .replace(/(\d)\s+([ap]m)\b/gi, `$1${NBSP}$2`)
    // "12:00 – 1:00", "9 am – 5 pm": both ends of a range and the dash between.
    .replace(/(\d|\b[ap]m)\s+([–—-])\s+(?=\d)/gi, `$1${NBSP}$2${NBSP}`);
