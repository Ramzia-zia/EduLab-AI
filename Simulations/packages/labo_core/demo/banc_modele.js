// Jumeau JavaScript de lib/src/banc_optique.dart (même formules, mêmes noms).
// Utilisé tant que la démo n'est pas recompilée avec « construire_demo ». Si les deux divergent, Dart fait foi.
(function (root) {
  'use strict';
  var P = { fPrimeCm: 15.0, hauteurObjetCm: 1.2, toleranceNetteteCm: 0.5, flouPxParCm: 2.4, distanceMiroirCm: 3.0, hauteursRayonsCm: [2, 0, -2] };
  var FLOU_SANS_IMAGE = 60;
  function sans() { return { positionImageCm: null, grandissement: null, tailleImageCm: null, ecartCm: null, flouPx: FLOU_SANS_IMAGE, nette: false }; }
  function imageSurEcran(xo, xl, xe, p) {
    p = p || P; var pp0 = xl - xo, f = p.fPrimeCm; if (pp0 <= f) return sans();
    var pp = 1 / (1 / f - 1 / pp0), g = pp / pp0, ec = Math.abs(xe - (xl + pp));
    return { positionImageCm: xl + pp, grandissement: g, tailleImageCm: g * p.hauteurObjetCm, ecartCm: ec, flouPx: p.flouPxParCm * ec, nette: ec < p.toleranceNetteteCm };
  }
  function imageAutocollimation(xo, xl, p) {
    p = p || P; var pp0 = xl - xo, f = p.fPrimeCm; if (pp0 < f - 1e-9) return sans();
    var dm = p.distanceMiroirCm, invPp = 1 / f - 1 / pp0, invP2;
    if (Math.abs(invPp) < 1e-9) invP2 = 0; else { var p2 = 2 * dm - 1 / invPp; if (Math.abs(p2) < 1e-9) return sans(); invP2 = 1 / p2; }
    var invImg = 1 / f - invP2; if (invImg <= 1e-9) return sans();
    var xi = xl - 1 / invImg, ec = Math.abs(xi - xo);
    var tot = Math.abs(invPp) < 1e-9 ? (1 / invImg) / pp0 : Math.abs((1 / invPp) / pp0 * (1 / invImg) * invP2);
    return { positionImageCm: xi, grandissement: tot, tailleImageCm: tot * p.hauteurObjetCm, ecartCm: ec, flouPx: p.flouPxParCm * ec, nette: ec < p.toleranceNetteteCm };
  }
  function rayons(xo, xl, xe, xm, p) {
    p = p || P; var f = p.fPrimeCm, yb = p.hauteurObjetCm, dx = xl - xo, out = [];
    if (dx <= 1e-6) return out;
    p.hauteursRayonsCm.forEach(function (h) {
      var s1 = (h - yb) / dx, s2 = s1 - h / f;
      out.push({ x1: xo, y1: yb, x2: xl, y2: h, retour: false });
      if (xm !== null && xm !== undefined) {
        var dm = xm - xl, ym = h + s2 * dm, hr = ym + s2 * dm, s3 = s2 - hr / f;
        out.push({ x1: xl, y1: h, x2: xm, y2: ym, retour: false });
        out.push({ x1: xm, y1: ym, x2: xl, y2: hr, retour: true });
        out.push({ x1: xl, y1: hr, x2: xo, y2: hr + s3 * dx, retour: true });
      } else if (xe !== null && xe !== undefined && xe > xl) {
        out.push({ x1: xl, y1: h, x2: xe, y2: h + s2 * (xe - xl), retour: false });
      }
    });
    return out;
  }
  function lectureRegleCm(x, parallaxeMm) { return (Math.round(x * 10) + (parallaxeMm || 0)) / 10; }
  function positionsBessel(D, p) { p = p || P; var d = D * D - 4 * D * p.fPrimeCm; if (d < 0) return null; var r = Math.sqrt(d); return [(D - r) / 2, (D + r) / 2]; }
  root.BancModele = { P: P, imageSurEcran: imageSurEcran, imageAutocollimation: imageAutocollimation, rayons: rayons, lectureRegleCm: lectureRegleCm, positionsBessel: positionsBessel };
  if (typeof module !== 'undefined') module.exports = root.BancModele;
}(typeof window !== 'undefined' ? window : globalThis));
