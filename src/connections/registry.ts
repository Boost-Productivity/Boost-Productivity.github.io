import { ConnectionProvider } from './types/ConnectionProvider';
import { SpotifyProvider } from './providers/spotify/SpotifyProvider';

class ConnectionRegistry {
    private providers: Map<string, ConnectionProvider> = new Map();

    constructor() {
        // Register initial providers
        this.registerProvider(new SpotifyProvider());
    }

    registerProvider(provider: ConnectionProvider) {
        this.providers.set(provider.config.id, provider);
    }

    getProvider(id: string): ConnectionProvider | undefined {
        return this.providers.get(id);
    }

    getAllProviders(): ConnectionProvider[] {
        return Array.from(this.providers.values());
    }
}

// Export a singleton instance
export const connectionRegistry = new ConnectionRegistry(); 