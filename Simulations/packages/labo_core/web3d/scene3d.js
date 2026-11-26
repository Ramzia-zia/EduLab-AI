// Vue 3D des labos : dessine l'état renvoyé par labo_core (aucun calcul de physique ici).
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

const M = (o) => new THREE.MeshStandardMaterial(o);
function canvasTex(w, h, draw, repeat) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat[0], repeat[1]); }
  return t;
}
function woodTex() {
  return canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = '#b98a58'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 260; i++) { g.strokeStyle = 'rgba(' + (90 + Math.random() * 40) + ',60,30,' + (0.05 + Math.random() * 0.12) + ')'; g.lineWidth = 1 + Math.random() * 2; const y = Math.random() * h; g.beginPath(); g.moveTo(0, y); g.bezierCurveTo(w * .3, y + Math.random() * 8 - 4, w * .7, y + Math.random() * 8 - 4, w, y); g.stroke(); }
  }, [3, 1.2]);
}
function box(w, h, d, mat, shadow = true, r = 0) {
  const m = new THREE.Mesh(r ? new RoundedBoxGeometry(w, h, d, 4, r) : new THREE.BoxGeometry(w, h, d), mat);
  m.castShadow = shadow; m.receiveShadow = true; return m;
}
function label(txt, w = 0.12, h = 0.03, bg = '#0D2149', fg = '#fff') {
  const t = canvasTex(256, Math.round(256 * h / w), (g, W, H) => { g.fillStyle = bg; g.fillRect(0, 0, W, H); g.fillStyle = fg; g.font = 'bold ' + Math.round(H * .55) + 'px system-ui,sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, W / 2, H / 2); });
  return new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: t, toneMapped: false }));
}

// ---------------------------------------------------------------- banc d'optique
function banc(options) {
  const g = new THREE.Group(), L = options.longueur_banc_cm, X = (cm) => (cm / L - 0.5) * 1.0;
  const alu = M({ color: 0xc9ced4, metalness: 0.9, roughness: 0.32 });
  const rail = box(1.06, 0.028, 0.05, alu); rail.position.y = 0.014; g.add(rail);
  const ruler = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.018), new THREE.MeshBasicMaterial({ map: canvasTex(2048, 36, (c, w, h) => { c.fillStyle = '#f3f3ee'; c.fillRect(0, 0, w, h); c.fillStyle = '#111'; c.font = '16px system-ui'; for (let i = 0; i <= 100; i++) { const x = i * (w / 100); c.fillRect(x, 0, 1.5, i % 10 === 0 ? 14 : (i % 5 === 0 ? 10 : 6)); if (i % 10 === 0) c.fillText(i, x + 3, 30); } }) }));
  ruler.rotation.x = -Math.PI / 2; ruler.position.set(0, 0.0292, 0.012); g.add(ruler);
  const dark = M({ color: 0x23272e, roughness: 0.5, metalness: 0.4 });
  function chariot(parent, h) { const c = box(0.07, 0.022, 0.07, dark, true, 0.004); c.position.y = 0.039; parent.add(c); const p = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, h, 16), alu); p.position.y = 0.05 + h / 2; p.castShadow = true; parent.add(p); }
  const objet = new THREE.Group(); chariot(objet, 0.09);
  const lampe = box(0.05, 0.08, 0.07, dark, true, 0.006); lampe.position.set(-0.03, 0.17, 0); objet.add(lampe);
  const fleche = new THREE.Shape(); fleche.moveTo(0, 0); fleche.lineTo(0.012, 0.02); fleche.lineTo(0.004, 0.02); fleche.lineTo(0.004, 0.07); fleche.lineTo(-0.004, 0.07); fleche.lineTo(-0.004, 0.02); fleche.lineTo(-0.012, 0.02); fleche.closePath();
  const fm = new THREE.Mesh(new THREE.ShapeGeometry(fleche), new THREE.MeshBasicMaterial({ color: 0xff8a1f, side: THREE.DoubleSide, toneMapped: false }));
  fm.rotation.y = Math.PI / 2; fm.position.set(0.0, 0.13, 0); objet.add(fm);
  const lum = new THREE.PointLight(0xfff1d6, 0.6, 0.6, 2); lum.position.set(0.03, 0.17, 0); objet.add(lum);
  const lentille = new THREE.Group(); chariot(lentille, 0.09);
  const verre = new THREE.Mesh(new THREE.SphereGeometry(0.075, 64, 32), new THREE.MeshPhysicalMaterial({ color: 0xffffff, transmission: 1, thickness: 0.03, ior: 1.5, roughness: 0.02, transparent: true, envMapIntensity: 3, specularIntensity: 1, attenuationColor: 0xbfe6ff, attenuationDistance: 0.6, clearcoat: 1 }));
  verre.scale.set(0.16, 1, 1); verre.position.y = 0.16; lentille.add(verre);
  const bague = new THREE.Mesh(new THREE.TorusGeometry(0.077, 0.006, 16, 64), dark); bague.rotation.y = Math.PI / 2; bague.position.y = 0.16; bague.castShadow = true; lentille.add(bague);
  const miroir = box(0.004, 0.11, 0.11, M({ color: 0xffffff, metalness: 1, roughness: 0.04 })); miroir.position.set(0.02, 0.16, 0); lentille.add(miroir);
  const ecran = new THREE.Group(); chariot(ecran, 0.09);
  const toile = box(0.008, 0.16, 0.16, M({ color: 0xf6f6f2, roughness: 0.9 })); toile.position.y = 0.16; ecran.add(toile);
  const imgNette = new THREE.Mesh(new THREE.ShapeGeometry(fleche), new THREE.MeshBasicMaterial({ color: 0xff8a1f, side: THREE.DoubleSide, toneMapped: false }));
  imgNette.rotation.y = -Math.PI / 2; imgNette.position.set(-0.006, 0.16, 0); imgNette.scale.set(1.3, -1.3, 1); ecran.add(imgNette);
  const flou = new THREE.Mesh(new THREE.CircleGeometry(0.06, 40), new THREE.MeshBasicMaterial({ color: 0xff8a1f, transparent: true, opacity: 0.16, toneMapped: false }));
  flou.rotation.y = -Math.PI / 2; flou.position.set(-0.006, 0.16, 0); ecran.add(flou);
  g.add(objet, lentille, ecran);
  return { group: g, update(v) {
    const b = v.banc;
    objet.visible = b.objet !== null; if (b.objet !== null) objet.position.x = X(b.objet);
    lentille.visible = b.lentille !== null; if (b.lentille !== null) lentille.position.x = X(b.lentille);
    miroir.visible = b.miroir;
    ecran.visible = b.ecran !== null; if (b.ecran !== null) ecran.position.x = X(b.ecran);
    const image = b.nette && !b.miroir;
    imgNette.visible = image; flou.visible = !b.nette && !b.miroir;
  }, camera: { pos: [0.05, 0.34, 0.8], target: [0, 0.1, 0] } };
}

