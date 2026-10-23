/**
 * Banc d'essai : une page minimale pour tester toute la couche de données
 * (comptes, contenu hors ligne, résultats, synchronisation, assistant, classes)
 * sans attendre l'interface de la Personne 1.
 */
import {
  askAssistant, configureEduLab, createClass, getAttemptHistory, getClassProgress, getCoursesBySubject,
  getExercisesForCourse, getExercisesForSimulation, getProfile, getProgressSummary, getSession,
  getSimulationsBySubject, getSubjects, gradeExercise, hasLocalContent, isOnline, joinClass, listClasses,
  onAuthChange, onConnectivityChange, recordAttempt, registerServiceWorker, signIn, signOut, signUp,
  startAutoSync, subscribeSyncStatus, syncContent, syncNow,
} from '../src/index.js';

const $ = (id) => document.getElementById(id);

function el(tag, props = {}, ...children) {
  const node = Object.assign(document.createElement(tag), props);
  node.append(...children);
  return node;
}

function log(message, data) {
  const extra = data === undefined ? '' : ` ${JSON.stringify(data).slice(0, 400)}`;
  $('log').textContent = `[${new Date().toLocaleTimeString()}] ${message}${extra}\n${$('log').textContent}`;
}

/** Exécute une action, journalise le résultat et ne laisse jamais une erreur casser la page. */
async function run(label, action) {
  try {
    const result = await action();
    log(`✅ ${label}`, result);
    return result;
  } catch (error) {
    log(`❌ ${label} : ${error.message}`);
    return undefined;
  }
}

// ---------------------------------------------------------------- démarrage
const env = import.meta.env;
if (!env.VITE_SUPABASE_URL || !env.VITE_SUPABASE_ANON_KEY) {
  log('❌ Fichier client/.env manquant ou incomplet (VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY). Arrête puis relance « npm run dev » après l\'avoir créé.');
  throw new Error('Configuration manquante');
}

configureEduLab({
  apiUrl: env.VITE_API_URL ?? 'http://localhost:3000/api',
  supabaseUrl: env.VITE_SUPABASE_URL,
  supabaseAnonKey: env.VITE_SUPABASE_ANON_KEY,
  syncIntervalMs: 15_000, // plus court que la normale, pour voir la synchro pendant les essais
});

// Le service worker n'est activé que dans la version « build » : en développement,
// il garderait d'anciennes versions des fichiers en cache et fausserait les essais.
if (env.PROD) {
  registerServiceWorker()
    .then((registration) => log(registration ? '✅ Service worker enregistré' : 'Service worker non supporté'))
    .catch((error) => log(`❌ Service worker : ${error.message}`));
} else {
  log('ℹ️ Mode développement : service worker désactivé (utilise « npm run build » puis « npm run preview » pour le tester).');
}

// ------------------------------------------------------------------- état
let currentExercise = null;
let exerciseStartedAt = 0;
const chatHistory = [];

async function refreshLocalState() {
  $('net').textContent = isOnline() ? '🟢 En ligne' : '🔴 Hors ligne';

  const session = await getSession();
  $('who').textContent = session ? `Connecté : ${session.user.email}` : 'Non connecté';
  if (!session) {
    $('localState').textContent = 'Aucune donnée locale (non connecté).';
    return;
  }

  const history = await getAttemptHistory();
  const pending = history.filter((attempt) => attempt.synced === 0).length;
  const rejected = history.filter((attempt) => attempt.synced === 2).length;
  const summary = await getProgressSummary();
  $('localState').textContent =
    `Contenu local : ${(await hasLocalContent()) ? 'oui' : 'non'} · Essais enregistrés : ${history.length} · ` +
    `en attente d'envoi : ${pending}${rejected ? ` · refusés : ${rejected}` : ''} · ` +
    `activités faites : ${summary.activitiesDone} · moyenne : ${summary.averageScore ?? '—'}`;
}

subscribeSyncStatus((status) => {
  $('syncState').textContent =
    `Synchro : ${status.state}` +
    (status.lastSyncAt ? ` · dernière réussie à ${new Date(status.lastSyncAt).toLocaleTimeString()}` : '') +
    (status.lastError ? ` · erreur : ${status.lastError}` : '');
  void refreshLocalState();
});
onConnectivityChange(() => void refreshLocalState());
onAuthChange(() => void refreshLocalState());
startAutoSync();
void refreshLocalState();

// ------------------------------------------------------------------ compte
const credentials = () => ({ email: $('email').value.trim(), password: $('password').value });

$('btnSignUp').onclick = () =>
  run('Inscription', async () => {
    const user = await signUp({ ...credentials(), fullName: $('fullName').value.trim(), role: $('role').value, gradeLevel: 'Seconde' });
    return { id: user?.id, email: user?.email };
  });

$('btnSignIn').onclick = () =>
  run('Connexion', async () => {
    await signIn(credentials());
    return getProfile();
  });

$('btnSignOut').onclick = () => run('Déconnexion', signOut);

// ------------------------------------------------------------- synchronisation
$('btnSync').onclick = () => run('Synchronisation', syncNow);
$('btnForce').onclick = () => run('Contenu retéléchargé', () => syncContent({ force: true }));

