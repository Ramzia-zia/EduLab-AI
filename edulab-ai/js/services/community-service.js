import { isDemoMode } from '../config.js';
import { DEMO_POSTS, DEMO_REPLIES, demoDelay, getDemoState, newDemoId, setDemoState } from '../data/demo-data.js';
import { get, post } from './api-client.js';
import { ENDPOINTS } from './endpoints.js';
import { getCurrentUser } from './auth-service.js';

export async function listPosts({ q = '', category = '', sort = 'recent' } = {}) {
  if (!isDemoMode()) return get(ENDPOINTS.posts, { params: { q, category, sort } });
  return demoDelay(getDemoState('posts', DEMO_POSTS)); // filtré et trié côté page en mode démo
}

export async function createPost({ title, body, category }) {
  if (!isDemoMode()) return post(ENDPOINTS.posts, { title, body, category });
  const user = await getCurrentUser();
  const posts = getDemoState('posts', DEMO_POSTS);
  const created = { id: newDemoId('p'), category, title, body, author: `${user.firstName} ${user.lastName}`, createdAt: new Date().toISOString(), likes: 0 };
  setDemoState('posts', [created, ...posts]);
  return demoDelay(created);
}

export async function listReplies(postId) {
  if (!isDemoMode()) return get(ENDPOINTS.replies(postId));
  return demoDelay(getDemoState('replies', DEMO_REPLIES).filter((r) => r.postId === postId), 200);
}

export async function createReply(postId, body) {
  if (!isDemoMode()) return post(ENDPOINTS.replies(postId), { body });
  const user = await getCurrentUser();
  const replies = getDemoState('replies', DEMO_REPLIES);
  const created = { id: newDemoId('rp'), postId, body, author: `${user.firstName} ${user.lastName}`, createdAt: new Date().toISOString() };
  setDemoState('replies', [...replies, created]);
  return demoDelay(created);
}

// Nombre de réponses par discussion (démo : calculé localement)
export const countReplies = (postId) => getDemoState('replies', DEMO_REPLIES).filter((r) => r.postId === postId).length;
