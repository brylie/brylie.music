export const SIGNAL_LENGTH = 800;
const SAMPLE_RATE = 44100;

export interface CompressionParams {
  threshDb: number;
  ratio: number;
  attackMs: number;
  releaseMs: number;
}

export interface CompressionResult {
  out: Float32Array;
  gr: Float32Array;
}

/**
 * Generate a realistic-ish audio-like waveform with dynamic variation.
 */
export function makeSignal(n: number): Float32Array {
  const s = new Float32Array(n);
  const components = [
    { f: 0.018, a: 0.5 }, { f: 0.035, a: 0.3 }, { f: 0.06, a: 0.18 },
    { f: 0.011, a: 0.6 }, { f: 0.042, a: 0.22 }, { f: 0.089, a: 0.14 },
    { f: 0.005, a: 0.4 },
  ];
  for (let i = 0; i < n; i++) {
    let v = 0;
    components.forEach(({ f, a }) => { v += Math.sin(i * f * Math.PI * 2) * a; });
    s[i] = v / 2.2;
  }
  // Quiet section in the middle
  for (let i = Math.floor(n * 0.32); i < Math.floor(n * 0.44); i++) s[i] *= 0.25;
  // Louder section near the end
  for (let i = Math.floor(n * 0.7); i < Math.floor(n * 0.8); i++) s[i] *= 1.3;
  return s;
}

/**
 * Apply dynamic range compression to a signal.
 */
export function compress(signal: Float32Array, params: CompressionParams): CompressionResult {
  const { threshDb, ratio, attackMs, releaseMs } = params;
  const n = signal.length;
  const threshLin = Math.pow(10, threshDb / 20);
  const atk = Math.exp(-1 / (SAMPLE_RATE * (attackMs / 1000) / n));
  const rel = Math.exp(-1 / (SAMPLE_RATE * (releaseMs / 1000) / n));
  const out = new Float32Array(n);
  const gr = new Float32Array(n);
  let env = 0;
  for (let i = 0; i < n; i++) {
    const abs = Math.abs(signal[i]);
    env = abs > env ? atk * env + (1 - atk) * abs : rel * env + (1 - rel) * abs;
    let grLin = 1;
    if (env > threshLin) {
      const overDb = 20 * Math.log10(env / threshLin);
      const reduceDb = overDb * (1 - 1 / ratio);
      grLin = Math.pow(10, -reduceDb / 20);
    }
    out[i] = signal[i] * grLin;
    gr[i] = grLin;
  }
  return { out, gr };
}

/**
 * Compute average gain reduction in dB and percentage from a gr array.
 */
export function gainReductionStats(gr: Float32Array): { db: number; pct: number } {
  const avg = gr.reduce((a, b) => a + b, 0) / gr.length;
  const db = Math.max(0, -20 * Math.log10(avg + 1e-9));
  const pct = Math.min(100, (db / 20) * 100);
  return { db, pct };
}
