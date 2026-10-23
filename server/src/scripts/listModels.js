/**
 * Affiche les modèles disponibles pour ta clé d'IA (fournisseur compatible OpenAI).
 * Usage : npm run ai:models
 */
const baseUrl = process.env.AI_BASE_URL;
const apiKey = process.env.AI_API_KEY;

if (!baseUrl || !apiKey) {
  console.error('Renseigne AI_BASE_URL et AI_API_KEY dans server/.env, puis relance.');
  process.exit(1);
}

const response = await fetch(`${baseUrl.replace(/\/+$/, '')}/models`, {
  headers: { Authorization: `Bearer ${apiKey}` },
});
if (!response.ok) {
  console.error(`Erreur HTTP ${response.status} : ${(await response.text()).slice(0, 300)}`);
  process.exit(1);
}

const { data } = await response.json();
console.log('Modèles disponibles (copie un nom dans AI_MODEL) :\n');
for (const model of data) console.log(`  ${String(model.id).replace(/^models\//, '')}`);