/**
 * @file AI Model Configuration
 * @description Central configuration for AI model selection and usage logging.
 * Change model assignments here to swap providers/models globally.
 *
 * @requires GOOGLE_GENERATIVE_AI_API_KEY environment variable (for extraction)
 * @requires ANTHROPIC_API_KEY environment variable (for briefings)
 */
import { google } from '@ai-sdk/google';
import { anthropic } from '@ai-sdk/anthropic';

/** Model assignments - change here to swap models globally */
export const MODELS = {
  /** Used for voice note and image extraction (structured JSON output) */
  extraction: google('gemini-2.5-flash-preview-05-20'),
  /** Used for contact briefing generation (needs more nuance/creativity) */
  briefing: anthropic('claude-haiku-4-5-20241022'),
} as const;

/** Cost estimates per model (per token, for logging) */
const MODEL_COSTS: Record<string, { input: number; output: number }> = {
  'gemini-2.5-flash-preview-05-20': { input: 0.15e-6, output: 0.60e-6 },
  'claude-haiku-4-5-20241022': { input: 1.0e-6, output: 5.0e-6 },
};

/** Log AI usage for cost tracking via Vercel logs */
export function logUsage(
  functionName: string,
  modelId: string,
  usage: { inputTokens: number | undefined; outputTokens: number | undefined }
): void {
  const costs = MODEL_COSTS[modelId] || { input: 0, output: 0 };
  const inputTokens = usage.inputTokens ?? 0;
  const outputTokens = usage.outputTokens ?? 0;
  const estimatedCost =
    inputTokens * costs.input + outputTokens * costs.output;
  console.log(
    JSON.stringify({
      event: 'ai_usage',
      function: functionName,
      model: modelId,
      inputTokens,
      outputTokens,
      estimatedCostUsd: Number(estimatedCost.toFixed(6)),
    })
  );
}
