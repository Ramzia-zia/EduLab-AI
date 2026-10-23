import { createAnthropicProvider } from './provider.js';
import { createOpenAiCompatibleProvider } from './openAiCompatibleProvider.js';

/** Choisit le fournisseur d'IA selon AI_PROVIDER. */
export function createAiProvider(config) {
  if (config.AI_PROVIDER === 'openai-compatible') {
    return createOpenAiCompatibleProvider({
      apiKey: config.AI_API_KEY,
      baseUrl: config.AI_BASE_URL,
      model: config.AI_MODEL,
      maxTokens: config.AI_MAX_OUTPUT_TOKENS,
    });
  }
  return createAnthropicProvider({
    apiKey: config.ANTHROPIC_API_KEY,
    model: config.AI_MODEL,
    maxTokens: config.AI_MAX_OUTPUT_TOKENS,
  });
}