import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createOpenAiCompatibleProvider } from '../src/ai/openAiCompatibleProvider.js';
import { loadConfig } from '../src/config.js';

const baseEnv = { SUPABASE_URL: 'https://x.supabase.co', SUPABASE_ANON_KEY: 'k' };

describe('createOpenAiCompatibleProvider', () => {
  it('envoie le message système puis la conversation, et lit la réponse', async () => {
    let captured;
    const fetchImpl = async (url, init) => {
      captured = { url, init, body: JSON.parse(init.body) };
      return { ok: true, json: async () => ({ choices: [{ message: { content: '  Bonjour !  ' } }] }) };
    };
    const provider = createOpenAiCompatibleProvider({
      apiKey: 'secret', baseUrl: 'https://api.example.com/v1/', model: 'm', maxTokens: 50, fetchImpl,
    });

    const answer = await provider.complete({ system: 'SYS', messages: [{ role: 'user', content: 'Q' }] });

    assert.equal(answer, 'Bonjour !');
    assert.equal(captured.url, 'https://api.example.com/v1/chat/completions');
    assert.equal(captured.init.headers.Authorization, 'Bearer secret');
    assert.deepEqual(captured.body.messages, [
      { role: 'system', content: 'SYS' },
      { role: 'user', content: 'Q' },
    ]);
  });

  it('lève une erreur lisible quand le fournisseur répond une erreur HTTP', async () => {
    const fetchImpl = async () => ({ ok: false, status: 429, text: async () => 'quota dépassé' });
    const provider = createOpenAiCompatibleProvider({ apiKey: 'k', baseUrl: 'https://a.b', model: 'm', maxTokens: 5, fetchImpl });
    await assert.rejects(() => provider.complete({ system: 's', messages: [] }), /HTTP 429.*quota/);
  });

  it('renvoie une chaîne vide si la réponse n\'a pas de contenu', async () => {
    const fetchImpl = async () => ({ ok: true, json: async () => ({ choices: [] }) });
    const provider = createOpenAiCompatibleProvider({ apiKey: 'k', baseUrl: 'https://a.b', model: 'm', maxTokens: 5, fetchImpl });
    assert.equal(await provider.complete({ system: 's', messages: [] }), '');
  });
});

describe('loadConfig (fournisseur d\'IA)', () => {
  it('anthropic par défaut : exige ANTHROPIC_API_KEY', () => {
    assert.throws(() => loadConfig(baseEnv), /ANTHROPIC_API_KEY/);
    assert.equal(loadConfig({ ...baseEnv, ANTHROPIC_API_KEY: 'k' }).AI_PROVIDER, 'anthropic');
  });

  it('openai-compatible : exige clé, adresse et modèle', () => {
    assert.throws(() => loadConfig({ ...baseEnv, AI_PROVIDER: 'openai-compatible' }), /AI_API_KEY[\s\S]*AI_BASE_URL[\s\S]*AI_MODEL/);
    const config = loadConfig({
      ...baseEnv, AI_PROVIDER: 'openai-compatible', AI_API_KEY: 'k', AI_BASE_URL: 'https://a.b/v1', AI_MODEL: 'gemini-x',
    });
    assert.equal(config.AI_MODEL, 'gemini-x');
  });

  it('traite une variable vide comme absente', () => {
    assert.throws(() => loadConfig({ ...baseEnv, ANTHROPIC_API_KEY: '' }), /ANTHROPIC_API_KEY/);
  });
});