// ---------------------------------------------------------------- oscilloscope
function oscillo(options) {
  const g = new THREE.Group(); const sc = new THREE.Group(); sc.position.x = -0.1; g.add(sc);
  const corps = M({ color: 0x3a4048, roughness: 0.45, metalness: 0.35 });
  const body = box(0.46, 0.22, 0.34, corps, true, 0.012); body.position.y = 0.11 + 0.012; sc.add(body);
  const cv = document.createElement('canvas'); cv.width = 400; cv.height = 320;
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  const verre = new THREE.Mesh(new THREE.PlaneGeometry(0.24, 0.192), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }));
  verre.position.set(-0.07, 0.125, 0.1755); sc.add(verre);
  const cadre = box(0.26, 0.21, 0.004, M({ color: 0x111418, roughness: 0.3 })); cadre.position.set(-0.07, 0.125, 0.171); sc.add(cadre);
  const boutons = [];
  [[0.12, 0.17], [0.12, 0.115], [0.12, 0.06], [0.185, 0.17], [0.185, 0.115], [0.185, 0.06]].forEach((p, i) => {
    const k = new THREE.Mesh(new THREE.CylinderGeometry(0.017, 0.019, 0.022, 32), M({ color: i % 2 ? 0x9aa3ad : 0x20252b, roughness: 0.3, metalness: 0.8 }));
    k.rotation.x = Math.PI / 2; k.position.set(p[0], p[1], 0.183); k.castShadow = true; sc.add(k); boutons.push(k);
    const repere = box(0.003, 0.014, 0.003, M({ color: 0xffffff }), false); repere.position.set(0, 0.011, 0); k.add(repere);
  });
  [[0.12, 0.012], [0.16, 0.012], [0.2, 0.012]].forEach((p) => { const bnc = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.018, 24), M({ color: 0xd9dde2, metalness: 1, roughness: 0.25 })); bnc.rotation.x = Math.PI / 2; bnc.position.set(p[0], p[1] + 0.02, 0.18); sc.add(bnc); });
  for (const x of [-0.19, 0.19]) { const pied = box(0.04, 0.012, 0.05, M({ color: 0x15181c, roughness: 0.8 })); pied.position.set(x, 0.006, 0.1); sc.add(pied); const p2 = pied.clone(); p2.position.z = -0.1; sc.add(p2); }
  const gbf = box(0.3, 0.09, 0.22, M({ color: 0x0e4d5c, roughness: 0.5, metalness: 0.2 }), true, 0.01); gbf.position.set(0.33, 0.045, 0.06); g.add(gbf);
  const gl = label('GBF', 0.08, 0.025); gl.position.set(0.33, 0.06, 0.1715); g.add(gl);
  const ali = box(0.2, 0.1, 0.2, M({ color: 0x2b3340, roughness: 0.55, metalness: 0.3 }), true, 0.01); ali.position.set(0.62, 0.05, 0.06); g.add(ali);
  const al = label('ALIM', 0.08, 0.025); al.position.set(0.62, 0.07, 0.1615); g.add(al);
  const sIdx = (list, v) => Math.max(0, list.findIndex((x) => Math.abs(x - v) < 1e-12)) / Math.max(1, list.length - 1);
  return { group: g, update(v) {
    window.EduLabDraw.oscillo(cv, v.ecran, options); tex.needsUpdate = true;
    boutons[0].rotation.y = -1.2 + 2.4 * sIdx(options.sensibilites, v.reglages.sensibilite_v_par_div);
    boutons[3].rotation.y = -1.2 + 2.4 * sIdx(options.bases_temps, v.reglages.base_temps_s_par_div);
    gbf.material.emissive = new THREE.Color(v.materiel.gbf ? 0x052a33 : 0x000000);
  }, camera: { pos: [0.3, 0.5, 1.05], target: [0.2, 0.09, 0.0] } };
}

