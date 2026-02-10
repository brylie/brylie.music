# P5.js Animation Utilities

This directory contains reusable utility functions and configuration for P5.js generative animations. The architecture emphasizes separation of concerns, type safety, performance optimization, testability, and a consistent declarative interface for parameter control and audio reactivity.

**Read this file at the start of every development session** to ensure consistency across the project.

## Architecture Overview

### Separation of Concerns

The animation logic is organized into four layers:

1. **Primitives Layer** (`src/primitives/`): Shared, pure utility functions
   - No P5.js dependencies (unless P5 instance is passed as a parameter)
   - Organized by domain: geometry, noise, color, motion, math, audio, particles, shaders
   - Fully unit testable with Vitest
   - Reusable across all animations

2. **Utility Layer** (e.g., `oceanWaves.ts`): Animation-specific calculations and data generation
   - No P5.js dependencies
   - Composes functions from the primitives layer
   - Fully unit testable with Vitest
   - Platform-agnostic algorithms

3. **Component Layer** (`src/components/apps/*.svelte`): P5.js integration and rendering
   - Instance mode P5.js setup
   - AudioBridge consumption (not direct Web Audio API)
   - User interaction handling
   - Lifecycle management

4. **Test Layer** (`*.test.ts`): Comprehensive validation
   - Unit tests for primitives and animation-specific utilities
   - Test utilities for controlled noise functions
   - Property-based testing patterns
   - Optional snapshot tests for visual regression

### Benefits

- **Testability**: Business logic can be tested without P5.js or browser APIs
- **Reusability**: Primitive functions work across all animation types
- **Performance**: Calculations optimized independently from rendering
- **Maintainability**: Clear boundaries between concerns
- **Composability**: New animations build on proven primitives rather than reinventing common math

## Project Structure

```text
src/
├── animations/
│   ├── README.md                    ← You are here
│   ├── ocean-waves/
│   │   ├── oceanWaves.ts            ← Animation-specific utility logic
│   │   ├── oceanWaves.test.ts       ← Unit tests
│   │   ├── parameters.ts            ← Declarative parameter interface
│   │   └── shaders/                 ← Co-located GLSL shaders (if any)
│   └── ...
├── primitives/
│   ├── geometry.ts                  ← Polar coords, polygons, spirals, symmetry
│   ├── noise.ts                     ← fBm, curl noise, domain warping
│   ├── color.ts                     ← OKLab/OKLCH, palette generation, gradients
│   ├── audio.ts                     ← AudioBridge, frequency bands, beat detection
│   ├── motion.ts                    ← Easing, springs, damped oscillation, phase
│   ├── particles.ts                 ← Object pool, emitters, attractors, trails
│   ├── shaders.ts                   ← Common GLSL utilities, compilation helpers
│   └── math.ts                      ← Remap, clamp, golden ratio, vector helpers
├── core/
│   ├── AudioBridge.ts               ← Standardized audio data interface
│   ├── ParameterManager.ts          ← Reactive parameter state and UI binding
│   └── types.ts                     ← Shared type definitions
├── components/
│   └── apps/
│       ├── OceanWaves.svelte        ← Svelte component (PascalCase)
│       └── ...
├── tests/
│   └── primitives/                  ← Unit tests for each primitive module
└── content/
    └── apps/
        └── ocean-waves.mdx          ← Documentation with interactive embed
```

## Declarative Parameter Interface

Every animation exports a `parameters` object from its `parameters.ts` file. This is the single source of truth for what can be tuned, and it serves three purposes: runtime type safety, UI generation, and audio mapping configuration.

### ParameterDef Type

```typescript
export interface ParameterDef {
  /** Minimum allowed value */
  min: number;
  /** Maximum allowed value */
  max: number;
  /** Default value (must produce a visually pleasing result out of the box) */
  default: number;
  /** Increment granularity for sliders */
  step: number;
  /** Logical grouping for UI layout */
  group: "Geometry" | "Motion" | "Color" | "Audio Response" | "Atmosphere";
  /** Whether this parameter is a good target for audio reactivity */
  audioMappable: boolean;
  /** Human-readable explanation of what this controls */
  description: string;
  /** Optional unit label (e.g., "Hz", "seconds", "degrees") */
  unit?: string;
}

export type ParameterInterface = Record<string, ParameterDef>;
```

