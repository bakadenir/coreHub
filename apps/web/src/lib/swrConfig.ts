import type { SWRConfiguration } from 'swr';

export const swrConfig: SWRConfiguration = {
    revalidateOnFocus: false,      // Don't refetch when window regains focus
    revalidateOnReconnect: false,  // Don't refetch on reconnect  
    refreshInterval: 0,            // No automatic polling
    dedupingInterval: 60000,       // Dedupe requests within 60 seconds (stale time)
    errorRetryCount: 2,            // Only retry 2 times on error
    errorRetryInterval: 5000,      // Wait 5s between retries
    shouldRetryOnError: false,     // Don't auto retry on error
};
