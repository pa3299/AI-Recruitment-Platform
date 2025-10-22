
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { CompanyProfile, Pipelines, ProfilePipelineEntry, RecommendedCandidate } from '../types';
import { callGeminiForMatching } from '../services/geminiService';
import { Rss, Loader2, Send, CheckCheck } from './icons';
import InternalTalentMarketplace from './InternalTalentMarketplace';

interface JobBroadcasterToolProps {
  showStatus: (message: string, duration?: number) => void;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  broadcastJobDescription: string;
  setBroadcastJobDescription: React.Dispatch<React.SetStateAction<string>>;
  pipelines: Pipelines;
}

export default function JobBroadcasterTool({ showStatus, isLoading, setIsLoading, broadcastJobDescription, setBroadcastJobDescription, pipelines }: JobBroadcasterToolProps) {
    const [selectedPlatforms, setSelectedPlatforms] = useState({ linkedin: true, indeed: true, glassdoor: false });
    const [connections, setConnections] = useState({ linkedin: false, indeed: false, glassdoor: false });
    
    const [recommendedCandidates, setRecommendedCandidates] = useState<RecommendedCandidate[]>([]);
    const [isMatching, setIsMatching] = useState(false);
    
    const allProfileCandidates = useMemo<ProfilePipelineEntry[]>(() => {
        return Object.values(pipelines)
            .flatMap(pipeline => pipeline.filter(c => c.type === 'profile')) as ProfilePipelineEntry[];
    }, [pipelines]);

    const totalCandidatesInPipelines = useMemo(() => {
        return Object.values(pipelines).reduce((acc, pipeline) => acc + pipeline.length, 0);
    }, [pipelines]);

    const runMatching = useCallback(async () => {
        if (!broadcastJobDescription.trim() || allProfileCandidates.length === 0) {
            setRecommendedCandidates([]);
            return;
        }

        setIsMatching(true);
        showStatus(`Scanning ${allProfileCandidates.length} candidate(s) with Gemini Pro...`);

        try {
            const result = await callGeminiForMatching(broadcastJobDescription, allProfileCandidates);
            if (result && result.recommendations) {
                const candidatesById = new Map(
                    Object.entries(pipelines).flatMap(([pipelineName, candidates]) =>
                        candidates.map(c => [c.id, {...c, pipelineName}])
                    )
                );

                const matches: RecommendedCandidate[] = result.recommendations
                    .map(rec => {
                        const candidate = candidatesById.get(rec.candidateId);
                        if (candidate && candidate.type === 'profile') {
                            return {
                                ...candidate,
                                matchScore: rec.matchScore,
                                justification: rec.justification,
                            };
                        }
                        return null;
                    })
                    .filter((c): c is RecommendedCandidate => c !== null)
                    .sort((a, b) => b.matchScore - a.matchScore);
                
                setRecommendedCandidates(matches);
                showStatus(`Found ${matches.length} potential match(es).`);
            } else {
                 setRecommendedCandidates([]);
                 showStatus('AI matching returned no results.');
            }
        } catch (error) {
            console.error("Failed to run AI matching:", error);
            showStatus('An error occurred during AI matching.', 5000);
            setRecommendedCandidates([]);
        } finally {
            setIsMatching(false);
        }
    }, [broadcastJobDescription, allProfileCandidates, pipelines, showStatus]);


    useEffect(() => {
        const handler = setTimeout(() => {
            runMatching();
        }, 1500); // 1.5-second debounce

        return () => clearTimeout(handler);
    }, [broadcastJobDescription, runMatching]);

    const handlePlatformToggle = (platform: keyof typeof selectedPlatforms) => {
        setSelectedPlatforms(prev => ({ ...prev, [platform]: !prev[platform] }));
    };

    const handleConnect = (platform: keyof typeof connections) => {
        setIsLoading(true);
        showStatus(`Simulating connection to ${String(platform)}...`);
        setTimeout(() => {
            setConnections(prev => ({ ...prev, [platform]: true }));
            setIsLoading(false);
            showStatus(`${String(platform)} account connected successfully! (Prototype)`, 4000);
        }, 1500);
    };

    const handlePublish = () => {
        const connectedAndSelected = Object.keys(selectedPlatforms).filter(p => selectedPlatforms[p as keyof typeof selectedPlatforms] && connections[p as keyof typeof connections]);
        if (connectedAndSelected.length === 0) {
            showStatus('Error: Please connect to at least one selected platform before publishing.', 5000);
            return;
        }

        setIsLoading(true);
        showStatus(`Broadcasting job ad to: ${connectedAndSelected.join(', ')}...`);
        setTimeout(() => {
            setIsLoading(false);
            showStatus(`Successfully published job ad to ${connectedAndSelected.length} platform(s)! (Prototype)`, 5000);
        }, 2500);
    };

    const isPublishDisabled = isLoading || !broadcastJobDescription.trim() || Object.values(selectedPlatforms).every(v => !v);

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-800 flex items-center mb-4">
                <Rss className="w-6 h-6 mr-2 text-indigo-600" />
                Job Broadcaster (Prototype)
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-200">
                        <label className="block">
                            <span className="text-gray-700 font-medium">Final Job Description</span>
                            <textarea value={broadcastJobDescription} onChange={(e) => setBroadcastJobDescription(e.target.value)} rows={12} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-4" placeholder="Paste the final, audited job description here to automatically match against your candidate pipeline..."/>
                        </label>
                    </div>

                    <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Select Platforms to Post On</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {Object.keys(selectedPlatforms).map(platform => (
                                <div key={platform} onClick={() => handlePlatformToggle(platform as keyof typeof selectedPlatforms)} className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 flex flex-col items-center justify-center ${selectedPlatforms[platform as keyof typeof selectedPlatforms] ? 'border-indigo-500 bg-indigo-50 shadow-md' : 'border-gray-300 bg-gray-50 hover:border-gray-400'}`}>
                                    <span className="text-lg font-bold capitalize text-gray-700">{platform}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                     <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Account Connections</h3>
                        <div className="space-y-3">
                            {Object.keys(connections).map(platform => (
                                <div key={platform} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                                    <span className="font-medium capitalize text-gray-700">{platform}</span>
                                    {connections[platform as keyof typeof connections] ? (
                                        <span className="flex items-center text-sm font-semibold text-green-600"><CheckCheck className="w-4 h-4 mr-1" /> Connected</span>
                                    ) : (
                                        <button onClick={() => handleConnect(platform as keyof typeof connections)} className="text-sm text-blue-600 hover:underline" disabled={isLoading}>Connect</button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                    <button onClick={handlePublish} disabled={isPublishDisabled} className="w-full flex items-center justify-center px-4 py-4 border border-transparent text-base font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 transition duration-150 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
                        {isLoading ? (<Loader2 className="w-5 h-5 mr-2 animate-spin" />) : (<Send className="w-5 h-5 mr-2" />)}
                        Publish Job Ad
                    </button>
                </div>
            </div>
            
            <div className="mt-6">
                 <InternalTalentMarketplace 
                    recommendedCandidates={recommendedCandidates}
                    isMatching={isMatching}
                    totalCandidatesInPipelines={totalCandidatesInPipelines}
                    broadcastJobDescription={broadcastJobDescription}
                />
            </div>
        </div>
    );
}