### Example: Ocean Waves Parameters

```typescript
import type { ParameterInterface } from "../../core/types";

export const parameters: ParameterInterface = {
  // Geometry
  layers: {
    min: 2, max: 12, default: 6, step: 1,
    group: "Geometry",
    audioMappable: false,
    description: "Number of wave layers stacked front to back",
  },
  turbulence: {
    min: 0.001, max: 0.05, default: 0.02, step: 0.001,
    group: "Geometry",
    audioMappable: true,
    description: "Roughness of the wave surface; higher values create choppier seas",
  },

  // Motion
  drift: {
    min: 0.001, max: 0.05, default: 0.01, step: 0.001,
    group: "Motion",
    audioMappable: false,
    description: "Speed of wave movement across the canvas",
  },
  swell: {
    min: 5, max: 80, default: 30, step: 1,
    group: "Motion",
    audioMappable: true,
    description: "Height of the wave peaks, in pixels",
    unit: "px",
  },

  // Color
  warmth: {
    min: 0, max: 1, default: 0.3, step: 0.01,
    group: "Color",
    audioMappable: true,
    description: "Shift from cool deep-ocean blues toward warm sunset tones",
  },
  foam_threshold: {
    min: 0, max: 1, default: 0.7, step: 0.01,
    group: "Color",
    audioMappable: false,
    description: "How high a wave crest must be before foam appears",
  },

  // Audio Response
  bass_sensitivity: {
    min: 0, max: 2, default: 1, step: 0.1,
    group: "Audio Response",
    audioMappable: false,
    description: "How strongly bass frequencies affect wave height",
  },
};
```

### Relationship to TypeScript Config Interfaces

The `ParameterInterface` defines the metadata (ranges, grouping, audio mapping) for external consumers like UI generators and audio routers. The existing TypeScript config interfaces (e.g., `OceanWaveConfig`) remain the internal runtime type for calculation functions. Keep both: the parameter interface is declarative and outward-facing; the config interface is structural and inward-facing.

```typescript
// parameters.ts  — declarative, for UI and audio mapping
export const parameters: ParameterInterface = { turbulence: { min: 0.001, ... } };

// oceanWaves.ts  — structural, for calculation functions
export interface OceanWaveConfig {
  noiseScale: number;  // derived from the "turbulence" parameter
  // ...
}
```

A thin mapping function translates parameter values into the config shape:

```typescript
export function paramsToConfig(params: Record<string, number>): OceanWaveConfig {
  return {
    noiseScale: params.turbulence,
    waveSpeed: params.drift,
    amplitude: params.swell,
    layers: params.layers,
    foamThreshold: params.foam_threshold,
    // ...
  };
}
```

### Parameter Naming Guidelines

Parameters describe what a person perceives, not how the math works:

| Prefer (semantic) | Avoid (implementation) |
| ----------------- | ---------------------- |
| `turbulence`      | `noiseScale`           |
| `swell`           | `amplitude`            |
| `drift`           | `waveSpeed`            |
| `warmth`          | `hueShift`             |
| `complexity`      | `iterationCount`       |
| `breathing_rate`  | `oscillationFrequency` |
| `bloom`           | `gaussianBlurRadius`   |
| `density`         | `particleCount`        |

When a parameter maps directly to a well-known perceptual concept (e.g., "saturation", "hue"), the standard name is fine. The goal is that someone with no code experience can read the parameter list and understand what each one changes.

### Parameter Grouping Convention

- **Geometry**: Shape, structure, symmetry, complexity, density, reflections
- **Motion**: Speed, drift, oscillation, breathing, rotation, pulse
- **Color**: Palette, warmth, saturation, contrast, opacity, gradient
- **Audio Response**: Sensitivity, frequency bias, smoothing, reactivity curve
- **Atmosphere** (optional): Blur, glow, grain, fade, depth-of-field, fog

## Audio Bridge

Animations never interact with the Web Audio API directly. They receive processed audio data through the `AudioBridge` class, which produces an `AudioFrame` each frame.

### AudioFrame Interface

