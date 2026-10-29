// Page d'accueil publique : navigation mobile et cartes de fonctionnalités.
import { bootstrap } from '../app.js';
import { initPublicNav } from '../components/navigation.js';
import { escapeHtml } from '../utils/dom.js';
import { icon } from '../utils/icons.js';

const FEATURES = [
  { icon: 'flask', title: 'Simulations interactives', text: 'Manipule des instruments virtuels et observe les résultats.' },
  { icon: 'bot', title: 'Assistant IA', text: 'Il te guide, t’explique et t’aide à progresser (en cours d’intégration).' },
  { icon: 'wifiOff', title: 'Pensé pour le hors ligne', text: 'L’interface est préparée pour une connexion limitée ; chaque simulation sera adaptée progressivement.' },
  { icon: 'smartphone', title: 'Multi-appareils', text: 'Accessible sur ordinateur, tablette et smartphone.' },
];

bootstrap();
initPublicNav();
document.getElementById('nav-toggle').innerHTML = icon('menu');
document.getElementById('features-grid').innerHTML = FEATURES.map((f) => `
  <article class="card feature-card"><span class="subject-icon">${icon(f.icon)}</span><h3>${escapeHtml(f.title)}</h3><p>${escapeHtml(f.text)}</p></article>`).join('');
