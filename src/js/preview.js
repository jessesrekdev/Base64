// Preview Manager
class PreviewManager {
    constructor() {
        this.zoomLevel = 1;
        this.maxZoom = 5;
        this.minZoom = 0.1;
        this.init();
    }

    init() {
        // Preview manager is initialized when needed
    }

    createImagePreview(file) {
        const container = document.createElement('div');
        container.className = 'preview-container image-preview';
        
        const dataUrl = `data:${file.type};base64,${file.base64}`;
        
        container.innerHTML = `
            <div class="preview-header">
                <h3>${file.name}</h3>
                <div class="preview-actions">
                    <button class="action-btn" onclick="previewManager.zoomImage('out')">
                        <svg viewBox="0 0 24 24">
                            <circle cx="11" cy="11" r="8" fill="none" stroke="currentColor" stroke-width="2"/>
                            <path d="M8 11h6" fill="none" stroke="currentColor" stroke-width="2"/>
                            <path d="M21 21l-4.35-4.35" fill="none" stroke="currentColor" stroke-width="2"/>
                        </svg>
                        Zoom Out
                    </button>
                    <button class="action-btn" onclick="previewManager.zoomImage('in')">
                        <svg viewBox="0 0 24 24">
                            <circle cx="11" cy="11" r="8" fill="none" stroke="currentColor" stroke-width="2"/>
                            <path d="M11 8v6M8 11h6" fill="none" stroke="currentColor" stroke-width="2"/>
                            <path d="M21 21l-4.35-4.35" fill="none" stroke="currentColor" stroke-width="2"/>
                        </svg>
                        Zoom In
                    </button>
                    <button class="action-btn" onclick="previewManager.resetZoom()">
                        <svg viewBox="0 0 24 24">
                            <path d="M1 4v6h6M23 20v-6h-6" fill="none" stroke="currentColor" stroke-width="2"/>
                            <path d="M20.49 9A9 9 0 005.64 5.64L1 10M3.51 15a9 9 0 0014.85 3.36L23 14" fill="none" stroke="currentColor" stroke-width="2"/>
                        </svg>
                        Reset
                    </button>
                    <button class="action-btn primary" onclick="previewManager.openFullscreen()">
                        <svg viewBox="0 0 24 24">
                            <path d="M8 3H5a2 2 0 00-2 2v3M21 8V5a2 2 0 00-2-2h-3M16 21h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3" fill="none" stroke="currentColor" stroke-width="2"/>
                        </svg>
                        Fullscreen
                    </button>
                </div>
            </div>
            <div class="image-container" style="overflow: auto; max-height: 500px; text-align: center; padding: 1rem;">
                <img id="preview-image" src="${dataUrl}" alt="${file.name}" 
                     style="max-width: 100%; height: auto; transition: transform 0.3s ease; cursor: grab;"
                     draggable="false">
            </div>
            <div class="preview-footer">
                <span class="file-info">${window.storageManager.formatFileSize(file.size)} • ${file.type}</span>
                <span class="zoom-info">Zoom: ${Math.round(this.zoomLevel * 100)}%</span>
            </div>
        `;

        this.attachImageEvents(container);
        return container;
    }

