// Graphiques en SVG natif (sans bibliothèque). Le viewBox permet de s'adapter à toutes les tailles d'écran.
import { escapeHtml } from './dom.js';

const PURPLE = '#5B35D5';
const GRID = '#E8E8F2';
const TEXT = '#5C5B7E';

function niceTicks(min, max, count = 5) {
  const step = (max - min) / count;
  return Array.from({ length: count + 1 }, (_, i) => Math.round((min + step * i) * 10) / 10);
}

// Courbe y = f(x) à partir de points [{x, y}]
export function renderLineChart(container, points, { xLabel = '', yLabel = '', yMin = 0, yMax = null, title = 'Graphique' } = {}) {
  const W = 480, H = 260, L = 48, R = 16, T = 14, B = 44;
  const xs = points.map((p) => p.x), ys = points.map((p) => p.y);
  const xMin = Math.min(...xs), xMax = Math.max(...xs, xMin + 1);
  const top = yMax ?? Math.max(...ys, yMin + 1);
  const X = (x) => L + ((x - xMin) / (xMax - xMin)) * (W - L - R);
  const Y = (y) => H - B - ((y - yMin) / (top - yMin)) * (H - B - T);
  let svg = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${escapeHtml(title)}">`;
  for (const t of niceTicks(yMin, top)) svg += `<line x1="${L}" x2="${W - R}" y1="${Y(t)}" y2="${Y(t)}" stroke="${GRID}"/><text x="${L - 8}" y="${Y(t) + 4}" text-anchor="end" font-size="11" fill="${TEXT}">${t}</text>`;
  for (const t of niceTicks(xMin, xMax)) svg += `<text x="${X(t)}" y="${H - B + 16}" text-anchor="middle" font-size="11" fill="${TEXT}">${t}</text>`;
  svg += `<text x="${(L + W - R) / 2}" y="${H - 6}" text-anchor="middle" font-size="12" fill="${TEXT}">${escapeHtml(xLabel)}</text>`;
  svg += `<text transform="translate(12 ${(T + H - B) / 2}) rotate(-90)" text-anchor="middle" font-size="12" fill="${TEXT}">${escapeHtml(yLabel)}</text>`;
  svg += `<polyline fill="none" stroke="${PURPLE}" stroke-width="3" stroke-linejoin="round" points="${points.map((p) => `${X(p.x)},${Y(p.y)}`).join(' ')}"/>`;
  svg += points.map((p) => `<circle cx="${X(p.x)}" cy="${Y(p.y)}" r="4" fill="${PURPLE}"><title>${p.x} ; ${p.y}</title></circle>`).join('');
  container.innerHTML = svg + '</svg>';
}

// Courbe avec des étiquettes (S1, S2...) sur l'axe horizontal
export function renderLabeledLine(container, items, { title = 'Évolution' } = {}) {
  const W = 480, H = 240, L = 40, R = 16, T = 14, B = 34;
  const n = items.length;
  const X = (i) => L + (n === 1 ? 0.5 : i / (n - 1)) * (W - L - R);
  const Y = (v) => H - B - (v / 100) * (H - B - T);
  let svg = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${escapeHtml(title)}">`;
  for (const t of [0, 25, 50, 75, 100]) svg += `<line x1="${L}" x2="${W - R}" y1="${Y(t)}" y2="${Y(t)}" stroke="${GRID}"/><text x="${L - 8}" y="${Y(t) + 4}" text-anchor="end" font-size="11" fill="${TEXT}">${t}</text>`;
  svg += items.map((it, i) => `<text x="${X(i)}" y="${H - 10}" text-anchor="middle" font-size="11" fill="${TEXT}">${escapeHtml(it.label)}</text>`).join('');
  svg += `<polyline fill="none" stroke="${PURPLE}" stroke-width="3" stroke-linejoin="round" points="${items.map((it, i) => `${X(i)},${Y(it.score)}`).join(' ')}"/>`;
  svg += items.map((it, i) => `<circle cx="${X(i)}" cy="${Y(it.score)}" r="4" fill="${PURPLE}"><title>${escapeHtml(it.label)} : ${it.score} %</title></circle>`).join('');
  container.innerHTML = svg + '</svg>';
}

// Barres verticales (0 à 100 %)
export function renderBarChart(container, items, { title = 'Résultats' } = {}) {
  const W = 480, H = 240, L = 40, R = 16, T = 14, B = 34;
  const slot = (W - L - R) / items.length, bar = Math.min(56, slot * 0.6);
  const Y = (v) => H - B - (v / 100) * (H - B - T);
  let svg = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${escapeHtml(title)}">`;
  for (const t of [0, 25, 50, 75, 100]) svg += `<line x1="${L}" x2="${W - R}" y1="${Y(t)}" y2="${Y(t)}" stroke="${GRID}"/><text x="${L - 8}" y="${Y(t) + 4}" text-anchor="end" font-size="11" fill="${TEXT}">${t}</text>`;
  items.forEach((it, i) => {
    const cx = L + slot * i + slot / 2;
    svg += `<rect x="${cx - bar / 2}" y="${Y(it.value)}" width="${bar}" height="${H - B - Y(it.value)}" rx="6" fill="${PURPLE}"><title>${escapeHtml(it.label)} : ${it.value} %</title></rect>`;
    svg += `<text x="${cx}" y="${H - 10}" text-anchor="middle" font-size="11" fill="${TEXT}">${escapeHtml(it.label)}</text>`;
  });
  container.innerHTML = svg + '</svg>';
}

// Anneau de progression (ex. 68 %)
export function renderDonut(container, percent, { label = 'Progression globale' } = {}) {
  const r = 52, c = 2 * Math.PI * r, p = Math.max(0, Math.min(100, percent));
  container.innerHTML = `<svg viewBox="0 0 140 140" role="img" aria-label="${escapeHtml(label)} : ${p} %"><circle cx="70" cy="70" r="${r}" fill="none" stroke="${GRID}" stroke-width="14"/><circle cx="70" cy="70" r="${r}" fill="none" stroke="${PURPLE}" stroke-width="14" stroke-linecap="round" stroke-dasharray="${(c * p) / 100} ${c}" transform="rotate(-90 70 70)"/><text x="70" y="78" text-anchor="middle" font-size="26" font-weight="800" fill="#17163D">${p}%</text></svg>`;
}
