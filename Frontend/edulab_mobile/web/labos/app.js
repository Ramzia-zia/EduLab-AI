// Interface mobile des laboratoires EduLab AI (inspirée de la vidéo de l'app).
// Aucune règle de physique ici : tout vient de LaboCore (Dart compilé). Chaque geste s'applique tout de suite.
(function () {
  'use strict';
  var TITRES = {
    mesure_intensite: ['Mesure de l\'intensité', 'Seconde'], lois_courant: ['Lois du courant', 'Seconde'],
    mesure_tension_masse: ['Tension et masse', 'Seconde'], lois_tensions: ['Lois des tensions', 'Seconde'],
    oscilloscope_tension: ['Tension à l\'oscilloscope', 'Seconde'], focale_lentille: ['Focale d\'une lentille', 'Première'],
    migration_ions: ['Migration des ions', 'Seconde'], osmose_pomme_de_terre: ['Osmose : pomme de terre', 'Première'],
    sol_constituants: ['Constituants d\'un sol', 'Seconde'], titrage_acide_base: ['Dosage acide-base', 'Terminale']
  };
  var ICONES = { physique: 'P', chimie: 'C', svt: 'S' };
  var MATIERES = { physique: 'Physique', chimie: 'Chimie', svt: 'SVT' };
  var LBL = { alimentation: 'Alimentation', amperemetre: 'Ampèremètre', amperemetre_aiguille: 'Ampèremètre', multimetre: 'Multimètre',
    voltmetre: 'Voltmètre', voltmetre_aiguille: 'Voltmètre', resistor_r1: 'Résistance R1', resistor_r2: 'Résistance R2',
    interrupteur_k: 'Interrupteur K', fils: 'Fils', rheostat: 'Rhéostat', papier_filtre: 'Papier-filtre', electrode_a: 'Électrode A',
    electrode_b: 'Électrode B', gants: 'Gants', spatule: 'Spatule', gbf: 'GBF', oscilloscope: 'Oscilloscope', banc_optique: 'Banc optique',
    lentille_convergente: 'Lentille', ecran: 'Écran', source_lumineuse: 'Source', objet_lumineux: 'Objet lumineux', miroir_plan: 'Miroir plan',
    cherche_foyer: 'Cherche-foyer', reglet: 'Réglet', tube_1: 'Tube 1', tube_2: 'Tube 2', tube_3: 'Tube 3', tube_4: 'Tube 4',
    pomme_de_terre: 'Pomme de terre', eau_distillee: 'Eau distillée', solution_saccharose_125: 'Saccharose 125', solution_saccharose_250: 'Saccharose 250',
    solution_saccharose_375: 'Saccharose 375', couteau: 'Couteau', regle: 'Règle', bocal: 'Bocal', regle_graduee: 'Règle graduée', terre: 'Terre', eau: 'Eau',
    lunettes: 'Lunettes', burette: 'Burette', becher: 'Bécher', soude: 'Soude', erlenmeyer: 'Erlenmeyer', pipette: 'Pipette', phenolphtaleine: 'Phénolphtaléine' };
  var ERREURS = {
    amperemetre_en_derivation: 'Ampèremètre en dérivation', court_circuit_generateur: 'Court-circuit du générateur', grand_calibre_oublie: 'Plus grand calibre oublié',
    calibre_trop_petit: 'Calibre trop petit', lecture_cadran: 'Lecture du cadran fausse', voltmetre_en_serie: 'Voltmètre en série',
    masse_oscilloscope_oubliee: 'Masse de l\'oscilloscope oubliée', trace_hors_ecran: 'Trace hors de l\'écran', lecture_oscillogramme: 'Lecture de l\'oscillogramme fausse',
    confusion_maximale_efficace: 'Confusion valeur maximale / efficace', distance_objet_ecran_trop_petite: 'Distance objet-écran trop petite',
    image_non_nette: 'Position notée sans image nette', signe_distance_algebrique: 'Signe de la distance algébrique', gants_oublies: 'Gants oubliés',
    electrode_inversee: 'Électrode inversée', erreur_volume_acide: 'Volume d\'acide faux', lunettes_oubliees: 'Lunettes oubliées',
    debit_trop_rapide: 'Débit trop rapide près de l\'équivalence', depassement_equivalence: 'Équivalence dépassée', lecture_burette: 'Burette mal lue',
    unite_concentration: 'Unité de concentration fausse', calcul_concentration: 'Concentration mal calculée', tubes_identiques: 'Deux tubes identiques',
    mesure_trop_tot: 'Mesure avant la fin du temps prévu', lecture_longueur: 'Longueur mal mesurée', agitation_insuffisante: 'Agitation insuffisante',
    lecture_hauteur: 'Hauteur mal lue', pourcentage_faux: 'Pourcentage faux' };
  var ELEC = ['mesure_intensite', 'lois_courant', 'mesure_tension_masse', 'lois_tensions'];
  var TEMPS = { migration_ions: [['+1 min', 60], ['+10 min', 600]], osmose_pomme_de_terre: [['+1 h', 3600], ['+2 h', 7200], ['+24 h', 86400]],
    sol_constituants: [['+10 min', 600], ['+1 h', 3600], ['+24 h', 86400]] };
  var BANC = { objet_lumineux: ['Objet', 10], lentille_convergente: ['Lentille', 40], ecran: ['Écran', 90] };

  var meta = null, vue = null, journal = [], alerte = null, labId = null, L3 = null, glisse = false, sigCmd = '', sigMat = '';
  var runId = null, compteurRun = 0;
  var banc = null, gestes = null, dosage = null, elec = null, osc = null, lab3 = null, lives = [], statut = {}, indicVerse = false, minuteur = null, notesGrandeur = null, ferme3d = false;

  function $(s) { return document.querySelector(s); }
  function el(tag, attrs, enfants) {
    var n = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) { if (k === 'texte') n.textContent = attrs[k]; else if (k === 'on') Object.keys(attrs.on).forEach(function (e) { n.addEventListener(e, attrs.on[e]); }); else n.setAttribute(k, attrs[k]); });
    (enfants || []).forEach(function (c) { n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return n;
  }
  function vide(n) { while (n.firstChild) n.removeChild(n.firstChild); return n; }
  var nfs = {};
  function fmt(x, d) {
    if (x === null || x === undefined || isNaN(x)) return '–'; d = d === undefined ? 2 : d;
    if (!nfs[d]) nfs[d] = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: d }); return nfs[d].format(x);
  }
  function joli(s) { return String(s).replace(/_/g, ' ').replace(/\br(\d)\b/g, 'R$1').replace(/^./, function (c) { return c.toUpperCase(); }); }
  function nom(id) { return LBL[id] || joli(id); }
  function empl(s) { return String(s).replace(/^bornes_/, 'aux bornes de ').replace(/_/g, ' ').replace(/\br(\d)\b/g, 'R$1').replace(/\bk\b/, 'K').replace(/^point (.)$/, 'point $1'); }
  function notifierParent(type, donnees) {
    if (window.parent === window) return;
    window.parent.postMessage(JSON.stringify(Object.assign({
      source: 'edulab-laboratoire',
      type: type,
      run_id: runId,
      experience_id: labId
    }, donnees || {})), window.location.origin);
  }
  function journaliser(evenement) {
    journal.push(evenement);
    notifierParent('action', {
      action: evenement.action,
      valeurs: evenement.valeurs || {},
      horodatage: evenement.horodatage || evenement.horodatage_utc || new Date().toISOString()
    });
  }
  function resultatTentative() {
    return {
      experience_titre: TITRES[labId][0],
      experience_matiere: DEFINITIONS[labId].matiere,
      resultat: vue.resultat || {},
      erreurs: vue.erreurs || [],
      mesures: vue.mesures || []
    };
  }
  function terminerCoteParent(details) {
    details = details || {};
    notifierParent('terminee', {
      fin_le: new Date().toISOString(),
      score: typeof details.score === 'number' ? details.score : null,
      resultat: Object.assign(resultatTentative(), details.resultat || {})
    });
  }

  // ------------------------------------------------------------ moteur
  function charger(id) {
    labId = id; journal = []; alerte = null; indicVerse = false; sigCmd = sigMat = ''; ferme3d = false;
    runId = Date.now().toString(36) + '-' + (++compteurRun);
    var r = JSON.parse(LaboCore.creer(JSON.stringify(DEFINITIONS[id]))); meta = r.meta; vue = r.vue;
    var d = DEFINITIONS[id];
    notifierParent('demarree', { debut_le: new Date().toISOString() });
    $('#titre').textContent = TITRES[id][0]; $('#meta').textContent = MATIERES[d.matiere] + ' · ' + TITRES[id][1];
    $('#liste').hidden = true; $('#labo').hidden = false; $('#labo').scrollTop = 0; $('#alerte').hidden = true;
    $('#scene').classList.remove('zoom'); $('#notes').open = false; notesGrandeur = null;
    if (banc) { banc.detruire(); banc = null; }
    if (gestes) { gestes.detruire(); gestes = null; vide($('#vues')); }
    if (dosage) { dosage.detruire(); dosage = null; }
    if (elec) { elec.detruire(); elec = null; }
    if (osc) { osc.detruire(); osc = null; }
    if (lab3) { lab3.detruire(); lab3 = null; }
    $('#materiel').hidden = false; $('#materiel').previousElementSibling.hidden = false; $('#indice-suivant').hidden = true;
    if (L3 && L3.supports(id)) { L3.show(id, meta.options); setTimeout(function () { L3.resize(); L3.update(vue); }, 30); }
    if (id === 'focale_lentille' && L3 && window.BancUI) {
      vide($('#appareils')); vide($('#commandes')); $('#notes').hidden = true;
      banc = BancUI.monter(L3, { scene: $('#scene'), hote: $('#scene'), tags: $('#tags'), zone: $('#commandes'),
        assistant: function (t) { $('#conseil').textContent = t; $('.assistant').className = 'assistant'; },
        evenement: function (a, v) { journaliser({ action: a, valeurs: v }); },
        deplace: function (k, cm) { var m = { objet: 'objet_lumineux', lentille: 'lentille_convergente', ecran: 'ecran' }[k]; journaliser({ action: 'deplacer_materiel', valeurs: { materiel_id: m || k, position_cm: Math.round(cm * 10) / 10 } }); },
        mesure: function (g, v, u) { journaliser({ action: 'mesurer', valeurs: { grandeur_id: g, valeur: v, unite: u } }); } });
    } else if (id === 'titrage_acide_base' && L3 && window.DosageSpec) {
      vide($('#appareils')); vide($('#commandes')); $('#notes').hidden = true; $('#tags').hidden = false; $('#materiel').hidden = true; $('#materiel').previousElementSibling.hidden = true;
      dosage = DosageSpec.creer(L3, $('#scene'), $('#tags'), $('#commandes'), {
        assistant: function (t, plus) { $('#conseil').textContent = t; $('.assistant').className = 'assistant'; $('#indice-suivant').hidden = !plus; },
        alerte: function (t) { var z = $('#alerte'); if (t) { vide(z); z.appendChild(el('b', { texte: 'Sécurité · action bloquée' })); z.appendChild(el('div', { texte: t })); z.hidden = false; } else z.hidden = true; },
        etape: function (n) { $('#badge').textContent = 'Étape ' + n + '/9'; $('#badge').hidden = false; },
        evenement: function (a, v) { journaliser({ action: a, valeurs: v }); } });
    } else if (ELEC.indexOf(id) >= 0 && L3 && window.ElectriciteSpec) {
      vide($('#appareils')); vide($('#commandes')); $('#notes').hidden = true; $('#tags').hidden = false; $('#materiel').hidden = true; $('#materiel').previousElementSibling.hidden = true;
      elec = ElectriciteSpec.creer(L3, $('#scene'), $('#tags'), $('#commandes'), { lab: function () { return labId; }, vue: function () { return vue; }, meta: function () { return meta; }, faire: faire,
        cb: { assistant: function (t, plus) { $('#conseil').textContent = t; $('.assistant').className = 'assistant'; $('#indice-suivant').hidden = !plus; } } });
    } else if (id === 'oscilloscope_tension' && L3 && window.OscilloSpec) {
      vide($('#appareils')); vide($('#commandes')); $('#notes').hidden = true; $('#tags').hidden = false; $('#materiel').hidden = true; $('#materiel').previousElementSibling.hidden = true;
      osc = OscilloSpec.creer(L3, $('#scene'), $('#tags'), $('#commandes'), { lab: function () { return labId; }, vue: function () { return vue; }, meta: function () { return meta; }, faire: faire,
        cb: { assistant: function (t, plus) { $('#conseil').textContent = t; $('.assistant').className = 'assistant'; $('#indice-suivant').hidden = !plus; } } });
    } else if (['migration_ions', 'osmose_pomme_de_terre', 'sol_constituants'].indexOf(id) >= 0 && L3 && window.Labos3Spec) {
      vide($('#appareils')); vide($('#commandes')); $('#notes').hidden = true; $('#tags').hidden = false; $('#materiel').hidden = true; $('#materiel').previousElementSibling.hidden = true;
      lab3 = Labos3Spec.creer(id, L3, $('#scene'), $('#tags'), $('#commandes'), { lab: function () { return labId; }, vue: function () { return vue; }, meta: function () { return meta; }, faire: faire, avancer: avancer,
        cb: { assistant: function (t, plus) { $('#conseil').textContent = t; $('.assistant').className = 'assistant'; $('#indice-suivant').hidden = !plus; } } });
    } else {
      $('#notes').hidden = false; $('#tags').hidden = false;
      if (L3 && L3.supports(id) && window.Gestes) {
        gestes = Gestes.activer(L3, $('#scene'), $('#tags'), { lab: function () { return labId; }, vue: function () { return vue; }, meta: function () { return meta; }, faire: faire });
        var vz = vide($('#vues')), sg = el('div', { 'class': 'seg' });
        gestes.vues.forEach(function (x, i) { sg.appendChild(el('button', { type: 'button', 'class': i ? '' : 'on', texte: x[1], on: { click: function (e) { gestes.vue(x[0]); Array.prototype.forEach.call(sg.children, function (c) { c.className = ''; }); e.currentTarget.className = 'on'; } } })); });
        vz.appendChild(sg);
      }
    }
    if (!statut[id]) statut[id] = 'cours';
    rendre(); arreter(); history.replaceState(null, '', '#' + id);
  }
  function faire(action, valeurs) {
    var r = JSON.parse(LaboCore.appliquer(action, JSON.stringify(valeurs || {}), new Date().toISOString()));
    vue = r.vue; if (r.evenement) journaliser(r.evenement);
    alerte = r.bloquee ? r.message : (r.erreurInterface ? null : null);
    if (r.erreurInterface && window.console) console.warn(r.erreurInterface);
    rendre(); return r;
  }
  function avancer(s) { var r = JSON.parse(LaboCore.avancer(s)); vue = r.vue; rendre(); }
  function arreter() { if (minuteur) { clearInterval(minuteur); minuteur = null; } }
  function boucleDosage() {  // le robinet coule en temps réel (goutte à goutte accéléré)
    var d = vue.dosage; if (!d) return;
    if (d.debit !== 'ferme' && !minuteur && !vue.termine) {
      minuteur = setInterval(function () {
        var dz = vue.dosage;
        if (!dz || dz.debit === 'ferme' || vue.termine || dz.volumeMl >= dz.buretteMl - 0.2) { arreter(); return; }
        avancer(dz.debit === 'jet' ? 0.2 : 1.6);
      }, 200);
    } else if (d.debit === 'ferme') arreter();
  }

  // ------------------------------------------------------------ placement du matériel
  function emplDefaut(m) {
    var l = meta.emplacements[m] || [], p = null;
    if (/^resistor_r1/.test(m)) p = 'serie';
    else if (m === 'resistor_r2') p = (labId === 'lois_courant' || labId === 'lois_tensions') ? 'derivation' : 'serie';
    else if (m === 'fils') p = 'circuit';
    else if (m === 'amperemetre' || m === 'amperemetre_aiguille') p = 'branche_principale';
    else if (m === 'multimetre') p = labId === 'mesure_intensite' ? 'point_1' : (labId === 'mesure_tension_masse' ? 'bornes_r2' : 'bornes_gbf');
    else if (/^voltmetre/.test(m)) p = 'bornes_r1';
    else if (m === 'electrode_a') p = 'gauche'; else if (m === 'electrode_b') p = 'droite';
    else if (/^tube_\d$/.test(m)) p = ['eau_distillee', 'solution_saccharose_125', 'solution_saccharose_250', 'solution_saccharose_375'][+m.slice(5) - 1];
    return l.indexOf(p) >= 0 ? p : l[0];
  }
  function placer(m, e) {
    var v = { materiel_id: m }; var l = meta.emplacements[m] || [];
    if (l.length > 1 && !e) { feuille(m); return; }
    if (l.length) v.emplacement_id = e || l[0];
    var r = faire('placer_materiel', v); suites(m); return r;
  }
  function suites(m) {  // gestes qui suivent logiquement la pose (comme dans la vidéo)
    var v = vue.materiel;
    if (!banc && BANC[m] && vue.banc && vue.banc[m === 'objet_lumineux' ? 'objet' : m === 'ecran' ? 'ecran' : 'lentille'] === null) faire('deplacer_materiel', { materiel_id: m, position_cm: BANC[m][1] });
  }
  function lacher(m) { // on ne peut pas retirer : on rouvre la feuille d'emplacement si possible
    if ((meta.emplacements[m] || []).length) feuille(m);
  }
  function feuille(m) {
    var c = vide($('#feuille-corps')), cur = vue.materiel[m];
    $('#feuille-titre').textContent = nom(m) + ' : où le placer ?';
    meta.emplacements[m].forEach(function (e) {
      c.appendChild(el('button', { 'class': 'pastille' + (e === cur ? ' sel' : ''), type: 'button', texte: joli(empl(e)), on: { click: function () { placer(m, e); $('#feuille').hidden = true; } } }));
    });
    $('#feuille').hidden = false;
  }

  // ------------------------------------------------------------ éléments de commande
  function lignee(etiq, noeud, live) {
    var b = el('b'); var l = el('label', {}, [el('span', { texte: etiq }), b]); if (live) { lives.push(function () { b.textContent = live(); }); }
    return el('div', { 'class': 'ligne' }, [l, noeud]);
  }
  function seg(opts, courant, choisir) {
    return el('div', { 'class': 'seg' }, opts.map(function (o) {
      return el('button', { type: 'button', 'class': String(o[0]) === String(courant) ? 'on' : '', texte: o[1], on: { click: function () { choisir(o[0]); } } });
    }));
  }
  function curseur(etiq, min, max, pas, val, unit, envoyer) {
    var inp = el('input', { type: 'range', min: min, max: max, step: pas, value: val }), t = null;
    var ligne = lignee(etiq, inp); var b = ligne.querySelector('b'); b.textContent = fmt(+val, 1) + ' ' + unit;
    inp.addEventListener('pointerdown', function () { glisse = true; });
    function fin() { glisse = false; }
    inp.addEventListener('change', fin); window.addEventListener('pointerup', function () { setTimeout(fin, 60); });
    inp.addEventListener('input', function () { b.textContent = fmt(+inp.value, 1) + ' ' + unit; clearTimeout(t); t = setTimeout(function () { envoyer(+inp.value); }, 70); });
    return ligne;
  }
  function interrupteur(etiq, on, bascule) {
    return el('div', { 'class': 'ligne' }, [el('button', { type: 'button', 'class': 'interrupteur' + (on ? ' on' : ''), on: { click: bascule } }, [el('span', { texte: etiq }), el('i')])]);
  }
  function btn(txt, on, clic) { return el('button', { type: 'button', 'class': 'btn' + (on ? ' on' : ''), texte: txt, on: { click: clic } }); }
  function has(id) { return vue && Object.prototype.hasOwnProperty.call(vue.materiel, id); }

  function commandes() {
    var z = vide($('#commandes')), r = vue.reglages, o = meta.options; lives = [];
    function add(n) { z.appendChild(n); }
    var tension = r.tension_generateur_v !== undefined ? r.tension_generateur_v : (r.tension_alimentation_v || 0);

    if (!Object.keys(vue.materiel).length) { add(el('p', { 'class': 'petit', texte: 'Touche une pastille de matériel : il se place directement dans la scène 3D.' })); }
    if (ELEC.indexOf(labId) >= 0 || labId === 'migration_ions') {
      if (has('alimentation')) add(curseur('Tension de l\'alimentation', 0, o.tension_max_v, 0.5, tension, 'V', function (v) { faire('regler_tension', { tension_v: v }); }));
      if (has('rheostat')) add(curseur('Rhéostat', 0, o.rheostat_max_ohm, 5, r.resistance_rheostat_ohm !== undefined ? r.resistance_rheostat_ohm : o.rheostat_max_ohm, 'Ω', function (v) { faire('regler_rheostat', { resistance_ohm: v }); }));
      if (has('interrupteur_k')) add(interrupteur('Interrupteur K : ' + (r.interrupteur_ferme ? 'fermé' : 'ouvert'), !!r.interrupteur_ferme, function () { faire(r.interrupteur_ferme ? 'ouvrir_interrupteur' : 'fermer_interrupteur'); }));
      Object.keys(vue.materiel).filter(function (id) { return /^(amperemetre|voltmetre)/.test(id) || (id === 'amperemetre'); }).forEach(function (id) {
        var volt = /^voltmetre/.test(id), l = volt ? o.calibre_v : o.calibre_a; if (!l) return;
        add(lignee('Calibre · ' + nom(id), seg(l.map(function (c) { return [c, fmt(c, 2) + (volt ? ' V' : ' A')]; }), r['calibre_' + id], function (c) { var v = { materiel_id: id }; v[volt ? 'calibre_v' : 'calibre_a'] = c; faire('choisir_calibre', v); })));
      });
      if (meta.actions.indexOf('inverser_branchement') >= 0) {
        var vm = Object.keys(vue.materiel).filter(function (id) { return /^(voltmetre|multimetre)/.test(id); });
        if (vm.length || has('alimentation')) add(el('div', { 'class': 'ligne rangee' }, vm.map(function (id) { return btn('Inverser V/COM · ' + nom(id), !!r['inverse_' + id], function () { faire('inverser_branchement', { materiel_id: id }); }); })
          .concat([btn('Relier la masse (COM vers N)', !!r.masse_n, function () { faire('relier_masse', { point_id: 'n' }); })])));
      }
      if (labId === 'migration_ions' && has('papier_filtre')) {
        var g = has('gants');
        add(lignee('Déposer un cristal' + (g ? '' : ' (mets les gants d\'abord)'), el('div', { 'class': 'seg' }, [
          btn('Sulfate de cuivre', vue.papier.cuivreDepose, function () { faire('deposer_cristal', { materiel_id: 'cristal_sulfate_cuivre' }); }),
          btn('Permanganate', vue.papier.permanganateDepose, function () { faire('deposer_cristal', { materiel_id: 'cristal_permanganate' }); })])));
      }
    } else if (labId === 'oscilloscope_tension') {
      if (has('alimentation')) add(curseur('Tension continue', 0, o.tension_max_v, 0.5, tension, 'V', function (v) { faire('regler_tension', { tension_v: v }); }));
      if (has('gbf')) add(curseur('Fréquence du GBF', o.frequence_min_hz, o.frequence_max_hz, 10, r.frequence_gbf_hz || 200, 'Hz', function (v) { faire('regler_gbf', { frequence_hz: v }); }));
      if (has('oscilloscope')) {
        add(lignee('Sensibilité verticale', seg(o.sensibilites.map(function (s) { return [s, fmt(s)]; }), r.sensibilite_v_par_div, function (s) { faire('regler_sensibilite', { sensibilite_v_par_div: s }); })));
        add(lignee('Base de temps (ms/div)', seg(o.bases_temps.slice(0, 8).map(function (s) { return [s, fmt(s * 1000)]; }), r.base_temps_s_par_div, function (s) { faire('regler_base_temps', { base_temps_s_par_div: s }); })));
        add(lignee('Commutateur', seg([['gnd', 'GND'], ['dc', 'DC']], r.couplage, function (c) { faire('choisir_couplage', { couplage: c }); })));
        add(el('div', { 'class': 'ligne rangee' }, ['alimentation', 'gbf'].filter(has).map(function (p) { return btn('Masse · ' + nom(p), !!r['masse_' + p], function () { faire('relier_masse', { point_id: p }); }); })));
      }
    } else if (labId === 'focale_lentille') {
      Object.keys(BANC).filter(has).forEach(function (m) {
        var k = m === 'objet_lumineux' ? 'objet' : m === 'ecran' ? 'ecran' : 'lentille', p = vue.banc[k];
        add(curseur('Position · ' + BANC[m][0], 0, o.longueur_banc_cm, 0.5, p === null ? BANC[m][1] : p, 'cm', function (v) { faire('deplacer_materiel', { materiel_id: m, position_cm: v }); }));
      });
    } else if (labId === 'osmose_pomme_de_terre') {
      Object.keys(vue.tubes).filter(has).forEach(function (t) {
        var d = vue.tubes[t], c = el('div', { 'class': 'ligne rangee' });
        c.appendChild(btn(d.tranches ? nom(t) + ' : tranches placées' : 'Introduire les tranches · ' + nom(t), d.tranches, function () { faire('introduire_tranches', { tube_id: t }); }));
        var s = el('span', { 'class': 'petit' }); lives.push(function () { var q = vue.tubes[t]; s.textContent = (q.solution ? nom(q.solution) : '') + (q.longueurCm !== null ? ' · ' + fmt(q.longueurCm, 2) + ' cm' : ''); }); c.appendChild(s); add(c);
      });
    } else if (labId === 'sol_constituants') {
      if (has('bocal') && has('terre') && has('eau')) add(lignee('Agiter le bocal', el('div', { 'class': 'seg' }, [['30 s', 30], ['3 min', 180], ['10 min', 600]].map(function (a) { return btn(a[0], false, function () { faire('agiter', { duree_s: a[1] }); }); }))));
    } else if (labId === 'titrage_acide_base') {
      var dz = vue.dosage, ok0 = has('erlenmeyer');
      var b1 = btn('Prélever 20 mL d\'acide à la pipette', dz.volumeAcideMl > 0, function () { faire('verser', { solution: 'acide', volume_ml: 20 }); }); b1.disabled = !(has('pipette') && ok0) || dz.volumeAcideMl > 0;
      var b2 = btn('Ajouter 3 gouttes de phénolphtaléine', indicVerse, function () { indicVerse = true; faire('verser', { solution: 'phenolphtaleine', volume_ml: 3 }); }); b2.disabled = !(has('phenolphtaleine') && dz.volumeAcideMl > 0) || indicVerse;
      add(el('div', { 'class': 'ligne rangee' }, [b1, b2]));
      add(lignee('Robinet de la burette', robinet()));
    }
    if (TEMPS[labId]) add(lignee('Faire avancer le temps', el('div', { 'class': 'seg' }, TEMPS[labId].map(function (t) { return btn(t[0], false, function () { avancer(t[1]); }); })), function () { return fmt(vue.tempsS / 60, 1) + ' min écoulées'; }));
    lives.forEach(function (f) { f(); });
  }
  function robinet() {
    var d = vue.dosage ? vue.dosage.debit : 'ferme';
    return seg([['ferme', 'Fermé'], ['goutte_a_goutte', 'Goutte à goutte'], ['jet', 'Jet']], d, function (c) { faire('tourner_robinet', { debit: c }); });
  }

  // ------------------------------------------------------------ instruments (2D)
  function svg(tag, w, h) { var s = document.createElementNS('http://www.w3.org/2000/svg', tag); s.setAttribute('viewBox', '0 0 ' + w + ' ' + h); return s; }
  function gauge(div) {
    var ns = 'http://www.w3.org/2000/svg', s = svg('svg', 220, 130), cx = 110, cy = 112, R = 88;
    function pt(d, r) { var a = (-60 + 120 * d / 100) * Math.PI / 180; return [cx + r * Math.sin(a), cy - r * Math.cos(a)]; }
    function add(t, a, tx) { var n = document.createElementNS(ns, t); for (var k in a) n.setAttribute(k, a[k]); if (tx) n.textContent = tx; s.appendChild(n); }
    for (var d = 0; d <= 100; d += 5) { var g = d % 10 === 0, p1 = pt(d, R), p2 = pt(d, R - (g ? 12 : 6)); add('line', { x1: p1[0], y1: p1[1], x2: p2[0], y2: p2[1], stroke: '#0D2149', 'stroke-width': g ? 2 : 1 });
      if (d % 20 === 0) { var q = pt(d, R - 24); add('text', { x: q[0], y: q[1] + 4, 'text-anchor': 'middle', 'font-size': 11, fill: '#51607A' }, d); } }
    var tip = pt(Math.max(0, Math.min(100, div)), R - 6); add('line', { x1: cx, y1: cy, x2: tip[0], y2: tip[1], stroke: '#D6342C', 'stroke-width': 3, 'stroke-linecap': 'round' });
    add('circle', { cx: cx, cy: cy, r: 5, fill: '#0D2149' }); return s;
  }
  function oscillo(cv, e) {
    var o = meta.options, c = cv.getContext('2d'), W = cv.width, H = cv.height, cx = W / o.largeur_div, cy = H / (2 * o.demi_hauteur_div);
    c.fillStyle = '#0D2149'; c.fillRect(0, 0, W, H); c.strokeStyle = '#2B3E66';
    for (var i = 0; i <= o.largeur_div; i++) { c.beginPath(); c.moveTo(i * cx, 0); c.lineTo(i * cx, H); c.stroke(); }
    for (var j = 0; j <= 2 * o.demi_hauteur_div; j++) { c.beginPath(); c.moveTo(0, j * cy); c.lineTo(W, j * cy); c.stroke(); }
    c.strokeStyle = e.signalPresent && !e.traceVisible ? '#FF8A1F' : '#4ee07a'; c.lineWidth = 3; c.beginPath();
    e.trace.forEach(function (p, k) { var x = p[0] * cx, y = H / 2 - p[1] * cy; if (k) c.lineTo(x, y); else c.moveTo(x, y); }); c.stroke();
  }
  function banc() {
    var b = vue.banc, L = meta.options.longueur_banc_cm, s = svg('svg', 700, 150);
    function X(cm) { return 20 + cm * 660 / L; }
    function add(t, a, tx) { var n = document.createElementNS('http://www.w3.org/2000/svg', t); for (var k in a) n.setAttribute(k, a[k]); if (tx) n.textContent = tx; s.appendChild(n); }
    add('line', { x1: 20, y1: 100, x2: 680, y2: 100, stroke: '#0D2149', 'stroke-width': 3 });
    for (var c = 0; c <= L; c += 10) { add('line', { x1: X(c), y1: 100, x2: X(c), y2: 108, stroke: '#0D2149' }); add('text', { x: X(c), y: 128, 'text-anchor': 'middle', 'font-size': 13, fill: '#51607A' }, c); }
    if (b.objet !== null) add('line', { x1: X(b.objet), y1: 100, x2: X(b.objet), y2: 50, stroke: '#FF8A1F', 'stroke-width': 5 });
    if (b.lentille !== null) add('ellipse', { cx: X(b.lentille), cy: 70, rx: 9, ry: 40, fill: '#DCEBFA', stroke: '#1A73D1', 'stroke-width': 2 });
    if (b.ecran !== null) add('line', { x1: X(b.ecran), y1: 35, x2: X(b.ecran), y2: 100, stroke: b.nette ? '#2FA84F' : '#51607A', 'stroke-width': 6 });
    return s;
  }
  function papier() {
    var p = vue.papier, s = svg('svg', 600, 150);
    function add(t, a) { var n = document.createElementNS('http://www.w3.org/2000/svg', t); for (var k in a) n.setAttribute(k, a[k]); s.appendChild(n); }
    add('rect', { x: 60, y: 40, width: 480, height: 70, fill: '#F6EFC8', stroke: '#B8A95A' });
    [[p.electrodeA, 56, '#D6342C'], [p.electrodeB, 56, '#1A73D1']].forEach(function (e, i) { if (!e[0]) return; add('rect', { x: e[0] === 'gauche' ? 56 : 540, y: 32, width: 8, height: 86, fill: i ? '#1A73D1' : '#D6342C' }); });
    if (p.cuivreDepose) add('circle', { cx: 300 + p.positionCuivre * 220, cy: 65, r: 14, fill: '#1A73D1', 'fill-opacity': .8 });
    if (p.permanganateDepose) add('circle', { cx: 300 + p.positionPermanganate * 220, cy: 87, r: 14, fill: '#6A4FD0', 'fill-opacity': .8 });
    return s;
  }
  function carteApp(titre, noeud, pleine) { return el('div', { 'class': 'appareil' + (pleine ? ' plein' : '') }, [el('b', { texte: titre }), noeud]); }
  function instruments() {
    var z = vide($('#appareils')), g = el('div', { 'class': 'appareils' }); lives = lives; var any = false;
    var ap = vue.appareils || {};
    Object.keys(ap).forEach(function (id) {
      var a = ap[id], u = /^amperemetre/.test(id) ? 'A' : /^voltmetre/.test(id) ? 'V' : (labId === 'mesure_intensite' || labId === 'lois_courant' ? 'A' : 'V');
      var c = a.aiguilleDiv !== null && a.aiguilleDiv !== undefined ? el('div', {}, [gauge(a.aiguilleDiv), el('small', { texte: fmt(a.aiguilleDiv, 1) + ' div / 100' + (a.horsEchelle ? ' · hors échelle' : '') + (a.sensInverse ? ' · à l\'envers' : '') })]) : el('div', { 'class': 'lcd', texte: fmt(a.affichage, 3) + ' ' + u });
      g.appendChild(carteApp(nom(id) + ' · ' + joli(empl(a.emplacement || '')), c)); any = true;
    });
    if (vue.ecran) { var cv = el('canvas', { width: 400, height: 280 }); oscillo(cv, vue.ecran); g.appendChild(carteApp('Écran de l\'oscilloscope', cv, true)); any = true; }
    if (vue.banc && (vue.banc.objet !== null || vue.banc.lentille !== null)) { var b = vue.banc; g.appendChild(carteApp('Banc d\'optique' + (b.nette ? ' · image nette' : ''), banc(), true)); any = true; }
    if (vue.papier) {
      if (vue.papier.aiguilleDiv !== null && vue.papier.aiguilleDiv !== undefined) g.appendChild(carteApp('Ampèremètre', gauge(vue.papier.aiguilleDiv)));
      if (has('papier_filtre')) { g.appendChild(carteApp('Papier-filtre · ' + fmt(vue.papier.courantA * 1000, 1) + ' mA', papier(), true)); any = true; }
    }
    if (vue.bocal && vue.bocal.terre) { var bo = vue.bocal; g.appendChild(carteApp('Dépôts dans le bocal', el('div', { 'class': 'petit', texte: 'Sable ' + fmt(bo.sable, 1) + ' · limon ' + fmt(bo.limon, 1) + ' · argile ' + fmt(bo.argile, 1) }), true)); any = true; }
    if (any || g.firstChild) z.appendChild(g);
  }

  // ------------------------------------------------------------ rendu
  function flottants() {
    var f = vide($('#flottants')), d = vue.dosage, r = vue.reglages;
    function chip(t, v) { f.appendChild(el('div', { 'class': 'flot' }, [document.createTextNode(t), el('b', { texte: v })])); }
    if (d) { chip('Volume versé', fmt(d.volumeMl, 2) + ' mL'); if (d.ph !== null) chip('pH actuel', fmt(d.ph, 1) + (d.ph < 6.9 ? ' Acide' : d.ph > 7.1 ? ' Basique' : ' Neutre')); }
    else if (vue.banc && vue.banc.nette) chip('Image', 'nette');
    else if (ELEC.indexOf(labId) >= 0 && has('interrupteur_k')) chip('Interrupteur K', r.interrupteur_ferme ? 'fermé' : 'ouvert');
  }
  function badge() {
    var d = vue.dosage, r = vue.reglages, t = '';
    if (d) t = d.debit === 'ferme' ? 'Robinet fermé' : d.debit === 'jet' ? 'Jet rapide' : 'Goutte à goutte';
    else if (has('interrupteur_k')) t = r.interrupteur_ferme ? 'K fermé' : 'K ouvert';
    else if (TEMPS[labId]) t = fmt(vue.tempsS / 60, 0) + ' min';
    else if (vue.banc) t = vue.banc.nette ? 'Image nette' : 'Image floue';
    else if (vue.ecran) t = String(r.couplage || 'gnd').toUpperCase();
    $('#badge').textContent = t; $('#badge').hidden = !t;
  }
  function pastillesMateriel() {
    var sig = JSON.stringify(vue.materiel); if (sig === sigMat) return; sigMat = sig;
    var z = vide($('#materiel'));
    meta.materiel.filter(function (m) { return !/^cristal_/.test(m); }).forEach(function (m) {
      var on = has(m), e = vue.materiel[m], n = nom(m);
      var b = el('button', { type: 'button', 'class': 'pastille' + (on ? ' on' : ''), on: { click: function () { if (on) lacher(m); else placer(m); } } }, [document.createTextNode(n)]);
      if (on && e && (meta.emplacements[m] || []).length) b.appendChild(el('small', { texte: joli(empl(e)) }));
      z.appendChild(b);
    });
  }
  function conseil() {
    var c = vue.conseils.length ? vue.conseils[vue.conseils.length - 1] : null, a = $('.assistant');
    a.className = 'assistant' + (c && c.niveau === 'avertissement' ? ' avert' : '');
    $('#conseil').textContent = c ? c.message : (has('alimentation') || Object.keys(vue.materiel).length ? (gestes ? 'Touche ou fais glisser les repères bleus sur le matériel pour régler.' : 'Continue : règle, branche, observe la scène.') : 'Sélectionne du matériel pour commencer.');
  }
  function notes() {
    if (!$('#notes').open && notesGrandeur) return;
    var z = $('#notes-corps'); if (z.firstChild && z.dataset.l === labId) return; z.dataset.l = labId; vide(z);
    var sel = el('select', {}, meta.grandeurs.map(function (g) { return el('option', { value: g, texte: joli(g.replace(/_(v|a|cm|ma|hz|s|div|min)$/, '')) }); }));
    var val = el('input', { type: 'text', inputmode: 'decimal', placeholder: 'Valeur (point décimal)' }), un = el('input', { type: 'text', placeholder: 'Unité' }), res = el('p', { 'class': 'petit' });
    function unite() { var m = /_(v|a|cm|ma|hz|s|div|min)$/.exec(sel.value); un.value = m ? { v: 'V', a: 'A', cm: 'cm', ma: 'mA', hz: 'Hz', s: 's', div: 'div', min: 'min' }[m[1]] : (/pourcentage/.test(sel.value) ? '%' : ''); }
    sel.addEventListener('change', unite); unite(); notesGrandeur = sel;
    z.appendChild(el('div', { 'class': 'ligne' }, [sel])); z.appendChild(el('div', { 'class': 'ligne' }, [val])); z.appendChild(el('div', { 'class': 'ligne' }, [un]));
    z.appendChild(el('div', { 'class': 'ligne' }, [el('div', { id: 'liste-notes' })]));
    z.appendChild(el('div', { 'class': 'ligne' }, [btn('Noter', false, function () {
      var x = val.value.trim(); var v = sel.value.indexOf('electrode_') === 0 ? x : parseFloat(x.replace(',', '.'));
      faire('mesurer', { grandeur_id: sel.value, valeur: v, unite: un.value }); res.textContent = 'Noté : ' + x + ' ' + un.value; val.value = '';
    })])); z.appendChild(res);
  }
  function majNotes() {
    var z = $('#liste-notes'); if (!z) return; vide(z);
    if (!vue.mesures.length) return;
    var tb = el('tbody'); vue.mesures.forEach(function (m) { tb.appendChild(el('tr', {}, [el('td', { texte: joli(String(m.grandeur).replace(/_(v|a|cm|ma|hz|s|div|min)$/, '')) }), el('td', { texte: String(m.saisie).replace('.', ',') + ' ' + (m.unite || '') })])); });
    z.appendChild(el('table', {}, [tb]));
  }
  function rendre() {
    if (dosage) { vide($('#flottants')); return; }
    var a = $('#alerte');
    if (alerte) { vide(a); a.appendChild(el('b', { texte: 'Sécurité · action bloquée' })); a.appendChild(el('div', { texte: alerte })); a.hidden = false; } else a.hidden = true;
    if (elec) { elec.maj(); return; }
    if (osc) { osc.maj(); return; }
    if (lab3) { lab3.maj(); return; }
    pastillesMateriel();
    if (banc) { banc.sync(vue.materiel); $('#badge').hidden = true; vide($('#flottants')); return; }
    badge(); flottants(); conseil(); notes(); majNotes();
    var d = vue.dosage, sig = JSON.stringify([vue.materiel, vue.reglages.interrupteur_ferme, vue.reglages.debit, vue.termine, d && [d.debit, d.volumeAcideMl > 0],
      vue.tubes && Object.keys(vue.tubes).map(function (t) { return vue.tubes[t].tranches; }), vue.papier && [vue.papier.cuivreDepose, vue.papier.permanganateDepose], vue.bocal && vue.bocal.terre,
      Object.keys(vue.reglages).filter(function (k) { return k.indexOf('calibre_') === 0 || k.indexOf('inverse_') === 0 || k.indexOf('masse_') === 0 || k === 'couplage' || k === 'sensibilite_v_par_div' || k === 'base_temps_s_par_div'; }).map(function (k) { return vue.reglages[k]; })]);
    if (!glisse && sig !== sigCmd) { sigCmd = sig; commandes(); } else lives.forEach(function (f) { f(); });
    if (!glisse) instruments();
    if (L3 && L3.supports(labId)) L3.update(vue);
    if (gestes) gestes.maj();
    $('#mini').hidden = !(d && $('#scene').classList.contains('zoom'));
    if (d && $('#scene').classList.contains('zoom')) { var m = vide($('#mini')); m.appendChild(robinet()); }
    $('#terminer').disabled = false;
    if (labId === 'titrage_acide_base') boucleDosage();
  }

  // ------------------------------------------------------------ bilan
  function bilanBanc() {
    var r = banc.bilan(), z = vide($('#bilan-corps')); statut[labId] = 'fini'; z.appendChild(r.noeud); $('#bilan').hidden = false;
    terminerCoteParent({ resultat: { erreurs: r.erreurs || [] } });
  }
  function bilan() {
    if (dosage) {
      var rr = dosage.bilan(), zz = vide($('#bilan-corps'));
      statut[labId] = 'fini'; zz.appendChild(rr.noeud); $('#bilan').hidden = false;
      terminerCoteParent({
        score: rr.score,
        resultat: {
          score_manipulation: rr.score,
          erreurs: rr.erreurs || [],
          volume_lu_ml: dosage.etat.cahier.lu || null,
          concentration_calculee_mol_l: dosage.etat.cahier.ca || null,
          volume_verse_ml: dosage.etat.fl.vB
        }
      });
      return;
    }
    if (banc) return bilanBanc();
    if (!vue.termine) faire('terminer'); arreter();
    var er = vue.erreurs, z = vide($('#bilan-corps')); statut[labId] = 'fini';
    z.appendChild(el('div', { 'class': 'score' }, [el('b', { texte: String(er.length) }), el('div', {}, [el('b', { texte: 'Erreurs de manipulation signalées' }), el('div', { 'class': 'petit', texte: 'Valeurs et explications ci-dessous.' })])]));
    er.forEach(function (c) { var it = el('div', { 'class': 'item err' }, [el('b', { texte: (window.ElectriciteSpec && ElectriciteSpec.TITRE[c]) || (window.OscilloSpec && OscilloSpec.TITRE[c]) || (window.Labos3Spec && Labos3Spec.TITRE[c]) || ERREURS[c] || joli(c) })]); var cz = (window.ElectriciteSpec && ElectriciteSpec.CAUSES[c]) || (window.OscilloSpec && OscilloSpec.CAUSES[c]) || (window.Labos3Spec && Labos3Spec.CAUSES[c]); if (cz) it.appendChild(el('div', { 'class': 'petit', texte: cz })); z.appendChild(it); });
    if (!er.length) z.appendChild(el('p', { 'class': 'petit', texte: 'Aucune erreur de manipulation signalée.' }));
    var res = Object.keys(vue.resultat);
    if (res.length) { var tb = el('tbody'); res.forEach(function (k) { var v = vue.resultat[k]; tb.appendChild(el('tr', {}, [el('td', { texte: joli(k) }), el('td', { texte: typeof v === 'number' ? fmt(v, 4) : String(v) })])); }); z.appendChild(el('h3', { texte: 'Résultat' })); z.appendChild(el('table', {}, [tb])); }
    $('#bilan').hidden = false; terminerCoteParent();
  }

  // ------------------------------------------------------------ accueil
  var filtre = 'toutes';
  function liste() {
    var q = $('#recherche').value.toLowerCase(), z = vide($('#cartes'));
    Object.keys(TITRES).forEach(function (id) {
      var d = DEFINITIONS[id]; if (filtre !== 'toutes' && d.matiere !== filtre) return; if (q && TITRES[id][0].toLowerCase().indexOf(q) < 0) return;
      var s = statut[id], tag = s === 'fini' ? ['Terminé', 'fini'] : s === 'cours' ? ['En cours', 'cours'] : ['À commencer', ''];
      z.appendChild(el('button', { type: 'button', 'class': 'carte-exp', on: { click: function () { charger(id); } } }, [
        el('div', { 'class': 'ico ' + d.matiere, texte: ICONES[d.matiere] }),
        el('div', {}, [el('b', { texte: TITRES[id][0] }), el('small', { texte: MATIERES[d.matiere] + ' · ' + TITRES[id][1] }), el('div', {}, [el('span', { 'class': 'tag ' + tag[1], texte: tag[0] })])])]));
    });
  }
  function accueil() { arreter(); if (lab3) { lab3.detruire(); lab3 = null; } if (osc) { osc.detruire(); osc = null; } if (elec) { elec.detruire(); elec = null; } if (dosage) { dosage.detruire(); dosage = null; } if (banc) { banc.detruire(); banc = null; } if (gestes) { gestes.detruire(); gestes = null; vide($('#vues')); } $('#labo').hidden = true; $('#liste').hidden = false; $('#scene').classList.remove('zoom'); history.replaceState(null, '', location.pathname); liste(); }

  function init() {
    window.EduLabDraw = { oscillo: function (cv, e, o) { var m = meta; meta = { options: o }; try { oscillo(cv, e); } finally { meta = m; } } };
    if (window.Lab3D && Lab3D.disponible()) { L3 = Lab3D.mount($('#vue3d')); var sc = L3.three.scene; sc.background.set(0xffffff); sc.children.forEach(function (o) { if (o.geometry && o.geometry.type === 'PlaneGeometry' && o.material && o.material.color) o.visible = false; }); } else $('#scene').hidden = true;
    [['toutes', 'Toutes']].concat(Object.keys(MATIERES).map(function (k) { return [k, MATIERES[k]]; })).forEach(function (f) {
      var b = el('button', { type: 'button', 'class': 'pastille' + (f[0] === filtre ? ' sel' : ''), texte: f[1], on: { click: function () { filtre = f[0]; Array.prototype.forEach.call(b.parentNode.children, function (c) { c.classList.remove('sel'); }); b.classList.add('sel'); liste(); } } });
      $('#filtres').appendChild(b);
    });
    $('#recherche').addEventListener('input', liste); $('#retour').addEventListener('click', accueil);
    $('#refaire').addEventListener('click', function () { charger(labId); }); $('#bilan-refaire').addEventListener('click', function () { $('#bilan').hidden = true; charger(labId); });
    $('#terminer').addEventListener('click', bilan); $('#bilan-ok').addEventListener('click', function () { $('#bilan').hidden = true; });
    $('#feuille-ok').addEventListener('click', function () { $('#feuille').hidden = true; });
    $('#agrandir').addEventListener('click', function () { var s = $('#scene'); s.classList.toggle('zoom'); $('#agrandir').textContent = s.classList.contains('zoom') ? 'Fermer' : 'Plein écran'; setTimeout(function () { if (L3) L3.resize(); }, 30); rendre(); });
    var h = decodeURIComponent((location.hash || '').replace(/^#\/?/, '')); liste(); if (TITRES[h]) charger(h);
    window.addEventListener('hashchange', function () { var i = decodeURIComponent((location.hash || '').replace(/^#\/?/, '')); if (TITRES[i] && i !== labId) charger(i); });
  }
  window.EduLabDemo = { lab3: function () { return lab3; }, elec: function () { return elec; }, dosage: function () { return dosage; }, banc: function () { return banc && banc.modele; }, l3: function () { return L3; }, charger: charger, faire: faire, avancer: avancer, vue: function () { return vue; }, journal: function () { return journal; } };
  init();
}());
