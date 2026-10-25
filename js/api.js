 // js/app.js

// ==========================================
// 1. BASE DE DONNÉES (MOCK POUR LA DÉMO)
// ==========================================
export const simulationsData = [
  { id: 1, title: "Titrage acide-base", desc: "Observer le changement de pH", icon: "🧪", color: "#E0F2FE", available: true, link: "simulation-detail.html" },
  { id: 2, title: "Réaction de précipitation", desc: "Comprendre la formation du précipité", icon: "🧪", color: "#F3E8FF", available: false, link: "#" },
  { id: 3, title: "Synthèse de l'eau", desc: "Explorer la réaction de l'hydrogène", icon: "🌱", color: "#DCFCE7", available: false, link: "#" },
  { id: 4, title: "Dissolution d'un sel", desc: "Voir la dissolution dans l'eau", icon: "🧪", color: "#FCE7F3", available: false, link: "#" },
  { id: 5, title: "Électrolyse de l'eau", desc: "Observer la séparation des gaz", icon: "⚡", color: "#E0E7FF", available: false, link: "#" },
  { id: 6, title: "Combustion du méthane", desc: "Comprendre la réaction de combustion", icon: "🔥", color: "#FEF3C7", available: false, link: "#" }
];

export const elevesData = [
  { nom: "Adjo K.", matiere: "Physique", progression: 70 },
  { nom: "Kouassi M.", matiere: "Chimie", progression: 45 },
  { nom: "Essi L.", matiere: "SVT", progression: 85 },
  { nom: "Togola D.", matiere: "Maths", progression: 30 }
];

// ==========================================
// 2. LOGIQUE DU CATALOGUE (simulations.html)
// ==========================================
export function initCatalogue() {
  const container = document.getElementById('simulations-list');
  if (!container) return;

  const searchInput = document.getElementById('search');

  function render(data) {
    if (data.length === 0) {
      container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #64748B; padding: 40px;">Aucune simulation trouvée.</p>';
      return;
    }
    container.innerHTML = data.map(sim => `
      <div class="sim-card">
        <div class="sim-img" style="background: ${sim.color};">${sim.icon}</div>
        <div class="sim-content">
          <h3>${sim.title}</h3>
          <p>${sim.desc}</p>
          ${sim.available 
            ? `<a href="${sim.link}" class="btn btn-primary btn-sm" style="text-decoration:none;">Commencer</a>` 
            : `<button class="btn btn-secondary btn-sm" disabled>Bientôt</button>`}
        </div>
      </div>
    `).join('');
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase();
      const filtered = simulationsData.filter(s => s.title.toLowerCase().includes(query));
      render(filtered);
    });
  }

  render(simulationsData);
}

// ==========================================
// 3. LOGIQUE DU LABO (simulation-detail.html)
// ==========================================
export function initLabo() {
  const canvas = document.getElementById('stage');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const slider = document.getElementById('volume-slider');
  const phEl = document.getElementById('ph-value');
  const volEl = document.getElementById('volume-value');
  const marker = document.getElementById('ph-marker');

  function calcPh(v) {
    const nA = 0.1 * 20, nB = 0.1 * v, vt = 20 + v;
    if (Math.abs(nB - nA) < 0.05) return 7;
    if (nB < nA) return -Math.log10((nA - nB) / vt);
    return 14 + Math.log10((nB - nA) / vt);
  }

  function draw(volume, ph) {
    ctx.clearRect(0, 0, 400, 400);
    // Burette
    ctx.fillStyle = '#E2E8F0'; ctx.fillRect(185, 20, 30, 120);
    ctx.strokeStyle = '#94A3B8'; ctx.lineWidth = 2; ctx.strokeRect(185, 20, 30, 120);
    // Robinet
    ctx.fillStyle = '#6D28D9'; ctx.fillRect(190, 140, 20, 15);
    // Erlenmeyer
    ctx.beginPath(); ctx.moveTo(160, 220); ctx.lineTo(240, 220); ctx.lineTo(215, 350); ctx.lineTo(185, 350); ctx.closePath();
    let color = '#F8FAFC';
    if (ph > 10) color = '#F472B6'; else if (ph >= 8.2) color = '#FBCFE8';
    ctx.fillStyle = color; ctx.fill(); ctx.strokeStyle = '#94A3B8'; ctx.lineWidth = 3; ctx.stroke();
  }

  if (slider) {
    slider.addEventListener('input', (e) => {
      const v = parseFloat(e.target.value);
      const p = calcPh(v);
      if (phEl) phEl.textContent = p.toFixed(1);
      if (volEl) volEl.textContent = v.toFixed(1) + ' mL';
      if (marker) marker.style.left = (p / 14) * 100 + '%';
      draw(v, p);
    });
  }

  draw(0, calcPh(0));
}

// ==========================================
// 4. LOGIQUE DE L'ESPACE ENSEIGNANT (espace-enseignant.html)
// ==========================================
export function initEnseignant() {
  const container = document.getElementById('tableau-eleves');
  if (!container) return;

  container.innerHTML = elevesData.map(eleve => {
    let couleur, statut;
    if (eleve.progression >= 75) { couleur = "var(--succes)"; statut = "Bon"; }
    else if (eleve.progression >= 50) { couleur = "#F59E0B"; statut = "Moyen"; }
    else { couleur = "var(--danger)"; statut = "Difficile"; }

    return `
      <div class="table-row">
        <div class="student-name">${eleve.nom}</div>
        <div style="color: var(--texte-gris); font-size: 0.9rem;">${eleve.matiere}</div>
        <div style="display: flex; align-items: center; gap: 12px;">
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${eleve.progression}%; background: ${couleur};"></div>
          </div>
          <span style="font-size: 0.85rem; font-weight: 600;">${eleve.progression}%</span>
        </div>
        <div><span class="status-dot" style="background: ${couleur};"></span> ${statut}</div>
      </div>
    `;
  }).join('');
}