import { ConnectionConfig, ConnectionProvider, ConnectionStatus } from '../../types/ConnectionProvider';

const spotifyConfig: ConnectionConfig = {
    id: 'spotify',
    name: 'Spotify',
    description: 'Connect your Spotify account to sync your music data',
    icon: 'spotify-icon', // We'll add actual icon later
};

export class SpotifyProvider implements ConnectionProvider {
    config = spotifyConfig;
    private status: ConnectionStatus = {
        isConnected: false,
    };

    async connect(): Promise<void> {
        // TODO: Implement actual OAuth flow
        console.log('Connecting to Spotify...');
        this.status = { isConnected: true, lastSynced: new Date() };
    }

    async disconnect(): Promise<void> {
        // TODO: Implement actual disconnect
        console.log('Disconnecting from Spotify...');
        this.status = { isConnected: false };
    }

    async getStatus(): Promise<ConnectionStatus> {
        return this.status;
    }
} 