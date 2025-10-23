import { Request, Response } from 'express';
import { GenAIService } from '../services/genai';
import { Type } from '@google/genai';

export const matchCandidates = async (req: Request, res: Response) => {
  const { jobDescription, candidates } = req.body as { jobDescription: string; candidates: { id: number; anonymizedResult: string }[] };

  const systemPrompt = 'You are an expert technical recruiter and talent sourcer. Analyze a job description and a list of anonymized candidate profiles. For each candidate, provide a matchScore from 1-100 and a brief justification.';
  const candidatesForPrompt = candidates.map(c => ({ id: c.id, profile: c.anonymizedResult }));
  const userQuery = `Please analyze the following job description and candidate profiles, then return your analysis in the specified JSON format.\n\n### Job Description\n---\n${jobDescription}\n---\n\n### Candidate Profiles\n---\n${JSON.stringify(candidatesForPrompt, null, 2)}\n---`;

  const CANDIDATE_MATCH_SCHEMA = {
    type: Type.OBJECT,
    properties: {
      recommendations: {
        type: Type.ARRAY,
        description: 'A list of recommended candidates ranked by match score.',
        items: {
          type: Type.OBJECT,
          properties: {
            candidateId: { type: Type.NUMBER },
            matchScore: { type: Type.INTEGER },
            justification: { type: Type.STRING },
          },
          required: ['candidateId', 'matchScore', 'justification'],
        },
      },
    },
    required: ['recommendations'],
  };

  const result = await GenAIService.getInstance().generateStructured(userQuery, systemPrompt, CANDIDATE_MATCH_SCHEMA);
  res.json({ result });
};
