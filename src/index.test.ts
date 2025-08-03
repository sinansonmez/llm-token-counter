import {
  countTokens,
  countChatTokens,
  estimateCost,
  estimateChatCost,
  checkTokenLimit,
  getSupportedModels,
  getModelsByProvider
} from './index';
import { Message } from './types';

describe('llm-token-counter', () => {
  describe('countTokens', () => {
    it('should count tokens for simple text', () => {
      const result = countTokens('Hello world');
      expect(result.tokens).toBeGreaterThan(0);
      expect(result.characters).toBe(11);
    });

    it('should return zero for empty text', () => {
      const result = countTokens('');
      expect(result.tokens).toBe(0);
      expect(result.characters).toBe(0);
    });

    it('should handle different models', () => {
      const text = 'This is a test message for token counting.';
      const gpt4Result = countTokens(text, { model: 'gpt-4.1' });
      const gpt35Result = countTokens(text, { model: 'gpt-3.5-turbo' });

      expect(gpt4Result.tokens).toBeGreaterThan(0);
      expect(gpt35Result.tokens).toBeGreaterThan(0);
      expect(gpt4Result.characters).toBe(text.length);
      expect(gpt35Result.characters).toBe(text.length);
    });

    it('should use approximation for non-OpenAI models', () => {
      const text = 'Test message';
      const result = countTokens(text, { model: 'claude-3.5-haiku' });

      expect(result.tokens).toBeGreaterThan(0);
      expect(result.characters).toBe(text.length);
    });

    it('should use approximation when requested', () => {
      const text = 'Test message';
      const result = countTokens(text, {
        model: 'gpt-4o-mini',
        approximateOnly: true
      });

      expect(result.tokens).toBeGreaterThan(0);
      expect(result.characters).toBe(text.length);
    });
  });

  describe('countChatTokens', () => {
    const messages: Message[] = [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: 'Hello, how are you?' },
      { role: 'assistant', content: 'I am doing well, thank you!' }
    ];

    it('should count tokens for chat messages', () => {
      const result = countChatTokens(messages);

      expect(result.tokens).toBeGreaterThan(0);
      expect(result.characters).toBeGreaterThan(0);
    });

    it('should add overhead for message formatting', () => {
      const singleMessage: Message[] = [
        { role: 'user', content: 'Hello' }
      ];

      const singleResult = countTokens('Hello');
      const chatResult = countChatTokens(singleMessage);

      // Chat should have more tokens due to formatting overhead
      expect(chatResult.tokens).toBeGreaterThan(singleResult.tokens);
    });

    it('should handle empty messages', () => {
      const result = countChatTokens([]);
      expect(result.tokens).toBeGreaterThanOrEqual(0);
      expect(result.characters).toBe(0);
    });

    it('should handle messages with names', () => {
      const messagesWithName: Message[] = [
        { role: 'user', content: 'Hello', name: 'john' }
      ];

      const result = countChatTokens(messagesWithName);
      expect(result.tokens).toBeGreaterThan(0);
    });
  });

  describe('estimateCost', () => {
    it('should estimate cost for input only', () => {
      const result = estimateCost('Hello world', { model: 'gpt-4o-mini' });

      expect(result.inputTokens).toBeGreaterThan(0);
      expect(result.inputCost).toBeGreaterThan(0);
      expect(result.outputTokens).toBeUndefined();
      expect(result.outputCost).toBeUndefined();
      expect(result.totalCost).toBe(result.inputCost);
      expect(result.currency).toBe('USD');
    });

    it('should estimate cost for input and output', () => {
      const result = estimateCost('Hello world', {
        model: 'gpt-4o-mini',
        outputTokens: 50
      });

      const expected = Number((result.inputCost + (result.outputCost ?? 0)).toFixed(7))

      expect(result.inputTokens).toBeGreaterThan(0);
      expect(result.outputTokens).toBe(50);
      expect(result.inputCost).toBeGreaterThan(0);
      expect(result.outputCost).toBeGreaterThan(0);
      expect(result.totalCost).toBe(expected);
    });

    it('should handle different models with different pricing', () => {
      const text = 'This is a test message';

      const cheapResult = estimateCost(text, { model: 'gpt-4o-mini' });
      const expensiveResult = estimateCost(text, { model: 'gpt-4.1' });

      expect(expensiveResult.totalCost).toBeGreaterThan(cheapResult.totalCost);
    });

    it('should handle embedding models (no output cost)', () => {
      const result = estimateCost('Hello world', {
        model: 'text-embedding-3-small'
      });

      expect(result.inputCost).toBeGreaterThan(0);
      expect(result.outputCost).toBeUndefined();
      expect(result.totalCost).toBe(result.inputCost);
    });
  });

  describe('estimateChatCost', () => {
    const messages: Message[] = [
      { role: 'user', content: 'Hello' },
      { role: 'assistant', content: 'Hi there!' }
    ];

    it('should estimate cost for chat messages', () => {
      const result = estimateChatCost(messages);

      expect(result.inputTokens).toBeGreaterThan(0);
      expect(result.inputCost).toBeGreaterThan(0);
      expect(result.totalCost).toBeGreaterThan(0);
    });

    it('should include output tokens if specified', () => {
      const result = estimateChatCost(messages, { outputTokens: 25 });

      expect(result.outputTokens).toBe(25);
      expect(result.outputCost).toBeGreaterThan(0);
    });
  });

  describe('checkTokenLimit', () => {
    it('should check if text is within token limit', () => {
      const shortText = 'Hello';
      const result = checkTokenLimit(shortText, { model: 'gpt-4o-mini' });

      expect(result.withinLimit).toBe(true);
      expect(result.tokens).toBeGreaterThan(0);
      expect(result.maxTokens).toBe(128000);
      expect(result.percentageUsed).toBeLessThan(1);
      expect(result.tokensRemaining).toBeGreaterThan(127000);
    });

    it('should calculate percentage correctly', () => {
      const text = 'Hello world';
      const result = checkTokenLimit(text, { model: 'gpt-4.1' });

      expect(result.percentageUsed).toBeGreaterThanOrEqual(0);
      expect(result.percentageUsed).toBeLessThanOrEqual(100);
    });
  });

  describe('utility functions', () => {
    it('should return supported models', () => {
      const models = getSupportedModels();

      expect(Array.isArray(models)).toBe(true);
      expect(models.length).toBeGreaterThan(0);
      expect(models).toContain('gpt-4o-mini');
      expect(models).toContain('claude-3.5-haiku');
    });

    it('should return models by provider', () => {
      const openaiModels = getModelsByProvider('OpenAI');
      const anthropicModels = getModelsByProvider('Anthropic');

      expect(openaiModels).toContain('gpt-4o-mini');
      expect(openaiModels).toContain('gpt-4.1');
      expect(anthropicModels).toContain('claude-3.5-haiku');
      expect(anthropicModels).toContain('claude-4-opus');
    });

    it('should handle case-insensitive provider search', () => {
      const models1 = getModelsByProvider('openai');
      const models2 = getModelsByProvider('OpenAI');

      expect(models1).toEqual(models2);
    });
  });

  describe('error handling', () => {
    it('should throw error for unsupported model', () => {
      expect(() => {
        countTokens('Hello', { model: 'unsupported-model' });
      }).toThrow('Unsupported model');
    });

    it('should handle null/undefined text gracefully', () => {
      const result1 = countTokens(null as any);
      const result2 = countTokens(undefined as any);

      expect(result1.tokens).toBe(0);
      expect(result2.tokens).toBe(0);
    });
  });

  describe('edge cases', () => {
    it('should handle very long text', () => {
      const longText = 'Hello '.repeat(10000);
      const result = countTokens(longText);

      expect(result.tokens).toBeGreaterThan(1000);
      expect(result.characters).toBe(longText.length);
    });

    it('should handle special characters and emojis', () => {
      const specialText = 'Hello 👋 世界 🌍 مرحبا';
      const result = countTokens(specialText);

      expect(result.tokens).toBeGreaterThan(0);
      expect(result.characters).toBe(specialText.length);
    });

    it('should handle code and markdown', () => {
      const codeText = '```javascript\nconst x = 42;\nconsole.log(x);\n```';
      const result = countTokens(codeText);

      expect(result.tokens).toBeGreaterThan(0);
      expect(result.characters).toBe(codeText.length);
    });
  });
});
