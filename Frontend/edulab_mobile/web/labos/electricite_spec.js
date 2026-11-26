// Électricité (4 labos) au niveau de la SPEC : l'élève monte lui-même le circuit en glissant chaque composant sur son
// emplacement, règle la tension au doigt, ferme K, choisit le calibre, lit le cadran et note. Les calculs viennent du
// moteur (labo_core) : ce fichier ne fait que placer, dessiner et relayer les gestes.
(function () {
  'use strict';
  function fr(x, d) { return (x === null || x === undefined || isNaN(x)) ? '' : x.toFixed(d === undefined ? 1 : d).replace('.', ','); }
  function cl(x, a, b) { return Math.max(a, Math.min(b, x)); }
  var CAUSES = {
    amperemetre_en_derivation: 'Un ampèremètre a une résistance très faible : en dérivation il court-circuite le dipôle et laisse passer un courant trop grand.',
    court_circuit_generateur: 'Relier directement les deux bornes du générateur donne un courant très intense qui échauffe les fils et peut détruire le générateur.',
    grand_calibre_oublie: 'On commence par le plus grand calibre : si le courant est plus fort que prévu, l\'aiguille et l\'appareil sont protégés.',
    calibre_trop_petit: 'Quand l\'aiguille dépasse l\'échelle le calibre est trop petit : la mesure est impossible et l\'appareil risque d\'être abîmé.',
    lecture_cadran: 'La mesure vaut C x l / D : une lecture ou un calibre faux donne une valeur fausse.',
    voltmetre_en_serie: 'Un voltmètre a une très grande résistance : placé en série il bloque presque tout le courant.',
    unite_mesure: 'La grandeur doit être donnée avec la bonne unité.'
  };
  var TITRE = { amperemetre_en_derivation: 'Ampèremètre en dérivation', court_circuit_generateur: 'Court-circuit du générateur', grand_calibre_oublie: 'Plus grand calibre oublié', calibre_trop_petit: 'Calibre trop petit', lecture_cadran: 'Lecture du cadran fausse', voltmetre_en_serie: 'Voltmètre en série', unite_mesure: 'Unité fausse' };
  var NOM = { alimentation: 'Alimentation', resistor_r1: 'Résistance R1', resistor_r2: 'Résistance R2', interrupteur_k: 'Interrupteur K', fils: 'Fils de connexion', amperemetre_aiguille: 'Ampèremètre à aiguille', amperemetre: 'Ampèremètre', multimetre: 'Multimètre', voltmetre_aiguille: 'Voltmètre à aiguille', voltmetre: 'Voltmètre' };
  var LIB = { serie: 'en série', derivation: 'en dérivation', circuit: 'dans le circuit', bornes_generateur: 'aux bornes du générateur', point_1: 'point 1', point_2: 'point 2', point_3: 'point 3', branche_principale: 'branche principale', branche_r1: 'branche de R1', branche_r2: 'branche de R2', bornes_r1: 'aux bornes de R1', bornes_r2: 'aux bornes de R2', bornes_k: 'aux bornes de K', point_p: 'point P (+)', point_a: 'point A' };
  var R1 = 100, R2 = 150, XP = -0.375, ZP = -0.10, ZN = 0.12, YF = 0.04;

  function creer(L3, hote, tagsEl, zone, API) {
    var T = L3.three, scene = T.scene, camera = T.camera, controls = T.controls, R = {};
    scene.traverse(function (o) { if (o.type === 'Mesh') R.Mesh = o.constructor; if (o.type === 'Group') R.Group = o.constructor; if (o.geometry) R[o.geometry.type] = o.geometry.constructor; if (o.material) { R[o.material.type] = o.material.constructor; if (o.material.map) R.Tex = o.material.map.constructor; } });
    R.V3 = camera.position.constructor;
    var vieux = T.cap(); if (vieux) vieux.visible = false;
    var G = new R.Group(); scene.add(G);
    var sv = { az0: controls.minAzimuthAngle, az1: controls.maxAzimuthAngle, mn: controls.minDistance, mx: controls.maxDistance };
    controls.minAzimuthAngle = -0.9; controls.maxAzimuthAngle = 0.9; controls.minDistance = 0.25; controls.maxDistance = 1.6;
    var lab = API.lab(), meta = API.meta(), opt = meta.options, S = { items: {}, tension: 0, glisse: null, vue: 'ensemble', indice: 0, cle: '', cahier: {} };
    var sale = true, cam = null, dernier = performance.now(), drag = null, hover = null, depart = null, ghosts = [];
    function MS(o) { return new R.MeshStandardMaterial(o); } function MB(c) { return new R.MeshBasicMaterial({ color: c, toneMapped: false }); }
    function add(o, g) { o.castShadow = true; o.receiveShadow = true; (g || G).add(o); return o; }
    function box(w, h, d, m, r) { return new R.Mesh(r ? new R.RoundedBoxGeometry(w, h, d, 4, r) : new R.BoxGeometry(w, h, d), m); }
    function cyl(a, b, h, m) { return new R.Mesh(new R.CylinderGeometry(a, b, h, 28), m); }
    function canvas(w, h, f) { var c = document.createElement('canvas'); c.width = w; c.height = h; var t = new R.Tex(c); t.anisotropy = 8; return { c: c, t: t, g: c.getContext('2d') }; }
    var noir = MS({ color: 0x20252b, roughness: 0.45, metalness: 0.3 }), gris = MS({ color: 0x2b3340, roughness: 0.5, metalness: 0.3 }), alu = MS({ color: 0xc9ced4, metalness: 0.9, roughness: 0.3 });
    var hasBox = !!R.BoxGeometry; if (!hasBox) { R.BoxGeometry = function (w, h, d) { return new R.RoundedBoxGeometry(w, h, d, 2, 0.0005); }; }

    // ------------------------------------------------------------ décor : plaque de montage, générateur
    var plaque = add(box(0.98, 0.02, 0.64, MS({ color: 0xf1f3f4, roughness: 0.75 }), 0.004)); plaque.position.set(0, 0.01, 0.0); plaque.castShadow = false; G.add(plaque);
    var gen = new R.Group(); G.add(gen); gen.position.set(-0.43, 0.02, 0.01);
    var genC = add(box(0.1, 0.07, 0.3, gris, 0.006), gen); genC.position.y = 0.035;
    var aff = canvas(200, 80); var affM = new R.Mesh(new R.PlaneGeometry(0.075, 0.03), new R.MeshBasicMaterial({ map: aff.t, toneMapped: false })); affM.rotation.x = -Math.PI / 2; affM.position.set(0, 0.0712, -0.07); gen.add(affM);
    var bGen = cyl(0.016, 0.018, 0.016, MS({ color: 0xd9dde2, metalness: 1, roughness: 0.25 })); bGen.position.set(0, 0.078, 0.06); gen.add(bGen);
    var rep = cyl(0.002, 0.002, 0.004, MS({ color: 0x111111 })); rep.position.set(0, 0.087, 0.045); bGen.add(rep); rep.position.set(0.0, 0.01, 0.012);
    var led = new R.Mesh(new R.SphereGeometry(0.006, 14, 10), MB(0x225522)); led.position.set(0.03, 0.075, 0.12); gen.add(led);
    var bp = new R.Mesh(new R.SphereGeometry(0.008, 14, 10), MS({ color: 0xd6342c, roughness: 0.4 })); bp.position.set(0.054, 0.04, ZP - 0.01); gen.add(bp);
    var bn = new R.Mesh(new R.SphereGeometry(0.008, 14, 10), MS({ color: 0x15181c, roughness: 0.4 })); bn.position.set(0.054, 0.04, ZN - 0.01); gen.add(bn);
    var ghostMat = MS({ color: 0x2b3340, transparent: true, opacity: 0.35 });

    // ------------------------------------------------------------ composants
    function bandes(cols) { var c = canvas(128, 32); c.g.fillStyle = '#d8c39a'; c.g.fillRect(0, 0, 128, 32); [28, 52, 76].forEach(function (x, i) { c.g.fillStyle = cols[i]; c.g.fillRect(x, 0, 10, 32); }); c.t.needsUpdate = true; return c.t; }
    function resistance(cols) { var g = new R.Group(), c = new R.Mesh(new R.CylinderGeometry(0.011, 0.011, 0.07, 24), MS({ map: bandes(cols), roughness: 0.6 })); c.rotation.z = Math.PI / 2; c.castShadow = true; c.position.y = 0.012; g.add(c);
      [-0.05, 0.05].forEach(function (x) { var p = cyl(0.0018, 0.0018, 0.03, alu); p.rotation.z = Math.PI / 2; p.position.set(x, 0.012, 0); g.add(p); }); G.add(g); return g; }
    var comp = { resistor_r1: resistance(['#7a3b0c', '#111', '#7a3b0c']), resistor_r2: resistance(['#7a3b0c', '#2f8f2f', '#7a3b0c']) }; comp.resistor_r1.scale.set(1.5, 1.5, 1.5); comp.resistor_r2.scale.set(1.5, 1.5, 1.5);
    var kG = new R.Group(), kB = add(box(0.075, 0.016, 0.05, noir, 0.004), kG); kB.position.y = 0.008; var lev = new R.Group(); lev.position.set(-0.018, 0.02, 0); var lm = add(box(0.05, 0.007, 0.007, alu, 0), lev); lm.position.x = 0.025; kG.add(lev); G.add(kG); comp.interrupteur_k = kG; kG.scale.set(1.3, 1.3, 1.3);
    var fG = new R.Group(); var bob = cyl(0.026, 0.026, 0.024, MS({ color: 0xd6342c, roughness: 0.6 })); bob.position.y = 0.012; fG.add(bob); var bob2 = cyl(0.016, 0.016, 0.03, MS({ color: 0x15181c, roughness: 0.6 })); bob2.position.y = 0.012; fG.add(bob2); G.add(fG); comp.fils = fG;
    // appareils : cadran à aiguille (100 divisions) ou afficheur
    function appareil(id) {
      var g = new R.Group(), c = add(box(0.17, 0.045, 0.11, noir, 0.006), g); c.position.y = 0.0225;
      var cv = canvas(340, 220); var f = new R.Mesh(new R.PlaneGeometry(0.15, 0.097), new R.MeshBasicMaterial({ map: cv.t, toneMapped: false })); f.rotation.x = -Math.PI / 2; f.position.set(0, 0.0462, -0.002); g.add(f);
      var kn = cyl(0.014, 0.016, 0.012, MS({ color: 0x9aa3ad, metalness: 0.8, roughness: 0.3 })); kn.position.set(0.062, 0.05, 0.038); g.add(kn); var kp = cyl(0.002, 0.002, 0.003, MS({ color: 0x111111 })); kp.position.set(0, 0.007, -0.009); kn.add(kp);
      var tv = new R.Mesh(new R.SphereGeometry(0.0075, 12, 10), MS({ color: 0xd6342c, roughness: 0.4 })), tc = new R.Mesh(new R.SphereGeometry(0.0075, 12, 10), MS({ color: 0x15181c, roughness: 0.4 })); tv.position.set(-0.03, 0.03, -0.059); tc.position.set(0.03, 0.03, -0.059); g.add(tv, tc);
      G.add(g); return { g: g, cv: cv, kn: kn, tv: tv, tc: tc, aiguille: false }; }
    var inst = {}; meta.materiel.filter(function (m) { return /amperemetre|voltmetre|multimetre/.test(m); }).forEach(function (m) { inst[m] = appareil(m); });
    var FOLIO = { resistor_r1: [-0.37, 0.265], resistor_r2: [-0.28, 0.265], interrupteur_k: [-0.17, 0.265], fils: [-0.07, 0.265] }, instPos = {}; var ni = 0; Object.keys(inst).forEach(function (m) { instPos[m] = [0.12 + ni * 0.0, 0.0]; ni++; });
    var mi = Object.keys(inst); mi.forEach(function (m, i) { instPos[m] = [mi.length === 1 ? 0.2 : 0.07 + i * 0.2, 0.255]; });

    // ------------------------------------------------------------ topologie : positions des composants, noeuds, fils
    function etat() { return API.vue(); }
    function mat() { return etat().materiel; }
    function has(id) { return Object.prototype.hasOwnProperty.call(mat(), id); }
    function topo() { var a = mat().resistor_r1, b = mat().resistor_r2; if (a && b && a === b) return a; if (a && !b) return a; if (b && !a) return b; return a && b ? 'mixte' : null; }
    function posComp(id) {
      if (id === 'alimentation') return [-0.43, 0.01];
      if (!has(id)) return FOLIO[id] || instPos[id]; var t = topo(), e = mat()[id];
      if (id === 'resistor_r1') return (e === 'derivation') ? [0.10, -0.10] : [-0.02, -0.10];
      if (id === 'resistor_r2') return (e === 'derivation') ? [0.10, 0.0] : (mat().resistor_r1 ? [0.20, -0.10] : [0.09, -0.10]);
      if (id === 'interrupteur_k') return [-0.24, -0.10];
      if (id === 'fils') return FOLIO.fils; return instPos[id];
    }
    function slotsDe(id) {   // emplacements proposés quand on glisse un composant
      var l = meta.emplacements[id] || [], t = topo(), out = [];
      if (id === 'alimentation') return [{ e: null, p: [-0.43, 0.01], n: 'Alimentation' }];
      if (id === 'interrupteur_k') return [{ e: null, p: [-0.24, -0.10], n: 'Interrupteur K' }];
      if (id === 'resistor_r1') return l.map(function (e) { return { e: e, p: e === 'derivation' ? [0.10, -0.10] : [-0.02, -0.10], n: 'R1 ' + LIB[e] }; });
      if (id === 'resistor_r2') return l.map(function (e) { return { e: e, p: e === 'derivation' ? [0.10, 0.0] : [0.20, -0.10], n: 'R2 ' + LIB[e] }; });
      if (id === 'fils') return [{ e: 'circuit', p: [0.0, 0.04], n: 'Fils : circuit' }, { e: 'bornes_generateur', p: [-0.33, 0.01], n: 'Fils : bornes du générateur' }];
      var N = noeuds(); l.forEach(function (e) { var s = N.slots[e]; if (s) out.push({ e: e, p: s, n: LIB[e] || e }); });
      return out;
    }
    function noeuds() {
      var t = topo(), N = { P: [XP, ZP], N: [XP, ZN], Ka: [-0.285, -0.10], Kb: [-0.195, -0.10], slots: {} }, der = (t === 'derivation');
      if (!der) { N.R1a = [-0.07, -0.10]; N.R1b = [0.03, -0.10]; N.A = [0.09, -0.10]; N.R2a = mat().resistor_r1 ? [0.15, -0.10] : [0.10, -0.10]; N.R2b = [0.25, -0.10]; N.C1 = [0.38, -0.10]; N.C2 = [0.38, ZN];
        N.slots = { point_1: [-0.135, -0.075], point_2: [0.09, -0.075], point_3: [0.315, -0.075], bornes_r1: [-0.02, -0.14], bornes_r2: [0.20, -0.14], bornes_k: [-0.24, -0.14], bornes_generateur: [-0.40, 0.01], point_p: [XP + 0.03, ZP - 0.03], point_a: [0.09, -0.14] }; }
      else { N.M = [-0.10, -0.10]; N.R1a = [0.05, -0.10]; N.R1b = [0.15, -0.10]; N.R2a = [0.05, 0.0]; N.R2b = [0.15, 0.0]; N.J = [0.26, -0.10]; N.J2 = [0.26, 0.0]; N.C2 = [0.38, ZN]; N.C1 = [0.38, 0.0]; N.A = N.M;
        N.slots = { branche_principale: [-0.145, -0.075], branche_r1: [-0.025, -0.075], branche_r2: [-0.025, 0.025], bornes_r1: [0.10, -0.14], bornes_r2: [0.10, 0.05], bornes_k: [-0.24, -0.14], bornes_generateur: [-0.40, 0.01], point_p: [XP + 0.03, ZP - 0.03], point_a: [-0.10, -0.14] }; }
      return N;
    }
    // appareils placés : fils de mesure vers deux noeuds (série = fil coupé, dérivation = pattes sur le dipôle)
    function pairesAppareil(id, e, N) {
      var der = topo() === 'derivation';
      var serie = { point_1: [der ? 'Kb' : 'Kb', der ? 'M' : 'R1a'], point_2: [der ? 'M' : 'R1b', der ? 'R1a' : 'R2a'], point_3: [der ? 'J' : 'R2b', der ? 'C1' : 'C1'], branche_principale: ['Kb', 'M'], branche_r1: ['M', 'R1a'], branche_r2: ['M', 'R2a'] };
      var bornes = { bornes_r1: ['R1a', 'R1b'], bornes_r2: ['R2a', 'R2b'], bornes_k: ['Ka', 'Kb'], bornes_generateur: ['P', 'N'], point_p: ['P', 'N'], point_a: ['A', 'N'] };
      if (serie[e]) return { a: serie[e][0], b: serie[e][1], coupe: true }; if (bornes[e]) return { a: bornes[e][0], b: bornes[e][1], coupe: false }; return null; }
    var fils = new R.Group(); G.add(fils);
    function fil(a, b, col, r) { var dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz); if (L < 1e-4) return; var m = new R.Mesh(new R.CylinderGeometry(r || 0.0028, r || 0.0028, L, 8), MS({ color: col, roughness: 0.5 })); m.rotation.z = Math.PI / 2; m.rotation.y = -Math.atan2(dz, dx); m.position.set((a[0] + b[0]) / 2, YF, (a[1] + b[1]) / 2); m.castShadow = true; fils.add(m); }
    function poly(pts, col) { for (var i = 0; i < pts.length - 1; i++) fil(pts[i], pts[i + 1], col); }
    var CH = []; for (var ic = 0; ic < 36; ic++) { var cs = new R.Mesh(new R.SphereGeometry(0.0042, 8, 6), MB(0xffd24d)); cs.visible = false; G.add(cs); CH.push({ m: cs, t: Math.random(), path: 0 }); }
    var chemins = [];
    function reconstruire() {
      while (fils.children.length) { var c = fils.children[0]; fils.remove(c); if (c.geometry) c.geometry.dispose(); }
      chemins = []; var t = topo(), N = noeuds(), M = mat(), E = etat(), der = (t === 'derivation'), rouge = 0xd6342c, noirC = 0x15181c;
      if (!has('alimentation')) return; var wi = M.fils;
      if (wi === 'bornes_generateur') { fil([XP, ZP], [XP + 0.0, ZN], rouge); return; }
      if (wi !== 'circuit') return;
      var coupes = {}; Object.keys(M).forEach(function (id) { if (!inst[id]) return; var pr = pairesAppareil(id, M[id], N); if (pr && pr.coupe) coupes[pr.a + '>' + pr.b] = id; });
      function seg(a, b, col) { var k = a + '>' + b, pa = N[a], pb = N[b]; if (!pa || !pb) return; if (coupes[k]) { var g = 0.02, dx = pb[0] - pa[0], dz = pb[1] - pa[1], L = Math.hypot(dx, dz) || 1; fil(pa, [pa[0] + dx / L * (L / 2 - g), pa[1] + dz / L * (L / 2 - g)], col); fil([pb[0] - dx / L * (L / 2 - g), pb[1] - dz / L * (L / 2 - g)], pb, col); } else fil(pa, pb, col); }
      var K = has('interrupteur_k'), r1 = has('resistor_r1'), r2 = has('resistor_r2');
      if (!der) {
        if (K) { seg('P', 'Ka', rouge); seg('Kb', 'R1a', rouge); } else seg('P', 'R1a', rouge);
        if (r1) { /* corps R1 entre R1a et R1b */ } else fil(N.R1a, N.R1b, rouge);
        seg('R1b', 'A', rouge); seg('A', 'R2a', rouge); if (!r2) fil(N.R2a, N.R2b, rouge); seg('R2b', 'C1', noirC); fil(N.C1, N.C2, noirC); fil(N.C2, N.N, noirC);
        chemins.push([N.P, N.Ka, N.Kb, N.R1a, N.R1b, N.A, N.R2a, N.R2b, N.C1, N.C2, N.N, N.P]);
      } else {
        if (K) { seg('P', 'Ka', rouge); seg('Kb', 'M', rouge); } else seg('P', 'M', rouge);
        seg('M', 'R1a', rouge); if (!r1) fil(N.R1a, N.R1b, rouge); fil(N.R1b, N.J, rouge); fil(N.M, [N.M[0], 0.0], rouge); seg('M', 'R2a', rouge); if (!r2) fil(N.R2a, N.R2b, rouge); fil(N.R2b, N.J2, rouge); fil(N.J, N.J2, rouge); fil(N.J2, N.C1, noirC); fil(N.C1, N.C2, noirC); fil(N.C2, N.N, noirC);
        chemins.push([N.P, N.Ka, N.Kb, N.M, N.R1a, N.R1b, N.J, N.J2, N.C1, N.C2, N.N, N.P], [N.M, [N.M[0], 0.0], N.R2a, N.R2b, N.J2]);
      }
      // fils de mesure : borne rouge (V ou A) vers l'amont, borne COM vers l'aval
      Object.keys(M).forEach(function (id) { if (!inst[id]) return; var pr = pairesAppareil(id, M[id], N), i = inst[id]; if (!pr) return; var p = i.g.position, tvp = [p.x - 0.03, p.z - 0.059], tcp = [p.x + 0.03, p.z - 0.059];
        var inv = !!E.reglages['inverse_' + id], a = inv ? pr.b : pr.a, b = inv ? pr.a : pr.b; if (!N[a] || !N[b]) return; poly([tvp, [tvp[0], tvp[1] - 0.06], N[a]], 0xd6342c); var cible = N[b]; if ((M[id] === 'point_p' || M[id] === 'point_a') && !E.reglages.masse_n) cible = [tcp[0] + 0.03, tcp[1] - 0.05]; poly([tcp, [tcp[0], tcp[1] - 0.07], cible], 0x15181c); });
    }
    function courants() {   // intensités pour l'animation seulement : le moteur seul fournit les mesures
      var U = etat().reglages.tension_generateur_v || 0, t = topo(), M = mat(), r1 = M.resistor_r1 ? R1 : 0, r2 = M.resistor_r2 ? R2 : 0;
      if (!etat().reglages.interrupteur_ferme || M.fils !== 'circuit' || !has('alimentation')) return [0, 0];
      if (t === 'derivation') { var a = U / R1, b = U / R2; return [a + b, b]; } var rt = r1 + r2; return [rt > 0 ? U / rt : 0, 0];
    }

    // ------------------------------------------------------------ dessin des cadrans (lus par l'élève)
    function dessinAppareil(id) {
      var i = inst[id], a = (etat().appareils || {})[id], g = i.cv.g, W = 340, H = 220; g.fillStyle = '#f2f1e6'; g.fillRect(0, 0, W, H);
      if (!a) { g.fillStyle = '#51607A'; g.font = '20px system-ui'; g.textAlign = 'center'; g.fillText('non branché', W / 2, H / 2); i.cv.t.needsUpdate = true; return; }
      var u = /^amp|^multimetre/.test(id) && lab !== 'mesure_tension_masse' && lab !== 'lois_tensions' ? 'A' : 'V';
      if (a.aiguilleDiv !== null && a.aiguilleDiv !== undefined) {
        var cx = W / 2, cy = 196, Rr = 150; g.strokeStyle = '#0D2149'; g.fillStyle = '#0D2149'; g.textAlign = 'center'; g.font = 'bold 16px system-ui';
        for (var d = 0; d <= 100; d += 2) { var ang = (-60 + 120 * d / 100) * Math.PI / 180, big = d % 10 === 0, r2 = Rr - (big ? 18 : 9); g.lineWidth = big ? 2 : 1; g.beginPath(); g.moveTo(cx + Rr * Math.sin(ang), cy - Rr * Math.cos(ang)); g.lineTo(cx + r2 * Math.sin(ang), cy - r2 * Math.cos(ang)); g.stroke(); if (d % 20 === 0) g.fillText(String(d), cx + (Rr - 34) * Math.sin(ang), cy - (Rr - 34) * Math.cos(ang) + 5); }
        g.font = 'bold 18px system-ui'; g.fillText('calibre ' + fr(a.calibre, a.calibre < 1 ? 1 : 0).replace(',0', '') + ' ' + u + '   ' + (u === 'A' ? 'A' : 'V') + ' ===', cx, 64);
        var dv = cl(a.aiguilleDiv, -4, 104), ag = (-60 + 120 * dv / 100) * Math.PI / 180; g.strokeStyle = '#D6342C'; g.lineWidth = 3; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + (Rr - 6) * Math.sin(ag), cy - (Rr - 6) * Math.cos(ag)); g.stroke(); g.fillStyle = '#0D2149'; g.beginPath(); g.arc(cx, cy, 6, 0, 6.3); g.fill();
        if (a.horsEchelle) { g.fillStyle = '#C9332B'; g.font = 'bold 16px system-ui'; g.fillText('hors échelle', cx, 100); }
      } else { g.fillStyle = '#b9c9a8'; g.fillRect(40, 50, 260, 110); g.fillStyle = '#1c2b17'; g.font = 'bold 54px ui-monospace,monospace'; g.textAlign = 'center'; g.fillText(fr(a.affichage, 3) + ' ' + u, W / 2, 122); }
      i.cv.t.needsUpdate = true;
    }
    function dessinAlim() { var g = aff.g; g.fillStyle = '#b9c9a8'; g.fillRect(0, 0, 200, 80); g.fillStyle = '#1c2b17'; g.font = 'bold 44px ui-monospace,monospace'; g.textAlign = 'center'; g.fillText(fr(etat().reglages.tension_generateur_v || 0, 1) + ' V', 100, 56); aff.t.needsUpdate = true; }

    // ------------------------------------------------------------ mise à jour de la scène à partir de l'état du moteur
    var cible = {};
    function maj() {
      var E = etat(), M = mat(); reconstruire(); dessinAlim();
      genC.material = has('alimentation') ? gris : ghostMat; affM.visible = bGen.visible = has('alimentation'); S.tension = E.reglages.tension_generateur_v || 0;
      bGen.rotation.y = -2.2 + 4.4 * cl(S.tension / opt.tension_max_v, 0, 1); led.material.color.set(E.reglages.interrupteur_ferme && has('alimentation') ? 0x33ff66 : 0x225522);
      lev.rotation.z = E.reglages.interrupteur_ferme ? 0 : 0.6;
      ['resistor_r1', 'resistor_r2', 'interrupteur_k', 'fils'].forEach(function (id) { var p = posComp(id); cible[id] = p; if (!ghosts.some(function (g) { return g.id === id; })) { comp[id].position.set(p[0], 0.02, p[1]); } });
      mi.forEach(function (id) { var i = inst[id], p = instPos[id]; i.g.position.set(p[0], 0.02, p[1]); dessinAppareil(id); var cal = E.reglages['calibre_' + id]; if (cal !== undefined) i.kn.rotation.y = -1.6 + 3.2 * Math.max(0, (/^volt/.test(id) || lab === 'mesure_tension_masse' ? opt.calibre_v : opt.calibre_a).indexOf(cal)) / 3; });
      sale = true; T.dirty(); cb && cb();
    }
    var cb = null;

    // ------------------------------------------------------------ gestes : glisser, toucher, tourner
    var el = T.renderer.domElement, v3 = new R.V3();
    function q(e) { var r = el.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top, w: r.width, h: r.height }; }
    function pr(p, y) { var s = q({ clientX: 0, clientY: 0 }); v3.set(p[0], y === undefined ? 0.04 : y, p[1]); v3.project(camera); return { x: (v3.x + 1) / 2 * s.w, y: (1 - v3.y) / 2 * s.h }; }
    function planY(e) { var s = q(e), nx = s.x / s.w * 2 - 1, ny = -(s.y / s.h * 2 - 1), a = camera.position.clone(), b = new R.V3(nx, ny, 0.5).unproject(camera), d = b.sub(a); if (Math.abs(d.y) < 1e-6) return null; var t = (0.04 - a.y) / d.y; return [a.x + d.x * t, a.z + d.z * t]; }
    var HS = [], DEV = [];
    meta.materiel.forEach(function (id) { DEV.push({ id: id, nom: NOM[id] || id, pos: function () { var p = has(id) ? posComp(id) : (id === 'alimentation' ? [-0.43, 0.01] : (FOLIO[id] || instPos[id])); return p; } }); });
    function hs(o) { HS.push(o); return o; }
    hs({ id: 'tension', nom: 'Tension', kind: 'drag', pos: function () { return [-0.43, 0.08]; }, y: 0.09, vis: function () { return has('alimentation'); }, t0: function () { return cl(S.tension / opt.tension_max_v, 0, 1); }, drag: function (dx, dy, t0) { var t = cl(t0 + (dx - dy) / 200, 0, 1), v = Math.round(t * opt.tension_max_v * 2) / 2; if (v !== S.tension) { S.tension = v; API.faire('regler_tension', { tension_v: v }); } }, texte: function () { return fr(S.tension, 1) + ' V'; } });
    hs({ id: 'k', nom: 'Interrupteur K', kind: 'tap', pos: function () { return posComp('interrupteur_k'); }, y: 0.04, vis: function () { return has('interrupteur_k'); }, tap: function () { API.faire(etat().reglages.interrupteur_ferme ? 'ouvrir_interrupteur' : 'fermer_interrupteur'); }, texte: function () { return etat().reglages.interrupteur_ferme ? 'fermé' : 'ouvert'; } });
    mi.forEach(function (id) {
      var needle = function () { var a = (etat().appareils || {})[id]; return a && a.aiguilleDiv !== null && a.aiguilleDiv !== undefined; };
      hs({ id: 'cal' + id, nom: 'Calibre', kind: 'tap', pos: function () { return [instPos[id][0] + 0.062, instPos[id][1] + 0.038]; }, y: 0.06, vis: function () { return has(id) && (needle() || !!etat().reglages['calibre_' + id]); }, tap: function () { var volt = /^volt/.test(id) || lab === 'mesure_tension_masse', l = volt ? opt.calibre_v : opt.calibre_a, k = l.indexOf(etat().reglages['calibre_' + id]), a = { materiel_id: id }; a[volt ? 'calibre_v' : 'calibre_a'] = l[(k + 1) % l.length]; API.faire('choisir_calibre', a); }, texte: function () { return fr(etat().reglages['calibre_' + id], 1).replace(',0', ''); } });
      if (lab === 'mesure_tension_masse') {
        hs({ id: 'inv' + id, nom: 'Inverser V / COM', kind: 'tap', pos: function () { return [instPos[id][0], instPos[id][1] - 0.058]; }, y: 0.05, vis: function () { return has(id); }, tap: function () { API.faire('inverser_branchement', { materiel_id: id }); }, texte: function () { return etat().reglages['inverse_' + id] ? 'inversé' : 'normal'; } });
        hs({ id: 'masse' + id, nom: 'COM vers N (masse)', kind: 'tap', pos: function () { return [instPos[id][0] + 0.03, instPos[id][1] - 0.058]; }, y: 0.05, vis: function () { return has(id) && /^(multimetre|voltmetre)/.test(id) && (mat()[id] === 'point_p' || mat()[id] === 'point_a'); }, tap: function () { API.faire('relier_masse', { point_id: 'n' }); }, texte: function () { return etat().reglages.masse_n ? 'reliée' : 'non reliée'; } });
      }
    });
    var halo = new R.Mesh(new R.CylinderGeometry(0.03, 0.03, 0.002, 28), new R.MeshBasicMaterial({ color: 0x1a73d1, transparent: true, opacity: 0.45, toneMapped: false })); halo.visible = false; G.add(halo);
    function trouver(e) {
      var s = q(e), best = null, bd = 36;
      HS.forEach(function (h) { if (!h.vis()) return; var p = pr(h.pos(), h.y), d = Math.hypot(p.x - s.x, p.y - s.y); if (d < bd) { bd = d; best = h; } });
      DEV.forEach(function (m) { var p = pr(m.pos(), 0.04), d = Math.hypot(p.x - s.x, p.y - s.y) + 6; if (d < bd) { bd = d; best = m; } });
      return best;
    }
    var glisseId = null, gpos = null, tagsSlots = [];
    function montrerSlots(id) { effacerSlots(); slotsDe(id).forEach(function (sl) { var d = document.createElement('div'); d.className = 'tag-g act'; d.textContent = sl.n; sl.tag = d; tagsEl.appendChild(d); tagsSlots.push(sl); }); }
    function effacerSlots() { tagsSlots.forEach(function (s) { if (s.tag && s.tag.parentNode) s.tag.parentNode.removeChild(s.tag); }); tagsSlots = []; }
    hote.addEventListener('pointerdown', function (e) {
      var h = trouver(e); if (!h) return; e.stopPropagation(); controls.enabled = false; drag = h; var s = q(e); depart = { x: s.x, y: s.y, bouge: false, t0: h.t0 ? h.t0() : 0 };
      if (!h.kind) { glisseId = h.id; gpos = posComp(h.id).slice(); var w = planY(e); depart.ox = w ? gpos[0] - w[0] : 0; depart.oz = w ? gpos[1] - w[1] : 0; montrerSlots(h.id); }
      try { hote.setPointerCapture(e.pointerId); } catch (_) { } sale = true; T.dirty();
    }, true);
    window.addEventListener('pointermove', function (e) {
      var s = q(e);
      if (drag) { var dx = s.x - depart.x, dy = s.y - depart.y; if (Math.hypot(dx, dy) > 6) depart.bouge = true; if (drag.kind === 'drag') drag.drag(dx, dy, depart.t0); else if (glisseId) { var w = planY(e); if (w) { gpos = [cl(w[0] + depart.ox, -0.46, 0.46), cl(w[1] + depart.oz, -0.3, 0.3)]; var obj = comp[glisseId] || (inst[glisseId] && inst[glisseId].g); if (obj) obj.position.set(gpos[0], 0.05, gpos[1]); } } sale = true; return; }
      if (!hote.contains(e.target)) return; var k = trouver(e); if (k !== hover) { hover = k; el.style.cursor = k ? 'pointer' : ''; sale = true; T.dirty(); }
    });
    function fin() {
      if (!drag) return; var h = drag; drag = null; controls.enabled = true;
      if (h.kind === 'tap' && !depart.bouge) h.tap();
      if (glisseId) { var id = glisseId; glisseId = null; var best = null, bd = 0.09; tagsSlots.forEach(function (sl) { var d = Math.hypot(sl.p[0] - gpos[0], sl.p[1] - gpos[1]); if (d < bd) { bd = d; best = sl; } });
        if (best && !(depart.bouge === false && !best)) { var v = { materiel_id: id }; if (best.e) v.emplacement_id = best.e; API.faire('placer_materiel', v); } else if (!depart.bouge && !has(id) && id === 'alimentation') API.faire('placer_materiel', { materiel_id: id });
        effacerSlots(); maj(); }
      sale = true; T.dirty();
    }
    window.addEventListener('pointerup', fin); window.addEventListener('pointercancel', fin);

    // ------------------------------------------------------------ caméra
    var EN = { p: [0.0, 0.78, 0.66], t: [0.0, 0.0, 0.05] };
    function vue(n) { var to = EN; if (n === 'cadrans') to = { p: [0.1, 0.55, 0.55], t: [0.1, 0.03, 0.2] }; else if (n === 'montage') to = { p: [0.0, 0.6, 0.38], t: [0.0, 0.0, -0.02] }; else if (n === 'generateur') to = { p: [-0.34, 0.4, 0.3], t: [-0.4, 0.03, 0.04] };
      cam = { t0: performance.now(), p0: camera.position.clone(), g0: controls.target.clone(), p1: new R.V3(to.p[0], to.p[1], to.p[2]), g1: new R.V3(to.t[0], to.t[1], to.t[2]) }; sale = true; T.dirty(); }
    camera.position.set(EN.p[0], EN.p[1], EN.p[2]); controls.target.set(EN.t[0], EN.t[1], EN.t[2]); controls.update();

    // ------------------------------------------------------------ boucle : charges qui circulent, étiquettes
    function chargesMaj(dt) {
      var I = courants(), anim = chemins.length > 0 && I[0] > 0; CH.forEach(function (c, i) { c.m.visible = false; }); if (!anim) return false;
      var n = 0; chemins.forEach(function (pts, pi) { var courant = pi === 0 ? I[0] : I[1]; if (courant <= 0) return; var L = [], tot = 0; for (var k = 0; k < pts.length - 1; k++) { var d = Math.hypot(pts[k + 1][0] - pts[k][0], pts[k + 1][1] - pts[k][1]); L.push(d); tot += d; } if (tot < 0.01) return;
        var cnt = Math.min(14, Math.round(tot * 28)), v = (0.03 + courant * 0.9) / tot;
        for (var j = 0; j < cnt && n < CH.length; j++, n++) { var c = CH[n]; c.t = (c.t + dt * v * (0.6 + 0.4 * (j % 2))) % 1; var u = ((j / cnt) + c.t) % 1 * tot, acc = 0, k2 = 0; while (k2 < L.length - 1 && acc + L[k2] < u) { acc += L[k2]; k2++; } var f = L[k2] ? (u - acc) / L[k2] : 0; c.m.position.set(pts[k2][0] + (pts[k2 + 1][0] - pts[k2][0]) * f, YF + 0.006, pts[k2][1] + (pts[k2 + 1][1] - pts[k2][1]) * f); c.m.visible = true; } });
      return true;
    }
    function majTags() {
      HS.concat(DEV).forEach(function (h) { var d = h.tg; if (!d) { d = h.tg = document.createElement('div'); d.className = 'tag-g'; tagsEl.appendChild(d); } var ok = h.vis ? h.vis() : true, act = (hover === h || drag === h); if (!h.kind && has(h.id) && !act) ok = false; d.hidden = !ok; if (!ok) return; var p = pr(h.pos(), h.y || 0.04);
        d.style.left = p.x + 'px'; d.style.top = (act ? p.y - 22 : p.y) + 'px'; var tx = h.texte ? h.texte() : ''; d.textContent = h.nom + (tx ? ' : ' + tx : ''); d.className = 'tag-g' + (act ? ' act' : ''); });
      tagsSlots.forEach(function (sl) { var p = pr(sl.p, 0.05); sl.tag.style.left = p.x + 'px'; sl.tag.style.top = p.y + 'px'; });
    }
    window.__tick = function () {
      var now = performance.now(), dt = Math.min(0.05, (now - dernier) / 1000); dernier = now; var b = false;
      if (cam) { var u = Math.min(1, (now - cam.t0) / 600), e = u * u * (3 - 2 * u); camera.position.lerpVectors(cam.p0, cam.p1, e); controls.target.lerpVectors(cam.g0, cam.g1, e); controls.update(); if (u >= 1) cam = null; b = true; }
      var hv = hover || drag; if (hv && hv.pos && hv.kind) { halo.visible = true; var p = hv.pos(); halo.position.set(p[0], hv.y || 0.04, p[1]); b = true; } else halo.visible = false;
      if (chargesMaj(dt)) b = true; majTags(); var r = sale || b; sale = false; return r;
    };

    // ------------------------------------------------------------ cahier : lecture du cadran, calcul, note
    function bouton(t, f, c) { var b = document.createElement('button'); b.type = 'button'; b.className = 'btn' + (c ? ' ' + c : ''); b.textContent = t; b.addEventListener('click', f); return b; }
    function ligne(lbl, noeud) { var d = document.createElement('div'); d.className = 'ligne'; var l = document.createElement('label'); var s = document.createElement('span'); s.textContent = lbl; l.appendChild(s); d.appendChild(l); d.appendChild(noeud); zone.appendChild(d); return d; }
    function champ(ph, mode) { var i = document.createElement('input'); i.type = 'text'; i.setAttribute('inputmode', mode || 'decimal'); i.placeholder = ph || ''; return i; }
    var barre = document.createElement('div'); barre.className = 'seg'; [['ensemble', 'Ensemble'], ['montage', 'Montage'], ['cadrans', 'Cadrans'], ['generateur', 'Générateur']].forEach(function (a) { barre.appendChild(bouton(a[1], function () { vue(a[0]); })); });
    var rb = document.createElement('div'); rb.className = 'ligne'; rb.appendChild(barre); zone.appendChild(rb);
    var th = document.createElement('h2'); th.className = 'etiq'; th.textContent = 'Cahier de laboratoire'; zone.appendChild(th);
    var iC = champ('calibre C'), iL = champ('lecture l (div)'), iD = champ('divisions D'), row = document.createElement('div'); row.className = 'seg'; row.appendChild(iC); row.appendChild(iL); row.appendChild(iD); ligne('Lecture du cadran : C, l, D', row);
    var sel = document.createElement('select'); meta.grandeurs.forEach(function (g) { var o = document.createElement('option'); o.value = g; o.textContent = g.replace(/_(v|a)$/, '').replace(/_/g, ' '); sel.appendChild(o); }); ligne('Grandeur mesurée', sel);
    var iV = champ('valeur calculée'), iU = champ('unité', 'text'); function unite() { iU.value = /_a$/.test(sel.value) ? 'A' : 'V'; } sel.addEventListener('change', unite); unite(); var rr = document.createElement('div'); rr.className = 'seg'; rr.appendChild(iV); rr.appendChild(iU); ligne('Valeur (point ou virgule) et unité', rr);
    var iDa = champ('incertitude absolue'), iDr = champ('incertitude relative'), rr2 = document.createElement('div'); rr2.className = 'seg'; rr2.appendChild(iDa); rr2.appendChild(iDr); ligne('Incertitudes (calculées par toi)', rr2);
    var liste = document.createElement('div'); liste.id = 'liste-notes';
    var bn = bouton('Noter dans le cahier', function () { var v = parseFloat(String(iV.value).replace(',', '.')); if (isNaN(v)) return; API.faire('mesurer', { grandeur_id: sel.value, valeur: v, unite: iU.value }); iV.value = ''; liste.textContent = ''; majNotes(); });
    var rn = document.createElement('div'); rn.className = 'ligne'; rn.appendChild(bn); zone.appendChild(rn); zone.appendChild(liste);
    function majNotes() { liste.textContent = ''; var ms = etat().mesures || []; if (!ms.length) return; var tb = document.createElement('tbody'); ms.forEach(function (m) { var tr = document.createElement('tr'), a = document.createElement('td'), c = document.createElement('td'); a.textContent = String(m.grandeur).replace(/_/g, ' '); c.textContent = String(m.saisie).replace('.', ',') + ' ' + (m.unite || ''); tr.appendChild(a); tr.appendChild(c); tb.appendChild(tr); }); var t = document.createElement('table'); t.appendChild(tb); liste.appendChild(t); }
    cb = majNotes;

    // ------------------------------------------------------------ assistant : état réel, indices 3 niveaux, jamais la réponse
    function assistant() {
      var E = etat(), M = mat(), h = function () { var a = arguments; S.max = a.length; var i = Math.min(S.indice, a.length - 1); return { texte: a[i], plus: i < a.length - 1 }; };
      var conseil = E.conseils && E.conseils.length ? E.conseils[E.conseils.length - 1] : null;
      if (!has('alimentation')) return h('Il faut une source de tension pour commencer.', 'L\'alimentation est en pointillé sur la plaque.', 'Glisse l\'alimentation sur son emplacement, puis règle la tension avec le bouton.');
      if (!has('resistor_r1') && !has('resistor_r2')) return h('Le circuit n\'a pas encore de dipôle.', 'Les résistances sont sur l\'étagère du bas.', 'Glisse une résistance sur l\'un des emplacements proposés.');
      if (!has('interrupteur_k')) return h('Comment pourrais-tu couper le courant en sécurité ?', 'Un interrupteur est sur l\'étagère.', 'Glisse l\'interrupteur K sur la plaque.');
      if (M.fils === undefined) return h('Les composants ne sont pas reliés entre eux.', 'Observe la bobine de fils.', 'Glisse les fils sur le circuit.');
      var app = Object.keys(M).filter(function (k) { return inst[k]; }); if (!app.length) return h('Que veux-tu mesurer ?', 'L\'appareil se glisse sur un emplacement du circuit. Réfléchis à la façon de le brancher.', 'Glisse l\'appareil sur un emplacement : choisis-le d\'après ce que tu mesures.');
      if (!E.reglages.interrupteur_ferme) return { texte: 'Avant de fermer K : le calibre est-il le bon pour une première mesure ?', plus: false };
      if (conseil && conseil.niveau !== 'validation') return { texte: conseil.message, plus: false };
      if (!(E.mesures || []).length) return h('Observe le cadran : où est l\'aiguille ?', 'Lis le nombre de divisions et note le calibre.', 'Calcule la valeur avec la formule du cours, puis note-la dans le cahier.');
      return { texte: 'Continue ton étude : change un branchement ou la tension et compare tes mesures.', plus: false };
    }
    var lastA = 0, lastCle = '';
    var oldTick = window.__tick; window.__tick = function () { var r = oldTick(); var now = performance.now(); if (now - lastA > 500) { lastA = now; var E = etat(), cle = JSON.stringify([E.materiel, E.reglages.interrupteur_ferme, (E.mesures || []).length, E.conseils && E.conseils.length]); if (cle !== lastCle) { lastCle = cle; S.indice = 0; } var a = assistant(); API.cb.assistant(a.texte, !!a.plus); } return r; };
    maj();
    return { maj: maj, vue: vue, indice: function () { if (S.indice < (S.max || 1) - 1) S.indice++; },
      detruire: function () { window.__tick = null; scene.remove(G); tagsEl.textContent = ''; zone.textContent = ''; if (vieux) vieux.visible = true; controls.enabled = true; controls.minAzimuthAngle = sv.az0; controls.maxAzimuthAngle = sv.az1; controls.minDistance = sv.mn; controls.maxDistance = sv.mx; } };
  }
  window.ElectriciteSpec = { creer: creer, CAUSES: CAUSES, TITRE: TITRE };
}());
