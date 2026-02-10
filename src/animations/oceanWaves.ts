/**
 * Ocean Waves Visualization Utilities
 * 
 * Provides configuration and calculation functions for generative ocean wave rendering.
 * Uses Perlin noise for organic wave motion with multi-layer depth effects.
 */

// ============================================================================
// WAVE CALCULATION CONSTANTS
// ============================================================================

/** Reduction factor for z-axis noise influence (creates smoother layer transitions) */
const NOISE_Z_SCALE_FACTOR = 0.5;

/** Center offset for noise value mapping (centers wave oscillation around zero) */
const NOISE_CENTER_OFFSET = 0.5;

/** Multiplier to convert noise range to full amplitude range (-amplitude to +amplitude) */
const AMPLITUDE_RANGE_MULTIPLIER = 2;

// ============================================================================
// WAVE COLOR CONSTANTS
// ============================================================================

/** Base ocean color (foreground) - Dark blue-green */
const BASE_WAVE_COLOR = {
  r: 20,
  g: 60,
  b: 100,
} as const;

/** Distant wave color (background) - Lighter blue (atmospheric haze) */
const DISTANT_WAVE_COLOR = {
  r: 80,
  g: 120,
  b: 150,
} as const;

// ============================================================================
// FOAM COLOR CONSTANTS
// ============================================================================

/** Foam base color - Pure white */
const FOAM_BASE_COLOR = {
  r: 255,
  g: 255,
  b: 255,
} as const;

/** Base alpha value for foam (before intensity adjustment) */
const FOAM_BASE_ALPHA = 0.6;

/** Additional alpha based on foam intensity (0.6 to 1.0 range) */
const FOAM_INTENSITY_ALPHA_MULTIPLIER = 0.4;

/** Maximum alpha value (0-1) */
const MAX_ALPHA_VALUE = 1;

/** Conversion factor from 0-1 alpha to 0-255 range */
const ALPHA_TO_RGB_MULTIPLIER = 255;

// ============================================================================
// FOAM PARTICLE GENERATION CONSTANTS
// ============================================================================

/** Minimum number of foam particles per foam point */
const FOAM_MIN_PARTICLES = 3;

/** Additional particles based on foam intensity */
const FOAM_MAX_PARTICLES_MULTIPLIER = 5;

/** Maximum horizontal scatter for foam particles (pixels) */
const FOAM_HORIZONTAL_SPREAD = 12;

/** Maximum vertical scatter for foam particles (pixels) */
const FOAM_VERTICAL_SPREAD = 3;

/** Minimum particle size (pixels) */
const FOAM_MIN_SIZE = 1.5;

/** Additional size variation for particles (pixels) */
const FOAM_MAX_SIZE_VARIATION = 2;

/** How much particles fade at edges (0-1) */
const FOAM_DISSIPATION_FACTOR = 0.6;

/** Base alpha multiplier for foam particles */
const FOAM_PARTICLE_BASE_ALPHA = 0.5;

/** Additional alpha based on foam intensity */
const FOAM_PARTICLE_INTENSITY_ALPHA = 0.5;

// Noise parameters for foam particle distribution
/** Horizontal noise frequency for particle distribution */
const FOAM_NOISE_X_SCALE = 0.1;

/** Noise offset per particle for variation */
const FOAM_NOISE_PARTICLE_OFFSET = 0.5;

/** Time-based noise scaling for animation */
const FOAM_NOISE_TIME_SCALE = 0.01;

/** Layer-based noise offset for depth variation */
const FOAM_NOISE_LAYER_OFFSET = 0.3;

/** Vertical noise offset factor */
const FOAM_NOISE_Y_OFFSET = 0.7;

/** Size calculation noise offset */
const FOAM_NOISE_SIZE_OFFSET = 0.8;

/** Time scale for size variation animation */
const FOAM_NOISE_SIZE_TIME_SCALE = 0.005;

// ============================================================================

export interface OceanWaveConfig {
  /** Number of wave layers (back to front) */
  layers: number;
  /** Perlin noise frequency scale (lower = smoother waves) */
  noiseScale: number;
  /** Wave height amplitude in pixels */
  amplitude: number;
  /** Animation speed multiplier */
  waveSpeed: number;
  /** Wave height threshold for foam rendering (0-1) */
  foamThreshold: number;
  /** Depth perspective factor (0-1, higher = more dramatic) */
  perspective: number;
}

