import { apiFetch } from '../api.js';
import {
  getAll,
  getAllByIndex,
  get,
  getMeta,
  replaceContent,
  STORES,
} from '../storage/idb.js';

const byPosition = (a, b) => (a.position ?? 0) - (b.position ?? 0);

/**
 * Met à jour le contenu local si le serveur en propose une nouvelle version.
 * Un seul petit appel suffit quand rien n'a changé.
 */
export async function syncContent({ force = false } = {}) {
  const { version: remoteVersion } = await apiFetch('/content/version');
  const localVersion = await getMeta('content_version');
  if (!force && remoteVersion === localVersion) return { updated: false, version: remoteVersion };

  const pack = await apiFetch('/content');
  await replaceContent(
    {
      [STORES.SUBJECTS]: pack.subjects,
      [STORES.COURSES]: pack.courses,
      [STORES.SIMULATIONS]: pack.simulations,
      [STORES.EXERCISES]: pack.exercises,
      [STORES.FAQ]: pack.faq,
    },
    pack.version,
  );
  return { updated: true, version: pack.version };
}

/** Vrai si un contenu a déjà été téléchargé (l'application est utilisable hors ligne). */
export async function hasLocalContent() {
  return (await getMeta('content_version')) !== null;
}

export async function getSubjects() {
  return (await getAll(STORES.SUBJECTS)).sort(byPosition);
}

export async function getCoursesBySubject(subjectId) {
  return (await getAllByIndex(STORES.COURSES, 'subject_id', subjectId)).sort(byPosition);
}

export async function getCourse(courseId) {
  return (await get(STORES.COURSES, courseId)) ?? null;
}

export async function getSimulationsBySubject(subjectId) {
  return (await getAllByIndex(STORES.SIMULATIONS, 'subject_id', subjectId)).sort(byPosition);
}

export async function getSimulation(simulationId) {
  return (await get(STORES.SIMULATIONS, simulationId)) ?? null;
}

export async function getExercisesForCourse(courseId) {
  return (await getAllByIndex(STORES.EXERCISES, 'course_id', courseId)).sort(byPosition);
}

export async function getExercisesForSimulation(simulationId) {
  return (await getAllByIndex(STORES.EXERCISES, 'simulation_id', simulationId)).sort(byPosition);
}

/** Contient `answer_key` : ne jamais l'afficher à l'élève. */
export async function getExercise(exerciseId) {
  return (await get(STORES.EXERCISES, exerciseId)) ?? null;
}
