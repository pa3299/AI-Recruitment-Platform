import { Router } from 'express';
import { z } from 'zod';
import { validateBody } from '../middleware/validate';
import { generateCompanyField, calculateCompensation } from '../controllers/business.controller';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.post('/company/generate-field', validateBody(z.object({
  field: z.enum(['culture', 'orgStructure', 'guidelines']),
  companyName: z.string().min(1),
})), asyncHandler(generateCompanyField));

router.post('/compensation/calculate', validateBody(z.object({
  jobTitle: z.string().min(1),
  experience: z.string().min(1),
  location: z.string().min(1),
  industry: z.string().min(1),
  companyName: z.string().min(1),
})), asyncHandler(calculateCompensation));

export default router;
