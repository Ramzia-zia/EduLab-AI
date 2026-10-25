 // js/app.js

// ==========================================
// 1. DONNÉES DE DÉMONSTRATION (MOCK)
// ==========================================
export const simulationsData = [
  { id: 1, title: "Titrage acide-base", desc: "Observer le changement de pH", icon: "🧪", color: "#F3E8FF", link: "simulation-detail.html", available: true },
  { id: 2, title: "Réaction de précipitation", desc: "Comprendre la formation du précipité", icon: "🧪", color: "#E0F2FE", link: "#", available: false },
  { id: 3, title: "Chute libre", desc: "Étudier la chute d'un objet", icon: "⚛️", color: "#DCFCE7", link: "#", available: false },
  { id: 4, title: "La photosynthèse", desc: "Le rôle de la lumière", icon: "🌱", color: "#FCE7F3", link: "#", available: false }
];

// ==========================================
// 2. LOGIQUE DE LA PAGE CATALOGUE
// ==========================================
export function initCatalogue() {
  const container = document.getElementById('simulations-list');
  if (!container) return; // On n'est pas sur la page catalogue

  const searchInput = document.getElementById('search');

  function render(data) {
    if (data.length === 0) {
      container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #64748B; padding: 40px;">Aucune simulation trouvée.</p>';
      return;
    }
    container.innerHTML = data.map(sim => `
      <div class="card" style="background: white; border-radius: 16px; padding: 24px; border: 1px solid #E8E8F2; display: flex; flex-direction: column;">
        <div style="height: 140px; background: ${sim.color}; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 4rem; margin-bottom: 20px;">${sim.icon}</div>
        <h3 style="margin-bottom: 8px; font-weight: 700;">${sim.title}</h3>
        <p style="color: #64748B; font-size: 0.9rem; margin-bottom: 24px; flex: 1;">${sim.desc}</p>
        ${sim.available 
          ? `<a href="${sim.link}" class="btn btn-primary" style="background: #5B35D5; color: white; padding: 12px; border-radius: 8px; text-align: center; text-decoration: none; font-weight: 600;">Commencer</a>` 
          : `<button style="background: #F7F7FC; color: #17163D; padding: 12px; border-radius: 8px; border: 1px solid #E8E8F2; font-weight: 600;" disabled>Bientôt disponible</button>`}
      </div>
    `).join('');
  }

  // Événement de recherche
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase();
      const filtered = simulationsData.filter(s => s.title.toLowerCase().includes(query));
      render(filtered);
    });
  }

  // Premier affichage
  render(simulationsData);
}

// ==========================================
// 3. LOGIQUE DU LABORATOIRE (CANVAS)
// ==========================================
export function initLabo() {
  const canvas = document.getElementById('stage');
  if (!canvas) return; // On n'est pas sur la page labo

  const ctx = canvas.getContext('2d');
  const slider = document.getElementById('volume-slider');
  const phEl = document.getElementById('ph-value');
  const volEl = document.getElementById('volume-value');

  function calcPh(volume) {
    const ca = 0.1, va = 20, cb = 0.1;
    const nAcid = ca * va, nBase = cb * volume, vTot = va + volume;
    if (Math.abs(nBase - nAcid) < 0.05) return 7;
    if (nBase < nAcid) return -Math.log10((nAcid - nBase) / vTot);
    return 14 + Math.log10((nBase - nAcid) / vTot);
  }

  function draw(volume, ph) {
    ctx.clearRect(0, 0, 400, 450);
    // Burette
    ctx.fillStyle = '#E2E8F0'; ctx.fillRect(180, 20, 40, 150); 
    ctx.strokeStyle = '#94A3B8'; ctx.lineWidth = 2; ctx.strokeRect(180, 20, 40, 150);
    // Bécher
    ctx.beginPath(); ctx.moveTo(150, 250); ctx.lineTo(250, 250); ctx.lineTo(220, 400); ctx.lineTo(180, 400); ctx.closePath();
    let color = '#F1F5F9'; 
    if (ph > 10) color = '#F472B6'; 
    else if (ph >= 8.2) color = '#FBCFE8';
    ctx.fillStyle = color; ctx.fill(); 
    ctx.strokeStyle = '#94A3B8'; ctx.lineWidth = 3; ctx.stroke();
  }

  if (slider) {
    slider.addEventListener('input', (e) => {
      const v = parseFloat(e.target.value);
      const p = calcPh(v);
      if (phEl) phEl.textContent = p.toFixed(2);
      if (volEl) volEl.textContent = v.toFixed(1) + ' mL';
      draw(v, p);
    });
  }

  draw(0, calcPh(0));
}