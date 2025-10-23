import { Router } from 'express';
import { generateText, generateMultimodal, generateStructured } from '../controllers/ai.controller';
import { asyncHandler } from '../utils/asyncHandler';
import { z } from 'zod';
import { validateBody } from '../middleware/validate';

const router = Router();

const textSchema = z.object({
  userQuery: z.string().min(1),
  systemPrompt: z.string().min(1),
  useSearch: z.boolean().optional(),
});

const multimodalSchema = z.object({
  userQuery: z.string().min(1),
  systemPrompt: z.string().min(1),
  files: z.array(z.object({ base64: z.string().min(1), mimeType: z.string().min(1) })).default([]),
});

const structuredSchema = z.object({
  userQuery: z.string().min(1),
  systemPrompt: z.string().min(1),
  responseSchema: z.any(),
});

router.post('/text', validateBody(textSchema), asyncHandler(generateText));
router.post('/multimodal', validateBody(multimodalSchema), asyncHandler(generateMultimodal));
router.post('/structured', validateBody(structuredSchema), asyncHandler(generateStructured));

export default router;
