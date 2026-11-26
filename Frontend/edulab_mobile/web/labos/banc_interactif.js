// Banc d'optique interactif (méthodes de Bilbermann, Bessel et Descartes).
// État unique : positions des cavaliers (cm) + source allumée. La scène est redessinée à partir de cet état,
// jamais l'inverse. Les formules viennent de BancModele (jumeau de lib/src/banc_optique.dart).
(function () {
  'use strict';
  var M = window.BancModele, L = 100, AXE = 0.16, KV = 0.016, X0 = 8;
  function X(cm) { return (cm / L - 0.5); }
  function Y(cm) { return AXE + cm * KV; }
  function fr(x, d) { return (x === null || isNaN(x)) ? '' : x.toFixed(d === undefined ? 1 : d).replace('.', ','); }

  var CAUSES = {
    image_non_nette: 'Une position notée avant que l\'image soit nette ne correspond pas à la convergence des rayons : la distance obtenue est fausse.',
    distance_objet_ecran_trop_petite: 'Si D est inférieure à 4f\', l\'équation de conjugaison n\'a pas de solution double : aucune position de la lentille ne donne d\'image nette.',
    signe_distance_algebrique: 'L\'axe est orienté de la gauche vers la droite : l\'objet est à gauche de la lentille, donc OA est négative.'
  };
  var TITRE_ERR = { image_non_nette: 'Position notée sans image nette', distance_objet_ecran_trop_petite: 'Distance objet-écran trop petite', signe_distance_algebrique: 'Signe de la distance algébrique' };
  var METHODES = [
    { id: 'bilbermann', nom: 'Bilbermann', consigne: 'Place le miroir plan juste derrière la lentille. Cherche une image nette, de même taille que l\'objet, dans son propre plan. Lis les positions de l\'objet A et du centre optique O.', n: 3,
      cols: [['A', 'cm', 'position_a_cm'], ['O', 'cm', 'position_o_cm'], ['f\' = |OA|', 'cm', 'f_prime_cm']] },
    { id: 'bessel', nom: 'Bessel', consigne: 'Fixe l\'objet et l\'écran à une distance D. Fais glisser la lentille : note ses deux positions L1 et L2 qui donnent une image nette. Calcule d = L2 - L1, puis f\'.', n: 2,
      cols: [['D', 'cm', 'distance_objet_ecran_cm'], ['L1', 'cm', 'position_l1_cm'], ['L2', 'cm', 'position_l2_cm'], ['d', 'cm', null], ['f\'', 'cm', 'f_prime_cm']] },
    { id: 'descartes', nom: 'Descartes', consigne: 'Laisse la lentille fixe. Pour chaque position de l\'objet, règle l\'écran jusqu\'à l\'image nette et lis OA\'. Calcule 1/OA, 1/OA\' et f\'.', n: 5,
      cols: [['OA', 'cm', 'oa_cm'], ['OA\'', 'cm', 'oa_prime_cm'], ['1/OA', 'cm-1', null], ['1/OA\'', 'cm-1', null], ['f\'', 'cm', 'f_prime_cm']] }
  ];

  function creer(L3, hote, cb) {
    var T = L3.three, scene = T.scene, camera = T.camera, controls = T.controls, THREE = {};
    L3.show('focale_lentille', { longueur_banc_cm: L });
    scene.traverse(function (o) {
      THREE.Group = THREE.Group || (o.type === 'Group' ? o.constructor : null); THREE.Mesh = o.type === 'Mesh' ? o.constructor : THREE.Mesh;
      if (o.geometry) THREE[o.geometry.type] = o.geometry.constructor;
      if (o.material) { THREE[o.material.type] = o.material.constructor; if (o.material.map) THREE.Tex = o.material.map.constructor; }
      if (o.type === 'PointLight') THREE.PointLight = o.constructor;
    });
    THREE.V3 = camera.position.constructor;
    var ancien = T.cap(); if (ancien) ancien.visible = false;
    var sauve = { min: controls.minDistance, max: controls.maxDistance, az0: controls.minAzimuthAngle, az1: controls.maxAzimuthAngle, pol: controls.maxPolarAngle };
    controls.minAzimuthAngle = -1.2; controls.maxAzimuthAngle = 1.2; controls.minDistance = 0.18; controls.maxDistance = 1.6; controls.maxPolarAngle = 1.35;

    // ---------------------------------------------------------------- état
    var S = { placed: {}, x: { objet: 10, lentille: 35, miroir: 38, ecran: 90 }, allume: false, methode: 0, cellules: {}, erreurs: [], notes: 0, hover: null, drag: null, vue: 'ensemble', dernier: 'lentille', indice: 0, cle: '' };
    var sale = true, cam = null;
    function M3(c) { return new THREE.MeshStandardMaterial(c); }
    function tex(w, h, f) { var c = document.createElement('canvas'); c.width = w; c.height = h; f(c.getContext('2d'), w, h); var t = new THREE.Tex(c); t.anisotropy = 8; return { t: t, c: c }; }

    // ---------------------------------------------------------------- matériel 3D
    var G = new THREE.Group(); scene.add(G);
    var alu = M3({ color: 0xc9ced4, metalness: 0.9, roughness: 0.32 }), noir = M3({ color: 0x23272e, roughness: 0.5, metalness: 0.4 });
    function boite(w, h, d, m) { var b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); b.castShadow = b.receiveShadow = true; return b; }
    var rail = new THREE.Group(), r1 = boite(1.06, 0.028, 0.05, alu); r1.position.y = 0.014; rail.add(r1);
    var regle = tex(2048, 40, function (c, w, h) {
      c.fillStyle = '#f3f3ee'; c.fillRect(0, 0, w, h); c.fillStyle = '#111'; c.font = 'bold 16px system-ui,sans-serif'; c.textAlign = 'center';
      for (var mm = 0; mm <= 1000; mm++) { var x = mm * (w / 1000), g = mm % 100 === 0 ? 22 : (mm % 10 === 0 ? 15 : (mm % 5 === 0 ? 11 : 7)); c.fillRect(x, 0, mm % 100 === 0 ? 2 : 1, g); if (mm % 100 === 0) c.fillText(mm / 10, Math.min(Math.max(x, 12), w - 12), 38); }
    });
    var regleM = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.02), new THREE.MeshBasicMaterial({ map: regle.t, toneMapped: false })); regleM.rotation.x = -Math.PI / 2; regleM.position.set(0, 0.0292, 0.012);
    var tailleTex = 512, lampe = new THREE.Group(), glow, lum;
    var corps = boite(0.07, 0.1, 0.085, noir); corps.position.set(-0.035, AXE, 0); lampe.add(corps);
    glow = new THREE.Mesh(new THREE.CircleGeometry(0.03, 32), new THREE.MeshBasicMaterial({ color: 0xffe9a0, toneMapped: false })); glow.rotation.y = Math.PI / 2; glow.position.set(0.001, AXE, 0); lampe.add(glow);
    lum = new THREE.PointLight(0xfff1d6, 0.0, 0.7, 2); lum.position.set(0.04, AXE, 0); lampe.add(lum);
    var sP = boite(0.06, 0.022, 0.06, noir); sP.position.set(-0.035, 0.039, 0); lampe.add(sP);
    lampe.position.x = X(X0);

    function chariot(h) { var g = new THREE.Group(), b = boite(0.07, 0.022, 0.07, noir); b.position.y = 0.039; g.add(b);
      var p = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, h, 16), alu); p.position.y = 0.05 + h / 2; p.castShadow = true; g.add(p); return g; }
    function planImage(lx, ly) { var t = tex(tailleTex, tailleTex, function () {}); var m = new THREE.Mesh(new THREE.PlaneGeometry(lx, ly), new THREE.MeshBasicMaterial({ map: t.t, toneMapped: false, transparent: true })); return { m: m, c: t.c, t: t.t, ctx: t.c.getContext('2d') }; }

    var objet = chariot(0.12), diapo = boite(0.004, 0.1, 0.1, M3({ color: 0x15181c, roughness: 0.6 })); diapo.position.y = AXE; objet.add(diapo);
    var fl = new THREE.Group(), orange = new THREE.MeshBasicMaterial({ color: 0xff8a1f, toneMapped: false });
    var tige = new THREE.Mesh(new THREE.BoxGeometry(0.0045, 0.0125, 0.0035), orange); tige.position.y = AXE + 0.00625; fl.add(tige);
    var tete = new THREE.Mesh(new THREE.CylinderGeometry(0, 0.0045, 0.0075, 12), orange); tete.position.y = AXE + 0.0155; fl.add(tete); objet.add(fl);
    var retour = planImage(0.1, 0.1); retour.m.rotation.y = Math.PI / 2; retour.m.position.set(0.0032, AXE, 0); objet.add(retour.m);

    var lentille = chariot(0.1), bague = new THREE.Mesh(new THREE.TorusGeometry(0.077, 0.006, 16, 64), noir); bague.rotation.y = Math.PI / 2; bague.position.y = AXE; bague.castShadow = true; lentille.add(bague);
    var verre = new THREE.Mesh(new THREE.SphereGeometry(0.075, 48, 24), new THREE.MeshPhysicalMaterial({ color: 0xffffff, transmission: 1, thickness: 0.03, ior: 1.5, roughness: 0.02, transparent: true, envMapIntensity: 3 })); verre.scale.set(0.16, 1, 1); verre.position.y = AXE; lentille.add(verre);

    var miroir = chariot(0.1), glace = boite(0.004, 0.11, 0.11, M3({ color: 0xffffff, metalness: 1, roughness: 0.04 })); glace.position.y = AXE; miroir.add(glace);

    var ecran = chariot(0.1), toile = boite(0.008, 0.16, 0.16, M3({ color: 0xf6f6f2, roughness: 0.9 })); toile.position.y = AXE; ecran.add(toile);
    var img = planImage(0.16, 0.16); img.m.rotation.y = -Math.PI / 2; img.m.position.set(-0.0046, AXE, 0); ecran.add(img.m);

    var halo = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.004, 12, 40), new THREE.MeshBasicMaterial({ color: 0x1a73d1, toneMapped: false })); halo.rotation.x = Math.PI / 2; halo.position.y = 0.032; halo.visible = false;
    var tiges = [], jaune = new THREE.MeshBasicMaterial({ color: 0xd99a00, toneMapped: false }), rouge = new THREE.MeshBasicMaterial({ color: 0xe8590c, toneMapped: false });
    var rayG = new THREE.Group();
    for (var i = 0; i < 16; i++) { var c = new THREE.Mesh(new THREE.CylinderGeometry(0.002, 0.002, 1, 6), jaune); c.visible = false; rayG.add(c); tiges.push(c); }
    var CAV = { objet: objet, lentille: lentille, miroir: miroir, ecran: ecran };
    G.add(rail, regleM, lampe, objet, lentille, miroir, ecran, halo, rayG);

    // ---------------------------------------------------------------- dessin de l'image (écran et plan de l'objet)
    function dessiner(p, image, mode) {
      var c = p.ctx, W = tailleTex, pxCm = W / 10, f = image.flouPx;
      c.setTransform(1, 0, 0, 1, 0, 0); c.filter = 'none'; c.clearRect(0, 0, W, W);
      if (mode === 'ecran') { c.fillStyle = '#f6f6f2'; c.fillRect(0, 0, W, W); }
      if (!S.allume) { p.t.needsUpdate = true; return; }
      var halo2 = c.createRadialGradient(W / 2, W / 2, 10, W / 2, W / 2, W * 0.5); halo2.addColorStop(0, 'rgba(255,214,120,.55)'); halo2.addColorStop(1, 'rgba(255,214,120,0)'); c.fillStyle = halo2; c.fillRect(0, 0, W, W);
      var h = (image.tailleImageCm === null ? 1.2 : image.tailleImageCm) * pxCm, a = Math.max(0.12, 1 - f / 40), mid = W / 2;
      var flou = ('filter' in c);
      function fleche() { c.beginPath(); c.moveTo(mid, mid); c.lineTo(mid, mid + h * 0.8); c.lineTo(mid - 0.2 * h, mid + h * 0.7); c.lineTo(mid, mid + h); c.lineTo(mid + 0.2 * h, mid + h * 0.7); c.lineTo(mid, mid + h * 0.8); c.closePath(); c.fill(); c.lineWidth = Math.max(2, h * 0.07); c.strokeStyle = '#e8590c'; c.beginPath(); c.moveTo(mid, mid); c.lineTo(mid, mid + h * 0.85); c.stroke(); }
      c.fillStyle = '#e8590c'; c.globalAlpha = a;
      if (image.positionImageCm === null && image.ecartCm === null) { f = 60; h = 40; }
      if (flou) { c.filter = 'blur(' + f.toFixed(1) + 'px)'; fleche(); c.filter = 'none'; }
      else { c.globalAlpha = a / 8; for (var k = 0; k < 8; k++) { c.save(); c.translate(Math.cos(k * 0.785) * f, Math.sin(k * 0.785) * f); fleche(); c.restore(); } }
      c.globalAlpha = 1; p.t.needsUpdate = true;
    }

    // ---------------------------------------------------------------- état -> scène (à chaque changement)
    function etat() {
      var x = S.x, p = S.placed, lentOK = p.lentille, objOK = p.objet, miroirAct = p.miroir && x.miroir > x.lentille;
      var pl = objOK && lentOK, lit = S.allume && p.source;
      var image = null;
      if (pl && lit) image = miroirAct ? M.imageAutocollimation(x.objet, x.lentille) : (p.ecran ? M.imageSurEcran(x.objet, x.lentille, x.ecran) : null);
      return { miroirAct: miroirAct, pl: pl, lit: lit, image: image };
    }
    function synchroniser() {
      var e = etat(), x = S.x, p = S.placed;
      rail.visible = !!p.banc; regleM.visible = !!p.regle; lampe.visible = !!p.source;
      ['objet', 'lentille', 'miroir', 'ecran'].forEach(function (k) { CAV[k].visible = !!p[k]; CAV[k].position.x = X(x[k]); });
      var allume = S.allume && p.source; glow.material.color.set(allume ? 0xfff2b0 : 0x4a4f58); lum.intensity = allume ? 0.55 : 0;
      fl.visible = !!p.objet && allume;
      // rayons
      tiges.forEach(function (t) { t.visible = false; });
      var segs = [];
      if (e.pl && e.lit) segs = M.rayons(x.objet, x.lentille, e.miroirAct ? null : (p.ecran ? x.ecran : null), e.miroirAct ? x.miroir : null);
      segs.forEach(function (s, k) {
        if (k >= tiges.length) return; var t = tiges[k], a = new THREE.V3(X(s.x1), Y(s.y1), s.retour ? 0.006 : 0), b = new THREE.V3(X(s.x2), Y(s.y2), s.retour ? 0.006 : 0);
        var dx = b.x - a.x, dy = b.y - a.y, len = Math.sqrt(dx * dx + dy * dy);
        t.visible = true; t.material = s.retour ? rouge : jaune; t.scale.set(1, len, 1); t.position.set((a.x + b.x) / 2, (a.y + b.y) / 2, a.z); t.rotation.z = Math.atan2(dy, dx) - Math.PI / 2;
      });
      // images
      if (p.ecran) dessiner(img, e.image && !e.miroirAct ? e.image : { flouPx: 60, tailleImageCm: null, positionImageCm: null, ecartCm: null }, 'ecran');
      retour.m.visible = !!(p.objet && e.miroirAct);
      if (retour.m.visible) dessiner(retour, e.image || { flouPx: 60, tailleImageCm: null, positionImageCm: null, ecartCm: null }, 'plan');
      S.image = e.image; S.etat = e; sale = true; T.dirty();
      var cle = [e.pl, e.lit, e.image && e.image.nette, e.image && e.image.ecartCm !== null && e.image.ecartCm < 8, e.miroirAct, !!p.ecran, S.methode, p.banc && p.regle].join('|');
      if (cle !== S.cle) { S.cle = cle; S.indice = 0; }
      cb.assistant(assistant());
    }

    // ---------------------------------------------------------------- assistant : réagit à l'état réel, jamais la réponse
    function assistant() {
      var p = S.placed, e = S.etat, i = S.image, niv, t;
      var h = function () { var a = arguments; S.max = a.length; return a[Math.min(S.indice, a.length - 1)]; };
      if (!p.banc || !p.regle) return { texte: 'Pour commencer, place le banc optique et la règle graduée.', plus: false };
      if (!p.source || !p.objet || !p.lentille) return { texte: 'Il manque du matériel : source lumineuse, objet et lentille convergente.', plus: false };
      if (!S.allume) return { texte: h('La scène est sombre. Il manque quelque chose pour voir la lumière.', 'Pense à la source lumineuse.', 'Allume la source avec le bouton prévu.'), plus: S.indice < 2 };
      if (S.methode === 0 && !p.miroir) return { texte: h('Cette méthode utilise un miroir plan.', 'Pose le miroir plan sur le banc.', 'Glisse le miroir juste derrière la lentille.'), plus: S.indice < 2 };
      if (S.methode !== 0 && !p.ecran) return { texte: h('Où l\'image pourrait-elle se former ?', 'Il te faut un support pour la recevoir.', 'Place l\'écran sur le banc.'), plus: S.indice < 2 };
      if (S.methode === 1 && !e.miroirAct && p.ecran) { var D = S.x.ecran - S.x.objet; if (D < 4 * M.P.fPrimeCm && D > 0) return { texte: 'Réfléchis : pourquoi faut-il D > 4f\' pour que deux positions existent ?', plus: false }; }
      if (!i || (i.positionImageCm === null && i.ecartCm === null)) return { texte: h('Aucune image ne se forme avec ce réglage.', 'Quand l\'objet est trop près de la lentille, les rayons ne convergent pas.', 'Éloigne l\'objet de la lentille et observe les rayons.'), plus: S.indice < 2 };
      if (!i.nette) {
        if (i.ecartCm > 8) return { texte: h('L\'image est très floue. Observe où les rayons se croisent.', 'Compare la position où les rayons convergent avec celle de ' + (e.miroirAct ? 'l\'objet.' : 'l\'écran.'), 'Déplace ' + (e.miroirAct ? 'la lentille' : 'l\'écran') + ' vers le point de croisement des rayons.'), plus: S.indice < 2 };
        return { texte: h('L\'image est encore floue. Avance par petits pas, millimètre par millimètre.', 'Regarde le contour de la flèche : devient-il plus net ou moins net ?', 'Continue dans le sens où le flou diminue.'), plus: S.indice < 2 };
      }
      return { texte: 'Lis la position sur la règle, sans te pencher : évite l\'erreur de parallaxe.', plus: false };
    }

    // ---------------------------------------------------------------- interaction : glisser les cavaliers
    var el = T.renderer.domElement, v3 = new THREE.V3();
    function pt(e) { var r = el.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top, w: r.width, h: r.height }; }
    function ecranDe(x, y, z) { v3.set(x, y, z); v3.project(camera); return v3.clone(); }
    function trouver(e) {
      var q = pt(e), best = null, bd = 34;
      ['objet', 'lentille', 'miroir', 'ecran'].forEach(function (k) {
        if (!S.placed[k]) return;
        [0.04, 0.1, AXE].forEach(function (y) { var s = ecranDe(X(S.x[k]), y, 0), sx = (s.x + 1) / 2 * q.w, sy = (1 - s.y) / 2 * q.h, d = Math.hypot(sx - q.x, sy - q.y); if (d < bd) { bd = d; best = k; } });
      });
      return best;
    }
    function xRail(e) { var q = pt(e), nx = q.x / q.w * 2 - 1, ny = -(q.y / q.h * 2 - 1), a = camera.position.clone(), b = new THREE.V3(nx, ny, 0.5).unproject(camera), d = b.sub(a);
      if (Math.abs(d.y) < 1e-6) return null; var t = (0.04 - a.y) / d.y; return (a.x + d.x * t + 0.5) * L; }
    function poser(k, cm) {
      var prev = S.x[k]; cm = Math.max(X0 + 4, Math.min(L - 2, cm));
      ['objet', 'lentille', 'miroir', 'ecran'].forEach(function (o) { if (o === k || !S.placed[o]) return; if (Math.abs(cm - S.x[o]) < 2.2) cm = S.x[o] + (prev >= S.x[o] ? 2.2 : -2.2); });
      S.x[k] = Math.max(X0 + 4, Math.min(L - 2, cm)); S.dernier = k;
    }
    hote.addEventListener('pointerdown', function (e) {
      var k = trouver(e); if (!k) return; e.stopPropagation(); controls.enabled = false; S.drag = k; S.hover = k;
      var x = xRail(e); S.dec = x === null ? 0 : S.x[k] - x; try { hote.setPointerCapture(e.pointerId); } catch (_) { } halo.visible = true; sale = true; T.dirty();
    }, true);
    window.addEventListener('pointermove', function (e) {
      if (S.drag) { var x = xRail(e); if (x !== null) { poser(S.drag, x + S.dec); synchroniser(); } return; }
      if (!hote.contains(e.target)) return; var k = trouver(e); if (k !== S.hover) { S.hover = k; el.style.cursor = k ? 'grab' : ''; sale = true; T.dirty(); }
    });
    function fin() { if (!S.drag) return; var k = S.drag; S.drag = null; controls.enabled = true; cb.deplace(k, S.x[k]); sale = true; T.dirty(); }
    window.addEventListener('pointerup', fin); window.addEventListener('pointercancel', fin);

    // ---------------------------------------------------------------- caméra : vues préréglées (0,6 s)
    function vue(nom) {
      S.vue = nom; var cx = X(S.x[S.dernier] || 40), to;
      if (nom === 'ensemble') to = { p: [0, 0.5, 1.32], t: [0, 0.1, 0] };
      else if (nom === 'ecran') { var xe = X(S.placed.ecran ? S.x.ecran : 80); to = { p: [xe - 0.28, 0.2, 0.34], t: [xe, 0.15, 0] }; }
      else to = { p: [cx, 0.1, 0.2], t: [cx, 0.03, 0] };
      cam = { t0: performance.now(), p0: camera.position.clone(), g0: controls.target.clone(), p1: new THREE.V3(to.p[0], to.p[1], to.p[2]), g1: new THREE.V3(to.t[0], to.t[1], to.t[2]) }; sale = true; T.dirty();
    }
    function etiquettes() {
      var z = cb.tags; if (!z) return; var q = el.getBoundingClientRect(); z.hidden = S.vue !== 'regle'; if (z.hidden) return;
      var noms = { objet: 'A', lentille: 'O', miroir: 'M', ecran: 'E' };
      Object.keys(noms).forEach(function (k) {
        var d = z.querySelector('[data-k="' + k + '"]'); if (!d) { d = document.createElement('div'); d.className = 'tag-pos'; d.setAttribute('data-k', k); z.appendChild(d); }
        d.hidden = !S.placed[k]; if (d.hidden) return; var s = ecranDe(X(S.x[k]), 0.07, 0.02); d.style.left = ((s.x + 1) / 2 * q.width) + 'px'; d.style.top = ((1 - s.y) / 2 * q.height) + 'px'; d.textContent = noms[k] + ' = ' + fr(M.lectureRegleCm(S.x[k]), 1) + ' cm';
      });
    }
    window.__tick = function () {
      var b = false;
      if (cam) { var u = Math.min(1, (performance.now() - cam.t0) / 600), e = u * u * (3 - 2 * u); camera.position.lerpVectors(cam.p0, cam.p1, e); controls.target.lerpVectors(cam.g0, cam.g1, e); controls.update(); if (u >= 1) cam = null; b = true; }
      var hk = S.drag || S.hover; if (hk && S.placed[hk]) { halo.visible = true; halo.position.x = X(S.x[hk]); b = true; } else if (halo.visible) { halo.visible = false; b = true; }
      etiquettes(); var r = sale || b; sale = false; return r;
    };
    vue('ensemble'); camera.position.set(0, 0.5, 1.32); controls.target.set(0, 0.1, 0); controls.update();

    return {
      etat: S, vue: vue, synchroniser: synchroniser,
      placer: function (k, oui) { S.placed[k] = oui; synchroniser(); },
      allumer: function (b) { S.allume = b; synchroniser(); }, methode: function (i) { S.methode = i; synchroniser(); },
      indice: function () { if (S.indice < (S.max || 1) - 1) S.indice++; synchroniser(); },
      assistant: assistant,
      detruire: function () { window.__tick = null; scene.remove(G); if (ancien) ancien.visible = true; controls.enabled = true; controls.minAzimuthAngle = sauve.az0; controls.maxAzimuthAngle = sauve.az1; controls.minDistance = sauve.min; controls.maxDistance = sauve.max; controls.maxPolarAngle = sauve.pol; }
    };
  }
  window.BancInteractif = { creer: creer, METHODES: METHODES, CAUSES: CAUSES, TITRE_ERR: TITRE_ERR, fr: fr };
}());
