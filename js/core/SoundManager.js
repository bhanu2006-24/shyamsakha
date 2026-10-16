/**
 * SoundManager - Procedural Web Audio API Synthesizer & Bhajan Music Player
 * Plays authentic procedural flute, ball hits, and streams the 7 bhajans from assets/audio/
 */
export class SoundManager {
    constructor() {
        this.ctx = null;
        this.enabled = true;
        this.ambientPlaying = false;
        this.ambientGain = null;

        // Bhajan Playlist
        this.bhajanTracks = [
            { id: 1, title: "Vrindavan Dhun 1", file: "assets/audio/bhajan 1.mp3" },
            { id: 2, title: "Radhe Govinda 2", file: "assets/audio/bhajan 2.mp3" },
            { id: 3, title: "Madhurashtakam 3", file: "assets/audio/bhajan 3.mp3" },
            { id: 4, title: "Gopala Hari 4", file: "assets/audio/bhajan 4.mp3" },
            { id: 5, title: "Yamuna Kinare 5", file: "assets/audio/bhajan 5.mp3" },
            { id: 6, title: "Maha Mantra 6", file: "assets/audio/bhajan 6.mp3" },
            { id: 7, title: "Shyam Sundar 7", file: "assets/audio/bhajan 7.mp3" }
        ];

        this.currentTrackIndex = 0;
        this.audioEl = new Audio();
        this.audioEl.preload = 'metadata';
        this.audioEl.volume = 0.45;
        this.isMusicPlaying = false;

        this.setupAudioListeners();
    }

    setupAudioListeners() {
        this.audioEl.addEventListener('ended', () => {
            this.nextBhajan(true); // Auto-advance to next track
        });

        this.audioEl.addEventListener('error', (e) => {
            console.warn("Audio stream notice for track", this.currentTrackIndex + 1, e);
        });
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
        if (!this.enabled) {
            this.pauseBhajan();
        } else {
            if (this.isMusicPlaying) {
                this.playBhajan(this.currentTrackIndex);
            }
        }
        return this.enabled;
    }

    /**
     * Start / Toggle Bhajan Music Player
     */
    toggleBhajan() {
        if (this.isMusicPlaying) {
            this.pauseBhajan();
            return false;
        } else {
            this.playBhajan(this.currentTrackIndex);
            return true;
        }
    }

    playBhajan(index = 0) {
        if (!this.enabled) return;
        this.init();

        this.currentTrackIndex = (index + this.bhajanTracks.length) % this.bhajanTracks.length;
        const track = this.bhajanTracks[this.currentTrackIndex];

        this.audioEl.src = track.file;
        this.audioEl.play()
            .then(() => {
                this.isMusicPlaying = true;
                this.notifyTrackChange(track);
            })
            .catch((err) => {
                console.log("Audio play gesture required or playback note:", err.message);
                this.isMusicPlaying = false;
            });
    }

    pauseBhajan() {
        this.audioEl.pause();
        this.isMusicPlaying = false;
        this.notifyTrackChange(null);
    }

    nextBhajan(auto = false) {
        this.playBhajan(this.currentTrackIndex + 1);
    }

    prevBhajan() {
        this.playBhajan(this.currentTrackIndex - 1);
    }

    notifyTrackChange(track) {
        const titleEl = document.getElementById('nowPlayingTitle');
        const playBtn = document.getElementById('bhajanPlayBtn');
        if (titleEl) {
            titleEl.innerText = track ? track.title : 'Paused';
        }
        if (playBtn) {
            playBtn.innerHTML = this.isMusicPlaying ? '⏸️' : '▶️';
        }
    }

    /**
     * Play a Divine Bansuri Flute note
     */
    playFluteNote(freq = 587.33, duration = 0.8) {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        // Vibrato LFO
        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();
        lfo.frequency.setValueAtTime(5.5, now);
        lfoGain.gain.setValueAtTime(4.0, now);
        lfo.connect(osc.frequency);
        lfo.start(now);
        lfo.stop(now + duration);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1400, now);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.18, now + 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + duration);
    }

    playDivineFlutePhrase() {
        if (!this.enabled) return;
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

    playBallHit(isSpike = false) {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = isSpike ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(isSpike ? 240 : 160, now);
        osc.frequency.exponentialRampToValueAtTime(isSpike ? 60 : 80, now + (isSpike ? 0.22 : 0.15));

        gain.gain.setValueAtTime(isSpike ? 0.4 : 0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + (isSpike ? 0.25 : 0.16));

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + (isSpike ? 0.26 : 0.18));
    }

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

    playSplash() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

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

    playCheer() {
        if (!this.enabled) return;
        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((f, idx) => {
            setTimeout(() => {
                this.playFluteNote(f, 0.4);
            }, idx * 90);
        });
    }
}

export const soundManager = new SoundManager();
