import React, { useState, useCallback } from 'react';
import { CompanyProfile } from '../types';
import { callGemini } from '../services/geminiService';
import { DollarSign, Loader2, TrendingUp } from './icons';

interface CompensationEngineToolProps {
  showStatus: (message: string, duration?: number) => void;
  statusMessage: string;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  companyProfile: CompanyProfile;
}

export default function CompensationEngineTool({ showStatus, statusMessage, isLoading, setIsLoading, companyProfile }: CompensationEngineToolProps) {
    const [jobTitle, setJobTitle] = useState('Software Engineer');
    const [experience, setExperience] = useState('Mid-level (4-7 years)');
    const [location, setLocation] = useState('London, UK');
    const [industry, setIndustry] = useState('Tech Startup (Series C)');
    const [compResult, setCompResult] = useState('');

    const COMP_SYSTEM_PROMPT = `You are a compensation analyst for ${companyProfile.name}. Provide a competitive, up-to-date salary range (including the currency) and a brief justification based on the provided role parameters. Use real-time data if possible.`;

    const handleCalculate = useCallback(async () => {
        setIsLoading(true);
        showStatus('Searching for competitive compensation data...');
        setCompResult('');

        try {
            const userQuery = `Find the competitive total compensation range for a ${experience} ${jobTitle} role in ${location} in the ${industry} sector. Provide the range and a compensation breakdown.`;
            const content = await callGemini(userQuery, COMP_SYSTEM_PROMPT, true); // Use search grounding
            setCompResult(content);
            showStatus('Compensation range calculated successfully (Grounded in real-time search).');
        } catch (error) {
            setCompResult('Failed to calculate compensation due to an API error.');
            showStatus('Error during compensation calculation.', 5000);
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, [jobTitle, experience, location, industry, setIsLoading, showStatus, COMP_SYSTEM_PROMPT]);

    return (
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-800 flex items-center mb-6">
                <DollarSign className="w-6 h-6 mr-3 text-[#4F46E5]" />
                Total Compensation Engine
            </h2>
            
            <div className="space-y-6">
                <p className="text-sm text-gray-500 p-3 bg-gray-50 rounded-lg border">
                    Context: Compensation is being calculated for <strong>{companyProfile.name}</strong>.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                        <input
                            id="jobTitle"
                            type="text"
                            value={jobTitle}
                            onChange={(e) => setJobTitle(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#4F46E5] focus:ring-[#4F46E5] p-3 bg-white text-black"
                        />
                    </div>
                    <div>
                        <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-1">Experience Level</label>
                        <select
                            id="experience"
                            value={experience}
                            onChange={(e) => setExperience(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#4F46E5] focus:ring-[#4F46E5] p-3 bg-white text-black"
                        >
                            <option value="Entry-level (0-3 years)">Entry-level (0-3 years)</option>
                            <option value="Mid-level (4-7 years)">Mid-level (4-7 years)</option>
                            <option value="Senior (8+ years)">Senior (8+ years)</option>
                            <option value="Lead/Principal">Lead/Principal</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">Location (City, Country)</label>
                        <input
                            id="location"
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#4F46E5] focus:ring-[#4F46E5] p-3 bg-white text-black"
                        />
                    </div>
                    <div>
                        <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-1">Industry / Company Stage</label>
                        <input
                            id="industry"
                            type="text"
                            value={industry}
                            onChange={(e) => setIndustry(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#4F46E5] focus:ring-[#4F46E5] p-3 bg-white text-black"
                        />
                    </div>
                </div>

                <button
                    onClick={handleCalculate}
                    disabled={isLoading || !jobTitle || !location}
                    className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-[#4F46E5] hover:bg-[#4338CA] transition duration-150 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    ) : (
                        <TrendingUp className="w-5 h-5 mr-2" />
                    )}
                    Calculate Competitive Range
                </button>
                
                <div className={`p-3 rounded-lg text-sm transition-all duration-300 ${statusMessage ? 'opacity-100 bg-blue-100 border-blue-400 text-blue-800' : 'opacity-0 h-0 p-0 overflow-hidden'}`}>
                    {statusMessage}
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 min-h-[150px]">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Compensation Results</h3>
                    <pre className="whitespace-pre-wrap text-gray-700 text-sm font-sans">
                        {compResult || 'Competitive compensation data will appear here, sourced using Google Search grounding.'}
                    </pre>
                </div>
            </div>
        </div>
    );
}