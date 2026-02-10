# P5.js Animation Utilities

This directory contains reusable utility functions and configuration for P5.js generative animations. The architecture emphasizes separation of concerns, type safety, performance optimization, and testability.

## Architecture Overview

### Separation of Concerns

The animation logic is organized into three layers:

1. **Utility Layer** (`oceanWaves.ts`): Pure functions for calculations and data generation
   - No P5.js dependencies
   - Fully unit testable with Vitest
   - Platform-agnostic algorithms

2. **Component Layer** (`src/components/apps/*.svelte`): P5.js integration and rendering
   - Instance mode P5.js setup
   - Web Audio API integration
   - User interaction handling
   - Lifecycle management

3. **Test Layer** (`oceanWaves.test.ts`): Comprehensive validation
   - 40+ unit tests covering edge cases
   - Test utilities for controlled noise functions
   - Property-based testing patterns

### Benefits

- **Testability**: Business logic can be tested without P5.js or browser APIs
- **Reusability**: Utility functions work across multiple animation types
- **Performance**: Calculations optimized independently from rendering
- **Maintainability**: Clear boundaries between concerns

## Code Organization Idioms

### 1. Constant Organization

Constants are grouped by domain with clear documentation:

```typescript
// ============================================================================
// WAVE CALCULATION CONSTANTS
// ============================================================================

/** Reduction factor for z-axis noise influence (creates smoother layer transitions) */
const NOISE_Z_SCALE_FACTOR = 0.5;

/** Center offset for noise value mapping (centers wave oscillation around zero) */
const NOISE_CENTER_OFFSET = 0.5;

// ============================================================================
// WAVE COLOR CONSTANTS
// ============================================================================

/** Base ocean color (foreground) - Dark blue-green */
const BASE_WAVE_COLOR = {
  r: 20,
  g: 60,
  b: 100,
} as const;
```

**Patterns:**
- Section headers with `=` separators for visual grouping
- JSDoc comments explain **why** (not just **what**)
- `as const` for immutable color objects
- Domain-specific naming (FOAM_*, WAVE_*, etc.)
- Magic numbers replaced with named constants

### 2. Type Safety with TypeScript

All public interfaces and functions are fully typed:

```typescript
export interface OceanWaveConfig {
  /** Number of wave layers (back to front) */
  layers: number;
  /** Perlin noise frequency scale (lower = smoother waves) */
  noiseScale: number;
  // ... more fields
}

export function calculateWavePoint(
  x: number,
  z: number,
  time: number,
  config: OceanWaveConfig,
  noiseFunc: (x: number, y: number, z: number) => number
): number {
  // Implementation
}
```

**Patterns:**
- Explicit return types on all exported functions
- Documented configuration interfaces
- Function parameters as dependency injection (e.g., `noiseFunc`)
- No `any` types (except P5.js buffers with complex internal types)

### 3. Edge Case Handling

Defensive programming prevents NaN/Infinity propagation:

```typescript
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
  const normalizedHeight = (waveHeight + amplitude) / (2 * amplitude);
  
  return normalizedHeight >= threshold;
}
```

**Patterns:**
- Early returns for invalid inputs
- Clamping with `Math.max(0, Math.min(1, value))`
- Division by zero guards
- Comments explain **why** guards exist (for future maintainers)

## P5.js Integration Patterns

### 1. Instance Mode

Always use instance mode for Svelte integration (avoids global namespace pollution):

```typescript
const sketch = (p: p5) => {
  p.setup = () => {
    p.createCanvas(width, height, p.WEBGL);
    p.noStroke();
  };
  
  p.draw = () => {
    // Animation loop
  };
};

p5Instance = new p5(sketch, containerElement);
```

**Why:**
- Multiple P5.js sketches can coexist on one page
- No global `setup()`/`draw()` conflicts
- Easier to test and reason about

### 2. WEBGL Renderer for 3D Effects

Use WEBGL mode for depth-stacked layers:

```typescript
p.createCanvas(width, height, p.WEBGL);

// WEBGL uses center origin (0, 0)
p.translate(0, yOffset, zPos); // Z-axis for depth

// Draw with perspective
for (let layer = 0; layer < layers; layer++) {
  const zPos = LAYER_DEPTH_START + layer * LAYER_DEPTH_SPACING;
  // ... render at depth
}
```

**Gotchas:**
- WEBGL origin is canvas center (not top-left like 2D mode)
- Requires manual camera positioning
- `p.translate()` affects all subsequent draws (use `p.push()`/`p.pop()`)

### 3. Performance Optimization with Off-Screen Buffers

Cache static/repeated content in `p5.Graphics` buffers:

```typescript
let skyGradientBuffer: any;

function createSkyGradient(p: p5, w: number, h: number) {
  skyGradientBuffer = p.createGraphics(w, h);
  
  // Draw gradient once
  for (let y = 0; y < h; y++) {
    const inter = y / h;
    const c = skyGradientBuffer.lerpColor(c1, c2, inter);
    skyGradientBuffer.fill(c);
    skyGradientBuffer.rect(0, y, w, 1);
  }
}

p.draw = () => {
  // Blit pre-rendered buffer (1 operation vs 600 rect draws)
  p.image(skyGradientBuffer, 0, 0);
};
```

