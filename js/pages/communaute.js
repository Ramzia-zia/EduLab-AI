// Communauté : discussions, recherche, tri, publication et réponses.
// En démonstration, les publications sont locales et temporaires. Le partage entre utilisateurs nécessite le backend.
import { bootstrap } from '../app.js';
import { isDemoMode } from '../config.js';
import { openModal } from '../components/modal.js';
import { countReplies, createPost, createReply, listPosts, listReplies } from '../services/community-service.js';
import { $, debounce, escapeHtml, formatDate, normalize } from '../utils/dom.js';
import { emptyHtml, errorHtml, loadingHtml, showMessage, toast } from '../utils/notifications.js';
import { rules, validateForm } from '../utils/validation.js';

const CATEGORIES = ['Tout', 'Conseils', 'Questions', 'Témoignages'];
const user = await bootstrap({ roles: ['student', 'teacher'], active: 'community' });
const view = { category: 'Tout', q: '', sort: 'recent' };
let posts = [];

function renderTabs() {
  $('#category-tabs').innerHTML = CATEGORIES.map((c) => `<button type="button" class="tab" role="tab" aria-selected="${view.category === c}" data-category="${c}">${c}</button>`).join('');
}
function repliesCount(p) { return isDemoMode() ? countReplies(p.id) : p.repliesCount ?? null; }

function renderPosts() {
  const q = normalize(view.q);
  const list = posts
    .filter((p) => (view.category === 'Tout' || p.category === view.category) && (!q || normalize(`${p.title} ${p.body}`).includes(q)))
    .sort((a, b) => (view.sort === 'popular' ? b.likes - a.likes : b.createdAt.localeCompare(a.createdAt)));
  $('#posts-list').innerHTML = list.length ? list.map((p) => {
    const n = repliesCount(p);
    return `<li class="card post" data-post="${escapeHtml(p.id)}">
      <div class="post__head"><span class="badge">${escapeHtml(p.category)}</span><span class="text-small text-muted">${escapeHtml(p.author)} · ${formatDate(p.createdAt)}</span></div>
      <h3>${escapeHtml(p.title)}</h3><p class="post__body">${escapeHtml(p.body)}</p>
      <div class="post__actions"><span class="badge">${p.likes} j’aime</span><button type="button" class="btn btn--secondary btn--sm" data-toggle-replies aria-expanded="false">Voir les réponses${n === null ? '' : ` (${n})`}</button></div>
      <div class="replies" hidden></div></li>`;
  }).join('') : emptyHtml('Aucune discussion trouvée', 'Change de catégorie ou publie la première question.');
}

async function load() {
  const state = $('#posts-state');
  state.innerHTML = loadingHtml('Chargement des discussions…');
  try { posts = await listPosts(view); state.innerHTML = ''; renderPosts(); }
  catch (error) { state.innerHTML = `${errorHtml(error.message)}<p><button class="btn btn--secondary" id="retry" type="button">Réessayer</button></p>`; $('#retry').addEventListener('click', load); }
}

async function toggleReplies(button) {
  const post = button.closest('[data-post]'), box = post.querySelector('.replies');
  const open = box.hidden;
  button.setAttribute('aria-expanded', String(open));
  if (!open) { box.hidden = true; return; }
  box.hidden = false;
  box.innerHTML = loadingHtml('Chargement des réponses…');
  try {
    const replies = await listReplies(post.dataset.post);
    box.innerHTML = `${replies.length ? replies.map((r) => `<div class="reply"><strong>${escapeHtml(r.author)} · ${formatDate(r.createdAt)}</strong>${escapeHtml(r.body)}</div>`).join('') : '<p class="text-muted text-small">Aucune réponse pour l’instant.</p>'}
      <form class="reply-form" novalidate><div class="field"><label class="sr-only" for="reply-${escapeHtml(post.dataset.post)}">Ta réponse</label><input class="field__input" id="reply-${escapeHtml(post.dataset.post)}" name="body" placeholder="Écris ta réponse…"></div><button class="btn btn--primary" type="submit">Répondre</button></form>`;
  } catch (error) { box.innerHTML = errorHtml(error.message); }
}

function openPostForm() {
  openModal({
    title: 'Publier une question',
    bodyHtml: `<form id="post-form" novalidate class="stack">
      <div class="field"><label class="field__label" for="category">Catégorie</label><select class="field__input" id="category" name="category">${CATEGORIES.slice(1).map((c) => `<option>${c}</option>`).join('')}</select></div>
      <div class="field"><label class="field__label" for="title">Titre</label><input class="field__input" id="title" name="title" maxlength="120"></div>
      <div class="field"><label class="field__label" for="body">Détails</label><textarea class="field__input" id="body" name="body" maxlength="1000"></textarea></div>
      <div id="post-message" hidden></div></form>`,
    actions: [
      { label: 'Annuler', variant: 'secondary' },
      {
        label: 'Publier', variant: 'primary',
        async onClick({ root }) {
          const { valid, values } = validateForm(root.querySelector('#post-form'), { title: [rules.required('Donne un titre à ta question.'), rules.minLength(5, 'Le titre est trop court.')], body: [rules.required('Explique ta question.')] });
          if (!valid) return false;
          try { await createPost(values); toast(isDemoMode() ? 'Publié localement (démonstration, temporaire).' : 'Question publiée.', 'success'); await load(); }
          catch (error) { showMessage(root.querySelector('#post-message'), error.message, 'error'); return false; }
        },
      },
    ],
  });
}

if (user) {
  if (isDemoMode()) showMessage($('[data-community-note]'), 'Démonstration : les discussions sont locales et temporaires. Le partage entre utilisateurs nécessite le backend.', 'info');
  renderTabs();
  $('#category-tabs').addEventListener('click', (e) => { const t = e.target.closest('[data-category]'); if (t) { view.category = t.dataset.category; renderTabs(); renderPosts(); } });
  $('#post-search').addEventListener('input', debounce((e) => { view.q = e.target.value; renderPosts(); }, 200));
  $('#post-sort').addEventListener('change', (e) => { view.sort = e.target.value; renderPosts(); });
  $('#new-post').addEventListener('click', openPostForm);
  $('#posts-list').addEventListener('click', (e) => { const b = e.target.closest('[data-toggle-replies]'); if (b) toggleReplies(b); });
  $('#posts-list').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target, post = form.closest('[data-post]');
    const { valid, values } = validateForm(form, { body: [rules.required('Écris ta réponse.')] });
    if (!valid) return;
    try { await createReply(post.dataset.post, values.body); toast('Réponse publiée.', 'success'); const open = post.querySelector('[data-toggle-replies]'); open.setAttribute('aria-expanded', 'false'); post.querySelector('.replies').hidden = true; await toggleReplies(open); }
    catch (error) { toast(error.message, 'error'); }
  });
  load();
}
