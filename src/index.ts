import { encoding_for_model, get_encoding } from 'tiktoken';
import { getModelConfig, getModelsByProvider, getSupportedModels } from './models';
import {
  CostEstimate,
  CostOptions,
  CountOptions,
  Message,
  TokenCount
} from './types';

/**
 * Count tokens in text for a specific model
 * @param text - The text to count tokens for
 * @param options - Configuration options
 * @returns Token count information
 */
export function countTokens(text: string, options: CountOptions = {}): TokenCount {
  const { model = 'gpt-4o-mini', approximateOnly = false } = options;

  if (!text || typeof text !== 'string') {
    return { tokens: 0, characters: 0 };
  }

  const modelConfig = getModelConfig(model);
  let tokenCount: number;

  try {
    // Use precise tokenization for OpenAI models
    if (modelConfig.provider === 'OpenAI' && modelConfig.encoding && !approximateOnly) {
      let encoder;
      try {
        encoder = encoding_for_model(model as any);
      } catch {
        // Fallback to encoding name if model not recognized
        encoder = get_encoding(modelConfig.encoding as any);
      }

      const tokens = encoder.encode(text);
      tokenCount = tokens.length;
      encoder.free();
    } else {
      // Use approximation for other providers or when requested
      tokenCount = approximateTokenCount(text);
    }
  } catch (error) {
    // Fallback to approximation if tiktoken fails
    tokenCount = approximateTokenCount(text);
  }

  return {
    tokens: tokenCount,
    characters: text.length
  };
}

/**
 * Count tokens for chat messages (includes message formatting overhead)
 * @param messages - Array of chat messages
 * @param options - Configuration options
 * @returns Token count information
 */
export function countChatTokens(messages: Message[], options: CountOptions = {}): TokenCount {
  const { model = 'gpt-4o-mini' } = options;
  const modelConfig = getModelConfig(model);

  let totalTokens = 0;
  let totalCharacters = 0;

  for (const message of messages) {
    const content = message.content || '';
    const { tokens, characters } = countTokens(content, options);

    totalTokens += tokens;
    totalCharacters += characters;

    // Add overhead for message formatting (varies by provider)
    if (modelConfig.provider === 'OpenAI') {
      totalTokens += 4; // <|start|>{role/name}\n{content}<|end|>\n
      if (message.name) {
        totalTokens += countTokens(message.name, options).tokens;
      }
    } else if (modelConfig.provider === 'Anthropic') {
      totalTokens += 3; // Approximate overhead for Claude format
    } else {
      totalTokens += 2; // Generic overhead
    }
  }

  // Add conversation-level overhead
  if (modelConfig.provider === 'OpenAI') {
    totalTokens += 3; // Conversation primer tokens
  }

  return {
    tokens: totalTokens,
    characters: totalCharacters
  };
}

/**
 * Estimate cost for a given number of tokens
 * @param text - The text to estimate cost for
 * @param options - Configuration options including output tokens
 * @returns Cost estimation
 */
export function estimateCost(text: string, options: CostOptions = {}): CostEstimate {
  const { model = 'gpt-4o-mini', outputTokens = 0 } = options;
  const modelConfig = getModelConfig(model);
  const { tokens: inputTokens } = countTokens(text, options);

  const inputCost = (inputTokens / 1_000_000) * modelConfig.pricing.inputPrice;
  const outputCost = outputTokens > 0 ? (outputTokens / 1_000_000) * modelConfig.pricing.outputPrice : 0;
  const totalCost = inputCost + outputCost;

  // Helper function to round to 5 decimal places for clean cost display
  const roundCost = (cost: number) => Number(cost.toFixed(8));

  return {
    inputTokens,
    outputTokens: outputTokens > 0 ? outputTokens : undefined,
    inputCost: roundCost(inputCost),
    outputCost: outputTokens > 0 ? roundCost(outputCost) : undefined,
    totalCost: roundCost(totalCost),
    currency: modelConfig.pricing.currency
  };
}

/**
 * Estimate cost for chat messages
 * @param messages - Array of chat messages
 * @param options - Configuration options
 * @returns Cost estimation
 */
export function estimateChatCost(messages: Message[], options: CostOptions = {}): CostEstimate {
  const { outputTokens = 0 } = options;
  const { tokens: inputTokens } = countChatTokens(messages, options);

  // Create a temporary text for cost calculation
  const tempText = messages.map(m => m.content).join('');
  return estimateCost(tempText, { ...options, outputTokens });
}

/**
 * Check if text exceeds model's token limit
 * @param text - The text to check
 * @param options - Configuration options
 * @returns Object with limit info
 */
export function checkTokenLimit(text: string, options: CountOptions = {}) {
  const { model = 'gpt-4o-mini' } = options;
  const modelConfig = getModelConfig(model);
  const { tokens } = countTokens(text, options);

  return {
    tokens,
    maxTokens: modelConfig.maxTokens,
    withinLimit: tokens <= modelConfig.maxTokens,
    percentageUsed: Math.round((tokens / modelConfig.maxTokens) * 100),
    tokensRemaining: Math.max(0, modelConfig.maxTokens - tokens)
  };
}

/**
 * Approximate token count using character-based estimation
 * More accurate for non-English text and when tiktoken is unavailable
 */
function approximateTokenCount(text: string): number {
  // Rough approximation: 1 token ≈ 4 characters for English
  // Adjust for different languages and special characters
  const baseCount = text.length / 4;

  // Adjust for spaces (typically separate tokens)
  const spaces = (text.match(/\s/g) || []).length;

  // Adjust for punctuation (often separate tokens)
  const punctuation = (text.match(/[.,!?;:()[\]{}'"]/g) || []).length;

  return Math.ceil(baseCount + (spaces * 0.3) + (punctuation * 0.5));
}

// Export utility functions
export { getSupportedModels, getModelsByProvider, getModelConfig };

// Export types
export * from './types';
