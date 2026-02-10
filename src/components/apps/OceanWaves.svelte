<script lang="ts">
  import { onMount } from "svelte";
  import type p5 from "p5";
  import {
    DEFAULT_OCEAN_CONFIG,
    calculateWavePoint,
    shouldRenderFoam,
    getWaveLayerColor,
    getFoamColor,
    type OceanWaveConfig,
  } from "../../animations/oceanWaves";

  interface Props {
    width?: number;
    height?: number;
    audioUrl?: string;
  }

  let { width = 800, height = 600, audioUrl = undefined }: Props = $props();

  // ============================================================================
  // RENDERING CONSTANTS
  // ============================================================================

  // Sky gradient colors
  const SKY_TOP_COLOR = { r: 15, g: 20, b: 40 }; // Dark blue at top
  const SKY_HORIZON_COLOR = { r: 60, g: 100, b: 140 }; // Lighter blue at horizon

  // Wave layer positioning
  const LAYER_DEPTH_START = -200; // Starting z position for farthest layer
  const LAYER_DEPTH_SPACING = 100; // Z-distance between layers
  const LAYER_VERTICAL_OFFSET = 100; // Base vertical offset from center
  const VERTICAL_LAYER_SPACING = 80; // Vertical spacing between wave layers

  // Wave rendering quality
  const WAVE_RESOLUTION = 120; // Number of points per wave (higher = smoother)
  const WAVE_POINT_MULTIPLIER = 10; // Multiplier for wave calculation granularity
  const WAVE_BOTTOM_MULTIPLIER = 2; // Multiplier for wave baseline depth

  // Animation timing
  const TIME_INCREMENT_MULTIPLIER = 100; // Scales waveSpeed to time increment

  // Foam particle configuration
  const FOAM_MIN_PARTICLES = 3; // Minimum particles per foam point
  const FOAM_MAX_PARTICLES_MULTIPLIER = 5; // Additional particles based on intensity
  const FOAM_HORIZONTAL_SPREAD = 12; // Maximum horizontal scatter (pixels)
  const FOAM_VERTICAL_SPREAD = 3; // Maximum vertical scatter (pixels)
  const FOAM_MIN_SIZE = 1.5; // Minimum particle size (pixels)
  const FOAM_MAX_SIZE_VARIATION = 2; // Additional size variation (pixels)
  const FOAM_DISSIPATION_FACTOR = 0.6; // How much particles fade at edges (0-1)
  const FOAM_BASE_ALPHA = 0.5; // Base alpha multiplier for foam particles
  const FOAM_INTENSITY_ALPHA = 0.5; // Additional alpha based on intensity

  // Noise parameters for foam particle distribution
  const FOAM_NOISE_X_SCALE = 0.1; // Horizontal noise frequency
  const FOAM_NOISE_PARTICLE_OFFSET = 0.5; // Noise offset per particle
  const FOAM_NOISE_TIME_SCALE = 0.01; // Time-based noise scaling
  const FOAM_NOISE_LAYER_OFFSET = 0.3; // Layer-based noise offset
  const FOAM_NOISE_Y_OFFSET = 0.7; // Vertical noise offset factor
  const FOAM_NOISE_SIZE_OFFSET = 0.8; // Size calculation noise offset
  const FOAM_NOISE_SIZE_TIME_SCALE = 0.005; // Time scale for size variation

  // ============================================================================

  let canvasContainer = $state<HTMLDivElement>();
  let p5Instance = $state<p5 | null>(null);
  let isPlaying = $state(true);
  let time = $state(0);
  let audioIsPlaying = $state(false);
  let audioLoaded = $state(false);

  // Web Audio API variables
  let audioContext: AudioContext | null = null;
  let analyser: AnalyserNode | null = null;
  let audioElement: HTMLAudioElement | null = null;
  let audioSource: MediaElementAudioSourceNode | null = null;
  let dataArray: Uint8Array | null = null;

  // Frequency band energy levels (0-255)
  let lowEnergy = $state(0);
  let midEnergy = $state(0);
  let highEnergy = $state(0);

  // FFT frequency band ranges (in Hz)
  const FFT_SIZE = 2048;
  const SAMPLE_RATE = 44100;
  const LOW_FREQ_MIN = 20;
  const LOW_FREQ_MAX = 250; // Bass frequencies
  const MID_FREQ_MIN = 250;
  const MID_FREQ_MAX = 4000; // Mid frequencies
  const HIGH_FREQ_MIN = 4000;
  const HIGH_FREQ_MAX = 20000; // High frequencies

  // Audio reactivity parameters
  const AMPLITUDE_SCALE_FACTOR = 0.002; // How much energy affects amplitude

  // Wave configuration with reactive state
  let waveConfig = $state<OceanWaveConfig>({ ...DEFAULT_OCEAN_CONFIG });

  // Animation controls
  function toggleAnimation() {
    isPlaying = !isPlaying;
  }

  // Audio controls
  async function toggleAudio() {
    if (!audioElement || !audioLoaded) return;

    // Initialize AudioContext on first user interaction
    if (!audioContext) {
      audioContext = new AudioContext();
      analyser = audioContext.createAnalyser();
      analyser.fftSize = FFT_SIZE;
      analyser.smoothingTimeConstant = 0.8;

      // Create source from audio element
      audioSource = audioContext.createMediaElementSource(audioElement);
      audioSource.connect(analyser);
      analyser.connect(audioContext.destination);

      // Create data array for frequency analysis
      dataArray = new Uint8Array(analyser.frequencyBinCount);
    }

    if (audioIsPlaying) {
      audioElement.pause();
      audioIsPlaying = false;
    } else {
      await audioElement.play();
      audioIsPlaying = true;
    }
  }

  // Calculate average energy in a frequency range
  function getEnergyInRange(minFreq: number, maxFreq: number): number {
    if (!analyser || !dataArray) return 0;

    // Get frequency data
    analyser.getByteFrequencyData(dataArray);

    // Convert frequency to bin index
    const binSize = SAMPLE_RATE / FFT_SIZE;
    const minBin = Math.floor(minFreq / binSize);
    const maxBin = Math.floor(maxFreq / binSize);

    // Calculate average energy in range
    let sum = 0;
    let count = 0;
    for (let i = minBin; i <= maxBin && i < dataArray.length; i++) {
      sum += dataArray[i];
      count++;
    }

    return count > 0 ? sum / count : 0;
  }

  onMount(async () => {
    if (!canvasContainer) return;

    // Create audio element if URL provided
    if (audioUrl) {
      audioElement = new Audio(audioUrl);
      audioElement.loop = true;
      audioElement.volume = 0.5;
      audioElement.crossOrigin = "anonymous";

      audioElement.addEventListener("canplaythrough", () => {
        audioLoaded = true;
        console.log("Audio loaded successfully");
      });

      audioElement.addEventListener("error", (e) => {
        console.error("Error loading audio:", e);
      });
    }

    // Dynamically import P5.js only on client side
    const p5Module = await import("p5");
    const p5 = p5Module.default;

    // P5.js sketch in instance mode
    const sketch = (p: p5) => {
      let canvasWidth: number;
      let canvasHeight: number;

      p.setup = () => {
        // Use container dimensions if available
        canvasWidth = canvasContainer?.clientWidth || width;
        canvasHeight = canvasContainer?.clientHeight || height;

        p.createCanvas(canvasWidth, canvasHeight, p.WEBGL);
        p.noStroke();
      };

      p.draw = () => {
        // Clear with sky gradient
        drawSkyGradient(p, canvasWidth, canvasHeight);

        // Analyze audio spectrum if audio is playing
        if (audioIsPlaying && analyser) {
          // Get energy levels for different frequency bands
          lowEnergy = getEnergyInRange(LOW_FREQ_MIN, LOW_FREQ_MAX);
          midEnergy = getEnergyInRange(MID_FREQ_MIN, MID_FREQ_MAX);
          highEnergy = getEnergyInRange(HIGH_FREQ_MIN, HIGH_FREQ_MAX);
        }

        // Increment time for animation
        if (isPlaying) {
          time += waveConfig.waveSpeed * TIME_INCREMENT_MULTIPLIER;
        }

        // Draw wave layers from back to front
        drawWaveLayers(p, canvasWidth, canvasHeight);
      };

      // Handle window resize
      p.windowResized = () => {
        if (canvasContainer) {
          canvasWidth = canvasContainer.clientWidth;
          canvasHeight = canvasContainer.clientHeight;
          p.resizeCanvas(canvasWidth, canvasHeight);
        }
      };
    };

    // Initialize P5 instance
    p5Instance = new p5(sketch, canvasContainer);

    // Cleanup on unmount
    return () => {
      if (p5Instance) {
        p5Instance.remove();
        p5Instance = null;
      }

      // Cleanup audio
      if (audioElement) {
        audioElement.pause();
        audioElement = null;
      }

      if (audioContext) {
        audioContext.close();
        audioContext = null;
      }
    };
  });

  /**
   * Draw sky gradient background
   */
  function drawSkyGradient(p: p5, w: number, h: number) {
    // Draw gradient from dark blue (top) to lighter blue (horizon)
    p.push();
    p.translate(-w / 2, -h / 2);

    for (let y = 0; y < h; y++) {
      const inter = y / h;
      const c1 = p.color(SKY_TOP_COLOR.r, SKY_TOP_COLOR.g, SKY_TOP_COLOR.b);
      const c2 = p.color(
        SKY_HORIZON_COLOR.r,
        SKY_HORIZON_COLOR.g,
        SKY_HORIZON_COLOR.b,
      );
      const c = p.lerpColor(c1, c2, inter);
      p.fill(c);
      p.noStroke();
      p.rect(0, y, w, 1);
    }

    p.pop();
  }

  /**
   * Draw all wave layers with perspective and audio reactivity
   */
  function drawWaveLayers(p: p5, w: number, h: number) {
    const { layers, amplitude } = waveConfig;

    for (let layer = 0; layer < layers; layer++) {
      // Calculate audio-reactive amplitude for this layer
      let layerAmplitude = amplitude;

      if (audioIsPlaying && analyser) {
        // Map layers to frequency bands:
        // Layer 0-1 (foreground): Low frequencies (bass)
        // Layer 2-3 (middle): Mid frequencies
        // Layer 4+ (background): High frequencies
        let energyBoost = 0;

        if (layer <= 1) {
          // Foreground layers react to bass
          energyBoost = lowEnergy * AMPLITUDE_SCALE_FACTOR;
        } else if (layer <= 3) {
          // Middle layers react to mids
          energyBoost = midEnergy * AMPLITUDE_SCALE_FACTOR;
        } else {
          // Background layers react to highs
          energyBoost = highEnergy * AMPLITUDE_SCALE_FACTOR;
        }

        layerAmplitude = amplitude + energyBoost;
      }

      // Calculate z position (depth)
      const zPos = LAYER_DEPTH_START + layer * LAYER_DEPTH_SPACING;
      const yOffset =
        h / 2 -
        LAYER_VERTICAL_OFFSET +
        (layer * VERTICAL_LAYER_SPACING) / layers;

      // Get color for this layer
      const layerColor = getWaveLayerColor(layer, layers);

      // Draw wave strip with smooth curves
      p.push();
      p.translate(0, yOffset - h / 2, zPos);

      // Draw main wave surface using many vertices for smoothness
      p.fill(layerColor.r, layerColor.g, layerColor.b);
      p.noStroke();
      p.beginShape();

      // Create config with audio-reactive amplitude for this layer
      const layerConfig = { ...waveConfig, amplitude: layerAmplitude };

      // Draw top wave curve
      for (let i = 0; i <= WAVE_RESOLUTION; i++) {
        const x = (i / WAVE_RESOLUTION) * w - w / 2;

        // Calculate wave height at this point with audio-reactive amplitude
        const y = calculateWavePoint(
          i * WAVE_POINT_MULTIPLIER,
          layer,
          time,
          layerConfig,
          (x, y, z) => p.noise(x, y, z),
        );

        p.vertex(x, y, 0);
      }

      // Close the shape by connecting to baseline in reverse order
      for (let i = WAVE_RESOLUTION; i >= 0; i--) {
        const x = (i / WAVE_RESOLUTION) * w - w / 2;
        p.vertex(x, layerAmplitude * WAVE_BOTTOM_MULTIPLIER, 0);
      }

      p.endShape(p.CLOSE);
      p.pop();

      // Draw foam on wave crests with audio-reactive amplitude
      drawFoam(p, w, layer, yOffset - h / 2, zPos, layerConfig);
    }
  }

  /**
   * Draw foam on wave crests
   */
  function drawFoam(
    p: p5,
    w: number,
    layer: number,
    yOffset: number,
    zPos: number,
    layerConfig: OceanWaveConfig = waveConfig,
  ) {
    const { amplitude, foamThreshold } = layerConfig;

    p.push();
    p.translate(0, yOffset, zPos);

    for (let i = 0; i <= WAVE_RESOLUTION; i++) {
      const x = (i / WAVE_RESOLUTION) * w - w / 2;

      const waveHeight = calculateWavePoint(
        i * WAVE_POINT_MULTIPLIER,
        layer,
        time,
        layerConfig,
        (x, y, z) => p.noise(x, y, z),
      );

      // Check if foam should render at this point
      if (shouldRenderFoam(waveHeight, amplitude, foamThreshold)) {
        // Calculate foam intensity based on how far above threshold
        const normalizedHeight = (waveHeight + amplitude) / (2 * amplitude);
        const foamIntensity =
          (normalizedHeight - foamThreshold) / (1 - foamThreshold);

        const foamColor = getFoamColor(foamIntensity);

        // Draw multiple small foam particles instead of one large blob
        const particleCount = Math.floor(
          FOAM_MIN_PARTICLES + foamIntensity * FOAM_MAX_PARTICLES_MULTIPLIER,
        );

        for (let particle = 0; particle < particleCount; particle++) {
          // Use noise for natural particle distribution
          const noiseVal = p.noise(
            x * FOAM_NOISE_X_SCALE + particle * FOAM_NOISE_PARTICLE_OFFSET,
            time * FOAM_NOISE_TIME_SCALE + particle,
            layer + particle * FOAM_NOISE_LAYER_OFFSET,
          );

          // Scatter particles around the wave crest (horizontal)
          const offsetX = (noiseVal - 0.5) * FOAM_HORIZONTAL_SPREAD;
          // Keep particles very close to the wave edge (minimal vertical offset)
          const offsetY =
            (p.noise(
              x * FOAM_NOISE_X_SCALE + particle * FOAM_NOISE_Y_OFFSET,
              time * FOAM_NOISE_TIME_SCALE,
            ) -
              0.5) *
            FOAM_VERTICAL_SPREAD;

          // Vary particle size (small particles)
          const particleSize =
            FOAM_MIN_SIZE +
            p.noise(
              particle * FOAM_NOISE_SIZE_OFFSET,
              time * FOAM_NOISE_SIZE_TIME_SCALE,
            ) *
              FOAM_MAX_SIZE_VARIATION;

          // Create dissipation effect - particles further from center fade more
          const distanceFromCenter = Math.abs(offsetX) / FOAM_HORIZONTAL_SPREAD;
          const dissipation = 1 - distanceFromCenter * FOAM_DISSIPATION_FACTOR;

          // Apply dissipation to opacity
          const particleAlpha =
            foamColor.a *
            dissipation *
            (FOAM_BASE_ALPHA + foamIntensity * FOAM_INTENSITY_ALPHA);

          p.fill(foamColor.r, foamColor.g, foamColor.b, particleAlpha);
          p.noStroke();

          // Draw small particle
          p.ellipse(
            x + offsetX,
            waveHeight + offsetY,
            particleSize,
            particleSize,
          );
        }
      }
    }

    p.pop();
  }
