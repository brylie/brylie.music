import { describe, test, expect } from 'vitest';
import {
  DEFAULT_OCEAN_CONFIG,
  calculateWavePoint,
  shouldRenderFoam,
  getWaveLayerColor,
  getFoamColor,
  generateFoamParticles,
  type OceanWaveConfig,
  type FoamParticle,
} from './oceanWaves';

describe('DEFAULT_OCEAN_CONFIG', () => {
  test('has expected structure and values', () => {
    expect(DEFAULT_OCEAN_CONFIG).toEqual({
      layers: 5,
      noiseScale: 0.003,
      amplitude: 50,
      waveSpeed: 0.008,
      foamThreshold: 0.7,
      perspective: 0.6,
    });
  });
  
  test('all values are positive', () => {
    expect(DEFAULT_OCEAN_CONFIG.layers).toBeGreaterThan(0);
    expect(DEFAULT_OCEAN_CONFIG.noiseScale).toBeGreaterThan(0);
    expect(DEFAULT_OCEAN_CONFIG.amplitude).toBeGreaterThan(0);
    expect(DEFAULT_OCEAN_CONFIG.waveSpeed).toBeGreaterThan(0);
  });
  
  test('threshold and perspective are in valid range', () => {
    expect(DEFAULT_OCEAN_CONFIG.foamThreshold).toBeGreaterThanOrEqual(0);
    expect(DEFAULT_OCEAN_CONFIG.foamThreshold).toBeLessThanOrEqual(1);
    expect(DEFAULT_OCEAN_CONFIG.perspective).toBeGreaterThanOrEqual(0);
    expect(DEFAULT_OCEAN_CONFIG.perspective).toBeLessThanOrEqual(1);
  });
});

describe('calculateWavePoint', () => {
  // Mock Perlin noise function that returns predictable values
  const mockNoise = (x: number, _y: number, _z: number): number => {
    // Simple deterministic function for testing
    return (Math.sin(x * 10) + 1) / 2; // Returns 0-1
  };
  
  test('returns numeric value', () => {
    const result = calculateWavePoint(0, 0, 0, DEFAULT_OCEAN_CONFIG, mockNoise);
    expect(typeof result).toBe('number');
    expect(isNaN(result)).toBe(false);
  });
  
  test('wave height scales with amplitude', () => {
    const smallAmplitude: OceanWaveConfig = {
      ...DEFAULT_OCEAN_CONFIG,
      amplitude: 10,
    };
    const largeAmplitude: OceanWaveConfig = {
      ...DEFAULT_OCEAN_CONFIG,
      amplitude: 100,
    };
    
    const small = calculateWavePoint(1, 0, 0, smallAmplitude, mockNoise);
    const large = calculateWavePoint(1, 0, 0, largeAmplitude, mockNoise);
    
    expect(Math.abs(large)).toBeGreaterThan(Math.abs(small));
  });
  
  test('depth affects wave height due to perspective', () => {
    // Use constant noise to isolate perspective effect
    const constantNoise = (): number => 0.75; // Returns constant value
    
    // Use same x and time but different z (depth) to isolate perspective effect
    const xPos = 5;
    const nearWave = calculateWavePoint(xPos, 0, 0, DEFAULT_OCEAN_CONFIG, constantNoise);
    const farWave = calculateWavePoint(xPos, 1, 0, DEFAULT_OCEAN_CONFIG, constantNoise);
    
    // Farther waves should have smaller amplitude due to perspective
    expect(Math.abs(farWave)).toBeLessThan(Math.abs(nearWave));
  });
  
  test('time parameter affects output', () => {
    // Time-dependent noise function that uses z parameter
    const timeDependentNoise = (x: number, _y: number, z: number): number => {
      return (Math.sin(x * 10 + z * 0.1) + 1) / 2; // z affects the output
    };
    
    const time1 = calculateWavePoint(1, 0, 0, DEFAULT_OCEAN_CONFIG, timeDependentNoise);
    const time2 = calculateWavePoint(1, 0, 100, DEFAULT_OCEAN_CONFIG, timeDependentNoise);
    
    // Different times should produce different wave heights (animation)
    expect(time1).not.toBe(time2);
  });
  
  test('handles zero perspective (no depth scaling)', () => {
    const noPerspective: OceanWaveConfig = {
      ...DEFAULT_OCEAN_CONFIG,
      perspective: 0,
    };
    
    const near = calculateWavePoint(1, 0, 0, noPerspective, mockNoise);
    const far = calculateWavePoint(1, 4, 0, noPerspective, mockNoise);
    
    // Without perspective, waves at different depths should have similar amplitude
    expect(Math.abs(Math.abs(near) - Math.abs(far))).toBeLessThan(1);
  });
});

