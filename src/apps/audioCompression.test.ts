import { describe, it, expect } from 'vitest';
import { makeSignal, compress, gainReductionStats, SIGNAL_LENGTH } from './audioCompression';

describe('makeSignal', () => {
  it('returns a Float32Array of the requested length', () => {
    const s = makeSignal(SIGNAL_LENGTH);
    expect(s).toBeInstanceOf(Float32Array);
    expect(s.length).toBe(SIGNAL_LENGTH);
  });

  it('produces non-zero values', () => {
    const s = makeSignal(SIGNAL_LENGTH);
    const hasNonZero = Array.from(s).some((v) => v !== 0);
    expect(hasNonZero).toBe(true);
  });
});

describe('compress', () => {
  it('applies no gain reduction when threshold is above all signal levels', () => {
    const signal = makeSignal(SIGNAL_LENGTH);
    // Threshold at 0 dB means threshLin=1; signal peaks are well below 1
    const { gr } = compress(signal, { threshDb: 0, ratio: 4, attackMs: 10, releaseMs: 120 });
    const allOne = Array.from(gr).every((v) => Math.abs(v - 1) < 1e-6);
    expect(allOne).toBe(true);
  });

  it('reduces gain when threshold is low and ratio is high', () => {
    const signal = makeSignal(SIGNAL_LENGTH);
    const { gr } = compress(signal, { threshDb: -40, ratio: 20, attackMs: 1, releaseMs: 20 });
    const avg = gr.reduce((a, b) => a + b, 0) / gr.length;
    expect(avg).toBeLessThan(1);
  });

  it('output amplitude is always ≤ input amplitude when compressing', () => {
    const signal = makeSignal(SIGNAL_LENGTH);
    const { out } = compress(signal, { threshDb: -20, ratio: 8, attackMs: 5, releaseMs: 50 });
    const exceeded = Array.from(signal).some(
      (v, i) => Math.abs(out[i]) > Math.abs(v) + 1e-9,
    );
    expect(exceeded).toBe(false);
  });

  it('returns arrays of the same length as the input', () => {
    const signal = makeSignal(SIGNAL_LENGTH);
    const { out, gr } = compress(signal, { threshDb: -18, ratio: 4, attackMs: 10, releaseMs: 120 });
    expect(out.length).toBe(signal.length);
    expect(gr.length).toBe(signal.length);
  });
});

describe('gainReductionStats', () => {
  it('returns 0 dB and 0 pct when gr is all ones (no reduction)', () => {
    const gr = new Float32Array(100).fill(1);
    const { db, pct } = gainReductionStats(gr);
    expect(db).toBeCloseTo(0, 1);
    expect(pct).toBeCloseTo(0, 1);
  });

  it('returns positive dB and pct > 0 when gain is reduced', () => {
    const gr = new Float32Array(100).fill(0.5); // -6 dB reduction
    const { db, pct } = gainReductionStats(gr);
    expect(db).toBeGreaterThan(0);
    expect(pct).toBeGreaterThan(0);
  });

  it('clamps pct to 100', () => {
    const gr = new Float32Array(100).fill(1e-9); // massive reduction
    const { pct } = gainReductionStats(gr);
    expect(pct).toBeLessThanOrEqual(100);
  });
});
