<script lang="ts">
    import { onMount, onDestroy } from "svelte";
    import { HarmonicsEngine, INTERVAL_NAMES } from "./harmonics";

    // Initialize engine
    const engine = new HarmonicsEngine();
    const CANVAS_HEIGHT = 180;

    // State
    let harmonics = $state(engine.getState().harmonics);
    let isPlaying = $state(false);
    let fundamentalFreq = $state(220);
    let masterVolume = $state(50); // 0-100 for slider
    let activeCount = $derived(harmonics.filter((h) => h.active).length);

    // Canvas refs
    let canvas: HTMLCanvasElement;
    let animationId: number | null = null;
    let ctx: CanvasRenderingContext2D | null = null;

    function togglePlay() {
        isPlaying = engine.togglePlay();
        if (isPlaying) {
            drawWaveform();
        } else {
            if (animationId) cancelAnimationFrame(animationId);
            drawWaveform();
        }
    }

    function toggleHarmonic(index: number) {
        engine.toggleHarmonic(index);
        harmonics = [...engine.getState().harmonics];
        if (!isPlaying) drawWaveform();
    }

    function handleFreqChange(e: Event) {
        const val = Number((e.target as HTMLInputElement).value);
        fundamentalFreq = val;
        engine.setFrequency(val);
        if (!isPlaying) drawWaveform();
    }

    function handleMasterVolChange(e: Event) {
        const val = Number((e.target as HTMLInputElement).value);
        masterVolume = val;
        engine.setMasterVolume(val / 100);
    }

    function handleHarmonicVolChange(index: number, e: Event) {
        const val = Number((e.target as HTMLInputElement).value);
        harmonics[index].volume = val / 100;
        engine.setHarmonicVolume(index, val / 100);
        harmonics = [...harmonics];
        if (!isPlaying) drawWaveform();
    }

    function drawWaveform() {
        if (!canvas || !ctx) return;

        const width = canvas.width / (window.devicePixelRatio || 1);
        const height = CANVAS_HEIGHT;

        ctx.fillStyle = "#06080c";
        ctx.fillRect(0, 0, width, height);

        // Grid
        ctx.strokeStyle = "rgba(30, 40, 54, 0.5)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let y = 0; y < height; y += 30) {
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
        }
        ctx.stroke();

        // Center
        ctx.strokeStyle = "rgba(30, 40, 54, 0.8)";
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();

        if (isPlaying) {
            const analyser = engine.getAnalyser();
            if (analyser) {
                const bufferLength = analyser.fftSize;
                const dataArray = new Float32Array(bufferLength);
                analyser.getFloatTimeDomainData(dataArray);

                ctx.strokeStyle = "#00e8b8";
                ctx.lineWidth = 2;
                ctx.beginPath();

                const sliceWidth = width / dataArray.length;
                let x = 0;

                for (let i = 0; i < dataArray.length; i++) {
                    const v = dataArray[i] * 2;
                    const y = height / 2 + (v * height) / 2;

                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                    x += sliceWidth;
                }
                ctx.stroke();

                // Glow
                ctx.strokeStyle = "rgba(0, 232, 184, 0.3)";
                ctx.lineWidth = 6;
                ctx.stroke();

                animationId = requestAnimationFrame(drawWaveform);
            }
        } else {
            drawPreviewWaveform(width, height);
        }
    }

    function drawPreviewWaveform(width: number, height: number) {
        if (!ctx) return;
        const freq = fundamentalFreq;
        const samples = 1000;
        const cycles = 4;

        ctx.strokeStyle = "rgba(0, 232, 184, 0.6)";
        ctx.lineWidth = 2;
        ctx.beginPath();

        for (let i = 0; i < samples; i++) {
            const t = ((i / samples) * cycles) / freq;
            let y = 0;
            let totalWeight = 0;

            harmonics.forEach((h, idx) => {
                if (h.active) {
                    const harmonicFreq = freq * (idx + 1);
                    y += h.volume * Math.sin(2 * Math.PI * harmonicFreq * t);
                    totalWeight += h.volume;
                }
            });

            if (totalWeight > 0) y /= totalWeight;

            const x = (i / samples) * width;
            const yPos = height / 2 + y * height * 0.4;

            if (i === 0) ctx.moveTo(x, yPos);
            else ctx.lineTo(x, yPos);
        }
        ctx.stroke();
    }

    function resizeCanvas() {
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        canvas.width = rect.width * dpr;
        canvas.height = CANVAS_HEIGHT * dpr;
        ctx = canvas.getContext("2d");
        if (ctx) ctx.scale(dpr, dpr);
        drawWaveform();
    }

    onMount(() => {
        resizeCanvas();
        window.addEventListener("resize", resizeCanvas);
    });

    onDestroy(() => {
        if (typeof window !== "undefined") {
            window.removeEventListener("resize", resizeCanvas);
        }
        if (animationId) cancelAnimationFrame(animationId);
        engine.stop();
    });
