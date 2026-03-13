<script lang="ts">
  import { untrack } from 'svelte';
  import { makeSignal, compress, gainReductionStats, SIGNAL_LENGTH } from './audioCompression';

  const CANVAS_HEIGHT = 160;
  const W = 640;
  const raw = makeSignal(SIGNAL_LENGTH);

  let threshold = $state(-18);
  let ratio = $state(4);
  let attack = $state(10);
  let release = $state(120);
  let gainReductionDb = $state(0);
  let gainReductionPct = $state(0);

  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D | null = null;

  function isDark(): boolean {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  function draw(): void {
    if (!canvas || !ctx) return;
    const width = canvas.width / (window.devicePixelRatio || 1);
    const height = CANVAS_HEIGHT;

    const { out, gr } = compress(raw, {
      threshDb: threshold,
      ratio,
      attackMs: attack,
      releaseMs: release,
    });

    const stats = gainReductionStats(gr);
    gainReductionDb = stats.db;
    gainReductionPct = stats.pct;

    const threshLin = Math.pow(10, threshold / 20);
    ctx.clearRect(0, 0, width, height);

    const mid = height / 2;
    const scaleY = (v: number) => mid - v * (height * 0.44);

    // Threshold band
    const ty = scaleY(threshLin);
    const by = scaleY(-threshLin);
    ctx.fillStyle = 'rgba(226,75,74,.12)';
    ctx.fillRect(0, 0, width, ty);
    ctx.fillRect(0, by, width, height - by);

    // Threshold lines
    ctx.strokeStyle = 'rgba(226,75,74,.5)';
    ctx.setLineDash([5, 4]);
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, ty); ctx.lineTo(width, ty); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, by); ctx.lineTo(width, by); ctx.stroke();
    ctx.setLineDash([]);

    const px = width / SIGNAL_LENGTH;

    // Input waveform
    ctx.strokeStyle = isDark() ? 'rgba(180,178,169,.5)' : 'rgba(100,100,96,.45)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i < SIGNAL_LENGTH; i++) {
      const x = i * px, y = scaleY(raw[i]);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Output waveform
    ctx.strokeStyle = 'rgba(55,138,221,.85)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 0; i < SIGNAL_LENGTH; i++) {
      const x = i * px, y = scaleY(out[i]);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  function resizeCanvas(): void {
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = CANVAS_HEIGHT * dpr;
    ctx = canvas.getContext('2d');
    if (ctx) ctx.scale(dpr, dpr);
    draw();
  }

  $effect(() => {
    // Track reactive params so effect re-runs on change
    threshold; ratio; attack; release;
    untrack(() => draw());
  });

  $effect(() => {
    untrack(() => resizeCanvas());
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener('change', draw);
    window.addEventListener('resize', resizeCanvas);
    return () => {
      mq.removeEventListener('change', draw);
      window.removeEventListener('resize', resizeCanvas);
    };
  });
</script>

<div class="pt-1">
  <!-- Legend -->
  <div class="flex gap-4 text-xs mb-3" style="color: var(--color-text-secondary)">
    <span class="flex items-center gap-1.5">
      <span class="dot" style="background:#888780"></span> Input
    </span>
    <span class="flex items-center gap-1.5">
      <span class="dot" style="background:#378ADD"></span> Output (compressed)
    </span>
    <span class="flex items-center gap-1.5">
      <span class="dot" style="background:rgba(226,75,74,.25)"></span> Threshold zone
    </span>
  </div>

  <!-- Canvas -->
  <canvas
    bind:this={canvas}
    height={CANVAS_HEIGHT}
    class="block w-full rounded-lg"
    style="border: 0.5px solid var(--color-border-tertiary);"
    aria-label="Audio compression waveform visualization"
  ></canvas>

  <!-- Gain reduction meter -->
  <div class="flex items-center gap-2 text-xs mt-1.5" style="color: var(--color-text-secondary)">
    <span class="min-w-[82px]">Gain reduction</span>
    <div class="meter-bar flex-1">
      <div class="meter-fill" style="width: {gainReductionPct.toFixed(1)}%"></div>
    </div>
    <span class="min-w-[44px] text-right" style="color: var(--color-text-primary)">
      -{gainReductionDb.toFixed(1)} dB
    </span>
  </div>

  <!-- Controls -->
  <div class="mt-4 flex flex-col gap-2.5">
    <div class="ctrl">
      <label for="thresh" class="ctrl-label">Threshold</label>
      <input
        id="thresh"
        type="range"
        min="-40"
        max="0"
        step="1"
        bind:value={threshold}
        aria-label="Threshold in dB"
        class="flex-1"
      />
      <span class="ctrl-val">{threshold > 0 ? '+' : ''}{threshold} dB</span>
    </div>

    <div class="ctrl">
      <label for="ratio" class="ctrl-label">Ratio</label>
      <input
        id="ratio"
        type="range"
        min="1"
        max="20"
        step="0.5"
        bind:value={ratio}
        aria-label="Compression ratio"
        class="flex-1"
      />
      <span class="ctrl-val">{ratio} : 1</span>
    </div>

    <div class="ctrl">
      <label for="attack" class="ctrl-label">Attack</label>
      <input
        id="attack"
        type="range"
        min="1"
        max="100"
        step="1"
        bind:value={attack}
        aria-label="Attack time in milliseconds"
        class="flex-1"
      />
      <span class="ctrl-val">{attack} ms</span>
    </div>

    <div class="ctrl">
      <label for="release" class="ctrl-label">Release</label>
      <input
        id="release"
        type="range"
        min="20"
        max="500"
        step="10"
        bind:value={release}
        aria-label="Release time in milliseconds"
        class="flex-1"
      />
      <span class="ctrl-val">{release} ms</span>
    </div>
  </div>
</div>

<style>
  .dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    display: inline-block;
    flex-shrink: 0;
  }

  .ctrl {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 13px;
    color: var(--color-text-secondary);
  }

  .ctrl-label {
    min-width: 80px;
  }

  .ctrl-val {
    min-width: 64px;
    text-align: right;
    font-size: 13px;
    font-weight: 500;
    color: var(--color-text-primary);
  }

  .meter-bar {
    height: 6px;
    border-radius: 3px;
    background: var(--color-border-tertiary);
    overflow: hidden;
  }

  .meter-fill {
    height: 100%;
    border-radius: 3px;
    transition: width 0.08s;
    background: linear-gradient(90deg, #378ADD, #E24B4A);
  }

  input[type='range'] {
    -webkit-appearance: none;
    appearance: none;
    background: transparent;
    cursor: pointer;
  }

  input[type='range']::-webkit-slider-track {
    height: 4px;
    background: var(--color-border-tertiary);
    border-radius: 2px;
  }

  input[type='range']::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 14px;
    height: 14px;
    background: #378ADD;
    border-radius: 50%;
    margin-top: -5px;
    transition: transform 0.15s ease;
  }

  input[type='range']::-webkit-slider-thumb:hover {
    transform: scale(1.2);
  }

  input[type='range']::-moz-range-track {
    height: 4px;
    background: var(--color-border-tertiary);
    border-radius: 2px;
  }

  input[type='range']::-moz-range-thumb {
    width: 14px;
    height: 14px;
    background: #378ADD;
    border-radius: 50%;
    border: none;
  }
</style>
