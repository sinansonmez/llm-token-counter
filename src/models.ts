// Pricing as of 2025 (per 1M tokens in USD)
import { ModelConfig } from "./types";

export const MODEL_CONFIGS: Record<string, ModelConfig> = {
  // OpenAI GPT-4 Models
  'gpt-4.1': {
    name: 'GPT-4.1',
    provider: 'OpenAI',
    encoding: 'o200k_base',
    maxTokens: 1000000,
    pricing: { inputPrice: 2.00, outputPrice: 8.00, currency: 'USD' }
  },
  'gpt-4o': {
    name: 'GPT-4o',
    provider: 'OpenAI',
    encoding: 'o200k_base',
    maxTokens: 128000,
    pricing: { inputPrice: 2.50, outputPrice: 10.00, currency: 'USD' }
  },
  'gpt-4o-mini': {
    name: 'GPT-4o Mini',
    provider: 'OpenAI',
    encoding: 'o200k_base',
    maxTokens: 128000,
    pricing: { inputPrice: 0.10, outputPrice: 0.40, currency: 'USD' }
  },
  'gpt-3.5-turbo': {
    name: 'GPT-3.5 Turbo',
    provider: 'OpenAI',
    encoding: 'cl100k_base',
    maxTokens: 16385,
    pricing: { inputPrice: 0.50, outputPrice: 1.50, currency: 'USD' }
  },

  // OpenAI Embedding Models
  'text-embedding-3-large': {
    name: 'Text Embedding 3 Large',
    provider: 'OpenAI',
    encoding: 'cl100k_base',
    maxTokens: 8191,
    pricing: { inputPrice: 0.13, outputPrice: 0, currency: 'USD' }
  },
  'text-embedding-3-small': {
    name: 'Text Embedding 3 Small',
    provider: 'OpenAI',
    encoding: 'cl100k_base',
    maxTokens: 8191,
    pricing: { inputPrice: 0.02, outputPrice: 0, currency: 'USD' }
  },
  'text-embedding-ada-002': {
    name: 'Text Embedding Ada 002',
    provider: 'OpenAI',
    encoding: 'cl100k_base',
    maxTokens: 8191,
    pricing: { inputPrice: 0.10, outputPrice: 0, currency: 'USD' }
  },

  // Anthropic Claude Models
  'claude-4-opus': {
    name: 'Claude 4 Opus',
    provider: 'Anthropic',
    maxTokens: 200000,
    pricing: { inputPrice: 15.00, outputPrice: 75.00, currency: 'USD' }
  },
  'claude-4-sonnet': {
    name: 'Claude 4 Sonnet',
    provider: 'Anthropic',
    maxTokens: 200000,
    pricing: { inputPrice: 3.00, outputPrice: 15.00, currency: 'USD' }
  },
  'claude-3.5-haiku': {
    name: 'Claude 3.5 Haiku',
    provider: 'Anthropic',
    maxTokens: 200000,
    pricing: { inputPrice: 0.80, outputPrice: 4.00, currency: 'USD' }
  },

  // Google Gemini Models
  'gemini-2.5-pro': {
    name: 'Gemini 2.5 Pro',
    provider: 'Google',
    maxTokens: 200000,
    pricing: { inputPrice: 1.25, outputPrice: 10.00, currency: 'USD' }
  },
  'gemini-2.5-flash': {
    name: 'Gemini 2.5 Flash',
    provider: 'Google',
    maxTokens: 1000000,
    pricing: { inputPrice: 0.10, outputPrice: 0.40, currency: 'USD' }
  },
  'gemini-2.5-flash-lite': {
    name: 'Gemini 2.5 Flash Lite',
    provider: 'Google',
    maxTokens: 32760,
    pricing: { inputPrice: 0.075, outputPrice: 0.30, currency: 'USD' }
  }
};

export function getModelConfig(model: string): ModelConfig {
  const config = MODEL_CONFIGS[model];
  if (!config) {
    throw new Error(`Unsupported model: ${model}. Supported models: ${Object.keys(MODEL_CONFIGS).join(', ')}`);
  }
  return config;
}

export function getSupportedModels(): string[] {
  return Object.keys(MODEL_CONFIGS);
}

export function getModelsByProvider(provider: string): string[] {
  return Object.entries(MODEL_CONFIGS)
    .filter(([, config]) => config.provider.toLowerCase() === provider.toLowerCase())
    .map(([model]) => model);
}
