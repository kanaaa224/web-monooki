// --------------------------------------------------
//  音場 シミュレーター
//  (c) 2025 kanaaa224. All rights reserved.
// --------------------------------------------------

class SoundFieldSimulator {
    constructor(audioContext) {
        this.audioContext = audioContext;
        this.convolver    = audioContext.createConvolver();
        this.wetGain      = audioContext.createGain();
        this.dryGain      = audioContext.createGain();
        this.inputGain    = audioContext.createGain();
        this.outputGain   = audioContext.createGain();

        this.setupConnections();

        this.wetGain.gain.value = 0;
        this.dryGain.gain.value = 1;

        this.inputGain .gain.value = 1;
        this.outputGain.gain.value = 1;

        this.presets = {
            'オフ': { wetness: 0, impulse: null },

            'プリセット 1': { wetness: 0.3,  impulse: this.generateImpulse(2.5, 2.0, 0.4) },
            'プリセット 2': { wetness: 0.4,  impulse: this.generateImpulse(4.0, 3.0, 0.3) },
            'プリセット 3': { wetness: 0.25, impulse: this.generateImpulse(1.5, 1.8, 0.5) },
            'プリセット 4': { wetness: 0.15, impulse: this.generateImpulse(0.8, 4.0, 0.6) },
            'プリセット 5': { wetness: 0.35, impulse: this.generateImpulse(1.2, 2.5, 0.4) },
            'プリセット 6': { wetness: 0.2,  impulse: this.generateImpulse(3.0, 1.5, 0.7) },
            'プリセット 7': { wetness: 0.45, impulse: this.generateImpulse(5.0, 1.2, 0.3) },
            'プリセット 8': { wetness: 0.35, impulse: this.generateImpulse(3.5, 2.2, 0.4) }
        };
    }

    setupConnections() {
        // 入力を分岐
        this.inputGain.connect(this.dryGain);
        this.inputGain.connect(this.convolver);

        // ウェット信号
        this.convolver.connect(this.wetGain);

        // 出力をまとめる
        this.dryGain.connect(this.outputGain);
        this.wetGain.connect(this.outputGain);
    }

    generateImpulse(duration, decayRate, intensity) {
        const sampleRate = this.audioContext.sampleRate;
        const length     = Math.floor(sampleRate * duration);
        const impulse    = this.audioContext.createBuffer(2, length, sampleRate);

        for(let channel = 0; channel < 2; channel++) {
            const channelData    = impulse.getChannelData(channel);
            const numReflections = Math.floor(Math.random() * 8) + 4; // 初期反射音を追加

            for(let i = 0; i < length; i++) {
                let sample = 0;

                const envelope = Math.exp(-decayRate * i / sampleRate); // メインディケイ

                for(let r = 0; r < numReflections; r++) { // 初期反射音
                    const delay = Math.floor((r + 1) * sampleRate * 0.05 * Math.random());

                    if(i === delay) sample += (Math.random() * 2 - 1) * envelope * intensity * 0.3;
                }

                if(i > sampleRate * 0.1) sample += (Math.random() * 2 - 1) * envelope * intensity * 0.1; // 後部残響

                if(channel === 1) sample *= 0.9 + Math.random() * 0.2; // ステレオ効果のための微調整

                channelData[i] = sample;
            }
        }

        return impulse;
    }

    getInput() {
        return this.inputGain;
    }

    getOutput() {
        return this.outputGain;
    }

    applyPreset(presetName) {
        const preset = this.presets[presetName];

        if(preset) {
            const wetness = preset.wetness;
            const dryness = Math.sqrt(1 - wetness * wetness); // 音響的に適切な混合

            this.wetGain.gain.setTargetAtTime(wetness, this.audioContext.currentTime, 0.05);
            this.dryGain.gain.setTargetAtTime(dryness, this.audioContext.currentTime, 0.05);

            if(preset.impulse) this.convolver.buffer = preset.impulse;
        }
    }
}