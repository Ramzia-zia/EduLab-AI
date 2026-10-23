/** Journal structuré (une ligne JSON par événement), facile à filtrer en production. */
function write(level, message, fields = {}) {
  const line = JSON.stringify({ level, time: new Date().toISOString(), message, ...fields });
  (level === 'error' ? console.error : console.log)(line);
}

export function serializeError(error) {
  if (!(error instanceof Error)) return { message: String(error) };
  return { name: error.name, message: error.message, stack: error.stack };
}

export const logger = {
  info: (message, fields) => write('info', message, fields),
  warn: (message, fields) => write('warn', message, fields),
  error: (message, fields) => write('error', message, fields),
};
