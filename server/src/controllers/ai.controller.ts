import { Request, Response } from 'express';
import { GenAIService } from '../services/genai';

export const generateText = async (req: Request, res: Response) => {
  const { userQuery, systemPrompt, useSearch } = req.body as { userQuery: string; systemPrompt: string; useSearch?: boolean };
  const text = await GenAIService.getInstance().generateText(userQuery, systemPrompt, Boolean(useSearch));
  res.json({ text });
};

export const generateMultimodal = async (req: Request, res: Response) => {
  const { userQuery, systemPrompt, files } = req.body as { userQuery: string; systemPrompt: string; files: { base64: string; mimeType: string }[] };
  const text = await GenAIService.getInstance().generateMultimodal(userQuery, systemPrompt, files || []);
  res.json({ text });
};

export const generateStructured = async (req: Request, res: Response) => {
  const { userQuery, systemPrompt, responseSchema } = req.body as { userQuery: string; systemPrompt: string; responseSchema: any };
  const result = await GenAIService.getInstance().generateStructured(userQuery, systemPrompt, responseSchema);
  res.json({ result });
};
