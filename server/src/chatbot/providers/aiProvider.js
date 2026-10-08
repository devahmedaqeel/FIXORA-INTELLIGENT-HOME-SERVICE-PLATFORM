import { env } from '../../config/environment.js';
import { logger } from '../../utils/logger.js';

/*
 * Provider-agnostic AI client. Select with AI_PROVIDER = none | openai | anthropic | gemini
 * and AI_API_KEY (optional AI_MODEL). Each adapter takes { system, messages } where
 * messages = [{ role: 'user' | 'assistant', content }] and returns plain text.
 * If nothing is configured, or a call fails, generate() returns null and the chatbot
 * falls back to its FAQ / human-support flow.
 */

const DEFAULT_MODELS = {
  openai: 'gpt-4o-mini',
  anthropic: 'claude-haiku-4-5',
  gemini: 'gemini-1.5-flash',
};

async function postJson(url, { headers, body }) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), env.ai.timeoutMs);
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`AI provider responded with HTTP ${response.status}`);
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

const adapters = {
  async openai({ system, messages, model }) {
    const data = await postJson('https://api.openai.com/v1/chat/completions', {
      headers: { Authorization: `Bearer ${env.ai.apiKey}` },
      body: { model, temperature: 0.3, max_tokens: 400, messages: [{ role: 'system', content: system }, ...messages] },
    });
    return data?.choices?.[0]?.message?.content ?? null;
  },

  async anthropic({ system, messages, model }) {
    const data = await postJson('https://api.anthropic.com/v1/messages', {
      headers: { 'x-api-key': env.ai.apiKey, 'anthropic-version': '2023-06-01' },
      body: { model, system, max_tokens: 400, temperature: 0.3, messages },
    });
    return data?.content?.filter((part) => part.type === 'text').map((part) => part.text).join('\n') || null;
  },

  async gemini({ system, messages, model }) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(env.ai.apiKey)}`;
    const data = await postJson(url, {
      headers: {},
      body: {
        systemInstruction: { parts: [{ text: system }] },
        contents: messages.map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] })),
        generationConfig: { temperature: 0.3, maxOutputTokens: 400 },
      },
    });
    return data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('\n') || null;
  },
};

export function createAiProvider(config = env.ai) {
  const adapter = adapters[config.provider];
  const available = Boolean(adapter && config.apiKey);
  const model = config.model || DEFAULT_MODELS[config.provider];

  return {
    name: available ? config.provider : 'none',
    isAvailable: () => available,
    async generate({ system, messages }) {
      if (!available) return null;
      try {
        const text = await adapter({ system, messages, model });
        return text ? text.trim() : null;
      } catch (error) {
        logger.warn(`AI provider "${config.provider}" failed: ${error.message}`);
        return null;
      }
    },
  };
}

let instance = null;
export const getAiProvider = () => (instance ||= createAiProvider());
/** Test hook. */
export const setAiProvider = (provider) => {
  instance = provider;
};
