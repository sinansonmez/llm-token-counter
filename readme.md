# llm-token-counter

A comprehensive TypeScript library for counting tokens and estimating costs across multiple LLM providers (OpenAI, Anthropic, Google, and more).

## 🚀 Features

- **Multi-Provider Support**: OpenAI, Anthropic Claude, Google Gemini
- **Accurate Token Counting**: Uses tiktoken for precise OpenAI models, smart approximation for others
- **Cost Estimation**: Real-time pricing for all major models
- **Chat Message Support**: Handles conversation formatting overhead
- **Token Limit Checking**: Validate against model context windows
- **TypeScript**: Full type safety and intellisense
- **Zero Config**: Works out of the box with sensible defaults

## 📦 Installation

```bash
npm install llm-token-counter
```

## 🎯 Quick Start

```typescript
import { countTokens, estimateCost, getSupportedModels } from 'llm-token-counter';

// Count tokens
const result = countTokens("Hello, how are you today?");
console.log(result); 
// { tokens: 7, characters: 26 }

// Estimate cost
const cost = estimateCost("Write a story about space", { 
  model: 'gpt-4o-mini',
  outputTokens: 500 
});
console.log(cost);
// {
//   inputTokens: 6,
//   outputTokens: 500,
//   inputCost: 0.0000009,
//   outputCost: 0.0003,
//   totalCost: 0.0003009,
//   currency: 'USD'
// }

// See all supported models
console.log(getSupportedModels());
```

## 📖 API Reference

### `countTokens(text, options?)`

Count tokens in a text string.

```typescript
import { countTokens } from 'llm-token-counter';

// Basic usage
countTokens("Hello world");
// { tokens: 2, characters: 11 }

// With specific model
countTokens("Hello world", { model: 'gpt-4' });

// Force approximation (faster, less accurate)
countTokens("Hello world", { 
  model: 'gpt-4o-mini', 
  approximateOnly: true 
});
```

**Parameters:**
- `text` (string): The text to count tokens for
- `options` (object, optional):
    - `model` (string): Model name (default: 'gpt-4o-mini')
    - `approximateOnly` (boolean): Force approximation instead of precise counting
    - `includeSpecialTokens` (boolean): Include special tokens in count

**Returns:** `{ tokens: number, characters: number }`

### `countChatTokens(messages, options?)`

Count tokens for chat conversations with proper message formatting.

```typescript
import { countChatTokens } from 'llm-token-counter';

const messages = [
  { role: 'system', content: 'You are a helpful assistant.' },
  { role: 'user', content: 'Hello!' },
  { role: 'assistant', content: 'Hi there! How can I help?' }
];

const result = countChatTokens(messages, { model: 'gpt-4o-mini' });
console.log(result);
// { tokens: 25, characters: 58 }
```

**Parameters:**
- `messages` (Message[]): Array of chat messages
- `options`: Same as `countTokens`

**Message Format:**
```typescript
interface Message {
  role: 'system' | 'user' | 'assistant' | 'function';
  content: string;
  name?: string;
}
```

### `estimateCost(text, options?)`

Estimate the cost of processing text with a specific model.

```typescript
import { estimateCost } from 'llm-token-counter';

// Input only
const cost1 = estimateCost("Analyze this text", { model: 'gpt-4' });

// Input + estimated output
const cost2 = estimateCost("Write a poem", { 
  model: 'claude-3.5-haiku',
  outputTokens: 200 
});

console.log(cost2);
// {
//   inputTokens: 4,
//   outputTokens: 200,
//   inputCost: 0.0000032,
//   outputCost: 0.0008,
//   totalCost: 0.0008032,
//   currency: 'USD'
// }
```

**Parameters:**
- `text` (string): Input text
- `options` (object, optional):
    - `model` (string): Model name
    - `outputTokens` (number): Expected output length
    - Other options from `countTokens`

### `estimateChatCost(messages, options?)`

Estimate cost for chat conversations.

```typescript
import { estimateChatCost } from 'llm-token-counter';

const messages = [
  { role: 'user', content: 'Explain quantum computing' }
];

const cost = estimateChatCost(messages, {
  model: 'gpt-4o',
  outputTokens: 1000
});
```

### `checkTokenLimit(text, options?)`

Check if text fits within a model's context window.

```typescript
import { checkTokenLimit } from 'llm-token-counter';

const longText = "Very long document...";
const check = checkTokenLimit(longText, { model: 'gpt-4.1' });

console.log(check);
// {
//   tokens: 1500,
//   maxTokens: 1000000,
//   withinLimit: true,
//   percentageUsed: 0,
//   tokensRemaining: 998500
// }
```

## 🤖 Supported Models

### OpenAI
- `gpt-4.1` - GPT-4.1 (1M context)
- `gpt-4o` - GPT-4o (128K context)
- `gpt-4o-mini` - GPT-4o Mini (128K context)
- `gpt-3.5-turbo` - GPT-3.5 Turbo (16K context)
- `text-embedding-3-large` - Text Embedding 3 Large
- `text-embedding-3-small` - Text Embedding 3 Small
- `text-embedding-ada-002` - Text Embedding Ada 002

