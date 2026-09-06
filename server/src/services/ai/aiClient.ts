import OpenAI from 'openai';
import { env } from '../../config/env.js';
import { prisma } from '../db/prisma.js';

let openaiClient: OpenAI | null = null;

function getAIClient(): OpenAI | null {
  if (!env.AI_API_KEY) {
    return null;
  }

  if (!openaiClient) {
    let baseURL = env.AI_BASE_URL;
    if (!baseURL && env.AI_PROVIDER === 'groq') {
      baseURL = 'https://api.groq.com/openai/v1';
    }

    openaiClient = new OpenAI({
      apiKey: env.AI_API_KEY,
      ...(baseURL ? { baseURL } : {}),
    });
  }

  return openaiClient;
}

export interface AICallOptions {
  prompt: string;
  systemMessage?: string;
  temperature?: number;
  userId?: string;
  endpointName?: string;
  maxTokens?: number;
}

export async function callAI<T = any>(options: AICallOptions, fallbackGenerator?: () => T): Promise<T> {
  const startTime = Date.now();
  const client = getAIClient();

  if (!client || !env.AI_API_KEY) {
    console.log(`[AIClient] No AI API Key configured or mock mode enabled. Using deterministic fallback engine.`);
    if (fallbackGenerator) {
      const fallbackResult = fallbackGenerator();
      logAIRequest(options.userId, options.endpointName || 'general', 'fallback-engine', 0, 0, true, Date.now() - startTime);
      return fallbackResult;
    }
    throw new Error('No AI provider configured and no fallback available.');
  }

  try {
    const response = await client.chat.completions.create({
      model: env.AI_MODEL || (env.AI_PROVIDER === 'groq' ? 'llama-3.3-70b-versatile' : 'gpt-4o-mini'),
      messages: [
        {
          role: 'system',
          content:
            options.systemMessage ||
            'You are an expert AI resume and career intelligence system. Always respond with pure, valid JSON with no markdown backticks or commentary.',
        },
        {
          role: 'user',
          content: options.prompt,
        },
      ],
      temperature: options.temperature ?? 0.2,
      max_tokens: options.maxTokens ?? 2500,
      response_format: { type: 'json_object' },
    });

    const latency = Date.now() - startTime;
    const rawContent = response.choices[0]?.message?.content || '{}';
    const cleanContent = cleanJsonResponse(rawContent);
    const parsedData = JSON.parse(cleanContent) as T;

    logAIRequest(
      options.userId,
      options.endpointName || 'general',
      response.model,
      response.usage?.prompt_tokens || 0,
      response.usage?.completion_tokens || 0,
      true,
      latency
    );

    return parsedData;
  } catch (error: any) {
    const latency = Date.now() - startTime;
    console.warn(`[AIClient] AI call error: ${error.message}. Triggering safe fallback...`);

    logAIRequest(
      options.userId,
      options.endpointName || 'general',
      env.AI_MODEL,
      0,
      0,
      false,
      latency,
      error.message
    );

    if (fallbackGenerator) {
      return fallbackGenerator();
    }
    throw error;
  }
}

function cleanJsonResponse(text: string): string {
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }
  return cleaned.trim();
}

async function logAIRequest(
  userId?: string,
  endpoint: string = 'general',
  model: string = 'unknown',
  promptTokens: number = 0,
  completionTokens: number = 0,
  success: boolean = true,
  latencyMs: number = 0,
  errorMessage?: string
) {
  try {
    await prisma.aIRequest.create({
      data: {
        userId: userId || null,
        endpoint,
        model,
        promptTokens,
        completionTokens,
        success,
        latencyMs,
        errorMessage: errorMessage || null,
      },
    });
  } catch {
    // Non-blocking log failure
  }
}