```typescript
export interface AudioFrame {
  /** Overall amplitude, 0.0 to 1.0 (smoothed to prevent jitter) */
  amplitude: number;
  /** Unsmoothed amplitude for transient/onset detection */
  rawAmplitude: number;
  /** Full FFT spectrum, normalized 0.0 to 1.0 */
  spectrum: Float32Array;
  /** Frequency band energies, each 0.0 to 1.0 */
  bands: {
    subBass: number;    // 20–60 Hz
    bass: number;       // 60–250 Hz
    mid: number;        // 250–2000 Hz
    high: number;       // 2000–6000 Hz
    presence: number;   // 6000–12000 Hz
    brilliance: number; // 12000–20000 Hz
  };
  /** True on the frame a beat onset is detected */
  beat: boolean;
  /** Brightness of the sound, normalized 0.0 to 1.0 */
  spectralCentroid: number;
  /** Estimated BPM, 0 if unknown or not yet calculated */
  bpm: number;
}
```

### AudioBridge Responsibilities

The `AudioBridge` class encapsulates all Web Audio API complexity:

- FFT analysis via `AnalyserNode` (single `getByteFrequencyData()` call per frame)
- Configurable smoothing to prevent jittery visuals (`smoothingTimeConstant`)
- Beat detection via energy flux onset detection
- Frequency band splitting using actual `audioContext.sampleRate` for accurate bin mapping
- Graceful fallback: when no audio source is connected, all values are 0 and `beat` is false
- Support for multiple input sources: `<audio>` element, microphone, `MediaStream`

### Usage in Animations

```typescript
// In the Svelte component or animation runner
const audioBridge = new AudioBridge();
await audioBridge.connectElement(audioElement);

// In the draw loop
const audio: AudioFrame = audioBridge.getFrame();

// Pass to pure calculation functions
const waveHeight = calculateWavePoint(x, z, time, config, noiseFunc);
const audioModulatedHeight = waveHeight * (1 + audio.bands.bass * params.bass_sensitivity);
```

### Testing with Mock Audio

Because animations consume `AudioFrame` objects rather than the Web Audio API, testing is straightforward:

```typescript
const silentFrame: AudioFrame = {
  amplitude: 0, rawAmplitude: 0,
  spectrum: new Float32Array(1024),
  bands: { subBass: 0, bass: 0, mid: 0, high: 0, presence: 0, brilliance: 0 },
  beat: false, spectralCentroid: 0, bpm: 0,
};

const loudBassFrame: AudioFrame = {
  ...silentFrame,
  amplitude: 0.8,
  bands: { ...silentFrame.bands, bass: 0.9, subBass: 0.7 },
  beat: true,
};

test("wave height increases with bass energy", () => {
  const base = calculateModulatedHeight(10, config, silentFrame);
  const boosted = calculateModulatedHeight(10, config, loudBassFrame);
  expect(boosted).toBeGreaterThan(base);
});
```

### Web Audio API Setup Reference

For the `AudioBridge` implementation itself (not for use in animation code):

```typescript
// Setup (once on user interaction to satisfy autoplay policy)
audioContext = new AudioContext();
analyser = audioContext.createAnalyser();
analyser.fftSize = 2048;
analyser.smoothingTimeConstant = 0.8;

audioSource = audioContext.createMediaElementSource(audioElement);
audioSource.connect(analyser);
analyser.connect(audioContext.destination);

dataArray = new Uint8Array(analyser.frequencyBinCount);

// Per frame (called by AudioBridge.getFrame())
analyser.getByteFrequencyData(dataArray);

// Frequency to bin conversion (use actual sample rate, not hardcoded 44100)
const bin = Math.floor(frequency / (audioContext.sampleRate / analyser.fftSize));
```

**Best Practices:**
- Call `getByteFrequencyData()` **once** per frame (not per layer or particle)
- Use actual `audioContext.sampleRate` for accurate frequency-to-bin mapping
- Set `crossOrigin = "anonymous"` **before** setting `src` on audio elements for CORS
- Wrap `audioElement.play()` in try/catch (browser autoplay policy)

## Shared Primitives Library

Before writing new utility functions for an animation, check what already exists in `src/primitives/`. Compose from existing primitives when possible; add new ones when a function would be useful across multiple animations.

### Primitive Modules

