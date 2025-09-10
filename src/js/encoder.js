// Base64 Encoder/Decoder
class EncoderManager {
    constructor() {
        this.currentFile = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('fileInput');
        const base64Output = document.getElementById('base64Output');
        
        // Upload area click
        uploadArea.addEventListener('click', () => {
            fileInput.click();
        });

        // File input change
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleFile(e.target.files[0]);
            }
        });

        // Drag and drop
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            
            if (e.dataTransfer.files.length > 0) {
                this.handleFile(e.dataTransfer.files[0]);
            }
        });

        // Base64 operations
        document.getElementById('copyBase64Btn').addEventListener('click', () => {
            this.copyBase64ToClipboard();
        });

        document.getElementById('downloadBtn').addEventListener('click', () => {
            this.downloadCurrentFile();
        });

        document.getElementById('clearBase64').addEventListener('click', () => {
            this.clearBase64();
        });

        document.getElementById('decodeBase64').addEventListener('click', () => {
            this.decodeBase64();
        });

        // Base64 input change
        base64Output.addEventListener('input', () => {
            this.validateBase64Input();
        });
    }

    async handleFile(file) {
        if (!file) return;

        window.uiManager.showLoading('Encoding file...');

        try {
            const fileData = await this.fileToBase64(file);
            
            this.currentFile = {
                name: file.name,
                type: file.type,
                size: file.size,
                base64: fileData.base64,
                originalFile: file
            };

            // Update UI
            document.getElementById('base64Output').value = fileData.base64;
            this.showFilePreview();
            
            // Auto-save if enabled
            const autoSave = await window.storageManager.getSetting('autoSave');
            if (autoSave !== false) { // Default to true
                this.saveCurrentFile();
            }

            window.uiManager.showToast('File encoded successfully', 'success');
        } catch (error) {
            console.error('File encoding failed:', error);
            window.uiManager.showToast('Failed to encode file', 'error');
        } finally {
            window.uiManager.hideLoading();
        }
    }

    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = () => {
                const base64 = reader.result.split(',')[1]; // Remove data URL prefix
                resolve({
                    base64,
                    dataUrl: reader.result
                });
            };
            
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(file);
        });
    }

    showFilePreview() {
        const previewSection = document.getElementById('previewSection');
        const previewContent = document.getElementById('previewContent');
        
        if (!this.currentFile) {
            previewSection.style.display = 'none';
            return;
        }

        previewSection.style.display = 'block';
        
        const isImage = this.currentFile.type.startsWith('image/');
        const isVideo = this.currentFile.type.startsWith('video/');
        const isAudio = this.currentFile.type.startsWith('audio/');
        const isPDF = this.currentFile.type === 'application/pdf';
        const isArchive = this.isArchiveType(this.currentFile.type);

        let previewHTML = '';

        if (isImage) {
            previewHTML = this.createImagePreview();
        } else if (isVideo) {
            previewHTML = this.createVideoPreview();
        } else if (isAudio) {
            previewHTML = this.createAudioPreview();
        } else if (isPDF) {
            previewHTML = this.createPDFPreview();
        } else if (isArchive) {
            previewHTML = this.createArchivePreview();
        } else {
            previewHTML = this.createGenericPreview();
        }

        previewContent.innerHTML = previewHTML;
        this.attachPreviewEvents();
    }

    createImagePreview() {
        const dataUrl = `data:${this.currentFile.type};base64,${this.currentFile.base64}`;
        return `
            <div class="image-preview-container" style="position: relative; text-align: center;">
                <img id="previewImage" src="${dataUrl}" alt="${this.currentFile.name}" 
                     style="max-width: 100%; max-height: 400px; object-fit: contain; border-radius: 8px;">
                <div class="zoom-controls">
                    <button class="zoom-btn" data-zoom="out">
                        <svg viewBox="0 0 24 24">
                            <circle cx="11" cy="11" r="8" fill="none" stroke="currentColor" stroke-width="2"/>
                            <path d="M8 11h6" fill="none" stroke="currentColor" stroke-width="2"/>
                            <path d="M21 21l-4.35-4.35" fill="none" stroke="currentColor" stroke-width="2"/>
                        </svg>
                    </button>
                    <button class="zoom-btn" data-zoom="in">
                        <svg viewBox="0 0 24 24">
                            <circle cx="11" cy="11" r="8" fill="none" stroke="currentColor" stroke-width="2"/>
                            <path d="M11 8v6M8 11h6" fill="none" stroke="currentColor" stroke-width="2"/>
                            <path d="M21 21l-4.35-4.35" fill="none" stroke="currentColor" stroke-width="2"/>
                        </svg>
                    </button>
                    <button class="zoom-btn" data-zoom="reset">
                        <svg viewBox="0 0 24 24">
                            <path d="M1 4v6h6M23 20v-6h-6" fill="none" stroke="currentColor" stroke-width="2"/>
                            <path d="M20.49 9A9 9 0 005.64 5.64L1 10M3.51 15a9 9 0 0014.85 3.36L23 14" fill="none" stroke="currentColor" stroke-width="2"/>
                        </svg>
                    </button>
                </div>
                <div class="file-info-overlay">
                    <span>${this.currentFile.name}</span>
                    <span>${window.storageManager.formatFileSize(this.currentFile.size)}</span>
                </div>
            </div>
        `;
    }

    createVideoPreview() {
        const dataUrl = `data:${this.currentFile.type};base64,${this.currentFile.base64}`;
        return `
            <div class="video-preview-container" style="position: relative;">
                <video id="previewVideo" 
                       style="width: 100%; max-height: 400px; border-radius: 8px; background: black;"
                       preload="metadata">
                    <source src="${dataUrl}" type="${this.currentFile.type}">
                    Your browser does not support video playback.
                </video>
                <div class="custom-video-controls">
                    <button class="control-btn" data-control="play">
                        <svg class="play-icon" viewBox="0 0 24 24">
                            <polygon points="5 3 19 12 5 21 5 3" fill="currentColor"/>
                        </svg>
                        <svg class="pause-icon" viewBox="0 0 24 24" style="display: none;">
                            <rect x="6" y="4" width="4" height="16" fill="currentColor"/>
                            <rect x="14" y="4" width="4" height="16" fill="currentColor"/>
                        </svg>
                    </button>
                    <div class="progress-bar" data-control="seek">
                        <div class="progress-fill"></div>
                    </div>
                    <span class="time-display">0:00 / 0:00</span>
                    <button class="control-btn" data-control="mute">
                        <svg class="volume-icon" viewBox="0 0 24 24">
                            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor"/>
                            <path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07" fill="none" stroke="currentColor" stroke-width="2"/>
                        </svg>
                    </button>
                    <button class="control-btn" data-control="fullscreen">
                        <svg viewBox="0 0 24 24">
                            <path d="M8 3H5a2 2 0 00-2 2v3M21 8V5a2 2 0 00-2-2h-3M16 21h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3" fill="none" stroke="currentColor" stroke-width="2"/>
                        </svg>
                    </button>
                </div>
                <div class="file-info-overlay">
                    <span>${this.currentFile.name}</span>
                    <span>${window.storageManager.formatFileSize(this.currentFile.size)}</span>
                </div>
            </div>
        `;
    }

    createAudioPreview() {
        const dataUrl = `data:${this.currentFile.type};base64,${this.currentFile.base64}`;
        return `
            <div class="audio-preview-container" style="text-align: center; padding: 2rem;">
                <div class="audio-icon" style="margin-bottom: 1rem;">
                    <svg style="width: 64px; height: 64px; color: var(--secondary);" viewBox="0 0 24 24">
                        <path d="M9 18V5l12-2v13" fill="none" stroke="currentColor" stroke-width="2"/>
                        <circle cx="6" cy="18" r="3" fill="none" stroke="currentColor" stroke-width="2"/>
                        <circle cx="18" cy="16" r="3" fill="none" stroke="currentColor" stroke-width="2"/>
                    </svg>
                </div>
                <audio id="previewAudio" preload="metadata" style="display: none;">
                    <source src="${dataUrl}" type="${this.currentFile.type}">
                    Your browser does not support audio playback.
                </audio>
                <div class="custom-audio-controls">
                    <button class="control-btn" data-control="play">
                        <svg class="play-icon" viewBox="0 0 24 24">
                            <polygon points="5 3 19 12 5 21 5 3" fill="currentColor"/>
                        </svg>
                        <svg class="pause-icon" viewBox="0 0 24 24" style="display: none;">
                            <rect x="6" y="4" width="4" height="16" fill="currentColor"/>
                            <rect x="14" y="4" width="4" height="16" fill="currentColor"/>
                        </svg>
                    </button>
                    <div class="progress-bar" data-control="seek" style="flex: 1; margin: 0 1rem;">
                        <div class="progress-fill"></div>
                    </div>
                    <span class="time-display">0:00 / 0:00</span>
                    <button class="control-btn" data-control="mute">
                        <svg class="volume-icon" viewBox="0 0 24 24">
                            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor"/>
                            <path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07" fill="none" stroke="currentColor" stroke-width="2"/>
                        </svg>
                    </button>
                </div>
                <div class="file-info-overlay" style="margin-top: 1rem;">
                    <div style="font-weight: 600;">${this.currentFile.name}</div>
                    <div style="color: var(--text-secondary); margin-top: 0.5rem;">
                        ${window.storageManager.formatFileSize(this.currentFile.size)}
                    </div>
                </div>
            </div>
        `;
    }

    createPDFPreview() {
        const dataUrl = `data:${this.currentFile.type};base64,${this.currentFile.base64}`;
        return `
            <div class="pdf-preview-container">
                <iframe class="pdf-viewer" src="${dataUrl}" title="${this.currentFile.name}"></iframe>
                <div class="file-info-overlay">
                    <span>${this.currentFile.name}</span>
                    <span>${window.storageManager.formatFileSize(this.currentFile.size)}</span>
                </div>
            </div>
        `;
    }

    createArchivePreview() {
        return `
            <div class="archive-preview-container" style="text-align: center; padding: 2rem;">
                <div class="file-type-icon archive" style="margin-bottom: 1rem;">
                    <svg style="width: 64px; height: 64px;" viewBox="0 0 24 24">
                        <path d="M21 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v2" fill="none" stroke="currentColor" stroke-width="2"/>
                        <path d="M21 9v10a2 2 0 01-2 2H5a2 2 0 01-2-2V9" fill="none" stroke="currentColor" stroke-width="2"/>
                        <path d="M7 12h10l-1 7H8z" fill="none" stroke="currentColor" stroke-width="2"/>
                    </svg>
                </div>
                <h3 style="margin-bottom: 0.5rem;">${this.currentFile.name}</h3>
                <p style="color: var(--text-secondary); margin-bottom: 1rem;">
                    Archive File • ${window.storageManager.formatFileSize(this.currentFile.size)}
                </p>
                <div style="font-size: 0.875rem; color: var(--text-secondary);">
                    Preview not available for archive files
                </div>
            </div>
        `;
    }

    createGenericPreview() {
        const iconType = this.getGenericIconType(this.currentFile.type);
        return `
            <div class="generic-preview-container" style="text-align: center; padding: 2rem;">
                <div class="file-type-icon ${iconType}" style="margin-bottom: 1rem;">
                    ${window.uiManager.getFileTypeIcon(this.currentFile.type)}
                </div>
                <h3 style="margin-bottom: 0.5rem;">${this.currentFile.name}</h3>
                <p style="color: var(--text-secondary); margin-bottom: 1rem;">
                    ${this.currentFile.type} • ${window.storageManager.formatFileSize(this.currentFile.size)}
                </p>
                <div style="font-size: 0.875rem; color: var(--text-secondary);">
                    Preview not available for this file type
                </div>
            </div>
        `;
    }

    attachPreviewEvents() {
        // Image zoom controls
        const zoomButtons = document.querySelectorAll('[data-zoom]');
        zoomButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.handleImageZoom(btn.dataset.zoom);
            });
        });

        // Video controls
        const videoControls = document.querySelectorAll('.custom-video-controls [data-control]');
        videoControls.forEach(control => {
            control.addEventListener('click', () => {
                this.handleVideoControl(control.dataset.control);
            });
        });

        // Audio controls
        const audioControls = document.querySelectorAll('.custom-audio-controls [data-control]');
        audioControls.forEach(control => {
            control.addEventListener('click', () => {
                this.handleAudioControl(control.dataset.control);
            });
        });
    }

    handleImageZoom(action) {
        const img = document.getElementById('previewImage');
        if (!img) return;

        const currentTransform = img.style.transform || '';
        let currentScale = 1;
        
        const scaleMatch = currentTransform.match(/scale\(([^)]+)\)/);
        if (scaleMatch) {
            currentScale = parseFloat(scaleMatch[1]);
        }

        let newScale = currentScale;
        
        switch (action) {
            case 'in':
                newScale = Math.min(currentScale * 1.2, 3);
                break;
            case 'out':
                newScale = Math.max(currentScale / 1.2, 0.5);
                break;
            case 'reset':
                newScale = 1;
                break;
        }

        img.style.transform = `scale(${newScale})`;
        img.style.transition = 'transform 0.3s ease';
    }

    handleVideoControl(action) {
        const video = document.getElementById('previewVideo');
        if (!video) return;

        const playBtn = document.querySelector('.custom-video-controls [data-control="play"]');
        const playIcon = playBtn.querySelector('.play-icon');
        const pauseIcon = playBtn.querySelector('.pause-icon');
        const progressBar = document.querySelector('.custom-video-controls .progress-bar');
        const progressFill = progressBar.querySelector('.progress-fill');
        const timeDisplay = document.querySelector('.custom-video-controls .time-display');

        switch (action) {
            case 'play':
                if (video.paused) {
                    video.play();
                    playIcon.style.display = 'none';
                    pauseIcon.style.display = 'block';
                } else {
                    video.pause();
                    playIcon.style.display = 'block';
                    pauseIcon.style.display = 'none';
                }
                break;
            case 'mute':
                video.muted = !video.muted;
                break;
            case 'fullscreen':
                if (video.requestFullscreen) {
                    video.requestFullscreen();
                }
                break;
            case 'seek':
                // Handle progress bar click
                break;
        }

        // Update progress and time
        video.addEventListener('timeupdate', () => {
            const progress = (video.currentTime / video.duration) * 100;
            progressFill.style.width = `${progress}%`;
            timeDisplay.textContent = `${this.formatTime(video.currentTime)} / ${this.formatTime(video.duration)}`;
        });

        // Handle progress bar click
        progressBar.addEventListener('click', (e) => {
            const rect = progressBar.getBoundingClientRect();
            const pos = (e.clientX - rect.left) / rect.width;
            video.currentTime = pos * video.duration;
        });
    }

    handleAudioControl(action) {
        const audio = document.getElementById('previewAudio');
        if (!audio) return;

        const playBtn = document.querySelector('.custom-audio-controls [data-control="play"]');
        const playIcon = playBtn.querySelector('.play-icon');
        const pauseIcon = playBtn.querySelector('.pause-icon');
        const progressBar = document.querySelector('.custom-audio-controls .progress-bar');
        const progressFill = progressBar.querySelector('.progress-fill');
        const timeDisplay = document.querySelector('.custom-audio-controls .time-display');

        switch (action) {
            case 'play':
                if (audio.paused) {
                    audio.play();
                    playIcon.style.display = 'none';
                    pauseIcon.style.display = 'block';
                } else {
                    audio.pause();
                    playIcon.style.display = 'block';
                    pauseIcon.style.display = 'none';
                }
                break;
            case 'mute':
                audio.muted = !audio.muted;
                break;
        }

        // Update progress and time
        audio.addEventListener('timeupdate', () => {
            const progress = (audio.currentTime / audio.duration) * 100;
            progressFill.style.width = `${progress}%`;
            timeDisplay.textContent = `${this.formatTime(audio.currentTime)} / ${this.formatTime(audio.duration)}`;
        });

        // Handle progress bar click
        progressBar.addEventListener('click', (e) => {
            const rect = progressBar.getBoundingClientRect();
            const pos = (e.clientX - rect.left) / rect.width;
            audio.currentTime = pos * audio.duration;
        });
    }

    formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    async copyBase64ToClipboard() {
        const base64Output = document.getElementById('base64Output');
        const base64Text = base64Output.value.trim();
        
        if (!base64Text) {
            window.uiManager.showToast('No Base64 data to copy', 'error');
            return;
        }

        try {
            await navigator.clipboard.writeText(base64Text);
            window.uiManager.showToast('Base64 copied to clipboard', 'success');
        } catch (error) {
            // Fallback for older browsers
            base64Output.select();
            document.execCommand('copy');
            window.uiManager.showToast('Base64 copied to clipboard', 'success');
        }
    }

    downloadCurrentFile() {
        if (!this.currentFile) {
            window.uiManager.showToast('No file to download', 'error');
            return;
        }

        const blob = window.uiManager.base64ToBlob(this.currentFile.base64, this.currentFile.type);
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = this.currentFile.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        window.uiManager.showToast('Download started', 'success');
    }

    clearBase64() {
        document.getElementById('base64Output').value = '';
        document.getElementById('previewSection').style.display = 'none';
        this.currentFile = null;
        
        // Reset file input
        document.getElementById('fileInput').value = '';
        
        window.uiManager.showToast('Cleared', 'success');
    }

    async decodeBase64() {
        const base64Input = document.getElementById('base64Output').value.trim();
        
        if (!base64Input) {
            window.uiManager.showToast('Please enter Base64 data to decode', 'error');
            return;
        }

        window.uiManager.showLoading('Decoding Base64...');

        try {
            const fileData = this.base64ToFile(base64Input);
            
            this.currentFile = {
                name: fileData.name,
                type: fileData.type,
                size: fileData.size,
                base64: base64Input
            };

            this.showFilePreview();
            window.uiManager.showToast('Base64 decoded successfully', 'success');
            
        } catch (error) {
            console.error('Base64 decoding failed:', error);
            window.uiManager.showToast('Invalid Base64 data', 'error');
        } finally {
            window.uiManager.hideLoading();
        }
    }

    base64ToFile(base64String) {
        // Try to detect file type from Base64 header
        let mimeType = 'application/octet-stream';
        let fileName = 'decoded_file';
        
        // Common Base64 signatures
        const signatures = {
            '/9j/': { type: 'image/jpeg', ext: 'jpg' },
            'iVBORw0KGgo': { type: 'image/png', ext: 'png' },
            'R0lGODdh': { type: 'image/gif', ext: 'gif' },
            'R0lGODlh': { type: 'image/gif', ext: 'gif' },
            'UklGR': { type: 'image/webp', ext: 'webp' },
            'JVBERi0': { type: 'application/pdf', ext: 'pdf' },
            'UEsDB': { type: 'application/zip', ext: 'zip' }
        };

        // Check for signatures
        for (const [sig, info] of Object.entries(signatures)) {
            if (base64String.startsWith(sig)) {
                mimeType = info.type;
                fileName = `decoded_file.${info.ext}`;
                break;
            }
        }

        // Calculate size
        const size = Math.ceil(base64String.length * 3 / 4);

        return {
            name: fileName,
            type: mimeType,
            size: size
        };
    }

    validateBase64Input() {
        const base64Output = document.getElementById('base64Output');
        const input = base64Output.value.trim();
        
        if (input.length === 0) return;

        // Basic Base64 validation
        const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
        const isValid = base64Regex.test(input) && input.length % 4 === 0;
        
        if (isValid) {
            base64Output.style.borderColor = 'var(--success)';
        } else {
            base64Output.style.borderColor = 'var(--error)';
        }
    }

    async saveCurrentFile() {
        if (!this.currentFile) return;

        try {
            await window.storageManager.saveFile(this.currentFile);
            window.uiManager.showToast('File saved', 'success');
        } catch (error) {
            console.error('Save failed:', error);
            window.uiManager.showToast('Failed to save file', 'error');
        }
    }

    isArchiveType(mimeType) {
        const archiveTypes = [
            'application/zip',
            'application/x-zip-compressed',
            'application/x-rar-compressed',
            'application/x-7z-compressed',
            'application/x-tar',
            'application/gzip'
        ];
        
        return archiveTypes.includes(mimeType) || 
               mimeType.includes('zip') || 
               mimeType.includes('rar') ||
               mimeType.includes('archive');
    }

    getGenericIconType(mimeType) {
        if (mimeType.startsWith('text/')) return 'document';
        if (mimeType.includes('pdf')) return 'document';
        if (mimeType.includes('word') || mimeType.includes('doc')) return 'document';
        if (mimeType.includes('excel') || mimeType.includes('sheet')) return 'document';
        if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return 'document';
        if (this.isArchiveType(mimeType)) return 'archive';
        return 'document';
    }
}

// Export for global use
window.encoderManager = new EncoderManager();