### Anthropic
- `claude-4-opus` - Claude 4 Opus (200K context)
- `claude-4-sonnet` - Claude 4 Sonnet (200K context)
- `claude-3.5-haiku` - Claude 3.5 Haiku (200K context)

### Google
- `gemini-2.5-pro` - Gemini 2.5 Pro (200K context)
- `gemini-2.5-flash` - Gemini 2.5 Flash (1M context)
- `gemini-2.5-flash-lite` - Gemini 2.5 Flash Lite (32K context)

## 🔧 Utility Functions

```typescript
import { 
  getSupportedModels, 
  getModelsByProvider, 
  getModelConfig 
} from 'llm-token-counter';

// Get all supported models
const allModels = getSupportedModels();
console.log(allModels);
// ['gpt-4.1', 'gpt-4o-mini', 'claude-3.5-haiku', ...]

// Get models by provider
const openaiModels = getModelsByProvider('OpenAI');
const anthropicModels = getModelsByProvider('Anthropic');

// Get detailed model configuration
const config = getModelConfig('gpt-4o-mini');
console.log(config);
// {
//   name: 'GPT-4o Mini',
//   provider: 'OpenAI',
//   encoding: 'o200k_base',
//   maxTokens: 128000,
//   pricing: { inputPrice: 0.10, outputPrice: 0.40, currency: 'USD' }
// }
```

## 💰 Pricing Information

All pricing is per 1 million tokens in USD (as of 2025):

| Model | Input Price | Output Price |
|-------|-------------|--------------|
| GPT-4.1 | $2.00 | $8.00 |
| GPT-4o | $2.50 | $10.00 |
| GPT-4o Mini | $0.10 | $0.40 |
| GPT-3.5 Turbo | $0.50 | $1.50 |
| Claude 4 Opus | $15.00 | $75.00 |
| Claude 4 Sonnet | $3.00 | $15.00 |
| Claude 3.5 Haiku | $0.80 | $4.00 |
| Gemini 2.5 Pro | $1.25 | $10.00 |
| Gemini 2.5 Flash | $0.10 | $0.40 |
| Gemini 2.5 Flash Lite | $0.075 | $0.30 |

## 🎨 Usage Examples

### Cost Comparison Across Models

```typescript
import { estimateCost } from 'llm-token-counter';

const prompt = "Write a detailed analysis of climate change";
const models = ['gpt-4o-mini', 'claude-3.5-haiku', 'gemini-2.5-flash'];

for (const model of models) {
  const cost = estimateCost(prompt, { 
    model, 
    outputTokens: 1000 
  });
  console.log(`${model}: ${cost.totalCost.toFixed(6)}`);
}
// gpt-4o-mini: $0.000407
// claude-3.5-haiku: $0.004003
// gemini-2.5-flash: $0.000407
```

### Batch Processing Cost Estimation

```typescript
import { countTokens, estimateCost } from 'llm-token-counter';

const documents = [
  "Document 1 content...",
  "Document 2 content...",
  "Document 3 content..."
];

let totalTokens = 0;
let totalCost = 0;

for (const doc of documents) {
  const { tokens } = countTokens(doc);
  const { totalCost: cost } = estimateCost(doc, { 
    model: 'gpt-4o-mini',
    outputTokens: 200 
  });
  
  totalTokens += tokens;
  totalCost += cost;
}

console.log(`Total tokens: ${totalTokens}`);
console.log(`Total cost: $${totalCost.toFixed(4)}`);
```

### Token Limit Management

```typescript
import { checkTokenLimit, countTokens } from 'llm-token-counter';

function splitTextForModel(text: string, model: string, maxPercentage: number = 80) {
  const { maxTokens } = checkTokenLimit("", { model });
  const targetTokens = Math.floor(maxTokens * (maxPercentage / 100));
  
  const chunks = [];
  let currentChunk = "";
  
  for (const sentence of text.split('. ')) {
    const testChunk = currentChunk + sentence + '. ';
    const { tokens } = countTokens(testChunk);
    
    if (tokens > targetTokens && currentChunk) {
      chunks.push(currentChunk.trim());
      currentChunk = sentence + '. ';
    } else {
      currentChunk = testChunk;
    }
  }
  
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks;
}
```

## ⚡ Performance Notes

- **OpenAI Models**: Uses tiktoken for precise counting (slower but accurate)
- **Other Providers**: Uses fast approximation algorithm (4x faster)
- **Approximation Mode**: Force approximation with `approximateOnly: true`
- **Caching**: Token encoders are cached for better performance

## 🔒 Privacy & Security

- **No API Calls**: All counting happens locally
- **No Data Sent**: Your text never leaves your application
- **Offline Ready**: Works without internet connection

### Development Setup

```bash
# Clone and install
git clone https://github.com/sinansonmez/llm-token-counter.git
cd llm-token-counter
npm install

# Run tests
npm run test

# Build
npm run build

```

## 📋 Requirements

- Node.js >= 16.0.0
- TypeScript >= 4.5.0 (for development)

## 📄 License

MIT © Sinan Chaush

---

**Made with ❤️ for the AI developer community**