/**
 * Represents a single foam particle with position, size, and color properties
 */
export interface FoamParticle {
  /** Horizontal offset from wave point (pixels) */
  offsetX: number;
  /** Vertical offset from wave point (pixels) */
  offsetY: number;
  /** Particle size (diameter in pixels) */
  size: number;
  /** Red color component (0-255) */
  r: number;
  /** Green color component (0-255) */
  g: number;
  /** Blue color component (0-255) */
  b: number;
  /** Alpha transparency (0-255) */
  alpha: number;
}

/**
 * Default ocean wave configuration
 * Balanced for visual appeal with moderate wave motion
 */
export const DEFAULT_OCEAN_CONFIG: OceanWaveConfig = {
  layers: 12,
  noiseScale: 0.003,
  amplitude: 80,
  waveSpeed: 0.008,
  foamThreshold: 0.7,
  perspective: 0.06,
};

/**
 * Calculates the y-coordinate for a wave point using Perlin noise
 * 
 * @param x - Horizontal position along wave
 * @param z - Depth position (layer index)
 * @param time - Current animation time
 * @param config - Wave configuration parameters
 * @param noiseFunc - Perlin noise function (p5.noise)
 * @returns Y-coordinate for wave height at this position
 */
export function calculateWavePoint(
  x: number,
  z: number,
  time: number,
  config: OceanWaveConfig,
  noiseFunc: (x: number, y: number, z: number) => number
): number {
  const { noiseScale, amplitude, waveSpeed, perspective } = config;
  
  // Apply depth-based amplitude scaling (distant waves are smaller)
  // Clamp to non-negative to prevent inversion for large z values
  const depthScale = Math.max(0, 1 - (z * perspective));
  const scaledAmplitude = amplitude * depthScale;
  
  // Calculate noise-based wave height
  const noiseValue = noiseFunc(
    x * noiseScale,
    z * noiseScale * NOISE_Z_SCALE_FACTOR, // Reduced z influence for smoother layers
    time * waveSpeed
  );
  
  // Map noise (0-1) to wave height (-amplitude to +amplitude)
  const waveHeight = (noiseValue - NOISE_CENTER_OFFSET) * AMPLITUDE_RANGE_MULTIPLIER * scaledAmplitude;
  
  return waveHeight;
}

/**
 * Determines if foam should be rendered based on wave height
 * Foam appears on wave crests above the threshold
 * 
 * @param waveHeight - Current wave height (-amplitude to +amplitude)
 * @param amplitude - Maximum wave amplitude
 * @param threshold - Foam threshold (0-1, where 1 = only highest peaks)
 * @returns True if foam should be rendered at this point
 */
export function shouldRenderFoam(
  waveHeight: number,
  amplitude: number,
  threshold: number
): boolean {
  // Guard against zero or negative amplitude to prevent division by zero
  if (amplitude <= 0) {
    return false;
  }
  
  // Normalize wave height to 0-1 range
  const normalizedHeight = (waveHeight + amplitude) / (AMPLITUDE_RANGE_MULTIPLIER * amplitude);
  
  // Foam appears when normalized height exceeds threshold
  return normalizedHeight >= threshold;
}

/**
 * Generates color values for wave layer based on depth
 * Distant waves are lighter (atmospheric perspective)
 * 
 * @param layerIndex - Current layer index (0 = farthest)
 * @param totalLayers - Total number of layers
 * @returns RGB color object with values 0-255
 */
export function getWaveLayerColor(
  layerIndex: number,
  totalLayers: number
): { r: number; g: number; b: number } {
  // Interpolate based on layer depth
  // Handle single layer case to avoid division by zero
  const t = totalLayers > 1 ? layerIndex / (totalLayers - 1) : 0;
  
  return {
    r: Math.round(DISTANT_WAVE_COLOR.r + (BASE_WAVE_COLOR.r - DISTANT_WAVE_COLOR.r) * t),
    g: Math.round(DISTANT_WAVE_COLOR.g + (BASE_WAVE_COLOR.g - DISTANT_WAVE_COLOR.g) * t),
    b: Math.round(DISTANT_WAVE_COLOR.b + (BASE_WAVE_COLOR.b - DISTANT_WAVE_COLOR.b) * t),
  };
}

