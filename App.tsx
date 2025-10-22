
import React, { useState, useCallback } from 'react';
import { CompanyProfile, Pipelines } from './types';
import { Landmark, ShieldCheck, Users, Rss, MessageSquareMore, MessageSquare, ScanSearch, DollarSign } from './components/icons';
import CompanyProfileTool from './components/CompanyProfileTool';
import UnbiasedProfileGeneratorTool from './components/UnbiasedProfileGeneratorTool';
import CandidatePipelineTool from './components/CandidatePipelineTool';
import JobBroadcasterTool from './components/JobBroadcasterTool';
import InterviewQuestionGeneratorTool from './components/InterviewQuestionGeneratorTool';
import GenerativeFeedbackTool from './components/GenerativeFeedbackTool';
import JDAnalysisTool from './components/JDAnalysisTool';
import CompensationEngineTool from './components/CompensationEngineTool';

export default function App() {
    const [companyProfile, setCompanyProfile] = useState<CompanyProfile>({
        name: 'Acme Corp',
        culture: 'A collaborative, growth-focused environment valuing transparency and continuous learning.',
        orgStructure: 'Hierarchical with a flat management layer in engineering. Report to managers, not directors.',
        guidelines: 'Use inclusive, plain language. Avoid urgency and competitive jargon.',
        files: [],
    });
    
    const [activeTool, setActiveTool] = useState('profile'); 
    const [statusMessage, setStatusMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [pipelines, setPipelines] = useState<Pipelines>({});
    const [broadcastJobDescription, setBroadcastJobDescription] = useState('');


    const showStatus = useCallback((message: string, duration = 3000) => {
        setStatusMessage(message);
        setTimeout(() => {
            setStatusMessage('');
        }, duration);
    }, []);

    const renderTool = () => {
        const commonProps = { 
            showStatus, statusMessage, isLoading, setIsLoading,
            companyProfile, setCompanyProfile,
            pipelines, setPipelines,
            broadcastJobDescription, setBroadcastJobDescription
        };
        switch (activeTool) {
            case 'analysis':
                return <JDAnalysisTool {...commonProps} />;
            case 'compensation':
                return <CompensationEngineTool {...commonProps} />;
            case 'profile':
                return <CompanyProfileTool {...commonProps} />;
            case 'questions': 
                return <InterviewQuestionGeneratorTool {...commonProps} />;
            case 'anonymize':
                return <UnbiasedProfileGeneratorTool {...commonProps} />;
            case 'pipeline':
                return <CandidatePipelineTool {...commonProps} />;
            case 'broadcast':
                return <JobBroadcasterTool {...commonProps} />;
            case 'feedback':
                return <GenerativeFeedbackTool {...commonProps} />;
            default:
                return <CompanyProfileTool {...commonProps} />;
        }
    };

    const navItems = [
        { id: 'profile', label: 'Company Profile', icon: Landmark },
        { id: 'anonymize', label: 'Unbiased Profile Generator ✨', icon: ShieldCheck },
        { id: 'pipeline', label: 'Candidate Pipeline', icon: Users },
        { id: 'analysis', label: 'JD Bias Audit ✨', icon: ScanSearch },
        { id: 'compensation', label: 'Compensation Engine ✨', icon: DollarSign },
        { id: 'questions', label: 'Interview Generator ✨', icon: MessageSquareMore },
        { id: 'feedback', label: 'Generative Feedback ✨', icon: MessageSquare },
        { id: 'broadcast', label: 'Broadcast Job', icon: Rss },
    ];

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-8 font-sans">
            <header className="text-center mb-8">
                <h1 className="text-4xl font-extrabold text-gray-900 flex items-center justify-center">
                    <Landmark className="w-8 h-8 mr-3 text-indigo-600" />
                    The AI Recruitment Suite
                </h1>
                <p className="text-gray-500 mt-2">Centralized tools for unbiased sourcing, competitive compensation, and empathetic candidate communication.</p>
            </header>

            <nav className="max-w-5xl mx-auto mb-8 bg-white p-2 rounded-xl shadow-lg border border-gray-200">
                <div className="flex justify-around flex-wrap space-x-1 sm:space-x-0">
                    {navItems.map(item => {
                        const Icon = item.icon;
                        const isActive = activeTool === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveTool(item.id)}
                                className={`flex-1 flex items-center justify-center p-3 rounded-lg transition duration-150 text-sm font-medium ${
                                    isActive 
                                        ? 'bg-indigo-600 text-white shadow-md' 
                                        : 'text-gray-600 hover:bg-gray-100 hover:text-indigo-600'
                                }`}
                                disabled={isLoading}
                            >
                                <Icon className="w-5 h-5 mr-2 hidden sm:inline" />
                                {item.label}
                            </button>
                        );
                    })}
                </div>
            </nav>

            <main className="max-w-5xl mx-auto">
                {renderTool()}
            </main>
        </div>
    );
}