describe('shouldRenderFoam', () => {
  test('returns boolean', () => {
    const result = shouldRenderFoam(25, 50, 0.7);
    expect(typeof result).toBe('boolean');
  });
  
  test('high wave crests trigger foam', () => {
    const amplitude = 50;
    const threshold = 0.7;
    const highCrest = amplitude * 0.8; // Near peak
    
    expect(shouldRenderFoam(highCrest, amplitude, threshold)).toBe(true);
  });
  
  test('low wave troughs do not trigger foam', () => {
    const amplitude = 50;
    const threshold = 0.7;
    const lowTrough = -amplitude * 0.8; // Near bottom
    
    expect(shouldRenderFoam(lowTrough, amplitude, threshold)).toBe(false);
  });
  
  test('mid-level waves do not trigger foam with high threshold', () => {
    const amplitude = 50;
    const threshold = 0.8;
    const midWave = 0; // Middle height
    
    expect(shouldRenderFoam(midWave, amplitude, threshold)).toBe(false);
  });
  
  test('threshold of 0 triggers foam everywhere', () => {
    const amplitude = 50;
    const threshold = 0;
    
    expect(shouldRenderFoam(-amplitude, amplitude, threshold)).toBe(true);
    expect(shouldRenderFoam(0, amplitude, threshold)).toBe(true);
    expect(shouldRenderFoam(amplitude, amplitude, threshold)).toBe(true);
  });
  
  test('threshold of 1 only triggers at peak', () => {
    const amplitude = 50;
    const threshold = 1;
    
    expect(shouldRenderFoam(amplitude, amplitude, threshold)).toBe(true);
    expect(shouldRenderFoam(amplitude * 0.99, amplitude, threshold)).toBe(false);
  });
  
  test('handles negative amplitudes correctly', () => {
    // Edge case: if amplitude is negative (shouldn't happen but test robustness)
    const result = shouldRenderFoam(10, -50, 0.5);
    expect(typeof result).toBe('boolean');
  });
});

describe('getWaveLayerColor', () => {
  test('returns RGB color object', () => {
    const color = getWaveLayerColor(0, 5);
    
    expect(color).toHaveProperty('r');
    expect(color).toHaveProperty('g');
    expect(color).toHaveProperty('b');
    expect(typeof color.r).toBe('number');
    expect(typeof color.g).toBe('number');
    expect(typeof color.b).toBe('number');
  });
  
  test('color values are in valid range (0-255)', () => {
    const color = getWaveLayerColor(2, 5);
    
    expect(color.r).toBeGreaterThanOrEqual(0);
    expect(color.r).toBeLessThanOrEqual(255);
    expect(color.g).toBeGreaterThanOrEqual(0);
    expect(color.g).toBeLessThanOrEqual(255);
    expect(color.b).toBeGreaterThanOrEqual(0);
    expect(color.b).toBeLessThanOrEqual(255);
  });
  
  test('distant layers are lighter than near layers', () => {
    const distant = getWaveLayerColor(0, 5); // Farthest
    const near = getWaveLayerColor(4, 5); // Nearest
    
    // Distant should have higher RGB values (lighter)
    expect(distant.r).toBeGreaterThan(near.r);
    expect(distant.g).toBeGreaterThan(near.g);
    expect(distant.b).toBeGreaterThan(near.b);
  });
  
  test('color transitions smoothly across layers', () => {
    const totalLayers = 5;
    const colors = Array.from({ length: totalLayers }, (_, i) => 
      getWaveLayerColor(i, totalLayers)
    );
    
    // Each layer should be darker than the previous
    for (let i = 1; i < colors.length; i++) {
      expect(colors[i].r).toBeLessThan(colors[i - 1].r);
      expect(colors[i].g).toBeLessThan(colors[i - 1].g);
      expect(colors[i].b).toBeLessThan(colors[i - 1].b);
    }
  });
  
  test('handles single layer without error', () => {
    const color = getWaveLayerColor(0, 1);
    expect(color.r).toBeDefined();
    expect(isNaN(color.r)).toBe(false);
  });
});