// ---------------------------------------------------------------- migration des ions
function migration(options) {
  const g = new THREE.Group();
  const verre = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.004, 0.2), new THREE.MeshPhysicalMaterial({ color: 0xffffff, transmission: 0.9, roughness: 0.05, thickness: 0.004, ior: 1.5, transparent: true }));
  verre.position.y = 0.002; verre.receiveShadow = true; g.add(verre);
  const papierTex = canvasTex(512, 256, (c, w, h) => { c.fillStyle = '#f2ecd3'; c.fillRect(0, 0, w, h); for (let i = 0; i < 4000; i++) { c.fillStyle = 'rgba(160,140,90,' + Math.random() * 0.08 + ')'; c.fillRect(Math.random() * w, Math.random() * h, 2, 1); } });
  const papier = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.0024, 0.1), M({ map: papierTex, roughness: 0.35, metalness: 0 }));
  papier.position.y = 0.0052; papier.receiveShadow = true; g.add(papier);
  const spotTex = (col) => canvasTex(128, 128, (c, w, h) => { const gr = c.createRadialGradient(w / 2, h / 2, 2, w / 2, h / 2, w / 2); gr.addColorStop(0, col + 'ff'); gr.addColorStop(0.55, col + '99'); gr.addColorStop(1, col + '00'); c.fillStyle = gr; c.fillRect(0, 0, w, h); });
  const mk = (col) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.05, 0.05), new THREE.MeshBasicMaterial({ map: spotTex(col), transparent: true, depthWrite: false, toneMapped: false })); m.rotation.x = -Math.PI / 2; m.position.y = 0.0068; g.add(m); return m; };
  const cuivre = mk('#1A73D1'), perm = mk('#6A1FB0');
  function electrode(couleurPince) {
    const e = new THREE.Group();
    const tige = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.12, 20), M({ color: 0x22252a, roughness: 0.55, metalness: 0.2 })); tige.rotation.x = Math.PI / 2; tige.position.set(0, 0.016, 0); tige.castShadow = true; e.add(tige);
    const pince = box(0.02, 0.016, 0.03, M({ color: couleurPince, roughness: 0.45 }), true, 0.003); pince.position.set(0, 0.026, 0.07); e.add(pince);
    const fil = new THREE.Mesh(new THREE.CylinderGeometry(0.0022, 0.0022, 0.16, 12), M({ color: couleurPince, roughness: 0.5 })); fil.rotation.x = Math.PI / 2; fil.position.set(0, 0.026, 0.16); e.add(fil);
    return e;
  }
  const eA = electrode(0xd6342c), eB = electrode(0x15181c); g.add(eA, eB);
  const sign = (t, c) => { const s = label(t, 0.04, 0.022, c, '#fff'); s.rotation.x = -Math.PI / 2; s.position.y = 0.0065; g.add(s); return s; };
  const sA = sign('+', '#D6342C'), sB = sign('-', '#15181c');
  return { group: g, update(v) {
    const p = v.papier, x = (c) => (c === 'droite' ? 0.17 : -0.17);
    eA.visible = sA.visible = !!p.electrodeA; eB.visible = sB.visible = !!p.electrodeB;
    if (p.electrodeA) { eA.position.set(x(p.electrodeA), 0, 0); sA.position.x = x(p.electrodeA) + (p.electrodeA === 'droite' ? -0.03 : 0.03); sA.position.z = 0.075; }
    if (p.electrodeB) { eB.position.set(x(p.electrodeB), 0, 0); sB.position.x = x(p.electrodeB) + (p.electrodeB === 'droite' ? -0.03 : 0.03); sB.position.z = 0.075; }
    cuivre.visible = p.cuivreDepose; perm.visible = p.permanganateDepose;
    cuivre.position.set(p.positionCuivre * 0.15, 0.0068, -0.012); perm.position.set(p.positionPermanganate * 0.15, 0.0069, 0.012);
  }, camera: { pos: [0.0, 0.34, 0.42], target: [0, 0, 0] } };
}


