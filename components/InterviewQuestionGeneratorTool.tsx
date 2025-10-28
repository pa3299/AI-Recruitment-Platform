import React, { useState, useCallback } from 'react';
import { CompanyProfile } from '../types';
import { callGemini } from '../services/geminiService';
import { MessageSquareMore, Loader2, Users } from './icons';

interface InterviewQuestionGeneratorToolProps {
  showStatus: (message: string, duration?: number) => void;
  statusMessage: string;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  companyProfile: CompanyProfile;
}

export default function InterviewQuestionGeneratorTool({ showStatus, statusMessage, isLoading, setIsLoading, companyProfile }: InterviewQuestionGeneratorToolProps) {
    const [jobTitle, setJobTitle] = useState('Senior Frontend Engineer');
    const [keySkills, setKeySkills] = useState('React, TypeScript, state management (Zustand/Redux), performance optimization');
    const [experience, setExperience] = useState('Senior (8+ years)');
    const [questionsResult, setQuestionsResult] = useState('');

    const [technicalCount, setTechnicalCount] = useState(4);
    const [behavioralCount, setBehavioralCount] = useState(4);
    const [cultureCount, setCultureCount] = useState(4);

    const QUESTIONS_SYSTEM_PROMPT = `You are an expert HR Interview Designer for ${companyProfile.name}. Your task is to generate a structured set of highly specific, competency-based interview questions based on the requested counts for each section. Structure the output clearly with three sections: **Technical/Domain**, **Behavioral/STAR**, and **Culture/Situational**. Ensure questions are non-biased, use the company's culture ("${companyProfile.culture}") and organizational structure ("${companyProfile.orgStructure}") to inform the Culture/Situational questions. Do not include answers or explanations in the final output, only the questions in clear markdown format.`;

    const handleGenerateQuestions = useCallback(async () => {
        setIsLoading(true);
        showStatus('Generating competency-based interview questions...');
        setQuestionsResult('');

        try {
            const userQuery = `Generate ${technicalCount} Technical, ${behavioralCount} Behavioral/STAR, and ${cultureCount} Culture/Situational interview questions for a ${experience} ${jobTitle} requiring skills in: ${keySkills}. Use the company context provided.`;
            
            const content = await callGemini(userQuery, QUESTIONS_SYSTEM_PROMPT, false);
            setQuestionsResult(content);
            showStatus('Interview questions generated successfully.');
        } catch (error) {
            setQuestionsResult('Failed to generate questions due to an API error.');
            showStatus('Error during question generation.', 5000);
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, [jobTitle, keySkills, experience, technicalCount, behavioralCount, cultureCount, setIsLoading, showStatus, QUESTIONS_SYSTEM_PROMPT]);

    const totalQuestions = technicalCount + behavioralCount + cultureCount;

    return (
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-800 flex items-center mb-6">
                <MessageSquareMore className="w-6 h-6 mr-3 text-[#4F46E5]" />
                Competency-Based Interview Generator
            </h2>

            <div className="space-y-6">
                <p className="text-sm text-gray-500 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                    Context: Generating questions for <strong>{companyProfile.name}</strong>.
                    Culture: "{companyProfile.culture}".
                </p>

                <div className="space-y-4">
                    <div>
                        <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700 mb-1">Target Job Title</label>
                        <input id="jobTitle" type="text" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#4F46E5] focus:ring-[#4F46E5] p-3 bg-white text-black" placeholder="e.g., Senior Data Scientist"/>
                    </div>

                    <div>
                        <label htmlFor="keySkills" className="block text-sm font-medium text-gray-700 mb-1">Key Required Skills (Comma Separated)</label>
                        <input id="keySkills" type="text" value={keySkills} onChange={(e) => setKeySkills(e.target.value)} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#4F46E5] focus:ring-[#4F46E5] p-3 bg-white text-black" placeholder="e.g., Python, SQL, NLP, machine learning deployment"/>
                    </div>

                    <div>
                        <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-1">Experience Level</label>
                        <select id="experience" value={experience} onChange={(e) => setExperience(e.target.value)} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#4F46E5] focus:ring-[#4F46E5] p-3 bg-white text-black">
                            <option value="Entry-level (0-3 years)">Entry-level (0-3 years)</option>
                            <option value="Mid-level (4-7 years)">Mid-level (4-7 years)</option>
                            <option value="Senior (8+ years)">Senior (8+ years)</option>
                            <option value="Lead/Principal">Lead/Principal</option>
                        </select>
                    </div>

                     <div className="pt-4 border-t">
                        <span className="block text-sm font-medium text-gray-700 mb-2">Number of Questions per Category (1-10)</span>
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label htmlFor="technicalCount" className="block text-sm text-gray-600 mb-1">Technical/Domain</label>
                                <input id="technicalCount" type="number" value={technicalCount} onChange={(e) => setTechnicalCount(Math.max(1, Math.min(10, Number(e.target.value))))} min="1" max="10" className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#4F46E5] focus:ring-[#4F46E5] p-3 bg-white text-black"/>
                            </div>
                             <div>
                                <label htmlFor="behavioralCount" className="block text-sm text-gray-600 mb-1">Behavioral/STAR</label>
                                <input id="behavioralCount" type="number" value={behavioralCount} onChange={(e) => setBehavioralCount(Math.max(1, Math.min(10, Number(e.target.value))))} min="1" max="10" className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#4F46E5] focus:ring-[#4F46E5] p-3 bg-white text-black"/>
                            </div>
                             <div>
                                <label htmlFor="cultureCount" className="block text-sm text-gray-600 mb-1">Culture/Situational</label>
                                <input id="cultureCount" type="number" value={cultureCount} onChange={(e) => setCultureCount(Math.max(1, Math.min(10, Number(e.target.value))))} min="1" max="10" className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#4F46E5] focus:ring-[#4F46E5] p-3 bg-white text-black"/>
                            </div>
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleGenerateQuestions}
                    disabled={isLoading || !jobTitle || !keySkills}
                    className="mt-6 w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 transition duration-150 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? (<Loader2 className="w-5 h-5 mr-2 animate-spin" />) : (<Users className="w-5 h-5 mr-2" />)}
                    Generate Interview Questions ({totalQuestions} Total)
                </button>
            </div>
            
            <div className={`p-3 rounded-lg text-sm transition-all duration-300 ${statusMessage ? 'opacity-100 bg-blue-100 border-blue-400 text-blue-800' : 'opacity-0 h-0 p-0 overflow-hidden'}`}>
                {statusMessage}
            </div>

            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 min-h-[300px]">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Generated Questions</h3>
                <pre className="whitespace-pre-wrap text-gray-700 text-sm font-sans">
                    {questionsResult || 'Questions will be generated here in three competency groups: Technical, Behavioral, and Culture Fit.'}
                </pre>
            </div>
        </div>
    );
}