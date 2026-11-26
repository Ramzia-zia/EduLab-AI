// Migration des ions, osmose (pomme de terre) et constituants d'un sol au niveau de la SPEC.
// Socle commun : glisser un objet sur un emplacement, toucher, tourner, secouer ; le moteur (labo_core) fait tous les calculs.
(function () {
  'use strict';
  function fr(x, d) { return (x === null || x === undefined || isNaN(x)) ? '' : x.toFixed(d === undefined ? 1 : d).replace('.', ','); }
  function cl(x, a, b) { return Math.max(a, Math.min(b, x)); }
  var CAUSES = {
    gants_oublies: 'Le permanganate de potassium tache la peau et les vêtements : on met des gants avant de manipuler les cristaux.',
    court_circuit_generateur: 'Relier directement les deux bornes du générateur donne un courant très intense qui peut détruire le générateur.',
    grand_calibre_oublie: 'On commence par le plus grand calibre pour protéger l\'appareil, puis on le diminue.',
    calibre_trop_petit: 'Quand l\'aiguille dépasse l\'échelle le calibre est trop petit : la mesure est impossible.',
    lecture_cadran: 'La mesure vaut C x l / D : une lecture ou un calibre faux donne une valeur fausse.',
    electrode_inversee: 'Les ions de charge positive vont vers la cathode (borne négative) et ceux de charge négative vers l\'anode (borne positive).',
    tubes_identiques: 'Pour comparer l\'effet de la concentration il faut des tubes qui contiennent des solutions différentes.',
    mesure_trop_tot: 'Les échanges d\'eau par osmose sont lents : mesurer trop tôt donne des longueurs presque inchangées.',
    lecture_longueur: 'La longueur se lit sur la règle graduée, tranche à plat, avec la précision du millimètre.',
    agitation_insuffisante: 'Sans agitation prolongée les agrégats de terre ne sont pas dispersés : les couches ne sont pas correctement séparées.',
    lecture_hauteur: 'Chaque hauteur se lit sur la règle graduée, à la limite entre deux couches.',
    pourcentage_faux: 'Le pourcentage d\'une couche est sa hauteur divisée par la hauteur de terre totale, multipliée par 100.'
  };
  var TITRE = { gants_oublies: 'Gants oubliés', court_circuit_generateur: 'Court-circuit du générateur', grand_calibre_oublie: 'Plus grand calibre oublié', calibre_trop_petit: 'Calibre trop petit', lecture_cadran: 'Lecture du cadran fausse', electrode_inversee: 'Électrodes inversées', tubes_identiques: 'Deux tubes identiques', mesure_trop_tot: 'Mesure avant la fin du temps prévu', lecture_longueur: 'Longueur mal mesurée', agitation_insuffisante: 'Agitation insuffisante', lecture_hauteur: 'Hauteur mal lue', pourcentage_faux: 'Pourcentage faux' };
  var NOM = { alimentation: 'Alimentation', rheostat: 'Rhéostat', amperemetre: 'Ampèremètre', papier_filtre: 'Papier-filtre imbibé', electrode_a: 'Électrode A', electrode_b: 'Électrode B', cristal_sulfate_cuivre: 'Cristal de sulfate de cuivre', cristal_permanganate: 'Cristal de permanganate', gants: 'Gants', spatule: 'Spatule', interrupteur_k: 'Interrupteur K', fils: 'Fils', tube_1: 'Tube 1', tube_2: 'Tube 2', tube_3: 'Tube 3', tube_4: 'Tube 4', pomme_de_terre: 'Pomme de terre', couteau: 'Couteau', regle: 'Règle', bocal: 'Bocal', regle_graduee: 'Règle graduée', terre: 'Terre', eau: 'Eau' };
  var SOL = { eau_distillee: 'Eau distillée', solution_saccharose_125: 'Saccharose 125 g/L', solution_saccharose_250: 'Saccharose 250 g/L', solution_saccharose_375: 'Saccharose 375 g/L' };

  function creer(kind, L3, hote, tagsEl, zone, API) {
    var T = L3.three, scene = T.scene, camera = T.camera, controls = T.controls, R = {};
    scene.traverse(function (o) { if (o.type === 'Mesh') R.Mesh = o.constructor; if (o.type === 'Group') R.Group = o.constructor; if (o.geometry) R[o.geometry.type] = o.geometry.constructor; if (o.material) { R[o.material.type] = o.material.constructor; if (o.material.map) R.Tex = o.material.map.constructor; } });
    R.V3 = camera.position.constructor;
    var vieux = T.cap(); if (vieux) vieux.visible = false;
    var G = new R.Group(); scene.add(G);
    var sv = { az0: controls.minAzimuthAngle, az1: controls.maxAzimuthAngle, mn: controls.minDistance, mx: controls.maxDistance };
    controls.minAzimuthAngle = -0.9; controls.maxAzimuthAngle = 0.9; controls.minDistance = 0.2; controls.maxDistance = 1.5;
    var meta = API.meta(), S = { indice: 0, max: 1 }, sale = true, cam = null, drag = null, hover = null, depart = null, glisseId = null, gpos = null, slotsTag = [];
    function MS(o) { return new R.MeshStandardMaterial(o); }
    function rb(w, h, d, m, r) { var g = R.RoundedBoxGeometry ? new R.RoundedBoxGeometry(w, h, d, 4, r === undefined ? 0.004 : r) : (R.BoxGeometry ? new R.BoxGeometry(w, h, d) : new R.CylinderGeometry(Math.max(w, d) / 2, Math.max(w, d) / 2, h, 24)); var x = new R.Mesh(g, m); x.castShadow = x.receiveShadow = true; return x; }
    function cyl(a, b, h, m, ouvert) { var x = new R.Mesh(new R.CylinderGeometry(a, b, h, 32, 1, !!ouvert), m); x.castShadow = true; return x; }
    function sph(r, c) { var m = new R.Mesh(R.SphereGeometry ? new R.SphereGeometry(r, 16, 12) : new R.CylinderGeometry(r, r, r * 1.6, 16), MS({ color: c, roughness: 0.4 })); if (!R.SphereGeometry) m.rotation.x = Math.PI / 2; m.castShadow = true; return m; }
    function canvas(w, h) { var c = document.createElement('canvas'); c.width = w; c.height = h; var t = new R.Tex(c); t.anisotropy = 8; return { c: c, t: t, g: c.getContext('2d') }; }
    function plan(w, h, tx) { var m = new R.Mesh(new R.PlaneGeometry(w, h), new R.MeshBasicMaterial({ map: tx.t, transparent: true, toneMapped: false })); m.rotation.x = -Math.PI / 2; return m; }
    function ajout(o, g) { (g || G).add(o); return o; }
    var gris = MS({ color: 0x2b3340, roughness: 0.5, metalness: 0.3 }), fantome = MS({ color: 0x2b3340, transparent: true, opacity: 0.3 }), alu = MS({ color: 0xc9ced4, metalness: 0.9, roughness: 0.3 }), clair = MS({ color: 0xd9dde2, roughness: 0.45, metalness: 0.5 });
    var verre = new R.MeshPhysicalMaterial({ color: 0xcfe6e0, transmission: 0.9, thickness: 0.006, ior: 1.5, roughness: 0.04, transparent: true, opacity: 0.5, side: 2 });
    var plaque = rb(1.0, 0.02, 0.7, MS({ color: 0xf1f3f4, roughness: 0.75 }), 0.004); plaque.position.set(0, 0.01, 0); plaque.castShadow = false; G.add(plaque);
    var cables = new R.Group(); G.add(cables);
    function cable(a, b, col) { var dx = b[0] - a[0], dy = b[1] - a[1], dz = b[2] - a[2], L = Math.sqrt(dx * dx + dy * dy + dz * dz); if (L < 1e-4) return; var g = new R.Group(); g.position.set(a[0], a[1], a[2]); g.lookAt(b[0], b[1], b[2]); var m = new R.Mesh(new R.CylinderGeometry(0.0026, 0.0026, L, 8), MS({ color: col, roughness: 0.5 })); m.rotation.x = Math.PI / 2; m.position.z = L / 2; m.castShadow = true; g.add(m); cables.add(g); }
    function E() { return API.vue(); } function has(id) { return Object.prototype.hasOwnProperty.call(E().materiel, id); } function reg(k, d) { var v = E().reglages[k]; return v === undefined ? d : v; }
    function knob(g, x, y, z) { var k = cyl(0.015, 0.017, 0.014, clair), m = cyl(0.002, 0.002, 0.006, MS({ color: 0x111111 })); m.position.set(0, 0.008, -0.009); k.add(m); k.position.set(x, y, z); g.add(k); return k; }
    function boite(x, z, w, d, h) { var g = new R.Group(); g.position.set(x, 0.02, z); var c = rb(w, h || 0.06, d, gris, 0.006); c.position.y = (h || 0.06) / 2; g.add(c); G.add(g); return { g: g, c: c }; }
    function ecranLcd(g, w, h, x, y, z) { var a = canvas(200, 80), m = plan(w, h, a); m.position.set(x, y, z); g.add(m); return a; }
    function lcd(a, txt) { var g = a.g; g.fillStyle = '#b9c9a8'; g.fillRect(0, 0, 200, 80); g.fillStyle = '#1c2b17'; g.font = 'bold 40px ui-monospace,monospace'; g.textAlign = 'center'; g.fillText(txt, 100, 56); a.t.needsUpdate = true; }
    function etiq(txt, x, z, w) { var c = canvas(256, 64); c.g.fillStyle = 'rgba(255,255,255,0)'; c.g.clearRect(0, 0, 256, 64); c.g.fillStyle = '#0D2149'; c.g.font = 'bold 28px system-ui'; c.g.textAlign = 'center'; c.g.fillText(txt, 128, 40); c.t.needsUpdate = true; var m = plan(w || 0.1, (w || 0.1) / 4, c); m.position.set(x, 0.0215, z); G.add(m); return m; }
    var env = { R: R, G: G, MS: MS, rb: rb, cyl: cyl, sph: sph, canvas: canvas, plan: plan, cable: cable, E: E, has: has, reg: reg, knob: knob, boite: boite, lcd: lcd, ecranLcd: ecranLcd, etiq: etiq, gris: gris, fantome: fantome, alu: alu, clair: clair, verre: verre, API: API, meta: meta, S: S, fr: fr, cl: cl, ajout: ajout };
    var C = BUILD[kind](env);
    // ---- pointeur
    var el = T.renderer.domElement, v3 = new R.V3(), halo = new R.Mesh(new R.CylinderGeometry(0.03, 0.03, 0.002, 28), new R.MeshBasicMaterial({ color: 0x1a73d1, transparent: true, opacity: 0.45, toneMapped: false })); halo.visible = false; G.add(halo);
    function q(e) { var r = el.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top, w: r.width, h: r.height }; }
    function pr(p, y) { var s = q({ clientX: 0, clientY: 0 }); v3.set(p[0], y === undefined ? 0.05 : y, p[1]); v3.project(camera); return { x: (v3.x + 1) / 2 * s.w, y: (1 - v3.y) / 2 * s.h }; }
    function planY(e) { var s = q(e), nx = s.x / s.w * 2 - 1, ny = -(s.y / s.h * 2 - 1), a = camera.position.clone(), b = new R.V3(nx, ny, 0.5).unproject(camera), d = b.sub(a); if (Math.abs(d.y) < 1e-6) return null; var t = (0.05 - a.y) / d.y; return [a.x + d.x * t, a.z + d.z * t]; }
    var ITEMS = C.items, HS = C.hs;
    function trouver(e) { var s = q(e), best = null, bd = 36; HS.forEach(function (h) { if (!h.vis()) return; var p = pr(h.pos(), h.y), d = Math.hypot(p.x - s.x, p.y - s.y); if (d < bd) { bd = d; best = h; } }); ITEMS.forEach(function (m) { if (m.cache && m.cache()) return; var p = pr(m.pos(), m.y || 0.05), d = Math.hypot(p.x - s.x, p.y - s.y) + 6; if (d < bd) { bd = d; best = m; } }); return best; }
    function montrer(m) { effacer(); (m.slots ? m.slots() : []).forEach(function (sl) { var d = document.createElement('div'); d.className = 'tag-g act'; d.textContent = sl.n; sl.tag = d; tagsEl.appendChild(d); slotsTag.push(sl); }); }
    function effacer() { slotsTag.forEach(function (s) { if (s.tag && s.tag.parentNode) s.tag.parentNode.removeChild(s.tag); }); slotsTag = []; }
    hote.addEventListener('pointerdown', function (e) { var h = trouver(e); if (!h) return; e.stopPropagation(); controls.enabled = false; drag = h; var s = q(e); depart = { x: s.x, y: s.y, px: s.x, py: s.y, bouge: false, t0: h.t0 ? h.t0() : 0, path: 0 };
      if (h.mobile) { glisseId = h; gpos = h.pos().slice(); var w = planY(e); depart.ox = w ? gpos[0] - w[0] : 0; depart.oz = w ? gpos[1] - w[1] : 0; montrer(h); } if (h.debut) h.debut(); try { hote.setPointerCapture(e.pointerId); } catch (_) { } sale = true; T.dirty(); }, true);
    window.addEventListener('pointermove', function (e) { var s = q(e);
      if (drag) { var dx = s.x - depart.x, dy = s.y - depart.y; if (Math.hypot(dx, dy) > 6) depart.bouge = true; depart.path += Math.hypot(s.x - depart.px, s.y - depart.py); depart.vy = s.y - depart.py; depart.px = s.x; depart.py = s.y;
        if (drag.kind === 'drag') drag.drag(dx, dy, depart.t0); else if (drag.kind === 'secouer') { if (drag.secoue) drag.secoue(depart.path, Math.abs(depart.vy || 0)); } else if (glisseId) { var w = planY(e); if (w) { gpos = [cl(w[0] + depart.ox, -0.46, 0.46), cl(w[1] + depart.oz, -0.32, 0.32)]; glisseId.obj.position.set(gpos[0], 0.06, gpos[1]); } } sale = true; return; }
      if (!hote.contains(e.target)) return; var k = trouver(e); if (k !== hover) { hover = k; el.style.cursor = k ? 'pointer' : ''; sale = true; T.dirty(); } });
    function fin() { if (!drag) return; var h = drag; drag = null; controls.enabled = true;
      if (h.kind === 'tap' && !depart.bouge) h.tap();
      if (h.kind === 'secouer' && h.fin) h.fin(depart.path);
      if (h.mobile) { glisseId = null; var best = null, bd = 0.1; slotsTag.forEach(function (sl) { var d = Math.hypot(sl.p[0] - gpos[0], sl.p[1] - gpos[1]); if (d < bd) { bd = d; best = sl; } }); if (!depart.bouge && h.slots && h.slots().length === 1) best = h.slots()[0]; if (best) best.go(); h.obj.position.set(h.home[0], 0.02, h.home[1]); effacer(); C.maj(); }
      sale = true; T.dirty(); }
    window.addEventListener('pointerup', fin); window.addEventListener('pointercancel', fin);
    // ---- caméra
    function vue(n) { var to = C.vues[n] || C.vues.ensemble; cam = { t0: performance.now(), p0: camera.position.clone(), g0: controls.target.clone(), p1: new R.V3(to.p[0], to.p[1], to.p[2]), g1: new R.V3(to.t[0], to.t[1], to.t[2]) }; sale = true; T.dirty(); }
    camera.position.set(C.vues.ensemble.p[0], C.vues.ensemble.p[1], C.vues.ensemble.p[2]); controls.target.set(C.vues.ensemble.t[0], C.vues.ensemble.t[1], C.vues.ensemble.t[2]); controls.update();
    function majTags() { HS.concat(ITEMS).forEach(function (h) { var d = h.tg; if (!d) { d = h.tg = document.createElement('div'); d.className = 'tag-g'; tagsEl.appendChild(d); } var act = (hover === h || drag === h), ok = h.vis ? h.vis() : true; if (h.cache && h.cache() && !act) ok = false; if (!h.kind && h.placed && h.placed() && !act) ok = false; d.hidden = !ok; if (!ok) return; var p = pr(h.pos(), h.y || 0.05); d.style.left = p.x + 'px'; d.style.top = (act ? p.y - 22 : p.y) + 'px'; var tx = h.texte ? h.texte() : ''; d.textContent = h.nom + (tx ? ' : ' + tx : ''); d.className = 'tag-g' + (act ? ' act' : ''); });
      slotsTag.forEach(function (sl) { var p = pr(sl.p, 0.06); sl.tag.style.left = p.x + 'px'; sl.tag.style.top = p.y + 'px'; }); }
    var lastA = 0, lastCle = '', dernier = performance.now();
    window.__tick = function () { var now = performance.now(), dt = Math.min(0.05, (now - dernier) / 1000); dernier = now; var b = false;
      if (cam) { var u = Math.min(1, (now - cam.t0) / 600), k = u * u * (3 - 2 * u); camera.position.lerpVectors(cam.p0, cam.p1, k); controls.target.lerpVectors(cam.g0, cam.g1, k); controls.update(); if (u >= 1) cam = null; b = true; }
      var hv = hover || drag; if (hv && hv.pos && hv.kind) { halo.visible = true; var p = hv.pos(); halo.position.set(p[0], hv.y || 0.06, p[1]); halo.rotation.x = Math.PI / 2; b = true; } else halo.visible = false;
      if (C.tick && C.tick(dt, drag)) b = true; majTags();
      if (now - lastA > 500) { lastA = now; var e = E(), cle = JSON.stringify([e.materiel, e.reglages, (e.mesures || []).length]); if (cle !== lastCle) { lastCle = cle; S.indice = 0; } var a = C.assistant(function () { var ar = arguments, i = Math.min(S.indice, ar.length - 1); S.max = ar.length; return { texte: ar[i], plus: i < ar.length - 1 }; }); API.cb.assistant(a.texte, !!a.plus); }
      var r = sale || b; sale = false; return r; };
    // ---- interface : vues, temps, cahier
    function bouton(t, f) { var b = document.createElement('button'); b.type = 'button'; b.className = 'btn'; b.textContent = t; b.addEventListener('click', f); return b; }
    function ligne(lbl, n) { var d = document.createElement('div'); d.className = 'ligne'; if (lbl) { var l = document.createElement('label'), s = document.createElement('span'); s.textContent = lbl; l.appendChild(s); d.appendChild(l); } d.appendChild(n); zone.appendChild(d); return d; }
    var barre = document.createElement('div'); barre.className = 'seg'; Object.keys(C.vuesNoms).forEach(function (id) { barre.appendChild(bouton(C.vuesNoms[id], function () { vue(id); })); }); ligne('', barre);
    if (C.temps) { var tm = document.createElement('div'); tm.className = 'seg'; C.temps.forEach(function (t) { tm.appendChild(bouton(t[0], function () { API.avancer(t[1]); })); }); var lt = ligne('Laisser passer le temps', tm), hz = document.createElement('b'); lt.querySelector('label').appendChild(hz); C.horloge = hz; }
    if (C.extra) C.extra(zone, ligne, bouton);
    var th = document.createElement('h2'); th.className = 'etiq'; th.textContent = 'Cahier de laboratoire'; zone.appendChild(th);
    var sel = document.createElement('select'); meta.grandeurs.forEach(function (g) { var o = document.createElement('option'); o.value = g; o.textContent = g.replace(/_(cm|ma|min)$/, '').replace(/_/g, ' '); sel.appendChild(o); }); ligne('Grandeur', sel);
    var iV = document.createElement('input'); iV.type = 'text'; iV.setAttribute('inputmode', 'decimal'); iV.placeholder = 'valeur'; var iU = document.createElement('input'); iU.type = 'text'; iU.placeholder = 'unité'; function unite() { var g = sel.value, m = /_(cm|ma|min)$/.exec(g); iU.value = m ? { cm: 'cm', ma: 'mA', min: 'min' }[m[1]] : (/pourcentage/.test(g) ? '%' : ''); iV.placeholder = /^electrode_/.test(g) ? 'anode ou cathode' : 'valeur'; } sel.addEventListener('change', unite); unite(); var rr = document.createElement('div'); rr.className = 'seg'; rr.appendChild(iV); rr.appendChild(iU); ligne('Valeur et unité', rr);
    var liste = document.createElement('div'); var bn = bouton('Noter dans le cahier', function () { var txt = String(iV.value).trim(); var v = /^electrode_/.test(sel.value) ? txt : parseFloat(txt.replace(',', '.')); if (v === '' || (typeof v === 'number' && isNaN(v))) return; API.faire('mesurer', { grandeur_id: sel.value, valeur: v, unite: iU.value }); iV.value = ''; });
    var rn = document.createElement('div'); rn.className = 'ligne'; rn.appendChild(bn); zone.appendChild(rn); zone.appendChild(liste);
    function notes() { liste.textContent = ''; var ms = E().mesures || []; if (!ms.length) return; var tb = document.createElement('tbody'); ms.forEach(function (m) { var tr = document.createElement('tr'), a = document.createElement('td'), c = document.createElement('td'); a.textContent = String(m.grandeur).replace(/_/g, ' '); c.textContent = String(m.saisie).replace('.', ',') + ' ' + (m.unite || ''); tr.appendChild(a); tr.appendChild(c); tb.appendChild(tr); }); var t = document.createElement('table'); t.appendChild(tb); liste.appendChild(t); }
    function maj() { C.maj(); notes(); if (C.horloge) C.horloge.textContent = fr(E().tempsS / 60, 0) + ' min écoulées'; sale = true; T.dirty(); }
    maj();
    return { maj: maj, vue: vue, indice: function () { if (S.indice < (S.max || 1) - 1) S.indice++; },
      detruire: function () { window.__tick = null; scene.remove(G); tagsEl.textContent = ''; zone.textContent = ''; if (vieux) vieux.visible = true; controls.enabled = true; controls.minAzimuthAngle = sv.az0; controls.maxAzimuthAngle = sv.az1; controls.minDistance = sv.mn; controls.maxDistance = sv.mx; } };
  }
  var BUILD = {};
  function fixe(env, id, nomA, pos, obj, y) { return { id: id, nom: NOM[id] || nomA, mobile: false, pos: function () { return pos; }, y: y || 0.06, home: pos, obj: obj, placed: function () { return env.has(id); }, slots: null, kind: null, tap: function () { env.API.faire('placer_materiel', { materiel_id: id }); } }; }
  // les éléments « fixes » sont posés d'un toucher ; les « mobiles » se glissent sur leur emplacement
  function mobile(env, id, home, obj, slots) { return { id: id, nom: NOM[id] || id, mobile: true, pos: function () { return env.has(id) ? (slots()[0] ? slots()[0].p : home) : home; }, y: 0.05, home: home, obj: obj, placed: function () { return env.has(id); }, slots: slots }; }
  function tapItem(it) { it.kind = 'tap-item'; return it; }

  // ======================================================================= MIGRATION DES IONS
  BUILD.migration_ions = function (env) {
    var R = env.R, API = env.API, G = env.G, has = env.has, reg = env.reg, E = env.E, opt = env.meta.options, items = [], hs = [];
    var gen = env.boite(-0.38, -0.22, 0.16, 0.12, 0.07), ag = env.ecranLcd(gen.g, 0.075, 0.03, -0.03, 0.0712, -0.02), kT = env.knob(gen.g, 0.045, 0.078, -0.02); kT.rotation.x = 0;
    var rh = env.boite(-0.18, -0.22, 0.14, 0.12, 0.05), kR = env.knob(rh.g, 0, 0.058, -0.01); var am = env.boite(0.02, -0.22, 0.14, 0.12, 0.05), dial = env.canvas(300, 190), dm = env.plan(0.12, 0.076, dial); dm.position.set(0, 0.0512, -0.005); am.g.add(dm); var kA = env.knob(am.g, 0.05, 0.058, 0.03);
    var kb = env.boite(0.22, -0.22, 0.09, 0.07, 0.03), lv = new R.Group(); lv.position.set(-0.015, 0.03, 0); var lm = env.rb(0.04, 0.007, 0.007, env.alu, 0.001); lm.position.x = 0.02; lv.add(lm); kb.g.add(lv);
    var verreP = env.rb(0.34, 0.004, 0.14, env.verre, 0.002); verreP.position.set(0, 0.022, 0.06); G.add(verreP);
    var pt = env.canvas(512, 160), pm = env.plan(0.30, 0.094, pt); pm.position.set(0, 0.0262, 0.06); G.add(pm);
    function electrode(col) { var g = new R.Group(), b = env.rb(0.008, 0.032, 0.11, env.MS({ color: col, metalness: 0.7, roughness: 0.3 }), 0.002); b.position.y = 0.016; g.add(b); G.add(g); return g; }
    var eA = electrode(0xc9ced4), eB = electrode(0x6b7480);
    function vial(col) { var g = new R.Group(), c = env.cyl(0.014, 0.014, 0.04, env.MS({ color: 0xdfe8ee, transparent: true, opacity: 0.6 })), p = env.cyl(0.011, 0.011, 0.014, env.MS({ color: col })); c.position.y = 0.02; p.position.y = 0.045; g.add(c, p); G.add(g); return g; }
    var vC = vial(0x1a73d1), vP = vial(0x7b3fb5), gantsO = env.rb(0.07, 0.01, 0.1, env.MS({ color: 0x6fb8d9, roughness: 0.6 }), 0.004), spat = env.rb(0.01, 0.006, 0.12, env.alu, 0.002), fils = new R.Group(); var bob = env.cyl(0.026, 0.026, 0.024, env.MS({ color: 0xd6342c })); bob.position.y = 0.012; fils.add(bob);
    [gantsO, spat, fils].forEach(function (o) { G.add(o); });
    var HOME = { electrode_a: [-0.27, 0.25], electrode_b: [-0.19, 0.25], fils: [-0.08, 0.25], cuivre: [0.04, 0.25], perm: [0.12, 0.25], gants: [0.22, 0.25], spatule: [0.29, 0.25] };
    var OBJ = { electrode_a: eA, electrode_b: eB, gants: gantsO, spatule: spat, fils: fils, cuivre: vC, perm: vP };
    Object.keys(HOME).forEach(function (k) { OBJ[k].position.set(HOME[k][0], 0.02, HOME[k][1]); });
    function sl(e, p, n, id, extra) { return { e: e, p: p, n: n, go: function () { var v = { materiel_id: id }; if (e) v.emplacement_id = e; API.faire('placer_materiel', v); } }; }
    ['gants', 'spatule'].forEach(function (id, i) { items.push(mobile(env, id, HOME[id], OBJ[id], function () { return [sl(null, [0.28, 0.08 + i * 0.07], i ? 'Spatule : paillasse' : 'Enfiler les gants', id)]; })); });
    items.push(mobile(env, 'fils', HOME.fils, fils, function () { return [sl('circuit', [0.0, -0.12], 'Fils : circuit', 'fils'), sl('bornes_generateur', [-0.38, -0.10], 'Fils : bornes du générateur', 'fils')]; }));
    items.push(mobile(env, 'electrode_a', HOME.electrode_a, eA, function () { return [sl('gauche', [-0.17, 0.06], 'Électrode A à gauche', 'electrode_a'), sl('droite', [0.17, 0.06], 'Électrode A à droite', 'electrode_a')]; }));
    items.push(mobile(env, 'electrode_b', HOME.electrode_b, eB, function () { return [sl('gauche', [-0.17, 0.06], 'Électrode B à gauche', 'electrode_b'), sl('droite', [0.17, 0.06], 'Électrode B à droite', 'electrode_b')]; }));
    [['cuivre', 'cristal_sulfate_cuivre', 'Cristal de sulfate de cuivre'], ['perm', 'cristal_permanganate', 'Cristal de permanganate']].forEach(function (c) { var it = mobile(env, c[1], HOME[c[0]], OBJ[c[0]], function () { return [{ e: null, p: [0.0, 0.06], n: 'Au centre du papier', go: function () { API.faire('deposer_cristal', { materiel_id: c[1] }); } }]; }); it.nom = c[2]; it.placed = function () { var p = E().papier; return c[0] === 'cuivre' ? p.cuivreDepose : p.permanganateDepose; }; items.push(it); });
    [['alimentation', gen, [-0.38, -0.22]], ['rheostat', rh, [-0.18, -0.22]], ['amperemetre', am, [0.02, -0.22]], ['interrupteur_k', kb, [0.22, -0.22]]].forEach(function (a) { var it = fixe(env, a[0], a[0], a[2], a[1].g, 0.06); it.kind = 'tap'; it.vis = function () { return true; }; it.cache = function () { return has(a[0]); }; items.push(it); });
    var ip = fixe(env, 'papier_filtre', 'Papier', [0, 0.06], pm, 0.03); ip.kind = 'tap'; ip.cache = function () { return has('papier_filtre'); }; items.push(ip);
    hs.push({ id: 'u', nom: 'Tension', kind: 'drag', pos: function () { return [-0.335, -0.24]; }, y: 0.1, vis: function () { return has('alimentation'); }, t0: function () { return cl(reg('tension_generateur_v', 0) / opt.tension_max_v, 0, 1); }, drag: function (dx, dy, t0) { var v = Math.round(cl(t0 + (dx - dy) / 200, 0, 1) * opt.tension_max_v * 2) / 2; if (v !== reg('tension_generateur_v', 0)) API.faire('regler_tension', { tension_v: v }); }, texte: function () { return fr(reg('tension_generateur_v', 0), 1) + ' V'; } });
    hs.push({ id: 'r', nom: 'Rhéostat', kind: 'drag', pos: function () { return [-0.18, -0.23]; }, y: 0.08, vis: function () { return has('rheostat'); }, t0: function () { return cl(reg('resistance_rheostat_ohm', opt.rheostat_max_ohm) / opt.rheostat_max_ohm, 0, 1); }, drag: function (dx, dy, t0) { var v = Math.round(cl(t0 + (dx - dy) / 200, 0, 1) * opt.rheostat_max_ohm / 5) * 5; if (v !== reg('resistance_rheostat_ohm', opt.rheostat_max_ohm)) API.faire('regler_rheostat', { resistance_ohm: v }); }, texte: function () { return fr(reg('resistance_rheostat_ohm', opt.rheostat_max_ohm), 0) + ' ohms'; } });
    hs.push({ id: 'k', nom: 'Interrupteur K', kind: 'tap', pos: function () { return [0.22, -0.22]; }, y: 0.06, vis: function () { return has('interrupteur_k'); }, tap: function () { API.faire(reg('interrupteur_ferme', false) ? 'ouvrir_interrupteur' : 'fermer_interrupteur'); }, texte: function () { return reg('interrupteur_ferme', false) ? 'fermé' : 'ouvert'; } });
    hs.push({ id: 'c', nom: 'Calibre', kind: 'tap', pos: function () { return [0.07, -0.19]; }, y: 0.08, vis: function () { return has('amperemetre'); }, tap: function () { var l = opt.calibre_a, k = l.indexOf(reg('calibre_amperemetre', l[l.length - 1])); API.faire('choisir_calibre', { materiel_id: 'amperemetre', calibre_a: l[(k + 1) % l.length] }); }, texte: function () { return fr(reg('calibre_amperemetre', 3), 1).replace(',0', '') + ' A'; } });
    function papier() { var g = pt.g, p = E().papier, w = 512, h = 160; g.fillStyle = has('papier_filtre') ? '#efe6c6' : 'rgba(0,0,0,0)'; g.clearRect(0, 0, w, h); if (!has('papier_filtre')) { pt.t.needsUpdate = true; return; } g.fillStyle = '#efe6c6'; g.fillRect(0, 0, w, h); g.strokeStyle = '#d9cd9f'; g.strokeRect(1, 1, w - 2, h - 2);
      function tache(x, col, rx) { var gr = g.createRadialGradient(x, h / 2, 2, x, h / 2, rx); gr.addColorStop(0, col); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.beginPath(); g.ellipse(x, h / 2, rx, rx * 0.55, 0, 0, 6.3); g.fill(); }
      var cx = w / 2, d = 190; if (p.cuivreDepose) { var x = cx - 14 + p.positionCuivre * d * 0.5 * (reg('interrupteur_ferme', false) || p.positionCuivre !== 0 ? 1 : 0); tache(x, 'rgba(26,115,209,0.85)', 30 + Math.abs(p.positionCuivre) * 22); } if (p.permanganateDepose) { var x2 = cx + 14 + p.positionPermanganate * d * 0.5; tache(x2, 'rgba(123,63,181,0.9)', 30 + Math.abs(p.positionPermanganate) * 22); } pt.t.needsUpdate = true; }
    function cadran() { var g = dial.g, p = E().papier, W = 300, H = 190, cx = 150, cy = 170, Rr = 130; g.fillStyle = '#f2f1e6'; g.fillRect(0, 0, W, H); if (!has('amperemetre')) { dial.t.needsUpdate = true; return; } g.strokeStyle = '#0D2149'; g.fillStyle = '#0D2149'; g.textAlign = 'center'; g.font = 'bold 14px system-ui';
      for (var d = 0; d <= 100; d += 2) { var an = (-60 + 120 * d / 100) * Math.PI / 180, big = d % 10 === 0, r2 = Rr - (big ? 16 : 8); g.lineWidth = big ? 2 : 1; g.beginPath(); g.moveTo(cx + Rr * Math.sin(an), cy - Rr * Math.cos(an)); g.lineTo(cx + r2 * Math.sin(an), cy - r2 * Math.cos(an)); g.stroke(); if (d % 20 === 0) g.fillText(String(d), cx + (Rr - 30) * Math.sin(an), cy - (Rr - 30) * Math.cos(an) + 5); }
      g.font = 'bold 16px system-ui'; g.fillText('calibre ' + fr(reg('calibre_amperemetre', 3), 1).replace(',0', '') + ' A', cx, 52); var dv = p.aiguilleDiv === null || p.aiguilleDiv === undefined ? 0 : cl(p.aiguilleDiv, -4, 104), ag2 = (-60 + 120 * dv / 100) * Math.PI / 180; g.strokeStyle = '#D6342C'; g.lineWidth = 3; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + (Rr - 6) * Math.sin(ag2), cy - (Rr - 6) * Math.cos(ag2)); g.stroke(); if (p.horsEchelle) { g.fillStyle = '#C9332B'; g.fillText('hors échelle', cx, 90); } dial.t.needsUpdate = true; }
    function fils3d() { while (env.G.children.length && false) { } var cs = env.G.children.filter(function (o) { return o.userData && o.userData.fil; }); }
    function maj() {
      var M = E().materiel; [['alimentation', gen], ['rheostat', rh], ['amperemetre', am], ['interrupteur_k', kb]].forEach(function (a) { a[1].c.material = has(a[0]) ? env.gris : env.fantome; }); pm.visible = true; verreP.visible = has('papier_filtre');
      env.lcd(ag, has('alimentation') ? fr(reg('tension_generateur_v', 0), 1) + ' V' : '--'); kT.rotation.y = -2.2 + 4.4 * cl(reg('tension_generateur_v', 0) / opt.tension_max_v, 0, 1); kR.rotation.y = -2.2 + 4.4 * cl(reg('resistance_rheostat_ohm', opt.rheostat_max_ohm) / opt.rheostat_max_ohm, 0, 1); kA.rotation.y = -1.6 + 3.2 * Math.max(0, opt.calibre_a.indexOf(reg('calibre_amperemetre', 3))) / 3;
      lv.rotation.z = reg('interrupteur_ferme', false) ? 0 : 0.6; papier(); cadran();
      var pa = E().papier; ['electrode_a', 'electrode_b'].forEach(function (id) { var o = id === 'electrode_a' ? eA : eB, e = M[id]; if (has(id) && e) o.position.set(e === 'gauche' ? -0.17 : 0.17, 0.03, 0.06); else o.position.set(HOME[id][0], 0.02, HOME[id][1]); });
      gantsO.position.set.apply(gantsO.position, has('gants') ? [0.28, 0.03, 0.08] : [HOME.gants[0], 0.02, HOME.gants[1]]); spat.position.set.apply(spat.position, has('spatule') ? [0.28, 0.03, 0.15] : [HOME.spatule[0], 0.02, HOME.spatule[1]]);
      fils.position.set.apply(fils.position, [HOME.fils[0], 0.02, HOME.fils[1]]);
      while (env.G.children.length && 0) { } // câbles
      var cs = env.G.children.filter(function (o) { return false; });
      var cab = env.G.children.find(function (o) { return o.userData && o.userData.cab; }); 
      drawCables();
    }
    function drawCables() { var cg = env.G.children[env.G.children.indexOf(env.G.children.find(function (o) { return o.isGroup && o.userData.cab; }))]; }
    var cabG = new R.Group(); cabG.userData = { cab: true }; env.G.add(cabG);
    var oldMaj = maj; maj = function () { oldMaj(); while (cabG.children.length) cabG.remove(cabG.children[0]);
      var M = E().materiel; if (!has('alimentation')) return;
      function c3(a, b, col) { var dx = b[0] - a[0], dy = b[1] - a[1], dz = b[2] - a[2], L = Math.sqrt(dx * dx + dy * dy + dz * dz); if (L < 1e-4) return; var g = new R.Group(); g.position.set(a[0], a[1], a[2]); g.lookAt(b[0], b[1], b[2]); var m = new R.Mesh(new R.CylinderGeometry(0.0026, 0.0026, L, 8), env.MS({ color: col, roughness: 0.5 })); m.rotation.x = Math.PI / 2; m.position.z = L / 2; g.add(m); cabG.add(g); }
      if (M.fils === 'bornes_generateur') { c3([-0.41, 0.05, -0.155], [-0.35, 0.05, -0.155], 0xd6342c); return; } if (M.fils !== 'circuit') return;
      var zf = -0.14, y = 0.05, rouge = 0xd6342c, noir = 0x15181c, bornes = [[-0.41, -0.35], [-0.18 - 0.03, -0.18 + 0.03], [0.02 - 0.03, 0.02 + 0.03], [0.22 - 0.025, 0.22 + 0.025]];
      var chaine = [[-0.35, zf]]; if (has('rheostat')) chaine.push([-0.21, zf], [-0.15, zf]); if (has('amperemetre')) chaine.push([-0.01, zf], [0.05, zf]); if (has('interrupteur_k')) chaine.push([0.195, zf], [0.245, zf]);
      for (var i = 0; i < chaine.length - 1; i += 2) { }
      var pts = chaine; for (var j = 0; j < pts.length - 1; j++) c3([pts[j][0], y, pts[j][1]], [pts[j + 1][0], y, pts[j + 1][1]], rouge);
      var ea = M.electrode_a, eb = M.electrode_b, last = pts[pts.length - 1];
      if (ea) { var xa = ea === 'gauche' ? -0.17 : 0.17; c3([last[0], y, last[1]], [xa, 0.05, 0.0], rouge); c3([xa, 0.05, 0.0], [xa, 0.045, 0.06], rouge); }
      if (eb) { var xb = eb === 'gauche' ? -0.17 : 0.17; c3([xb, 0.045, 0.06], [xb, 0.05, 0.12], noir); c3([xb, 0.05, 0.12], [-0.41, 0.05, 0.12], noir); c3([-0.41, 0.05, 0.12], [-0.41, 0.05, -0.155], noir); }
    };
    var mm = maj;
    function tick(dt) { return false; }
    function assistant(h) { var e = E(), p = e.papier, M = e.materiel; var cs = e.conseils && e.conseils.length ? e.conseils[e.conseils.length - 1] : null;
      if (!has('papier_filtre') || !has('alimentation')) return h('Le montage commence par le papier-filtre et le générateur.', 'Touche les éléments en pointillé sur la plaque.', 'Pose le papier imbibé, l\'alimentation, le rhéostat, l\'ampèremètre et K.');
      if (!has('gants')) return h('Un des cristaux tache la peau.', 'Une protection est sur la paillasse à droite.', 'Glisse les gants sur leur emplacement avant de manipuler les cristaux.');
      if (!p.cuivreDepose || !p.permanganateDepose) return h('Il faut les deux cristaux côte à côte au centre du papier.', 'Glisse chaque cristal vers le centre du papier.', 'Dépose le cristal bleu et le cristal violet au centre.');
      if (!M.electrode_a || !M.electrode_b) return h('Où faut-il relier le courant ?', 'Une électrode de chaque côté du dépôt, à égale distance.', 'Glisse chaque électrode à une extrémité du papier.');
      if (M.fils === undefined) return h('Rien n\'est relié.', 'Observe la bobine de fils.', 'Glisse les fils sur le circuit.');
      if (!reg('interrupteur_ferme', false) && p.courantA === 0) return h('Avant de fermer K : quel est le plus grand calibre de l\'ampèremètre ?', 'Règle une tension faible.', 'Choisis le plus grand calibre, puis ferme K.');
      if (cs && cs.niveau === 'avertissement') return { texte: cs.message, plus: false };
      if (reg('interrupteur_ferme', false) && e.tempsS < 600) return { texte: 'Laisse passer le courant une dizaine de minutes sans toucher au montage. Observe le dépôt.', plus: false };
      return { texte: 'Ouvre K, observe où sont les taches, puis note tes observations dans le cahier.', plus: false }; }
    return { items: items, hs: hs, maj: maj, tick: tick, assistant: assistant, vues: { ensemble: { p: [0, 1.05, 1.0], t: [0, 0, 0.04] }, papier: { p: [0, 0.4, 0.4], t: [0, 0.02, 0.06] }, commandes: { p: [-0.1, 0.5, 0.2], t: [-0.1, 0.03, -0.2] } }, vuesNoms: { ensemble: 'Ensemble', papier: 'Papier', commandes: 'Commandes' }, temps: [['+1 min', 60], ['+5 min', 300], ['+10 min', 600]] };
  };

  // ======================================================================= OSMOSE
  BUILD.osmose_pomme_de_terre = function (env) {
    var R = env.R, API = env.API, G = env.G, has = env.has, E = env.E, items = [], hs = [], S = { regle: null, mat: {} };
    var BOUT = ['eau_distillee', 'solution_saccharose_125', 'solution_saccharose_250', 'solution_saccharose_375'], XB = [-0.27, -0.09, 0.09, 0.27], XT = [-0.21, -0.07, 0.07, 0.21];
    BOUT.forEach(function (id, i) { var g = new R.Group(), c = env.cyl(0.035, 0.035, 0.13, env.verre, true); c.position.y = 0.065; var l = env.cyl(0.033, 0.033, 0.1, env.MS({ color: 0xe6f1f7, transparent: true, opacity: 0.85 })); l.position.y = 0.055; var cv = env.canvas(256, 128); cv.g.fillStyle = '#fff'; cv.g.fillRect(0, 0, 256, 128); cv.g.strokeStyle = '#0D2149'; cv.g.strokeRect(2, 2, 252, 124); cv.g.fillStyle = '#0D2149'; cv.g.textAlign = 'center'; cv.g.font = 'bold 30px system-ui'; var t = SOL[id].split(' '); cv.g.fillText(t[0] === 'Eau' ? 'Eau' : 'Saccharose', 128, 54); cv.g.font = '26px system-ui'; cv.g.fillText(t[0] === 'Eau' ? 'distillée' : t[1] + ' g/L', 128, 96); cv.t.needsUpdate = true; var e = new R.Mesh(new R.PlaneGeometry(0.05, 0.025), new R.MeshBasicMaterial({ map: cv.t, toneMapped: false })); e.position.set(0, 0.06, 0.0352); g.add(c, l, e); g.position.set(XB[i], 0.02, -0.22); G.add(g); });
    var rack = env.rb(0.6, 0.012, 0.1, env.MS({ color: 0xb98b5e, roughness: 0.6 }), 0.004); rack.position.set(0, 0.026, 0.1); G.add(rack);
    var tubes = [], tl = [];
    for (var i = 0; i < 4; i++) (function (i) { var g = new R.Group(), c = env.cyl(0.013, 0.013, 0.14, env.verre, true); c.position.y = 0.07; var f = env.cyl(0.0125, 0.0125, 0.003, env.verre); f.position.y = 0.0015; var l = env.cyl(0.0122, 0.0122, 0.095, env.MS({ color: 0xe9f3f8, transparent: true, opacity: 0.8 })); l.position.y = 0.05; var cv = env.canvas(256, 64); var lab = env.plan(0.07, 0.0175, cv); lab.rotation.x = 0; lab.position.set(0, 0.165, 0); g.add(c, f, l, lab); var sl = []; for (var k = 0; k < 4; k++) { var s = env.cyl(0.009, 0.009, 0.003, env.MS({ color: 0xe9dfb0, roughness: 0.8 })); s.rotation.z = 0.3 * (k - 1.5); s.position.set((k - 1.5) * 0.002, 0.012 + k * 0.006, 0); s.visible = false; g.add(s); sl.push(s); } g.position.set(XT[i], 0.032, 0.1); G.add(g); tubes.push({ g: g, l: l, cv: cv, sl: sl, lab: lab }); }(i));
    var cab = new R.Group(); G.add(cab);
    var potato = new R.Mesh(R.SphereGeometry ? new R.SphereGeometry(0.035, 20, 14) : new R.CylinderGeometry(0.035, 0.035, 0.05, 20), env.MS({ color: 0xc9a56b, roughness: 0.9 })); potato.scale.set(1.3, 0.8, 1); potato.position.set(-0.33, 0.05, 0.0); potato.castShadow = true; G.add(potato);
    var knife = env.rb(0.012, 0.004, 0.12, env.alu, 0.001); knife.position.set(-0.33, 0.025, 0.09); G.add(knife);
    var rc = env.canvas(1024, 64), rg = rc.g; rg.fillStyle = '#f3e6bd'; rg.fillRect(0, 0, 1024, 64); rg.fillStyle = '#111'; rg.font = 'bold 18px system-ui'; rg.textAlign = 'center'; for (var mm = 0; mm <= 150; mm++) { var x = 4 + mm * (1016 / 150), g2 = mm % 10 === 0 ? 30 : (mm % 5 === 0 ? 20 : 12); rg.fillRect(x, 0, mm % 10 === 0 ? 2 : 1, g2); if (mm % 10 === 0) rg.fillText(String(mm / 10), Math.min(Math.max(x, 12), 1012), 52); } rc.t.needsUpdate = true;
    var rule = env.plan(0.30, 0.0188, rc); rule.position.set(0, 0.0235, 0.26); G.add(rule); rule.visible = false;
    var sliceG = new R.Group(); G.add(sliceG);
    function tranches(L, n) { while (sliceG.children.length) sliceG.remove(sliceG.children[0]); if (L === null) return; var vars = [-0.03, 0.02, 0.04, -0.015]; for (var k = 0; k < 4; k++) { var Lk = L * (1 + vars[k] * 0.5), s = env.rb(Lk * 0.02, 0.006, 0.012, env.MS({ color: 0xe9dfb0, roughness: 0.8 }), 0.001); s.position.set(-0.15 + Lk * 0.01 + 0.006, 0.03, 0.27 - 0.008 + (k - 1.5) * 0.0); s.position.z = 0.27 - 0.004; s.position.y = 0.03 + k * 0.0; s.position.z = 0.215 + k * 0.012 - 0.0; sliceG.add(s); } }
    ['pomme_de_terre', 'couteau', 'regle'].forEach(function (id) { var pos = id === 'pomme_de_terre' ? [-0.33, 0.0] : id === 'couteau' ? [-0.33, 0.09] : [0, 0.26]; var it = fixe(env, id, id, pos, null, 0.05); it.kind = 'tap'; it.cache = function () { return has(id); }; items.push(it); });
    for (var t = 0; t < 4; t++) (function (t) { var id = 'tube_' + (t + 1); var it = mobile(env, id, [XT[t], 0.1], tubes[t].g, function () { return BOUT.map(function (b, i) { return { e: b, p: [XB[i], -0.2], n: SOL[b], go: function () { API.faire('placer_materiel', { materiel_id: id, emplacement_id: b }); } }; }); }); it.nom = 'Tube ' + (t + 1); it.pos = function () { return [XT[t], 0.1]; }; it.y = 0.1; items.push(it);
      hs.push({ id: 'tr' + t, nom: 'Introduire les tranches', kind: 'tap', pos: function () { return [XT[t], 0.1]; }, y: 0.19, vis: function () { return has(id) && !E().tubes[id].tranches && has('pomme_de_terre') && has('couteau'); }, tap: function () { API.faire('introduire_tranches', { tube_id: id }); }, texte: function () { return ''; } }); }(t));
    function maj() { var e = E(); tubes.forEach(function (tb, i) { var id = 'tube_' + (i + 1), d = e.tubes[id], plc = has(id); tb.l.visible = plc; var g = tb.cv.g; g.fillStyle = '#fff'; g.fillRect(0, 0, 256, 64); if (plc && d.solution) { g.fillStyle = '#0D2149'; g.font = 'bold 26px system-ui'; g.textAlign = 'center'; g.fillText(SOL[d.solution], 128, 42); } tb.cv.t.needsUpdate = true; tb.lab.visible = plc; tb.sl.forEach(function (s) { s.visible = !!d.tranches; });
        if (!drag0()) tb.g.position.set(XT[i], 0.032, 0.1); }); potato.visible = has('pomme_de_terre'); knife.visible = has('couteau'); rule.visible = has('regle'); var sel = S.regle; if (sel === 'neuve') tranches(2.7); else if (sel) tranches(E().tubes[sel].longueurCm); else tranches(null); if (!has('regle')) tranches(null); }
    function drag0() { return false; }
    function extra(zone, ligne, bouton) { var s = document.createElement('div'); s.className = 'seg'; [['neuve', 'Tranche neuve'], ['tube_1', 'Tube 1'], ['tube_2', 'Tube 2'], ['tube_3', 'Tube 3'], ['tube_4', 'Tube 4'], [null, 'Ranger']].forEach(function (a) { s.appendChild(bouton(a[1], function () { if (!has('regle')) return; if (a[0] && a[0] !== 'neuve' && !E().tubes[a[0]].tranches) return; S.regle = a[0]; maj(); })); }); ligne('Poser des tranches sur la règle', s); }
    function assistant(h) { var e = E(), cs = e.conseils && e.conseils.length ? e.conseils[e.conseils.length - 1] : null, np = [1, 2, 3, 4].filter(function (n) { return has('tube_' + n); }).length;
      if (!has('pomme_de_terre') || !has('couteau') || !has('regle')) return h('Il manque le nécessaire pour préparer les tranches.', 'Une pomme de terre, un couteau et une règle sont sur la paillasse.', 'Touche chacun des éléments en pointillé pour le poser.');
      if (np < 4) return h('Quels milieux vas-tu comparer ?', 'Chaque tube prend une solution différente.', 'Glisse chaque tube vers un des flacons.');
      if (cs && cs.niveau === 'avertissement') return { texte: cs.message, plus: false };
      if (!(e.mesures || []).some(function (m) { return m.grandeur === 'longueur_initiale_cm'; }) && !Object.keys(e.tubes).some(function (k) { return e.tubes[k].tranches; })) return h('Avant d\'introduire les tranches, que dois-tu connaître ?', 'Mesure une tranche neuve sur la règle.', 'Pose une tranche neuve sur la règle, lis sa longueur et note-la.');
      var ntr = Object.keys(e.tubes).filter(function (k) { return e.tubes[k].tranches; }).length; if (ntr < 4) return h('Tous les tubes doivent recevoir leurs tranches.', 'Touche le haut d\'un tube.', 'Introduis les tranches dans chaque tube.');
      if (e.tempsS < 7200) return { texte: 'L\'osmose est lente. Laisse le temps passer sans toucher aux tubes.', plus: false };
      if ((e.mesures || []).length < 5) return h('Sors les tranches et compare leur longueur à la longueur initiale.', 'Pose les tranches de chaque tube sur la règle, l\'une après l\'autre.', 'Lis la longueur moyenne de chaque tube et note-la.');
      return { texte: 'Compare les longueurs : que se passe-t-il pour l\'eau entre les cellules et leur milieu ?', plus: false }; }
    return { items: items, hs: hs, maj: maj, tick: function () { return false; }, assistant: assistant, extra: extra, vues: { ensemble: { p: [0, 0.9, 0.95], t: [0, 0.0, 0.05] }, tubes: { p: [0, 0.3, 0.38], t: [0, 0.1, 0.1] }, regle: { p: [0, 0.26, 0.52], t: [0, 0.03, 0.24] } }, vuesNoms: { ensemble: 'Ensemble', tubes: 'Tubes', regle: 'Règle' }, temps: [['+30 min', 1800], ['+1 h', 3600], ['+2 h', 7200]] };
  };

  // ======================================================================= CONSTITUANTS D'UN SOL
  BUILD.sol_constituants = function (env) {
    var R = env.R, API = env.API, G = env.G, has = env.has, E = env.E, items = [], hs = [], S = { sec: 0 };
    var jar = new R.Group(); jar.position.set(0, 0.02, 0); G.add(jar);
    var corps = env.cyl(0.062, 0.062, 0.17, env.verre, true); corps.position.y = 0.085; var fond = env.cyl(0.062, 0.062, 0.004, env.verre); fond.position.y = 0.002; var couv = env.cyl(0.066, 0.066, 0.016, env.MS({ color: 0xd6342c, roughness: 0.5 })); couv.position.y = 0.178; jar.add(corps, fond, couv);
    var eauM = env.cyl(0.0605, 0.0605, 1, env.MS({ color: 0xb9a07a, transparent: true, opacity: 0.0, roughness: 0.2 })), lSable = env.cyl(0.0605, 0.0605, 1, env.MS({ color: 0xd9bf8a, roughness: 0.9 })), lLimon = env.cyl(0.0605, 0.0605, 1, env.MS({ color: 0x9c7b52, roughness: 0.9 })), lArg = env.cyl(0.0605, 0.0605, 1, env.MS({ color: 0x8a4f33, roughness: 0.9 })), terreM = env.cyl(0.0605, 0.0605, 1, env.MS({ color: 0x6b4a30, roughness: 0.95 }));
    jar.add(eauM, lSable, lLimon, lArg, terreM);
    var rc = env.canvas(64, 1024), rg = rc.g; rg.fillStyle = 'rgba(243,230,189,0.92)'; rg.fillRect(0, 0, 64, 1024); rg.fillStyle = '#111'; rg.font = 'bold 18px system-ui'; for (var mm = 0; mm <= 150; mm++) { var y = 1024 - 6 - mm * (1012 / 150), g2 = mm % 10 === 0 ? 30 : (mm % 5 === 0 ? 20 : 12); rg.fillRect(0, y, g2, mm % 10 === 0 ? 2 : 1); if (mm % 10 === 0) rg.fillText(String(mm / 10), 34, y + 6); } rc.t.needsUpdate = true;
    var rule = new R.Mesh(new R.PlaneGeometry(0.02, 0.15), new R.MeshBasicMaterial({ map: rc.t, toneMapped: false })); rule.position.set(0.0, 0.098, 0.0635); jar.add(rule); rule.position.z = 0.0635; rule.position.y = 0.002 + 0.075;
    var sac = new R.Mesh(new R.CylinderGeometry(0.03, 0.04, 0.09, 16), env.MS({ color: 0x6b4a30, roughness: 0.95 })); sac.position.set(-0.3, 0.065, 0.05); G.add(sac); var carafe = env.cyl(0.032, 0.032, 0.11, env.verre, true); carafe.position.set(0.3, 0.075, 0.05); G.add(carafe); var cl2 = env.cyl(0.03, 0.03, 0.08, env.MS({ color: 0xbfe3f2, transparent: true, opacity: 0.8 })); cl2.position.set(0.3, 0.06, 0.05); G.add(cl2);
    var CM = 0.01; // 1 cm de couche = 1 cm de bocal
    function couche(m, y0, h) { m.visible = h > 0.0003; m.scale.y = Math.max(0.0001, h); m.position.y = 0.004 + y0 + h / 2; }
    function maj() { var b = E().bocal, plc = has('bocal'); jar.visible = true; corps.material = plc ? env.verre : env.fantome; couv.visible = plc; rule.visible = has('regle_graduee'); sac.visible = true; carafe.visible = true; cl2.visible = true;
      var sable = b.sable * CM, limon = b.limon * CM, arg = b.argile * CM, tot = 0.099, fr1 = b.fraction;
      var eauOK = b.eau && b.terre, haut = 0.13; terreM.visible = false; eauM.visible = false; [lSable, lLimon, lArg].forEach(function (l) { l.visible = false; });
      if (plc && b.terre && !b.eau) { terreM.visible = true; terreM.scale.y = 0.075; terreM.position.y = 0.004 + 0.0375; }
      else if (plc && eauOK) { if (b.agitationS === 0) { terreM.visible = true; terreM.scale.y = 0.075; terreM.position.y = 0.004 + 0.0375; eauM.visible = true; eauM.scale.y = haut - 0.075; eauM.position.y = 0.004 + 0.075 + (haut - 0.075) / 2; eauM.material.color.set(0xd8ecf5); eauM.material.opacity = 0.35; }
        else { eauM.visible = true; eauM.scale.y = haut; eauM.position.y = 0.004 + haut / 2; eauM.material.color.set(0x9c7b52); eauM.material.opacity = Math.max(0.1, 0.95 * (1 - Math.pow(fr1, 1.5))); couche(lSable, 0, sable); couche(lLimon, sable, limon); couche(lArg, sable + limon, arg); } }
      env.S.maj = true; }
    var drag0 = null, secou = { s: 0, t: 0, on: false, par: 0 };
    var it = fixe(env, 'bocal', 'bocal', [0, 0], jar, 0.1); it.kind = 'tap'; it.cache = function () { return has('bocal'); }; items.push(it);
    var ir = fixe(env, 'regle_graduee', 'rg', [0.07, 0.07], rule, 0.1); ir.kind = 'tap'; ir.cache = function () { return has('regle_graduee'); }; items.push(ir);
    var it2 = fixe(env, 'terre', 'terre', [-0.3, 0.05], sac, 0.07); it2.kind = 'tap'; it2.cache = function () { return has('terre'); }; items.push(it2);
    var it3 = fixe(env, 'eau', 'eau', [0.3, 0.05], carafe, 0.07); it3.kind = 'tap'; it3.cache = function () { return has('eau'); }; items.push(it3);
    hs.push({ id: 'sec', nom: 'Secouer le bocal', kind: 'secouer', pos: function () { return [0, 0.0]; }, y: 0.13, vis: function () { var b = E().bocal; return has('bocal') && b.terre && b.eau; }, debut: function () { secou.s = 0; secou.on = true; secou.par = 0; secou.last = performance.now(); }, secoue: function (chemin, vit) { var n = performance.now(), d = Math.min(0.1, (n - (secou.last || n)) / 1000); secou.last = n; if (vit > 3) secou.par = Math.min(1.5, secou.par + 0.25); if (secou.par > 0.3) secou.s += Math.min(0.2, d); }, fin: function (chemin) { secou.on = false; var s = secou.s; secou.s = 0; if (s > 0.5) API.faire('agiter', { duree_s: Math.min(600, Math.round(s * 6)) }); }, texte: function () { return secou.on ? fr(secou.s * 6, 0) + ' s agitées' : 'faire monter et descendre le doigt'; } });
    function tick(dt, drag) { var b = false; if (secou.on && drag && drag.id === 'sec') { secou.par = Math.max(0, secou.par - dt * 0.6); jar.position.y = 0.02 + Math.sin(performance.now() / 40) * 0.01 * Math.min(1, secou.par * 2); jar.position.x = Math.sin(performance.now() / 55) * 0.006; b = true; } else if (jar.position.y !== 0.02) { jar.position.y = 0.02; jar.position.x = 0; b = true; } return b; }
    function assistant(h) { var e = E(), b = e.bocal, cs = e.conseils && e.conseils.length ? e.conseils[e.conseils.length - 1] : null;
      if (!has('bocal') || !has('regle_graduee') || !has('terre') || !has('eau')) return h('Il faut le matériel pour préparer le mélange.', 'Un bocal, de la terre, de l\'eau et une règle graduée.', 'Touche chaque élément en pointillé pour le poser.');
      if (cs && cs.niveau === 'avertissement') return { texte: cs.message, plus: false };
      if (b.agitationS < 180) return h('Les grains de terre sont encore agglomérés.', 'Dans la vue Bocal, observe l\'eau après un temps de repos.', 'Secoue le bocal en le faisant monter et descendre, longtemps et vigoureusement.');
      if (b.fraction < 1) return { texte: 'Laisse le mélange reposer. La séparation en couches prend du temps.', plus: false };
      if ((e.mesures || []).length < 4) return h('Les couches sont-elles bien visibles ?', 'Utilise la vue Règle, de profil, avec l\'oeil à la hauteur de la limite entre deux couches.', 'Relève la hauteur de chaque couche et celle de la terre totale.');
      return { texte: 'Calcule le pourcentage de chaque couche par rapport à la terre totale.', plus: false }; }
    return { items: items, hs: hs, maj: maj, tick: tick, assistant: assistant, vues: { ensemble: { p: [0, 0.5, 0.92], t: [0, 0.07, 0] }, bocal: { p: [0, 0.14, 0.34], t: [0, 0.1, 0] }, regle: { p: [0.0, 0.1, 0.2], t: [0.0, 0.1, 0.06] } }, vuesNoms: { ensemble: 'Ensemble', bocal: 'Bocal', regle: 'Règle' }, temps: [['+30 min', 1800], ['+1 h', 3600], ['+24 h', 86400]] };
  };
  window.Labos3Spec = { creer: creer, CAUSES: CAUSES, TITRE: TITRE };
}());
