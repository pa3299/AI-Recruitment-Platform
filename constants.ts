
import { Type } from '@google/genai';

export const BIAS_AUDIT_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        biasScore: {
            type: Type.INTEGER,
            description: "A score from 1 (lowest risk, highly neutral) to 10 (highest risk, heavily biased) indicating the level of bias in the JD. Score should be based on the number and severity of biases found."
        },
        riskLevel: {
            type: Type.STRING,
            description: "The risk level, e.g., 'Low', 'Medium', or 'High', based on the score (1-3 Low, 4-7 Medium, 8-10 High)."
        },
        suggestions: {
            type: Type.ARRAY,
            description: "A list of identified bias instances and recommended neutral replacements.",
            items: {
                type: Type.OBJECT,
                properties: {
                    biasedPhrase: { type: Type.STRING, description: "The original biased phrase found in the text." },
                    neutralSuggestion: { type: Type.STRING, description: "The suggested neutral replacement phrase." },
                    biasType: { type: Type.STRING, description: "The type of bias (e.g., 'Gendered Language', 'Age Bias', 'Competitive Tone', 'Intensity Jargon')." }
                },
                required: ["biasedPhrase", "neutralSuggestion", "biasType"]
            }
        },
        revisedJobDescription: {
            type: Type.STRING,
            description: "The complete, fully revised and neutral job description text based on all suggestions."
        }
    },
    required: ["biasScore", "riskLevel", "suggestions", "revisedJobDescription"]
};

export const CANDIDATE_MATCH_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        recommendations: {
            type: Type.ARRAY,
            description: "A list of recommended candidates ranked by match score.",
            items: {
                type: Type.OBJECT,
                properties: {
                    candidateId: {
                        type: Type.NUMBER,
                        description: "The unique ID of the candidate from the input list."
                    },
                    matchScore: {
                        type: Type.INTEGER,
                        description: "A score from 1 to 100 indicating how well the candidate's profile matches the job description."
                    },
                    justification: {
                        type: Type.STRING,
                        description: "A brief, 1-2 sentence justification for the match score, highlighting key alignments or gaps."
                    }
                },
                required: ["candidateId", "matchScore", "justification"]
            }
        }
    },
    required: ["recommendations"]
};


export const exampleData = {
    HIRED: {
        name: "Elena Rodriguez", 
        job: "Senior Data Scientist", 
        company: "Acmekorps Technologies",
        jd: "Seeking a Senior Data Scientist to lead our NLP initiatives. Must have 5+ years experience, expert Python, and TensorFlow. Role requires collaboration with engineering and product teams.",
        notes: "Elena demonstrated exceptional proficiency in Python and TensorFlow, exceeding expectations. Minor skill gap in project management tools, but strong cultural fit and deep technical expertise. Decision: HIRED.", 
        status: "HIRED"
    },
    REJECTED: { 
        name: "Marcus Chen",
        job: "Frontend Developer",
        company: "Innovate Labs",
        jd: "We need an experienced Frontend Developer (React, 4+ years) skilled in performance optimization, complex state management (Redux/Zustand), and responsive design principles for high-traffic web apps.",
        notes: "Marcus has a good eye for design. Practical experience with advanced state management was limited. Code samples showed performance bottlenecks. Critical skill gap in optimizing large-scale applications. Decision: REJECTED.",
        status: "REJECTED",
    },
    REJECTED_PIPELINE: {
        name: "Chloe Davis", 
        job: "Product Manager", 
        company: "Velocity Solutions",
        jd: "Seeking a Product Manager (B2B SaaS experience essential) to drive the roadmap for our enterprise platform. Requires deep market analysis skills and successful launch experience.",
        notes: "Chloe was an outstanding candidate with strong vision and communication. Final decision was due to needing more specific hands-on experience launching a B2B SaaS product in the last 12 months. Highly recommend for future PM roles. Decision: REJECTED, highly recommended for pipeline.", 
        status: "REJECTED"
    },
};
