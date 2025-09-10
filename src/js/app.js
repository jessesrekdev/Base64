// Main Application
class CodeVaultApp {
    constructor() {
        this.version = '1.0.0';
        this.init();
    }

    async init() {
        console.log(`CodeVault v${this.version} - Loading...`);
        
        try {
            // Wait for storage to initialize
            await window.storageManager.init();
            
            // Load saved settings
            await this.loadSettings();
            
            // Set up ripple effects
            this.setupRippleEffects();
            
            // Set up keyboard shortcuts
            this.setupKeyboardShortcuts();
            
            // Set up resize handler
            this.setupResizeHandler();
            
            // Load initial data
            await this.loadInitialData();
            
            console.log('CodeVault initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize CodeVault:', error);
            window.uiManager.showToast('Failed to initialize application', 'error');
        }
    }

    async loadSettings() {
        try {
            // Load theme
            const theme = await window.storageManager.getSetting('theme');
            if (theme) {
                window.uiManager.setTheme(theme);
                window.uiManager.updateThemeSelector();
            }

            // Load other settings
            const autoSave = await window.storageManager.getSetting('autoSave');
            if (autoSave !== null) {
                const autoSaveCheckbox = document.getElementById('autoSave');
                if (autoSaveCheckbox) autoSaveCheckbox.checked = autoSave;
            }

            const showFileSize = await window.storageManager.getSetting('showFileSize');
            if (showFileSize !== null) {
                const showFileSizeCheckbox = document.getElementById('showFileSize');
                if (showFileSizeCheckbox) showFileSizeCheckbox.checked = showFileSize;
            }

        } catch (error) {
            console.error('Failed to load settings:', error);
        }
    }

    setupRippleEffects() {
        // Add ripple effect to buttons
        document.addEventListener('click', (e) => {
            const button = e.target.closest('button, .action-btn, .cta-button');
            if (!button) return;

            button.classList.add('ripple');
            
            // Remove the ripple class after animation
            setTimeout(() => {
                button.classList.remove('ripple');
            }, 600);
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K: Toggle sidebar
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                window.uiManager.toggleSidebar();
            }

            // Ctrl/Cmd + D: Toggle theme
            if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
                e.preventDefault();
                window.uiManager.toggleTheme();
            }

            // Ctrl/Cmd + U: Upload file
            if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
                e.preventDefault();
                if (window.uiManager.currentPage === 'main') {
                    document.getElementById('fileInput').click();
                }
            }

