
import { GoogleGenAI } from "@google/genai";
import { Base64File, AuditResult, ProfilePipelineEntry, CandidateMatchResult } from '../types';
import { CANDIDATE_MATCH_SCHEMA } from '../constants';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Calls the Gemini API for text-only generation with optional search grounding.
 * @param userQuery The user's prompt.
 * @param systemPrompt The system instruction for the model.
 * @param useSearch Whether to enable Google Search grounding.
 * @returns The generated text content.
 */
export async function callGemini(userQuery: string, systemPrompt: string, useSearch: boolean = false): Promise<string> {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: userQuery,
            config: {
                systemInstruction: systemPrompt,
                tools: useSearch ? [{ googleSearch: {} }] : undefined,
            },
        });
        return response.text;
    } catch (error) {
        console.error("Gemini API call failed:", error);
        return `An error occurred during generation: ${error instanceof Error ? error.message : String(error)}`;
    }
}

/**
 * Calls the Gemini API with multimodal input (text + files).
 * @param userQuery The user's text prompt.
 * @param systemPrompt The system instruction for the model.
 * @param fileParts An array of file objects with base64 data and MIME types.
 * @returns The generated text content.
 */
export async function callGeminiMultimodal(userQuery: string, systemPrompt: string, fileParts: Pick<Base64File, 'base64' | 'mimeType'>[]): Promise<string> {
    try {
        const imageParts = fileParts.map(fp => ({
            inlineData: {
                data: fp.base64,
                mimeType: fp.mimeType
            }
        }));

        const contents = {
            parts: [...imageParts, { text: userQuery }]
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: contents,
            config: {
                systemInstruction: systemPrompt,
            },
        });

        return response.text;
    } catch (error) {
        console.error("Gemini Multimodal API call failed:", error);
        return `An error occurred during multimodal generation: ${error instanceof Error ? error.message : String(error)}`;
    }
}

/**
 * Calls the Gemini API to get a structured JSON output based on a schema.
 * @param userQuery The user's prompt.
 * @param systemPrompt The system instruction for the model.
 * @param responseSchema The schema for the desired JSON output.
 * @returns The parsed JSON object.
 */
export async function callGeminiStructured(userQuery: string, systemPrompt: string, responseSchema: any): Promise<AuditResult | null> {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: userQuery,
            config: {
                systemInstruction: systemPrompt,
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            },
        });

        const jsonText = response.text;
        return jsonText ? JSON.parse(jsonText) : null;
    } catch (error) {
        console.error("Gemini Structured API call failed:", error);
        throw new Error(`An error occurred during structured generation: ${error instanceof Error ? error.message : String(error)}`);
    }
}

/**
 * Calls the Gemini Pro API to match candidate profiles against a job description.
 * @param jobDescription The job description text.
 * @param candidates An array of candidate profiles.
 * @returns A structured object with candidate recommendations.
 */
export async function callGeminiForMatching(jobDescription: string, candidates: ProfilePipelineEntry[]): Promise<CandidateMatchResult | null> {
    const systemPrompt = `You are an expert technical recruiter and talent sourcer. Your task is to analyze a job description and a list of anonymized candidate profiles. For each candidate, you must provide a 'matchScore' from 1-100 indicating their suitability for the role, and a brief 'justification' for your score. Base your analysis strictly on the skills, experience, and qualifications presented in the profiles against the requirements in the job description. Do not make assumptions.`;

    const candidatesForPrompt = candidates.map(c => ({
        id: c.id,
        profile: c.anonymizedResult,
    }));

    const userQuery = `Please analyze the following job description and candidate profiles, then return your analysis in the specified JSON format.

### Job Description
---
${jobDescription}
---

### Candidate Profiles
---
${JSON.stringify(candidatesForPrompt, null, 2)}
---
`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: userQuery,
            config: {
                systemInstruction: systemPrompt,
                responseMimeType: "application/json",
                responseSchema: CANDIDATE_MATCH_SCHEMA,
            },
        });
        const jsonText = response.text;
        return jsonText ? JSON.parse(jsonText) : null;
    } catch (error) {
        console.error("Gemini Matching API call failed:", error);
        throw new Error(`An error occurred during candidate matching: ${error instanceof Error ? error.message : String(error)}`);
    }
}
