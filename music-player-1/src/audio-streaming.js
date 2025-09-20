// --------------------------------------------------
//  オーディオ ストリーミング プレイヤー
//  (c) 2025 kanaaa224. All rights reserved.
// --------------------------------------------------

class AudioStreaming extends AudioPlayer {
    constructor() {
        super();

        this.streamElement = null;
        this.streamSource  = null;

        this.isStreaming = false;
    }

    _createStreamSource() {
        if(this.streamSource) {
            try {
                this.streamSource.disconnect();
            } catch(e) {}

            this.streamSource = null;
        }

        try {
            this.streamSource = this.audioContext.createMediaElementSource(this.streamElement);

            this.streamSource.connect(this.equalizer.getInput());
        } catch(e) {
            console.error('Failed to create MediaElementAudioSourceNode:', e);
        }
    }

    _stopSource() {
        super._stopSource();

        if(this.streamElement) this.streamElement.pause();
    }

    _cleanup() {
        if(this.streamSource) {
            try {
                this.streamSource.disconnect();
            } catch(e) {}

            this.streamSource = null;
        }

        if(this.streamElement) {
            this.streamElement.removeEventListener('loadedmetadata', this._onLoadedMetadata);
            this.streamElement.removeEventListener('error',          this._onError);
            this.streamElement.removeEventListener('ended',          this._onStreamEnded);

            this.streamElement.src = '';
            this.streamElement     = null;
        }
    }

    _onLoadedMetadata = () => {
        this.duration = this.streamElement.duration || 0;

        this._createStreamSource();

        this.isLoaded = true;

        if(this._loadResolve) {
            this._loadResolve(this.duration);
            this._loadResolve = null;
            this._loadReject  = null;
        }
    };

    _onError = (e) => {
        if(this._loadReject) {
            this._loadReject(new Error('Failed to load audio from URL: ' + (e.message || 'Unknown error')));
            this._loadResolve = null;
            this._loadReject  = null;
        }
    };

    _onStreamEnded = () => {
        if(this.isPlaying) this.stop();
    };

    async loadFile(file) {
        this._cleanup();

        this.isStreaming = false;

        return await super.loadFile(file);
    }

    async loadURL(url) {
        this.stop();

        this._cleanup();

        this.isLoaded    = false;
        this.isStreaming = true;

        this.audioBuffer = null; // ストリーミング時は使用しない

        await this._initAudioContext();

        this.streamElement             = new Audio();
        this.streamElement.crossOrigin = 'anonymous';
        this.streamElement.preload     = 'metadata';
        this.streamElement.src         = url;

        return new Promise((resolve, reject) => {
            this._loadResolve = resolve;
            this._loadReject  = reject;

            this.streamElement.addEventListener('loadedmetadata', this._onLoadedMetadata);
            this.streamElement.addEventListener('error',          this._onError);
            this.streamElement.addEventListener('ended',          this._onStreamEnded);

            this.streamElement.load();
        });
    }

    play() {
        if(!this.isLoaded || this.isPlaying) return false;

        if(this.isStreaming) {
            if(!this.streamSource || !this.streamSource.context) this._createStreamSource();

            this.streamElement.currentTime = this.currentOffset;

            const playPromise = this.streamElement.play();

            this.startTime = this.audioContext.currentTime;

            if(playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch((error) => {
                    console.error('HTMLAudioElement play failed:', error);

                    this.isPlaying = false;
                });
            }
        } else {
            return super.play();
        }

        this.isPlaying = true;

        return true;
    }

    pause() {
        if(!this.isPlaying) return false;

        this.currentOffset = this.getCurrentTime();

        if(this.isStreaming) {
            this.streamElement.pause();
        } else {
            this._stopSource();
        }

        this.isPlaying = false;

        return true;
    }

    stop() {
        super.stop();

        if(this.isStreaming && this.streamElement) {
            try {
                this.streamElement.currentTime = 0;
            } catch(e) {
                console.warn('Failed to reset currentTime:', e);
            }
        }
    }

    getCurrentTime() {
        if(this.isStreaming && this.streamElement) return this.streamElement.currentTime || 0;

        return super.getCurrentTime();
    }

    seekTo(time) {
        const targetTime = Math.max(0, Math.min(time, this.duration));
        const wasPlaying = this.isPlaying;

        this._stopSource();

        this.isPlaying = false;

        this.currentOffset = targetTime;

        if(this.isStreaming) {
            try {
                this.streamElement.currentTime = targetTime;
            } catch(e) {
                console.warn('Failed to seek:', e);
            }

            if(!this.streamSource || !this.streamSource.context) this._createStreamSource();
        }

        if(wasPlaying) setTimeout(() => { this.play(); }, 250);
    }

    destroy() {
        this.stop();

        this._cleanup();

        if(this.audioContext) {
            try {
                this.audioContext.close();
            } catch(e) {}

            this.audioContext = null;
        }

        this.audioBuffer = null;
        this.equalizer   = null;
        this.soundField  = null;
        this.masterGain  = null;
    }
}