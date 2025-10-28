import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Pipelines, PipelineEntry } from '../types';
import { Users, PlusCircle, GripVertical, Edit, CheckCheck, XCircle, X, ChevronUp, ChevronDown } from './icons';

interface CandidatePipelineToolProps {
  showStatus: (message: string, duration?: number) => void;
  pipelines: Pipelines;
  setPipelines: React.Dispatch<React.SetStateAction<Pipelines>>;
}

export default function CandidatePipelineTool({ showStatus, pipelines, setPipelines }: CandidatePipelineToolProps) {
    const [activePipeline, setActivePipeline] = useState<string | null>(null);
    const [newPipelineName, setNewPipelineName] = useState('');

    const [expandedProfileId, setExpandedProfileId] = useState<number | null>(null);
    const [editingProfileId, setEditingProfileId] = useState<number | null>(null);
    const [editedName, setEditedName] = useState('');

    const dragItem = useRef<number | null>(null);
    const dragOverItem = useRef<number | null>(null);
    
    const pipelineNames = useMemo(() => Object.keys(pipelines), [pipelines]);
    const currentProfiles = useMemo(() => (activePipeline && pipelines[activePipeline]) ? pipelines[activePipeline] : [], [pipelines, activePipeline]);

    useEffect(() => {
        if (!activePipeline || !pipelines[activePipeline]) {
            setActivePipeline(pipelineNames[0] || null);
        }
    }, [pipelines, activePipeline, pipelineNames]);


    const handleCreatePipeline = () => {
        if (!newPipelineName.trim()) {
            showStatus('Pipeline name cannot be empty.', 3000);
            return;
        }
        if (pipelines[newPipelineName.trim()]) {
            showStatus('A pipeline with this name already exists.', 3000);
            return;
        }
        const trimmedName = newPipelineName.trim();
        setPipelines(prev => ({ ...prev, [trimmedName]: [] }));
        setActivePipeline(trimmedName);
        setNewPipelineName('');
        showStatus(`Pipeline "${trimmedName}" created.`, 3000);
    };

    const handleDeleteProfile = (profileId: number) => {
        if (!activePipeline) return;
        const updatedProfiles = currentProfiles.filter(p => p.id !== profileId);
        setPipelines(prev => ({ ...prev, [activePipeline]: updatedProfiles }));
        showStatus('Entry removed from pipeline.', 3000);
    };

    const handleToggleExpand = (profileId: number) => {
        if (editingProfileId && editingProfileId !== profileId) return;
        setExpandedProfileId(currentId => (currentId === profileId ? null : profileId));
    };

    const handleStartEditing = (profile: PipelineEntry) => {
        setEditingProfileId(profile.id);
        setEditedName(profile.candidateName || '');
    };

    const handleCancelEditing = () => {
        setEditingProfileId(null);
        setEditedName('');
    };

    const handleSaveName = (profileId: number) => {
        if (!activePipeline) return;
        if (!editedName.trim()) {
            showStatus('Candidate name cannot be empty.', 3000);
            return;
        }
        const updatedProfiles = currentProfiles.map(p =>
            p.id === profileId ? { ...p, candidateName: editedName.trim() } : p
        );
        setPipelines(prev => ({ ...prev, [activePipeline]: updatedProfiles }));
        setEditingProfileId(null);
        setEditedName('');
        showStatus('Candidate name updated.', 3000);
    };

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        if (editingProfileId) { e.preventDefault(); return; }
        dragItem.current = index;
        e.dataTransfer.effectAllowed = 'move';
        (e.target as HTMLElement).style.cursor = 'grabbing';
    };

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>, index: number) => { dragOverItem.current = index; };
    const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
        (e.target as HTMLElement).style.cursor = 'grab';
        dragItem.current = null;
        dragOverItem.current = null;
    };

    const handleDrop = () => {
        if (dragItem.current === null || dragOverItem.current === null || !activePipeline) return;
        const newProfiles = [...currentProfiles];
        const draggedItemContent = newProfiles.splice(dragItem.current, 1)[0];
        newProfiles.splice(dragOverItem.current, 0, draggedItemContent);
        setPipelines(prev => ({ ...prev, [activePipeline]: newProfiles }));
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                    <h2 className="text-2xl font-semibold text-gray-800 flex items-center"><Users className="w-6 h-6 mr-3 text-[#4F46E5]" />Candidate Pipeline</h2>
                    {pipelineNames.length > 0 && (<select value={activePipeline || ''} onChange={(e) => setActivePipeline(e.target.value)} className="p-3 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white text-black">{pipelineNames.map(name => <option key={name} value={name}>{name}</option>)}</select>)}
                </div>
                <div className="p-4 bg-gray-50 rounded-lg border">
                    <div className="flex flex-col sm:flex-row gap-2">
                        <input type="text" value={newPipelineName} onChange={(e) => setNewPipelineName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleCreatePipeline()} placeholder="New pipeline name (e.g., Senior Frontend Dev)" className="flex-grow block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3 bg-white text-black"/>
                        <button onClick={handleCreatePipeline} className="w-full sm:w-auto flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"><PlusCircle className="w-5 h-5 mr-2" />Create Pipeline</button>
                    </div>
                </div>
            </div>
            {!activePipeline ? (
                <div className="text-center p-10 bg-white rounded-2xl shadow-lg border border-gray-200"><Users className="w-12 h-12 mx-auto text-gray-300" /><h3 className="mt-4 text-lg font-medium text-gray-800">No pipelines created yet.</h3><p className="mt-1 text-sm text-gray-500">Create your first pipeline above to start organizing candidates.</p></div>
            ) : currentProfiles.length === 0 ? (
                <div className="text-center p-10 bg-white rounded-2xl shadow-lg border border-gray-200"><Users className="w-12 h-12 mx-auto text-gray-300" /><h3 className="mt-4 text-lg font-medium text-gray-800">The "{activePipeline}" pipeline is empty.</h3><p className="mt-1 text-sm text-gray-500">Go to another tool to save profiles or feedback to this pipeline.</p></div>
            ) : (
                <div className="space-y-4">
                    {currentProfiles.map((profile, index) => {
                        const isExpanded = expandedProfileId === profile.id;
                        const isEditing = editingProfileId === profile.id;

                        return (
                             <div key={profile.id} draggable={!isEditing} onDragStart={(e) => handleDragStart(e, index)} onDragEnter={(e) => handleDragEnter(e, index)} onDragEnd={handleDragEnd} onDrop={handleDrop} onDragOver={(e) => e.preventDefault()} className="p-6 bg-white rounded-2xl shadow-lg border border-gray-200 transition-all duration-200 hover:border-indigo-400 hover:shadow-xl group">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center flex-grow min-w-0">
                                        <div className="flex items-center"><GripVertical className={`w-6 h-6 text-gray-400 mr-4 ${isEditing ? 'cursor-not-allowed' : 'cursor-grab'}`} /><span className="text-2xl font-bold text-indigo-600 w-10">#{index + 1}</span></div>
                                        {isEditing ? (
                                            <div className="flex items-center gap-2 w-full">
                                                <input type="text" value={editedName} onChange={(e) => setEditedName(e.target.value)} onClick={(e) => e.stopPropagation()} onKeyDown={(e) => { if (e.key === 'Enter') handleSaveName(profile.id); if (e.key === 'Escape') handleCancelEditing(); }} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 text-lg font-semibold bg-white text-black" autoFocus/>
                                                <button onClick={(e) => { e.stopPropagation(); handleSaveName(profile.id); }} className="p-2 rounded-full text-green-600 hover:bg-green-100" title="Save"><CheckCheck className="w-5 h-5" /></button>
                                                <button onClick={(e) => { e.stopPropagation(); handleCancelEditing(); }} className="p-2 rounded-full text-red-600 hover:bg-red-100" title="Cancel"><XCircle className="w-5 h-5" /></button>
                                            </div>
                                        ) : (
                                            <div onClick={() => handleToggleExpand(profile.id)} className="cursor-pointer flex-grow min-w-0 flex items-center">
                                                <div>
                                                    {profile.type === 'feedback' ? (
                                                        <div><h3 className="text-lg font-semibold text-gray-800 truncate">{profile.candidateName}</h3><p className="text-sm text-gray-500 truncate">{profile.jobTitle}</p><span className={`mt-2 inline-block px-2 py-1 text-xs font-medium rounded-full ${profile.applicationStatus === 'HIRED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{profile.applicationStatus}</span></div>
                                                    ) : (
                                                        <div><h3 className="text-lg font-semibold text-gray-800 truncate">{profile.candidateName || `Profile #${profile.id}`}</h3><p className="text-sm text-gray-500">Unbiased Profile</p></div>
                                                    )}
                                                </div>
                                                <button onClick={(e) => { e.stopPropagation(); handleStartEditing(profile); }} className="p-1 rounded-full text-gray-400 hover:text-indigo-600 hover:bg-indigo-100 ml-3 opacity-0 group-hover:opacity-100 transition-opacity" title="Edit Name"><Edit className="w-4 h-4" /></button>
                                            </div>
                                        )}
                                    </div>
                                    {!isEditing && (
                                        <div className="flex items-center flex-shrink-0 ml-4">
                                            <button onClick={(e) => { e.stopPropagation(); handleDeleteProfile(profile.id); }} className="p-2 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-100 transition duration-150" title="Delete Entry"><X className="w-5 h-5" /></button>
                                            <button onClick={() => handleToggleExpand(profile.id)} className="p-2 rounded-full text-gray-500 hover:bg-gray-100">{isExpanded ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}</button>
                                        </div>
                                    )}
                                </div>
                                {isExpanded && (
                                    <div className="mt-4 pt-4 pl-10 border-t border-gray-200">
                                        {profile.type === 'feedback' ? (
                                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200"><h4 className="font-semibold text-gray-700 mb-2">Saved Feedback Message</h4><pre className="whitespace-pre-wrap text-gray-600 text-sm font-sans">{profile.feedbackMessage}</pre></div>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200"><h4 className="font-semibold text-gray-700 mb-2">Fit & Impact Summary</h4><pre className="whitespace-pre-wrap text-gray-600 text-sm font-sans">{profile.fitSummaryResult}</pre></div>
                                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200"><h4 className="font-semibold text-gray-700 mb-2">Unbiased Profile</h4><pre className="whitespace-pre-wrap text-gray-600 text-sm font-sans">{profile.anonymizedResult}</pre></div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}