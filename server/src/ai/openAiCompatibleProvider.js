/**
 * Fournisseur pour toute API compatible avec le format « OpenAI Chat Completions » :
 * Google Gemini, Groq, OpenRouter, Mistral, DeepSeek… Seuls l'adresse, la clé et le
 * nom du modèle changent (variables AI_BASE_URL, AI_API_KEY, AI_MODEL).
 *
 * Même interface que le fournisseur Anthropic : complete({ system, messages }) -> string
 */
export function createOpenAiCompatibleProvider({
  apiKey,
  baseUrl,
  model,
  maxTokens,
  timeoutMs = 20_000,
  fetchImpl = fetch, // injectable pour les tests
}) {
  const endpoint = `${baseUrl.replace(/\/+$/, '')}/chat/completions`;

  return {
    async complete({ system, messages }) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const response = await fetchImpl(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
          body: JSON.stringify({
            model,
            max_tokens: maxTokens,
            messages: [{ role: 'system', content: system }, ...messages],
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          const detail = (await response.text()).slice(0, 300);
          throw new Error(`Fournisseur d'IA : HTTP ${response.status} — ${detail}`);
        }
        const data = await response.json();
        return (data.choices?.[0]?.message?.content ?? '').trim();
      } finally {
        clearTimeout(timer);
      }
    },
  };
}