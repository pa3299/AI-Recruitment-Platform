
import React, { useState } from 'react';
import { User, Mail, Sun, Moon, Monitor, Loader2, CheckCheck, FileUp } from './icons';

interface SettingsToolProps {
  showStatus: (message: string, duration?: number) => void;
  theme: string;
  setTheme: (theme: string) => void;
}

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="pt-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 pb-2 border-b border-gray-200 dark:border-slate-700">{title}</h3>
        <div className="space-y-4">{children}</div>
    </div>
);

export default function SettingsTool({ showStatus, theme, setTheme }: SettingsToolProps) {
    const [profile, setProfile] = useState({
        name: 'Alex Doe',
        username: 'alex_doe',
        email: 'alex.doe@acmecorp.com',
        avatar: 'https://i.pravatar.cc/150?u=alexdoe'
    });
    const [connections, setConnections] = useState({
        linkedin: true,
        indeed: false,
        glassdoor: false
    });
    const [isConnecting, setIsConnecting] = useState('');

    const teamMembers = [
        { name: 'Alex Doe', email: 'alex.doe@acmecorp.com', role: 'Admin', avatar: 'https://i.pravatar.cc/150?u=alexdoe' },
        { name: 'Jane Smith', email: 'jane.smith@acmecorp.com', role: 'Hiring Manager', avatar: 'https://i.pravatar.cc/150?u=janesmith' },
    ];
    
    const handleProfileChange = (field: keyof typeof profile) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setProfile(prev => ({ ...prev, [field]: e.target.value }));
    };

    const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setProfile(prev => ({...prev, avatar: event.target?.result as string}));
                showStatus('Profile picture updated!');
            };
            reader.readAsDataURL(file);
        }
    };

    const handleConnectionToggle = (platform: keyof typeof connections) => {
        setIsConnecting(platform);
        showStatus(`Simulating ${connections[platform] ? 'disconnection' : 'connection'} for ${platform}...`);
        setTimeout(() => {
            setConnections(prev => ({ ...prev, [platform]: !prev[platform] }));
            setIsConnecting('');
            showStatus(`${platform} has been ${connections[platform] ? 'disconnected' : 'connected'}.`);
        }, 1500);
    };

    const handleInvite = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const email = (e.currentTarget.elements.namedItem('inviteEmail') as HTMLInputElement).value;
        if (email) {
            showStatus(`Invitation sent to ${email} (simulation).`);
            (e.currentTarget.elements.namedItem('inviteEmail') as HTMLInputElement).value = '';
        }
    };

    const themeOptions = [
        { id: 'light', name: 'Light', icon: Sun },
        { id: 'dark', name: 'Dark', icon: Moon },
        { id: 'system', name: 'System', icon: Monitor },
    ];

    return (
        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 flex items-center mb-6">
                Settings
            </h2>

            <div className="divide-y divide-gray-200 dark:divide-slate-700">
                {/* Profile Section */}
                <Section title="Profile">
                    <div className="flex items-center gap-6">
                        <div className="relative">
                            <img src={profile.avatar} alt="Profile Avatar" className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-slate-700 shadow-md" />
                             <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 p-2 bg-indigo-600 rounded-full cursor-pointer hover:bg-indigo-700 transition">
                                <FileUp className="w-4 h-4 text-white" />
                                <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                            </label>
                        </div>
                        <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                                <input type="text" value={profile.name} onChange={handleProfileChange('name')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3 bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Username</label>
                                <input type="text" value={profile.username} onChange={handleProfileChange('username')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3 bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                            </div>
                             <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                                <input type="email" value={profile.email} onChange={handleProfileChange('email')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3 bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                            </div>
                        </div>
                    </div>
                </Section>

                {/* Connections Section */}
                <Section title="Connections">
                    {Object.keys(connections).map(p => {
                        const platform = p as keyof typeof connections;
                        return (
                            <div key={platform} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                                <span className="font-medium capitalize text-gray-700 dark:text-gray-300">{platform}</span>
                                <button
                                    onClick={() => handleConnectionToggle(platform)}
                                    disabled={isConnecting !== ''}
                                    className={`px-4 py-1.5 text-sm font-semibold rounded-full flex items-center justify-center w-32 transition ${
                                        connections[platform]
                                        ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/50 dark:text-red-300 dark:hover:bg-red-900'
                                        : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/50 dark:text-green-300 dark:hover:bg-green-900'
                                    }`}
                                >
                                    {isConnecting === platform ? <Loader2 className="w-4 h-4 animate-spin" /> : connections[platform] ? 'Disconnect' : 'Connect'}
                                </button>
                            </div>
                        );
                    })}
                </Section>

                {/* Team Management Section */}
                <Section title="Team Management">
                    <form onSubmit={handleInvite} className="flex gap-2">
                        <input type="email" name="inviteEmail" required placeholder="new.teammate@email.com" className="flex-grow block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3 bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                        <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold shadow-md hover:bg-indigo-700">Invite</button>
                    </form>
                    <ul className="space-y-3">
                        {teamMembers.map(member => (
                            <li key={member.email} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                                <img src={member.avatar} alt={member.name} className="w-10 h-10 rounded-full" />
                                <div className="flex-grow">
                                    <p className="font-semibold text-gray-800 dark:text-gray-200">{member.name}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{member.email}</p>
                                </div>
                                <span className="text-xs font-bold uppercase text-indigo-500 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/50 px-2 py-1 rounded-full">{member.role}</span>
                            </li>
                        ))}
                    </ul>
                </Section>

                {/* Appearance Section */}
                <Section title="Appearance & Language">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Theme</label>
                        <div className="grid grid-cols-3 gap-3">
                            {themeOptions.map(option => {
                                const Icon = option.icon;
                                const isActive = theme === option.id;
                                return (
                                    <button
                                        key={option.id}
                                        onClick={() => setTheme(option.id)}
                                        className={`p-4 rounded-lg border-2 flex flex-col items-center justify-center gap-2 transition ${
                                            isActive ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30' : 'border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-700/50 hover:border-indigo-400'
                                        }`}
                                    >
                                        <Icon className={`w-6 h-6 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`} />
                                        <span className={`font-semibold text-sm ${isActive ? 'text-indigo-800 dark:text-indigo-300' : 'text-gray-700 dark:text-gray-300'}`}>{option.name}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                     <div>
                        <label htmlFor="language" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Language</label>
                        <select id="language" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3 bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-white">
                            <option>English</option>
                            <option disabled>Español (Simulated)</option>
                            <option disabled>Français (Simulated)</option>
                        </select>
                    </div>
                </Section>
                 <div className="flex justify-end pt-8">
                    <button onClick={() => showStatus('Settings saved!')} className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-semibold shadow-md hover:bg-indigo-700">Save Changes</button>
                </div>
            </div>
        </div>
    );
}