/**
 * Generates foam color with optional alpha for transparency
 * 
 * @param intensity - Foam intensity (0-1)
 * @returns RGB color object with alpha channel
 */
export function getFoamColor(intensity: number): { r: number; g: number; b: number; a: number } {
  // Clamp intensity to [0, 1] range for defensive correctness
  const clampedIntensity = Math.max(0, Math.min(1, intensity));
  
  // White foam with varying opacity
  const alpha = FOAM_BASE_ALPHA + (clampedIntensity * FOAM_INTENSITY_ALPHA_MULTIPLIER);
  
  return {
    r: FOAM_BASE_COLOR.r,
    g: FOAM_BASE_COLOR.g,
    b: FOAM_BASE_COLOR.b,
    a: Math.min(alpha, MAX_ALPHA_VALUE) * ALPHA_TO_RGB_MULTIPLIER,
  };
}

/**
 * Generates an array of foam particles for a given wave point
 * Uses Perlin noise for natural, organic particle distribution
 * 
 * @param x - Horizontal position along wave
 * @param layer - Layer index (depth)
 * @param time - Current animation time
 * @param foamIntensity - Foam intensity at this point (0-1)
 * @param noiseFunc - Perlin noise function
 * @returns Array of foam particles with position, size, and color properties
 */
export function generateFoamParticles(
  x: number,
  layer: number,
  time: number,
  foamIntensity: number,
  noiseFunc: (x: number, y: number, z: number) => number
): FoamParticle[] {
  const particles: FoamParticle[] = [];
  
  // Calculate number of particles based on intensity
  const particleCount = Math.floor(
    FOAM_MIN_PARTICLES + foamIntensity * FOAM_MAX_PARTICLES_MULTIPLIER
  );
  
  // Get base foam color
  const foamColor = getFoamColor(foamIntensity);
  
  // Generate each particle
  for (let particle = 0; particle < particleCount; particle++) {
    // Use noise for natural particle distribution (horizontal)
    const noiseVal = noiseFunc(
      x * FOAM_NOISE_X_SCALE + particle * FOAM_NOISE_PARTICLE_OFFSET,
      time * FOAM_NOISE_TIME_SCALE + particle,
      layer + particle * FOAM_NOISE_LAYER_OFFSET
    );
    
    // Scatter particles around the wave crest (horizontal)
    const offsetX = (noiseVal - 0.5) * FOAM_HORIZONTAL_SPREAD;
    
    // Keep particles very close to the wave edge (minimal vertical offset)
    const offsetY =
      (noiseFunc(
        x * FOAM_NOISE_X_SCALE + particle * FOAM_NOISE_Y_OFFSET,
        time * FOAM_NOISE_TIME_SCALE,
        layer * FOAM_NOISE_LAYER_OFFSET + particle
      ) - 0.5) * FOAM_VERTICAL_SPREAD;
    
    // Vary particle size (small particles)
    const size =
      FOAM_MIN_SIZE +
      noiseFunc(
        particle * FOAM_NOISE_SIZE_OFFSET,
        time * FOAM_NOISE_SIZE_TIME_SCALE,
        layer * FOAM_NOISE_LAYER_OFFSET
      ) * FOAM_MAX_SIZE_VARIATION;
    
    // Create dissipation effect - particles further from center fade more
    const distanceFromCenter = Math.abs(offsetX) / FOAM_HORIZONTAL_SPREAD;
    const dissipation = 1 - distanceFromCenter * FOAM_DISSIPATION_FACTOR;
    
    // Apply dissipation to opacity
    const particleAlpha =
      foamColor.a *
      dissipation *
      (FOAM_PARTICLE_BASE_ALPHA + foamIntensity * FOAM_PARTICLE_INTENSITY_ALPHA);
    
    particles.push({
      offsetX,
      offsetY,
      size,
      r: foamColor.r,
      g: foamColor.g,
      b: foamColor.b,
      alpha: particleAlpha,
    });
  }
  
  return particles;
}
