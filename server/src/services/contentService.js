import { unwrap } from '../lib/db.js';

// Une entrée par collection du « pack de contenu » envoyé au client.
// Les clés correspondent aux magasins IndexedDB du client.
const COLLECTIONS = [
  { key: 'subjects', table: 'subjects', published: false, columns: 'id, slug, name, icon, position' },
  {
    key: 'courses',
    table: 'courses',
    published: true,
    columns: 'id, subject_id, slug, title, summary, body_md, grade_level, position',
  },
  {
    key: 'simulations',
    table: 'simulations',
    published: true,
    columns: 'id, subject_id, slug, title, description, grade_level, config, position',
  },
  {
    // `answer_key` est inclus : la correction automatique doit marcher hors ligne.
    key: 'exercises',
    table: 'exercises',
    published: true,
    columns:
      'id, course_id, simulation_id, slug, title, statement, kind, options, answer_key, hints, difficulty, estimated_minutes, position',
  },
  { key: 'faq', table: 'faq_entries', published: true, columns: 'id, subject_id, question, answer, keywords' },
];

export async function getContentVersion(db) {
  return unwrap(await db.rpc('content_version'));
}

export async function getContentPack(db) {
  const [version, ...rows] = await Promise.all([
    getContentVersion(db),
    ...COLLECTIONS.map(({ table, columns, published }) => {
      const query = db.from(table).select(columns);
      return published ? query.eq('published', true) : query;
    }),
  ]);

  const pack = { version };
  COLLECTIONS.forEach(({ key }, index) => {
    pack[key] = unwrap(rows[index]);
  });
  return pack;
}