    createVideoPreview(file) {
        const container = document.createElement('div');
        container.className = 'preview-container video-preview';
        
        const dataUrl = `data:${file.type};base64,${file.base64}`;
        
        container.innerHTML = `
            <div class="preview-header">
                <h3>${file.name}</h3>
                <div class="preview-actions">
                    <button class="action-btn" onclick="previewManager.togglePlayback()">
                        <svg class="play-icon" viewBox="0 0 24 24">
                            <polygon points="5 3 19 12 5 21 5 3" fill="currentColor"/>
                        </svg>
                        <svg class="pause-icon" viewBox="0 0 24 24" style="display: none;">
                            <rect x="6" y="4" width="4" height="16" fill="currentColor"/>
                            <rect x="14" y="4" width="4" height="16" fill="currentColor"/>
                        </svg>
                        Play
                    </button>
                    <button class="action-btn" onclick="previewManager.toggleMute()">
                        <svg class="volume-icon" viewBox="0 0 24 24">
                            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor"/>
                            <path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07" fill="none" stroke="currentColor" stroke-width="2"/>
                        </svg>
                        <svg class="mute-icon" viewBox="0 0 24 24" style="display: none;">
                            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor"/>
                            <line x1="23" y1="9" x2="17" y2="15" stroke="currentColor" stroke-width="2"/>
                            <line x1="17" y1="9" x2="23" y2="15" stroke="currentColor" stroke-width="2"/>
                        </svg>
                        Volume
                    </button>
                    <button class="action-btn primary" onclick="previewManager.openVideoFullscreen()">
                        <svg viewBox="0 0 24 24">
                            <path d="M8 3H5a2 2 0 00-2 2v3M21 8V5a2 2 0 00-2-2h-3M16 21h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3" fill="none" stroke="currentColor" stroke-width="2"/>
                        </svg>
                        Fullscreen
                    </button>
                </div>
            </div>
            <div class="video-container" style="position: relative; background: black; border-radius: 8px; overflow: hidden;">
                <video id="preview-video" 
                       style="width: 100%; height: auto; display: block;"
                       controls
                       preload="metadata">
                    <source src="${dataUrl}" type="${file.type}">
                    Your browser does not support video playback.
                </video>
            </div>
            <div class="preview-footer">
                <span class="file-info">${window.storageManager.formatFileSize(file.size)} • ${file.type}</span>
                <span class="duration-info" id="video-duration">Duration: Loading...</span>
            </div>
        `;

        this.attachVideoEvents(container);
        return container;
    }

    createAudioPreview(file) {
        const container = document.createElement('div');
        container.className = 'preview-container audio-preview';
        
        const dataUrl = `data:${file.type};base64,${file.base64}`;
        
        container.innerHTML = `
            <div class="preview-header">
                <h3>${file.name}</h3>
                <div class="preview-actions">
                    <button class="action-btn" onclick="previewManager.toggleAudioPlayback()">
                        <svg class="play-icon" viewBox="0 0 24 24">
                            <polygon points="5 3 19 12 5 21 5 3" fill="currentColor"/>
                        </svg>
                        <svg class="pause-icon" viewBox="0 0 24 24" style="display: none;">
                            <rect x="6" y="4" width="4" height="16" fill="currentColor"/>
                            <rect x="14" y="4" width="4" height="16" fill="currentColor"/>
                        </svg>
                        Play
                    </button>
                    <button class="action-btn" onclick="previewManager.toggleAudioMute()">
                        <svg class="volume-icon" viewBox="0 0 24 24">
                            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor"/>
                            <path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07" fill="none" stroke="currentColor" stroke-width="2"/>
                        </svg>
                        Volume
                    </button>
                </div>
            </div>
            <div class="audio-container" style="text-align: center; padding: 2rem; background: var(--surface-secondary); border-radius: 8px;">
                <div class="audio-visualization" style="margin-bottom: 1rem;">
                    <svg style="width: 120px; height: 120px; color: var(--secondary);" viewBox="0 0 24 24">
                        <path d="M9 18V5l12-2v13" fill="none" stroke="currentColor" stroke-width="2"/>
                        <circle cx="6" cy="18" r="3" fill="none" stroke="currentColor" stroke-width="2"/>
                        <circle cx="18" cy="16" r="3" fill="none" stroke="currentColor" stroke-width="2"/>
                    </svg>
                </div>
                <audio id="preview-audio" 
                       style="width: 100%; max-width: 400px;"
                       controls
                       preload="metadata">
                    <source src="${dataUrl}" type="${file.type}">
                    Your browser does not support audio playback.
                </audio>
                <div class="waveform-placeholder" style="margin-top: 1rem; height: 60px; background: linear-gradient(90deg, var(--primary) 0%, var(--secondary) 100%); border-radius: 4px; opacity: 0.3; position: relative; overflow: hidden;">
                    <div class="waveform-animation" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%); animation: waveform 2s linear infinite;"></div>
                </div>
            </div>
            <div class="preview-footer">
                <span class="file-info">${window.storageManager.formatFileSize(file.size)} • ${file.type}</span>
                <span class="duration-info" id="audio-duration">Duration: Loading...</span>
            </div>
        `;

        this.attachAudioEvents(container);
        return container;
    }

