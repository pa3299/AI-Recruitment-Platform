import { GoogleGenAI } from '@google/genai';
import { config } from '../config/env';

export class GenAIService {
  private static instance: GenAIService | null = null;
  private client: GoogleGenAI | null;

  private constructor() {
    this.client = config.apiKey ? new GoogleGenAI({ apiKey: config.apiKey }) : null;
  }

  static getInstance(): GenAIService {
    if (!this.instance) this.instance = new GenAIService();
    return this.instance;
  }

  ensureClient(): GoogleGenAI {
    if (!this.client) throw Object.assign(new Error('AI client not configured'), { status: 503 });
    return this.client;
  }

  async generateText(userQuery: string, systemPrompt: string, useSearch = false): Promise<string> {
    const client = this.ensureClient();
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userQuery,
      config: { systemInstruction: systemPrompt as string, tools: useSearch ? [{ googleSearch: {} }] : undefined },
    });
    return response.text || '';
  }

  async generateMultimodal(userQuery: string, systemPrompt: string, files: { base64: string; mimeType: string }[]): Promise<string> {
    const client = this.ensureClient();
    const imageParts = files.map(f => ({ inlineData: { data: f.base64, mimeType: f.mimeType } }));
    const contents = { parts: [...imageParts, { text: userQuery }] } as any;
    const response = await client.models.generateContent({ model: 'gemini-2.5-flash', contents, config: { systemInstruction: systemPrompt as string } });
    return response.text || '';
  }

  async generateStructured<T = any>(userQuery: string, systemPrompt: string, responseSchema: any): Promise<T | null> {
    const client = this.ensureClient();
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userQuery,
      config: { systemInstruction: systemPrompt as string, responseMimeType: 'application/json', responseSchema },
    });
    const text = response.text;
    return text ? (JSON.parse(text) as T) : null;
  }
}