            // Ctrl/Cmd + V: Paste and try to decode base64
            if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
                if (window.uiManager.currentPage === 'main' && e.target === document.getElementById('base64Output')) {
                    setTimeout(() => {
                        window.encoderManager.validateBase64Input();
                    }, 10);
                }
            }

            // Escape: Close modal
            if (e.key === 'Escape') {
                window.uiManager.closeModal();
                if (window.uiManager.sidebarOpen && window.innerWidth <= 768) {
                    window.uiManager.closeSidebar();
                }
            }

            // Number keys: Navigate pages
            if (e.key >= '1' && e.key <= '5' && !e.target.matches('input, textarea, select')) {
                const pages = ['welcome', 'main', 'saved', 'about', 'settings'];
                const pageIndex = parseInt(e.key) - 1;
                if (pages[pageIndex]) {
                    window.uiManager.navigateToPage(pages[pageIndex]);
                }
            }
        });
    }

    setupResizeHandler() {
        let resizeTimeout;
        
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.handleResize();
            }, 250);
        });
    }

    handleResize() {
        // Close sidebar on mobile when resizing to desktop
        if (window.innerWidth > 768 && window.uiManager.sidebarOpen) {
            // Don't auto-close on desktop
        }

        // Update any responsive elements
        this.updateResponsiveElements();
    }

    updateResponsiveElements() {
        // Update grid layouts based on screen size
        const filesGrid = document.getElementById('savedFilesGrid');
        if (filesGrid && filesGrid.children.length > 0) {
            // Trigger reflow for masonry-style layouts
            filesGrid.style.display = 'none';
            filesGrid.offsetHeight; // Trigger reflow
            filesGrid.style.display = '';
        }
    }

    async loadInitialData() {
        try {
            // Update storage usage
            await window.uiManager.updateStorageUsage();
            
            // Load saved files if on that page
            if (window.uiManager.currentPage === 'saved') {
                await window.uiManager.loadSavedFiles();
            }
            
        } catch (error) {
            console.error('Failed to load initial data:', error);
        }
    }

    // Utility methods for global use
    formatFileSize(bytes) {
        return window.storageManager.formatFileSize(bytes);
    }

    showToast(message, type = 'info') {
        window.uiManager.showToast(message, type);
    }

    showLoading(message = 'Processing...') {
        window.uiManager.showLoading(message);
    }

    hideLoading() {
        window.uiManager.hideLoading();
    }

    // Export/Import functionality
    async exportData() {
        try {
            window.uiManager.showLoading('Exporting data...');
            
            const files = await window.storageManager.getFiles();
            const settings = {
                theme: await window.storageManager.getSetting('theme'),
                autoSave: await window.storageManager.getSetting('autoSave'),
                showFileSize: await window.storageManager.getSetting('showFileSize')
            };
            
            const exportData = {
                version: this.version,
                timestamp: Date.now(),
                files: files,
                settings: settings
            };
            
            const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
                type: 'application/json' 
            });
            
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `codevault-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            window.uiManager.showToast('Data exported successfully', 'success');
            
        } catch (error) {
            console.error('Export failed:', error);
            window.uiManager.showToast('Failed to export data', 'error');
        } finally {
            window.uiManager.hideLoading();
        }
    }

    async importData(file) {
        try {
            window.uiManager.showLoading('Importing data...');
            
            const text = await file.text();
            const importData = JSON.parse(text);
            
            // Validate import data
            if (!importData.version || !importData.files) {
                throw new Error('Invalid backup file format');
            }
            
            // Confirm import
            const confirmImport = confirm(
                `This will import ${importData.files.length} files and replace current settings. Continue?`
            );
            
            if (!confirmImport) return;
            
            // Import files
            for (const fileData of importData.files) {
                await window.storageManager.saveFile(fileData);
            }
            
            // Import settings
            if (importData.settings) {
                for (const [key, value] of Object.entries(importData.settings)) {
                    if (value !== null && value !== undefined) {
                        await window.storageManager.setSetting(key, value);
                    }
                }
            }
            
            // Reload application
            window.uiManager.showToast('Data imported successfully. Reloading...', 'success');
            setTimeout(() => location.reload(), 1000);
            
        } catch (error) {
            console.error('Import failed:', error);
            window.uiManager.showToast('Failed to import data', 'error');
        } finally {
            window.uiManager.hideLoading();
        }
    }

    // Performance monitoring
    startPerformanceMonitor() {
        if ('performance' in window) {
            // Monitor page load performance
            window.addEventListener('load', () => {
                setTimeout(() => {
                    const perfData = performance.getEntriesByType('navigation')[0];
                    if (perfData) {
                        console.log(`CodeVault loaded in ${Math.round(perfData.loadEventEnd - perfData.fetchStart)}ms`);
                    }
                }, 0);
            });
        }
    }

    // Error reporting
    setupErrorHandling() {
        window.addEventListener('error', (e) => {
            console.error('Global error:', e.error);
            this.logError(e.error, e.filename, e.lineno);
        });

        window.addEventListener('unhandledrejection', (e) => {
            console.error('Unhandled promise rejection:', e.reason);
            this.logError(e.reason);
        });
    }

    logError(error, filename = '', lineno = 0) {
        // In a production app, you might want to send this to a logging service
        const errorInfo = {
            message: error.message || error,
            stack: error.stack,
            filename,
            lineno,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href
        };
        
        console.error('Error logged:', errorInfo);
    }
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.codeVaultApp = new CodeVaultApp();
});

// Export for global use
window.CodeVaultApp = CodeVaultApp;