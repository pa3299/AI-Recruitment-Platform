import { Router } from 'express';
import { z } from 'zod';
import { validateBody } from '../middleware/validate';
import { matchCandidates } from '../controllers/candidates.controller';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.post('/candidates/match', validateBody(z.object({
  jobDescription: z.string().min(1),
  candidates: z.array(z.object({ id: z.number().int(), anonymizedResult: z.string().min(1) })).min(1),
})), asyncHandler(matchCandidates));

export default router;
