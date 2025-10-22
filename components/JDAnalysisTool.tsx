
import React, { useState, useCallback } from 'react';
import { CompanyProfile, AuditResult } from '../types';
import { callGeminiStructured } from '../services/geminiService';
import { BIAS_AUDIT_SCHEMA } from '../constants';
import { ScanSearch, RefreshCcw, Loader2, CheckCheck, Zap } from './icons';

interface JDAnalysisToolProps {
  showStatus: (message: string, duration?: number) => void;
  statusMessage: string;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  companyProfile: CompanyProfile;
  broadcastJobDescription: string;
}

export default function JDAnalysisTool({ showStatus, statusMessage, isLoading, setIsLoading, companyProfile, broadcastJobDescription }: JDAnalysisToolProps) {
    const [jobDescription, setJobDescription] = useState(`We need a coding ninja to lead our aggressive, fast-paced team. The ideal candidate will be a younger, self-starting professional who can handle the heavy lifting of our legacy code. You must be a true self-starter, report directly to the CEO, and have 10+ years of demonstrable experience crushing metrics and driving outcomes. He or she will be expected to execute with surgical precision.`);
    const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
    const [appliedSuggestions, setAppliedSuggestions] = useState<number[]>([]);

    const JD_SYSTEM_PROMPT = `You are a hyper-critical recruitment bias auditor and simplification expert. Your primary goal is to drive the bias score down to 1-3. Analyze the job description exhaustively for ALL forms of exclusionary language: 1. **Gender/Age/Ethnicity Bias** (e.g., 'rockstar', 'guru', 'manpower', 'young'). 2. **Competitive/Aggressive Tone** (e.g., 'must dominate', 'killer code', 'crush metrics'). Replace with collaborative or professional terms. 3. **Intensity/Urgency** (e.g., 'fast-paced', 'high-octane', 'heavy lifting'). Replace with calm, accurate descriptions. 4. **Simplification:** Identify overly complex or jargon-heavy recruiter boilerplate for plain language replacement.
    
    Current Company Guidelines: "${companyProfile.guidelines}".
    
    Provide a severity score (1-10) and a list of *comprehensive, non-overlapping* suggestions. The \`revisedJobDescription\` MUST be simplified and neutral, reflecting all suggestions to achieve a score of 1-3.`;

    const getScoreClasses = (score?: number) => {
        if (!score) return 'text-gray-500 bg-gray-100';
        if (score <= 3) return 'text-green-700 bg-green-100 border-green-300';
        if (score <= 7) return 'text-yellow-700 bg-yellow-100 border-yellow-300';
        return 'text-red-700 bg-red-100 border-red-300';
    };
    
    const handleAudit = useCallback(async () => {
        setIsLoading(true);
        showStatus('Auditing Job Description for bias... Targeting a score of 1-3.');
        setAuditResult(null);
        setAppliedSuggestions([]); 

        try {
            const userQuery = `Audit this Job Description for bias and provide a score, risk level, and suggestions: "${jobDescription}"`;
            const result = await callGeminiStructured(userQuery, JD_SYSTEM_PROMPT, BIAS_AUDIT_SCHEMA);
            if (result) {
                setAuditResult(result);
                showStatus(`Bias audit complete. New Risk Level: ${result.riskLevel} (Score: ${result.biasScore})`);
            } else {
                throw new Error("API returned no result.");
            }
        } catch (error) {
            setAuditResult({ error: 'Failed to perform bias audit due to an API or parsing error.' });
            showStatus('Error during JD audit. Check console for details.', 5000);
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, [jobDescription, setIsLoading, showStatus, companyProfile.guidelines, JD_SYSTEM_PROMPT]);

    const handleApplySuggestion = useCallback((biasedPhrase: string, neutralSuggestion: string, index: number) => {
        setJobDescription(currentJD => {
            const escapedPhrase = biasedPhrase.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
            const newJD = currentJD.replace(new RegExp(escapedPhrase, 'g'), neutralSuggestion);
            return newJD;
        });
        setAppliedSuggestions(prev => [...prev, index]);
        showStatus(`Applied change: "${biasedPhrase}" replaced with "${neutralSuggestion}".`);
    }, [showStatus]);

    const handleLoadFromBroadcaster = () => {
        if (broadcastJobDescription.trim()) {
            setJobDescription(broadcastJobDescription);
            showStatus("Loaded job description from Job Broadcaster tool.", 3000);
        } else {
            showStatus("Job Broadcaster is empty. Nothing to load.", 3000);
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-800 flex items-center mb-4">
                <ScanSearch className="w-6 h-6 mr-2 text-indigo-600" />
                JD Analysis & Bias Audit ✨
            </h2>
            
            <label className="block">
                <span className="text-gray-700 font-medium">Job Description Text</span>
                <div className="relative mt-1">
                    <textarea
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        rows={8}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-4 font-mono text-sm pr-14"
                        placeholder="Paste your Job Description here for analysis."
                    />
                    <button
                        onClick={handleLoadFromBroadcaster}
                        disabled={!broadcastJobDescription.trim()}
                        className="absolute top-2 right-2 p-2 text-indigo-600 bg-indigo-100 rounded-full hover:bg-indigo-200 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition"
                        title="Load from Job Broadcaster"
                    >
                        <RefreshCcw className="w-5 h-5" />
                    </button>
                </div>
            </label>

            <button
                onClick={handleAudit}
                disabled={isLoading || !jobDescription.trim()}
                className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 transition duration-150 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                    <CheckCheck className="w-5 h-5 mr-2" />
                )}
                Audit for Bias and Suggest Revision (Targeting Score 1-3)
            </button>
            
            <div className={`p-3 rounded-lg text-sm transition-all duration-300 ${statusMessage ? 'opacity-100 bg-blue-100 border-blue-400 text-blue-800' : 'opacity-0 h-0 p-0 overflow-hidden'}`}>
                {statusMessage}
            </div>

            {auditResult && auditResult.error && (
                <div className="p-4 bg-red-100 text-red-800 rounded-lg border border-red-400">
                    <strong>Error:</strong> {auditResult.error}
                </div>
            )}

            {auditResult && auditResult.suggestions && (
                <div className="space-y-4">
                    <div className={`p-4 rounded-xl border-2 shadow-md ${getScoreClasses(auditResult.biasScore)}`}>
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-bold">Bias Risk Score</h3>
                            <div className="text-3xl font-extrabold p-2 rounded-full border-4">
                                {auditResult.biasScore} / 10
                            </div>
                        </div>
                        <p className="mt-2 font-medium">Risk Level: <span className="uppercase">{auditResult.riskLevel}</span> (1-3 Low, 4-7 Medium, 8-10 High)</p>
                    </div>

                    <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">Actionable Suggestions ({auditResult.suggestions.length})</h3>
                    
                    <div className="space-y-3">
                        {auditResult.suggestions.map((s, index) => {
                            const isApplied = appliedSuggestions.includes(index);
                            return (
                                <div 
                                    key={index} 
                                    className={`p-4 border rounded-lg shadow-sm transition duration-300 ${isApplied ? 'bg-green-50 border-green-300' : 'bg-white border-gray-200'}`}
                                >
                                    <div className="text-xs font-medium text-indigo-600 mb-1">{s.biasType}</div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-gray-700">
                                                <span className={`mr-2 font-mono ${isApplied ? 'text-gray-500 line-through' : 'text-red-500 line-through'}`}>{s.biasedPhrase}</span> 
                                                <Zap className="w-4 h-4 inline text-green-500 mx-1" />
                                                <span className={`font-semibold font-mono ${isApplied ? 'text-green-600' : 'text-green-700'}`}>{s.neutralSuggestion}</span>
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleApplySuggestion(s.biasedPhrase, s.neutralSuggestion, index)}
                                            disabled={isApplied}
                                            className={`ml-4 flex-shrink-0 px-3 py-1 text-sm font-medium rounded-full transition duration-150 ${isApplied ? 'text-white bg-green-500 shadow-inner cursor-not-allowed' : 'text-indigo-700 bg-indigo-100 hover:bg-indigo-200 shadow-md'}`}
                                        >
                                            {isApplied ? <span className="flex items-center"><CheckCheck className="w-4 h-4 mr-1" /> Applied</span> : 'Apply'}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <h3 className="text-xl font-semibold text-gray-800 pt-4 border-t mt-4">Full Revised JD</h3>
                    <div className="bg-gray-100 p-4 rounded-lg border border-gray-300">
                        <pre className="whitespace-pre-wrap text-gray-700 text-sm font-sans">
                            {auditResult.revisedJobDescription}
                        </pre>
                    </div>
                </div>
            )}
        </div>
    );
}
