// IndexedDB Storage Manager
class StorageManager {
    constructor() {
        this.dbName = 'CodeVaultDB';
        this.version = 1;
        this.db = null;
        this.init();
    }

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Create files store
                if (!db.objectStoreNames.contains('files')) {
                    const filesStore = db.createObjectStore('files', { 
                        keyPath: 'id', 
                        autoIncrement: true 
                    });
                    filesStore.createIndex('name', 'name', { unique: false });
                    filesStore.createIndex('type', 'type', { unique: false });
                    filesStore.createIndex('timestamp', 'timestamp', { unique: false });
                }
                
                // Create settings store
                if (!db.objectStoreNames.contains('settings')) {
                    const settingsStore = db.createObjectStore('settings', { 
                        keyPath: 'key' 
                    });
                }
            };
        });
    }

    async saveFile(fileData) {
        if (!this.db) await this.init();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['files'], 'readwrite');
            const store = transaction.objectStore('files');
            
            const file = {
                name: fileData.name,
                type: fileData.type,
                size: fileData.size,
                base64: fileData.base64,
                timestamp: Date.now(),
                description: fileData.description || ''
            };
            
            const request = store.add(file);
            request.onsuccess = () => resolve({ ...file, id: request.result });
            request.onerror = () => reject(request.error);
        });
    }

    async getFiles(filter = {}) {
        if (!this.db) await this.init();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['files'], 'readonly');
            const store = transaction.objectStore('files');
            const request = store.getAll();
            
            request.onsuccess = () => {
                let files = request.result;
                
                // Apply filters
                if (filter.type) {
                    files = files.filter(file => file.type.startsWith(filter.type));
                }
                
                if (filter.search) {
                    const searchTerm = filter.search.toLowerCase();
                    files = files.filter(file => 
                        file.name.toLowerCase().includes(searchTerm) ||
                        file.description.toLowerCase().includes(searchTerm)
                    );
                }
                
                // Sort by timestamp (newest first)
                files.sort((a, b) => b.timestamp - a.timestamp);
                
                resolve(files);
            };
            
            request.onerror = () => reject(request.error);
        });
    }

    async deleteFile(id) {
        if (!this.db) await this.init();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['files'], 'readwrite');
            const store = transaction.objectStore('files');
            const request = store.delete(id);
            
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async updateFile(id, updates) {
        if (!this.db) await this.init();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['files'], 'readwrite');
            const store = transaction.objectStore('files');
            
            const getRequest = store.get(id);
            getRequest.onsuccess = () => {
                const file = getRequest.result;
                if (file) {
                    Object.assign(file, updates);
                    const updateRequest = store.put(file);
                    updateRequest.onsuccess = () => resolve(file);
                    updateRequest.onerror = () => reject(updateRequest.error);
                } else {
                    reject(new Error('File not found'));
                }
            };
            getRequest.onerror = () => reject(getRequest.error);
        });
    }

    async clearAllFiles() {
        if (!this.db) await this.init();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['files'], 'readwrite');
            const store = transaction.objectStore('files');
            const request = store.clear();
            
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async getSetting(key) {
        if (!this.db) await this.init();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['settings'], 'readonly');
            const store = transaction.objectStore('settings');
            const request = store.get(key);
            
            request.onsuccess = () => {
                resolve(request.result ? request.result.value : null);
            };
            request.onerror = () => reject(request.error);
        });
    }

    async setSetting(key, value) {
        if (!this.db) await this.init();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['settings'], 'readwrite');
            const store = transaction.objectStore('settings');
            const request = store.put({ key, value });
            
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async getStorageUsage() {
        if (!this.db) await this.init();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['files'], 'readonly');
            const store = transaction.objectStore('files');
            const request = store.getAll();
            
            request.onsuccess = () => {
                const files = request.result;
                const totalSize = files.reduce((sum, file) => sum + (file.size || 0), 0);
                const fileCount = files.length;
                
                resolve({
                    totalSize,
                    fileCount,
                    formattedSize: this.formatFileSize(totalSize)
                });
            };
            
            request.onerror = () => reject(request.error);
        });
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// Export for global use
window.storageManager = new StorageManager();