    createPDFPreview(file) {
        const container = document.createElement('div');
        container.className = 'preview-container pdf-preview';
        
        const dataUrl = `data:${file.type};base64,${file.base64}`;
        
        container.innerHTML = `
            <div class="preview-header">
                <h3>${file.name}</h3>
                <div class="preview-actions">
                    <button class="action-btn" onclick="previewManager.zoomPDF('out')">
                        <svg viewBox="0 0 24 24">
                            <circle cx="11" cy="11" r="8" fill="none" stroke="currentColor" stroke-width="2"/>
                            <path d="M8 11h6" fill="none" stroke="currentColor" stroke-width="2"/>
                            <path d="M21 21l-4.35-4.35" fill="none" stroke="currentColor" stroke-width="2"/>
                        </svg>
                        Zoom Out
                    </button>
                    <button class="action-btn" onclick="previewManager.zoomPDF('in')">
                        <svg viewBox="0 0 24 24">
                            <circle cx="11" cy="11" r="8" fill="none" stroke="currentColor" stroke-width="2"/>
                            <path d="M11 8v6M8 11h6" fill="none" stroke="currentColor" stroke-width="2"/>
                            <path d="M21 21l-4.35-4.35" fill="none" stroke="currentColor" stroke-width="2"/>
                        </svg>
                        Zoom In
                    </button>
                    <button class="action-btn primary" onclick="previewManager.openPDFFullscreen()">
                        <svg viewBox="0 0 24 24">
                            <path d="M8 3H5a2 2 0 00-2 2v3M21 8V5a2 2 0 00-2-2h-3M16 21h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3" fill="none" stroke="currentColor" stroke-width="2"/>
                        </svg>
                        Fullscreen
                    </button>
                </div>
            </div>
            <div class="pdf-container" style="height: 600px; border-radius: 8px; overflow: hidden; background: white;">
                <iframe id="preview-pdf" 
                        src="${dataUrl}" 
                        style="width: 100%; height: 100%; border: none;"
                        title="${file.name}">
                    <p>PDF preview not supported in your browser. <a href="${dataUrl}" download="${file.name}">Download PDF</a></p>
                </iframe>
            </div>
            <div class="preview-footer">
                <span class="file-info">${window.storageManager.formatFileSize(file.size)} • ${file.type}</span>
                <span class="zoom-info">Zoom: 100%</span>
            </div>
        `;

        return container;
    }

    createArchivePreview(file) {
        const container = document.createElement('div');
        container.className = 'preview-container archive-preview';
        
        container.innerHTML = `
            <div class="preview-header">
                <h3>${file.name}</h3>
                <div class="preview-actions">
                    <button class="action-btn primary" onclick="window.encoderManager.downloadCurrentFile()">
                        <svg viewBox="0 0 24 24">
                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        Download
                    </button>
                </div>
            </div>
            <div class="archive-container" style="text-align: center; padding: 3rem; background: var(--surface-secondary); border-radius: 8px;">
                <div class="archive-icon" style="margin-bottom: 1.5rem;">
                    <svg style="width: 80px; height: 80px; color: var(--text-secondary);" viewBox="0 0 24 24">
                        <path d="M21 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v2" fill="none" stroke="currentColor" stroke-width="2"/>
                        <path d="M21 9v10a2 2 0 01-2 2H5a2 2 0 01-2-2V9" fill="none" stroke="currentColor" stroke-width="2"/>
                        <path d="M7 12h10l-1 7H8z" fill="none" stroke="currentColor" stroke-width="2"/>
                    </svg>
                </div>
                <h3 style="margin-bottom: 0.5rem; color: var(--text-primary);">Archive File</h3>
                <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">
                    Preview not available for archive files.<br>
                    Download to extract and view contents.
                </p>
                <div class="file-properties" style="background: var(--surface); border-radius: 8px; padding: 1rem; text-align: left; max-width: 300px; margin: 0 auto;">
                    <div style="margin-bottom: 0.5rem;"><strong>Type:</strong> ${this.getArchiveType(file.type)}</div>
                    <div style="margin-bottom: 0.5rem;"><strong>Size:</strong> ${window.storageManager.formatFileSize(file.size)}</div>
                    <div><strong>Encoding:</strong> Base64</div>
                </div>
            </div>
            <div class="preview-footer">
                <span class="file-info">${window.storageManager.formatFileSize(file.size)} • ${file.type}</span>
                <span class="archive-info">Archive format detected</span>
            </div>
        `;

        return container;
    }

