
import React from 'react';
import { UserCheck, Loader2 } from './icons';
import { RecommendedCandidate } from '../types';

interface InternalTalentMarketplaceProps {
  recommendedCandidates: RecommendedCandidate[];
  isMatching: boolean;
  totalCandidatesInPipelines: number;
  broadcastJobDescription: string;
}

export default function InternalTalentMarketplace({ recommendedCandidates, isMatching, totalCandidatesInPipelines, broadcastJobDescription }: InternalTalentMarketplaceProps) {
    if (totalCandidatesInPipelines === 0) {
        return (
             <div className="p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 text-center">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center justify-center mb-2">
                    <UserCheck className="w-6 h-6 mr-3 text-[#4F46E5]" />
                    Internal Talent Marketplace
                </h3>
                 <p className="text-sm text-gray-500 dark:text-gray-400">Your candidate pipelines are empty. Add profiles to see internal recommendations here.</p>
            </div>
        );
    }
    
    if (!broadcastJobDescription.trim()) {
         return (
             <div className="p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 text-center">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center justify-center mb-2">
                    <UserCheck className="w-6 h-6 mr-3 text-[#4F46E5]" />
                    Internal Talent Marketplace
                </h3>
                 <p className="text-sm text-gray-500 dark:text-gray-400">Start writing a job description to automatically see matching candidates from your pipeline.</p>
            </div>
        );
    }
    
    return (
        <div className="p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700">
             <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center mb-4">
                <UserCheck className="w-6 h-6 mr-3 text-[#4F46E5]" />
                Recommended Candidates from Your Pipeline (Powered by Gemini 2.5 Pro)
            </h3>

            {isMatching ? (
                <div className="flex items-center justify-center p-8">
                    <Loader2 className="w-6 h-6 text-indigo-600 animate-spin mr-3" />
                    <span className="text-gray-600 dark:text-gray-400">Scanning {totalCandidatesInPipelines} candidate(s)...</span>
                </div>
            ) : recommendedCandidates.length > 0 ? (
                <ul className="space-y-4">
                    {recommendedCandidates.map(candidate => (
                        <li key={candidate.id} className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg border border-gray-200 dark:border-slate-700">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-bold text-gray-800 dark:text-gray-200">{candidate.candidateName}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">From: {candidate.pipelineName}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-extrabold text-xl text-green-600 dark:text-green-400">{candidate.matchScore}%</p>
                                    <p className="text-xs font-medium text-green-700 dark:text-green-500">Match</p>
                                </div>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 italic border-l-2 border-green-300 dark:border-green-600 bg-green-50 dark:bg-green-900/20 p-2 rounded-r-lg">"{candidate.justification}"</p>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center p-4">No strong matches found in your pipelines for this job description.</p>
            )}
        </div>
    );
}