</script>

<div class="harmonics-app p-4 md:p-8 bg-[#06080c] text-[#e8ecf4] font-sans">
    <div class="max-w-6xl mx-auto">
        <header class="text-center mb-8 md:mb-12">
            <h1
                class="font-mono text-3xl md:text-5xl font-bold tracking-tight mb-3"
            >
                <span class="text-[#00e8b8]">Harmonic</span> Series
            </h1>
            <p class="text-base md:text-lg max-w-2xl mx-auto text-[#6b7a8c]">
                The building blocks of all musical sound. Toggle harmonics to
                shape the timbre.
            </p>
        </header>

        <div class="info-card rounded-2xl p-4 md:p-6 mb-6">
            <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-3">
                    <div
                        class="w-3 h-3 rounded-full transition-colors duration-300"
                        class:pulse-indicator={isPlaying}
                        style:background-color={isPlaying
                            ? "#00e8b8"
                            : "#6b7a8c"}
                    ></div>
                    <span class="font-mono text-sm text-[#6b7a8c]"
                        >WAVEFORM</span
                    >
                </div>
                <div class="font-mono text-sm text-[#6b7a8c]">
                    <span>{activeCount}</span> harmonics active
                </div>
            </div>
            <canvas
                bind:this={canvas}
                class="w-full rounded-xl"
                style="background: #06080c; height: {CANVAS_HEIGHT}px;"
            >
            </canvas>
        </div>

        <div class="grid md:grid-cols-3 gap-4 md:gap-6 mb-6">
            <div class="info-card rounded-2xl p-4 md:p-6">
                <h3
                    class="font-mono text-xs tracking-wider mb-4 text-[#6b7a8c]"
                >
                    MASTER CONTROLS
                </h3>

                <div class="mb-5">
                    <label class="flex items-center justify-between mb-2">
                        <span class="text-sm">Fundamental</span>
                        <span class="font-mono text-sm text-[#00e8b8]"
                            >{fundamentalFreq} Hz</span
                        >
                    </label>
                    <input
                        type="range"
                        min="55"
                        max="440"
                        value={fundamentalFreq}
                        oninput={handleFreqChange}
                        class="volume-slider"
                        aria-label="Fundamental frequency"
                    />
                </div>

                <div class="mb-5">
                    <label class="flex items-center justify-between mb-2">
                        <span class="text-sm">Master Volume</span>
                        <span class="font-mono text-sm text-[#00e8b8]"
                            >{masterVolume}%</span
                        >
                    </label>
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={masterVolume}
                        oninput={handleMasterVolChange}
                        class="volume-slider"
                        aria-label="Master volume"
                    />
                </div>

                <button
                    onclick={togglePlay}
                    class="play-btn w-full py-4 rounded-xl font-mono font-bold text-sm tracking-wider flex items-center justify-center gap-2 transition-transform border border-[#1e2836] text-[#e8ecf4]"
                    style:background={isPlaying
                        ? "linear-gradient(135deg, #ff7844 0%, #cc5020 100%)"
                        : "#121820"}
                    aria-label={isPlaying ? "Stop sound" : "Play sound"}
                >
                    {#if isPlaying}
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            ><rect x="6" y="4" width="4" height="16" /><rect
                                x="14"
                                y="4"
                                width="4"
                                height="16"
                            /></svg
                        >
                        <span>STOP</span>
                    {:else}
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            ><polygon points="5,3 19,12 5,21" /></svg
                        >
                        <span>PLAY</span>
                    {/if}
                </button>
            </div>

            <div class="md:col-span-2 info-card rounded-2xl p-4 md:p-6">
                <h3
                    class="font-mono text-xs tracking-wider mb-4 text-[#6b7a8c]"
                >
                    HARMONICS (1-16)
                </h3>
                <div class="grid grid-cols-4 md:grid-cols-8 gap-2 md:gap-3">
                    {#each harmonics as h, i}
                        <button
                            class="harmonic-btn p-3 rounded-xl font-mono font-bold text-sm border transition-all duration-200"
                            class:active={h.active}
                            style:border-color={h.active
                                ? "transparent"
                                : "#1e2836"}
                            style:background={h.active ? "" : "#06080c"}
                            onclick={() => toggleHarmonic(i)}
                            aria-label={`Toggle harmonic ${h.number}`}
                            aria-pressed={h.active}
                        >
                            {h.number}
                        </button>
                    {/each}
                </div>
            </div>
        </div>

        <div class="info-card rounded-2xl p-4 md:p-6">
            <h3 class="font-mono text-xs tracking-wider mb-4 text-[#6b7a8c]">
                HARMONIC DETAILS
            </h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                {#each harmonics as h, i}
                    <div
                        class="p-3 rounded-xl transition-all duration-200"
                        style:background={h.active ? "#121820" : "#06080c"}
                        style:border={`1px solid ${h.active ? "#00e8b8" : "#1e2836"}`}
                        style:opacity={h.active ? "1" : "0.5"}
                    >
                        <div class="flex items-center justify-between mb-2">
                            <span
                                class="font-mono font-bold text-lg"
                                style:color={h.active ? "#00e8b8" : "#6b7a8c"}
                                >#{h.number}</span
                            >
                            <span class="text-xs text-[#6b7a8c]"
                                >{INTERVAL_NAMES[i]}</span
                            >
                        </div>
                        <div class="font-mono text-xs mb-2 text-[#6b7a8c]">
                            {(fundamentalFreq * (i + 1)).toFixed(1)} Hz
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={Math.round(h.volume * 100)}
                            oninput={(e) => handleHarmonicVolChange(i, e)}
                            class="volume-slider"
                            disabled={!h.active}
                            style:opacity={h.active ? 1 : 0.3}
                            aria-label={`Volume for harmonic ${h.number}`}
                        />
                    </div>
                {/each}
            </div>
        </div>

        <div class="mt-8 text-center text-[#6b7a8c] text-sm">
            <p>
                The harmonic series consists of frequencies at integer multiples
                of a fundamental. Each combination creates a unique timbre.
            </p>
        </div>
    </div>
</div>

<style>
    .info-card {
        background: linear-gradient(135deg, #0c1018 0%, #121820 100%);
        border: 1px solid #1e2836;
    }

    .harmonic-btn.active {
        background: linear-gradient(
            135deg,
            #00e8b8 0%,
            #00a080 100%
        ) !important;
        color: #06080c;
        box-shadow:
            0 0 24px rgba(0, 232, 184, 0.15),
            0 0 48px rgba(0, 232, 184, 0.15);
    }

    .harmonic-btn:not(.active):hover {
        background: #121820 !important;
        border-color: #00e8b8 !important;
    }

    .volume-slider {
        -webkit-appearance: none;
        appearance: none;
        background: transparent;
        cursor: pointer;
        width: 100%;
    }

    .volume-slider::-webkit-slider-track {
        height: 4px;
        background: #1e2836;
        border-radius: 2px;
    }

    .volume-slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 14px;
        height: 14px;
        background: #00e8b8;
        border-radius: 50%;
        margin-top: -5px;
        transition: transform 0.15s ease;
    }

    .volume-slider::-webkit-slider-thumb:hover {
        transform: scale(1.2);
    }

    .volume-slider::-moz-range-track {
        height: 4px;
        background: #1e2836;
        border-radius: 2px;
    }

    .volume-slider::-moz-range-thumb {
        width: 14px;
        height: 14px;
        background: #00e8b8;
        border-radius: 50%;
        border: none;
    }

    .play-btn:hover {
        transform: scale(1.05);
        box-shadow: 0 0 32px rgba(0, 232, 184, 0.15);
    }

    .play-btn:active {
        transform: scale(0.98);
    }

    .pulse-indicator {
        animation: pulse 1.5s ease-in-out infinite;
    }

    @keyframes pulse {
        0%,
        100% {
            opacity: 1;
        }
        50% {
            opacity: 0.5;
        }
    }
</style>
