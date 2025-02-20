import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    SiSpotify,
    SiYoutube,
    SiGooglesheets,
    SiNotion,
    SiInstagram,
    SiTelegram
} from 'react-icons/si';
import { GiRing } from 'react-icons/gi';
import { IoFitnessOutline, IoArrowBack } from 'react-icons/io5';
import { connectionRegistry } from '../connections/registry';

// Map of provider IDs to their icons
const iconMap = {
    spotify: SiSpotify,
    youtube: SiYoutube,
    'google-sheets': SiGooglesheets,
    notion: SiNotion,
    instagram: SiInstagram,
    telegram: SiTelegram
};

export default function Connections() {
    const navigate = useNavigate();
    const [providers, setProviders] = useState([]);
    const [selectedProvider, setSelectedProvider] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [providerStatuses, setProviderStatuses] = useState({});

    // Load providers and their initial status
    useEffect(() => {
        const loadProviders = async () => {
            const allProviders = connectionRegistry.getAllProviders();
            setProviders(allProviders);

            // Load initial statuses
            const statuses = {};
            for (const provider of allProviders) {
                statuses[provider.config.id] = await provider.getStatus();
            }
            setProviderStatuses(statuses);
        };

        loadProviders();
    }, []);

    const handleConnect = async (provider) => {
        try {
            await provider.connect();
            const newStatus = await provider.getStatus();
            setProviderStatuses(prev => ({
                ...prev,
                [provider.config.id]: newStatus
            }));
        } catch (error) {
            console.error('Failed to connect:', error);
            // You might want to show an error toast here
        }
    };

    const handleDisconnect = async (provider) => {
        try {
            await provider.disconnect();
            const newStatus = await provider.getStatus();
            setProviderStatuses(prev => ({
                ...prev,
                [provider.config.id]: newStatus
            }));
        } catch (error) {
            console.error('Failed to disconnect:', error);
            // You might want to show an error toast here
        }
    };

    const openDetails = (provider) => {
        setSelectedProvider(provider);
        setShowDetailsModal(true);
    };

    const ConnectionDetailsModal = () => {
        if (!selectedProvider) return null;

        const status = providerStatuses[selectedProvider.config.id];

        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-surface p-6 rounded-lg border border-border max-w-md w-full mx-4">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold">{selectedProvider.config.name}</h3>
                        <button
                            onClick={() => setShowDetailsModal(false)}
                            className="text-text-secondary hover:text-text-primary"
                        >
                            ✕
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div className="p-4 bg-background rounded-lg border border-border">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-text-secondary">Status</span>
                                <span className={status?.isConnected ? 'text-success' : 'text-text-secondary'}>
                                    {status?.isConnected ? 'connected' : 'not connected'}
                                </span>
                            </div>
                            {status?.isConnected && status?.lastSynced && (
                                <div className="flex justify-between items-center">
                                    <span className="text-text-secondary">last synced</span>
                                    <span className="text-text-primary">
                                        {status.lastSynced.toLocaleString()}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            {status?.isConnected ? (
                                <>
                                    <button
                                        onClick={() => {
                                            handleDisconnect(selectedProvider);
                                            setShowDetailsModal(false);
                                        }}
                                        className="w-full py-2 px-4 bg-error/10 text-error hover:bg-error/20 rounded-md transition-colors"
                                    >
                                        disconnect
                                    </button>
                                    <button
                                        className="w-full py-2 px-4 bg-surface text-text-primary border border-border rounded-md hover:bg-border transition-colors"
                                    >
                                        View Permissions
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => {
                                        handleConnect(selectedProvider);
                                        setShowDetailsModal(false);
                                    }}
                                    className="w-full py-2 px-4 bg-primary text-white hover:bg-primary/90 rounded-md transition-colors"
                                >
                                    Connect
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-background text-text-primary p-8">
            <div className="max-w-2xl mx-auto">
                <Link
                    to="/"
                    className="inline-flex items-center text-text-primary hover:text-text-secondary mb-6"
                >
                    <IoArrowBack className="mr-2" />
                    Back
                </Link>
                <h2 className="text-2xl font-bold mb-8">Connections</h2>
                <div className="space-y-3">
                    {providers.map((provider) => {
                        const status = providerStatuses[provider.config.id];
                        const IconComponent = iconMap[provider.config.id] || IoFitnessOutline;

                        return (
                            <div
                                key={provider.config.id}
                                className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${status?.isConnected
                                    ? 'bg-primary/5 border-primary/20'
                                    : 'bg-background border-border'
                                    }`}
                            >
                                <div className="flex items-center space-x-4">
                                    <div className="w-6 h-6 flex items-center justify-center text-text-secondary">
                                        <IconComponent size="1.5em" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium">{provider.config.name}</h3>
                                        <p className="text-sm text-text-secondary">{provider.config.description}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {status?.isConnected ? (
                                        <>
                                            <button
                                                onClick={() => openDetails(provider)}
                                                className="px-3 py-1.5 text-sm text-text-primary hover:bg-surface rounded-md transition-colors"
                                            >
                                                Settings
                                            </button>
                                            <span className="text-sm text-success">
                                                Connected
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="text-sm text-text-secondary">
                                                Not Connected
                                            </span>
                                            <button
                                                onClick={() => handleConnect(provider)}
                                                className="px-4 py-1.5 text-sm rounded-md transition-colors bg-primary/10 text-primary hover:bg-primary/20"
                                            >
                                                Connect
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            {showDetailsModal && <ConnectionDetailsModal />}
        </div>
    );
} 