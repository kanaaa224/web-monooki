// --------------------------------------------------
//  イコライザー
//  (c) 2025 kanaaa224. All rights reserved.
// --------------------------------------------------

class Equalizer {
    constructor(audioContext) {
        this.audioContext = audioContext;

        this.bands = [
            { frequency: 31.25, gain: 0 },
            { frequency: 62.5,  gain: 0 },
            { frequency: 125,   gain: 0 },
            { frequency: 250,   gain: 0 },
            { frequency: 500,   gain: 0 },
            { frequency: 1000,  gain: 0 },
            { frequency: 2000,  gain: 0 },
            { frequency: 4000,  gain: 0 },
            { frequency: 8000,  gain: 0 },
            { frequency: 16000, gain: 0 }
        ];

        this.filters = this.bands.map((band, index) => {
            const filter = this.audioContext.createBiquadFilter();

            if(index === 0) {
                filter.type = 'lowshelf';
            } else if(index === this.bands.length - 1) {
                filter.type = 'highshelf';
            } else {
                filter.type = 'peaking';
                filter.Q.value = 1;
            }

            filter.frequency.value = band.frequency;
            filter.gain.value      = band.gain;

            return filter;
        });

        for(let i = 0; i < this.filters.length - 1; i++) {
            this.filters[i].connect(this.filters[i + 1]); // フィルターを直列接続
        }
    }

    getInput() {
        return this.filters[0];
    }

    getOutput() {
        return this.filters[this.filters.length - 1];
    }

    setBandGain(bandIndex, gain) {
        if(bandIndex >= 0 && bandIndex < this.filters.length) {
            this.filters[bandIndex].gain.value = gain;
            this.bands  [bandIndex].gain       = gain;
        }
    }

    reset() {
        this.filters.forEach((filter, index) => {
            filter.gain.value      = 0;
            this.bands[index].gain = 0;
        });
    }
}

export default Equalizer;