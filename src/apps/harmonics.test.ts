import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { HarmonicsEngine, INTERVAL_NAMES } from './harmonics';

// Mock AudioContext and related nodes
const mockOscillator = {
    type: 'sine',
    frequency: { value: 0, setValueAtTime: vi.fn() },
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    disconnect: vi.fn()
};

const mockGain = {
    gain: { value: 0, setValueAtTime: vi.fn() },
    connect: vi.fn(),
    disconnect: vi.fn()
};

const mockAnalyser = {
    fftSize: 2048,
    connect: vi.fn()
};

const mockAudioContext = {
    createOscillator: vi.fn(() => ({ ...mockOscillator })),
    createGain: vi.fn(() => ({ ...mockGain })),
    createAnalyser: vi.fn(() => ({ ...mockAnalyser })),
    destination: {},
    currentTime: 0,
    state: 'suspended',
    resume: vi.fn()
};

describe('HarmonicsEngine', () => {
    let engine: HarmonicsEngine;

    beforeEach(() => {
        // Mock global AudioContext
        const AudioContextMock = vi.fn();
        AudioContextMock.prototype.createAnalyser = vi.fn(() => ({ ...mockAnalyser }));
        AudioContextMock.prototype.createGain = vi.fn(() => ({ ...mockGain }));
        AudioContextMock.prototype.createOscillator = vi.fn(() => ({ ...mockOscillator }));
        AudioContextMock.prototype.resume = mockAudioContext.resume;
        Object.defineProperty(AudioContextMock.prototype, 'destination', { get: () => ({}) });
        Object.defineProperty(AudioContextMock.prototype, 'currentTime', { get: () => 0 });
        Object.defineProperty(AudioContextMock.prototype, 'state', { get: () => 'suspended' });

        vi.stubGlobal('AudioContext', AudioContextMock);
        vi.stubGlobal('webkitAudioContext', AudioContextMock);
        engine = new HarmonicsEngine();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('initializes with default state', () => {
        const state = engine.getState();
        expect(state.fundamentalFreq).toBe(220);
        expect(state.masterVolume).toBe(0.5);
        expect(state.harmonics).toHaveLength(16);
        expect(state.harmonics[0].active).toBe(true); // First harmonic active by default
        expect(state.harmonics[1].active).toBe(false);
        expect(state.isPlaying).toBe(false);
    });

    it('toggles playback', () => {
        engine.togglePlay();
        expect(engine.getState().isPlaying).toBe(true);
        expect(mockAudioContext.resume).toHaveBeenCalled();

        engine.togglePlay();
        expect(engine.getState().isPlaying).toBe(false);
    });

    it('toggles harmonics', () => {
        const index = 1; // 2nd harmonic
        expect(engine.getState().harmonics[index].active).toBe(false);

        engine.toggleHarmonic(index);
        expect(engine.getState().harmonics[index].active).toBe(true);

        engine.toggleHarmonic(index);
        expect(engine.getState().harmonics[index].active).toBe(false);
    });

    it('updates fundamental frequency', () => {
        engine.setFrequency(440);
        expect(engine.getState().fundamentalFreq).toBe(440);
    });

    it('updates master volume', () => {
        engine.setMasterVolume(0.8);
        expect(engine.getState().masterVolume).toBe(0.8);
    });

    it('has correct interval names', () => {
        expect(INTERVAL_NAMES).toHaveLength(16);
        expect(INTERVAL_NAMES[0]).toBe('Fundamental');
        expect(INTERVAL_NAMES[1]).toBe('Octave');
    });
});
