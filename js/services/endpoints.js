// ============================================================================
// ROUTES DE L'API — HYPOTHÈSES À CONFIRMER AVEC L'ÉQUIPE BACKEND
// Les routes définitives ne sont pas connues. Elles sont toutes ici : quand le backend sera prêt,
// on corrige CE fichier seulement (les pages HTML ne changent pas). Voir docs/API.md.
// ============================================================================
export const ENDPOINTS = {
  login: '/auth/login',
  logout: '/auth/logout',
  register: '/auth/register',
  forgotPassword: '/auth/forgot-password',
  me: '/me',
  changePassword: '/me/password',
  exportMyData: '/me/export',
  dashboard: '/me/dashboard',
  progress: '/me/progress',
  simulations: '/simulations',
  simulation: (id) => `/simulations/${encodeURIComponent(id)}`,
  simulationResults: (id) => `/simulations/${encodeURIComponent(id)}/results`,
  courses: '/courses',
  assistant: '/assistant/messages',
  posts: '/community/posts',
  replies: (postId) => `/community/posts/${encodeURIComponent(postId)}/replies`,
  teacherOverview: '/teacher/overview',
  teacherStudent: (id) => `/teacher/students/${encodeURIComponent(id)}`,
  teacherActivities: '/teacher/activities',
  teacherActivity: (id) => `/teacher/activities/${encodeURIComponent(id)}`,
};
