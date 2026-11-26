// Dosage acide-base manuel (SPEC section 4 : l'élève fait tout). L'état S est modifié seulement par les gestes ;
// la scène est redessinée à partir de lui. Formules : DosageModele (jumeau de lib/src/dosage_manuel.dart).
(function () {
  'use strict';
  var D = window.DosageModele, serieN = 0;
  function fr(x, d) { return (x === null || x === undefined || isNaN(x)) ? '' : x.toFixed(d === undefined ? 2 : d).replace('.', ','); }
  function num(s) { var v = parseFloat(String(s).replace(',', '.')); return isNaN(v) ? null : v; }
  function cl(x, a, b) { return Math.max(a, Math.min(b, x)); }
  var Y0 = 0.54, PAR_ML = 0.012;           // trait 0 mL de la burette et hauteur par mL
  var XB = 0, XN = -0.33, XA = 0.25, XD = 0.34, XS = 0.45, YF = 0.022;
  var CAUSES = {
    pince_non_serree: 'Une burette mal serrée peut glisser : le niveau lu change et le matériel peut casser.',
    lunettes_oubliees: 'La soude est corrosive : des projections dans l\'oeil causent des lésions graves.',
    zero_imprecis: 'Si le niveau de départ n\'est pas sur le zéro, la lecture du volume versé est faussée.',
    erreur_volume_acide: 'Le bas du ménisque doit être exactement sur le trait de jauge : sinon Va n\'est pas connu avec précision et Ca est faux.',
    bulle_air: 'Une bulle d\'air dans la pointe laisse sortir moins de liquide que le volume lu : Ve est surestimé.',
    trop_indicateur: 'L\'indicateur est un acide faible : trop de gouttes consomme de la soude et décale le virage.',
    debit_trop_rapide: 'Près de l\'équivalence, une goutte change le pH de plusieurs unités : verser vite fait dépasser le virage.',
    depassement_equivalence: 'Après l\'équivalence la soude est en excès : le pH monte et le rose devient intense. Le volume lu est trop grand.',
    goutte_hors_erlenmeyer: 'Une partie de la soude n\'est pas tombée dans l\'erlenmeyer : le volume lu est supérieur au volume réagi.',
    lecture_burette: 'Le volume doit être lu au bas du ménisque, l\'oeil à sa hauteur (sinon erreur de parallaxe).',
    calcul_concentration: 'Ca = Cb x Vb / Va : revérifier la formule et les unités.',
    rangement: 'Le matériel doit être vidé, rincé et le robinet fermé en fin de manipulation.'
  };
  var TITRE = { pince_non_serree: 'Burette non serrée dans la pince', lunettes_oubliees: 'Lunettes oubliées', zero_imprecis: 'Zéro de la burette imprécis', erreur_volume_acide: 'Volume d\'acide mal ajusté au trait de jauge', bulle_air: 'Bulle d\'air restée dans la pointe', trop_indicateur: 'Trop de gouttes d\'indicateur', debit_trop_rapide: 'Débit trop rapide près de l\'équivalence', depassement_equivalence: 'Équivalence dépassée', goutte_hors_erlenmeyer: 'Soude tombée hors de l\'erlenmeyer', lecture_burette: 'Volume mal lu', calcul_concentration: 'Concentration mal calculée', rangement: 'Rangement incomplet' };

  function creer(L3, hote, tagsEl, zone, cb) {
    var T = L3.three, scene = T.scene, camera = T.camera, controls = T.controls, R = {};
    scene.traverse(function (o) { if (o.type === 'Mesh') R.Mesh = o.constructor; if (o.type === 'Group') R.Group = o.constructor; if (o.geometry) { R[o.geometry.type] = o.geometry.constructor; if (o.geometry.type === 'LatheGeometry' && o.geometry.parameters.points) R.Vector2 = o.geometry.parameters.points[0].constructor; } if (o.material) { R[o.material.type] = o.material.constructor; if (o.material.map) R.Tex = o.material.map.constructor; } });
    R.V3 = camera.position.constructor;
    var vieux = T.cap(); if (vieux) vieux.visible = false;
    var G = new R.Group(); scene.add(G);
    var sauve = { az0: controls.minAzimuthAngle, az1: controls.maxAzimuthAngle, mn: controls.minDistance, mx: controls.maxDistance };
    controls.minAzimuthAngle = -1.1; controls.maxAzimuthAngle = 1.1; controls.minDistance = 0.12; controls.maxDistance = 1.8;
    var serie = serieN++ === 0 ? D.DEFAUT : D.serie(Math.random);
    var S = { serie: serie, lunettes: false, pince: false, vol: 0, bulle: false, remplie: false, u: 0, dispense: 0, verse: 0, gI: 0, nGoutteI: 0,
      fl: { x: -0.18, vA: 0, vB: 0, tint: 0, spot: 0, agit: 0, tilt: 0 }, nb: { x: XN, y: 0, tilt: 0 }, pi: { x: XA - 0.07, y: 0.16, niv: 0, soufflee: false, tubeA: false, vol: 0 }, dr: { x: XD, y: 0.07 },
      zero: null, erreurs: [], errSet: {}, t0: performance.now(), tAgit: 0, tVerse: 0, ph: false, pts: [], vide: false, rince: false, evalue: {}, drops: [], mnu: null, cahier: {}, indice: 0, cle: '', tilt: 0, trou: 0, perdu: 0, prochain: 0, tourne: false, debutDosage: false, ferme: false };
    var sale = true, cam = null, dernier = performance.now();

    // ------------------------------------------------------------ matériaux et fabrication
    function MS(o) { return new R.MeshStandardMaterial(o); }
    var verre = new R.MeshPhysicalMaterial({ color: 0xcfe6e0, transmission: 0.9, thickness: 0.006, ior: 1.5, roughness: 0.04, transparent: true, opacity: 0.55, envMapIntensity: 2.5, side: 2 });
    var alu = MS({ color: 0xc9ced4, metalness: 0.9, roughness: 0.32 }), fonte = MS({ color: 0x1b1f24, roughness: 0.6 }), ptfe = MS({ color: 0xf2f2ee, roughness: 0.35 }), rouge = MS({ color: 0xc0392b, roughness: 0.5 });
    function mesh(g, m, add) { var x = new R.Mesh(g, m); x.castShadow = true; x.receiveShadow = true; if (add !== false) G.add(x); return x; }
    function ajoute(x) { x.castShadow = true; x.receiveShadow = true; G.add(x); return x; }
    function cyl(r1, r2, h, m, ouvert) { return new R.Mesh(new R.CylinderGeometry(r1, r2, h, 32, 1, !!ouvert), m); }
    function etiquette(txt, sous, w, h) {
      var c = document.createElement('canvas'); c.width = 256; c.height = Math.round(256 * h / w); var g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.strokeStyle = '#0D2149'; g.strokeRect(2, 2, c.width - 4, c.height - 4);
      g.fillStyle = '#0D2149'; g.textAlign = 'center'; g.font = 'bold ' + Math.round(c.height * 0.3) + 'px system-ui,sans-serif'; g.fillText(txt, c.width / 2, c.height * 0.45); g.font = Math.round(c.height * 0.2) + 'px system-ui,sans-serif'; g.fillText(sous, c.width / 2, c.height * 0.8);
      var t = new R.Tex(c); return new R.Mesh(new R.PlaneGeometry(w, h), new R.MeshBasicMaterial({ map: t, toneMapped: false }));
    }
    // statif
    var base = mesh(new R.RoundedBoxGeometry(0.34, 0.02, 0.16, 4, 0.004), fonte); base.position.set(0.04, 0.01, 0);
    var tige = ajoute(cyl(0.006, 0.006, 0.66, alu)); tige.position.set(0.12, 0.35, 0);
    var bras = mesh(new R.RoundedBoxGeometry(0.12, 0.014, 0.018, 4, 0.002), alu); bras.position.set(0.06, 0.46, 0);
    var molette = ajoute(cyl(0.011, 0.011, 0.012, fonte)); molette.rotation.x = Math.PI / 2; molette.position.set(0.12, 0.46, 0.012);
    // burette
    var bur = new R.Group(); G.add(bur);
    var tube = cyl(0.0085, 0.0085, 0.40, verre, true); tube.position.y = 0.40; bur.add(tube);
    var liqB = cyl(0.0072, 0.0072, 1, MS({ color: 0xd6e9f4, roughness: 0.1 })); bur.add(liqB);
    var mniB = cyl(0.0074, 0.0074, 0.0014, MS({ color: 0x3f6a86, roughness: 0.3 })); bur.add(mniB);
    var gc = document.createElement('canvas'); gc.width = 128; gc.height = 2048; (function (g) { g.fillStyle = 'rgba(255,255,255,0)'; g.clearRect(0, 0, 128, 2048); g.fillStyle = '#0D2149'; g.font = 'bold 26px system-ui,sans-serif'; g.textAlign = 'right';
      for (var i = 0; i <= 250; i++) { var y = 24 + i * (2000 / 250), mm = i % 10 === 0; g.fillRect(mm ? 72 : (i % 5 === 0 ? 86 : 100), y, mm ? 44 : (i % 5 === 0 ? 30 : 16), mm ? 3 : 2); if (mm) g.fillText(String(i / 10), 66, y + 9); } }(gc.getContext('2d')));
    var grad = new R.Mesh(new R.PlaneGeometry(0.024, 0.3 + 0.0235), new R.MeshBasicMaterial({ map: new R.Tex(gc), transparent: true, toneMapped: false, depthWrite: false })); grad.position.set(0, Y0 - 0.15 + 0.0000, 0.0089); grad.position.y = (Y0 + 0.0097 + (Y0 - 0.3 - 0.0097)) / 2 - 0.0; bur.add(grad);
    var robCorps = cyl(0.007, 0.007, 0.03, ptfe); robCorps.rotation.x = Math.PI / 2; robCorps.position.y = 0.2; bur.add(robCorps);
    var poignee = new R.Group(); poignee.position.set(0, 0.2, 0.016); var pb = new R.Mesh(new R.RoundedBoxGeometry(0.034, 0.007, 0.006, 4, 0.002), ptfe); poignee.add(pb); bur.add(poignee);
    var pointe = cyl(0.003, 0.0012, 0.02, verre); pointe.position.y = 0.19; bur.add(pointe);
    var entonnoir = cyl(0.022, 0.005, 0.034, verre, true); entonnoir.position.y = 0.617; bur.add(entonnoir);
    var jetB = cyl(0.0015, 0.0015, 1, MS({ color: 0xcfe7f3, roughness: 0.1 })); jetB.visible = false; bur.add(jetB);
    bur.position.x = XB;
    // erlenmeyer
    var fl = new R.Group(); G.add(fl);
    var prof = [[0.0, 0], [0.05, 0], [0.052, 0.004], [0.0135, 0.115], [0.0135, 0.14], [0.0165, 0.145]].map(function (p) { return new R.Vector2(p[0], p[1]); });
    var flacon = new R.Mesh(new R.LatheGeometry(prof, 48), verre); flacon.castShadow = true; fl.add(flacon);
    var liqF = new R.Mesh(new R.CylinderGeometry(0.03, 0.049, 0.02, 32), MS({ color: 0xe6f1f7, roughness: 0.08, transparent: true, opacity: 0.92 })); fl.add(liqF);
    var tache = new R.Mesh(new R.CylinderGeometry(0.016, 0.016, 0.0008, 24), new R.MeshBasicMaterial({ color: 0xf0388f, transparent: true, opacity: 0, toneMapped: false, depthWrite: false })); fl.add(tache);
    var feuille = mesh(new R.PlaneGeometry(0.16, 0.14), MS({ color: 0xffffff, roughness: 0.9 })); feuille.rotation.x = -Math.PI / 2; feuille.position.set(0, -0.0013, 0); feuille.scale.set(0.9, 1, 1); feuille.castShadow = false; fl.add(feuille);
    // bécher de soude et d'acide
    function becher(x, couleur, t, s) { var g = new R.Group(), p = cyl(0.035, 0.035, 0.09, verre, true); p.position.y = 0.045; var f = cyl(0.035, 0.035, 0.003, verre); f.position.y = 0.0015; var l = cyl(0.0335, 0.0335, 0.055, MS({ color: couleur, roughness: 0.1, transparent: true, opacity: 0.95 })); l.position.y = 0.0315;
      var e = etiquette(t, s, 0.05, 0.034); e.position.set(0, 0.05, 0.0352); g.add(p, f, l, e); g.position.set(x, 0, 0); G.add(g); return g; }
    var bN = becher(XN, 0xe4f0f6, 'NaOH', '0,10 mol/L'), bA = becher(XA, 0xe9f2f4, 'HCl', 'Ca à déterminer');
    // pipette jaugée et propipette
    var pip = new R.Group(); G.add(pip);
    var pTube = cyl(0.0042, 0.0042, 0.34, verre, true); pTube.position.y = 0.17; pip.add(pTube);
    var pBulbe = new R.Mesh(new R.SphereGeometry(0.0115, 24, 16), verre); pBulbe.scale.set(1, 3.0, 1); pBulbe.position.y = 0.17; pip.add(pBulbe);
    var pPointe = cyl(0.0042, 0.0012, 0.03, verre); pPointe.position.y = 0.015; pip.add(pPointe);
    var YJ = 0.27, pTrait = new R.Mesh(new R.CylinderGeometry(0.0046, 0.0046, 0.0006, 16), MS({ color: 0x0D2149, roughness: 0.4 })); pTrait.position.y = YJ; pip.add(pTrait);
    var liqP = cyl(0.0034, 0.0034, 1, MS({ color: 0xdceef5, roughness: 0.1 })); pip.add(liqP);
    var poire = new R.Mesh(new R.SphereGeometry(0.016, 24, 16), rouge); poire.scale.set(1, 1.35, 1); poire.position.y = 0.37; pip.add(poire);
    var valves = ['A', 'S', 'E'].map(function (n, i) { var v = new R.Mesh(new R.SphereGeometry(0.0055, 12, 10), MS({ color: 0xe9e9e9, roughness: 0.4 })); v.position.set(0.017, 0.345 + i * 0.019, 0); pip.add(v); return v; });
    // compte-gouttes
    var dr = new R.Group(); G.add(dr);
    var dCorps = cyl(0.02, 0.02, 0.06, MS({ color: 0x5b3a1e, roughness: 0.4 })); dCorps.position.y = 0.03; var dBec = cyl(0.004, 0.012, 0.026, MS({ color: 0x20252b, roughness: 0.5 })); dBec.position.y = 0.075; var dTet = new R.Mesh(new R.SphereGeometry(0.011, 16, 12), rouge); dTet.position.y = 0.1; var dEt = etiquette('Phénolphtaléine', 'indicateur', 0.04, 0.024); dEt.position.set(0, 0.03, 0.0205); dr.add(dCorps, dBec, dTet, dEt);
    // évier, pissette, lunettes
    var evier = new R.Mesh(new R.RoundedBoxGeometry(0.16, 0.02, 0.14, 4, 0.004), MS({ color: 0x9aa3ad, metalness: 0.8, roughness: 0.35 })); evier.position.set(XS, 0.01, 0); G.add(evier);
    var pissette = cyl(0.016, 0.016, 0.1, MS({ color: 0xf4f6f8, roughness: 0.5 })); pissette.position.set(XS - 0.03, 0.05, 0.1); G.add(pissette);
    var lun = new R.Group(); [-0.022, 0.022].forEach(function (x) { var o = new R.Mesh(new R.TorusGeometry(0.02, 0.0035, 10, 28), MS({ color: 0x1a73d1, roughness: 0.3 })); o.position.set(x, 0.022, 0); o.rotation.x = Math.PI / 2; lun.add(o); }); lun.position.set(-0.46, 0.003, 0.11); G.add(lun);
    var halo = new R.Mesh(new R.CylinderGeometry(0.03, 0.03, 0.002, 28), new R.MeshBasicMaterial({ color: 0x1a73d1, transparent: true, opacity: 0.5, toneMapped: false })); halo.rotation.x = Math.PI / 2; halo.visible = false; G.add(halo);
    // gouttes
    var gMat = MS({ color: 0xcfe7f3, roughness: 0.1 }), gp = [];
    for (var i = 0; i < 4; i++) { var g1 = new R.Mesh(new R.SphereGeometry(0.0034, 12, 10), gMat); g1.visible = false; G.add(g1); gp.push({ m: g1, actif: false, y: 0, vy: 0, src: 'b' }); }
    // pH-mètre (mode avancé)
    var phc = document.createElement('canvas'); phc.width = 160; phc.height = 80; var pht = new R.Tex(phc);
    var phBox = new R.Mesh(new R.RoundedBoxGeometry(0.1, 0.07, 0.06, 4, 0.004), MS({ color: 0x20252b, roughness: 0.5 })); phBox.position.set(0.18, 0.035, 0.11); G.add(phBox);
    var phEcr = new R.Mesh(new R.PlaneGeometry(0.08, 0.04), new R.MeshBasicMaterial({ map: pht, toneMapped: false })); phEcr.position.set(0.18, 0.04, 0.0305 + 0.11); G.add(phEcr);
    var phSonde = cyl(0.003, 0.003, 0.2, MS({ color: 0x20252b })); G.add(phSonde);

    // ------------------------------------------------------------ physique manuelle (état -> grandeurs)
    function lecture() { return 25 - S.vol; }
    function serieReelle() { return { ca: S.serie.ca, cb: S.serie.cb, va: Math.max(0.001, S.fl.vA) }; }
    function phMoyen() { return D.ph(serieReelle(), Math.max(0, S.fl.vB - D.decalage(S.nGoutteI))); }
    function phReel() { return D.ph(serieReelle(), S.fl.vB); }
    function veReel() { return S.serie.ca * Math.max(0.001, S.fl.vA) / S.serie.cb; }
    function signaler(c) { if (!S.errSet[c]) { S.errSet[c] = true; S.erreurs.push(c); } }
    function sousFlacon() { return Math.abs(S.fl.x - XB) < 0.012; }
    function pointeBur() { return { x: XB, y: 0.18 }; }
    function pointePip() { return { x: S.pi.x, y: S.pi.y }; }
    function pipDansAcide() { return Math.abs(S.pi.x - XA) < 0.028 && S.pi.y < 0.07; }
    function pipDansFlacon() { return Math.abs(S.pi.x - S.fl.x) < 0.02 && S.pi.y < 0.19 && S.pi.y > 0.0; }
    function drDessusFlacon() { return Math.abs(S.dr.x - S.fl.x) < 0.03 && S.dr.y > 0.12 && S.dr.y < 0.3; }
    function nbSurEntonnoir() { return Math.abs(S.nb.x - XB) < 0.07 && S.nb.y > 0.5; }
    function nbSurEvier() { return Math.abs(S.nb.x - XS) < 0.09; }

    function verser(dv, hors) {   // sortie de la burette : une bulle d'air absorbe d'abord son volume
      if (dv <= 0 || S.vol <= 0) return 0;
      dv = Math.min(dv, S.vol); S.vol -= dv; S.dispense += dv;
      if (S.bulle) { var ab = Math.min(S.trou === 0 ? 0.3 : 0.3 - S.trou, dv); S.trou += ab; dv -= ab; if (S.trou >= 0.3) S.bulle = false; }
      if (hors || !sousFlacon() || S.fl.vA <= 0) { S.perdu += dv; if (dv > 0.005) signaler('goutte_hors_erlenmeyer'); return dv; }
      S.fl.vB += dv; S.verse += dv; if (S.zero === null) S.zero = 25 - (S.vol + S.dispense); return dv;
    }
    function ecartJaugeMm() { return (S.pi.niv - 1) * 100; }

    // ------------------------------------------------------------ assistant : réagit à l'état, 3 indices au plus, jamais la réponse
    function etape() {
      var e = 1; if (!S.pince) return 1; e = 2; if (!(S.remplie && !S.bulle && Math.abs(lecture()) < 0.3)) return 2;
      e = 3; if (S.fl.vA <= 0) return 3; e = 4; if (S.nGoutteI === 0) return 4; e = 5; if (!sousFlacon() || S.dispense < 0.5) return 5; if (!S.ferme && S.u > 0.02) return 6;
      if (S.cahier.lu === undefined) return 7; if (S.cahier.ca === undefined) return 8; return S.vide && S.rince ? 9 : 9;
    }
    function assistant() {
      var h = function () { var a = arguments; S.max = a.length; var i = Math.min(S.indice, a.length - 1); return { texte: a[i], plus: i < a.length - 1 }; }, ve = veReel(), vb = S.fl.vB, t = performance.now();
      if (!S.lunettes && !S.pince) return h('Avant de commencer : un équipement de protection est obligatoire avec la soude.', 'Regarde sur la paillasse, à gauche.', 'Touche les lunettes pour les mettre.');
      if (!S.pince) return h('La burette doit tenir seule sur le support.', 'Observe la pince et sa molette.', 'Fais glisser la molette pour serrer la pince.');
      if (!S.remplie) return h('La burette est vide.', 'Le bécher d\'étiquette NaOH contient ce qu\'il faut. Un entonnoir est posé en haut.', 'Soulève le bécher de soude au-dessus de l\'entonnoir, puis incline-le en tirant vers le haut.');
      if (S.bulle) return h('Observe la pointe de la burette.', 'Un défaut est visible sous le robinet.', 'Ouvre brièvement le robinet pour le chasser, puis referme.');
      if (Math.abs(lecture()) > 0.15 && S.fl.vA <= 0) return h('Où se trouve le bas du ménisque par rapport au zéro ?', 'Ajuste le niveau en ouvrant le robinet goutte à goutte, au-dessus d\'un récipient.', 'Descends le niveau jusqu\'au trait 0, puis referme.');
      if (S.fl.vA <= 0) return h('Il faut un volume précis d\'acide dans l\'erlenmeyer.', 'Utilise la pipette jaugée avec la poire : appuie sur A, puis S, puis ajuste avec E.', 'Amène le bas du ménisque exactement sur le trait de jauge, puis touche la pipette au-dessus de l\'erlenmeyer pour la vider.');
      if (S.nGoutteI === 0) return h('L\'acide seul est incolore. Il manque un indicateur coloré.', 'Utilise le flacon compte-gouttes.', 'Place-le au-dessus de l\'erlenmeyer et touche-le pour faire tomber 2 à 3 gouttes.');
      if (!sousFlacon()) return h('La pointe de la burette doit être au-dessus de l\'erlenmeyer.', 'Fais glisser l\'erlenmeyer sur la feuille.', 'Centre-le sous la pointe.');
      if (S.u > 0.3 && vb > ve - 2 && vb < ve + 2) return { texte: 'Tu verses trop vite pour la zone où tu es. Ralentis.', plus: false };
      if (S.u > 0.02 && (t - S.tAgit) > 10000 && S.verse > 0.2) return { texte: 'Tu n\'as pas agité depuis 10 secondes.', plus: false };
      if (S.fl.tint < 0.05 && S.fl.spot > 0.2) return { texte: 'Une tache colorée apparaît puis disparaît. Observe ce qui se passe quand tu agites.', plus: false };
      if (S.fl.tint > 0.1 && S.u > 0.02) return { texte: 'La couleur persiste. Réfléchis : que dois-tu faire du robinet maintenant ?', plus: false };
      if (S.verse > 1 && S.u < 0.02 && S.cahier.lu === undefined) return h('Pour lire un volume, l\'oeil doit être à la hauteur du ménisque.', 'Utilise le bouton « Zoom lecture ».', 'Lis le bas du ménisque et note la valeur dans le cahier.');
      return { texte: 'Continue : ' + (S.u > 0.02 ? 'observe la couleur et agite.' : 'verse avec précision, observe, note.'), plus: false };
    }

    // ------------------------------------------------------------ pointeur
    var el = T.renderer.domElement, v3 = new R.V3();
    function q(e) { var r = el.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top, w: r.width, h: r.height }; }
    function pr(p) { var s = q({ clientX: 0, clientY: 0 }); v3.set(p[0], p[1], p[2]); v3.project(camera); return { x: (v3.x + 1) / 2 * s.w, y: (1 - v3.y) / 2 * s.h }; }
    function planZ(e) { var s = q(e), nx = s.x / s.w * 2 - 1, ny = -(s.y / s.h * 2 - 1), a = camera.position.clone(), b = new R.V3(nx, ny, 0.5).unproject(camera), d = b.sub(a); if (Math.abs(d.z) < 1e-6) return null; var t = -a.z / d.z; return { x: a.x + d.x * t, y: a.y + d.y * t }; }
    var HS = [
      { id: 'lunettes', nom: 'Lunettes', kind: 'tap', pos: function () { return [-0.46, 0.03, 0.11]; }, vis: function () { return !S.lunettes; }, tap: function () { S.lunettes = true; lun.position.set(-0.46, 0.003, 0.11); } },
      { id: 'molette', nom: 'Molette de la pince', kind: 'drag', pos: function () { return [0.12, 0.46, 0.02]; }, vis: function () { return true; }, drag: function (dx) { if (dx > 20 && !S.pince) { S.pince = true; } if (dx < -20 && S.pince && S.vol === 0) S.pince = false; } },
      { id: 'robinet', nom: 'Robinet', kind: 'drag', pos: function () { return [XB, 0.2, 0.02]; }, vis: function () { return true; }, t0: function () { return S.u; }, drag: function (dx, dy, t0) { S.u = cl(t0 + (dx - dy) / 150, 0, 1); S.ferme = S.u < 0.02; if (S.u > 0.02) S.debutDosage = true; } },
      { id: 'agiter', nom: 'Agiter (cercles)', kind: 'swirl', pos: function () { return [S.fl.x, 0.15, 0]; }, vis: function () { return S.fl.vA > 0; } },
      { id: 'valA', nom: 'Valve A', kind: 'hold', pos: function () { var p = pip.position; return [S.pi.x + 0.017, S.pi.y + 0.345, 0]; }, vis: function () { return true; }, down: function () { S.pi.tubeA = true; S.pi.pressA = true; } },
      { id: 'valS', nom: 'Valve S (aspirer)', kind: 'hold', pos: function () { return [S.pi.x + 0.017, S.pi.y + 0.364, 0]; }, vis: function () { return true; }, hold: function (dt) { if (S.pi.tubeA && pipDansAcide()) { S.pi.niv = Math.min(1.22, S.pi.niv + 0.28 * dt); } } },
      { id: 'valE', nom: 'Valve E (ajuster)', kind: 'hold', pos: function () { return [S.pi.x + 0.017, S.pi.y + 0.383, 0]; }, vis: function () { return true; }, hold: function (dt) { if (S.pi.niv > 0.01) S.pi.niv = Math.max(0, S.pi.niv - 0.012 * dt * 6); } }
    ];
    var MV = [   // objets déplaçables dans le plan de la scène
      { id: 'flacon', nom: 'Erlenmeyer', pos: function () { return [S.fl.x, 0.06, 0]; }, get: function () { return S.fl; }, ctr: function (p) { return { x: cl(p.x, -0.45, 0.4), y: YF }; } },
      { id: 'becherN', nom: 'Bécher de soude', pos: function () { return [S.nb.x, S.nb.y + 0.045, 0]; }, get: function () { return S.nb; }, ctr: function (p) { return { x: cl(p.x, -0.45, 0.45), y: cl(p.y - 0.045, 0, 0.72) }; } },
      { id: 'pipette', nom: 'Pipette jaugée', pos: function () { return [S.pi.x, S.pi.y + 0.12, 0]; }, get: function () { return S.pi; }, ctr: function (p) { return { x: cl(p.x, -0.45, 0.45), y: cl(p.y - 0.12, 0.0, 0.4) }; } },
      { id: 'compte', nom: 'Compte-gouttes', pos: function () { return [S.dr.x, S.dr.y + 0.04, 0]; }, get: function () { return S.dr; }, ctr: function (p) { return { x: cl(p.x, -0.45, 0.45), y: cl(p.y - 0.04, 0.0, 0.4) }; } }
    ];
    var depart = null, hover = null, drag = null;
    function trouver(e) {
      var s = q(e), best = null, bd = 34;
      HS.forEach(function (h) { if (!h.vis()) return; var p = pr(h.pos()), d = Math.hypot(p.x - s.x, p.y - s.y); if (d < bd - (h.kind === 'hold' ? 6 : 0)) { bd = d; best = h; } });
      MV.forEach(function (m) { var p = pr(m.pos()), d = Math.hypot(p.x - s.x, p.y - s.y) + 4; if (d < bd) { bd = d; best = m; } });
      return best;
    }
    hote.addEventListener('pointerdown', function (e) {
      var h = trouver(e); if (!h) return; e.stopPropagation(); controls.enabled = false; drag = h; var s = q(e), w = planZ(e);
      depart = { x: s.x, y: s.y, bouge: false, t0: h.t0 ? h.t0() : 0, th: null, cx: pr(h.pos()).x, cy: pr(h.pos()).y, ox: 0, oy: 0, sy: s.y, tilt0: 0 };
      if (h.get && w) { var o = h.get(); depart.ox = o.x - w.x; depart.oy = (o.y || 0) - w.y; depart.px = s.x; }
      if (h.down) h.down(); try { hote.setPointerCapture(e.pointerId); } catch (_) { } sale = true; T.dirty();
    }, true);
    window.addEventListener('pointermove', function (e) {
      var s = q(e);
      if (drag) {
        var dx = s.x - depart.x, dy = s.y - depart.y; if (Math.hypot(dx, dy) > 6) depart.bouge = true;
        if (drag.kind === 'drag') drag.drag(dx, dy, depart.t0);
        else if (drag.kind === 'swirl') { var th = Math.atan2(s.y - depart.cy, s.x - depart.cx); if (depart.th !== null) { var d = th - depart.th; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; S.fl.agit = Math.min(1, S.fl.agit + Math.abs(d) * 0.9); } depart.th = th; }
        else if (drag.get) {
          var w = planZ(e); if (w) { var c = drag.ctr({ x: w.x + depart.ox, y: w.y + depart.oy }), o = drag.get();
            if (drag.id === 'becherN') {   // sur l'entonnoir ou l'évier, tirer vers le haut incline le bécher
              var nearF = Math.abs(c.x - XB) < 0.07 && c.y > 0.5, nearS = false;
              if (nearF) { if (depart.lock === undefined) depart.lock = s.y; c.x = XB - 0.05; c.y = Math.max(c.y, 0.63); S.nb.tilt = cl((depart.lock - s.y) / 90, 0, 1); } else { depart.lock = undefined; S.nb.tilt = 0; }
            }
            if (drag.id === 'flacon' && Math.abs(c.x - XS) < 0.08) { if (depart.lock === undefined) depart.lock = s.y; S.fl.tilt = cl((depart.lock - s.y) / 90, 0, 1); } else if (drag.id === 'flacon') { depart.lock = undefined; S.fl.tilt = 0; }
            o.x = c.x; o.y = c.y; }
        }
        sale = true; return;
      }
      if (!hote.contains(e.target)) return; var k = trouver(e); if (k !== hover) { hover = k; el.style.cursor = k ? 'pointer' : ''; sale = true; T.dirty(); }
    });
    function fin() {
      if (!drag) return; var h = drag; drag = null; controls.enabled = true;
      if (h.kind === 'tap' && !depart.bouge) h.tap();
      if (h.id === 'pipette' && !depart.bouge && pipDansFlacon() && S.pi.niv > 0.05) S.pi.vidage = true;
      if (h.id === 'compte' && !depart.bouge && drDessusFlacon()) goutteIndic();
      if (h.id === 'becherN') { S.nb.tilt = 0; S.nb.y = 0; if (Math.abs(S.nb.x - XB) < 0.1) S.nb.x = XB - 0.12; }
      if (h.id === 'flacon') { S.fl.tilt = 0; }
      if (h.id === 'valA') S.pi.pressA = false;
      sale = true; T.dirty();
    }
    window.addEventListener('pointerup', fin); window.addEventListener('pointercancel', fin);
    function goutteIndic() { S.nGoutteI++; var g = gp.filter(function (x) { return !x.actif; })[0]; if (g) { g.actif = true; g.y = 0.2; g.vy = 0; g.src = 'i'; g.m.material = MS({ color: 0xe8d4c0 }); g.m.position.set(S.fl.x, 0.2, 0); } }

    // ------------------------------------------------------------ caméra : vues préréglées (0,6 s)
    var EN = { p: [0.02, 0.34, 0.98], t: [0.01, 0.26, 0] };
    function vue(n) {
      var to = EN, ym = Y0 - PAR_ML * lecture();
      if (n === 'burette') to = { p: [0.04, 0.4, 0.45], t: [0, 0.38, 0] };
      else if (n === 'erlen') to = { p: [S.fl.x - 0.02, 0.12, 0.34], t: [S.fl.x, 0.07, 0] };
      else if (n === 'paillasse') to = { p: [0.0, 0.7, 1.15], t: [0.0, 0.05, 0] };
      else if (n === 'lecture') to = { p: [0.0, ym, 0.22], t: [0, ym, 0] };
      else if (n === 'pipette') to = { p: [S.pi.x - 0.02, S.pi.y + 0.27, 0.3], t: [S.pi.x, S.pi.y + 0.27, 0] };
      cam = { t0: performance.now(), p0: camera.position.clone(), g0: controls.target.clone(), p1: new R.V3(to.p[0], to.p[1], to.p[2]), g1: new R.V3(to.t[0], to.t[1], to.t[2]) }; S.vueNom = n; sale = true; T.dirty();
    }
    camera.position.set(EN.p[0], EN.p[1], EN.p[2]); controls.target.set(EN.t[0], EN.t[1], EN.t[2]); controls.update();

    // ------------------------------------------------------------ mise à jour de la scène depuis l'état
    function niveauFlacon(h) { liqF.geometry.dispose(); var r = function (y) { return 0.052 - (y - 0.004) * 0.0385 / 0.111; }; liqF.geometry = new R.CylinderGeometry(Math.max(0.0135, r(h)), 0.0495, Math.max(0.001, h), 32); liqF.position.y = 0.003 + h / 2; S.hSurf = 0.003 + h; }
    var hAff = -1;
    function majScene(dt) {
      var L = lecture(), yl = Y0 - PAR_ML * L; liqB.visible = S.vol > 0.001; var haut = Math.max(0.001, yl - 0.2); liqB.scale.y = haut; liqB.position.y = 0.2 + haut / 2; mniB.position.y = yl - 0.0006; mniB.visible = liqB.visible;
      poignee.rotation.z = S.u * Math.PI / 2; molette.rotation.y = S.pince ? 1.4 : 0; bur.position.x = XB;
      jetB.visible = S.u > 0.3 && S.vol > 0 && sousFlacon() === true || (S.u > 0.3 && S.vol > 0); if (jetB.visible) { var top = 0.18, bas = S.fl.vA > 0 ? YF + (S.hSurf || 0.02) : 0.03; jetB.scale.y = Math.max(0.01, top - bas); jetB.position.y = bas + (top - bas) / 2; jetB.material.opacity = 1; }
      // flacon
      var h = 0.0035 + 0.00085 * (S.fl.vA + S.fl.vB); if (Math.abs(h - hAff) > 0.0003) { niveauFlacon(S.fl.vA + S.fl.vB > 0 ? h : 0.001); hAff = h; } liqF.visible = S.fl.vA + S.fl.vB > 0.01;
      var ph = S.nGoutteI > 0 ? D.rose(phMoyen()) : 0, tt = Math.max(S.fl.tint, 0); var c1 = [0.9, 0.95, 0.97], c2 = [0.93, 0.2, 0.55], k = S.nGoutteI > 0 ? Math.min(1, tt) : 0;
      var cr = c1[0] + (c2[0] - c1[0]) * k, cg = c1[1] + (c2[1] - c1[1]) * k, cbb = c1[2] + (c2[2] - c1[2]) * k; liqF.material.color.setRGB(cr, cg, cbb); liqF.material.emissive.setRGB(cr * 0.55, cg * 0.55, cbb * 0.55);
      tache.position.set(0, S.hSurf || 0.02, 0); tache.visible = S.fl.spot > 0.02; tache.material.opacity = Math.min(0.85, S.fl.spot);
      var ag = S.fl.agit, ph2 = performance.now() / 85; fl.position.set(S.fl.x + Math.cos(ph2) * 0.012 * ag, YF, Math.sin(ph2) * 0.012 * ag); fl.rotation.z = -S.fl.tilt * 1.3; fl.rotation.x = 0;
      bN.position.set(S.nb.x, S.nb.y, 0); bN.rotation.z = -S.nb.tilt * 1.25; pip.position.set(S.pi.x, S.pi.y, 0); dr.position.set(S.dr.x, S.dr.y, 0);
      var nivH = Math.min(1.22, S.pi.niv) * (YJ - 0.01), lh = Math.max(0.0005, nivH); liqP.scale.y = lh; liqP.position.y = 0.01 + lh / 2; liqP.visible = S.pi.niv > 0.005;
      pBulbe.visible = true; poire.scale.y = S.pi.pressA ? 1.05 : 1.35; poire.position.y = S.pi.pressA ? 0.36 : 0.37;
      var hov = hover || drag; if (hov && hov.pos) { halo.visible = true; var p = hov.pos(); halo.position.set(p[0], p[1], p[2] + 0.02); } else halo.visible = false;
      // pH-mètre
      phBox.visible = phEcr.visible = phSonde.visible = S.ph;
      if (S.ph) { var g = phc.getContext('2d'); g.fillStyle = '#b9c9a8'; g.fillRect(0, 0, 160, 80); g.fillStyle = '#1c2b17'; g.font = 'bold 40px ui-monospace,monospace'; g.textAlign = 'center'; g.fillText(S.fl.vA > 0 ? fr(phReel(), 2) : '--', 80, 55); pht.needsUpdate = true; phSonde.position.set(S.fl.x + 0.02, 0.09, 0); phSonde.rotation.z = 0.15; }
    }

    // ------------------------------------------------------------ boucle : physique, gouttes, couleurs
    window.__tick = function () {
      var now = performance.now(), dt = Math.min(0.05, (now - dernier) / 1000); dernier = now; var b = false;
      if (cam) { var u = Math.min(1, (now - cam.t0) / 600), e = u * u * (3 - 2 * u); camera.position.lerpVectors(cam.p0, cam.p1, e); controls.target.lerpVectors(cam.g0, cam.g1, e); controls.update(); if (u >= 1) cam = null; b = true; }
      // maintien des valves
      if (drag && drag.kind === 'hold' && drag.hold) { drag.hold(dt); b = true; }
      // agitation
      if (drag && drag.kind === 'swirl') { if (S.fl.agit > 0.25) S.tAgit = now; S.fl.agit = Math.max(0, S.fl.agit - dt * 0.8); } else S.fl.agit = Math.max(0, S.fl.agit - dt * 1.5);
      // versement de la soude dans la burette
      if (S.nb.tilt > 0.45 && nbSurEntonnoir()) { if (!S.lunettes) { cb.alerte('La soude peut abîmer les yeux. Mets d\'abord tes lunettes.'); signaler('lunettes_oubliees'); } else { cb.alerte(null); if (!S.pince) signaler('pince_non_serree'); var dv = 7 * (S.nb.tilt - 0.4) * dt; if (S.vol < 28) { if (!S.remplie && S.vol === 0) { S.bulle = true; S.trou = 0; } S.vol += dv; S.remplie = true; b = true; } } }
      // écoulement du robinet
      if (S.u > 0.02 && S.vol > 0) {
        var u2 = S.u; b = true;
        if (u2 > 0.3 || S.u > 0.18) { var dv2 = (u2 > 0.65 ? 4.0 : 0.25 + (u2 - 0.18) * 3.2) * dt; var cap = (u2 > 0.3); if (cap) { verser(dv2); S.tVerse = now; if (S.fl.vA > 0 && S.fl.vB > veReel() - 1.5 && S.fl.vB < veReel() + 0.3 && u2 > 0.3) signaler('debit_trop_rapide'); } }
        if (u2 <= 0.3) { S.prochain -= dt * (0.9 + u2 * 4); if (S.prochain <= 0) { S.prochain = 1; var gg = gp.filter(function (x) { return !x.actif; })[0]; if (gg) { gg.actif = true; gg.src = 'b'; gg.y = 0.18; gg.vy = 0; gg.m.material = gMat; gg.m.position.set(XB, 0.18, 0); } } }
      }
      // gouttes
      gp.forEach(function (g) { if (!g.actif) { g.m.visible = false; return; } g.vy += 2.4 * dt; g.y -= g.vy * dt; g.m.visible = true; g.m.position.y = g.y; b = true;
        var surf = S.fl.vA > 0 ? YF + (S.hSurf || 0.02) : 0.03; if (g.src === 'i') { g.m.position.x = S.fl.x; surf = YF + (S.hSurf || 0.02); }
        if (g.y < surf) { g.actif = false; g.m.visible = false; if (g.src === 'b') { var dv3 = D.goutte(Math.random() * 2 - 1); if (verser(dv3) >= 0) { if (sousFlacon() && S.fl.vA > 0) { var vbE = Math.max(0, S.fl.vB - D.decalage(S.nGoutteI)); S.fl.spot = Math.max(S.fl.spot, D.rose(D.ph({ ca: S.serie.ca, cb: S.serie.cb, va: S.fl.vA }, vbE + 0.5))); } } } } });
      // pipette : vidage dans l'erlenmeyer (la dernière goutte reste dans la pointe)
      if (S.pi.vidage && pipDansFlacon()) { var reste = 0.012; if (S.pi.niv > reste) { var dn = Math.min(S.pi.niv - reste, 0.35 * dt); S.pi.niv -= dn; var vtot = D.pipette(S.serie.va, ecartJaugeMm0()) ; S.fl.vA += vtot * dn / (S.pi.niv0 || 1); b = true; } else { S.pi.vidage = false; if (!S.pi.compte) { S.pi.compte = true; if (Math.abs(S.pi.ecart0) > 3) signaler('erreur_volume_acide'); } } }
      else if (S.pi.vidage) S.pi.vidage = false;
      if (S.pi.vidage && !S.pi.niv0) { S.pi.niv0 = S.pi.niv; S.pi.ecart0 = ecartJaugeMm(); }
      // vidage de l'erlenmeyer dans l'évier
      if (S.fl.tilt > 0.5 && Math.abs(S.fl.x - XS) < 0.08 && (S.fl.vA + S.fl.vB) > 0) { var f = Math.min(1, 25 * dt / Math.max(0.001, S.fl.vA + S.fl.vB)); S.fl.vA -= S.fl.vA * f; S.fl.vB -= S.fl.vB * f; if (S.fl.vA + S.fl.vB < 0.1) { S.fl.vA = S.fl.vB = 0; S.vide = true; S.fl.tint = 0; S.fl.spot = 0; } b = true; }
      // mélange : la couleur moyenne suit le pH moyen, vite si l'on agite, lentement sinon
      var cible = S.nGoutteI > 0 && S.fl.vA > 0 ? D.rose(phMoyen()) : 0, tau = S.fl.agit > 0.2 ? 1.2 : 40; S.fl.tint += (cible - S.fl.tint) * (1 - Math.exp(-dt / tau)); if (S.fl.tint < 0.002 && cible === 0) S.fl.tint = 0;
      S.fl.spot = D.tache(S.fl.spot, dt, S.fl.agit); if (S.fl.spot < 0.01) S.fl.spot = 0;
      if (S.fl.spot > 0.01 || S.fl.agit > 0.01 || Math.abs(cible - S.fl.tint) > 0.002) b = true;
      majScene(dt);
      var cle = [etape(), S.pince, S.remplie, S.bulle, S.fl.vA > 0, S.nGoutteI > 0, sousFlacon(), S.u > 0.3, S.fl.tint > 0.1, S.cahier.lu !== undefined].join('|'); if (cle !== S.cle) { S.cle = cle; S.indice = 0; }
      if (now - (S.dernierAssist || 0) > 400) { S.dernierAssist = now; var a = assistant(); cb.assistant(a.texte, !!a.plus); cb.etape(etape()); }
      majTags(); var r = sale || b; sale = false; return r;
    };
    function ecartJaugeMm0() { return S.pi.ecart0 || 0; }
    function majTags() {
      var z = tagsEl; HS.concat(MV).forEach(function (h) { var d = h.tg; if (!d) { d = h.tg = document.createElement('div'); d.className = 'tag-g'; z.appendChild(d); } var ok = h.vis ? h.vis() : true; d.hidden = !ok; if (!ok) return;
        var p = pr(h.pos()), act = (hover === h || drag === h); d.style.left = p.x + 'px'; d.style.top = (act ? p.y - 22 : p.y) + 'px'; d.textContent = h.nom; d.className = 'tag-g' + (act ? ' act' : ''); });
    }

    // ------------------------------------------------------------ cahier, calcul, courbe, bilan (saisis par l'élève)
    function nouveauChamp(lbl, id, ph) { var i = document.createElement('input'); i.type = 'text'; i.setAttribute('inputmode', 'decimal'); i.placeholder = ph || ''; i.setAttribute('aria-label', lbl); i.addEventListener('change', function () { S.cahier[id] = i.value === '' ? undefined : i.value; if (id === 'lu') { S.cahier.hLecture = (camera.position.y - (Y0 - PAR_ML * lecture())) * 100; } }); var d = document.createElement('div'); d.className = 'ligne'; var l = document.createElement('label'); var s = document.createElement('span'); s.textContent = lbl; l.appendChild(s); d.appendChild(l); d.appendChild(i); zone.appendChild(d); return i; }
    function bouton(t, f, cls) { var b = document.createElement('button'); b.type = 'button'; b.className = 'btn' + (cls ? ' ' + cls : ''); b.textContent = t; b.addEventListener('click', f); return b; }
    var barre = document.createElement('div'); barre.className = 'seg'; [['burette', 'Burette'], ['erlen', 'Erlenmeyer'], ['paillasse', 'Paillasse'], ['lecture', 'Zoom lecture'], ['pipette', 'Pipette']].forEach(function (a) { barre.appendChild(bouton(a[1], function () { vue(a[0]); })); });
    var r1 = document.createElement('div'); r1.className = 'ligne'; r1.appendChild(barre); zone.appendChild(r1);
    var rEns = document.createElement('div'); rEns.className = 'ligne rangee'; rEns.appendChild(bouton('Vue d\'ensemble', function () { vue('ensemble'); })); var bph = bouton('pH-mètre : éteint', function () { S.ph = !S.ph; bph.textContent = 'pH-mètre : ' + (S.ph ? 'allumé' : 'éteint'); bph.className = 'btn' + (S.ph ? ' on' : ''); }); rEns.appendChild(bph); zone.appendChild(rEns);
    var tt = document.createElement('h2'); tt.className = 'etiq'; tt.textContent = 'Cahier de laboratoire'; zone.appendChild(tt);
    nouveauChamp('Volume lu à la burette (mL)', 'lu', 'ex. 12,35'); nouveauChamp('Volume équivalent retenu (mL)', 've', ''); nouveauChamp('Volume d\'acide Va (mL)', 'va', ''); nouveauChamp('Concentration de la soude Cb (mol/L)', 'cb', '');
    var rf = document.createElement('div'); rf.className = 'ligne'; var lf = document.createElement('label'); lf.innerHTML = '<span>Relation à l\'équivalence</span>'; rf.appendChild(lf); var sel = document.createElement('select'); ['Choisir une formule', 'Ca x Va = Cb x Vb', 'Ca x Cb = Va x Vb', 'Ca / Va = Cb / Vb', 'Ca + Va = Cb + Vb'].forEach(function (t2) { var o = document.createElement('option'); o.textContent = t2; sel.appendChild(o); }); sel.addEventListener('change', function () { S.cahier.formule = sel.value; }); rf.appendChild(sel); zone.appendChild(rf);
    nouveauChamp('Ca calculée (mol/L)', 'ca', ''); 
    var obs = document.createElement('textarea'); obs.rows = 2; obs.placeholder = 'Observations'; obs.setAttribute('aria-label', 'Observations'); obs.style.cssText = 'width:100%;border:1px solid #DDE6E9;border-radius:12px;padding:10px;font:inherit'; zone.appendChild(obs);
    var graphe = document.createElement('canvas'); graphe.width = 340; graphe.height = 200; graphe.className = 'graphe';
    var rp = document.createElement('div'); rp.className = 'ligne'; rp.appendChild(bouton('Noter un point (V, pH) sur la courbe', function () { if (!S.ph || S.fl.vA <= 0) return; S.pts.push([S.fl.vB, phReel()]); dessine(); })); zone.appendChild(rp); zone.appendChild(graphe);
    function dessine() { var c = graphe.getContext('2d'), W = 340, H = 200; c.fillStyle = '#fff'; c.fillRect(0, 0, W, H); c.strokeStyle = '#DDE6E9'; c.fillStyle = '#51607A'; c.font = '10px system-ui'; for (var k = 0; k <= 14; k += 7) { var y = H - 24 - k / 14 * (H - 40); c.beginPath(); c.moveTo(34, y); c.lineTo(W - 8, y); c.stroke(); c.fillText(k, 10, y + 3); }
      var vmax = 25; c.fillText('V (mL)', W - 44, H - 6); for (var m = 0; m <= 25; m += 5) c.fillText(m, 34 + m / vmax * (W - 44) - 4, H - 10); c.fillStyle = '#0E4D5C'; S.pts.forEach(function (p) { c.beginPath(); c.arc(34 + p[0] / vmax * (W - 44), H - 24 - Math.max(0, Math.min(14, p[1])) / 14 * (H - 40), 4, 0, 6.3); c.fill(); }); }
    dessine();

    function bilan() {
      var d = document.createElement('div'), t = (performance.now() - S.t0) / 1000;
      var lu = num(S.cahier.lu || ''), ca = num(S.cahier.ca || ''), ve = num(S.cahier.ve || ''), va = num(S.cahier.va || ''), cb = num(S.cahier.cb || '');
      var caVrai = S.serie.ca, pt = { zero: 10, jauge: 10, bulle: 10, indic: 5, ralenti: 10, arret: 15, lecture: 10, calcul: 20, rangement: 10 }, gagne = {};
      var zero = S.zero === null ? null : Math.abs(S.zero), over = S.fl.vB - veReel();
      if (zero !== null && zero > 0.15) signaler('zero_imprecis'); if (S.nGoutteI > 5) signaler('trop_indicateur'); if (over > 0.3) signaler('depassement_equivalence'); if (S.bulle || S.trou > 0 && S.trou < 0.3) signaler('bulle_air');
      if (lu !== null && Math.abs(lu - (S.verse + S.perdu + (S.trou ? 0 : 0))) > 0.3 && S.verse > 0) signaler('lecture_burette'); if (S.cahier.hLecture !== undefined && Math.abs(S.cahier.hLecture) > 2.5) signaler('lecture_burette');
      var caAttendu = (ve !== null && va && cb) ? cb * ve / va : (lu !== null ? S.serie.cb * lu / S.serie.va : null);
      if (ca === null || (caAttendu !== null && Math.abs(ca - caAttendu) / caAttendu > 0.03) || S.cahier.formule !== 'Ca x Va = Cb x Vb') signaler('calcul_concentration');
      if (!(S.vide && S.rince && S.ferme)) signaler('rangement');
      var E = S.errSet; gagne.zero = zero !== null && zero <= 0.15 ? 10 : 0; gagne.jauge = E.erreur_volume_acide ? 0 : (S.pi.compte ? 10 : 0); gagne.bulle = E.bulle_air ? 0 : (S.remplie ? 10 : 0); gagne.indic = E.trop_indicateur || S.nGoutteI === 0 ? 0 : 5;
      gagne.ralenti = E.debit_trop_rapide || S.dispense === 0 ? 0 : 10; gagne.arret = E.depassement_equivalence || S.verse < 1 ? 0 : 15; gagne.lecture = E.lecture_burette || lu === null ? 0 : 10; gagne.calcul = E.calcul_concentration ? 0 : 20; gagne.rangement = E.rangement ? 0 : 10;
      var total = 0; Object.keys(gagne).forEach(function (k) { total += gagne[k]; });
      function h(tag, txt, cls) { var n = document.createElement(tag); n.textContent = txt; if (cls) n.className = cls; d.appendChild(n); return n; }
      h('h3', 'Bilan de la séance'); var tb = document.createElement('table'), body = document.createElement('tbody'); tb.appendChild(body);
      function ligne(a, b2) { var tr = document.createElement('tr'), t1 = document.createElement('td'), t2 = document.createElement('td'); t1.textContent = a; t2.textContent = b2; tr.appendChild(t1); tr.appendChild(t2); body.appendChild(tr); }
      ligne('Volume lu noté', lu === null ? 'non renseigné' : fr(lu, 2) + ' mL'); ligne('Concentration calculée', ca === null ? 'non renseignée' : fr(ca, 3) + ' mol/L');
      ligne('Valeur de référence', fr(caVrai, 3) + ' mol/L'); if (ca !== null) ligne('Écart relatif', fr(Math.abs(ca - caVrai) / caVrai * 100, 1) + ' %'); ligne('Durée', fr(t / 60, 1) + ' min'); d.appendChild(tb);
      h('h3', 'Erreurs de manipulation'); if (!S.erreurs.length) h('p', 'Aucune erreur de manipulation signalée.', 'petit');
      S.erreurs.forEach(function (c) { var it = document.createElement('div'); it.className = 'item err'; var b3 = document.createElement('b'); b3.textContent = TITRE[c] || c; var p = document.createElement('div'); p.className = 'petit'; p.textContent = CAUSES[c] || ''; it.appendChild(b3); it.appendChild(p); d.appendChild(it); });
      h('h3', 'Score de manipulation : ' + total + ' / 100'); var t3 = document.createElement('table'), b4 = document.createElement('tbody'); t3.appendChild(b4); var noms = { zero: 'Zéro de la burette', jauge: 'Trait de jauge', bulle: 'Bulle d\'air', indic: 'Indicateur', ralenti: 'Ralentissement', arret: 'Arrêt au virage', lecture: 'Lecture du ménisque', calcul: 'Calcul', rangement: 'Rangement' };
      Object.keys(pt).forEach(function (k) { var tr = document.createElement('tr'), a = document.createElement('td'), c = document.createElement('td'); a.textContent = noms[k]; c.textContent = gagne[k] + ' / ' + pt[k]; tr.appendChild(a); tr.appendChild(c); b4.appendChild(tr); }); d.appendChild(t3);
      return { noeud: d, erreurs: S.erreurs.slice(), score: total };
    }
    // rinçage : toucher la pissette quand l'erlenmeyer est vidé
    HS.push({ id: 'pissette', nom: 'Pissette (rincer)', kind: 'tap', pos: function () { return [XS - 0.03, 0.1, 0.1]; }, vis: function () { return true; }, tap: function () { if (S.vide) S.rince = true; } });
    vue('ensemble');
    return { etat: S, vue: vue, bilan: bilan, indice: function () { if (S.indice < (S.max || 1) - 1) S.indice++; }, assistant: assistant,
      detruire: function () { window.__tick = null; scene.remove(G); tagsEl.textContent = ''; zone.textContent = ''; if (vieux) vieux.visible = true; controls.enabled = true; controls.minAzimuthAngle = sauve.az0; controls.maxAzimuthAngle = sauve.az1; controls.minDistance = sauve.mn; controls.maxDistance = sauve.mx; } };
  }
  window.DosageSpec = { creer: creer };
}());
