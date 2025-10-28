import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { CompanyProfile, Pipelines, Base64File } from '../types';
import { callGeminiMultimodal, callGemini } from '../services/geminiService';
import { fileToBase64 } from '../utils/fileUtils';
import { ShieldCheck, Loader2, FileUp, CheckCheck, FileArchive, FileText } from './icons';

interface UnbiasedProfileGeneratorToolProps {
  showStatus: (message: string, duration?: number) => void;
  statusMessage: string;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  companyProfile: CompanyProfile;
  pipelines: Pipelines;
  setPipelines: React.Dispatch<React.SetStateAction<Pipelines>>;
}

export default function UnbiasedProfileGeneratorTool({ showStatus, statusMessage, isLoading, setIsLoading, companyProfile, pipelines, setPipelines }: UnbiasedProfileGeneratorToolProps) {
    const [candidateName, setCandidateName] = useState('');
    const [rawText, setRawText] = useState('');
    const [anonymizedResult, setAnonymizedResult] = useState('');
    const [fitSummaryResult, setFitSummaryResult] = useState('');
    const [isCurrentProfileSaved, setIsCurrentProfileSaved] = useState(false);

    const [cvFileData, setCvFileData] = useState<Base64File | null>(null);
    const [clFileData, setClFileData] = useState<Base64File | null>(null);
    
    const cvInputRef = useRef<HTMLInputElement>(null);
    const clInputRef = useRef<HTMLInputElement>(null);

    const [pipelineToSaveTo, setPipelineToSaveTo] = useState('');
    const pipelineNames = useMemo(() => Object.keys(pipelines), [pipelines]);
    
    useEffect(() => {
        if (!pipelineToSaveTo && pipelineNames.length > 0) {
            setPipelineToSaveTo(pipelineNames[0]);
        }
    }, [pipelineNames, pipelineToSaveTo]);

    const ANONYMIZER_SYSTEM_PROMPT = `You are an expert HR data anonymizer. Your sole purpose is to process candidate documents (CVs, cover letters) and raw text to create a completely unbiased, anonymized professional summary.

**CRITICAL INSTRUCTIONS - YOU MUST FOLLOW THESE RULES:**

1.  **REMOVE ALL Personally Identifiable Information (PII):**
    * Candidate's Full Name (replace with "[Candidate]").
    * Contact Information (email, phone number, address, LinkedIn URL, etc.).
    * Dates of Birth, Age, or any age-indicating information.
    * Photos or descriptions of appearance.
    * Gendered pronouns (he/him, she/her). Rephrase sentences to be neutral or use they/them if absolutely necessary.
    * Nationality, ethnicity, or place of origin.

2.  **REMOVE ALL BIAS-INDUCING EDUCATIONAL/SOCIAL INFORMATION:**
    * Names of specific universities, colleges, or schools. You MUST retain the degree and field of study (e.g., "Bachelor of Science in Computer Science").
    * Graduation dates. Retain the duration of study if available, but remove the specific years.
    * Personal hobbies, interests, or affiliations unless they are directly relevant to professional skills (e.g., 'contributor to open-source projects' is okay, 'captain of the local football team' is not).

3.  **KEEP AND STRUCTURE ONLY PROFESSIONAL INFORMATION:**
    * **Work Experience:** List each role with the job title, company name (IT IS CRITICAL TO KEEP THE COMPANY NAME), duration of employment, and a summary of responsibilities and achievements.
    * **Skills:** Create a clear, categorized list of technical skills, software proficiency, and soft skills.
    * **Languages:** List all languages spoken and their proficiency levels.
    * **Projects:** Summarize key professional or academic projects and their outcomes.

**OUTPUT FORMAT:**
The final output must be in clean, readable Markdown. Use headings for each section (e.g., \`## Work Experience\`, \`## Skills\`, \`## Languages\`). Do not add any commentary or explanation outside of the requested structured output.`;
    
    const FIT_SUMMARY_SYSTEM_PROMPT = `You are a senior recruiter for ${companyProfile.name}. Your task is to analyze the provided anonymized candidate profile. Based on their skills and experience, write a concise summary assessing their potential fit and impact at the company. Consider the company's culture: "${companyProfile.culture}" and organizational structure: "${companyProfile.orgStructure}". Structure your output with two sections in Markdown: **1. Potential Impact & Contributions** (how their skills can help the company) and **2. Cultural Fit Analysis** (how their profile aligns with the company values).`;

    const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>, setFileState: React.Dispatch<React.SetStateAction<Base64File | null>>, type: string) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.size > 4 * 1024 * 1024) { // 4MB limit
                showStatus(`Error: ${type} file is too large (> 4MB).`, 5000);
                setFileState(null);
                if(event.target) event.target.value = "";
                return;
            }
            try {
                showStatus(`Processing ${type}: ${file.name}...`);
                const base64Data = await fileToBase64(file);
                setFileState(base64Data);
                showStatus(`${type} successfully processed.`);
                if (!candidateName) {
                    setCandidateName(file.name.replace(/\.[^/.]+$/, "").replace(/[_.-]/g, ' '));
                }
            } catch (error) {
                showStatus(`Error processing ${type}.`, 5000);
                console.error("File processing error:", error);
                setFileState(null);
            }
        } else {
            setFileState(null);
        }
    }, [showStatus, candidateName]);
    
    const handleGenerate = useCallback(async () => {
        setIsLoading(true);
        showStatus('Step 1/2: Creating unbiased candidate profile...');
        setAnonymizedResult('');
        setFitSummaryResult('');
        setIsCurrentProfileSaved(false);

        const fileParts: Pick<Base64File, 'base64' | 'mimeType'>[] = [];
        if (cvFileData) fileParts.push(cvFileData);
        if (clFileData) fileParts.push(clFileData);
        
        const anonymizeUserQuery = `Anonymize the following candidate information from the raw text and/or the uploaded documents (CV, Cover Letter). Raw Text Input: "${rawText}"`;
        
        try {
            const anonymizedContent = await callGeminiMultimodal(anonymizeUserQuery, ANONYMIZER_SYSTEM_PROMPT, fileParts);
            
            if (anonymizedContent && !anonymizedContent.includes("Could not generate content")) {
                setAnonymizedResult(anonymizedContent);
                showStatus('Step 2/2: Analyzing profile for company fit...');

                const fitSummaryUserQuery = `Analyze this anonymized profile and generate a fit summary: \n\n${anonymizedContent}`;
                const fitSummaryContent = await callGemini(fitSummaryUserQuery, FIT_SUMMARY_SYSTEM_PROMPT);
                setFitSummaryResult(fitSummaryContent);
                showStatus('Unbiased profile and fit summary generated successfully.');

            } else {
                 setAnonymizedResult('Failed to generate unbiased profile.');
                 showStatus('Error during generation step.', 5000);
            }

        } catch (error) {
            setAnonymizedResult('Failed to generate unbiased profile due to an API error.');
            showStatus('Error during generation. Check console for details.', 5000);
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, [rawText, cvFileData, clFileData, setIsLoading, showStatus, ANONYMIZER_SYSTEM_PROMPT, FIT_SUMMARY_SYSTEM_PROMPT, FIT_SUMMARY_SYSTEM_PROMPT]);

    const handleSaveProfile = () => {
        if (!anonymizedResult || !fitSummaryResult || !candidateName) {
            showStatus('Please provide a candidate name before saving.', 4000);
            return;
        }
        if (!pipelineToSaveTo) {
            showStatus('Please select a pipeline to save to.', 4000);
            return;
        }

        const newProfile = {
            id: Date.now(),
            type: 'profile' as const,
            candidateName,
            anonymizedResult,
            fitSummaryResult,
        };

        setPipelines(prev => ({
            ...prev,
            [pipelineToSaveTo]: [...(prev[pipelineToSaveTo] || []), newProfile]
        }));
        setIsCurrentProfileSaved(true);
        showStatus(`Profile for ${candidateName} saved to "${pipelineToSaveTo}" pipeline!`);
    };

    const isGenerateDisabled = isLoading || (!rawText.trim() && !cvFileData && !clFileData);
    const getFileName = (fileData: Base64File | null) => fileData ? fileData.name : 'No file selected';
    const isFileLoaded = (fileData: Base64File | null) => fileData !== null;

    return (
        <div className="space-y-6">
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
                <h2 className="text-2xl font-semibold text-gray-800 flex items-center mb-6"><ShieldCheck className="w-6 h-6 mr-3 text-[#4F46E5]" />Unbiased Profile Generator</h2>
                <div className="space-y-6">
                    <p className="text-sm text-gray-500 p-3 bg-indigo-50 rounded-lg border border-indigo-200">Provide the candidate's name, then upload their documents or paste their CV text to generate a bias-free profile.</p>
                    <div>
                        <label htmlFor="candidateName" className="block text-sm font-medium text-gray-700 mb-1">Candidate Name (for Pipeline)</label>
                        <input id="candidateName" type="text" value={candidateName} onChange={(e) => setCandidateName(e.target.value)} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#4F46E5] focus:ring-[#4F46E5] p-3 bg-white text-black" placeholder="e.g., John Doe"/>
                    </div>
                    <div className="pt-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <input type="file" ref={cvInputRef} onChange={(e) => handleFileChange(e, setCvFileData, 'CV/Resume')} accept=".pdf,image/jpeg,image/png,.doc,.docx" className="hidden" />
                            <button onClick={() => cvInputRef.current?.click()} className={`w-full text-center p-3 text-sm rounded-lg border-2 border-dashed transition duration-150 shadow-sm truncate ${isFileLoaded(cvFileData) ? 'border-green-400 bg-green-50 text-green-700 hover:bg-green-100' : 'border-gray-300 bg-gray-50 hover:border-indigo-500 text-gray-700 hover:bg-white'}`} title={getFileName(cvFileData)}><FileArchive className="w-4 h-4 inline mr-2" />{isFileLoaded(cvFileData) ? `CV: ${getFileName(cvFileData)}` : 'Upload CV/Resume'}</button>
                            <input type="file" ref={clInputRef} onChange={(e) => handleFileChange(e, setClFileData, 'Cover Letter')} accept=".pdf,image/jpeg,image/png,.doc,.docx" className="hidden" />
                            <button onClick={() => clInputRef.current?.click()} className={`w-full text-center p-3 text-sm rounded-lg border-2 border-dashed transition duration-150 shadow-sm truncate ${isFileLoaded(clFileData) ? 'border-green-400 bg-green-50 text-green-700 hover:bg-green-100' : 'border-gray-300 bg-gray-50 hover:border-indigo-500 text-gray-700 hover:bg-white'}`} title={getFileName(clFileData)}><FileText className="w-4 h-4 inline mr-2" />{isFileLoaded(clFileData) ? `CL: ${getFileName(clFileData)}` : 'Upload Cover Letter'}</button>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="rawText" className="block text-sm font-medium text-gray-700 mb-1">Or Paste Raw CV/Cover Letter Text</label>
                        <textarea id="rawText" value={rawText} onChange={(e) => setRawText(e.target.value)} rows={8} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#4F46E5] focus:ring-[#4F46E5] p-4 font-mono text-sm bg-white text-black" placeholder="Paste full CV text here if you don't have a file." />
                    </div>
                    <button onClick={handleGenerate} disabled={isGenerateDisabled} className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-teal-600 hover:bg-teal-700 transition duration-150 shadow-md disabled:opacity-50 disabled:cursor-not-allowed">{isLoading ? (<Loader2 className="w-5 h-5 mr-2 animate-spin" />) : (<ShieldCheck className="w-5 h-5 mr-2" />)}Generate Unbiased Profile & Fit Summary</button>
                </div>
            </div>
            <div className={`p-3 rounded-lg text-sm transition-all duration-300 ${statusMessage ? 'opacity-100 bg-blue-100 border-blue-400 text-blue-800' : 'opacity-0 h-0 p-0 overflow-hidden'}`}>{statusMessage}</div>
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 space-y-6">
                 {(anonymizedResult && fitSummaryResult) && (
                     <div className="border-b pb-4 flex flex-col sm:flex-row gap-4 items-center justify-end">
                        <select value={pipelineToSaveTo} onChange={(e) => setPipelineToSaveTo(e.target.value)} className="w-full sm:w-auto p-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white text-black" disabled={pipelineNames.length === 0}>
                            {pipelineNames.length > 0 ? (pipelineNames.map(name => <option key={name} value={name}>{name}</option>)) : (<option>Create a pipeline first</option>)}
                        </select>
                        <button onClick={handleSaveProfile} disabled={isCurrentProfileSaved || !candidateName || !pipelineToSaveTo} className="w-full sm:w-auto flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-150 shadow-sm" title={!candidateName ? "Please enter a candidate name to save." : !pipelineToSaveTo ? "Please select a pipeline." : "Save to Pipeline"}>
                            {isCurrentProfileSaved ? (<><CheckCheck className="w-5 h-5 mr-2" />Saved to Pipeline</>) : (<><FileUp className="w-5 h-5 mr-2" />Save to Pipeline</>)}
                        </button>
                    </div>
                )}
                <div><h3 className="text-lg font-semibold text-gray-800 mb-2">Fit & Potential Impact Summary</h3><pre className="whitespace-pre-wrap text-gray-700 text-sm font-sans p-4 bg-white rounded-lg border">{fitSummaryResult || 'The summary of the candidate\'s fit will appear here after generation.'}</pre></div>
                <div className="border-t pt-6"><h3 className="text-lg font-semibold text-gray-800 mb-2">Full Unbiased Profile</h3><pre className="whitespace-pre-wrap text-gray-700 text-sm font-sans p-4 bg-white rounded-lg border">{anonymizedResult || 'The unbiased profile will appear here, ready for blind screening.'}</pre></div>
            </div>
        </div>
    );
}