// ============================================================================
// DONNÉES FICTIVES DE DÉMONSTRATION
// Elles ne sont utilisées que si CONFIG.MODE === 'demo' (voir js/config.js).
// Elles ne viennent PAS d'une base de données et ne doivent jamais être présentées comme réelles.
// ============================================================================

const daysAgo = (n) => new Date(Date.now() - n * 86400000).toISOString();

// Comptes de démonstration (les mots de passe ci-dessous sont fictifs et valables uniquement en démo)
export const DEMO_ACCOUNTS = [
  { password: 'demo1234', user: { id: 'demo-student', firstName: 'Aminata', lastName: 'Démo', email: 'eleve@demo.tg', role: 'student', level: 'Seconde' } },
  { password: 'demo1234', user: { id: 'demo-teacher', firstName: 'Koffi', lastName: 'Démo', email: 'enseignant@demo.tg', role: 'teacher' } },
];

const sim = (id, title, subject, level, durationMin, description, objectives, available = false) =>
  ({ id, title, subject, level, durationMin, description, objectives, available });

// Catalogue : pour ajouter une expérience, ajouter UNE ligne ici (aucun autre code à modifier).
// "available: true" signifie qu'un moteur existe dans js/simulations/registry.js.
export const DEMO_SIMULATIONS = [
  sim('titrage-acide-base', 'Titrage acide-base', 'Chimie', 'Seconde', 20, 'Dose un acide de concentration inconnue avec de la soude et observe le saut de pH.', ['Repérer le point d’équivalence', 'Calculer une concentration inconnue', 'Lire une courbe de titrage'], true),
  sim('precipitation', 'Réaction de précipitation', 'Chimie', '3e', 15, 'Comprends la formation d’un précipité en mélangeant deux solutions.', ['Identifier un précipité']),
  sim('synthese-eau', 'Synthèse de l’eau', 'Chimie', '3e', 15, 'Explore la réaction entre le dihydrogène et le dioxygène.', ['Équilibrer une équation']),
  sim('dissolution-sel', 'Dissolution d’un sel', 'Chimie', '4e', 12, 'Observe la dissolution d’un sel dans l’eau.', ['Définir soluté et solvant']),
  sim('loi-ohm', 'Loi d’Ohm', 'Physique', '4e', 15, 'Relie la tension et l’intensité dans un circuit simple.', ['Mesurer U et I', 'Calculer une résistance']),
  sim('chute-libre', 'Chute libre', 'Physique', '3e', 12, 'Mesure l’accélération d’un objet en chute.', ['Mesurer un temps de chute']),
  sim('refraction', 'Réfraction de la lumière', 'Physique', 'Seconde', 15, 'Vérifie la loi de Snell-Descartes.', ['Mesurer des angles']),
  sim('lentilles', 'Lentilles minces', 'Physique', 'Première', 20, 'Construis l’image donnée par une lentille.', ['Utiliser la relation de conjugaison']),
  sim('microscope', 'Observation au microscope', 'SVT', '6e', 15, 'Découvre la cellule avec un microscope virtuel.', ['Régler un microscope']),
  sim('germination', 'Germination d’une graine', 'SVT', '5e', 12, 'Étudie les conditions de la germination.', ['Identifier les conditions nécessaires']),
  sim('photosynthese', 'Photosynthèse', 'SVT', '4e', 15, 'Étudie le rôle de la lumière pour la plante.', ['Relier lumière et production de matière']),
  sim('fonction-affine', 'Fonctions affines', 'Mathématiques', '3e', 15, 'Trace et interprète la représentation d’une fonction affine.', ['Lire un coefficient directeur']),
];

export const DEMO_RESULTS = [
  { id: 'r1', simulationId: 'titrage-acide-base', title: 'Titrage acide-base', subject: 'Chimie', score: 88, date: daysAgo(1) },
  { id: 'r2', simulationId: 'loi-ohm', title: 'Loi d’Ohm', subject: 'Physique', score: 76, date: daysAgo(3) },
  { id: 'r3', simulationId: 'microscope', title: 'Observation au microscope', subject: 'SVT', score: 92, date: daysAgo(6) },
  { id: 'r4', simulationId: 'precipitation', title: 'Réaction de précipitation', subject: 'Chimie', score: 64, date: daysAgo(9) },
];

export const DEMO_PROGRESS = {
  globalPercent: 68,
  bySubject: [{ subject: 'Physique', percent: 70 }, { subject: 'Chimie', percent: 75 }, { subject: 'SVT', percent: 60 }, { subject: 'Mathématiques', percent: 45 }],
  scoreEvolution: [{ label: 'S1', score: 55 }, { label: 'S2', score: 62 }, { label: 'S3', score: 60 }, { label: 'S4', score: 71 }, { label: 'S5', score: 76 }, { label: 'S6', score: 88 }],
};

export const DEMO_QUOTE = 'L’erreur n’est pas un échec, c’est une étape vers la compréhension.';

