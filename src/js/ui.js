// UI Manager
class UIManager {
    constructor() {
        this.currentPage = 'welcome';
        this.sidebarOpen = false;
        this.theme = 'light';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadTheme();
        this.updateStorageUsage();
    }

    setupEventListeners() {
        // Sidebar toggle
        const sidebarToggle = document.getElementById('sidebarToggle');
        const sidebar = document.getElementById('sidebar');
        
        sidebarToggle.addEventListener('click', () => {
            this.toggleSidebar();
        });

        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                const page = item.dataset.page;
                this.navigateToPage(page);
            });
        });

        // Theme toggle
        const themeToggle = document.getElementById('themeToggle');
        themeToggle.addEventListener('click', () => {
            this.toggleTheme();
        });

        // Theme selector buttons
        document.querySelectorAll('.theme-option').forEach(option => {
            option.addEventListener('click', () => {
                const theme = option.dataset.theme;
                this.setTheme(theme);
                this.updateThemeSelector();
            });
        });

        // Modal close
        const modalClose = document.getElementById('modalClose');
        const modalOverlay = document.getElementById('modalOverlay');
        
        modalClose.addEventListener('click', () => {
            this.closeModal();
        });
        
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                this.closeModal();
            }
        });

        // Search functionality
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
        }

        // Settings
        document.getElementById('clearStorageBtn')?.addEventListener('click', () => {
            this.confirmClearStorage();
        });

        document.getElementById('clearAllFiles')?.addEventListener('click', () => {
            this.confirmClearAllFiles();
        });

        // Settings toggles
        document.getElementById('autoSave')?.addEventListener('change', (e) => {
            this.saveSetting('autoSave', e.target.checked);
        });

        document.getElementById('showFileSize')?.addEventListener('change', (e) => {
            this.saveSetting('showFileSize', e.target.checked);
        });

        // Close sidebar when clicking outside
        document.addEventListener('click', (e) => {
            if (this.sidebarOpen && !sidebar.contains(e.target) && !sidebarToggle.contains(e.target)) {
                this.closeSidebar();
            }
        });
    }

    toggleSidebar() {
        this.sidebarOpen = !this.sidebarOpen;
        const sidebar = document.getElementById('sidebar');
        const mainContent = document.querySelector('.main-content');
        
        if (this.sidebarOpen) {
            sidebar.classList.add('open');
            mainContent.classList.add('sidebar-open');
        } else {
            sidebar.classList.remove('open');
            mainContent.classList.remove('sidebar-open');
        }
    }

    closeSidebar() {
        this.sidebarOpen = false;
        document.getElementById('sidebar').classList.remove('open');
        document.querySelector('.main-content').classList.remove('sidebar-open');
    }

    navigateToPage(page) {
        // Update active nav item
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.page === page);
        });

        // Show target page
        document.querySelectorAll('.page').forEach(pageEl => {
            pageEl.classList.toggle('active', pageEl.id === page);
        });

        this.currentPage = page;
        
        // Load page-specific data
        if (page === 'saved') {
            this.loadSavedFiles();
        }
        
        // Close sidebar on mobile
        if (window.innerWidth <= 768) {
            this.closeSidebar();
        }
    }

    toggleTheme() {
        this.setTheme(this.theme === 'light' ? 'dark' : 'light');
    }

    setTheme(theme) {
        this.theme = theme;
        document.body.className = theme === 'dark' ? 'dark-mode' : 'light-mode';
        this.saveTheme();
    }

    updateThemeSelector() {
        document.querySelectorAll('.theme-option').forEach(option => {
            option.classList.toggle('active', option.dataset.theme === this.theme);
        });
    }

    async loadTheme() {
        try {
            const savedTheme = await window.storageManager.getSetting('theme');
            if (savedTheme) {
                this.setTheme(savedTheme);
                this.updateThemeSelector();
            }
        } catch (error) {
            console.error('Failed to load theme:', error);
        }
    }

    async saveTheme() {
        try {
            await window.storageManager.setSetting('theme', this.theme);
        } catch (error) {
            console.error('Failed to save theme:', error);
        }
    }

    async saveSetting(key, value) {
        try {
            await window.storageManager.setSetting(key, value);
            this.showToast('Settings saved', 'success');
        } catch (error) {
            console.error('Failed to save setting:', error);
            this.showToast('Failed to save settings', 'error');
        }
    }

    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        const toastMessage = toast.querySelector('.toast-message');
        
        toast.className = `toast ${type}`;
        toastMessage.textContent = message;
        
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    showLoading(message = 'Processing...') {
        const loadingOverlay = document.getElementById('loadingOverlay');
        const loadingText = loadingOverlay.querySelector('.loading-text');
        
        loadingText.textContent = message;
        loadingOverlay.classList.add('active');
    }

    hideLoading() {
        const loadingOverlay = document.getElementById('loadingOverlay');
        loadingOverlay.classList.remove('active');
    }

    showModal(title, content) {
        const modal = document.getElementById('modalOverlay');
        const modalTitle = modal.querySelector('.modal-title');
        const modalContent = modal.querySelector('.modal-content');
        
        modalTitle.textContent = title;
        modalContent.innerHTML = content;
        modal.classList.add('active');
    }

    closeModal() {
        const modal = document.getElementById('modalOverlay');
        modal.classList.remove('active');
    }

    async loadSavedFiles() {
        try {
            const files = await window.storageManager.getFiles();
            this.renderSavedFiles(files);
        } catch (error) {
            console.error('Failed to load saved files:', error);
            this.showToast('Failed to load saved files', 'error');
        }
    }

    async handleSearch(query) {
        try {
            const files = await window.storageManager.getFiles({ search: query });
            this.renderSavedFiles(files);
        } catch (error) {
            console.error('Search failed:', error);
        }
    }

    renderSavedFiles(files) {
        const grid = document.getElementById('savedFilesGrid');
        
        if (files.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <svg class="empty-icon" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/>
                        <path d="M8 14s1.5 2 4 2 4-2 4-2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        <line x1="9" y1="9" x2="9.01" y2="9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        <line x1="15" y1="9" x2="15.01" y2="9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                    <h3>No saved files</h3>
                    <p>Files you encode will appear here</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = files.map(file => this.createFileCard(file)).join('');
        this.attachFileCardEvents();
    }

    createFileCard(file) {
        const isImage = file.type.startsWith('image/');
        const isVideo = file.type.startsWith('video/');
        const isAudio = file.type.startsWith('audio/');
        const isPDF = file.type === 'application/pdf';
        
        let previewContent;
        
        if (isImage) {
            previewContent = `<img src="data:${file.type};base64,${file.base64}" alt="${file.name}">`;
        } else if (isVideo) {
            previewContent = `<video src="data:${file.type};base64,${file.base64}" preload="metadata"></video>`;
        } else {
            previewContent = `<div class="file-type-icon ${this.getFileTypeClass(file.type)}">${this.getFileTypeIcon(file.type)}</div>`;
        }
        
        return `
            <div class="file-card" data-file-id="${file.id}">
                <div class="file-preview">
                    ${previewContent}
                </div>
                <div class="file-info">
                    <div class="file-name" data-editable="true">${file.name}</div>
                    <div class="file-details">
                        ${window.storageManager.formatFileSize(file.size)} • ${new Date(file.timestamp).toLocaleDateString()}
                    </div>
                    <div class="file-actions">
                        <button class="action-btn" data-action="preview">
                            <svg viewBox="0 0 24 24">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" fill="none" stroke="currentColor" stroke-width="2"/>
                                <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="2"/>
                            </svg>
                            Preview
                        </button>
                        <button class="action-btn" data-action="download">
                            <svg viewBox="0 0 24 24">
                                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            Download
                        </button>
                        <button class="action-btn" data-action="delete">
                            <svg viewBox="0 0 24 24">
                                <polyline points="3,6 5,6 21,6" fill="none" stroke="currentColor" stroke-width="2"/>
                                <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M10 11v6M14 11v6" fill="none" stroke="currentColor" stroke-width="2"/>
                                <path d="M14 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" fill="none" stroke="currentColor" stroke-width="2"/>
                            </svg>
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    attachFileCardEvents() {
        document.querySelectorAll('.file-card').forEach(card => {
            const fileId = parseInt(card.dataset.fileId);
            
            // Action buttons
            card.querySelectorAll('[data-action]').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const action = btn.dataset.action;
                    this.handleFileAction(fileId, action);
                });
            });

            // Editable filename
            const nameEl = card.querySelector('[data-editable]');
            nameEl.addEventListener('dblclick', () => {
                this.makeEditable(nameEl, fileId);
            });
        });
    }

    async handleFileAction(fileId, action) {
        try {
            const files = await window.storageManager.getFiles();
            const file = files.find(f => f.id === fileId);
            
            if (!file) {
                this.showToast('File not found', 'error');
                return;
            }

            switch (action) {
                case 'preview':
                    this.previewFile(file);
                    break;
                case 'download':
                    this.downloadFile(file);
                    break;
                case 'delete':
                    this.confirmDeleteFile(fileId);
                    break;
            }
        } catch (error) {
            console.error('File action failed:', error);
            this.showToast('Action failed', 'error');
        }
    }

    previewFile(file) {
        const isImage = file.type.startsWith('image/');
        const isVideo = file.type.startsWith('video/');
        const isAudio = file.type.startsWith('audio/');
        const isPDF = file.type === 'application/pdf';
        
        let content = '';
        
        if (isImage) {
            content = `<img src="data:${file.type};base64,${file.base64}" style="max-width: 100%; height: auto;">`;
        } else if (isVideo) {
            content = `<video src="data:${file.type};base64,${file.base64}" controls style="max-width: 100%; height: auto;"></video>`;
        } else if (isAudio) {
            content = `<audio src="data:${file.type};base64,${file.base64}" controls style="width: 100%;"></audio>`;
        } else if (isPDF) {
            content = `<iframe src="data:${file.type};base64,${file.base64}" style="width: 100%; height: 500px; border: none;"></iframe>`;
        } else {
            content = `
                <div style="text-align: center; padding: 2rem;">
                    ${this.getFileTypeIcon(file.type)}
                    <h3>${file.name}</h3>
                    <p>Preview not available for this file type</p>
                    <button class="action-btn primary" onclick="uiManager.downloadFile(${JSON.stringify(file).replace(/"/g, '&quot;')})">Download File</button>
                </div>
            `;
        }
        
        this.showModal(`Preview: ${file.name}`, content);
    }

    downloadFile(file) {
        const blob = this.base64ToBlob(file.base64, file.type);
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showToast('Download started', 'success');
    }

    base64ToBlob(base64, mimeType) {
        const byteCharacters = atob(base64);
        const byteNumbers = new Array(byteCharacters.length);
        
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        
        const byteArray = new Uint8Array(byteNumbers);
        return new Blob([byteArray], { type: mimeType });
    }

    confirmDeleteFile(fileId) {
        const content = `
            <p>Are you sure you want to delete this file? This action cannot be undone.</p>
            <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1rem;">
                <button class="action-btn" onclick="uiManager.closeModal()">Cancel</button>
                <button class="action-btn primary" onclick="uiManager.deleteFile(${fileId})" style="background: var(--error);">Delete</button>
            </div>
        `;
        
        this.showModal('Confirm Delete', content);
    }

    async deleteFile(fileId) {
        try {
            await window.storageManager.deleteFile(fileId);
            this.closeModal();
            this.loadSavedFiles();
            this.showToast('File deleted', 'success');
            this.updateStorageUsage();
        } catch (error) {
            console.error('Delete failed:', error);
            this.showToast('Failed to delete file', 'error');
        }
    }

    confirmClearAllFiles() {
        const content = `
            <p>Are you sure you want to delete all saved files? This action cannot be undone.</p>
            <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1rem;">
                <button class="action-btn" onclick="uiManager.closeModal()">Cancel</button>
                <button class="action-btn primary" onclick="uiManager.clearAllFiles()" style="background: var(--error);">Clear All</button>
            </div>
        `;
        
        this.showModal('Clear All Files', content);
    }

    async clearAllFiles() {
        try {
            await window.storageManager.clearAllFiles();
            this.closeModal();
            this.loadSavedFiles();
            this.showToast('All files cleared', 'success');
            this.updateStorageUsage();
        } catch (error) {
            console.error('Clear all failed:', error);
            this.showToast('Failed to clear files', 'error');
        }
    }

    confirmClearStorage() {
        const content = `
            <p>Are you sure you want to clear all storage? This will delete all saved files and settings.</p>
            <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1rem;">
                <button class="action-btn" onclick="uiManager.closeModal()">Cancel</button>
                <button class="action-btn primary" onclick="uiManager.clearStorage()" style="background: var(--error);">Clear Storage</button>
            </div>
        `;
        
        this.showModal('Clear Storage', content);
    }

    async clearStorage() {
        try {
            await window.storageManager.clearAllFiles();
            this.closeModal();
            this.showToast('Storage cleared', 'success');
            this.updateStorageUsage();
            
            // Reload the page to reset everything
            setTimeout(() => {
                location.reload();
            }, 1000);
        } catch (error) {
            console.error('Clear storage failed:', error);
            this.showToast('Failed to clear storage', 'error');
        }
    }

    async makeEditable(element, fileId) {
        const originalText = element.textContent;
        const input = document.createElement('input');
        
        input.type = 'text';
        input.value = originalText;
        input.className = 'inline-edit';
        input.style.cssText = `
            background: var(--surface-secondary);
            border: 1px solid var(--primary);
            border-radius: 4px;
            padding: 4px 8px;
            font-size: inherit;
            font-family: inherit;
            color: var(--text-primary);
            width: 100%;
        `;
        
        element.replaceWith(input);
        input.focus();
        input.select();
        
        const saveEdit = async () => {
            const newName = input.value.trim();
            if (newName && newName !== originalText) {
                try {
                    await window.storageManager.updateFile(fileId, { name: newName });
                    this.showToast('Filename updated', 'success');
                    this.loadSavedFiles();
                } catch (error) {
                    console.error('Update failed:', error);
                    this.showToast('Failed to update filename', 'error');
                }
            } else {
                element.textContent = originalText;
                input.replaceWith(element);
            }
        };
        
        input.addEventListener('blur', saveEdit);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                saveEdit();
            } else if (e.key === 'Escape') {
                element.textContent = originalText;
                input.replaceWith(element);
            }
        });
    }

    async updateStorageUsage() {
        try {
            const usage = await window.storageManager.getStorageUsage();
            const usageElement = document.getElementById('storageUsage');
            if (usageElement) {
                usageElement.textContent = `${usage.fileCount} files, ${usage.formattedSize}`;
            }
        } catch (error) {
            console.error('Failed to get storage usage:', error);
        }
    }

    getFileTypeClass(mimeType) {
        if (mimeType.startsWith('image/')) return 'image';
        if (mimeType.startsWith('video/')) return 'video';
        if (mimeType.startsWith('audio/')) return 'audio';
        if (mimeType === 'application/pdf') return 'document';
        if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('archive')) return 'archive';
        return 'document';
    }

    getFileTypeIcon(mimeType) {
        const iconClass = this.getFileTypeClass(mimeType);
        
        const icons = {
            image: `<svg viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="M21 15l-3.086-3.086a2 2 0 00-2.828 0L6 21"/></svg>`,
            video: `<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>`,
            audio: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>`,
            document: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10,9 9,9 8,9"/></svg>`,
            archive: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v2"/><path d="M21 9v10a2 2 0 01-2 2H5a2 2 0 01-2-2V9"/><path d="M7 12h10l-1 7H8z"/></svg>`
        };
        
        return icons[iconClass] || icons.document;
    }
}

// Export for global use
window.uiManager = new UIManager();

// Global navigation function for buttons
window.navigateToPage = function(page) {
    window.uiManager.navigateToPage(page);
};