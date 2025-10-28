import React, { useState, useCallback } from 'react';
import { CompanyProfile, Pipelines } from './types';
import { AiSuiteLogo, ShieldCheck, Users, Rss, MessageSquareMore, MessageSquare, ScanSearch, DollarSign, FileText, Settings, LogOut } from './components/icons';
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

    const navItems = [
        { id: 'profile', label: 'Company Profile', icon: FileText },
        { id: 'anonymize', label: 'Unbiased Generator', icon: ShieldCheck },
        { id: 'pipeline', label: 'Candidate Pipeline', icon: Users },
        { id: 'analysis', label: 'JD Bias Audit', icon: ScanSearch },
        { id: 'compensation', label: 'Compensation Engine', icon: DollarSign },
        { id: 'questions', label: 'Interview Generator', icon: MessageSquareMore },
        { id: 'feedback', label: 'Generative Feedback', icon: MessageSquare },
        { id: 'broadcast', label: 'Broadcast Job', icon: Rss },
    ];

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

    return (
        <div className="flex min-h-screen bg-[#F8F9FA] font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-[#0F172A] text-white flex flex-col fixed h-full">
                <div className="flex items-center justify-center h-20 border-b border-gray-700">
                    <AiSuiteLogo className="w-8 h-8 mr-2" />
                    <h1 className="text-xl font-bold">AI Suite</h1>
                </div>
                <nav className="flex-grow p-4 space-y-2">
                    {navItems.map(item => {
                         const Icon = item.icon;
                         const isActive = activeTool === item.id;
                         return (
                             <button
                                 key={item.id}
                                 onClick={() => setActiveTool(item.id)}
                                 className={`w-full flex items-center p-3 rounded-lg transition duration-150 text-sm font-medium text-left ${
                                     isActive 
                                         ? 'bg-[#4F46E5] text-white' 
                                         : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                 }`}
                                 disabled={isLoading}
                             >
                                 <Icon className="w-5 h-5 mr-3" />
                                 {item.label}
                             </button>
                         );
                    })}
                </nav>
                <div className="p-4 border-t border-gray-700 space-y-2">
                     <button className="w-full flex items-center p-3 rounded-lg transition duration-150 text-sm font-medium text-left text-gray-300 hover:bg-gray-700 hover:text-white">
                        <Settings className="w-5 h-5 mr-3" />
                        Settings
                    </button>
                     <button className="w-full flex items-center p-3 rounded-lg transition duration-150 text-sm font-medium text-left text-gray-300 hover:bg-gray-700 hover:text-white">
                        <LogOut className="w-5 h-5 mr-3" />
                        Logout
                    </button>
                </div>
            </aside>
            
            {/* Main Content */}
            <main className="flex-1 ml-64 p-10">
                 <header className="text-center mb-10">
                    <AiSuiteLogo className="w-16 h-16 inline-block text-[#0F172A] mb-4" />
                    <h1 className="text-4xl font-extrabold text-gray-800">
                        The AI Recruitment Suite
                    </h1>
                    <p className="text-gray-500 mt-2 max-w-2xl mx-auto">Centralized tools for unbiased sourcing, competitive compensation, and empathetic candidate communication.</p>
                </header>

                <div className="max-w-7xl mx-auto">
                    {renderTool()}
                </div>
            </main>
        </div>
    );
}