// ---------------------------------------------------------------- circuit électrique (4 labos)
function fil(a, b, col, r = 0.0035) {
  const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), d = B.clone().sub(A);
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, d.length(), 12), M({ color: col, roughness: 0.45 }));
  m.position.copy(A).add(B).multiplyScalar(0.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); m.castShadow = true; return m;
}
function jauge(cv, div, cal, u, inv, hors) {
  const g = cv.getContext('2d'), W = cv.width, H = cv.height, cx = W / 2, cy = H * 0.85, R = H * 0.7;
  g.fillStyle = '#f7f6ef'; g.fillRect(0, 0, W, H); g.strokeStyle = '#0D2149'; g.fillStyle = '#0D2149'; g.font = '14px system-ui'; g.textAlign = 'center';
  const pt = (d, r) => { const a = (-60 + 120 * d / 100) * Math.PI / 180; return [cx + r * Math.sin(a), cy - r * Math.cos(a)]; };
  for (let d = 0; d <= 100; d += 5) { const g1 = d % 10 === 0, a = pt(d, R), b = pt(d, R - (g1 ? 14 : 7)); g.lineWidth = g1 ? 2 : 1; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); if (d % 20 === 0) { const t = pt(d, R - 28); g.fillText(d, t[0], t[1] + 4); } }
  const tip = pt(Math.max(0, Math.min(100, div)), R - 8); g.strokeStyle = '#D6342C'; g.lineWidth = 3; g.beginPath(); g.moveTo(cx, cy); g.lineTo(tip[0], tip[1]); g.stroke();
  g.fillStyle = '#0D2149'; g.beginPath(); g.arc(cx, cy, 6, 0, 7); g.fill(); g.font = 'bold 15px system-ui'; g.fillText(u + '  calibre ' + cal, cx, H - 6);
  if (hors) { g.fillStyle = '#D6342C'; g.fillText('HORS ÉCHELLE', cx, 22); } if (inv) { g.fillStyle = '#D6342C'; g.fillText('SENS INVERSE', cx, 40); }
}
function lcd(cv, txt) { const g = cv.getContext('2d'); g.fillStyle = '#b9c9a8'; g.fillRect(0, 0, cv.width, cv.height); g.fillStyle = '#1c2b17'; g.font = 'bold 54px ui-monospace,monospace'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, cv.width / 2, cv.height / 2); }
function bandes(cols) { return canvasTex(128, 32, (g, w, h) => { g.fillStyle = '#d8c39a'; g.fillRect(0, 0, w, h); cols.forEach((c, i) => { g.fillStyle = c; g.fillRect(34 + i * 18, 0, 8, h); }); }); }