    attachImageEvents(container) {
        const image = container.querySelector('#preview-image');
        let isDragging = false;
        let dragStart = { x: 0, y: 0 };
        let imagePosition = { x: 0, y: 0 };

        // Mouse events for drag
        image.addEventListener('mousedown', (e) => {
            if (this.zoomLevel > 1) {
                isDragging = true;
                dragStart.x = e.clientX - imagePosition.x;
                dragStart.y = e.clientY - imagePosition.y;
                image.style.cursor = 'grabbing';
                e.preventDefault();
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (isDragging && this.zoomLevel > 1) {
                imagePosition.x = e.clientX - dragStart.x;
                imagePosition.y = e.clientY - dragStart.y;
                image.style.transform = `scale(${this.zoomLevel}) translate(${imagePosition.x / this.zoomLevel}px, ${imagePosition.y / this.zoomLevel}px)`;
            }
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                image.style.cursor = this.zoomLevel > 1 ? 'grab' : 'default';
            }
        });

        // Scroll to zoom
        image.addEventListener('wheel', (e) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -1 : 1;
            this.zoomImage(delta > 0 ? 'in' : 'out');
        });
    }

    attachVideoEvents(container) {
        const video = container.querySelector('#preview-video');
        const durationInfo = container.querySelector('#video-duration');

        video.addEventListener('loadedmetadata', () => {
            durationInfo.textContent = `Duration: ${this.formatDuration(video.duration)}`;
        });

        video.addEventListener('error', (e) => {
            console.error('Video error:', e);
            container.querySelector('.video-container').innerHTML = `
                <div style="padding: 2rem; text-align: center; background: var(--surface-secondary); border-radius: 8px;">
                    <svg style="width: 48px; height: 48px; color: var(--error); margin-bottom: 1rem;" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/>
                        <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2"/>
                        <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    <p style="color: var(--error);">Error loading video</p>
                    <p style="color: var(--text-secondary); font-size: 0.875rem;">The video format may not be supported by your browser.</p>
                </div>
            `;
        });
    }

    attachAudioEvents(container) {
        const audio = container.querySelector('#preview-audio');
        const durationInfo = container.querySelector('#audio-duration');

        audio.addEventListener('loadedmetadata', () => {
            durationInfo.textContent = `Duration: ${this.formatDuration(audio.duration)}`;
        });

        audio.addEventListener('error', (e) => {
            console.error('Audio error:', e);
            container.querySelector('.audio-container').innerHTML = `
                <div style="padding: 2rem; text-align: center;">
                    <svg style="width: 48px; height: 48px; color: var(--error); margin-bottom: 1rem;" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/>
                        <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2"/>
                        <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    <p style="color: var(--error);">Error loading audio</p>
                    <p style="color: var(--text-secondary); font-size: 0.875rem;">The audio format may not be supported by your browser.</p>
                </div>
            `;
        });
    }

    // Image controls
    zoomImage(direction) {
        const image = document.getElementById('preview-image');
        const zoomInfo = document.querySelector('.zoom-info');
        
        if (!image) return;

        if (direction === 'in' && this.zoomLevel < this.maxZoom) {
            this.zoomLevel *= 1.25;
        } else if (direction === 'out' && this.zoomLevel > this.minZoom) {
            this.zoomLevel /= 1.25;
        }

        this.zoomLevel = Math.max(this.minZoom, Math.min(this.maxZoom, this.zoomLevel));
        
        image.style.transform = `scale(${this.zoomLevel})`;
        image.style.cursor = this.zoomLevel > 1 ? 'grab' : 'default';
        
        if (zoomInfo) {
            zoomInfo.textContent = `Zoom: ${Math.round(this.zoomLevel * 100)}%`;
        }
    }

    resetZoom() {
        this.zoomLevel = 1;
        const image = document.getElementById('preview-image');
        const zoomInfo = document.querySelector('.zoom-info');
        
        if (image) {
            image.style.transform = 'scale(1)';
            image.style.cursor = 'default';
        }
        
        if (zoomInfo) {
            zoomInfo.textContent = 'Zoom: 100%';
        }
    }

    openFullscreen() {
        const image = document.getElementById('preview-image');
        if (image && image.requestFullscreen) {
            image.requestFullscreen();
        }
    }

    // Video controls
    togglePlayback() {
        const video = document.getElementById('preview-video');
        const playIcon = document.querySelector('.play-icon');
        const pauseIcon = document.querySelector('.pause-icon');
        
        if (!video) return;

        if (video.paused) {
            video.play();
            playIcon.style.display = 'none';
            pauseIcon.style.display = 'block';
        } else {
            video.pause();
            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';
        }
    }

    toggleMute() {
        const video = document.getElementById('preview-video');
        const volumeIcon = document.querySelector('.volume-icon');
        const muteIcon = document.querySelector('.mute-icon');
        
        if (!video) return;

        video.muted = !video.muted;
        
        if (video.muted) {
            volumeIcon.style.display = 'none';
            muteIcon.style.display = 'block';
        } else {
            volumeIcon.style.display = 'block';
            muteIcon.style.display = 'none';
        }
    }

    openVideoFullscreen() {
        const video = document.getElementById('preview-video');
        if (video && video.requestFullscreen) {
            video.requestFullscreen();
        }
    }

    // Audio controls
    toggleAudioPlayback() {
        const audio = document.getElementById('preview-audio');
        const playIcon = document.querySelector('.audio-preview .play-icon');
        const pauseIcon = document.querySelector('.audio-preview .pause-icon');
        
        if (!audio) return;

        if (audio.paused) {
            audio.play();
            playIcon.style.display = 'none';
            pauseIcon.style.display = 'block';
        } else {
            audio.pause();
            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';
        }
    }

    toggleAudioMute() {
        const audio = document.getElementById('preview-audio');
        if (audio) {
            audio.muted = !audio.muted;
        }
    }

    // PDF controls
    zoomPDF(direction) {
        // PDF zoom would require a PDF.js integration
        // For now, we'll show a message
        window.uiManager.showToast('PDF zoom requires additional libraries', 'info');
    }

    openPDFFullscreen() {
        const pdf = document.getElementById('preview-pdf');
        if (pdf && pdf.requestFullscreen) {
            pdf.requestFullscreen();
        }
    }

    // Utility functions
    formatDuration(seconds) {
        if (isNaN(seconds) || !isFinite(seconds)) return '0:00';
        
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }

    getArchiveType(mimeType) {
        const types = {
            'application/zip': 'ZIP Archive',
            'application/x-zip-compressed': 'ZIP Archive',
            'application/x-rar-compressed': 'RAR Archive',
            'application/x-7z-compressed': '7-Zip Archive',
            'application/x-tar': 'TAR Archive',
            'application/gzip': 'GZIP Archive'
        };
        
        return types[mimeType] || 'Archive';
    }
}

// Add CSS animations for waveform
const style = document.createElement('style');
style.textContent = `
    @keyframes waveform {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
    }
    
    .preview-container {
        background: var(--surface);
        border-radius: var(--radius-lg);
        box-shadow: 0 4px 16px var(--shadow);
        overflow: hidden;
    }
    
    .preview-header {
        padding: var(--spacing-lg);
        border-bottom: 1px solid var(--border);
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: var(--surface-secondary);
    }
    
    .preview-footer {
        padding: var(--spacing-md) var(--spacing-lg);
        border-top: 1px solid var(--border);
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: var(--surface-secondary);
        font-size: var(--font-size-sm);
        color: var(--text-secondary);
    }
    
    .inline-edit {
        background: var(--surface-secondary) !important;
        border: 1px solid var(--primary) !important;
        border-radius: 4px !important;
        padding: 4px 8px !important;
        font-size: inherit !important;
        font-family: inherit !important;
        color: var(--text-primary) !important;
        width: 100% !important;
        outline: none !important;
    }
`;
document.head.appendChild(style);

// Export for global use
window.previewManager = new PreviewManager();