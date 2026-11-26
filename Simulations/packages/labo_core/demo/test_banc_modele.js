// node demo/test_banc_modele.js : mêmes vérifications que test/banc_optique_test.dart (f' = 15 cm, tolérance 0,5 cm)
const M = require('./banc_modele.js'); let ok = 0, ko = 0;
function eq(n, a, b, d) { if (Math.abs(a - b) <= d) ok++; else { ko++; console.log('ECHEC', n, a, b); } }
function vrai(n, c) { if (c) ok++; else { ko++; console.log('ECHEC', n); } }
let i = M.imageSurEcran(10, 30, 90); eq('p\'', i.positionImageCm - 30, 60, 1e-9); vrai('nette', i.nette); eq('gamma', i.grandissement, 3, 1e-9); eq('taille', i.tailleImageCm, 3.6, 1e-9);
i = M.imageSurEcran(10, 30, 95); eq('ecart', i.ecartCm, 5, 1e-9); eq('flou', i.flouPx, 12, 1e-9); vrai('floue', !i.nette);
vrai('0,4', M.imageSurEcran(10, 30, 90.4).nette); vrai('0,6', !M.imageSurEcran(10, 30, 90.6).nette);
vrai('foyer', M.imageSurEcran(10, 25, 70).positionImageCm === null); vrai('avant foyer', !M.imageSurEcran(10, 20, 70).nette);
let b = M.positionsBessel(80); eq('d', b[1] - b[0], 40, 1e-9); eq('f', (6400 - 1600) / 320, 15, 1e-9); eq('L1', 10 + b[0], 30, 1e-9); eq('L2', 10 + b[1], 70, 1e-9); vrai('D<4f', M.positionsBessel(50) === null);
let a = M.imageSurEcran(10, 10 + b[0], 90), c = M.imageSurEcran(10, 10 + b[1], 90); vrai('bessel nettes', a.nette && c.nette); vrai('agrandie', a.grandissement > 1); vrai('reduite', c.grandissement < 1);
i = M.imageAutocollimation(25, 40); vrai('bilb nette', i.nette); eq('g=1', i.grandissement, 1, 1e-6); eq('taille', i.tailleImageCm, 1.2, 1e-6); vrai('bilb floue', !M.imageAutocollimation(22, 40).nette);
let r = M.rayons(10, 30, 90).filter(s => s.x2 === 90); vrai('3 rayons', r.length === 3); r.forEach(s => eq('converge', s.y2, -3.6, 1e-9));
r = M.rayons(25, 40, null, 43).filter(s => s.retour && s.x2 === 25); vrai('3 retours', r.length === 3); r.forEach(s => eq('retour', s.y2, -1.2, 1e-6));
eq('lecture', M.lectureRegleCm(30.04), 30, 1e-9); eq('lecture2', M.lectureRegleCm(30.06), 30.1, 1e-9); eq('parallaxe', M.lectureRegleCm(30, 0.5), 30.05, 1e-9);
console.log(ok + ' tests réussis, ' + ko + ' échecs.'); process.exit(ko ? 1 : 0);