describe('getFoamColor', () => {
  test('returns RGBA color object', () => {
    const color = getFoamColor(0.5);
    
    expect(color).toHaveProperty('r');
    expect(color).toHaveProperty('g');
    expect(color).toHaveProperty('b');
    expect(color).toHaveProperty('a');
  });
  
  test('foam is white (high RGB values)', () => {
    const color = getFoamColor(0.5);
    
    expect(color.r).toBe(255);
    expect(color.g).toBe(255);
    expect(color.b).toBe(255);
  });
  
  test('alpha increases with intensity', () => {
    const lowIntensity = getFoamColor(0);
    const highIntensity = getFoamColor(1);
    
    expect(highIntensity.a).toBeGreaterThan(lowIntensity.a);
  });
  
  test('alpha is in valid range (0-255)', () => {
    const color = getFoamColor(0.5);
    
    expect(color.a).toBeGreaterThanOrEqual(0);
    expect(color.a).toBeLessThanOrEqual(255);
  });
  
  test('alpha does not exceed 255 with high intensity', () => {
    const color = getFoamColor(2); // Intensity > 1
    
    expect(color.a).toBeLessThanOrEqual(255);
  });
  
  test('handles zero intensity', () => {
    const color = getFoamColor(0);
    
    expect(color.a).toBeGreaterThan(0); // Should still have some opacity
  });
});

