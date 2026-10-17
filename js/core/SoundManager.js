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

        // Bhajan Playlist - Clean numbered titles
        this.bhajanTracks = [
            { id: 1, title: "Bhajan 1", file: "assets/audio/bhajan 1.mp3" },
            { id: 2, title: "Bhajan 2", file: "assets/audio/bhajan 2.mp3" },
            { id: 3, title: "Bhajan 3", file: "assets/audio/bhajan 3.mp3" },
            { id: 4, title: "Bhajan 4", file: "assets/audio/bhajan 4.mp3" },
            { id: 5, title: "Bhajan 5", file: "assets/audio/bhajan 5.mp3" },
            { id: 6, title: "Bhajan 6", file: "assets/audio/bhajan 6.mp3" },
            { id: 7, title: "Bhajan 7", file: "assets/audio/bhajan 7.mp3" },
            { id: 8, title: "Bhajan 8", file: "assets/audio/bhajan 8.mp3" },
            { id: 9, title: "Bhajan 9", file: "assets/audio/bhajan 9.mp3" },
            { id: 10, title: "Bhajan 10", file: "assets/audio/bhajan 10.mp3" }
        ];

        this.currentTrackIndex = 0;
        this.audioEl = new Audio();
        this.audioEl.preload = 'metadata';
        this.musicVolume = 1.0;
        this.audioEl.volume = this.musicVolume;
        this.isMusicPlaying = false;

        // Settings (Default: Minimap and big portrait are OFF by default per user request)
        this.bgmEnabled = true;
        this.sfxEnabled = true;
        this.textSpeed = 'FAST';
        this.bigPortrait = false;
        this.minimapEnabled = false;
        this.compassEnabled = true;

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

    setMusicVolume(vol) {
        let pct = typeof vol === 'string' ? parseFloat(vol) : Number(vol);
        if (isNaN(pct)) pct = 50;
        // Normalize fraction <= 1.0 (e.g. 0.5) to percentage 50, but preserve 0 and 1
        if (pct > 0 && pct <= 1.0 && vol !== 1 && vol !== "1") {
            pct = pct * 100;
        }
        pct = Math.max(0, Math.min(100, Math.round(pct)));
        this.musicVolume = pct / 100;
        if (this.audioEl) {
            this.audioEl.volume = this.musicVolume;
        }
        return pct;
    }

    adjustVolume(delta) {
        let d = typeof delta === 'string' ? parseFloat(delta) : Number(delta);
        if (isNaN(d)) d = 10;
        // If delta is given as fractional 0.1, convert to 10%
        if (Math.abs(d) <= 1.0 && d !== 0) {
            d = d * 100;
        }
        const curPct = Math.round(this.musicVolume * 100);
        return this.setMusicVolume(curPct + d);
    }

    toggleBgm() {
        this.bgmEnabled = !this.bgmEnabled;
        if (!this.bgmEnabled) {
            this.pauseBhajan();
        } else {
            this.playBhajan(this.currentTrackIndex);
        }
        return this.bgmEnabled;
    }

    cycleBhajanTrack() {
        const nextIdx = (this.currentTrackIndex + 1) % this.bhajanTracks.length;
        if (this.bgmEnabled) {
            this.playBhajan(nextIdx);
        } else {
            this.currentTrackIndex = nextIdx;
            this.notifyTrackChange(this.bhajanTracks[nextIdx]);
        }
        return this.bhajanTracks[this.currentTrackIndex];
    }

    toggleSfx() {
        this.sfxEnabled = !this.sfxEnabled;
        return this.sfxEnabled;
    }

    toggleTextSpeed() {
        this.textSpeed = this.textSpeed === 'FAST' ? 'NORMAL' : 'FAST';
        return this.textSpeed;
    }

    togglePortrait() {
        this.bigPortrait = !this.bigPortrait;
        return this.bigPortrait;
    }

    toggle() {
        this.enabled = !this.enabled;
        if (!this.enabled) {
            this.pauseBhajan();
        } else {
            if (this.bgmEnabled) {
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
        if (!this.enabled || !this.bgmEnabled) return;
        this.init();

        this.currentTrackIndex = (index + this.bhajanTracks.length) % this.bhajanTracks.length;
        const track = this.bhajanTracks[this.currentTrackIndex];

        this.audioEl.src = encodeURI(track.file);
        this.audioEl.volume = this.musicVolume;
        this.audioEl.play()
            .then(() => {
                this.isMusicPlaying = true;
                this.notifyTrackChange(track);
            })
            .catch((err) => {
                console.log("Audio play gesture required or playback note:", err.message);
                this.isMusicPlaying = false;
                this.notifyTrackChange(null);
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
        const optTrackBtn = document.getElementById('optTrackBtn');
        const curTrack = track || this.bhajanTracks[this.currentTrackIndex];

        if (titleEl) {
            titleEl.innerText = this.isMusicPlaying ? `Bhajan ${curTrack.id}` : 'Paused';
        }
        if (optTrackBtn) {
            optTrackBtn.innerText = `BHAJAN ${curTrack.id}`;
        }
    }

    toggleMinimap() {
        this.minimapEnabled = !this.minimapEnabled;
        return this.minimapEnabled;
    }

    toggleCompass() {
        this.compassEnabled = !this.compassEnabled;
        return this.compassEnabled;
    }

    /**
     * Play a Divine Bansuri Flute note
     */
    playFluteNote(freq = 587.33, duration = 0.8) {
        if (!this.enabled || !this.sfxEnabled) return;
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
        if (!this.enabled || !this.sfxEnabled) return;
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
        if (!this.enabled || !this.sfxEnabled) return;
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
        if (!this.enabled || !this.sfxEnabled) return;
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
        if (!this.enabled || !this.sfxEnabled) return;
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
        if (!this.enabled || !this.sfxEnabled) return;
        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((f, idx) => {
            setTimeout(() => {
                this.playFluteNote(f, 0.4);
            }, idx * 90);
        });
    }

    playCowBell() {
        if (!this.enabled || !this.sfxEnabled) return;
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(820, now);
        osc.frequency.exponentialRampToValueAtTime(520, now + 0.25);
        gain.gain.setValueAtTime(0.28, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.32);
    }
}

export const soundManager = new SoundManager();