export const DEMO_COURSES = {
  courses: [
    { id: 'c1', title: 'Les réactions chimiques', subject: 'Chimie', level: 'Seconde', description: 'Les différents types de réactions et leurs caractéristiques.', durationMin: 40, progress: 60 },
    { id: 'c2', title: 'Acides et bases', subject: 'Chimie', level: 'Seconde', description: 'Le pH, les acides forts et faibles, les dosages.', durationMin: 35, progress: 30 },
    { id: 'c3', title: 'Le courant électrique', subject: 'Physique', level: '4e', description: 'Tension, intensité et résistance.', durationMin: 30, progress: 100 },
    { id: 'c4', title: 'La cellule', subject: 'SVT', level: '6e', description: 'Structure et rôle de la cellule.', durationMin: 25, progress: 0 },
    { id: 'c5', title: 'Les fonctions affines', subject: 'Mathématiques', level: '3e', description: 'Expression, représentation graphique et coefficient directeur.', durationMin: 30, progress: 10 },
  ],
  exercises: [
    { id: 'e1', title: 'Équilibrer une équation chimique', subject: 'Chimie', difficulty: 'Facile', durationMin: 10, progress: 100, simulationId: null },
    { id: 'e2', title: 'Identifier un gaz', subject: 'Chimie', difficulty: 'Moyen', durationMin: 15, progress: 40, simulationId: null },
    { id: 'e3', title: 'Titrage acide-base', subject: 'Chimie', difficulty: 'Difficile', durationMin: 20, progress: 0, simulationId: 'titrage-acide-base' },
    { id: 'e4', title: 'Calculer une résistance', subject: 'Physique', difficulty: 'Moyen', durationMin: 12, progress: 0, simulationId: null },
  ],
  resources: [
    { id: 'rs1', title: 'Fiche mémo : le pH', subject: 'Chimie', type: 'PDF' },
    { id: 'rs2', title: 'Vidéo : manipuler une burette', subject: 'Chimie', type: 'Vidéo' },
    { id: 'rs3', title: 'Tableau périodique interactif', subject: 'Chimie', type: 'Lien' },
    { id: 'rs4', title: 'Formulaire de physique', subject: 'Physique', type: 'PDF' },
  ],
};

export const DEMO_ASSISTANT = {
  suggestions: ['Pourquoi la solution est devenue rose ?', 'Comment trouver le point d’équivalence ?', 'Comment calculer la concentration ?'],
  replies: {
    question: 'Bonne question ! Regarde d’abord ce que tu as observé, puis relie-le à la notion du cours.',
    explain: 'Explication simple : à l’équivalence, les quantités d’acide et de base sont égales, ce qui provoque le saut de pH.',
    hint: 'Indice : repère sur la courbe le moment où le pH change très vite.',
    restart: 'D’accord, on reprend l’expérience depuis le début.',
  },
};

export const DEMO_POSTS = [
  { id: 'p1', category: 'Conseils', title: 'Comment mieux réussir en chimie ?', body: 'Je cherche des conseils pour mieux comprendre les expériences.', author: 'Sara K. (fictif)', createdAt: daysAgo(2), likes: 24 },
  { id: 'p2', category: 'Questions', title: 'Quel volume pour une dilution ?', body: 'Quelqu’un peut-il m’expliquer comment calculer le volume ?', author: 'Issa T. (fictif)', createdAt: daysAgo(5), likes: 12 },
  { id: 'p3', category: 'Témoignages', title: 'Ma première simulation de titrage', body: 'Grâce aux simulations, j’ai enfin compris le saut de pH.', author: 'Afi M. (fictif)', createdAt: daysAgo(8), likes: 31 },
];
export const DEMO_REPLIES = [
  { id: 'rp1', postId: 'p1', author: 'Kodjo A. (fictif)', body: 'Refais chaque expérience plusieurs fois et note ce que tu observes.', createdAt: daysAgo(1) },
];

export const DEMO_TEACHER = {
  classes: [{ id: 'cl1', name: '2nde A' }, { id: 'cl2', name: '2nde B' }],
  students: [
    { id: 's1', name: 'Adjo K.', classId: 'cl1', averageScore: 78, progress: 70, subject: 'Physique', email: 'adjo@demo.tg', results: DEMO_RESULTS.slice(0, 2) },
    { id: 's2', name: 'Kouassi M.', classId: 'cl1', averageScore: 52, progress: 45, subject: 'Chimie', email: 'kouassi@demo.tg', results: DEMO_RESULTS.slice(2, 4) },
    { id: 's3', name: 'Essi L.', classId: 'cl2', averageScore: 70, progress: 60, subject: 'SVT', email: 'essi@demo.tg', results: DEMO_RESULTS.slice(1, 3) },
    { id: 's4', name: 'Togbui D.', classId: 'cl2', averageScore: 41, progress: 30, subject: 'Mathématiques', email: 'togbui@demo.tg', results: DEMO_RESULTS.slice(3) },
  ],
  activities: [{ id: 'act1', title: 'Titrage à rendre', simulationId: 'titrage-acide-base', classId: 'cl1', dueDate: '2026-11-15' }],
  difficulties: [{ topic: 'Calcul de concentration', studentsAffected: 3 }, { topic: 'Lecture d’une courbe de titrage', studentsAffected: 2 }],
};

/* ----- Modifications locales et TEMPORAIRES (propres à l'onglet, perdues à sa fermeture) ----- */
const STATE_KEY = 'edulab.demo.state';
function readState() { try { return JSON.parse(sessionStorage.getItem(STATE_KEY)) ?? {}; } catch { return {}; } }
export function getDemoState(name, fallback) {
  const state = readState();
  return name in state ? state[name] : structuredClone(fallback);
}
export function setDemoState(name, value) {
  const state = readState();
  state[name] = value;
  try { sessionStorage.setItem(STATE_KEY, JSON.stringify(state)); } catch { /* ignoré */ }
}
export const demoDelay = (value, ms = 350) => new Promise((resolve) => setTimeout(() => resolve(structuredClone(value)), ms));
export const newDemoId = (prefix) => `${prefix}-${Date.now().toString(36)}${Math.floor(Math.random() * 99)}`;