describe('generateFoamParticles', () => {
  // Mock Perlin noise function with predictable values
  const mockNoise = (x: number, y: number, z?: number): number => {
    // Simple deterministic function for testing
    return (Math.sin(x * 10 + (y || 0) * 5 + (z || 0)) + 1) / 2; // Returns 0-1
  };
  
  test('returns array of foam particles', () => {
    const particles = generateFoamParticles(100, 0, 0, 0.5, mockNoise);
    
    expect(Array.isArray(particles)).toBe(true);
    expect(particles.length).toBeGreaterThan(0);
  });
  
  test('each particle has required properties', () => {
    const particles = generateFoamParticles(100, 0, 0, 0.5, mockNoise);
    
    particles.forEach(particle => {
      expect(particle).toHaveProperty('offsetX');
      expect(particle).toHaveProperty('offsetY');
      expect(particle).toHaveProperty('size');
      expect(particle).toHaveProperty('r');
      expect(particle).toHaveProperty('g');
      expect(particle).toHaveProperty('b');
      expect(particle).toHaveProperty('alpha');
    });
  });
  
  test('particle count increases with intensity', () => {
    const lowIntensity = generateFoamParticles(100, 0, 0, 0.2, mockNoise);
    const highIntensity = generateFoamParticles(100, 0, 0, 0.9, mockNoise);
    
    expect(highIntensity.length).toBeGreaterThan(lowIntensity.length);
  });
  
  test('minimum particle count is enforced', () => {
    // Even with zero intensity, should have at least minimum particles
    const particles = generateFoamParticles(100, 0, 0, 0, mockNoise);
    
    expect(particles.length).toBeGreaterThanOrEqual(3); // FOAM_MIN_PARTICLES
  });
  
  test('particle properties are within valid ranges', () => {
    const particles = generateFoamParticles(100, 0, 0, 0.5, mockNoise);
    
    particles.forEach(particle => {
      // Size should be positive
      expect(particle.size).toBeGreaterThan(0);
      
      // Color values should be in RGB range
      expect(particle.r).toBeGreaterThanOrEqual(0);
      expect(particle.r).toBeLessThanOrEqual(255);
      expect(particle.g).toBeGreaterThanOrEqual(0);
      expect(particle.g).toBeLessThanOrEqual(255);
      expect(particle.b).toBeGreaterThanOrEqual(0);
      expect(particle.b).toBeLessThanOrEqual(255);
      
      // Alpha should be valid
      expect(particle.alpha).toBeGreaterThanOrEqual(0);
      expect(particle.alpha).toBeLessThanOrEqual(255);
    });
  });
  
  test('particles have white color (foam)', () => {
    const particles = generateFoamParticles(100, 0, 0, 0.5, mockNoise);
    
    particles.forEach(particle => {
      expect(particle.r).toBe(255);
      expect(particle.g).toBe(255);
      expect(particle.b).toBe(255);
    });
  });
  
  test('particles have varying positions (horizontal spread)', () => {
    const particles = generateFoamParticles(100, 0, 0, 0.8, mockNoise);
    
    // Get unique offsetX values
    const uniqueOffsets = new Set(particles.map(p => p.offsetX));
    
    // Should have variation in horizontal positions
    expect(uniqueOffsets.size).toBeGreaterThan(1);
  });
  
  test('particles have varying sizes', () => {
    const particles = generateFoamParticles(100, 0, 0, 0.8, mockNoise);
    
    // Get unique size values
    const uniqueSizes = new Set(particles.map(p => p.size));
    
    // Should have variation in sizes
    expect(uniqueSizes.size).toBeGreaterThan(1);
  });
  
  test('different positions produce different particle distributions', () => {
    const particles1 = generateFoamParticles(100, 0, 0, 0.5, mockNoise);
    const particles2 = generateFoamParticles(200, 0, 0, 0.5, mockNoise);
    
    // Particles at different x positions should have different offsets
    expect(particles1[0].offsetX).not.toBe(particles2[0].offsetX);
  });
  
  test('time parameter affects particle generation', () => {
    const particles1 = generateFoamParticles(100, 0, 0, 0.5, mockNoise);
    const particles2 = generateFoamParticles(100, 0, 100, 0.5, mockNoise);
    
    // Different time values should produce different particles
    expect(particles1[0].offsetX).not.toBe(particles2[0].offsetX);
  });
  
  test('layer parameter affects particle generation', () => {
    const particles1 = generateFoamParticles(100, 0, 0, 0.5, mockNoise);
    const particles2 = generateFoamParticles(100, 2, 0, 0.5, mockNoise);
    
    // Different layers should produce different particles
    expect(particles1[0].offsetX).not.toBe(particles2[0].offsetX);
  });
  
  test('alpha varies with intensity (brighter foam for stronger waves)', () => {
    const lowIntensity = generateFoamParticles(100, 0, 0, 0.2, mockNoise);
    const highIntensity = generateFoamParticles(100, 0, 0, 0.9, mockNoise);
    
    // High intensity foam should generally have higher alpha values
    const avgAlphaLow = lowIntensity.reduce((sum, p) => sum + p.alpha, 0) / lowIntensity.length;
    const avgAlphaHigh = highIntensity.reduce((sum, p) => sum + p.alpha, 0) / highIntensity.length;
    
    expect(avgAlphaHigh).toBeGreaterThan(avgAlphaLow);
  });
});
