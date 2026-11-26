// Gestes directs sur les scènes 3D des labos (hors banc d'optique) : l'élève tourne, touche, glisse, agite.
// Chaque geste appelle une action du moteur (labo_core) ; l'état renvoyé redessine la scène.
(function () {
  'use strict';
  function fr(x, d) { return (Math.round(x * Math.pow(10, d || 0)) / Math.pow(10, d || 0)).toString().replace('.', ','); }
  function cl(x) { return Math.max(0, Math.min(1, x)); }

  function activer(L3, hote, tagsEl, API) {
    var T = L3.three, scene = T.scene, camera = T.camera, controls = T.controls, R = {};
    scene.traverse(function (o) {
      if (o.type === 'Mesh') R.Mesh = o.constructor; if (o.type === 'Group') R.Group = o.constructor;
      if (o.geometry) R[o.geometry.type] = o.geometry.constructor;
      if (o.material) R[o.material.type] = o.material.constructor;
    });
    var V3 = camera.position.constructor, G = new R.Group(); scene.add(G);
    var lab = API.lab(), H = [], S = { drag: null, hover: null, agit: 0, agitS: 0, vue: 'ensemble' }, sale = true, cam = null, gouttes = [], t0 = performance.now(), dernier = t0;
    var blanc = new R.MeshStandardMaterial({ color: 0xf4f6f8, roughness: 0.4 }), noir = new R.MeshStandardMaterial({ color: 0x1b1f24, roughness: 0.4, metalness: 0.5 });
    var bleu = new R.MeshBasicMaterial({ color: 0x1a73d1, transparent: true, opacity: 0.55, toneMapped: false }), eau = new R.MeshStandardMaterial({ color: 0xcfe7f3, roughness: 0.1 });
    var halo = new R.Mesh(new R.CylinderGeometry(0.03, 0.03, 0.002, 32), bleu); halo.rotation.x = Math.PI / 2; halo.visible = false; G.add(halo);

    function bouton(p, rayon) {
      var h = new R.Group(), k = new R.Group(), c = new R.Mesh(new R.CylinderGeometry(rayon, rayon * 1.1, 0.012, 32), noir), m = new R.Mesh(new R.CylinderGeometry(rayon * 0.14, rayon * 0.14, 0.004, 8), blanc);
      c.castShadow = true; m.position.set(0, 0.008, rayon * 0.62); k.add(c, m); h.add(k); h.rotation.x = Math.PI / 2; h.position.set(p[0], p[1], p[2]); G.add(h); return k;
    }
    function ajout(d) {
      d.tag = document.createElement('div'); d.tag.className = 'tag-g'; tagsEl.appendChild(d.tag);
      if (d.kind === 'drag' && d.visuel !== false) d.k = bouton(d.pos(), 0.016);
      H.push(d);
    }
    // ------------------------------------------------------------ définition des gestes par labo
    var v = API.vue, o = function () { return API.meta().options; }, r = function () { return v().reglages; }, has = function (id) { return Object.prototype.hasOwnProperty.call(v().materiel, id); };
    function tensionKnob(pos) {
      ajout({ nom: 'Tension', kind: 'drag', pos: function () { return pos; }, vis: function () { return has('alimentation'); },
        get: function () { var t = r().tension_generateur_v !== undefined ? r().tension_generateur_v : (r().tension_alimentation_v || 0); return cl(t / o().tension_max_v); },
        set: function (t) { var val = Math.round(t * o().tension_max_v * 2) / 2; API.faire('regler_tension', { tension_v: val }); },
        texte: function () { var t = r().tension_generateur_v !== undefined ? r().tension_generateur_v : (r().tension_alimentation_v || 0); return fr(t, 1) + ' V'; } });
    }
    function levierK(pos) {
      ajout({ nom: 'Interrupteur K', kind: 'tap', pos: function () { return pos; }, vis: function () { return has('interrupteur_k'); }, toucher: function () { API.faire(r().interrupteur_ferme ? 'ouvrir_interrupteur' : 'fermer_interrupteur'); }, texte: function () { return r().interrupteur_ferme ? 'fermé' : 'ouvert'; } });
    }
    function choixDiscret(nom, pos, liste, cle, action, champ) {
      ajout({ nom: nom, kind: 'drag', pos: function () { return pos; }, vis: function () { return has('oscilloscope'); },
        get: function () { var l = liste(), i = Math.max(0, l.findIndex(function (x) { return Math.abs(x - r()[cle]) < 1e-12; })); return i / Math.max(1, l.length - 1); },
        set: function (t) { var l = liste(), x = l[Math.round(t * (l.length - 1))]; if (x !== r()[cle]) { var a = {}; a[champ] = x; API.faire(action, a); } },
        texte: function () { return String(r()[cle] !== undefined ? r()[cle] : '').replace('.', ','); } });
    }
    if (lab === 'mesure_intensite' || lab === 'lois_courant' || lab === 'mesure_tension_masse' || lab === 'lois_tensions') {
      tensionKnob([-0.41, 0.043, -0.014]); levierK([-0.22, 0.05, -0.1]);
      [0, 1, 2].forEach(function (i) {
        ajout({ nom: 'Calibre', kind: 'tap', pos: function () { return [-0.2 + i * 0.2 + 0.055, 0.035, 0.21]; },
          vis: function () { var id = Object.keys(v().appareils || {})[i], a = id && v().appareils[id]; return !!(a && a.aiguilleDiv !== null && a.aiguilleDiv !== undefined); },
          toucher: function () { var id = Object.keys(v().appareils)[i], volt = /^voltmetre/.test(id), l = volt ? o().calibre_v : o().calibre_a, k = l.indexOf(r()['calibre_' + id]), a = { materiel_id: id }; a[volt ? 'calibre_v' : 'calibre_a'] = l[(k + 1) % l.length]; API.faire('choisir_calibre', a); },
          texte: function () { var id = Object.keys(v().appareils || {})[i]; return id ? 'calibre ' + fr(r()['calibre_' + id], 2) : ''; } });
        if (lab === 'mesure_tension_masse') ajout({ nom: 'Inverser V/COM', kind: 'tap', pos: function () { return [-0.2 + i * 0.2 - 0.055, 0.035, 0.21]; },
          vis: function () { var id = Object.keys(v().appareils || {})[i]; return !!id; },
          toucher: function () { API.faire('inverser_branchement', { materiel_id: Object.keys(v().appareils)[i] }); }, texte: function () { var id = Object.keys(v().appareils || {})[i]; return r()['inverse_' + id] ? 'inversé' : 'normal'; } });
      });
      if (lab === 'mesure_tension_masse') ajout({ nom: 'Masse', kind: 'tap', pos: function () { return [-0.34, 0.043, -0.016]; }, vis: function () { return has('alimentation'); }, toucher: function () { API.faire('relier_masse', { point_id: 'n' }); }, texte: function () { return r().masse_n ? 'reliée' : 'non reliée'; } });
    } else if (lab === 'oscilloscope_tension') {
      choixDiscret('Sensibilité (V/div)', [0.02, 0.17, 0.194], function () { return o().sensibilites; }, 'sensibilite_v_par_div', 'regler_sensibilite', 'sensibilite_v_par_div');
      choixDiscret('Base de temps', [0.085, 0.17, 0.194], function () { return o().bases_temps; }, 'base_temps_s_par_div', 'regler_base_temps', 'base_temps_s_par_div');
      ajout({ nom: 'Commutateur', kind: 'tap', pos: function () { return [0.02, 0.115, 0.194]; }, vis: function () { return has('oscilloscope'); }, toucher: function () { API.faire('choisir_couplage', { couplage: r().couplage === 'dc' ? 'gnd' : 'dc' }); }, texte: function () { return String(r().couplage || 'gnd').toUpperCase(); } });
      ajout({ nom: 'Fréquence GBF', kind: 'drag', pos: function () { return [0.41, 0.045, 0.178]; }, vis: function () { return has('gbf'); },
        get: function () { var a = o().frequence_min_hz, b = o().frequence_max_hz; return cl(Math.log((r().frequence_gbf_hz || a) / a) / Math.log(b / a)); },
        set: function (t) { var a = o().frequence_min_hz, b = o().frequence_max_hz, f = Math.round(a * Math.pow(b / a, t) / 10) * 10; API.faire('regler_gbf', { frequence_hz: Math.max(a, f) }); }, texte: function () { return fr(r().frequence_gbf_hz || 0) + ' Hz'; } });
      tensionKnob([0.62, 0.035, 0.168]);
      ['alimentation', 'gbf'].forEach(function (pt, i) { ajout({ nom: 'Masse ' + (i ? 'GBF' : 'alim.'), kind: 'tap', pos: function () { return i ? [0.27, 0.02, 0.178] : [0.56, 0.02, 0.168]; }, vis: function () { return has(pt); }, toucher: function () { API.faire('relier_masse', { point_id: pt }); }, texte: function () { return r()['masse_' + pt] ? 'reliée' : 'non reliée'; } }); });
    } else if (lab === 'migration_ions') {
      if (R.BoxGeometry) { var cons = new R.Mesh(new R.BoxGeometry(0.34, 0.05, 0.07), new R.MeshStandardMaterial({ color: 0x2b3340, roughness: 0.5, metalness: 0.3 })); cons.position.set(0, 0.025, -0.115); cons.castShadow = cons.receiveShadow = true; G.add(cons); }
      tensionKnob([-0.1, 0.03, -0.078]);
      ajout({ nom: 'Rhéostat', kind: 'drag', pos: function () { return [0, 0.03, -0.078]; }, vis: function () { return has('rheostat'); }, get: function () { return cl((r().resistance_rheostat_ohm !== undefined ? r().resistance_rheostat_ohm : o().rheostat_max_ohm) / o().rheostat_max_ohm); },
        set: function (t) { API.faire('regler_rheostat', { resistance_ohm: Math.round(t * o().rheostat_max_ohm / 5) * 5 }); }, texte: function () { return fr(r().resistance_rheostat_ohm !== undefined ? r().resistance_rheostat_ohm : o().rheostat_max_ohm) + ' ohms'; } });
      levierK([0.1, 0.03, -0.078]);
      [['Cristal de cuivre', -0.1, 'cristal_sulfate_cuivre'], ['Cristal de permanganate', 0.1, 'cristal_permanganate']].forEach(function (c) { ajout({ nom: c[0], kind: 'tap', pos: function () { return [c[1], 0.02, 0.1]; }, vis: function () { return has('papier_filtre'); }, toucher: function () { API.faire('deposer_cristal', { materiel_id: c[2] }); }, texte: function () { return ''; } }); });
    } else if (lab === 'osmose_pomme_de_terre') {
      [1, 2, 3, 4].forEach(function (n) { ajout({ nom: 'Tube ' + n, kind: 'tap', pos: function () { return [-0.16 + (n - 1) * 0.107, 0.1, 0]; }, vis: function () { return has('tube_' + n); }, toucher: function () { API.faire('introduire_tranches', { tube_id: 'tube_' + n }); }, texte: function () { return v().tubes['tube_' + n].tranches ? 'tranches placées' : 'toucher : introduire les tranches'; } }); });
    } else if (lab === 'sol_constituants') {
      ajout({ nom: 'Agiter le bocal', kind: 'swirl', pos: function () { return [0, 0.09, 0]; }, vis: function () { return has('bocal') && has('terre') && has('eau'); }, fin: function (s) { if (s > 0.5) API.faire('agiter', { duree_s: Math.min(600, Math.round(s * 6)) }); }, texte: function () { return S.drag && S.drag.kind === 'swirl' ? fr(S.agitS * 6) + ' s agitées' : 'cercles avec le doigt'; } });
    } else if (lab === 'titrage_acide_base') {
      ajout({ nom: 'Robinet', kind: 'drag', visuel: false, pos: function () { return [0, 0.325, 0.025]; }, vis: function () { return v().dosage.burette; },
        get: function () { var d = v().dosage.debit; return d === 'ferme' ? 0 : d === 'goutte_a_goutte' ? 0.35 : 0.85; },
        set: function (t) { var n = t < 0.1 ? 'ferme' : t < 0.55 ? 'goutte_a_goutte' : 'jet'; if (n !== v().dosage.debit) API.faire('tourner_robinet', { debit: n }); },
        texte: function () { var d = v().dosage.debit; return d === 'ferme' ? 'fermé' : d === 'jet' ? 'jet' : 'goutte à goutte'; } });
      ajout({ nom: 'Agiter l\'erlenmeyer', kind: 'swirl', pos: function () { return [0, 0.07, 0]; }, vis: function () { return v().dosage.erlenmeyer; }, fin: function () { }, texte: function () { return 'cercles avec le doigt'; } });
    }

    // ------------------------------------------------------------ gouttes (dosage) et agitation
    var goutteStatique = null; scene.traverse(function (m) { if (m.geometry && m.geometry.type === 'SphereGeometry' && Math.abs(m.geometry.parameters.radius - 0.003) < 1e-6) goutteStatique = m; });
    var flacon = null; scene.traverse(function (m) { if (m.type === 'Group' && m.children.some(function (c) { return c.geometry && c.geometry.type === 'LatheGeometry'; })) flacon = m; });
    var base = flacon ? flacon.position.clone() : null;
    var gp = []; if (lab === 'titrage_acide_base') for (var i = 0; i < 3; i++) { var gg = new R.Mesh(new R.SphereGeometry(0.0034, 12, 10), eau); gg.visible = false; G.add(gg); gp.push({ m: gg, y: 0, vy: 0, actif: false }); }
    var prochaine = 0;

    // ------------------------------------------------------------ pointeur
    var el = T.renderer.domElement, tmp = new V3();
    function proj(p) { var q = el.getBoundingClientRect(); tmp.set(p[0], p[1], p[2]); tmp.project(camera); return { x: (tmp.x + 1) / 2 * q.width, y: (1 - tmp.y) / 2 * q.height }; }
    function loc(e) { var q = el.getBoundingClientRect(); return { x: e.clientX - q.left, y: e.clientY - q.top }; }
    function trouver(e) { var q = loc(e), best = null, bd = 34; H.forEach(function (h) { if (!h.vis()) return; var s = proj(h.pos()), d = Math.hypot(s.x - q.x, s.y - q.y); if (d < bd) { bd = d; best = h; } }); return best; }
    var depart = null;
    hote.addEventListener('pointerdown', function (e) {
      var h = trouver(e); if (!h) return; e.stopPropagation(); controls.enabled = false; var q = loc(e);
      S.drag = h; depart = { x: q.x, y: q.y, t: h.get ? h.get() : 0, bouge: false, th: null, cx: proj(h.pos()).x, cy: proj(h.pos()).y }; S.agitS = 0; S.agit = 0;
      try { hote.setPointerCapture(e.pointerId); } catch (_) { } sale = true; T.dirty();
    }, true);
    window.addEventListener('pointermove', function (e) {
      var q = loc(e);
      if (S.drag) {
        var h = S.drag, dx = q.x - depart.x, dy = q.y - depart.y; if (Math.hypot(dx, dy) > 6) depart.bouge = true;
        if (h.kind === 'drag') { var t = cl(depart.t + (dx - dy) / 200); if (h.k) h.k.rotation.y = -2.2 + 4.4 * t; h.set(t); }
        else if (h.kind === 'swirl') { var th = Math.atan2(q.y - depart.cy, q.x - depart.cx); if (depart.th !== null) { var d = th - depart.th; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; S.agit = Math.min(1, S.agit + Math.abs(d) * 0.9); } depart.th = th; }
        sale = true; return;
      }
      if (!hote.contains(e.target)) return; var k = trouver(e); if (k !== S.hover) { S.hover = k; el.style.cursor = k ? 'pointer' : ''; sale = true; T.dirty(); }
    });
    function fin() { if (!S.drag) return; var h = S.drag; S.drag = null; controls.enabled = true; if (h.kind === 'tap' && !depart.bouge) h.toucher(); if (h.kind === 'swirl' && h.fin) h.fin(S.agitS); S.agit = 0; sale = true; T.dirty(); }
    window.addEventListener('pointerup', fin); window.addEventListener('pointercancel', fin);

    // ------------------------------------------------------------ caméra : vues préréglées (0,6 s)
    var ens = { p: camera.position.clone(), t: controls.target.clone() };
    setTimeout(function () { if (!cam) ens = { p: camera.position.clone(), t: controls.target.clone() }; }, 120);
    function vue(n) {
      var to = ens, d = v().dosage;
      if (n === 'burette') to = { p: new V3(0.03, 0.34, 0.36), t: new V3(0, 0.31, 0) };
      else if (n === 'erlen') to = { p: new V3(0, 0.15, 0.34), t: new V3(0, 0.07, 0) };
      else if (n === 'gros') to = { p: ens.t.clone().add(ens.p.clone().sub(ens.t).multiplyScalar(0.55)), t: ens.t.clone() };
      cam = { t0: performance.now(), p0: camera.position.clone(), g0: controls.target.clone(), p1: to.p, g1: to.t }; S.vue = n; sale = true; T.dirty();
    }
    function majTags() {
      var q = el.getBoundingClientRect();
      H.forEach(function (h) {
        var ok = h.vis(); h.tag.hidden = !ok; if (!ok) return; var s = proj(h.pos()); h.tag.style.left = s.x + 'px'; var actif = S.drag === h || S.hover === h; h.tag.style.top = (actif ? s.y - 20 : s.y) + 'px';
        var tx = h.texte ? h.texte() : ''; h.tag.textContent = h.nom + (tx ? ' : ' + tx : ''); h.tag.className = 'tag-g' + (S.drag === h || S.hover === h ? ' act' : '');
        if (h.k) h.k.rotation.y = -2.2 + 4.4 * (S.drag === h ? h.get() : h.get()); h.k && (h.k.parent.visible = ok);
      });
    }
    window.__tick = function () {
      var now = performance.now(), dt = Math.min(0.05, (now - dernier) / 1000); dernier = now; var b = false;
      if (cam) { var u = Math.min(1, (now - cam.t0) / 600), e = u * u * (3 - 2 * u); camera.position.lerpVectors(cam.p0, cam.p1, e); controls.target.lerpVectors(cam.g0, cam.g1, e); controls.update(); if (u >= 1) cam = null; b = true; }
      var hk = S.drag || S.hover; if (hk && hk.vis()) { halo.visible = true; var p = hk.pos(); halo.position.set(p[0], p[1], p[2] + 0.004); b = true; } else if (halo.visible) { halo.visible = false; b = true; }
      // agitation : le flacon tourbillonne, l'intensité retombe quand le doigt s'arrête
      if (S.drag && S.drag.kind === 'swirl') { if (S.agit > 0.25) S.agitS += dt; S.agit = Math.max(0, S.agit - dt * 0.8); }
      if (flacon) { var a = S.agit; if (a > 0.01 || flacon.userData.on) { var ph = now / 90; flacon.position.set(base.x + Math.cos(ph) * 0.012 * a, base.y, base.z + Math.sin(ph) * 0.012 * a); flacon.userData.on = a > 0.01; b = true; } }
      // gouttes qui tombent de la pointe de la burette
      if (lab === 'titrage_acide_base') {
        var d = v().dosage, coule = d.debit === 'goutte_a_goutte' && d.soude && d.erlenmeyer;
        if (goutteStatique) goutteStatique.visible = false;
        if (coule && now > prochaine) { var lib = gp.filter(function (g) { return !g.actif; })[0]; if (lib) { lib.actif = true; lib.y = 0.285; lib.vy = 0; prochaine = now + 700; } }
        gp.forEach(function (g) { if (!g.actif) { g.m.visible = false; return; } g.vy += 2.2 * dt; g.y -= g.vy * dt; g.m.visible = true; g.m.position.set(0, g.y, 0); b = true; if (g.y < 0.075) { g.actif = false; g.m.visible = false; } });
      }
      majTags(); var re = sale || b; sale = false; return re;
    };
    majTags();
    return {
      vue: vue, maj: function () { sale = true; T.dirty(); },
      vues: lab === 'titrage_acide_base' ? [['ensemble', 'Ensemble'], ['burette', 'Burette'], ['erlen', 'Erlenmeyer']] : [['ensemble', 'Ensemble'], ['gros', 'Gros plan']],
      detruire: function () { window.__tick = null; scene.remove(G); tagsEl.textContent = ''; controls.enabled = true; if (flacon) flacon.position.copy(base); }
    };
  }
  window.Gestes = { activer: activer };
}());