| Module         | Contents                                                                                                                                                                     |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `geometry.ts`  | Polar coordinate helpers, regular polygon generation, spiral functions (Archimedean, logarithmic, Fibonacci), symmetry/reflection transforms, Lissajous curves, superformula |
| `noise.ts`     | Layered Perlin/simplex noise, curl noise for fluid motion, domain warping, flow field generation, fractal Brownian motion (fBm) with configurable octaves                    |
| `color.ts`     | OKLab/OKLCH perceptual color spaces, palette generation from harmonic rules, gradient interpolation, temperature-based color mapping, alpha blending                         |
| `motion.ts`    | Easing functions (Robert Penner set plus custom), spring physics, damped oscillation, smooth value interpolation, circular motion, phase accumulators                        |
| `math.ts`      | Value remapping, clamping, modular arithmetic, golden ratio/Fibonacci utilities, matrix operations, vector helpers, seeded pseudo-random                                     |
| `audio.ts`     | AudioBridge class, frequency band energy calculation, beat detection, spectral centroid, smoothing/easing for audio-reactive values                                          |
| `particles.ts` | Object pool with reuse, force accumulator pattern, emitter/attractor/repulsor, trail rendering with fade, spatial hashing for neighbor queries                               |
| `shaders.ts`   | Common GLSL utility functions (noise, rotation, SDF shapes, color space conversions), shader compilation/linking helpers, uniform management, ping-pong framebuffer setup    |

### Rules for Primitives

1. **Pure functions preferred.** If state is needed, use a clearly documented class with explicit lifecycle.
2. **P5.js dependency is explicit.** When a function needs P5 methods, accept the `p5` instance as the first parameter. Never rely on global P5 state.
3. **JSDoc required.** Every exported function has `@param` types, `@returns` type, and a brief usage example.
4. **Unit testable in isolation.** Primitives have tests in `tests/primitives/` that run without a browser or canvas.
5. **No duplication.** If two animations need the same math, it belongs in a primitive module.

```typescript
// Good: pure, no P5 dependency, testable
export function polarToCartesian(r: number, theta: number): { x: number; y: number } {
  return { x: r * Math.cos(theta), y: r * Math.sin(theta) };
}

// Good: P5 dependency is explicit via parameter
export function drawRegularPolygon(p: p5, cx: number, cy: number, radius: number, sides: number): void {
  p.beginShape();
  for (let i = 0; i < sides; i++) {
    const angle = (Math.PI * 2 * i) / sides - Math.PI / 2;
    p.vertex(cx + radius * Math.cos(angle), cy + radius * Math.sin(angle));
  }
  p.endShape(p.CLOSE);
}
```

## Animation Lifecycle

Every animation should handle these lifecycle events consistently:

| Hook                                | When it fires              | Responsibility                                                                           |
| ----------------------------------- | -------------------------- | ---------------------------------------------------------------------------------------- |
| `setup(p, params)`                  | Once at initialization     | Create canvas, allocate buffers, build initial geometry                                  |
| `draw(p, params, audio)`            | Every frame (~60fps)       | Render current frame using params and audio data                                         |
| `onResize(p, width, height)`        | Window or container resize | Recreate canvas and off-screen buffers, recalculate layout                               |
| `onParamChange(key, value, params)` | A parameter value changes  | Handle expensive recomputations (e.g., rebuild geometry cache, reallocate particle pool) |
| `dispose()`                         | Animation is torn down     | Free WebGL resources, cancel workers, release audio nodes, remove event listeners        |

The `draw` loop reads from the reactive params object. Changing a parameter immediately affects the next frame without restarting the animation. For expensive operations triggered by parameter changes (like regenerating a mesh), use `onParamChange` to perform the recomputation once rather than checking every frame.

### Svelte Integration

```typescript
const sketch = (p: p5) => {
  let params: Record<string, number>;
  let audio: AudioFrame;

  p.setup = () => {
    p.createCanvas(width, height, p.WEBGL);
    p.noStroke();
    params = getInitialParams();
  };

  p.draw = () => {
    audio = audioBridge.getFrame();
    // Render using params and audio
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    recreateBuffers(p);
  };
};

const p5Instance = new p5(sketch, containerElement);

// Cleanup on Svelte component destroy
onDestroy(() => {
  p5Instance.remove();
  audioBridge.dispose();
});
```

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
let skyGradientBuffer: p5.Graphics;

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
- Recreate only on canvas resize (handle in `onResize`)
- Same pattern for any static background or texture

