export interface ConnectionConfig {
    id: string;
    name: string;
    description: string;
    icon: string;
}

export interface ConnectionStatus {
    isConnected: boolean;
    lastSynced?: Date;
    error?: string;
}

export interface ConnectionProvider {
    config: ConnectionConfig;
    connect: () => Promise<void>;
    disconnect: () => Promise<void>;
    getStatus: () => Promise<ConnectionStatus>;
} 