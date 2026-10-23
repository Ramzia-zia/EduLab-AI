/**
 * Bus d'événements interne. Il évite les dépendances circulaires :
 * l'enregistrement d'un essai prévient la synchronisation sans l'importer.
 */
export const bus = new EventTarget();

export const EVENTS = Object.freeze({
  ATTEMPT_RECORDED: 'edulab:attempt-recorded',
});
