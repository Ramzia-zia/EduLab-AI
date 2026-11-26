// Oscilloscope au niveau de la SPEC : l'élève relie les sources à l'entrée Y1, met la masse, règle Sv, Sb, le commutateur GND/DC,
// lit l'oscillogramme et calcule. L'écran affiche la trace du moteur (labo_core) ; ce fichier place, dessine et relaie les gestes.
(function () {
  'use strict';
  function fr(x, d) { return (x === null || x === undefined || isNaN(x)) ? '' : x.toFixed(d === undefined ? 1 : d).replace('.', ','); }
  function cl(x, a, b) { return Math.max(a, Math.min(b, x)); }
  var CAUSES = {
    masse_oscilloscope_oubliee: 'Sans masse commune, le potentiel de la source n\'est pas repéré par rapport à l\'oscilloscope : l\'oscillogramme n\'a pas de sens.',
    trace_hors_ecran: 'Quand la trace sort de l\'écran, la sensibilité est trop petite : la valeur ne peut pas être lue.',
    lecture_oscillogramme: 'La valeur se lit en divisions entre la ligne de référence et la trace, puis se multiplie par Sv.',
    confusion_maximale_efficace: 'Um se lit sur le sommet de la courbe. La valeur efficace est Um divisé par racine de 2 : le multimètre en position alternative affiche la valeur efficace.'
  };
  var TITRE = { masse_oscilloscope_oubliee: 'Masse commune oubliée', trace_hors_ecran: 'Trace hors de l\'écran', lecture_oscillogramme: 'Lecture de l\'oscillogramme fausse', confusion_maximale_efficace: 'Confusion valeur maximale / efficace' };
  var NOM = { alimentation: 'Alimentation continue', gbf: 'GBF', oscilloscope: 'Oscilloscope', multimetre: 'Multimètre (~)', fils: 'Fils de connexion' };

  function creer(L3, hote, tagsEl, zone, API) {
    var T = L3.three, scene = T.scene, camera = T.camera, controls = T.controls, R = {};
    scene.traverse(function (o) { if (o.type === 'Mesh') R.Mesh = o.constructor; if (o.type === 'Group') R.Group = o.constructor; if (o.geometry) R[o.geometry.type] = o.geometry.constructor; if (o.material) { R[o.material.type] = o.material.constructor; if (o.material.map) R.Tex = o.material.map.constructor; } });
    R.V3 = camera.position.constructor;
    var vieux = T.cap(); if (vieux) vieux.visible = false;
    var G = new R.Group(); scene.add(G);
    var sv = { az0: controls.minAzimuthAngle, az1: controls.maxAzimuthAngle, mn: controls.minDistance, mx: controls.maxDistance };
    controls.minAzimuthAngle = -0.8; controls.maxAzimuthAngle = 0.8; controls.minDistance = 0.2; controls.maxDistance = 1.5;
    var meta = API.meta(), opt = meta.options, S = { glisse: null, indice: 0, max: 1, f0: null, freqChangee: false };
    var sale = true, cam = null, dernier = performance.now(), drag = null, hover = null, depart = null, tagsSlots = [], glisseId = null, gpos = null;
    function MS(o) { return new R.MeshStandardMaterial(o); } function MB(c) { return new R.MeshBasicMaterial({ color: c, toneMapped: false }); }
    function rb(w, h, d, m, r) { var x = new R.Mesh(new R.RoundedBoxGeometry(w, h, d, 4, r || 0.004), m); x.castShadow = x.receiveShadow = true; return x; }
    function cyl(a, b, h, m) { var x = new R.Mesh(new R.CylinderGeometry(a, b, h, 28), m); x.castShadow = true; return x; }
    function sph(r, c) { var m = new R.Mesh(R.SphereGeometry ? new R.SphereGeometry(r, 14, 10) : new R.CylinderGeometry(r, r, r * 1.6, 16), MS({ color: c, roughness: 0.4 })); if (!R.SphereGeometry) m.rotation.x = Math.PI / 2; return m; }
    function canvas(w, h) { var c = document.createElement('canvas'); c.width = w; c.height = h; var t = new R.Tex(c); t.anisotropy = 8; return { c: c, t: t, g: c.getContext('2d') }; }
    var gris = MS({ color: 0x2b3340, roughness: 0.5, metalness: 0.3 }), clair = MS({ color: 0xd9dde2, roughness: 0.45, metalness: 0.5 }), ghost = MS({ color: 0x2b3340, transparent: true, opacity: 0.35 }), alu = MS({ color: 0xc9ced4, metalness: 0.9, roughness: 0.3 });
    var plaque = rb(1.0, 0.02, 0.7, MS({ color: 0xf1f3f4, roughness: 0.75 }), 0.004); plaque.position.set(0.1, 0.01, 0.02); plaque.castShadow = false; G.add(plaque);
    // ---- oscilloscope
    var osc = new R.Group(); osc.position.set(-0.12, 0.02, -0.06); G.add(osc);
    var oc = rb(0.36, 0.22, 0.3, gris, 0.008); oc.position.y = 0.11; osc.add(oc);
    var ec = canvas(512, 410), em = new R.Mesh(new R.PlaneGeometry(0.21, 0.168), new R.MeshBasicMaterial({ map: ec.t, toneMapped: false })); em.position.set(-0.058, 0.125, 0.1515); osc.add(em);
    function bouton3d(x, y) { var g = new R.Group(), c = cyl(0.016, 0.018, 0.014, clair), m = cyl(0.002, 0.002, 0.006, MS({ color: 0x111111 })); c.rotation.x = Math.PI / 2; m.position.set(0, 0.008, -0.01); c.add(m); g.add(c); g.position.set(x, y, 0.157); osc.add(g); return c; }
    var kSv = bouton3d(0.062, 0.17), kSb = bouton3d(0.062, 0.1), sw = new R.Group(); sw.position.set(0.062, 0.035, 0.157); var swb = cyl(0.008, 0.008, 0.01, alu); swb.rotation.x = Math.PI / 2; sw.add(swb); var lv = rb(0.004, 0.026, 0.004, alu, 0.001); lv.position.y = 0.012; sw.add(lv); osc.add(sw);
    var bnc = cyl(0.009, 0.009, 0.016, alu); bnc.rotation.x = Math.PI / 2; bnc.position.set(-0.1, 0.03, 0.158); osc.add(bnc); var gnd = sph(0.007, 0x15181c); gnd.position.set(-0.06, 0.03, 0.158); osc.add(gnd);
    var etiqSv = canvas(256, 64); // libellés
    ['Sv', 'Sb'].forEach(function (t, i) { var c = canvas(96, 32); c.g.fillStyle = '#e8ebef'; c.g.font = 'bold 22px system-ui'; c.g.fillText(t, 4, 24); c.t.needsUpdate = true; var m = new R.Mesh(new R.PlaneGeometry(0.03, 0.01), new R.MeshBasicMaterial({ map: c.t, transparent: true, toneMapped: false })); m.position.set(0.062, i ? 0.075 : 0.145, 0.1573); osc.add(m); });
    // ---- sources
    function source(nom, x, z, aff) { var g = new R.Group(); g.position.set(x, 0.02, z); var c = rb(0.17, 0.08, 0.13, gris, 0.006); c.position.y = 0.04; g.add(c); var a = canvas(200, 80), am = new R.Mesh(new R.PlaneGeometry(0.075, 0.03), new R.MeshBasicMaterial({ map: a.t, toneMapped: false })); am.rotation.x = -Math.PI / 2; am.position.set(-0.03, 0.0812, -0.025); g.add(am);
      var kn = cyl(0.015, 0.017, 0.014, clair); kn.position.set(0.04, 0.088, -0.02); var mk = cyl(0.002, 0.002, 0.006, MS({ color: 0x111111 })); mk.position.set(0, 0.008, -0.009); kn.add(mk); g.add(kn);
      var bp = sph(0.0085, 0xd6342c); bp.position.set(-0.03, 0.04, 0.0655); var bn = sph(0.0085, 0x15181c); bn.position.set(0.03, 0.04, 0.0655); g.add(bp, bn); G.add(g); return { g: g, a: a, am: am, kn: kn, bp: bp, bn: bn, c: c }; }
    var al = source('alim', 0.3, -0.13), gb = source('gbf', 0.3, 0.06);
    var etq = function (t, p, h) { var c = canvas(256, 64); c.g.fillStyle = '#ffffff'; c.g.fillRect(0, 0, 256, 64); c.g.fillStyle = '#0D2149'; c.g.font = 'bold 30px system-ui'; c.g.textAlign = 'center'; c.g.fillText(t, 128, 42); c.t.needsUpdate = true; var m = new R.Mesh(new R.PlaneGeometry(0.1, 0.025), new R.MeshBasicMaterial({ map: c.t, toneMapped: false })); m.rotation.x = -Math.PI / 2; m.position.set(p[0], 0.0215, p[1]); G.add(m); };
    etq('ALIMENTATION', [0.3, -0.215]); etq('GBF', [0.3, -0.02]);
    // ---- multimètre et fils
    var mm = new R.Group(), mc = rb(0.12, 0.04, 0.09, gris, 0.006); mc.position.y = 0.02; mm.add(mc); var mA = canvas(240, 90), mam = new R.Mesh(new R.PlaneGeometry(0.09, 0.034), new R.MeshBasicMaterial({ map: mA.t, toneMapped: false })); mam.rotation.x = -Math.PI / 2; mam.position.set(0, 0.0412, -0.006); mm.add(mam);
    var mv = sph(0.0065, 0xd6342c), mcom = sph(0.0065, 0x15181c); mv.position.set(-0.025, 0.02, -0.0455); mcom.position.set(0.025, 0.02, -0.0455); mm.add(mv, mcom); G.add(mm);
    var fG = new R.Group(), bob = cyl(0.026, 0.026, 0.024, MS({ color: 0xd6342c, roughness: 0.6 })), bob2 = cyl(0.016, 0.016, 0.03, MS({ color: 0x15181c, roughness: 0.6 })); bob.position.y = 0.012; bob2.position.y = 0.012; fG.add(bob, bob2); G.add(fG);
    var cables = new R.Group(); G.add(cables);
    function cable(a, b, col, sag) { var dx = b[0] - a[0], dy = b[1] - a[1], dz = b[2] - a[2], L = Math.sqrt(dx * dx + dy * dy + dz * dz); if (L < 1e-4) return; var g = new R.Group(); g.position.set(a[0], a[1], a[2]); g.lookAt(b[0], b[1], b[2]); var m = new R.Mesh(new R.CylinderGeometry(0.0026, 0.0026, L, 8), MS({ color: col, roughness: 0.5 })); m.rotation.x = Math.PI / 2; m.position.z = L / 2; m.castShadow = true; g.add(m); cables.add(g); }
    function pc(p, y) { return [p[0], y, p[1]]; }
    var HOME = { alimentation: [0.3, -0.13], gbf: [0.3, 0.06], multimetre: [0.30, 0.29], fils: [-0.32, 0.30], oscilloscope: [-0.12, -0.06] };
    mm.position.set(HOME.multimetre[0], 0.02, HOME.multimetre[1]); fG.position.set(HOME.fils[0], 0.02, HOME.fils[1]);

    // ---- état : lecture du moteur
    function E() { return API.vue(); } function M() { return E().materiel; } function has(id) { return Object.prototype.hasOwnProperty.call(M(), id); }
    function reg(k, d) { var v = E().reglages[k]; return v === undefined ? d : v; }
    function ecranDessin() {
      var e = E().ecran, g = ec.g, W = 512, H = 410, cx = W / opt.largeur_div, cy = H / (2 * opt.demi_hauteur_div); g.fillStyle = '#10241b'; g.fillRect(0, 0, W, H);
      if (!has('oscilloscope')) { g.fillStyle = '#2f5a45'; g.font = '22px system-ui'; g.textAlign = 'center'; g.fillText('appareil éteint', W / 2, H / 2); ec.t.needsUpdate = true; return; }
      g.strokeStyle = '#2d5a43'; g.lineWidth = 1; for (var i = 0; i <= opt.largeur_div; i++) { g.beginPath(); g.moveTo(i * cx, 0); g.lineTo(i * cx, H); g.stroke(); } for (var j = 0; j <= 2 * opt.demi_hauteur_div; j++) { g.beginPath(); g.moveTo(0, j * cy); g.lineTo(W, j * cy); g.stroke(); }
      g.strokeStyle = '#3f7a5c'; g.lineWidth = 2; g.beginPath(); g.moveTo(0, H / 2); g.lineTo(W, H / 2); g.moveTo(W / 2, 0); g.lineTo(W / 2, H); g.stroke(); g.lineWidth = 1;
      g.strokeStyle = '#3f7a5c'; for (var a = 0; a < opt.largeur_div * 5; a++) { var x = a * cx / 5; g.beginPath(); g.moveTo(x, H / 2 - 4); g.lineTo(x, H / 2 + 4); g.stroke(); } for (var b = 0; b < 2 * opt.demi_hauteur_div * 5; b++) { var y = b * cy / 5; g.beginPath(); g.moveTo(W / 2 - 4, y); g.lineTo(W / 2 + 4, y); g.stroke(); }
      if (e && e.trace) { g.shadowColor = '#6dffb0'; g.shadowBlur = 8; g.strokeStyle = e.signalPresent && !e.traceVisible ? '#ffb36d' : '#7dffb8'; g.lineWidth = 3; g.beginPath(); e.trace.forEach(function (p, k) { var x = p[0] * cx, y = H / 2 - p[1] * cy; if (k) g.lineTo(x, y); else g.moveTo(x, y); }); g.stroke(); g.shadowBlur = 0; }
      g.fillStyle = '#9dffd0'; g.font = '16px ui-monospace,monospace'; g.textAlign = 'left'; g.fillText(fr(reg('sensibilite_v_par_div', 10), reg('sensibilite_v_par_div', 10) < 1 ? 1 : 0).replace(',0', '') + ' V/div', 8, H - 10); g.textAlign = 'right'; g.fillText(fr(reg('base_temps_s_par_div', 0.01) * 1000, 1).replace(',0', '') + ' ms/div   ' + String(reg('couplage', 'dc')).toUpperCase(), W - 8, H - 10);
      ec.t.needsUpdate = true;
    }
    function affSource(s, txt) { var g = s.a.g; g.fillStyle = '#b9c9a8'; g.fillRect(0, 0, 200, 80); g.fillStyle = '#1c2b17'; g.font = 'bold 40px ui-monospace,monospace'; g.textAlign = 'center'; g.fillText(txt, 100, 54); s.a.t.needsUpdate = true; }
    function maj() {
      var e = E(); ecranDessin(); oc.material = has('oscilloscope') ? gris : ghost;
      affSource(al, has('alimentation') ? fr(reg('tension_alimentation_v', 0), 1) + ' V' : '--'); affSource(gb, has('gbf') ? fr(reg('frequence_gbf_hz', 100), 0) + ' Hz' : '--');
      al.kn.rotation.y = -2.2 + 4.4 * cl(reg('tension_alimentation_v', 0) / opt.tension_max_v, 0, 1); gb.kn.rotation.y = -2.2 + 4.4 * cl(Math.log(reg('frequence_gbf_hz', 100) / opt.frequence_min_hz) / Math.log(opt.frequence_max_hz / opt.frequence_min_hz), 0, 1);
      var iS = opt.sensibilites.indexOf(reg('sensibilite_v_par_div', 10)), iB = opt.bases_temps.indexOf(reg('base_temps_s_par_div', 0.01)); kSv.rotation.y = -2.0 + 4.0 * Math.max(0, iS) / (opt.sensibilites.length - 1); kSb.rotation.y = -2.0 + 4.0 * Math.max(0, iB) / (opt.bases_temps.length - 1); lv.rotation.z = reg('couplage', 'dc') === 'gnd' ? 0.7 : -0.7;
      var amp = (e.ecran && e.ecran.source === 'gbf' && e.ecran.amplitudeV) ? e.ecran.amplitudeV / Math.SQRT2 : 0, pm = M().multimetre === 'bornes_gbf' && has('gbf');
      var g = mA.g; g.fillStyle = '#b9c9a8'; g.fillRect(0, 0, 240, 90); g.fillStyle = '#1c2b17'; g.font = 'bold 36px ui-monospace,monospace'; g.textAlign = 'center'; g.fillText(pm ? fr(amp, 2) + ' V~' : '-- V~', 120, 60); mA.t.needsUpdate = true;
      // câbles
      while (cables.children.length) { var c = cables.children[0]; cables.remove(c); } if (has('fils')) {
        var y1 = [-0.12 + -0.1, 0.05, -0.06 + 0.16], gn = [-0.12 - 0.06, 0.05, -0.06 + 0.16];
        ['alimentation', 'gbf'].forEach(function (id) { if (!has(id)) return; var s = id === 'gbf' ? gb : al, p = s.g.position, plus = [p.x - 0.03, 0.06, p.z + 0.0655], moins = [p.x + 0.03, 0.06, p.z + 0.0655]; cable(plus, [plus[0], 0.06, plus[2] + 0.06], 0xd6342c); cable([plus[0], 0.06, plus[2] + 0.06], y1, 0xd6342c); if (reg('masse_' + id, false)) { cable(moins, [moins[0], 0.06, moins[2] + 0.1], 0x15181c); cable([moins[0], 0.06, moins[2] + 0.1], gn, 0x15181c); } });
        if (pm) { var mp = mm.position, gp = gb.g.position; cable([mp.x - 0.025, 0.04, mp.z - 0.0455], [gp.x - 0.03, 0.06, gp.z + 0.0655], 0xd6342c); cable([mp.x + 0.025, 0.04, mp.z - 0.0455], [gp.x + 0.03, 0.06, gp.z + 0.0655], 0x15181c); } }
      sale = true; T.dirty(); cb && cb();
    }
    // ---- gestes
    var HS = [], DEV = [];
    function hs(o) { HS.push(o); return o; }
    function wp(g, dx, dy, dz) { return function () { return [g.g.position.x + dx, dz === undefined ? 0 : g.g.position.z + dz]; }; }
    hs({ id: 'u', nom: 'Tension', kind: 'drag', pos: function () { return [al.g.position.x + 0.04, al.g.position.z - 0.02]; }, y: 0.12, vis: function () { return has('alimentation'); }, t0: function () { return cl(reg('tension_alimentation_v', 0) / opt.tension_max_v, 0, 1); }, drag: function (dx, dy, t0) { var v = Math.round(cl(t0 + (dx - dy) / 200, 0, 1) * opt.tension_max_v * 2) / 2; if (v !== reg('tension_alimentation_v', 0)) API.faire('regler_tension', { tension_v: v }); }, texte: function () { return fr(reg('tension_alimentation_v', 0), 1) + ' V'; } });
    hs({ id: 'f', nom: 'Fréquence', kind: 'drag', pos: function () { return [gb.g.position.x + 0.04, gb.g.position.z - 0.02]; }, y: 0.12, vis: function () { return has('gbf'); }, t0: function () { return cl(Math.log(reg('frequence_gbf_hz', 100) / opt.frequence_min_hz) / Math.log(opt.frequence_max_hz / opt.frequence_min_hz), 0, 1); }, drag: function (dx, dy, t0) { var t = cl(t0 + (dx - dy) / 200, 0, 1), f = Math.round(opt.frequence_min_hz * Math.pow(opt.frequence_max_hz / opt.frequence_min_hz, t) / 10) * 10; f = Math.max(opt.frequence_min_hz, f); if (f !== reg('frequence_gbf_hz', 100)) { S.freqChangee = true; API.faire('regler_gbf', { frequence_hz: f }); } }, texte: function () { return fr(reg('frequence_gbf_hz', 100), 0) + ' Hz'; } });
    function discret(id, nom, kx, ky, cle, liste, action, champ, fmt) { hs({ id: id, nom: nom, kind: 'drag', pos: function () { return [osc.position.x + kx, osc.position.z + 0.157]; }, y: osc.position.y + ky, vis: function () { return has('oscilloscope'); }, t0: function () { return Math.max(0, liste.indexOf(reg(cle, liste[0]))) / (liste.length - 1); }, drag: function (dx, dy, t0) { var x = liste[Math.round(cl(t0 + (dx - dy) / 220, 0, 1) * (liste.length - 1))]; if (x !== reg(cle, liste[0])) { var a = {}; a[champ] = x; API.faire(action, a); } }, texte: function () { return fmt(reg(cle, liste[0])); } }); }
    discret('sv', 'Sensibilité', 0.062, 0.17, 'sensibilite_v_par_div', opt.sensibilites, 'regler_sensibilite', 'sensibilite_v_par_div', function (v) { return fr(v, v < 1 ? 1 : 0).replace(',0', '') + ' V/div'; });
    discret('sb', 'Base de temps', 0.062, 0.10, 'base_temps_s_par_div', opt.bases_temps, 'regler_base_temps', 'base_temps_s_par_div', function (v) { return fr(v * 1000, 1).replace(',0', '') + ' ms/div'; });
    hs({ id: 'gnd', nom: 'Commutateur', kind: 'tap', pos: function () { return [osc.position.x + 0.062, osc.position.z + 0.157]; }, y: osc.position.y + 0.035, vis: function () { return has('oscilloscope'); }, tap: function () { API.faire('choisir_couplage', { couplage: reg('couplage', 'dc') === 'dc' ? 'gnd' : 'dc' }); }, texte: function () { return String(reg('couplage', 'dc')).toUpperCase(); } });
    ['alimentation', 'gbf'].forEach(function (id) { var s = id === 'gbf' ? gb : al; hs({ id: 'm' + id, nom: 'Masse ' + (id === 'gbf' ? 'GBF' : 'alim.'), kind: 'tap', pos: function () { return [s.g.position.x + 0.03, s.g.position.z + 0.0655]; }, y: 0.06, vis: function () { return has(id); }, tap: function () { API.faire('relier_masse', { point_id: id }); }, texte: function () { return reg('masse_' + id, false) ? 'reliée' : 'non reliée'; } }); });
    Object.keys(HOME).forEach(function (id) { DEV.push({ id: id, nom: NOM[id], pos: function () { return id === 'multimetre' ? [mm.position.x, mm.position.z] : (id === 'fils' ? [fG.position.x, fG.position.z] : HOME[id]); }, y: 0.05 }); });
    var SLOTS = { alimentation: [{ e: 'entree_y1', p: [-0.22, 0.15], n: 'Entrée Y1' }], gbf: [{ e: 'entree_y1', p: [-0.22, 0.15], n: 'Entrée Y1' }], multimetre: [{ e: 'bornes_gbf', p: [0.2, 0.06], n: 'Aux bornes du GBF' }], oscilloscope: [{ e: null, p: [-0.12, 0.0], n: 'Oscilloscope' }], fils: [{ e: null, p: [-0.1, 0.25], n: 'Fils' }] };
    var el = T.renderer.domElement, v3 = new R.V3(); halo();
    var haloM; function halo() { haloM = new R.Mesh(new R.CylinderGeometry(0.03, 0.03, 0.002, 28), new R.MeshBasicMaterial({ color: 0x1a73d1, transparent: true, opacity: 0.45, toneMapped: false })); haloM.visible = false; G.add(haloM); }
    function q(e) { var r = el.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top, w: r.width, h: r.height }; }
    function pr(p, y) { var s = q({ clientX: 0, clientY: 0 }); v3.set(p[0], y === undefined ? 0.05 : y, p[1]); v3.project(camera); return { x: (v3.x + 1) / 2 * s.w, y: (1 - v3.y) / 2 * s.h }; }
    function planY(e) { var s = q(e), nx = s.x / s.w * 2 - 1, ny = -(s.y / s.h * 2 - 1), a = camera.position.clone(), b = new R.V3(nx, ny, 0.5).unproject(camera), d = b.sub(a); if (Math.abs(d.y) < 1e-6) return null; var t = (0.05 - a.y) / d.y; return [a.x + d.x * t, a.z + d.z * t]; }
    function trouver(e) { var s = q(e), best = null, bd = 36; HS.forEach(function (h) { if (!h.vis()) return; var p = pr(h.pos(), h.y), d = Math.hypot(p.x - s.x, p.y - s.y); if (d < bd) { bd = d; best = h; } }); DEV.forEach(function (m) { if (m.id === 'oscilloscope' && has('oscilloscope')) return; var p = pr(m.pos(), m.y), d = Math.hypot(p.x - s.x, p.y - s.y) + 6; if (d < bd) { bd = d; best = m; } }); return best; }
    function montrer(id) { effacer(); (SLOTS[id] || []).forEach(function (sl) { var d = document.createElement('div'); d.className = 'tag-g act'; d.textContent = sl.n; sl.tag = d; tagsEl.appendChild(d); tagsSlots.push(sl); }); }
    function effacer() { tagsSlots.forEach(function (s) { if (s.tag && s.tag.parentNode) s.tag.parentNode.removeChild(s.tag); }); tagsSlots = []; }
    hote.addEventListener('pointerdown', function (e) { var h = trouver(e); if (!h) return; e.stopPropagation(); controls.enabled = false; drag = h; var s = q(e); depart = { x: s.x, y: s.y, bouge: false, t0: h.t0 ? h.t0() : 0 };
      if (!h.kind) { glisseId = h.id; gpos = h.pos().slice(); var w = planY(e); depart.ox = w ? gpos[0] - w[0] : 0; depart.oz = w ? gpos[1] - w[1] : 0; montrer(h.id); } try { hote.setPointerCapture(e.pointerId); } catch (_) { } sale = true; T.dirty(); }, true);
    var objDe = function (id) { return id === 'alimentation' ? al.g : id === 'gbf' ? gb.g : id === 'multimetre' ? mm : id === 'fils' ? fG : osc; };
    window.addEventListener('pointermove', function (e) { var s = q(e);
      if (drag) { var dx = s.x - depart.x, dy = s.y - depart.y; if (Math.hypot(dx, dy) > 6) depart.bouge = true; if (drag.kind === 'drag') drag.drag(dx, dy, depart.t0); else if (glisseId && glisseId !== 'oscilloscope') { var w = planY(e); if (w) { gpos = [cl(w[0] + depart.ox, -0.45, 0.45), cl(w[1] + depart.oz, -0.3, 0.34)]; var o = objDe(glisseId); o.position.set(gpos[0], 0.05, gpos[1]); } } sale = true; return; }
      if (!hote.contains(e.target)) return; var k = trouver(e); if (k !== hover) { hover = k; el.style.cursor = k ? 'pointer' : ''; sale = true; T.dirty(); } });
    function fin() { if (!drag) return; var h = drag; drag = null; controls.enabled = true; if (h.kind === 'tap' && !depart.bouge) h.tap();
      if (glisseId) { var id = glisseId; glisseId = null; var best = null, bd = 0.12; tagsSlots.forEach(function (sl) { var d = Math.hypot(sl.p[0] - gpos[0], sl.p[1] - gpos[1]); if (d < bd) { bd = d; best = sl; } }); if (id === 'oscilloscope' && !depart.bouge) best = SLOTS.oscilloscope[0];
        if (best) { var v = { materiel_id: id }; if (best.e) v.emplacement_id = best.e; API.faire('placer_materiel', v); } var home = HOME[id]; var o = objDe(id); if (id !== 'oscilloscope') o.position.set(home[0], 0.02, home[1]); effacer(); maj(); }
      sale = true; T.dirty(); }
    window.addEventListener('pointerup', fin); window.addEventListener('pointercancel', fin);
    // ---- caméra
    var EN = { p: [0.06, 0.42, 1.0], t: [0.06, 0.07, 0.0] };
    function vue(n) { var to = EN; if (n === 'ecran') to = { p: [-0.18, 0.15, 0.42], t: [-0.18, 0.145, 0.09] }; else if (n === 'commandes') to = { p: [-0.02, 0.2, 0.4], t: [-0.02, 0.12, 0.09] }; else if (n === 'sources') to = { p: [0.3, 0.35, 0.55], t: [0.3, 0.04, -0.03] };
      cam = { t0: performance.now(), p0: camera.position.clone(), g0: controls.target.clone(), p1: new R.V3(to.p[0], to.p[1], to.p[2]), g1: new R.V3(to.t[0], to.t[1], to.t[2]) }; sale = true; T.dirty(); }
    camera.position.set(EN.p[0], EN.p[1], EN.p[2]); controls.target.set(EN.t[0], EN.t[1], EN.t[2]); controls.update();
    function majTags() { HS.concat(DEV).forEach(function (h) { var d = h.tg; if (!d) { d = h.tg = document.createElement('div'); d.className = 'tag-g'; tagsEl.appendChild(d); } var act = (hover === h || drag === h), ok = h.vis ? h.vis() : true; if (!h.kind && has(h.id) && !act) ok = false; d.hidden = !ok; if (!ok) return; var p = pr(h.pos(), h.y); d.style.left = p.x + 'px'; d.style.top = (act ? p.y - 22 : p.y) + 'px'; var tx = h.texte ? h.texte() : ''; d.textContent = h.nom + (tx ? ' : ' + tx : ''); d.className = 'tag-g' + (act ? ' act' : ''); });
      tagsSlots.forEach(function (sl) { var p = pr(sl.p, 0.06); sl.tag.style.left = p.x + 'px'; sl.tag.style.top = p.y + 'px'; }); }
    var lastA = 0, lastCle = '';
    function assistant() {
      var e = E(), h = function () { var a = arguments; S.max = a.length; var i = Math.min(S.indice, a.length - 1); return { texte: a[i], plus: i < a.length - 1 }; }, cs = e.conseils && e.conseils.length ? e.conseils[e.conseils.length - 1] : null;
      if (!has('oscilloscope')) return h('Rien n\'est allumé.', 'L\'oscilloscope est en pointillé sur la plaque.', 'Touche l\'oscilloscope pour le poser.');
      if (!has('alimentation') && !has('gbf')) return h('Il faut une source à observer.', 'Les sources sont à droite.', 'Glisse une source sur l\'entrée Y1.');
      if (!has('fils')) return h('Les appareils ne sont pas reliés.', 'Regarde la bobine de fils en bas à gauche.', 'Glisse les fils sur la plaque.');
      var src = has('gbf') && e.ecran && e.ecran.source === 'gbf' ? 'gbf' : 'alimentation';
      if (!reg('masse_' + src, false)) return h('Comment l\'oscilloscope repère-t-il le potentiel de la source ?', 'Il faut une référence commune entre la source et l\'appareil.', 'Touche la borne noire de la source pour la relier à la masse.');
      if (cs && cs.niveau === 'avertissement') return { texte: cs.message, plus: false };
      if (reg('couplage', 'dc') === 'dc' && !reg('reference_reglee', false) && !(e.mesures || []).length) return h(cs ? cs.message : 'Où est la ligne de référence u = 0 ?', 'Le commutateur a une position qui met l\'entrée à la masse.', 'Mets GND, amène la trace sur la ligne centrale, puis repasse en DC.');
      if (S.freqChangee && has('gbf') && !(e.mesures || []).some(function (m) { return /periode|frequence/.test(m.grandeur); })) { return { texte: 'Réfléchis : si tu doubles la fréquence sans changer la base de temps, la courbe occupera-t-elle plus ou moins de divisions par période ?', plus: false }; }
      if (cs && cs.niveau === 'information' && !(e.mesures || []).length) return { texte: cs.message, plus: false };
      if (!(e.mesures || []).length) return h('Observe la courbe : combien de divisions pour un motif complet ?', 'Utilise la vue Écran et relève les divisions sur le quadrillage.', 'Multiplie par le réglage correspondant, puis note ton résultat dans le cahier.');
      return { texte: 'Continue : change un réglage et compare ce que tu lis avec ce que tu calcules.', plus: false };
    }
    window.__tick = function () { var now = performance.now(); dernier = now; var b = false;
      if (cam) { var u = Math.min(1, (now - cam.t0) / 600), k = u * u * (3 - 2 * u); camera.position.lerpVectors(cam.p0, cam.p1, k); controls.target.lerpVectors(cam.g0, cam.g1, k); controls.update(); if (u >= 1) cam = null; b = true; }
      var hv = hover || drag; if (hv && hv.pos && hv.kind) { haloM.visible = true; var p = hv.pos(); haloM.position.set(p[0], hv.y || 0.06, p[1]); haloM.rotation.x = Math.PI / 2; b = true; } else haloM.visible = false;
      majTags(); if (now - lastA > 500) { lastA = now; var e = E(), cle = JSON.stringify([e.materiel, e.reglages.couplage, (e.mesures || []).length, e.conseils && e.conseils.length]); if (cle !== lastCle) { lastCle = cle; S.indice = 0; } var a = assistant(); API.cb.assistant(a.texte, !!a.plus); } var r = sale || b; sale = false; return r; };
    // ---- cahier
    function bouton(t, f, c) { var b = document.createElement('button'); b.type = 'button'; b.className = 'btn' + (c ? ' ' + c : ''); b.textContent = t; b.addEventListener('click', f); return b; }
    function ligne(lbl, n) { var d = document.createElement('div'); d.className = 'ligne'; var l = document.createElement('label'), s = document.createElement('span'); s.textContent = lbl; l.appendChild(s); d.appendChild(l); d.appendChild(n); zone.appendChild(d); }
    function champ(ph, mode) { var i = document.createElement('input'); i.type = 'text'; i.setAttribute('inputmode', mode || 'decimal'); i.placeholder = ph; return i; }
    var barre = document.createElement('div'); barre.className = 'seg'; [['ensemble', 'Ensemble'], ['ecran', 'Écran'], ['commandes', 'Commandes'], ['sources', 'Sources']].forEach(function (a) { barre.appendChild(bouton(a[1], function () { vue(a[0]); })); });
    var r0 = document.createElement('div'); r0.className = 'ligne'; r0.appendChild(barre); zone.appendChild(r0);
    var th = document.createElement('h2'); th.className = 'etiq'; th.textContent = 'Cahier de laboratoire'; zone.appendChild(th);
    var lec = document.createElement('div'); lec.className = 'seg'; var iY = champ('y ou n (div)'), iS = champ('Sv'), iB = champ('Sb'); lec.appendChild(iY); lec.appendChild(iS); lec.appendChild(iB); ligne('Lecture : divisions, Sv, Sb', lec);
    var sel = document.createElement('select'); meta.grandeurs.forEach(function (g) { var o = document.createElement('option'); o.value = g; o.textContent = g.replace(/_(v|s|hz|div)$/, '').replace(/_/g, ' '); sel.appendChild(o); }); ligne('Grandeur calculée', sel);
    var iV = champ('valeur'), iU = champ('unité', 'text'); function unite() { var m = /_(v|s|hz|div)$/.exec(sel.value); iU.value = m ? { v: 'V', s: 's', hz: 'Hz', div: 'div' }[m[1]] : ''; } sel.addEventListener('change', unite); unite(); var rr = document.createElement('div'); rr.className = 'seg'; rr.appendChild(iV); rr.appendChild(iU); ligne('Valeur (virgule ou point) et unité', rr);
    var liste = document.createElement('div'); var bn = bouton('Noter dans le cahier', function () { var v = parseFloat(String(iV.value).replace(',', '.')); if (isNaN(v)) return; API.faire('mesurer', { grandeur_id: sel.value, valeur: v, unite: iU.value }); iV.value = ''; });
    var rn = document.createElement('div'); rn.className = 'ligne'; rn.appendChild(bn); zone.appendChild(rn); zone.appendChild(liste);
    var cb = function () { liste.textContent = ''; var ms = E().mesures || []; if (!ms.length) return; var tb = document.createElement('tbody'); ms.forEach(function (m) { var tr = document.createElement('tr'), a = document.createElement('td'), c = document.createElement('td'); a.textContent = String(m.grandeur).replace(/_/g, ' '); c.textContent = String(m.saisie).replace('.', ',') + ' ' + (m.unite || ''); tr.appendChild(a); tr.appendChild(c); tb.appendChild(tr); }); var t = document.createElement('table'); t.appendChild(tb); liste.appendChild(t); };
    maj();
    return { maj: maj, vue: vue, indice: function () { if (S.indice < (S.max || 1) - 1) S.indice++; },
      detruire: function () { window.__tick = null; scene.remove(G); tagsEl.textContent = ''; zone.textContent = ''; if (vieux) vieux.visible = true; controls.enabled = true; controls.minAzimuthAngle = sv.az0; controls.maxAzimuthAngle = sv.az1; controls.minDistance = sv.mn; controls.maxDistance = sv.mx; } };
  }
  window.OscilloSpec = { creer: creer, CAUSES: CAUSES, TITRE: TITRE };
}());
