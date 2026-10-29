// Espace enseignant. En mode démo, les créations / modifications / suppressions sont LOCALES et TEMPORAIRES.
import { isDemoMode } from '../config.js';
import { DEMO_TEACHER, demoDelay, getDemoState, newDemoId, setDemoState } from '../data/demo-data.js';
import { ApiError, del, get, post, put } from './api-client.js';
import { ENDPOINTS } from './endpoints.js';

export async function getTeacherOverview() {
  if (!isDemoMode()) return get(ENDPOINTS.teacherOverview);
  return demoDelay({ ...DEMO_TEACHER, activities: getDemoState('activities', DEMO_TEACHER.activities) });
}

export async function getStudent(id) {
  if (!isDemoMode()) return get(ENDPOINTS.teacherStudent(id));
  const student = DEMO_TEACHER.students.find((s) => s.id === id);
  if (!student) throw new ApiError('Élève introuvable.', { status: 404 });
  return demoDelay(student, 200);
}

export async function createActivity(input) {
  if (!isDemoMode()) return post(ENDPOINTS.teacherActivities, input);
  const created = { ...input, id: newDemoId('act') };
  setDemoState('activities', [...getDemoState('activities', DEMO_TEACHER.activities), created]);
  return demoDelay(created);
}

export async function updateActivity(id, input) {
  if (!isDemoMode()) return put(ENDPOINTS.teacherActivity(id), input);
  setDemoState('activities', getDemoState('activities', DEMO_TEACHER.activities).map((a) => (a.id === id ? { ...a, ...input } : a)));
  return demoDelay({ id, ...input });
}

export async function deleteActivity(id) {
  if (!isDemoMode()) return del(ENDPOINTS.teacherActivity(id));
  setDemoState('activities', getDemoState('activities', DEMO_TEACHER.activities).filter((a) => a.id !== id));
  return demoDelay({ ok: true });
}