// ---------------------------------------------------------------- catalogue
$('btnCatalog').onclick = () =>
  run('Catalogue lu en local', async () => {
    const box = $('catalog');
    box.replaceChildren();
    const subjects = await getSubjects();
    if (subjects.length === 0) {
      box.textContent = 'Aucun contenu local. Connecte-toi (en ligne) puis clique sur « Synchroniser maintenant ».';
      return 0;
    }

    for (const subject of subjects) {
      const courses = await getCoursesBySubject(subject.id);
      const simulations = await getSimulationsBySubject(subject.id);
      const list = el('ul');

      for (const course of courses) {
        for (const exercise of await getExercisesForCourse(course.id)) {
          list.append(exerciseItem(`Cours « ${course.title} »`, exercise));
        }
      }
      for (const simulation of simulations) {
        for (const exercise of await getExercisesForSimulation(simulation.id)) {
          list.append(exerciseItem(`Simulation « ${simulation.title} »`, exercise));
        }
      }
      box.append(el('b', {}, subject.name), list.children.length ? list : el('p', { className: 'muted' }, 'Aucun exercice.'));
    }
    return subjects.length;
  });

function exerciseItem(origin, exercise) {
  const button = el('button', { className: 'secondary' }, 'Faire');
  button.onclick = () => startExercise(exercise);
  return el('li', {}, `${origin} — ${exercise.title} (${exercise.kind}) `, button);
}

// ----------------------------------------------------------------- exercice
function startExercise(exercise) {
  currentExercise = exercise;
  exerciseStartedAt = Date.now();

  const box = $('exercise');
  box.replaceChildren(el('p', {}, el('b', {}, exercise.title)), el('p', {}, exercise.statement));

  if (exercise.kind === 'qcm') {
    exercise.options.forEach((option, index) => {
      const radio = el('input', { type: 'radio', name: 'qcm', value: String(index), style: 'width:auto;margin-right:.4rem' });
      box.append(el('label', { style: 'display:block;margin:.2rem 0' }, radio, option));
    });
  } else {
    box.append(el('input', { id: 'answer', placeholder: 'Ta réponse' }));
  }

  const submit = el('button', {}, 'Valider ma réponse');
  submit.onclick = submitAnswer;
  box.append(submit, el('p', { id: 'verdict' }));
}

async function submitAnswer() {
  const answer = currentExercise.kind === 'qcm'
    ? document.querySelector('input[name="qcm"]:checked')?.value
    : $('answer').value;
  if (answer === undefined || answer === '') {
    $('verdict').textContent = 'Donne une réponse avant de valider.';
    return;
  }

  const { correct, score } = gradeExercise(currentExercise, answer);
  $('verdict').className = correct ? 'ok' : 'bad';
  $('verdict').textContent = correct ? '✅ Bonne réponse !' : '❌ Ce n\'est pas ça. Utilise l\'assistant pour un indice.';

  await run('Essai enregistré localement', async () => {
    const attempt = await recordAttempt({
      exerciseId: currentExercise.id,
      score,
      durationSeconds: (Date.now() - exerciseStartedAt) / 1000,
      payload: { answer: String(answer) },
    });
    await refreshLocalState();
    return { id: attempt.id, score: attempt.score };
  });
}

// ---------------------------------------------------------------- assistant
function addChatLine(role, text, note = '') {
  $('chat').append(el('p', { className: role }, el('b', {}, role === 'student' ? 'Moi : ' : 'Assistant : '), text, note));
  $('chat').scrollTop = $('chat').scrollHeight;
}

const SOURCE_LABELS = {
  online: ' (IA en ligne)',
  offline: ' (réponse locale hors ligne)',
  'offline-no-match': ' (aucune réponse locale)',
};

$('btnAsk').onclick = async () => {
  const message = $('question').value.trim();
  if (!message) return;
  $('question').value = '';
  addChatLine('student', message);

  try {
    const { answer, source } = await askAssistant({
      message,
      exerciseId: currentExercise?.id,
      hintLevel: Number($('hint').value),
      history: chatHistory,
    });
    chatHistory.push({ role: 'student', content: message }, { role: 'assistant', content: answer });
    addChatLine('assistant', answer, SOURCE_LABELS[source]);
    log(`✅ Assistant : source = ${source}`);
  } catch (error) {
    addChatLine('assistant', `⚠️ ${error.message}`);
    log(`❌ Assistant : ${error.message}`);
  }
};

// ------------------------------------------------------------------- classes
$('btnCreateClass').onclick = () => run('Classe créée', () => createClass({ name: $('className').value.trim(), gradeLevel: 'Seconde' }));
$('btnListClasses').onclick = () => run('Mes classes', listClasses);
$('btnJoin').onclick = () => run('Classe rejointe', () => joinClass($('joinCode').value));

$('btnProgress').onclick = () =>
  run('Progression de la classe', async () => {
    const { students } = await getClassProgress($('classId').value.trim());
    const table = el('ul');
    students.forEach((s) =>
      table.append(el('li', {}, `${s.full_name} — essais : ${s.attempts_count} · moyenne : ${s.average_score ?? '—'} · statut : ${s.status}`)),
    );
    $('progress').replaceChildren(table);
    return students.length;
  });