</script>

<div class="ocean-waves-container">
  <div
    bind:this={canvasContainer}
    class="canvas-wrapper"
    style="width: 100%; height: {height}px;"
  ></div>

  <div class="controls">
    <button
      onclick={toggleAnimation}
      class="control-button"
      aria-label={isPlaying ? "Pause animation" : "Play animation"}
    >
      {isPlaying ? "⏸︎" : "▶︎"}
      <span class="control-text">{isPlaying ? "Pause" : "Play"}</span>
    </button>

    {#if audioUrl}
      <button
        onclick={toggleAudio}
        class="control-button"
        aria-label={audioIsPlaying ? "Pause audio" : "Play audio"}
        disabled={!audioLoaded}
      >
        {audioIsPlaying ? "🔊" : "🔇"}
        <span class="control-text">{audioIsPlaying ? "Audio" : "Audio"}</span>
      </button>
    {/if}
  </div>
</div>

<style>
  .ocean-waves-container {
    position: relative;
    width: 100%;
    background: linear-gradient(
      180deg,
      rgb(15, 20, 40) 0%,
      rgb(20, 40, 70) 100%
    );
    border-radius: 0.5rem;
    overflow: hidden;
  }

  .canvas-wrapper {
    display: block;
  }

  .controls {
    position: absolute;
    bottom: 1rem;
    right: 1rem;
    display: flex;
    gap: 0.5rem;
  }

  .control-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: rgba(0, 0, 0, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 0.375rem;
    color: white;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s ease;
    backdrop-filter: blur(4px);
  }

  .control-button:hover {
    background: rgba(0, 0, 0, 0.8);
    border-color: rgba(255, 255, 255, 0.4);
    transform: translateY(-1px);
  }

  .control-button:active {
    transform: translateY(0);
  }

  .control-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .control-button:disabled:hover {
    background: rgba(0, 0, 0, 0.6);
    transform: none;
  }

  .control-text {
    font-size: 0.875rem;
    font-weight: 500;
  }

  @media (max-width: 640px) {
    .control-text {
      display: none;
    }

    .control-button {
      padding: 0.5rem;
      font-size: 1.25rem;
    }
  }
</style>
