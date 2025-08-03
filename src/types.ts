export interface TokenCount {
  tokens: number;
  characters: number;
}

export interface CostEstimate {
  inputTokens: number;
  outputTokens?: number;
  inputCost: number;
  outputCost?: number;
  totalCost: number;
  currency: string;
}

export interface ModelPricing {
  inputPrice: number;  // Price per 1M tokens
  outputPrice: number; // Price per 1M tokens
  currency: string;
}

export interface ModelConfig {
  name: string;
  provider: string;
  encoding?: string;
  maxTokens: number;
  pricing: ModelPricing;
}

export type SupportedModel =
// OpenAI
  | 'gpt-4.1'
  | 'gpt-4o'
  | 'gpt-4o-mini'
  | 'gpt-3.5-turbo'
  | 'text-embedding-3-large'
  | 'text-embedding-3-small'
  | 'text-embedding-ada-002'
  // Anthropic
  | 'claude-4-opus'
  | 'claude-4-sonnet'
  | 'claude-3.5-haiku'
  // Google
  | 'gemini-2.5-pro'
  | 'gemini-2.5-flash'
  | 'gemini-2.5-flash-lite'
  // Custom
  | string;

export interface CountOptions {
  model?: SupportedModel;
  includeSpecialTokens?: boolean;
  approximateOnly?: boolean;
}

export interface CostOptions extends CountOptions {
  outputTokens?: number;
}

export interface Message {
  role: 'system' | 'user' | 'assistant' | 'function';
  content: string;
  name?: string;
}
