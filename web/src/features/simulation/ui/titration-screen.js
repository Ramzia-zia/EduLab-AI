 import { TitrationModel } from '../model/titration-model.js';
import { TitrationEventType } from '../../../core/contracts/titration-contract.js';

export class TitrationScreen {
  constructor(container, params, onEvent) {
    this.params = params;
    this.onEvent = onEvent;
    this.model = new TitrationModel(params);
    this.equivAnnounced = false;

    // 1. On injecte le HTML de l'interface (le layout exact de la maquette)
    container.innerHTML = `
      <div class="simulation-layout">
        <!-- Zone de dessin (Gauche) -->
        <div class="canvas-area">
          <canvas id="stage" width="400" height="500"></canvas>
        </div>

        <!-- Panneau de contrôle (Droite) -->
        <div class="control-panel">
          <h2 class="panel-title">Titrage acide-base</h2>
          
          <div class="card">
            <h3>Matériel</h3>
            <ul class="material-list">
              <li>Burette</li>
              <li>Érienmeyer</li>
              <li>Solution acide</li>
              <li>Solution basique</li>
              <li>Indicateur coloré</li>
            </ul>
          </div>

          <div class="card">
            <h3>Étapes</h3>
            <ol class="steps-list">
              <li>Ajouter la solution acide</li>
              <li>Ajouter l'indicateur</li>
              <li>Verser la solution basique</li>
              <li>Observer le changement de couleur</li>
            </ol>
          </div>

          <div class="card">
            <div class="ph-header">
              <span>pH actuel</span>
              <span id="ph-value" class="ph-value">1.00</span>
            </div>
            <div class="ph-bar">
              <div class="ph-indicator" id="ph-indicator" style="left: 7%;"></div>
            </div>
          </div>

          <div class="card">
            <div class="volume-header">
              <span>Volume versé</span>
              <span id="volume-value" class="volume-value">0.0 mL</span>
            </div>
            <input type="range" id="volume-slider" min="0" max="40" step="0.1" value="0">
          </div>

          <button id="btn-continue" class="btn-continue">Continuer</button>
        </div>
      </div>
    `;

    // 2. On récupère les éléments du DOM
    this.stage = container.querySelector('#stage');
    this.ctx = this.stage.getContext('2d');
    this.phValueEl = container.querySelector('#ph-value');
    this.phIndicator = container.querySelector('#ph-indicator');
    this.volumeValueEl = container.querySelector('#volume-value');
    this.slider = container.querySelector('#volume-slider');
    this.btnContinue = container.querySelector('#btn-continue');

    // 3. On branche les événements
    this.slider.addEventListener('input', () => this.onSliderChange());
    
    this.btnContinue.addEventListener('click', () => {
      this.emit(TitrationEventType.EXPERIMENT_ENDED);
      alert('Expérience terminée ! Les données ont été enregistrées (simulation).');
    });

    // 4. Premier rendu
    this.render();
  }

  onSliderChange() {
    const v = parseFloat(this.slider.value);
    
    // On remet le modèle à zéro et on ajoute le volume exact du slider
    this.model.reset();
    this.model.addBase(v);

    // On émet l'événement pour Personne 2 et 3
    this.emit(TitrationEventType.DROP);

    // Vérification de l'équivalence
    if (this.model.equivalenceReached && !this.equivAnnounced) {
      this.equivAnnounced = true;
      this.emit(TitrationEventType.EQUIVALENCE_CROSSED);
    } else if (!this.model.equivalenceReached && this.equivAnnounced) {
      this.equivAnnounced = false;
    }

    this.render();
  }

  emit(type) {
    this.onEvent?.({
      timestamp: Date.now(),
      type,
      volumeBase: this.model.volumeBase,
      ph: this.model.ph,
      equivalenceVolume: this.model.equivalenceReached ? this.model.equivalenceVolume : null,
      payload: null,
    });
  }

  render() {
    const ph = this.model.ph;
    const volume = this.model.volumeBase;

    // Mise à jour des textes
    this.phValueEl.textContent = ph.toFixed(2);
    this.volumeValueEl.textContent = volume.toFixed(1) + ' mL';

    // Mise à jour de la jauge de pH (de 0 à 14)
    const percent = (ph / 14) * 100;
    this.phIndicator.style.left = percent + '%';

    if (ph < 7) this.phIndicator.style.backgroundColor = '#EF4444';
    else if (ph < 8.2) this.phIndicator.style.backgroundColor = '#F59E0B';
    else this.phIndicator.style.backgroundColor = '#3B82F6';

    // Dessin du canvas
    this._drawStage(volume, ph);
  }

  _drawStage(volume, ph) {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, 400, 500);

    // --- Burette ---
    ctx.strokeStyle = '#64748B';
    ctx.lineWidth = 3;
    ctx.strokeRect(185, 50, 30, 200);
    ctx.fillStyle = '#E2E8F0';
    ctx.fillRect(185, 50, 30, 200);
    
    ctx.fillStyle = '#94A3B8';
    ctx.fillRect(190, 250, 20, 10);

    // Goutte animée si on verse
    if (volume > 0 && volume < 40) {
      ctx.fillStyle = '#3B82F6';
      ctx.beginPath();
      ctx.arc(200, 280, 5, 0, Math.PI * 2);
      ctx.fill();
    }

    // --- Érienmeyer ---
    ctx.beginPath();
    ctx.moveTo(150, 350);
    ctx.lineTo(250, 350);
    ctx.lineTo(220, 450);
    ctx.lineTo(180, 450);
    ctx.closePath();
    
    let liquidColor = '#E2E8F0';
    if (ph >= 8.2 && ph <= 10) {
      const t = (ph - 8.2) / 1.8;
      liquidColor = `rgb(${Math.round(226 + (244-226)*t)}, ${Math.round(232 + (114-232)*t)}, ${Math.round(240 + (182-240)*t)})`;
    } else if (ph > 10) {
      liquidColor = '#F472B6';
    }
    
    ctx.fillStyle = liquidColor;
    ctx.fill();
    ctx.strokeStyle = '#64748B';
    ctx.lineWidth = 3;
    ctx.stroke();
  }
}