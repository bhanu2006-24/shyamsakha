/**
 * SoundManager - Procedural Web Audio API Synthesizer & Audio Asset Loader
 * Plays beautiful authentic sounds without external files, while seamlessly
 * allowing custom audio files from assets/audio/ if added.
 */
export class SoundManager {
    constructor() {
        this.ctx = null;
        this.enabled = true;
        this.ambientPlaying = false;
        this.ambientGain = null;
        this.customAudio = {};
    }

    init() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) {
                this.ctx = new AudioCtx();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggle() {
        this.enabled = !this.enabled;
        if (!this.enabled && this.ambientGain) {
            this.ambientGain.gain.setValueAtTime(0, this.ctx ? this.ctx.currentTime : 0);
        } else if (this.enabled && this.ambientGain && this.ctx) {
            this.ambientGain.gain.setValueAtTime(0.04, this.ctx.currentTime);
        }
        return this.enabled;
    }

    /**
     * Play a Divine Bansuri Flute note or melody
     * Frequency in Hz, or preset note
     */
    playFluteNote(freq = 587.33, duration = 0.8) {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        
        // Carrier oscillator (sine wave for pure bamboo flute)
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        // Gentle vibrato LFO
        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();
        lfo.frequency.setValueAtTime(5.5, now); // 5.5 Hz vibrato
        lfoGain.gain.setValueAtTime(4.0, now);
        lfo.connect(osc.frequency);
        lfo.start(now);
        lfo.stop(now + duration);

        // Breath noise filter for realistic bamboo flute feel
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1400, now);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        // Natural flute envelope: soft attack, sustained breath, gentle fade
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.18, now + 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + duration);
    }

    /**
     * Play a divine classical flute phrase (Raag Bhupali / Yaman)
     */
    playDivineFlutePhrase() {
        if (!this.enabled) return;
        // Notes in Raag Bhupali: Sa, Re, Ga, Pa, Dha, Sa'
        // Frequencies: D4(293.66), E4(329.63), F#4(369.99), A4(440), B4(493.88), D5(587.33)
        const melody = [
            { f: 369.99, d: 0.35, wait: 0 },
            { f: 440.00, d: 0.35, wait: 280 },
            { f: 493.88, d: 0.50, wait: 560 },
            { f: 587.33, d: 0.80, wait: 950 },
            { f: 493.88, d: 0.40, wait: 1600 },
            { f: 440.00, d: 0.60, wait: 1950 }
        ];

        melody.forEach(n => {
            setTimeout(() => {
                this.playFluteNote(n.f, n.d);
            }, n.wait);
        });
    }

    /**
     * Ball Bump / Hit sound in Volleyball
     */
    playBallHit(isSpike = false) {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = isSpike ? 'triangle' : 'sine';
        const startFreq = isSpike ? 240 : 160;
        const endFreq = isSpike ? 60 : 80;

        osc.frequency.setValueAtTime(startFreq, now);
        osc.frequency.exponentialRampToValueAtTime(endFreq, now + (isSpike ? 0.22 : 0.15));

        gain.gain.setValueAtTime(isSpike ? 0.4 : 0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + (isSpike ? 0.25 : 0.16));

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + (isSpike ? 0.26 : 0.18));
    }

    /**
     * Ball sand/grass bounce sound
     */
    playBallBounce() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(110, now);
        osc.frequency.exponentialRampToValueAtTime(45, now + 0.1);

        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.12);
    }

    /**
     * Water splash / Holi squirt sound
     */
    playSplash() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        // White noise burst with bandpass sweep
        const now = this.ctx.currentTime;
        const bufferSize = this.ctx.sampleRate * 0.2;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(800, now);
        filter.frequency.exponentialRampToValueAtTime(300, now + 0.2);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        noise.start(now);
    }

    /**
     * Cow Bell / Tinkle sound
     */
    playCowBell() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200 + Math.random() * 300, now);

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.36);
    }

    /**
     * Cheering / Celebration chime
     */
    playCheer() {
        if (!this.enabled) return;
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C E G C
        notes.forEach((f, idx) => {
            setTimeout(() => {
                this.playFluteNote(f, 0.4);
            }, idx * 90);
        });
    }

    /**
     * Start peaceful Tanpura/Nature drone in background
     */
    startAmbientDrone() {
        if (!this.enabled || this.ambientPlaying) return;
        this.init();
        if (!this.ctx) return;

        try {
            const now = this.ctx.currentTime;
            const droneOsc1 = this.ctx.createOscillator();
            const droneOsc2 = this.ctx.createOscillator();
            this.ambientGain = this.ctx.createGain();

            droneOsc1.type = 'triangle';
            droneOsc1.frequency.setValueAtTime(146.83, now); // D3 (Sa)

            droneOsc2.type = 'sine';
            droneOsc2.frequency.setValueAtTime(220.00, now); // A3 (Pa)

            this.ambientGain.gain.setValueAtTime(0.03, now);

            droneOsc1.connect(this.ambientGain);
            droneOsc2.connect(this.ambientGain);
            this.ambientGain.connect(this.ctx.destination);

            droneOsc1.start();
            droneOsc2.start();
            this.ambientPlaying = true;
        } catch (e) {
            console.warn("Ambient drone audio error:", e);
        }
    }
}

export const soundManager = new SoundManager();