function circuit(options, lab) {
  const g = new THREE.Group(), courant = lab === 'mesure_intensite' || lab === 'lois_courant', fr = (n) => (Math.abs(n) < 5e-4 ? '0' : String(Math.round(n * 1000) / 1000)).replace('.', ',');
  const board = box(0.95, 0.02, 0.5, M({ color: 0xe9ecee, roughness: 0.7 }), false, 0.004); board.position.y = 0.01; g.add(board);
  const alim = box(0.16, 0.09, 0.12, M({ color: 0x2b3340, roughness: 0.5, metalness: 0.3 }), true, 0.008); alim.position.set(-0.38, 0.065, -0.08); g.add(alim);
  const cvA = document.createElement('canvas'); cvA.width = 256; cvA.height = 96; const tA = new THREE.CanvasTexture(cvA); tA.colorSpace = THREE.SRGBColorSpace;
  const ecA = new THREE.Mesh(new THREE.PlaneGeometry(0.11, 0.04), new THREE.MeshBasicMaterial({ map: tA, toneMapped: false })); ecA.position.set(-0.38, 0.08, -0.019); g.add(ecA);
  const res = (cols, x, z) => { const r = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.07, 24), M({ map: bandes(cols), roughness: 0.6 })); r.rotation.z = Math.PI / 2; r.position.set(x, 0.035, z); r.castShadow = true; g.add(r); return r; };
  const r1 = res(['#7a3b0c', '#111', '#7a3b0c'], -0.1, -0.1), r2 = res(['#7a3b0c', '#2f8f2f', '#7a3b0c'], 0.1, -0.1);
  const kb = box(0.06, 0.02, 0.04, M({ color: 0x15181c, roughness: 0.5 }), true, 0.004); kb.position.set(-0.22, 0.03, -0.1); g.add(kb);
  const levier = box(0.05, 0.008, 0.008, M({ color: 0xc9ced4, metalness: 0.9, roughness: 0.3 }), true); levier.position.set(-0.22, 0.05, -0.1); g.add(levier);
  const led = new THREE.Mesh(new THREE.SphereGeometry(0.006, 16, 12), new THREE.MeshBasicMaterial({ color: 0x225522, toneMapped: false })); led.position.set(-0.34, 0.12, -0.019); g.add(led);
  const fils = new THREE.Group(); g.add(fils);
  const instr = new THREE.Group(); g.add(instr); const cache = {};
  function instrument(id, a, i) {
    let o = cache[id];
    if (!o) {
      const grp = new THREE.Group(), cv = document.createElement('canvas'); cv.width = 320; cv.height = 220; const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
      const corps = box(0.16, 0.12, 0.07, M({ color: 0x20252b, roughness: 0.45, metalness: 0.3 }), true, 0.008); corps.position.y = 0.06; grp.add(corps);
      const f = new THREE.Mesh(new THREE.PlaneGeometry(0.14, 0.096), new THREE.MeshBasicMaterial({ map: t, toneMapped: false })); f.position.set(0, 0.07, 0.0355); grp.add(f);
      const nom = label(id.replace('_aiguille', ''), 0.14, 0.02); nom.position.set(0, 0.012, 0.0358); grp.add(nom);
      o = cache[id] = { grp, cv, t }; instr.add(grp);
    }
    o.grp.visible = true; o.grp.position.set(-0.2 + i * 0.2, 0.02, 0.17);
    const u = id.indexOf('amperemetre') === 0 || (id === 'multimetre' && courant) ? 'A' : 'V';
    if (a.aiguilleDiv !== null && a.aiguilleDiv !== undefined) jauge(o.cv, a.aiguilleDiv, fr(a.calibre) + ' ' + u, u, a.sensInverse, a.horsEchelle); else lcd(o.cv, fr(a.affichage) + ' ' + u);
    o.t.needsUpdate = true;
  }
  return { group: g, update(v) {
    const tension = v.reglages.tension_generateur_v || 0, ferme = !!v.reglages.interrupteur_ferme;
    lcd(cvA, (Math.round(tension * 10) / 10).toFixed(1).replace('.', ',') + ' V'); tA.needsUpdate = true;
    led.material.color.set(ferme ? 0x33ff66 : 0x225522);
    levier.rotation.z = ferme ? 0 : 0.55; levier.position.y = ferme ? 0.045 : 0.052;
    const a = v.materiel.resistor_r1, b = v.materiel.resistor_r2, topo = a && a === b ? a : null;
    r1.visible = !!a; r2.visible = !!b; fils.clear();
    const F = (p, q) => fils.add(fil(p, q, 0xd6342c)), N = (p, q) => fils.add(fil(p, q, 0x15181c));
    const h = 0.038;
    if (topo === 'serie') { r1.position.set(-0.1, 0.035, -0.1); r2.position.set(0.1, 0.035, -0.1);
      F([-0.38, 0.1, -0.02], [-0.38, h, -0.2]); F([-0.38, h, -0.2], [0.32, h, -0.2]); N([0.32, h, -0.2], [0.32, h, -0.1]); N([0.32, h, -0.1], [0.135, h, -0.1]);
      F([-0.19, h, -0.1], [-0.135, h, -0.1]); F([-0.065, h, -0.1], [0.065, h, -0.1]); N([-0.4, 0.06, -0.02], [-0.4, h, 0.0]); N([-0.4, h, 0.0], [-0.25, h, 0.0]); }
    else if (topo === 'derivation') { r1.position.set(0, 0.035, -0.17); r2.position.set(0, 0.035, -0.03);
      F([-0.38, 0.1, -0.02], [-0.38, h, -0.2]); F([-0.38, h, -0.2], [-0.06, h, -0.17]); F([-0.06, h, -0.17], [-0.06, h, -0.03]); N([0.06, h, -0.17], [0.06, h, -0.03]); N([0.06, h, -0.03], [0.3, h, -0.03]); N([0.3, h, -0.03], [-0.4, h, 0.06]); }
    Object.keys(cache).forEach((k) => { cache[k].grp.visible = false; });
    Object.keys(v.appareils || {}).forEach((id, i) => instrument(id, v.appareils[id], i));
  }, camera: { pos: [0.0, 0.78, 0.62], target: [0, 0.0, 0.02] } };
}

