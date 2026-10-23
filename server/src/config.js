import { z } from 'zod';

const DEFAULT_ANTHROPIC_MODEL = 'claude-haiku-5-5';

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().positive().default(3000),
    CORS_ORIGINS: z.string().default('http://localhost:5173'),
    SUPABASE_URL: z.url(),
    SUPABASE_ANON_KEY: z.string().min(1),

    // Fournisseur d'IA : "anthropic" ou "openai-compatible" (Gemini, Groq, OpenRouter…)
    AI_PROVIDER: z.enum(['anthropic', 'openai-compatible']).default('anthropic'),
    ANTHROPIC_API_KEY: z.string().min(1).optional(),
    AI_API_KEY: z.string().min(1).optional(),
    AI_BASE_URL: z.url().optional(),
    AI_MODEL: z.string().min(1).optional(),
    AI_MAX_OUTPUT_TOKENS: z.coerce.number().int().positive().default(1024),
    AI_RATE_LIMIT_PER_MINUTE: z.coerce.number().int().positive().default(10),
  })
  .superRefine((env, ctx) => {
    const required =
      env.AI_PROVIDER === 'anthropic' ? ['ANTHROPIC_API_KEY'] : ['AI_API_KEY', 'AI_BASE_URL', 'AI_MODEL'];
    for (const name of required) {
      if (!env[name]) {
        ctx.addIssue({
          code: 'custom',
          path: [name],
          message: `obligatoire quand AI_PROVIDER=${env.AI_PROVIDER}`,
        });
      }
    }
  });

/** Une variable laissée vide dans .env (« AI_BASE_URL= ») est traitée comme absente. */
const withoutEmptyValues = (env) => Object.fromEntries(Object.entries(env).filter(([, value]) => value !== ''));

/**
 * Valide les variables d'environnement une seule fois, au démarrage.
 * Une configuration invalide arrête le serveur avec un message lisible.
 */
export function loadConfig(env = process.env) {
  const result = envSchema.safeParse(withoutEmptyValues(env));
  if (!result.success) {
    const problems = result.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    throw new Error(`Configuration invalide :\n${problems}`);
  }
  const config = result.data;
  return Object.freeze({
    ...config,
    AI_MODEL: config.AI_MODEL ?? DEFAULT_ANTHROPIC_MODEL,
    corsOrigins: config.CORS_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean),
  });
}