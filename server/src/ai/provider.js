import Anthropic from '@anthropic-ai/sdk';

/**
 * Fournisseur d'IA. L'interface est volontairement minimale :
 *   complete({ system, messages }) -> Promise<string>
 * Changer de fournisseur (ou simuler l'IA dans les tests) revient à fournir
 * un autre objet qui respecte cette signature.
 */
export function createAnthropicProvider({ apiKey, model, maxTokens }) {
  const client = new Anthropic({ apiKey, timeout: 20_000, maxRetries: 1 });

  return {
    async complete({ system, messages }) {
      const response = await client.messages.create({
        model,
        max_tokens: maxTokens,
        system,
        messages,
      });
      return response.content
        .filter((block) => block.type === 'text')
        .map((block) => block.text)
        .join('\n')
        .trim();
    },
  };
}
