/** Point d'entrée public de la couche de données EduLab AI. */
export { configureEduLab } from './config.js';
export { ApiError } from './api.js';

export { signUp, signIn, signOut, getSession, getProfile, onAuthChange } from './auth.js';
export { listClasses, createClass, joinClass, getClassProgress } from './classesApi.js';

export {
  syncContent,
  hasLocalContent,
  getSubjects,
  getCoursesBySubject,
  getCourse,
  getSimulationsBySubject,
  getSimulation,
  getExercisesForCourse,
  getExercisesForSimulation,
  getExercise,
} from './content/contentRepository.js';

export {
  recordAttempt,
  getAttemptHistory,
  getProgressSummary,
  summarizeAttempts,
} from './results/attemptsRepository.js';

export { startAutoSync, syncNow, subscribeSyncStatus } from './sync/syncManager.js';
export { isOnline, onConnectivityChange } from './connectivity.js';

export { askAssistant } from './assistant/assistantClient.js';
export { gradeExercise, parseDecimal } from './grading.js';
export { registerServiceWorker } from './registerServiceWorker.js';