// ---------------------------------------------------------------- SVT : tubes de pomme de terre
function tubesOsmose() {
  const g = new THREE.Group();
  const support = box(0.5, 0.012, 0.1, M({ color: 0x6b4a2b, roughness: 0.6 }), true, 0.003); support.position.y = 0.006; g.add(support);
  const verre = new THREE.MeshPhysicalMaterial({ color: 0xffffff, transmission: 1, thickness: 0.004, ior: 1.5, roughness: 0.02, transparent: true, envMapIntensity: 2 });
  const teinte = { eau_distillee: 0x9fd3ee, solution_saccharose_125: 0xc4dc98, solution_saccharose_250: 0xe2c964, solution_saccharose_375: 0xd49a30 };
  const tubes = ['tube_1', 'tube_2', 'tube_3', 'tube_4'].map((id, i) => {
    const t = new THREE.Group(); t.position.set(-0.16 + i * 0.107, 0.012, 0);
    const paroi = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.16, 32, 1, true), verre); paroi.position.y = 0.08; t.add(paroi);
    const fond = new THREE.Mesh(new THREE.SphereGeometry(0.016, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), verre); fond.position.y = 0.0; t.add(fond);
    const liq = new THREE.Mesh(new THREE.CylinderGeometry(0.0145, 0.0145, 0.1, 32), M({ color: 0x9fd3ee, roughness: 0.12, metalness: 0.0 })); liq.position.y = 0.05; t.add(liq);
    const bord = new THREE.Mesh(new THREE.TorusGeometry(0.016, 0.0013, 8, 32), M({ color: 0xd5dde3, roughness: 0.3 })); bord.rotation.x = Math.PI / 2; bord.position.y = 0.16; t.add(bord);
    const tr = new THREE.Group(); for (let k = 0; k < 4; k++) { const sl = box(0.003, 1, 0.009, M({ color: 0xc9a05a, roughness: 0.8 }), true); sl.position.set(-0.0075 + k * 0.005, 0, (k % 2) * 0.003); tr.add(sl); } t.add(tr);
    const nom = label(id.replace('_', ' '), 0.05, 0.016); nom.position.set(0, -0.003, 0.02); nom.rotation.x = -0.6; t.add(nom);
    g.add(t); return { t, liq, tr };
  });
  return { group: g, update(v) {
    ['tube_1', 'tube_2', 'tube_3', 'tube_4'].forEach((id, i) => {
      const d = v.tubes[id], o = tubes[i]; o.t.visible = d.solution !== null; if (!d.solution) return;
      o.liq.material.color.set(teinte[d.solution]);
      o.tr.visible = d.tranches;
      if (d.tranches) { const L = d.longueurCm * 0.012; o.tr.children.forEach((sl) => { sl.scale.y = L; sl.position.y = 0.075 - L / 2 + 0.01; }); }
    });
  }, camera: { pos: [0.0, 0.3, 0.42], target: [0, 0.08, 0] } };
}

// ---------------------------------------------------------------- SVT : bocal de sol
function bocalSol() {
  const g = new THREE.Group();
  const verre = new THREE.MeshPhysicalMaterial({ color: 0xffffff, transmission: 1, thickness: 0.004, ior: 1.5, roughness: 0.02, transparent: true, envMapIntensity: 2 });
  const bocal = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.17, 48, 1, true), verre); bocal.position.y = 0.085; g.add(bocal);
  const fond = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.004, 48), verre); fond.position.y = 0.002; g.add(fond);
  const couvercle = new THREE.Mesh(new THREE.CylinderGeometry(0.053, 0.053, 0.014, 48), M({ color: 0xd6342c, roughness: 0.4 })); couvercle.position.y = 0.177; couvercle.castShadow = true; g.add(couvercle);
  const eau = new THREE.Mesh(new THREE.CylinderGeometry(0.0485, 0.0485, 0.13, 48), new THREE.MeshPhysicalMaterial({ color: 0xbfe0f0, transparent: true, opacity: 0.35, roughness: 0.05 })); eau.position.y = 0.067; g.add(eau);
  const couches = [['sable', 0xc9a66b], ['limon', 0x8a6a45], ['argile', 0x5b3f2a]].map(([n, c]) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.0485, 0.0485, 1, 48), M({ color: c, roughness: 0.95 })); m.castShadow = true; g.add(m); return { n, m }; });
  const trouble = new THREE.Mesh(new THREE.CylinderGeometry(0.0485, 0.0485, 0.13, 48), new THREE.MeshPhysicalMaterial({ color: 0x7a5a3a, transparent: true, opacity: 0.88, roughness: 0.6 })); trouble.position.y = 0.067; g.add(trouble);
  const regle = new THREE.Mesh(new THREE.PlaneGeometry(0.025, 0.2), new THREE.MeshBasicMaterial({ map: canvasTex(64, 512, (c, w, h) => { c.fillStyle = '#f3f3ee'; c.fillRect(0, 0, w, h); c.fillStyle = '#111'; c.font = '16px system-ui'; for (let i = 0; i <= 20; i++) { const y = h - i * (h / 20); c.fillRect(0, y - 1, i % 5 === 0 ? 30 : 16, 2); if (i % 5 === 0) c.fillText(i, 34, y + 5); } }) })); regle.position.set(0.075, 0.1, 0); g.add(regle);
  return { group: g, update(v) {
    const b = v.bocal; bocal.visible = fond.visible = couvercle.visible = true;
    eau.visible = b.eau; couvercle.position.y = 0.177;
    const mel = b.terre && b.eau && b.fraction === 0 && b.agitationS > 0; trouble.visible = mel; eau.visible = b.eau && !mel;
    let y = 0.004; const echelle = 0.01;
    couches.forEach((c) => { const h = Math.max(1e-4, b[c.n] * echelle); c.m.visible = b.fraction > 0 || (b.terre && b.agitationS === 0 && c.n === 'sable'); if (b.agitationS === 0) { c.m.visible = b.terre && c.n === 'sable'; c.m.scale.y = 0.099 * 0.5; c.m.position.y = 0.004 + c.m.scale.y / 2; return; } c.m.scale.y = h; c.m.position.y = y + h / 2; y += h; });
  }, camera: { pos: [0.1, 0.24, 0.42], target: [0.0, 0.09, 0] } };
}


