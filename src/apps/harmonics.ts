/**
 * Harmonics Logic
 * Handles audio context, oscillators, and harmonic state management.
 */

// Musical interval names for the first 16 harmonics
export const INTERVAL_NAMES = [
    'Fundamental', 'Octave', 'Perfect 5th', 'Octave',
    'Major 3rd', 'Perfect 5th', 'Minor 7th', 'Octave',
    'Major 2nd', 'Major 3rd', 'Aug 4th', 'Perfect 5th',
    'Minor 6th', 'Minor 7th', 'Major 7th', 'Octave'
];

export interface Harmonic {
    number: number;
    active: boolean;
    volume: number;
}

export interface HarmonicsState {
    fundamentalFreq: number;
    masterVolume: number;
    harmonics: Harmonic[];
    isPlaying: boolean;
}

export class HarmonicsEngine {
    private audioCtx: AudioContext | null = null;
    private masterGain: GainNode | null = null;
    private analyser: AnalyserNode | null = null;

    // Map harmonic index (0-15) to its nodes
    private nodes: Map<number, { osc: OscillatorNode, gain: GainNode }> = new Map();

    private state: HarmonicsState;

    constructor(initialState?: Partial<HarmonicsState>) {
        this.state = {
            fundamentalFreq: 220,
            masterVolume: 0.5,
            harmonics: Array.from({ length: 16 }, (_, i) => ({
                number: i + 1,
                active: i === 0,
                volume: i === 0 ? 1.0 : 0.5 / Math.sqrt(i + 1)
            })),
            isPlaying: false,
            ...initialState
        };
    }

    public getState(): HarmonicsState {
        return {
            ...this.state,
            harmonics: this.state.harmonics.map(h => ({ ...h }))
        };
    }

    public async init(): Promise<void> {
        this.ensureAudioContext();
    }

    public getAnalyser(): AnalyserNode | null {
        return this.analyser;
    }

    public play(): void {
        if (!this.audioCtx) {
            // In a real app, we might need to wait for init, but for now we assume init 
            // is called or we call it synchronously (AudioContext ctor is sync).
            // However, separating init allows handling async resume if needed.
            // We'll call the synchronous part of init if needed.
            // But let's rely on explicit init or lazy init.
            // But let's rely on explicit init or lazy init.
            this.ensureAudioContext();
            // Note: in tests ensureAudioContext calls new AudioContext which is mocked.
        }

        if (this.audioCtx?.state === 'suspended') {
            this.audioCtx.resume();
        }

        this.state.isPlaying = true;
        this.syncOscillators();
    }

    private ensureAudioContext(): void {
        if (this.audioCtx) return;
        const AudioContextClass = window.AudioContext
            || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        this.audioCtx = new AudioContextClass();
        this.analyser = this.audioCtx!.createAnalyser();
        this.analyser.fftSize = 2048;
        this.masterGain = this.audioCtx!.createGain();
        this.masterGain.gain.value = this.state.masterVolume;
        this.masterGain.connect(this.analyser);
        this.analyser.connect(this.audioCtx!.destination);
    }

    public stop(): void {
        this.state.isPlaying = false;
        this.nodes.forEach(node => {
            try { node.osc.stop(); } catch (e) { }
            node.osc.disconnect();
            node.gain.disconnect();
        });
        this.nodes.clear();
    }

    public togglePlay(): boolean {
        if (this.state.isPlaying) {
            this.stop();
        } else {
            this.play();
        }
        return this.state.isPlaying;
    }

    public setFundamental(freq: number): void {
        this.state.fundamentalFreq = freq;
        if (this.state.isPlaying && this.audioCtx) {
            const now = this.audioCtx.currentTime;
            this.nodes.forEach((node, index) => {
                node.osc.frequency.setValueAtTime(freq * (index + 1), now);
            });
        }
    }

    // Alias for setFundamental to match tests if needed, or update tests
    public setFrequency(freq: number): void {
        this.setFundamental(freq);
    }

    public setMasterVolume(vol: number): void {
        this.state.masterVolume = vol;
        if (this.masterGain && this.audioCtx) {
            this.masterGain.gain.setValueAtTime(vol, this.audioCtx.currentTime);
        }
    }

    public toggleHarmonic(index: number): void {
        if (index < 0 || index >= this.state.harmonics.length) return;

        this.state.harmonics[index].active = !this.state.harmonics[index].active;
        if (this.state.isPlaying) {
            this.syncOscillators();
        }
    }

    public setHarmonicVolume(index: number, vol: number): void {
        if (index < 0 || index >= this.state.harmonics.length) return;

        this.state.harmonics[index].volume = vol;
        if (this.state.isPlaying && this.audioCtx) {
            const node = this.nodes.get(index);
            if (node) {
                // Scales volume by 0.3 to prevent clipping as in original
                node.gain.gain.setValueAtTime(vol * 0.3, this.audioCtx.currentTime);
            }
        }
    }

    private syncOscillators(): void {
        if (!this.audioCtx || !this.masterGain) return;
        const now = this.audioCtx.currentTime;

        this.state.harmonics.forEach((h, i) => {
            const hasNode = this.nodes.has(i);

            if (h.active && !hasNode) {
                // Create
                const osc = this.audioCtx!.createOscillator();
                const gain = this.audioCtx!.createGain();

                osc.type = 'sine';
                osc.frequency.value = this.state.fundamentalFreq * (i + 1);
                gain.gain.value = h.volume * 0.3;

                osc.connect(gain);
                gain.connect(this.masterGain!);
                osc.start(now);

                this.nodes.set(i, { osc, gain });
            } else if (!h.active && hasNode) {
                // Remove
                const node = this.nodes.get(i);
                if (node) {
                    try { node.osc.stop(now); } catch (e) { }
                    node.osc.disconnect();
                    node.gain.disconnect();
                    this.nodes.delete(i);
                }
            }
        });
    }
}
