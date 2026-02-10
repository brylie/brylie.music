<script lang="ts">
  import { onMount } from "svelte";
  import type p5 from "p5";
  import {
    DEFAULT_OCEAN_CONFIG,
    calculateWavePoint,
    shouldRenderFoam,
    getWaveLayerColor,
    generateFoamParticles,
    type OceanWaveConfig,
    type FoamParticle,
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

  // Wave layer positioning (proportional to canvas size)
  const LAYER_DEPTH_START = -200; // Starting z position for farthest layer
  const LAYER_DEPTH_SPACING = 100; // Z-distance between layers
  const VIEWER_ALTITUDE = 0.55; // Horizon altitude (0 = top of canvas, 1 = bottom, 0.55 = middle)
  const WAVE_EXTENT = 0.4; // Vertical span of wave layers (proportion of height)

  // Wave rendering quality
  const WAVE_RESOLUTION = 120; // Number of points per wave (higher = smoother)
  const WAVE_POINT_MULTIPLIER = 10; // Multiplier for wave calculation granularity
  const WAVE_BOTTOM_MULTIPLIER = 2; // Multiplier for wave baseline depth

  // Animation timing
  const TIME_INCREMENT_MULTIPLIER = 100; // Scales waveSpeed to time increment

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
  let sampleRate = 44100; // Default, will be updated from AudioContext
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
      sampleRate = audioContext.sampleRate; // Use actual sample rate (44100 or 48000)
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
      try {
        await audioElement.play();
        audioIsPlaying = true;
      } catch (error) {
        // Handle autoplay rejection (browser policy) or other playback errors
        console.error("Audio playback failed:", error);
        audioIsPlaying = false;
      }
    }
  }

  // Calculate average energy in a frequency range from already-populated dataArray
  function computeEnergyInRange(minFreq: number, maxFreq: number): number {
    if (!dataArray || !audioContext) return 0;

    // Convert frequency to bin index using actual sample rate
    const binSize = sampleRate / FFT_SIZE;
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
      audioElement = new Audio();
      audioElement.crossOrigin = "anonymous"; // Set CORS before src to prevent preflight issues
      audioElement.src = audioUrl; // Set source after CORS mode
      audioElement.loop = true;
      audioElement.volume = 0.5;

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
      let skyGradientBuffer: any; // p5.Graphics buffer for sky gradient

      p.setup = () => {
        // Use container dimensions if available
        canvasWidth = canvasContainer?.clientWidth || width;
        canvasHeight = canvasContainer?.clientHeight || height;

        p.createCanvas(canvasWidth, canvasHeight, p.WEBGL);
        p.noStroke();

        // Create sky gradient buffer once
        createSkyGradient(p, canvasWidth, canvasHeight);
      };

      // Create sky gradient as off-screen buffer (called once and on resize)
      function createSkyGradient(p: p5, w: number, h: number) {
        // Clean up existing buffer to prevent memory leaks
        if (skyGradientBuffer) {
          skyGradientBuffer.remove();
          skyGradientBuffer = null;
        }
        skyGradientBuffer = p.createGraphics(w, h);

        // Create colors once outside the loop
        const c1 = skyGradientBuffer.color(
          SKY_TOP_COLOR.r,
          SKY_TOP_COLOR.g,
          SKY_TOP_COLOR.b,
        );
        const c2 = skyGradientBuffer.color(
          SKY_HORIZON_COLOR.r,
          SKY_HORIZON_COLOR.g,
          SKY_HORIZON_COLOR.b,
        );

        // Draw gradient to buffer
        for (let y = 0; y < h; y++) {
          const inter = y / h;
          const c = skyGradientBuffer.lerpColor(c1, c2, inter);
          skyGradientBuffer.fill(c);
          skyGradientBuffer.noStroke();
          skyGradientBuffer.rect(0, y, w, 1);
        }
      }

      p.draw = () => {
        // Clear with sky gradient (blit pre-rendered buffer)
        drawSkyGradient(p, skyGradientBuffer, canvasWidth, canvasHeight);

        // Analyze audio spectrum if audio is playing
        if (audioIsPlaying && analyser && dataArray) {
          // Read frequency data once per frame
          analyser.getByteFrequencyData(dataArray);

          // Calculate energy levels for different frequency bands
          lowEnergy = computeEnergyInRange(LOW_FREQ_MIN, LOW_FREQ_MAX);
          midEnergy = computeEnergyInRange(MID_FREQ_MIN, MID_FREQ_MAX);
          highEnergy = computeEnergyInRange(HIGH_FREQ_MIN, HIGH_FREQ_MAX);
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

          // Recreate sky gradient for new dimensions
          createSkyGradient(p, canvasWidth, canvasHeight);
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
   * Draw sky gradient background (blit pre-rendered buffer)
   */
  function drawSkyGradient(p: p5, buffer: any, w: number, h: number) {
    if (!buffer) return;

    // Blit pre-rendered gradient buffer
    p.push();
    p.translate(-w / 2, -h / 2);
    p.image(buffer, 0, 0);
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

      // Position waves based on viewer altitude
      // VIEWER_ALTITUDE controls horizon line position (0=top, 1=bottom)
      // Farthest layer at horizon, nearest layer extends downward by WAVE_EXTENT
      const yOffset = h * VIEWER_ALTITUDE + (layer * h * WAVE_EXTENT) / layers;

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
          (nx, ny, nz) => p.noise(nx, ny, nz),
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
        (nx, ny, nz) => p.noise(nx, ny, nz),
      );

      // Check if foam should render at this point
      if (shouldRenderFoam(waveHeight, amplitude, foamThreshold)) {
        // Calculate foam intensity based on how far above threshold
        const normalizedHeight = (waveHeight + amplitude) / (2 * amplitude);

        // Guard against division by zero when foamThreshold >= 1
        let foamIntensity: number;
        if (foamThreshold >= 1) {
          foamIntensity = 1;
        } else {
          foamIntensity =
            (normalizedHeight - foamThreshold) /
            Math.max(1 - foamThreshold, Number.EPSILON);
        }

        // Clamp to [0, 1] range to prevent NaN/Infinity propagation
        foamIntensity = Math.max(0, Math.min(1, foamIntensity));

        // Generate foam particles using utility function
        const particles = generateFoamParticles(
          x,
          layer,
          time,
          foamIntensity,
          (nx, ny, nz) => p.noise(nx, ny, nz),
        );

        // Render each foam particle
        for (const particle of particles) {
          p.fill(particle.r, particle.g, particle.b, particle.alpha);
          p.noStroke();

          // Draw small particle
          p.ellipse(
            x + particle.offsetX,
            waveHeight + particle.offsetY,
            particle.size,
            particle.size,
          );
        }
      }
    }

    p.pop();
  }
</script>

<div
  class="relative w-full rounded-lg overflow-hidden"
  style="background: linear-gradient(180deg, rgb(15, 20, 40) 0%, rgb(20, 40, 70) 100%);"
>
  <div
    bind:this={canvasContainer}
    class="block"
    style="width: 100%; height: {height}px;"
  ></div>

  <div class="absolute bottom-4 right-4 flex gap-2">
    <button
      onclick={toggleAnimation}
      class="flex items-center gap-2 px-4 py-2 bg-black/60 border border-white/20 rounded-md text-white text-base cursor-pointer transition-all duration-200 backdrop-blur hover:bg-black/80 hover:border-white/40 hover:-translate-y-px active:translate-y-0 sm:px-2 sm:text-xl"
      aria-label={isPlaying ? "Pause animation" : "Play animation"}
    >
      <span aria-hidden="true">{isPlaying ? "⏸︎" : "▶︎"}</span>
      <span class="text-sm font-medium max-sm:sr-only"
        >{isPlaying ? "Pause" : "Play"}</span
      >
    </button>

    {#if audioUrl}
      <button
        onclick={toggleAudio}
        class="flex items-center gap-2 px-4 py-2 bg-black/60 border border-white/20 rounded-md text-white text-base cursor-pointer transition-all duration-200 backdrop-blur hover:bg-black/80 hover:border-white/40 hover:-translate-y-px active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-black/60 disabled:hover:translate-y-0 sm:px-2 sm:text-xl"
        aria-label={audioIsPlaying ? "Pause audio" : "Play audio"}
        disabled={!audioLoaded}
      >
        <span aria-hidden="true">{audioIsPlaying ? "🔊" : "🔇"}</span>
        <span class="text-sm font-medium max-sm:sr-only"
          >{audioIsPlaying ? "Audio" : "Audio"}</span
        >
      </button>
    {/if}
  </div>
</div>
