// Mots trop courants pour aider à reconnaître une question.
const STOPWORDS = new Set([
  'le', 'la', 'les', 'un', 'une', 'des', 'du', 'de', 'et', 'ou', 'en', 'au', 'aux', 'ce', 'cet', 'cette', 'ces',
  'est', 'sont', 'ai', 'as', 'a', 'on', 'il', 'elle', 'je', 'tu', 'nous', 'vous', 'ils', 'elles', 'me', 'te', 'se',
  'que', 'qui', 'quoi', 'quel', 'quelle', 'pour', 'par', 'sur', 'dans', 'avec', 'sans', 'pas', 'ne', 'mon', 'ma',
  'mes', 'ton', 'ta', 'tes', 'son', 'sa', 'ses', 'pourquoi', 'comment', 'devient', 'devenue', 'faut', 'peut',
  'dois', 'doit', 'quand', 'ou', 'si', 'ca', 'cela',
]);

/** Minuscules, sans accents ni ponctuation (« Phénolphtaléine ? » → « phenolphtaleine »). */
export function normalizeText(value) {
  return String(value ?? '')
    .normalize('NFKD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Pluriel simple : « solutions » → « solution ».
const singularize = (word) => (word.length > 3 && /[sx]$/.test(word) ? word.slice(0, -1) : word);

/** Mots significatifs d'un texte, normalisés. */
export function tokenize(value) {
  return normalizeText(value)
    .split(' ')
    .filter((word) => word.length >= 2 && !STOPWORDS.has(word))
    .map(singularize);
}
