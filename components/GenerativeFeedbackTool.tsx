import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { CompanyProfile, Pipelines } from '../types';
import { exampleData } from '../constants';
import { callGemini } from '../services/geminiService';
import { Edit, ThumbsUp, XCircle, RefreshCcw, Loader2, Send, Paperclip, FileUp, FileText, MessageSquare, Clipboard, CheckCheck, AlertTriangle } from './icons';

interface GenerativeFeedbackToolProps {
  showStatus: (message: string, duration?: number) => void;
  statusMessage: string;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  companyProfile: CompanyProfile;
  setCompanyProfile: React.Dispatch<React.SetStateAction<CompanyProfile>>;
  pipelines: Pipelines;
  setPipelines: React.Dispatch<React.SetStateAction<Pipelines>>;
}

export default function GenerativeFeedbackTool({ showStatus, statusMessage, isLoading, setIsLoading, companyProfile, setCompanyProfile, pipelines, setPipelines }: GenerativeFeedbackToolProps) {
    const resumeInputRef = useRef<HTMLInputElement>(null);
    const notesInputRef = useRef<HTMLInputElement>(null);

    const [candidateName, setCandidateName] = useState('');
    const [jobTitle, setJobTitle] = useState('');
    const [jobDescriptionForFeedback, setJobDescriptionForFeedback] = useState(''); 
    const [applicationStatus, setApplicationStatus] = useState<'HIRED' | 'REJECTED'>('REJECTED'); 
    const [interviewNotes, setInterviewNotes] = useState('');
    
    const [uploadedResumeName, setUploadedResumeName] = useState<string | null>(null);
    const [uploadedNotesName, setUploadedNotesName] = useState<string | null>(null);

    const [feedbackMessage, setFeedbackMessage] = useState('');
    const [isSavedToPipeline, setIsSavedToPipeline] = useState(false);

    const [pipelineToSaveTo, setPipelineToSaveTo] = useState('');
    const pipelineNames = useMemo(() => Object.keys(pipelines), [pipelines]);
    
    useEffect(() => {
        if (!pipelineToSaveTo && pipelineNames.length > 0) {
            setPipelineToSaveTo(pipelineNames[0]);
        }
    }, [pipelineNames, pipelineToSaveTo]);

    const setCompanyName = (name: string) => {
        setCompanyProfile(prev => ({ ...prev, name }));
    };

    const FEEDBACK_SYSTEM_PROMPT = `You are an ethical, professional, and empathetic HR assistant for ${companyProfile.name}. Your goal is to draft a personalized, non-robotic, and constructive communication message to a job candidate. The tone must be supportive and encouraging, always starting with a genuine appreciation for their time. Do not use generic phrases. Clearly mention the specific strength and the ultimate differentiating factor (skill gap or experience) based on the provided notes and the job description. **Crucially, never mention the skills, performance, or existence of other candidates in the message. Focus entirely on the recipient's fit against the job requirements.** Use the company culture (Culture: "${companyProfile.culture}") and org structure (Structure: "${companyProfile.orgStructure}") to contextualize the message if appropriate. For HIRED status, draft a welcoming confirmation message with excitement. For REJECTED status, draft a supportive rejection message.`;

    const handleGenerateFeedback = useCallback(async (name: string, job: string, company: string, jd: string, notes: string, status: 'HIRED' | 'REJECTED') => {
        setIsLoading(true);
        showStatus('Generating personalized feedback...');
        setFeedbackMessage('');
        setIsSavedToPipeline(false);

        try {
            const userQuery = `Draft a personalized and constructive feedback message for the candidate ${name} who applied for the ${job} role at ${company}. The final decision was '${status}'. Consider the job description: "${jd}". Use the following interview notes to highlight a specific strength and clearly explain the skill gap or differentiator that led to the final decision. Interview Notes: "${notes}"`;
            
            const content = await callGemini(userQuery, FEEDBACK_SYSTEM_PROMPT, true);
            setFeedbackMessage(content);
            showStatus(`Feedback for ${status.toLowerCase()} candidate generated successfully.`);
        } catch (error) {
            setFeedbackMessage('Failed to generate feedback due to an API error.');
            showStatus('Error during generation. Check console for details.', 5000);
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, [setIsLoading, showStatus, FEEDBACK_SYSTEM_PROMPT]);

    const handleLoadExample = useCallback((statusKey: keyof typeof exampleData) => {
        const example = exampleData[statusKey];
        if (!example) return;

        setCandidateName(example.name);
        setJobTitle(example.job);
        setCompanyName(example.company); 
        setJobDescriptionForFeedback(example.jd);
        setInterviewNotes(example.notes);
        setApplicationStatus(example.status as 'HIRED' | 'REJECTED');
        setUploadedResumeName(null);
        setUploadedNotesName(null);
        
        showStatus(`Loading example for ${statusKey.replace('_', ' ')} and generating feedback...`);
        handleGenerateFeedback(example.name, example.job, example.company, example.jd, example.notes, example.status as 'HIRED' | 'REJECTED');
    }, [handleGenerateFeedback, showStatus, setCompanyName]);


    const handleCopyFeedback = () => {
        if (!feedbackMessage) return;
        navigator.clipboard.writeText(feedbackMessage).then(() => {
            showStatus('Edited message copied to clipboard!');
        }).catch(err => {
            showStatus('Failed to copy. Please copy manually.', 5000);
            console.error('Failed to copy text: ', err);
        });
    };

    const handleSaveToPipeline = () => {
        if (!feedbackMessage || !candidateName || !pipelineToSaveTo) return;

        const newPipelineEntry = {
            id: Date.now(),
            type: 'feedback' as const,
            candidateName,
            jobTitle,
            applicationStatus,
            feedbackMessage,
        };

        setPipelines(prev => ({
            ...prev,
            [pipelineToSaveTo]: [...(prev[pipelineToSaveTo] || []), newPipelineEntry]
        }));
        setIsSavedToPipeline(true);
        showStatus(`Feedback for ${candidateName} saved to "${pipelineToSaveTo}" pipeline!`);
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, setNameState: React.Dispatch<React.SetStateAction<string | null>>, type: string) => {
        const file = event.target.files?.[0];
        if (file) {
            setNameState(file.name);
            showStatus(`${type} selected: ${file.name}`);
        } else {
            setNameState(null);
        }
    };

    const isGenerateDisabled = isLoading || !candidateName || !jobTitle || !companyProfile.name || !jobDescriptionForFeedback || !interviewNotes;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="p-8 bg-white rounded-2xl shadow-lg border border-gray-200 h-full">
                <h2 className="text-2xl font-semibold text-gray-800 flex items-center mb-6 border-b pb-4">
                    <Edit className="w-6 h-6 mr-3 text-[#4F46E5]" />
                    1. Candidate Context & JD Ingestion
                </h2>
                
                <div className="mb-6 p-4 border border-indigo-300 bg-indigo-50 rounded-lg">
                    <p className="font-medium text-indigo-700 mb-3 text-sm">Load Example Data:</p>
                    <div className="flex flex-wrap gap-3">
                        <button onClick={() => handleLoadExample('HIRED')} disabled={isLoading} className="flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-full hover:bg-green-700 transition duration-150 shadow-md disabled:opacity-50"><ThumbsUp className="w-4 h-4 mr-2" /> Hired</button>
                        <button onClick={() => handleLoadExample('REJECTED_PIPELINE')} disabled={isLoading} className="flex items-center px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-full hover:bg-amber-700 transition duration-150 shadow-md disabled:opacity-50"><RefreshCcw className="w-4 h-4 mr-2" /> Pipeline</button>
                        <button onClick={() => handleLoadExample('REJECTED')} disabled={isLoading} className="flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-full hover:bg-red-700 transition duration-150 shadow-md disabled:opacity-50"><XCircle className="w-4 h-4 mr-2" /> Standard Rejected</button>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <label className="block"><span className="text-gray-700 font-medium">Candidate Name</span><input type="text" value={candidateName} onChange={(e) => setCandidateName(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3 bg-white text-black" placeholder="e.g., Jane Doe" /></label>
                        <label className="block"><span className="text-gray-700 font-medium">Company Name</span> <input type="text" value={companyProfile.name} onChange={(e) => setCompanyName(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3 bg-white text-black" placeholder="e.g., Acme Corp"/></label>
                    </div>
                    <label className="block"><span className="text-gray-700 font-medium">Job Title</span><input type="text" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3 bg-white text-black" placeholder="e.g., DevOps Engineer"/></label>
                    <label className="block"><span className="text-gray-700 font-medium">Application Status</span><select value={applicationStatus} onChange={(e) => setApplicationStatus(e.target.value as 'HIRED'|'REJECTED')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3 bg-white text-black"><option value="REJECTED">REJECTED</option><option value="HIRED">HIRED</option></select></label>
                    <label className="block pt-2"><span className="text-gray-700 font-medium">Full Job Description (JD Ingestion)</span> <textarea value={jobDescriptionForFeedback} onChange={(e) => setJobDescriptionForFeedback(e.target.value)} rows={4} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3 bg-white text-black" placeholder="Paste the full job description here. This ensures the feedback is mapped to the exact requirements."/></label>
                    <div className="pt-2">
                        <span className="text-gray-700 font-medium flex items-center mb-2"><Paperclip className="w-4 h-4 mr-2 text-indigo-500" />Source Documents (Simulation)</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <input type="file" ref={resumeInputRef} onChange={(e) => handleFileChange(e, setUploadedResumeName, 'CV/Cover Letter')} accept=".pdf,.doc,.docx,.txt" className="hidden"/>
                            <button onClick={() => resumeInputRef.current?.click()} className="w-full text-center p-3 text-sm rounded-lg border-2 border-dashed border-gray-300 hover:border-indigo-500 transition duration-150 bg-gray-50 hover:bg-white text-gray-700 truncate" title={uploadedResumeName || 'Upload CV/Cover Letter'}><FileUp className="w-4 h-4 inline mr-2" />{uploadedResumeName ? `Resume: ${uploadedResumeName}` : 'Upload CV/Cover Letter'}</button>
                            <input type="file" ref={notesInputRef} onChange={(e) => handleFileChange(e, setUploadedNotesName, 'Meeting Notes')} accept=".pdf,.doc,.docx,.txt" className="hidden"/>
                            <button onClick={() => notesInputRef.current?.click()} className="w-full text-center p-3 text-sm rounded-lg border-2 border-dashed border-gray-300 hover:border-indigo-500 transition duration-150 bg-gray-50 hover:bg-white text-gray-700 truncate" title={uploadedNotesName || 'Upload Meeting Notes File'}><FileText className="w-4 h-4 inline mr-2" />{uploadedNotesName ? `Notes: ${uploadedNotesName}` : 'Upload Meeting Notes File'}</button>
                        </div>
                    </div>
                    <label className="block pt-2"><span className="text-gray-700 font-medium">Interview Notes / Differentiating Factors (For AI Input)</span><textarea value={interviewNotes} onChange={(e) => setInterviewNotes(e.target.value)} rows={6} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3 bg-white text-black" placeholder="e.g., Strong communication skills, but lacked experience with X framework. The final decision was due to needing more specific Y experience."/></label>
                </div>
                <button onClick={() => handleGenerateFeedback(candidateName, jobTitle, companyProfile.name, jobDescriptionForFeedback, interviewNotes, applicationStatus)} disabled={isGenerateDisabled} className="mt-6 w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-[#4F46E5] hover:bg-[#4338CA] transition duration-150 shadow-md disabled:opacity-50 disabled:cursor-not-allowed">{isLoading ? (<Loader2 className="w-5 h-5 mr-2 animate-spin" />) : (<Send className="w-5 h-5 mr-2" />)}Generate Personalized Message</button>
            </div>
            <div className="p-8 bg-white rounded-2xl shadow-lg border border-gray-200 h-full flex flex-col">
                <h2 className="text-2xl font-semibold text-gray-800 flex items-center mb-6 border-b pb-4"><MessageSquare className="w-6 h-6 mr-3 text-[#4F46E5]" />2. Generated Communication (Editable)</h2>
                <div className={`p-3 rounded-lg text-sm mb-4 transition-all duration-300 ${statusMessage ? 'opacity-100 bg-blue-100 border-blue-400 text-blue-800' : 'opacity-0 h-0 p-0 overflow-hidden'}`}>{statusMessage}</div>
                <div className="flex-grow relative">{isLoading && (<div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center rounded-lg z-10"><Loader2 className="w-8 h-8 text-indigo-600 animate-spin" /><span className="ml-3 text-lg text-indigo-600">Generating...</span></div>)}<textarea value={feedbackMessage} onChange={(e) => setFeedbackMessage(e.target.value)} rows={15} className="w-full h-full min-h-[300px] rounded-md border-gray-300 bg-white shadow-inner p-4 text-black resize-none font-sans text-sm" placeholder="Your personalized, constructive feedback message will appear here after generation. This field is editable."/></div>
                <div className="mt-4 flex flex-col sm:flex-row gap-3">
                    <button onClick={handleCopyFeedback} disabled={!feedbackMessage || isLoading} className="flex-1 flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-lg text-indigo-600 bg-indigo-100 hover:bg-indigo-200 transition duration-150 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"><Clipboard className="w-5 h-5 mr-2" />Copy Edited Message</button>
                     <div className="flex-1 flex flex-col gap-2">
                         <select value={pipelineToSaveTo} onChange={(e) => setPipelineToSaveTo(e.target.value)} className="w-full p-3 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white text-black" disabled={pipelineNames.length === 0}>
                             {pipelineNames.length > 0 ? (pipelineNames.map(name => <option key={name} value={name}>{name}</option>)) : (<option>Create a pipeline first</option>)}
                        </select>
                        <button onClick={handleSaveToPipeline} disabled={!feedbackMessage || isLoading || isSavedToPipeline || !pipelineToSaveTo} className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-teal-600 hover:bg-teal-700 transition duration-150 shadow-md disabled:opacity-50 disabled:cursor-not-allowed">{isSavedToPipeline ? (<><CheckCheck className="w-5 h-5 mr-2" /> Saved</>) : (<><FileUp className="w-5 h-5 mr-2" /> Save to Pipeline</>)}</button>
                    </div>
                </div>
                <div className="mt-4 text-xs text-gray-500 text-center"><AlertTriangle className="inline w-3 h-3 mr-1" />Powered by Gemini 2.5 Flash (with Google Search Grounding for context).</div>
            </div>
        </div>
    );
}