// ---------------------------------------------------------------- dosage acide-base
function dosage() {
  const g = new THREE.Group();
  const verre = new THREE.MeshPhysicalMaterial({ color: 0xffffff, transmission: 1, thickness: 0.004, ior: 1.5, roughness: 0.02, transparent: true, envMapIntensity: 2 });
  const alu = M({ color: 0xc9ced4, metalness: 0.9, roughness: 0.32 });
  const base = box(0.22, 0.02, 0.14, M({ color: 0x1b1f24, roughness: 0.6 }), true, 0.004); base.position.set(0.12, 0.01, 0); g.add(base);
  const tige = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.62, 20), alu); tige.position.set(0.12, 0.31, 0); tige.castShadow = true; g.add(tige);
  const pince = box(0.11, 0.012, 0.016, alu, true); pince.position.set(0.065, 0.5, 0); g.add(pince);
  const burette = new THREE.Group(); burette.position.set(0, 0, 0); g.add(burette);
  const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.0085, 0.0085, 0.34, 32, 1, true), verre); tube.position.y = 0.47; burette.add(tube);
  const liquide = new THREE.Mesh(new THREE.CylinderGeometry(0.0072, 0.0072, 1, 24), M({ color: 0xcfe7f3, roughness: 0.1 })); burette.add(liquide);
  const grad = new THREE.Mesh(new THREE.PlaneGeometry(0.02, 0.30), new THREE.MeshBasicMaterial({ transparent: true, map: canvasTex(64, 512, (c, w, h) => { c.clearRect(0, 0, w, h); c.fillStyle = '#0D2149'; c.font = '17px system-ui'; for (let i = 0; i <= 25; i++) { const y = 6 + i * ((h - 12) / 25); c.fillRect(0, y - 1, i % 5 === 0 ? 30 : 16, 2); if (i % 5 === 0) c.fillText(i, 34, y + 5); } }) })); grad.position.set(0, 0.465, 0.0092); burette.add(grad);
  const robinet = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.03, 20), M({ color: 0x20252b, roughness: 0.4 })); robinet.rotation.x = Math.PI / 2; robinet.position.y = 0.325; burette.add(robinet);
  const manette = box(0.03, 0.006, 0.006, M({ color: 0xff8a1f, roughness: 0.4 }), true); manette.position.set(0, 0.325, 0.02); burette.add(manette);
  const pointe = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.0012, 0.03, 12), verre); pointe.position.y = 0.295; burette.add(pointe);
  const jet = new THREE.Mesh(new THREE.CylinderGeometry(0.0015, 0.0015, 1, 8), M({ color: 0xcfe7f3, roughness: 0.1 })); burette.add(jet);
  const goutte = new THREE.Mesh(new THREE.SphereGeometry(0.003, 12, 10), M({ color: 0xcfe7f3, roughness: 0.1 })); goutte.position.y = 0.26; burette.add(goutte);
  const plaque = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.02, 48), M({ color: 0xe9ecee, roughness: 0.5 })); plaque.position.y = 0.01; plaque.receiveShadow = true; g.add(plaque);
  const fl = new THREE.Group(); fl.position.y = 0.02; g.add(fl);
  const profil = [[0.0, 0], [0.05, 0], [0.052, 0.004], [0.0135, 0.115], [0.0135, 0.14], [0.0165, 0.145]].map((p) => new THREE.Vector2(p[0], p[1]));
  const flacon = new THREE.Mesh(new THREE.LatheGeometry(profil, 48), verre); fl.add(flacon);
  const liqProfil = [[0, 0.003], [0.0495, 0.003], [0.0344, 0.045], [0, 0.045]].map((p) => new THREE.Vector2(p[0], p[1]));
  const liq = new THREE.Mesh(new THREE.LatheGeometry(liqProfil, 40), M({ color: 0xe6f1f7, roughness: 0.1 })); fl.add(liq);
  const lun = new THREE.Group(); [-0.025, 0.025].forEach((x) => { const o = new THREE.Mesh(new THREE.TorusGeometry(0.022, 0.0035, 10, 32), M({ color: 0x1a73d1, roughness: 0.3 })); o.position.set(x, 0.026, 0); o.rotation.x = -Math.PI / 2 + 0.4; lun.add(o); });
  lun.position.set(-0.17, 0, 0.12); g.add(lun);
  return { group: g, update(v) {
    const d = v.dosage, cap = d.buretteMl;
    burette.visible = d.burette; fl.visible = plaque.visible = d.erlenmeyer; lun.visible = d.lunettes;
    const h = d.soude ? 0.30 * (1 - d.volumeMl / cap) : 0.0001; liquide.visible = d.soude;
    liquide.scale.y = Math.max(1e-4, h); liquide.position.y = 0.33 + h / 2;
    manette.rotation.z = d.debit === 'ferme' ? 0 : (d.debit === 'goutte_a_goutte' ? 0.6 : 1.35);
    jet.visible = d.debit === 'jet' && d.soude && d.erlenmeyer; if (jet.visible) { jet.scale.y = 0.15; jet.position.y = 0.2; }
    goutte.visible = d.debit === 'goutte_a_goutte' && d.soude && d.erlenmeyer;
    const total = d.volumeAcideMl + d.volumeMl; liq.visible = d.volumeAcideMl > 0; liq.scale.set(1, 0.7 + 0.8 * Math.min(1, total / 45), 1); liq.scale.x = liq.scale.z = 0.9 + 0.1 * Math.min(1, total / 45);
    liq.material.color.set(d.couleur === 'rose' ? 0xf06fa8 : 0xe6f1f7);
  }, camera: { pos: [0.06, 0.42, 0.9], target: [0.04, 0.32, 0] } };
}

