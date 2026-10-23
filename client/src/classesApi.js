import { apiFetch } from './api.js';

/** Enseignant : ses classes. Élève : les classes rejointes. */
export const listClasses = async () => (await apiFetch('/classes')).classes;

export const createClass = ({ name, gradeLevel }) =>
  apiFetch('/classes', { method: 'POST', body: { name, grade_level: gradeLevel } });

/** Élève : rejoindre une classe avec le code donné par l'enseignant. */
export const joinClass = (code) => apiFetch('/classes/join', { method: 'POST', body: { code } });

/** Enseignant : { class, students: [{ student_id, full_name, average_score, status, ... }] } */
export const getClassProgress = (classId) => apiFetch(`/classes/${encodeURIComponent(classId)}/progress`);
