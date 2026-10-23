import { unwrap } from '../lib/db.js';
import { notFoundError } from '../lib/httpErrors.js';

const CLASS_COLUMNS = 'id, name, grade_level, join_code, created_at';

// Seuils de la règle métier « statut d'un élève » (affichée dans l'espace enseignant).
const ON_TRACK_MIN_SCORE = 70;
const WATCH_MIN_SCORE = 50;

/** inactive : aucun essai · on_track : à l'aise · watch : à surveiller · struggling : en difficulté */
export function computeStudentStatus({ attempts_count: attemptsCount, average_score: averageScore }) {
  if (!attemptsCount) return 'inactive';
  if (averageScore >= ON_TRACK_MIN_SCORE) return 'on_track';
  if (averageScore >= WATCH_MIN_SCORE) return 'watch';
  return 'struggling';
}

export async function listClasses(db) {
  return unwrap(await db.from('classes').select(CLASS_COLUMNS).order('created_at', { ascending: false }));
}

export async function createClass(db, teacherId, { name, grade_level: gradeLevel }) {
  return unwrap(
    await db
      .from('classes')
      .insert({ teacher_id: teacherId, name, grade_level: gradeLevel ?? null })
      .select(CLASS_COLUMNS)
      .single(),
  );
}

export async function joinClass(db, code) {
  const classId = unwrap(await db.rpc('join_class', { p_code: code }));
  return { class_id: classId };
}

export async function getClassProgress(db, classId) {
  const klass = unwrap(await db.from('classes').select(CLASS_COLUMNS).eq('id', classId).maybeSingle());
  if (!klass) throw notFoundError('Classe');

  const students = unwrap(
    await db
      .from('class_student_progress')
      .select('student_id, full_name, attempts_count, activities_done, average_score, last_activity_at')
      .eq('class_id', classId)
      .order('full_name'),
  );

  return {
    class: klass,
    students: students.map((student) => ({ ...student, status: computeStudentStatus(student) })),
  };
}
