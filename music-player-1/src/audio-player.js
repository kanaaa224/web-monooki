// --------------------------------------------------
//  オーディオ プレイヤー
//  (c) 2025 kanaaa224. All rights reserved.
// --------------------------------------------------

import Equalizer           from './equalizer.js';
import SoundFieldSimulator from './sound-field-simulator.js';

class AudioPlayer {
    constructor() {
        this.audioContext = null;
        this.audioBuffer  = null;
        this.source       = null;

        this.isPlaying = false;
        this.isLoaded  = false;

        this.startTime     = 0;
        this.currentOffset = 0;
        this.duration      = 0;

        this.equalizer  = null;
        this.soundField = null;
        this.masterGain = null;
    }

    async _initAudioContext() {
        if(!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

            this.equalizer  = new Equalizer(this.audioContext);
            this.soundField = new SoundFieldSimulator(this.audioContext);

            this.masterGain = this.audioContext.createGain();

            this.masterGain.gain.value = 1.0; // 初期音量

            // イコライザー -> 音場シミュレーター -> マスターゲイン -> 出力
            this.equalizer .getOutput().connect(this.soundField.getInput());
            this.soundField.getOutput().connect(this.masterGain);
            this.masterGain.connect(this.audioContext.destination);
        }

        if(this.audioContext.state === 'suspended') await this.audioContext.resume();
    }

    _createAndStartSource(offset = 0) {
        this._stopSource();

        this.source = this.audioContext.createBufferSource();

        this.source.buffer = this.audioBuffer;

        this.source.connect(this.equalizer.getInput());

        this.source.onended = () => {
            if(this.isPlaying) this.stop();
        };

        this.source.start(0, offset);

        this.startTime = this.audioContext.currentTime;
    }

    _stopSource() {
        if(!this.source) return;

        try {
            this.source.stop();
            this.source.disconnect();
        } catch(e) {}

        this.source = null;
    }

    async loadFile(file) {
        this.stop();

        this.isLoaded = false;

        await this._initAudioContext();

        const arrayBuffer = await file.arrayBuffer();

        this.audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

        this.duration = this.audioBuffer.duration;

        this.currentOffset = 0;

        this.isLoaded = true;

        return this.duration;
    }

    play() {
        if(!this.audioBuffer || this.isPlaying) return false;

        this._createAndStartSource(this.currentOffset);

        this.isPlaying = true;

        return true;
    }

    pause() {
        if(!this.isPlaying) return false;

        this.currentOffset = this.getCurrentTime();

        this._stopSource();

        this.isPlaying = false;

        return true;
    }

    stop() {
        this._stopSource();

        this.startTime     = 0;
        this.currentOffset = 0;

        this.isPlaying = false;
    }

    getCurrentTime() {
        if(this.isPlaying && this.startTime > 0) {
            const elapsed     = this.audioContext.currentTime - this.startTime;
            const currentTime = this.currentOffset + elapsed;

            return Math.min(currentTime, this.duration);
        }

        return this.currentOffset;
    }

    seekTo(time) {
        const targetTime = Math.max(0, Math.min(time, this.duration));
        const wasPlaying = this.isPlaying;

        this._stopSource();

        this.currentOffset = targetTime;

        this.isPlaying = false;

        if(wasPlaying) setTimeout(() => { this.play(); }, 250);
    }

    setVolume(volume) {
        if(this.masterGain) this.masterGain.gain.value = volume;
    }
}

export default AudioPlayer;