**Impact:**
- Reduces ~36,000 operations/sec for a 600px tall gradient at 60fps
- Recreate only on canvas resize
- Same pattern for any static background/texture

### 4. Audio Reactivity with Web Audio API

Integrate frequency analysis for audio-reactive animations:

```typescript
// Setup (once on user interaction)
audioContext = new AudioContext();
analyser = audioContext.createAnalyser();
analyser.fftSize = 2048;
analyser.smoothingTimeConstant = 0.8;

audioSource = audioContext.createMediaElementSource(audioElement);
audioSource.connect(analyser);
analyser.connect(audioContext.destination);

dataArray = new Uint8Array(analyser.frequencyBinCount);

// In draw loop (once per frame)
if (audioIsPlaying && analyser && dataArray) {
  // Single buffer read per frame
  analyser.getByteFrequencyData(dataArray);
  
  // Calculate frequency band energies
  lowEnergy = computeEnergyInRange(20, 250);    // Bass
  midEnergy = computeEnergyInRange(250, 4000);  // Mids
  highEnergy = computeEnergyInRange(4000, 20000); // Treble
}

// Map to visual parameters
layerAmplitude = baseAmplitude + (lowEnergy * scaleFactor);
```

**Best Practices:**
- Call `getByteFrequencyData()` **once** per frame (not per layer)
- Use actual `audioContext.sampleRate` (not hardcoded 44100)
- Frequency to bin: `bin = Math.floor(frequency / (sampleRate / fftSize))`
- Set `crossOrigin = "anonymous"` **before** `src =` for CORS
- Wrap `audioElement.play()` in try/catch (autoplay policy)

### 5. Perlin Noise for Organic Motion

Use 3D Perlin noise with time as third dimension:

```typescript
export function calculateWavePoint(
  x: number,
  z: number,
  time: number,
  config: OceanWaveConfig,
  noiseFunc: (x: number, y: number, z: number) => number
): number {
  const noiseValue = noiseFunc(
    x * config.noiseScale,          // Horizontal position
    z * config.noiseScale * 0.5,    // Depth (reduced influence)
    time * config.waveSpeed         // Time for animation
  );
  
  // Map noise (0-1) to wave height (-amplitude to +amplitude)
  const waveHeight = (noiseValue - 0.5) * 2 * amplitude;
  return waveHeight;
}
```

**Patterns:**
- Inject `noiseFunc` as parameter (enables testing with custom noise)
- Scale `x` for spatial frequency control
- Scale `time` for animation speed
- Reduce `z` influence for smoother layer transitions
- Center noise output around 0 for symmetric waves

### 6. Variable Naming to Avoid Shadowing

When using arrow functions inside loops, avoid shadowing outer variables:

```typescript
// ❌ BAD: Arrow function parameters shadow outer `x`
for (let x = 0; x < width; x++) {
  const waveHeight = calculateWavePoint(
    x,
    layer,
    time,
    config,
    (x, y, z) => p.noise(x, y, z) // `x` here shadows loop variable!
  );
}

// ✅ GOOD: Use different parameter names
for (let x = 0; x < width; x++) {
  const waveHeight = calculateWavePoint(
    x,
    layer,
    time,
    config,
    (nx, ny, nz) => p.noise(nx, ny, nz) // Clear distinction
  );
}
```

**Impact:**
- Prevents subtle bugs where wrong variable is used
- Improves code clarity
- Easier to debug

## Accessibility Best Practices

### 1. WCAG-Compliant Controls

Ensure interactive elements are accessible to screen readers:

```svelte
<!-- ❌ BAD: Emoji-only button, text completely hidden on mobile -->
<button class="...">
  ▶️
  <span class="max-sm:hidden">Play Animation</span>
</button>

<!-- ✅ GOOD: Decorative emoji, text always accessible -->
<button class="...">
  <span aria-hidden="true">▶️</span>
  <span class="max-sm:sr-only">Play Animation</span>
</button>
```

**Patterns:**
- `aria-hidden="true"` on decorative content (emoji, icons)
- `sr-only` instead of `display: none` (keeps text accessible)
- Always provide text alternative, not just `aria-label`

## Testing Patterns

### 1. Deterministic Noise Functions

Control noise output for predictable tests:

```typescript
describe('calculateWavePoint', () => {
  test('depth affects wave height due to perspective', () => {
    // Constant noise removes randomness
    const constantNoise = (_x: number, _y: number, _z: number) => 0.5;
    
    const nearWave = calculateWavePoint(0, 1, 0, config, constantNoise);
    const farWave = calculateWavePoint(0, 2, 0, config, constantNoise);
    
    // Near waves should be taller due to perspective
    expect(Math.abs(farWave)).toBeLessThan(Math.abs(nearWave));
  });
});
```

**Patterns:**
- `constantNoise`: Fixed output for isolation
- `timeDependentNoise`: Varies with `z` parameter to test animation
- Test **output** (wave height), not config arithmetic
- Use descriptive test names explaining **what** is validated

### 2. Edge Case Coverage

