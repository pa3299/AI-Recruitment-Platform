import React, { useState, useCallback, useRef } from 'react';
import { CompanyProfile, FileMetadata } from '../types';
import { callGemini } from '../services/geminiService';
import { FileText, Paperclip, FileUp, X, FileImage, FileSpreadsheet, File, Zap, Loader2 } from './icons';

interface CompanyProfileToolProps {
  showStatus: (message: string, duration?: number) => void;
  companyProfile: CompanyProfile;
  setCompanyProfile: React.Dispatch<React.SetStateAction<CompanyProfile>>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function CompanyProfileTool({ showStatus, companyProfile, setCompanyProfile, isLoading, setIsLoading }: CompanyProfileToolProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const MAX_FILES = 5;

    const formatBytes = (bytes: number, decimals = 2): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    };

    const getFileIcon = (mimeType: string) => {
        if (mimeType.includes('image')) return FileImage;
        if (mimeType.includes('pdf')) return FileText;
        if (mimeType.includes('wordprocessingml') || mimeType.includes('doc')) return FileSpreadsheet; 
        if (mimeType.includes('text')) return FileText;
        return File;
    };

    const handleChange = (field: keyof Omit<CompanyProfile, 'files'>) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setCompanyProfile(prev => ({
            ...prev,
            [field]: e.target.value
        }));
    };

    const handleGenerateField = useCallback(async (field: 'culture' | 'orgStructure' | 'guidelines') => {
        setIsLoading(true);
        showStatus(`Generating content for ${field}...`);
        
        let userQuery = '';
        const systemPrompt = `You are a helpful HR and branding assistant. Generate a concise, professional, and well-written response based on the user's request for their company profile.`;
        
        switch (field) {
            case 'culture':
                userQuery = `Generate a core company culture statement for a company named '${companyProfile.name}'. The statement should be inspiring and suitable for a recruitment platform, focusing on themes like collaboration, innovation, and employee growth. Output a single paragraph.`;
                break;
            case 'orgStructure':
                userQuery = `Generate a brief, generic description of a common company organizational structure for '${companyProfile.name}'. For example, 'Hierarchical with a flat management layer in engineering. Report to managers, not directors.'`;
                break;
            case 'guidelines':
                userQuery = `Generate a set of recruitment and job description guidelines for '${companyProfile.name}'. The guidelines should promote inclusive and clear language, and advise against using jargon or creating false urgency. Format as a short paragraph.`;
                break;
        }

        try {
            const result = await callGemini(userQuery, systemPrompt);
            setCompanyProfile(prev => ({ ...prev, [field]: result }));
            showStatus(`Successfully generated content for ${field}.`);
        } catch (error) {
            console.error(`Failed to generate content for ${field}:`, error);
            showStatus(`Error generating content for ${field}.`, 5000);
        } finally {
            setIsLoading(false);
        }
    }, [companyProfile.name, setIsLoading, showStatus, setCompanyProfile]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLDivElement>) => {
        const files = 'dataTransfer' in e ? e.dataTransfer.files : e.target.files;
        const newFiles: File[] = Array.from(files || []);
        
        setCompanyProfile(prev => {
            const currentFiles = prev.files;
            
            if (currentFiles.length + newFiles.length > MAX_FILES) {
                showStatus(`Warning: Cannot add all files. Maximum ${MAX_FILES} documents allowed.`, 5000);
                return prev;
            }

            const uniqueNewFiles = newFiles.filter(newFile => 
                !currentFiles.some(existingFile => existingFile.name === newFile.name)
            );

            if (uniqueNewFiles.length < newFiles.length) {
                showStatus(`Warning: ${newFiles.length - uniqueNewFiles.length} file(s) skipped (duplicate name).`, 5000);
            }

            const fileMetadata: FileMetadata[] = uniqueNewFiles.map(file => ({
                name: file.name,
                size: file.size,
                type: file.type,
            }));

            const updatedFiles = [...currentFiles, ...fileMetadata];
            
            showStatus(`Added ${fileMetadata.length} file(s) to the profile list.`);

            return {
                ...prev,
                files: updatedFiles,
            };
        });

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };
    
    const handleRemoveFile = (fileName: string) => {
        setCompanyProfile(prev => {
            const updatedFiles = prev.files.filter(file => file.name !== fileName);
            showStatus(`Removed file: ${fileName}.`);
            return {
                ...prev,
                files: updatedFiles,
            };
        });
    };

    const [isDragOver, setIsDragOver] = useState(false);
    
    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragOver(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragOver(false);
        handleFileSelect(e);
    }, [handleFileSelect]);


    return (
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-800 flex items-center mb-6">
                <FileText className="w-6 h-6 mr-3 text-[#4F46E5]" />
                Company Profile & Context Base
            </h2>

            <div className="space-y-6">
                <div className="text-sm text-[#4338CA] p-4 bg-[#EEF2FF] rounded-lg border border-[#C7D2FE]">
                    This context base ensures all tools align with your company's identity and values. Changes here will immediately reflect across the suite.
                </div>

                <div>
                    <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                    <input
                        id="companyName"
                        type="text"
                        value={companyProfile.name}
                        onChange={handleChange('name')}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#4F46E5] focus:ring-[#4F46E5] p-3 bg-white text-black"
                        placeholder="e.g., Acme Corp"
                    />
                </div>

                <div>
                    <div className="flex justify-between items-center mb-1">
                        <label htmlFor="culture" className="block text-sm font-medium text-gray-700">Core Company Culture Statement / Values</label>
                        <button onClick={() => handleGenerateField('culture')} disabled={isLoading} className="text-xs flex items-center px-3 py-1 bg-indigo-100 text-[#4338CA] rounded-md hover:bg-indigo-200 disabled:opacity-50 font-semibold">
                            {isLoading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Zap className="w-4 h-4 mr-1"/>}
                            Generate
                        </button>
                    </div>
                    <textarea
                        id="culture"
                        value={companyProfile.culture}
                        onChange={handleChange('culture')}
                        rows={4}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#4F46E5] focus:ring-[#4F46E5] p-3 bg-white text-black"
                        placeholder="e.g., Collaborative, growth-focused environment valuing transparency and continuous learning."
                    />
                </div>

                <div>
                     <div className="flex justify-between items-center mb-1">
                        <label htmlFor="orgStructure" className="block text-sm font-medium text-gray-700">Organizational Chart/Structure Notes (Internal Context)</label>
                        <button onClick={() => handleGenerateField('orgStructure')} disabled={isLoading} className="text-xs flex items-center px-3 py-1 bg-indigo-100 text-[#4338CA] rounded-md hover:bg-indigo-200 disabled:opacity-50 font-semibold">
                             {isLoading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Zap className="w-4 h-4 mr-1"/>}
                            Generate
                        </button>
                    </div>
                    <textarea
                        id="orgStructure"
                        value={companyProfile.orgStructure}
                        onChange={handleChange('orgStructure')}
                        rows={4}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#4F46E5] focus:ring-[#4F46E5] p-3 bg-white text-black"
                        placeholder="e.g., Hierarchical with a flat management layer in engineering. Report to managers, not directors."
                    />
                </div>

                <div>
                    <div className="flex justify-between items-center mb-1">
                        <label htmlFor="guidelines" className="block text-sm font-medium text-gray-700">Recruitment/JD Guidelines (Tone/Style Rules)</label>
                         <button onClick={() => handleGenerateField('guidelines')} disabled={isLoading} className="text-xs flex items-center px-3 py-1 bg-indigo-100 text-[#4338CA] rounded-md hover:bg-indigo-200 disabled:opacity-50 font-semibold">
                             {isLoading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Zap className="w-4 h-4 mr-1"/>}
                            Generate
                        </button>
                    </div>
                    <textarea
                        id="guidelines"
                        value={companyProfile.guidelines}
                        onChange={handleChange('guidelines')}
                        rows={4}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#4F46E5] focus:ring-[#4F46E5] p-3 bg-white text-black"
                        placeholder="e.g., Use inclusive, plain language. Avoid urgency and competitive jargon."
                    />
                </div>

                <div className="pt-6 border-t border-gray-200 mt-2">
                    <h3 className="text-lg font-semibold text-gray-700 flex items-center mb-4">
                        <Paperclip className="w-5 h-5 mr-2 text-[#4F46E5]" />
                        Supporting Documents (<span className='font-bold ml-1'>{companyProfile.files.length}</span> / {MAX_FILES})
                    </h3>
                    
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`flex flex-col items-center justify-center p-6 rounded-lg text-center cursor-pointer transition duration-200 
                            ${isDragOver ? 'border-[#4F46E5] bg-indigo-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'} 
                            border-2 border-dashed
                        `}
                    >
                        <FileUp className="w-8 h-8 text-indigo-500 mb-2" />
                        <p className="text-sm font-medium text-gray-600">
                            Drag and drop files here, or <span className="text-[#4F46E5] font-bold hover:text-indigo-700">click to browse</span>
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Accepted: PDF, DOCX, Images, TXT. Max {MAX_FILES} files.</p>
                        <input
                            type="file"
                            multiple
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                            accept=".pdf,.doc,.docx,image/jpeg,image/png,image/gif,.txt"
                            className="hidden"
                        />
                    </div>
                    
                    <ul className="mt-4 space-y-3">
                        {companyProfile.files.length === 0 ? (
                            <li className="text-sm text-gray-500 p-3 bg-white rounded-lg border border-gray-200">
                                No documents uploaded yet.
                            </li>
                        ) : (
                            companyProfile.files.map((file, index) => {
                                const Icon = getFileIcon(file.type);
                                return (
                                    <li key={index} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm border border-gray-200">
                                        <div className="flex items-center space-x-3 min-w-0">
                                            <Icon className="w-5 h-5 text-[#4F46E5] flex-shrink-0" />
                                            <div className='min-w-0'>
                                                <p className="text-sm font-medium text-gray-800 truncate" title={file.name}>{file.name}</p>
                                                <p className="text-xs text-gray-500">{file.type.split('/')[1]?.toUpperCase() || 'Unknown'} - {formatBytes(file.size)}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleRemoveFile(file.name)}
                                            className="p-1 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition duration-150 flex-shrink-0"
                                            title={`Remove ${file.name}`}
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </li>
                                );
                            })
                        )}
                    </ul>
                </div>
                <div className="flex justify-end mt-8">
                    <button
                        onClick={() => showStatus('Company profile changes saved!')}
                        className="px-8 py-3 bg-[#4F46E5] text-white rounded-lg font-semibold shadow-md hover:bg-[#4338CA] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4F46E5] transition"
                        disabled={isLoading}
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}