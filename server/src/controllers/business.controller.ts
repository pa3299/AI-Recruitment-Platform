import { Request, Response } from 'express';
import { GenAIService } from '../services/genai';

export const generateCompanyField = async (req: Request, res: Response) => {
  const { field, companyName } = req.body as { field: 'culture' | 'orgStructure' | 'guidelines'; companyName: string };
  const systemPrompt = 'You are a helpful HR and branding assistant. Generate a concise, professional, and well-written response based on the user\'s request for their company profile.';
  let userQuery = '';
  switch (field) {
    case 'culture':
      userQuery = `Generate a core company culture statement for a company named '${companyName}'. The statement should be inspiring and suitable for a recruitment platform, focusing on themes like collaboration, innovation, and employee growth. Output a single paragraph.`;
      break;
    case 'orgStructure':
      userQuery = `Generate a brief, generic description of a common company organizational structure for '${companyName}'. For example, 'Hierarchical with a flat management layer in engineering. Report to managers, not directors.'`;
      break;
    case 'guidelines':
      userQuery = `Generate a set of recruitment and job description guidelines for '${companyName}'. The guidelines should promote inclusive and clear language, and advise against using jargon or creating false urgency. Format as a short paragraph.`;
      break;
    default:
      return res.status(400).json({ error: 'Unsupported field' });
  }
  const text = await GenAIService.getInstance().generateText(userQuery, systemPrompt);
  return res.json({ text });
};

export const calculateCompensation = async (req: Request, res: Response) => {
  const { jobTitle, experience, location, industry, companyName } = req.body as { jobTitle: string; experience: string; location: string; industry: string; companyName: string };
  const systemPrompt = `You are a compensation analyst for ${companyName}. Provide a competitive, up-to-date salary range (including the currency) and a brief justification based on the provided role parameters. Use real-time data if possible.`;
  const userQuery = `Find the competitive total compensation range for a ${experience} ${jobTitle} role in ${location} in the ${industry} sector. Provide the range and a compensation breakdown.`;
  const text = await GenAIService.getInstance().generateText(userQuery, systemPrompt, true);
  return res.json({ text });
};
