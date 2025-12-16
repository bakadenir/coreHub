// =====================================================
// Storage Utility - LocalStorage Wrapper
// =====================================================

export class Storage {
    private prefix = 'corehub_';

    get<T>(key: string): T | null {
        const item = localStorage.getItem(this.prefix + key);
        if (item) {
            try {
                return JSON.parse(item) as T;
            } catch {
                return null;
            }
        }
        return null;
    }

    set<T>(key: string, value: T): void {
        localStorage.setItem(this.prefix + key, JSON.stringify(value));
    }

    remove(key: string): void {
        localStorage.removeItem(this.prefix + key);
    }

    clear(): void {
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith(this.prefix)) {
                localStorage.removeItem(key);
            }
        });
    }
}
