// Jumeau JavaScript de lib/src/dosage_manuel.dart (mêmes formules). Dart fait foi.
(function (root) {
  'use strict';
  function ve(s) { return s.ca * s.va / s.cb; }
  function ph(s, vb) { var na = s.ca * s.va, nb = s.cb * vb, v = s.va + vb; if (Math.abs(na - nb) < 1e-9) return 7; return nb < na ? -Math.log10((na - nb) / v) : 14 + Math.log10((nb - na) / v); }
  function rose(p) { if (p <= 8.2) return 0; var i = Math.max(0, Math.min(1, (p - 8.2) / 2.8)); return Math.pow(i, 1.4) * 0.9 + (i >= 1 ? 0.1 : 0); }
  function goutte(a) { return 0.05 * (1 + 0.05 * Math.max(-1, Math.min(1, a))); }
  function pipette(j, mm) { return j + 0.04 * mm; }
  function bulle(lu, b) { return b ? Math.max(0, lu - 0.3) : lu; }
  function decalage(n) { return n > 5 ? 0.03 * (n - 5) : 0; }
  function lecture(cm) { return Math.max(-0.3, Math.min(0.3, cm * 0.2)); }
  function tache(i, dt, ag) { return i * Math.exp(-(0.04 + 0.9 * ag) * dt); }
  function serie(alea) { var va = [10, 20, 25][Math.floor(alea() * 3)], max = Math.min(0.15, 2.2 / va), ca = Math.round((0.05 + alea() * (max - 0.05)) * 1000) / 1000; return { ca: ca, cb: 0.10, va: va }; }
  root.DosageModele = { ve: ve, ph: ph, rose: rose, goutte: goutte, pipette: pipette, bulle: bulle, decalage: decalage, lecture: lecture, tache: tache, serie: serie, DEFAUT: { ca: 0.08, cb: 0.10, va: 20 } };
  if (typeof module !== 'undefined') module.exports = root.DosageModele;
}(typeof window !== 'undefined' ? window : globalThis));
