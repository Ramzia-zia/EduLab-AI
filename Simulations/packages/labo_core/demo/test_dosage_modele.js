const D = require('./dosage_modele.js'), s = D.DEFAUT; let ok = 0, ko = 0;
function eq(n, a, b, d) { if (Math.abs(a - b) <= d) ok++; else { ko++; console.log('ECHEC', n, a, b); } } function vrai(n, c) { if (c) ok++; else { ko++; console.log('ECHEC', n); } }
eq('Ve', D.ve(s), 16, 1e-9); eq('pH0', D.ph(s, 0), 1.10, 0.01); eq('8', D.ph(s, 8), 1.54, 0.01); eq('15', D.ph(s, 15), 2.54, 0.01); eq('16', D.ph(s, 16), 7, 1e-9); eq('16,05', D.ph(s, 16.05), 10.14, 0.01); eq('16,5', D.ph(s, 16.5), 11.14, 0.01); eq('20', D.ph(s, 20), 12, 0.01);
eq('incolore', D.rose(D.ph(s, 15.95)), 0, 1e-9); vrai('rose a 16,05', D.rose(D.ph(s, 16.05)) > 0.3); vrai('surdosage plus rose', D.rose(D.ph(s, 16.5)) > D.rose(D.ph(s, 16.05)));
eq('goutte', D.goutte(0), 0.05, 1e-12); eq('goutte+', D.goutte(1), 0.0525, 1e-12); eq('pipette', D.pipette(20, 5), 20.2, 1e-9); eq('bulle', D.bulle(16, true), 15.7, 1e-9); eq('dec3', D.decalage(3), 0, 1e-12); eq('dec8', D.decalage(8), 0.09, 1e-12); vrai('tache', D.tache(1, 5, 1) < D.tache(1, 5, 0));
for (var i = 0; i < 50; i++) { var q = D.serie(Math.random); vrai('Ve<=22', D.ve(q) <= 22.0001); }
console.log(ok + ' tests réussis, ' + ko + ' échecs.'); process.exit(ko ? 1 : 0);