Test boundary conditions and error states:

```typescript
test('handles zero amplitude without division by zero', () => {
  const result = shouldRenderFoam(10, 0, 0.7);
  expect(result).toBe(false);
  expect(Number.isNaN(result)).toBe(false);
});

test('clamps depthScale to prevent negative scaling for large z values', () => {
  const config = { ...DEFAULT_OCEAN_CONFIG, perspective: 0.6 };
  const waveHeight = calculateWavePoint(0, 4, 0, config, constantNoise);
  
  // Should not invert (go negative) for layers >= 2
  expect(waveHeight).toBe(0); // Clamped to 0 when depthScale goes negative
});
```

**Edge cases to test:**
- Division by zero (amplitude = 0, threshold = 1)
- Negative values (amplitude, perspective)
- Boundary values (threshold = 0, threshold = 1)
- Large depth values (z > expected range)

### 3. Test Structure

Organize tests by domain:

```typescript
describe('OceanWaves', () => {
  describe('Configuration', () => {
    test('should export default configuration', () => {});
  });
  
  describe('Wave Calculations', () => {
    test('should calculate wave point at position', () => {});
    test('should handle negative amplitudes correctly', () => {});
  });
  
  describe('Foam Rendering', () => {
    test('should determine foam rendering based on threshold', () => {});
    test('foam should appear on wave crests', () => {});
  });
});
```

## File Naming Conventions

```text
oceanWaves.ts         # Business logic utilities
oceanWaves.test.ts    # Unit tests for utilities
OceanWaves.svelte     # Svelte component (PascalCase)
```

- Utilities: camelCase
- Components: PascalCase
- Tests: `*.test.ts` suffix

## Performance Checklist

When creating new P5.js animations, optimize:

- [ ] Cache static backgrounds in `p5.Graphics` buffers
- [ ] Read audio buffers once per frame (not per layer/particle)
- [ ] Use `p.push()`/`p.pop()` for transform isolation
- [ ] Minimize `p.fill()` and `p.stroke()` state changes
- [ ] Batch similar draw operations (group by color/stroke)
- [ ] Consider `p.noSmooth()` for pixel art styles
- [ ] Use `p.WEBGL` only when depth is needed (higher overhead than 2D)

## Example: Adding a New Animation

1. **Create utility file** (`src/animations/newAnimation.ts`):
   ```typescript
   export interface NewAnimationConfig {
     // Configuration properties
   }
   
   export const DEFAULT_CONFIG: NewAnimationConfig = {
     // Defaults
   };
   
   export function calculateSomething(
     param: number,
     config: NewAnimationConfig
   ): number {
     // Pure calculation logic
   }
   ```

2. **Create test file** (`src/animations/newAnimation.test.ts`):
   ```typescript
   import { describe, test, expect } from 'vitest';
   import { calculateSomething, DEFAULT_CONFIG } from './newAnimation';
   
   describe('NewAnimation', () => {
     test('should calculate correctly', () => {
       const result = calculateSomething(10, DEFAULT_CONFIG);
       expect(result).toBeDefined();
     });
   });
   ```

3. **Create Svelte component** (`src/components/apps/NewAnimation.svelte`):
   ```svelte
   <script lang="ts">
     import { onMount } from 'svelte';
     import type p5 from 'p5';
     import { calculateSomething, DEFAULT_CONFIG } from '../../animations/newAnimation';
     
     let canvasContainer = $state<HTMLDivElement>();
     
     onMount(async () => {
       const p5Module = await import('p5');
       const p5 = p5Module.default;
       
       const sketch = (p: p5) => {
         p.setup = () => {
           p.createCanvas(800, 600);
         };
         
         p.draw = () => {
           const value = calculateSomething(p.frameCount, DEFAULT_CONFIG);
           // Render using value
         };
       };
       
       const p5Instance = new p5(sketch, canvasContainer);
       
       return () => {
         p5Instance.remove();
       };
     });
   </script>
   
   <div bind:this={canvasContainer} class="w-full h-full"></div>
   ```

4. **Run tests**:
   ```bash
   npm run test        # Watch mode
   npm run test:run    # Single run
   npm run test:ui     # UI mode
   ```

5. **Document** (in `src/content/apps/new-animation.mdx`):
   - Explain the generative algorithm
   - Include interactive component with `client:load`
   - Describe any audio reactivity or interactivity

## Further Reading

- [P5.js Documentation](https://p5js.org/reference/)
- [Web Audio API Guide](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [Svelte 5 Runes](https://svelte.dev/docs/svelte/overview)
- [Vitest Testing Guide](https://vitest.dev/guide/)
- [Perlin Noise Explained](https://en.wikipedia.org/wiki/Perlin_noise)

## Contributing

When modifying animation utilities:

1. Update tests to reflect behavior changes
2. Ensure all 135+ tests pass (`npm run test:run`)
3. Verify production build (`npm run build`)
4. Follow TypeScript strict mode guidelines
5. Document new idioms in this README
6. Add JSDoc comments explaining **why** (not just **what**)

---

**Last Updated**: February 2026  
**Maintainer**: brylie  
**License**: See LICENSE file in repository root