### 4. Perlin Noise for Organic Motion

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
  const waveHeight = (noiseValue - 0.5) * 2 * config.amplitude;
  return waveHeight;
}
```

**Patterns:**
- Inject `noiseFunc` as parameter (enables testing with custom noise)
- Scale `x` for spatial frequency control
- Scale `time` for animation speed
- Reduce `z` influence for smoother layer transitions
- Center noise output around 0 for symmetric waves

### 5. Variable Naming to Avoid Shadowing

When using arrow functions inside loops, avoid shadowing outer variables:

```typescript
// ❌ BAD: Arrow function parameters shadow outer `x`
for (let x = 0; x < width; x++) {
  const waveHeight = calculateWavePoint(
    x, layer, time, config,
    (x, y, z) => p.noise(x, y, z) // `x` here shadows loop variable!
  );
}

// ✅ GOOD: Use different parameter names
for (let x = 0; x < width; x++) {
  const waveHeight = calculateWavePoint(
    x, layer, time, config,
    (nx, ny, nz) => p.noise(nx, ny, nz) // Clear distinction
  );
}
```

### 6. Shader Integration

For GPU-accelerated effects, use GLSL shaders through P5.js `createShader()` in WEBGL mode.

**Co-location rule**: Shader files live alongside their animation in a `shaders/` subdirectory unless they are general-purpose utilities (in which case they go in `src/primitives/shaders.ts`).

**Uniform naming**: Shader uniforms mirror the parameter interface names, prefixed with `u_` to distinguish from varyings and attributes.

```glsl
// fragment.glsl
uniform float u_turbulence;
uniform float u_warmth;
uniform float u_amplitude;   // from AudioBridge
uniform vec2 u_resolution;
uniform float u_time;
```

**Common utility shaders** (keep in `src/primitives/shaders.ts`):
- Simplex noise (2D, 3D)
- SDF primitives (circle, box, line, polygon)
- Rotation and reflection matrices
- Color space conversions (RGB to HSV, OKLab, OKLCH)
- Polar coordinate transforms

## Aesthetic Principles

These guide all visual design decisions in the project. When in doubt, refer back to these:

1. **Contemplative quality.** Animations should invite sustained watching, not demand attention through flashy spectacle. Gentle, hypnotic motion is the goal.

2. **Organic imperfection.** Even mathematical structures should breathe. Introduce subtle noise, asymmetry, or drift to avoid sterile perfection. A perfectly symmetric mandala feels less alive than one with micro-variations.

3. **Emergent complexity.** Simple rules producing complex, surprising results. The beauty comes from the system's behavior, not from manually placed elements.

4. **Audio as breath.** When audio-reactive, the animation should feel like it is listening and breathing with the music, not mechanically twitching to every transient. Smoothing and easing are essential. The `AudioBridge`'s smoothed amplitude exists for this reason.

5. **Sacred geometry as emergence.** Patterns like the flower of life, vesica piscis, or golden spiral should arise naturally from the underlying math, not be stamped on as static overlays.

6. **Perceptual color harmony.** Use OKLab or OKLCH color spaces for interpolation. RGB lerping produces muddy mid-tones. Palettes should feel natural and harmonious, as if they belong to a place or time of day.

7. **Restraint.** When uncertain, do less. A minimal animation with elegant motion is better than a busy one with every effect enabled. Let negative space work.

## Accessibility Best Practices

### WCAG-Compliant Controls

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
- Consider `prefers-reduced-motion` media query for users sensitive to animation

## Testing Patterns

### 1. Deterministic Noise Functions

Control noise output for predictable tests:

```typescript
describe("calculateWavePoint", () => {
  test("depth affects wave height due to perspective", () => {
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
test("handles zero amplitude without division by zero", () => {
  const result = shouldRenderFoam(10, 0, 0.7);
  expect(result).toBe(false);
  expect(Number.isNaN(result)).toBe(false);
});

test("clamps depthScale to prevent negative scaling for large z values", () => {
  const config = { ...DEFAULT_OCEAN_CONFIG, perspective: 0.6 };
  const waveHeight = calculateWavePoint(0, 4, 0, config, constantNoise);

  // Should not invert (go negative) for layers >= 2
  expect(waveHeight).toBe(0);
});
```

**Edge cases to always test:**
- Division by zero (amplitude = 0, threshold = 1)
- Negative values (amplitude, perspective)
- Boundary values (threshold = 0, threshold = 1)
- Large depth values (z > expected range)
- NaN propagation (ensure no NaN reaches the draw loop)

### 3. Test Structure

Organize tests by domain:

```typescript
describe("OceanWaves", () => {
  describe("Configuration", () => {
    test("should export default configuration", () => {});
  });

  describe("Wave Calculations", () => {
    test("should calculate wave point at position", () => {});
    test("should handle negative amplitudes correctly", () => {});
  });

  describe("Foam Rendering", () => {
    test("should determine foam rendering based on threshold", () => {});
    test("foam should appear on wave crests", () => {});
  });
});
```

### 4. Testing Audio-Reactive Behavior

Use mock `AudioFrame` objects to test animations that respond to sound:

```typescript
import type { AudioFrame } from "../../core/types";

const silence: AudioFrame = {
  amplitude: 0, rawAmplitude: 0,
  spectrum: new Float32Array(1024),
  bands: { subBass: 0, bass: 0, mid: 0, high: 0, presence: 0, brilliance: 0 },
  beat: false, spectralCentroid: 0, bpm: 0,
};

test("bass energy increases wave amplitude", () => {
  const baseHeight = computeModulatedHeight(params, silence);
  const bassFrame = { ...silence, bands: { ...silence.bands, bass: 0.9 } };
  const boostedHeight = computeModulatedHeight(params, bassFrame);
  expect(boostedHeight).toBeGreaterThan(baseHeight);
});
```

## File Naming Conventions

```text
src/primitives/geometry.ts       # Shared primitive (camelCase)
src/animations/ocean-waves/      # Animation directory (kebab-case)
  oceanWaves.ts                  # Utility logic (camelCase)
  oceanWaves.test.ts             # Unit tests (*.test.ts suffix)
  parameters.ts                  # Parameter interface
  shaders/                       # Co-located GLSL files
    foam.frag                    # Fragment shader
    foam.vert                    # Vertex shader
src/components/apps/
  OceanWaves.svelte              # Svelte component (PascalCase)
src/content/apps/
  ocean-waves.mdx                # Documentation page (kebab-case)
```

## Performance Checklist

When creating new P5.js animations, verify:

- [ ] Cache static backgrounds in `p5.Graphics` buffers; recreate only on resize
- [ ] Read audio buffers once per frame via `AudioBridge.getFrame()` (not per layer/particle)
- [ ] Use `p.push()`/`p.pop()` for transform isolation
- [ ] Minimize `p.fill()` and `p.stroke()` state changes; batch by color
- [ ] Pre-allocate arrays and reuse objects in the draw loop; avoid allocations that trigger GC
- [ ] Use object pooling for particle systems (see `src/primitives/particles.ts`)
- [ ] Prefer shaders over CPU pixel manipulation for post-processing (blur, bloom, feedback)
- [ ] Use `p.WEBGL` only when depth or shaders are needed (higher overhead than 2D)
- [ ] Consider `p.noSmooth()` for pixel art styles
- [ ] Profile with Chrome DevTools Performance tab; target 60fps at 1080p on mid-range hardware

## Adding a New Animation

1. **Create directory**: `src/animations/your-animation-name/`

2. **Define parameters** (`parameters.ts`):
   ```typescript
   import type { ParameterInterface } from "../../core/types";

   export const parameters: ParameterInterface = {
     // Define semantic parameters with groups, ranges, and audioMappable flags
   };
   ```

3. **Create utility file** (`yourAnimation.ts`):
   ```typescript
   import { polarToCartesian } from "../../primitives/geometry";
   // Import from primitives first; write animation-specific logic here

   export interface YourAnimationConfig { /* internal runtime config */ }

   export function paramsToConfig(params: Record<string, number>): YourAnimationConfig {
     // Map semantic parameter names to internal config
   }

   export function calculateSomething(
     param: number,
     config: YourAnimationConfig,
     noiseFunc: (x: number, y: number, z: number) => number
   ): number {
     // Pure calculation logic
   }
   ```

4. **Create test file** (`yourAnimation.test.ts`):
   ```typescript
   import { describe, test, expect } from "vitest";
   import { calculateSomething, paramsToConfig } from "./yourAnimation";
   import { parameters } from "./parameters";

   // Build default config from parameter defaults
   const defaultParams = Object.fromEntries(
     Object.entries(parameters).map(([k, v]) => [k, v.default])
   );
   const config = paramsToConfig(defaultParams);

   describe("YourAnimation", () => {
     test("should calculate correctly with defaults", () => {
       const result = calculateSomething(10, config, () => 0.5);
       expect(result).toBeDefined();
       expect(Number.isNaN(result)).toBe(false);
     });
   });
   ```

5. **Create Svelte component** (`src/components/apps/YourAnimation.svelte`):
   ```svelte
   <script lang="ts">
     import { onMount, onDestroy } from "svelte";
     import type p5 from "p5";
     import { calculateSomething, paramsToConfig } from "../../animations/your-animation-name/yourAnimation";
     import { parameters } from "../../animations/your-animation-name/parameters";
     import { AudioBridge } from "../../core/AudioBridge";

     let canvasContainer = $state<HTMLDivElement>();
     let p5Instance: p5;
     const audioBridge = new AudioBridge();

     onMount(async () => {
       const p5Module = await import("p5");
       const P5 = p5Module.default;

       const sketch = (p: p5) => {
         p.setup = () => {
           p.createCanvas(800, 600);
         };

         p.draw = () => {
           const audio = audioBridge.getFrame();
           const config = paramsToConfig(currentParams);
           // Render using config and audio
         };

         p.windowResized = () => {
           p.resizeCanvas(p.windowWidth, p.windowHeight);
         };
       };

       p5Instance = new P5(sketch, canvasContainer);
     });

     onDestroy(() => {
       p5Instance?.remove();
       audioBridge?.dispose();
     });
   </script>

   <div bind:this={canvasContainer} class="w-full h-full"></div>
   ```

6. **Write animation README** (`src/animations/your-animation-name/README.md`):
   - Describe the aesthetic concept and mathematical foundation
   - Explain each parameter in plain language
   - Suggest audio mappings (e.g., "map bass to swell for ocean-like breathing")

7. **Add to primitives if needed**: If you wrote a utility function that would be useful to other animations, move it to the appropriate `src/primitives/` module and add tests.

8. **Run tests**:
   ```bash
   npm run test        # Watch mode
   npm run test:run    # Single run
   npm run test:ui     # UI mode
   ```

## Changelog

Track significant convention changes here so returning developers know what shifted.

| Date       | Change                                                            |
| ---------- | ----------------------------------------------------------------- |
| 2026-02-10 | Added declarative parameter interface (`ParameterDef`) convention |
| 2026-02-10 | Added AudioBridge abstraction and `AudioFrame` interface          |
| 2026-02-10 | Added shared primitives library convention (`src/primitives/`)    |
| 2026-02-10 | Added animation lifecycle hooks documentation                     |
| 2026-02-10 | Added aesthetic principles section                                |
| 2026-02-10 | Added shader co-location and uniform naming conventions           |
| 2026-02-10 | Added parameter naming guidelines (semantic over implementation)  |
| 2026-02-10 | Added mock audio testing patterns                                 |
| 2026-02-10 | Initial conventions established                                   |

## Further Reading

- [P5.js Reference](https://p5js.org/reference/)
- [Web Audio API Guide](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [Svelte 5 Runes](https://svelte.dev/docs/svelte/overview)
- [Vitest Testing Guide](https://vitest.dev/guide/)
- [Perlin Noise (Wikipedia)](https://en.wikipedia.org/wiki/Perlin_noise)
- [OKLab Perceptual Color Space](https://bottosson.github.io/posts/oklab/) (Björn Ottosson)
- [The Book of Shaders](https://thebookofshaders.com/) (GLSL fundamentals)
- [Inigo Quilez - SDF Functions](https://iquilezles.org/articles/distfunctions2d/) (signed distance fields)

## Contributing

When modifying animation utilities:

1. Check `src/primitives/` for existing functions before writing new ones
2. Update tests to reflect behavior changes
3. Ensure all tests pass (`npm run test:run`)
4. Verify production build (`npm run build`)
5. Follow TypeScript strict mode guidelines
6. Document new idioms in this README
7. Add JSDoc comments explaining **why** (not just **what**)
8. Update the changelog table above with significant convention changes

