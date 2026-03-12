<script lang="ts">
  import MixFrameworkRuleItem from "./MixFrameworkRuleItem.svelte";
  import {
    TABS,
    phase0,
    phase1Elements,
    phase2,
    sequencePhases,
    monoChecks,
    type TabId,
    type SpectrumBand,
  } from "./mixFramework";

  let activeTab: TabId = $state("sequence");
  let activeEl = $state(0);
  let el = $derived(phase1Elements[activeEl]);
</script>

{#snippet tag(text: string, color: string)}
  <span
    class="text-xs font-mono tracking-wide px-2 py-0.5 rounded"
    style:color
    style:background-color={`${color}18`}
    style:border={`1px solid ${color}40`}
  >
    {text}
  </span>
{/snippet}

{#snippet spectrumMap(bands: SpectrumBand[])}
  <div class="mb-6">
    <p class="text-xs font-mono uppercase tracking-widest text-gray-500 mb-2">
      Frequency Regions — Assign Before EQ
    </p>
    <div class="flex gap-px h-7 mb-2">
      {#each bands as band, i}
        <div
          class="flex items-center justify-center"
          style:background={`${band.color}22`}
          style:border={`1px solid ${band.color}44`}
          style:flex={i < 2 ? 1 : i < 4 ? 1.5 : 2}
        >
          <span class="text-xs font-mono" style:color={band.color}
            >{band.name}</span
          >
        </div>
      {/each}
    </div>
    <div class="flex gap-px">
      {#each bands as band, i}
        <div class="pr-1" style:flex={i < 2 ? 1 : i < 4 ? 1.5 : 2}>
          <div class="text-xs text-gray-400 leading-tight">{band.range}</div>
          <div class="text-xs text-gray-500 leading-tight mt-0.5">
            {band.owner}
          </div>
        </div>
      {/each}
    </div>
  </div>
{/snippet}

<div class="w-full">
  <!-- Tab bar -->
  <div
    class="border-b border-gray-800 flex overflow-x-auto overflow-y-hidden mb-6"
    role="tablist"
  >
    {#each TABS as tab}
      <button
        id={`tab-${tab.id}`}
        role="tab"
        aria-selected={activeTab === tab.id}
        aria-controls={`panel-${tab.id}`}
        tabindex={activeTab === tab.id ? 0 : -1}
        onclick={() => (activeTab = tab.id as TabId)}
        class="px-4 py-3 flex flex-col gap-0.5 -mb-px cursor-pointer bg-transparent border-t-0 border-x-0 transition-colors shrink-0"
        style:border-bottom={activeTab === tab.id
          ? `2px solid ${tab.color ?? "white"}`
          : "2px solid transparent"}
      >
        <span
          class="text-sm font-mono tracking-wider transition-colors whitespace-nowrap"
          class:text-gray-200={activeTab === tab.id}
          class:text-gray-500={activeTab !== tab.id}
          style:color={activeTab === tab.id && tab.color
            ? tab.color
            : undefined}
        >
          {tab.label}
        </span>
        <span
          class="text-xs tracking-wide transition-colors"
          class:text-gray-400={activeTab === tab.id}
          class:text-gray-600={activeTab !== tab.id}
        >
          {tab.sublabel}
        </span>
      </button>
    {/each}
  </div>

  <!-- Content -->
  <div>
    <!-- SEQUENCE VIEW -->
    {#if activeTab === "sequence"}
      <div
        id="panel-sequence"
        role="tabpanel"
        aria-labelledby="tab-sequence"
        class="w-full"
      >
        <p
          class="text-xs font-mono uppercase tracking-widest text-gray-500 mb-6"
        >
          Macro → Micro — Highest impact decisions first
        </p>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-px items-stretch">
          {#each sequencePhases as ph}
            <div class="flex flex-col">
              <div
                class="px-3 py-2 border-b-0"
                style:background={`${ph.color}18`}
                style:border={`1px solid ${ph.color}33`}
              >
                <div
                  class="text-xs font-mono tracking-wider"
                  style:color={ph.color}
                >
                  {ph.label}
                </div>
                <div class="text-sm text-gray-400 mt-0.5">{ph.name}</div>
              </div>
              <div class="p-3 border border-t-0 border-gray-800 flex-1">
                {#each ph.steps as step, si}
                  <div
                    class="flex gap-2 items-start"
                    class:mb-2={si < ph.steps.length - 1}
                  >
                    <span class="text-sm mt-1 shrink-0" style:color={ph.color}
                      >▸</span
                    >
                    <span
                      class="text-base leading-snug"
                      class:text-gray-300={!step.startsWith("→")}
                      class:text-gray-500={step.startsWith("→")}
                      class:italic={step.startsWith("→")}
                    >
                      {step}
                    </span>
                  </div>
                {/each}
              </div>
            </div>
          {/each}
        </div>

        <div class="mt-8 pt-6 border-t border-gray-800">
          <p
            class="text-xs font-mono uppercase tracking-widest text-gray-500 mb-4"
          >
            Mono Check Schedule
          </p>
          {#each monoChecks as m, i}
            <div
              class="flex flex-col sm:flex-row gap-2 sm:gap-6 items-start pl-3 border-l-2 border-gray-700"
              class:mb-4={i < monoChecks.length - 1}
            >
              <span class="text-sm text-gray-300 sm:w-64 shrink-0 leading-snug"
                >{m.when}</span
              >
              <span class="text-sm text-gray-400 italic leading-snug"
                >{m.why}</span
              >
            </div>
          {/each}
        </div>
      </div>

      <!-- PHASE 0 VIEW -->
    {:else if activeTab === "phase0"}
      <div
        id="panel-phase0"
        role="tabpanel"
        aria-labelledby="tab-phase0"
        class="w-full"
      >
        <p
          class="text-base text-gray-400 italic leading-relaxed border-l-2 pl-3 mb-6"
          style:border-color={`${phase0.color}44`}
        >
          {phase0.tagline}
        </p>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
          {#each phase0.sections as sec}
            <div class="bg-gray-900 border border-gray-800 rounded-lg p-5">
              <div class="flex items-center gap-2 mb-4">
                <span style:color={phase0.color}>{sec.icon}</span>
                <span
                  class="text-xs font-mono uppercase tracking-wider"
                  style:color={phase0.color}>{sec.title}</span
                >
              </div>
              {#each sec.items as item}
                <MixFrameworkRuleItem
                  rule={item.rule}
                  detail={item.detail}
                  accentColor={phase0.color}
                />
              {/each}
            </div>
          {/each}
        </div>
      </div>

      <!-- PHASE 1 VIEW -->
    {:else if activeTab === "phase1"}
      <div
        id="panel-phase1"
        role="tabpanel"
        aria-labelledby="tab-phase1"
        class="flex flex-col sm:flex-row w-full gap-6"
      >
        <!-- Element nav sidebar -->
        <div
          class="sm:w-48 shrink-0 border-b sm:border-b-0 sm:border-r border-gray-800 pb-2 sm:pb-0"
        >
          <p
            class="text-xs font-mono uppercase tracking-widest text-gray-500 px-4 pb-3"
          >
            Elements
          </p>
          {#each phase1Elements as e, i}
            <button
              onclick={() => (activeEl = i)}
              class="flex items-center gap-2.5 w-full px-4 py-2.5 border-y-0 border-r-0 cursor-pointer text-left transition-colors"
              class:bg-gray-900={activeEl === i}
              style:border-left={activeEl === i
                ? `2px solid ${e.color}`
                : "2px solid transparent"}
              aria-pressed={activeEl === i}
            >
              <span
                class="text-xs font-mono w-4 shrink-0 transition-colors"
                class:text-gray-600={activeEl !== i}
                style:color={activeEl === i ? e.color : undefined}
              >
                {e.number}
              </span>
              <div>
                <div
                  class="text-sm transition-colors"
                  class:text-gray-200={activeEl === i}
                  class:text-gray-500={activeEl !== i}
                >
                  {e.name}
                </div>
                <div
                  class="text-xs transition-colors"
                  class:text-gray-400={activeEl === i}
                  class:text-gray-600={activeEl !== i}
                >
                  {e.subtitle}
                </div>
              </div>
            </button>
          {/each}
        </div>

        <!-- Element detail pane -->
        <div class="flex-1 min-w-0">
          <div class="flex items-baseline gap-4 mb-3">
            <span
              class="text-6xl font-bold text-gray-800 tracking-tighter select-none"
            >
              {el.number}
            </span>
            <div>
              <div
                class="text-xl font-semibold tracking-widest"
                style:color={el.color}
              >
                {el.name}
              </div>
              <div
                class="text-xs font-mono uppercase tracking-widest text-gray-500 mt-1"
              >
                {el.subtitle}
              </div>
            </div>
          </div>

          <p
            class="text-base text-gray-400 italic leading-relaxed border-l-2 pl-3 mb-5"
            style:border-color={`${el.color}33`}
          >
            {el.description}
          </p>

          {#if el.spectrum}
            {@render spectrumMap(el.spectrum.bands)}
          {/if}

          <div class="mb-5">
            <p
              class="text-xs font-mono uppercase tracking-widest text-gray-500 mb-3"
            >
              Rules
            </p>
            {#each el.rules as r}
              <MixFrameworkRuleItem
                rule={r.rule}
                detail={r.detail}
                accentColor={el.color}
              />
            {/each}
          </div>

          <div class="flex flex-col sm:flex-row gap-4 items-start">
            <div class="flex-1">
              <p
                class="text-xs font-mono uppercase tracking-widest text-gray-500 mb-2"
              >
                Tools
              </p>
              <div class="flex flex-wrap gap-1.5">
                {#each el.tools as t}
                  {@render tag(t, el.color)}
                {/each}
              </div>
            </div>
            <div
              class="flex-1 rounded-lg p-4"
              style:background={`${el.color}08`}
              style:border={`1px solid ${el.color}22`}
            >
              <p
                class="text-xs font-mono uppercase tracking-wider mb-2"
                style:color={el.color}
              >
                Key Insight
              </p>
              <p class="text-sm text-gray-400 italic leading-relaxed m-0">
                {el.insight}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- PHASE 2 VIEW -->
    {:else if activeTab === "phase2"}
      <div
        id="panel-phase2"
        role="tabpanel"
        aria-labelledby="tab-phase2"
        class="w-full"
      >
        <p
          class="text-base text-gray-400 italic leading-relaxed border-l-2 pl-3 mb-6"
          style:border-color={`${phase2.color}44`}
        >
          {phase2.tagline}
        </p>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
          {#each phase2.sections as sec}
            <div class="bg-gray-900 border border-gray-800 rounded-lg p-5">
              <div class="flex items-center gap-2 mb-4">
                <span style:color={phase2.color}>{sec.icon}</span>
                <span
                  class="text-xs font-mono uppercase tracking-wider"
                  style:color={phase2.color}>{sec.title}</span
                >
              </div>
              {#each sec.items as item}
                <MixFrameworkRuleItem
                  rule={item.rule}
                  detail={item.detail}
                  accentColor={phase2.color}
                />
              {/each}
            </div>
          {/each}
        </div>
      </div>
    {/if}
  </div>
</div>