const SCENES = { titrage_acide_base: dosage, focale_lentille: banc, oscilloscope_tension: oscillo, migration_ions: migration,
  mesure_intensite: circuit, lois_courant: circuit, mesure_tension_masse: circuit, lois_tensions: circuit,
  osmose_pomme_de_terre: tubesOsmose, sol_constituants: bocalSol };


function disponible() {
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch (e) { return false; }
}

function mount(el) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  const faible = Math.min(window.innerWidth, window.innerHeight) < 500;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, faible ? 1.5 : 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  el.appendChild(renderer.domElement); renderer.domElement.style.display = 'block'; renderer.domElement.setAttribute('role', 'img'); renderer.domElement.setAttribute('aria-label', 'Scène 3D du laboratoire, tourne avec le doigt ou la souris');
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0xdbe6ec);
  const pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture; scene.environmentIntensity = 0.75;
  const camera = new THREE.PerspectiveCamera(40, 1, 0.02, 20);
  const soleil = new THREE.DirectionalLight(0xffffff, 2.2); soleil.position.set(0.6, 1.4, 0.8); soleil.castShadow = true;
  const sm = faible ? 1024 : 2048; soleil.shadow.mapSize.set(sm, sm); Object.assign(soleil.shadow.camera, { left: -1, right: 1, top: 1, bottom: -1, near: 0.2, far: 4 }); soleil.shadow.bias = -0.0004; soleil.shadow.radius = 4;
  scene.add(soleil, new THREE.HemisphereLight(0xdfeeff, 0x886644, 0.35));
  const table = box(3.0, 0.05, 1.6, M({ map: woodTex(), roughness: 0.55 }), false); table.position.y = -0.025; table.receiveShadow = true; scene.add(table);
  const sol = new THREE.Mesh(new THREE.PlaneGeometry(12, 12), M({ color: 0xc9d4da, roughness: 1 })); sol.rotation.x = -Math.PI / 2; sol.position.y = -0.4; sol.receiveShadow = true; scene.add(sol);
  const controls = new OrbitControls(camera, renderer.domElement);
  Object.assign(controls, { enableDamping: true, dampingFactor: 0.08, maxPolarAngle: 1.45, minDistance: 0.25, maxDistance: 3, enablePan: true });
  let courant = null, id = null, dernier = null, touche = false, visible = true, dirty = true;
  controls.addEventListener('start', () => { touche = true; }); controls.addEventListener('change', () => { dirty = true; });

  function ajuster() {
    const w = el.clientWidth || 300, h = el.clientHeight || 200;
    renderer.setSize(w, h, true); camera.aspect = w / h; camera.updateProjectionMatrix();
    if (courant && !touche) {
      const t = new THREE.Vector3(...courant.camera.target), p = new THREE.Vector3(...courant.camera.pos);
      const portrait = Math.max(1, 2.1 / camera.aspect);
      p.sub(t).multiplyScalar(portrait).add(t); camera.position.copy(p); controls.target.copy(t); controls.update();
    }
    dirty = true;
  }
  new ResizeObserver(ajuster).observe(el);
  new IntersectionObserver((e) => { visible = e[0].isIntersecting; dirty = true; }).observe(el);

  // __tick : crochet des modules interactifs (demo/*_spec.js). Il renvoie vrai quand la scène doit être redessinée.
  renderer.setAnimationLoop(() => {
    if (!visible) return;
    if (window.__tick && window.__tick()) dirty = true;
    if (controls.update() || dirty) { renderer.render(scene, camera); dirty = false; }
  });

  return {
    supports: (lab) => !!SCENES[lab],
    show(lab, options) {
      if (courant) { scene.remove(courant.group); }
      id = lab; touche = false; dernier = null;
      courant = SCENES[lab] ? SCENES[lab](options, lab) : null;
      if (courant) { scene.add(courant.group); ajuster(); }
    },
    update(vue) { if (courant) { courant.update(vue); dirty = true; } },
    resize: ajuster,
    // accès à la scène pour les modules interactifs (demo/*_spec.js)
    three: { scene, camera, renderer, controls, dirty() { dirty = true; }, cap() { return courant && courant.group; } },
    renderOnce() { renderer.render(scene, camera); },
    dispose() { renderer.setAnimationLoop(null); renderer.dispose(); el.removeChild(renderer.domElement); },
  };
}

window.Lab3D = { mount, disponible };
