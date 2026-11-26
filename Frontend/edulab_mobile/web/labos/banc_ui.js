// Panneau du banc d'optique : source, vues, méthodes, tableaux saisis par l'élève, bilan neutre.
(function () {
  'use strict';
  var B = window.BancInteractif, M = window.BancModele, fr = B.fr;
  var MAP = { banc_optique: 'banc', reglet: 'regle', source_lumineuse: 'source', objet_lumineux: 'objet', lentille_convergente: 'lentille', miroir_plan: 'miroir', ecran: 'ecran' };
  function el(t, a, k) { var n = document.createElement(t); Object.keys(a || {}).forEach(function (x) { if (x === 'texte') n.textContent = a[x]; else if (x === 'on') Object.keys(a.on).forEach(function (e) { n.addEventListener(e, a.on[e]); }); else n.setAttribute(x, a[x]); }); (k || []).forEach(function (c) { n.appendChild(c); }); return n; }
  function num(s) { var v = parseFloat(String(s).replace(',', '.')); return isNaN(v) ? null : v; }

  function monter(L3, ctx) {
    var scene = ctx.scene, tags = ctx.tags, host = ctx.hote, z = ctx.zone, erreurs = [], journal = [], vals = {}, pas = {};
    var banc = B.creer(L3, host, {
      assistant: function (a) { ctx.assistant(a.texte); if (btnIndice) btnIndice.hidden = !a.plus; },
      deplace: function (k, cm) { ctx.deplace(k, cm); }, tags: tags
    });
    var seg1, btnLum, btnIndice, tableau = el('div'), consigne = el('p', { 'class': 'petit' }), graphe = el('canvas', { width: 340, height: 200, 'class': 'graphe' }), sortie = el('div');
    function signaler(code) { if (erreurs.indexOf(code) < 0) erreurs.push(code); }
    function bouton(txt, clic, cls) { return el('button', { type: 'button', 'class': 'btn' + (cls ? ' ' + cls : ''), texte: txt, on: { click: clic } }); }
    function seg(opts, courant, choisir) { var d = el('div', { 'class': 'seg' }); opts.forEach(function (o, i) { d.appendChild(el('button', { type: 'button', 'class': i === courant ? 'on' : '', texte: o, on: { click: function () { choisir(i); Array.prototype.forEach.call(d.children, function (c, j) { c.className = j === i ? 'on' : ''; }); } } })); }); return d; }

    btnLum = bouton('Allumer la source', function () { var s = !banc.etat.allume; banc.allumer(s); btnLum.textContent = s ? 'Éteindre la source' : 'Allumer la source'; btnLum.className = 'btn' + (s ? ' on' : ''); ctx.evenement('allumer_source', { allume: s }); });
    btnIndice = bouton('Indice suivant', function () { banc.indice(); }); btnIndice.hidden = true;
    var vues = seg(['Ensemble', 'Écran', 'Règle'], 0, function (i) { banc.vue(['ensemble', 'ecran', 'regle'][i]); });
    var tabs = seg(B.METHODES.map(function (m) { return m.nom; }), 0, function (i) { banc.methode(i); tableauPour(i); });
    [el('div', { 'class': 'ligne' }, [btnLum]), el('div', { 'class': 'ligne' }, [el('label', {}, [el('span', { texte: 'Caméra' })]), vues]), el('div', { 'class': 'ligne' }, [btnIndice]),
      el('h2', { 'class': 'etiq', texte: 'Tableau de mesures' }), el('div', { 'class': 'ligne' }, [tabs]), consigne, tableau, sortie].forEach(function (n) { z.appendChild(n); });

    function verifier(m, c, v) {
      var col = m.cols[c][0], img = banc.etat.image, nette = !!(img && img.nette);
      if (/^(A|O|L1|L2|OA')$/.test(col) && !nette) signaler('image_non_nette');
      if (m.id === 'descartes' && col === 'OA' && v > 0) signaler('signe_distance_algebrique');
      if (m.id === 'bessel' && col === 'D' && M.positionsBessel(v) === null) signaler('distance_objet_ecran_trop_petite');
    }
    function tableauPour(i) {
      var m = B.METHODES[i]; consigne.textContent = m.consigne; tableau.textContent = '';
      var t = el('table', { 'class': 'bt' }), tete = el('tr', {}, [el('th', { texte: 'N°' })].concat(m.cols.map(function (c) { return el('th', { texte: c[0] + ' (' + c[1] + ')' }); }))); t.appendChild(el('thead', {}, [tete]));
      var tb = el('tbody');
      for (var r = 0; r < m.n; r++) (function (r) {
        var tr = el('tr', {}, [el('td', { texte: String(r + 1) })]);
        m.cols.forEach(function (c, ci) {
          var cle = m.id + ':' + r + ':' + ci, inp = el('input', { type: 'text', inputmode: 'decimal', 'aria-label': c[0] + ' essai ' + (r + 1) }); inp.value = vals[cle] || '';
          inp.addEventListener('change', function () {
            vals[cle] = inp.value; var v = num(inp.value); if (v === null) { graphique(m); return; }
            verifier(m, ci, v); ctx.mesure(c[2] || ('calcul_' + c[0]), v, c[1]); graphique(m);
          }); tr.appendChild(el('td', {}, [inp]));
        }); tb.appendChild(tr);
      }(r));
      t.appendChild(tb); tableau.appendChild(el('div', { 'class': 'defile-x' }, [t]));
      tableau.appendChild(el('div', { 'class': 'ligne' }, [el('label', {}, [el('span', { texte: 'f\' moyenne calculée (cm)' })]), (function () { var k = m.id + ':moy', inp = el('input', { type: 'text', inputmode: 'decimal' }); inp.value = vals[k] || ''; inp.addEventListener('change', function () { vals[k] = inp.value; }); return inp; }())]));
      if (m.id === 'descartes') { tableau.appendChild(el('p', { 'class': 'petit', texte: 'Graphe 1/OA\' en fonction de 1/OA (tes valeurs notées)' })); tableau.appendChild(graphe); graphique(m); }
    }
    function graphique(m) {
      if (m.id !== 'descartes') return; var c = graphe.getContext('2d'), W = graphe.width, H = graphe.height, pts = [];
      for (var r = 0; r < m.n; r++) { var a = num(vals[m.id + ':' + r + ':2']), b = num(vals[m.id + ':' + r + ':3']); if (a !== null && b !== null) pts.push([a, b]); }
      c.clearRect(0, 0, W, H); c.fillStyle = '#fff'; c.fillRect(0, 0, W, H); c.strokeStyle = '#DDE6E9'; c.fillStyle = '#51607A'; c.font = '10px system-ui';
      var xs = pts.map(function (p) { return p[0]; }).concat([0]), ys = pts.map(function (p) { return p[1]; }).concat([0]), x0 = Math.min.apply(null, xs), x1 = Math.max.apply(null, xs.concat([0.001])), y0 = Math.min.apply(null, ys), y1 = Math.max.apply(null, ys.concat([0.001]));
      var px = function (x) { return 34 + (x - x0) / ((x1 - x0) || 1) * (W - 48); }, py = function (y) { return H - 24 - (y - y0) / ((y1 - y0) || 1) * (H - 40); };
      c.beginPath(); c.moveTo(px(x0), py(0)); c.lineTo(px(x1), py(0)); c.moveTo(px(0), py(y0)); c.lineTo(px(0), py(y1)); c.stroke();
      c.fillText(fr(x0, 3), 4, H - 8); c.fillText(fr(x1, 3), W - 40, H - 8); c.fillText(fr(y1, 3), 2, 12);
      c.fillStyle = '#0E4D5C'; pts.forEach(function (p) { c.beginPath(); c.arc(px(p[0]), py(p[1]), 4, 0, 6.3); c.fill(); });
    }
    tableauPour(0);

    return {
      sync: function (materiel) { Object.keys(MAP).forEach(function (k) { banc.placer(MAP[k], Object.prototype.hasOwnProperty.call(materiel, k)); }); btnLum.disabled = !Object.prototype.hasOwnProperty.call(materiel, 'source_lumineuse'); },
      bilan: function () {
        var d = el('div'), moy = [];
        d.appendChild(el('h3', { texte: 'Bilan de la séance' }));
        B.METHODES.forEach(function (m) { var v = num(vals[m.id + ':moy'] || ''), ec = v === null ? null : Math.abs(v - M.P.fPrimeCm) / M.P.fPrimeCm * 100;
          moy.push(el('tr', {}, [el('td', { texte: m.nom }), el('td', { texte: v === null ? 'non renseignée' : fr(v, 2) + ' cm (écart ' + fr(ec, 1) + ' %)' })])); });
        d.appendChild(el('table', {}, [el('tbody', {}, moy)])); d.appendChild(el('p', { 'class': 'petit', texte: 'Écart relatif calculé par rapport à la valeur de référence, à partir de tes propres valeurs.' }));
        d.appendChild(el('h3', { texte: 'Erreurs de manipulation' }));
        if (!erreurs.length) d.appendChild(el('p', { 'class': 'petit', texte: 'Aucune erreur de manipulation signalée par la simulation.' }));
        erreurs.forEach(function (c) { d.appendChild(el('div', { 'class': 'item err' }, [el('b', { texte: B.TITRE_ERR[c] }), el('div', { 'class': 'petit', texte: B.CAUSES[c] })])); });
        var n = 0; Object.keys(vals).forEach(function (k) { if (vals[k] !== '' && !/:moy$/.test(k)) n++; });
        d.appendChild(el('p', { 'class': 'petit', texte: 'Cases remplies : ' + n + ' · Erreurs signalées : ' + erreurs.length }));
        return { noeud: d, erreurs: erreurs.slice() };
      },
      detruire: function () { banc.detruire(); z.textContent = ''; if (tags) tags.textContent = ''; },
      modele: banc
    };
  }
  window.BancUI = { monter: monter };
}());
