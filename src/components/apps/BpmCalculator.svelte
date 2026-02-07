<script lang="ts">
  import { calculateAllSubdivisions } from "../../utils/bpm";

  let bpm = $state(120);
  let subdivisions = $derived(calculateAllSubdivisions(bpm));

  // Validate BPM input
  function handleInput(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = Number(input.value);

    // Clamp BPM between 1 and 999
    if (value > 999) {
      value = 999;
    } else if (value < 1) {
      // Also handles NaN from empty input, setting it to a valid state.
      value = 1;
    }
    bpm = value;
  }

  // Table data structure - sorted by duration (longest to shortest)
  const tableData = $derived(
    [
      // Standard notes
      { label: "Whole Note", value: subdivisions.whole },
      { label: "Half Note", value: subdivisions.half },
      { label: "Quarter Note", value: subdivisions.quarter },
      { label: "Eighth Note", value: subdivisions.eighth },
      { label: "Sixteenth Note", value: subdivisions.sixteenth },
      { label: "32nd Note", value: subdivisions.thirtySecond },

      // Dotted variations
      { label: "Dotted Whole", value: subdivisions.dottedWhole },
      { label: "Dotted Half", value: subdivisions.dottedHalf },
      { label: "Dotted Quarter", value: subdivisions.dottedQuarter },
      { label: "Dotted Eighth", value: subdivisions.dottedEighth },
      { label: "Dotted Sixteenth", value: subdivisions.dottedSixteenth },

      // Triplet variations
      { label: "Whole Triplet", value: subdivisions.wholeTriplet },
      { label: "Half Triplet", value: subdivisions.halfTriplet },
      { label: "Quarter Triplet", value: subdivisions.quarterTriplet },
      { label: "Eighth Triplet", value: subdivisions.eighthTriplet },
      { label: "Sixteenth Triplet", value: subdivisions.sixteenthTriplet },
    ].sort((a, b) => b.value - a.value),
  );

  // Format milliseconds with 2 decimal places
  function formatMs(ms: number): string {
    return ms.toFixed(2);
  }
</script>

<div class="bpm-calculator">
  <div class="bpm-input-container">
    <label for="bpm-input" class="block text-sm font-medium text-gray-300 mb-2">
      Tempo (BPM)
    </label>
    <input
      id="bpm-input"
      type="number"
      min="1"
      max="999"
      value={bpm}
      oninput={handleInput}
      class="w-full sm:w-48 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      aria-label="Beats per minute"
    />
    <p class="mt-2 text-sm text-gray-400">
      Enter a tempo between 1 and 999 BPM
    </p>
  </div>

  <div class="table-container mt-8">
    <div class="overflow-x-auto">
      <table class="w-full border-collapse">
        <thead>
          <tr class="border-b border-gray-700">
            <th class="text-left py-3 px-4 text-gray-300 font-semibold">
              Note Type
            </th>
            <th class="text-right py-3 px-4 text-gray-300 font-semibold">
              Duration (ms)
            </th>
          </tr>
        </thead>
        <tbody>
          {#each tableData as row, index}
            <tr
              class="border-b border-gray-800 hover:bg-gray-900 transition-colors"
              class:bg-gray-950={index % 2 === 0}
            >
              <td class="py-3 px-4 text-gray-200">
                {row.label}
              </td>
              <td
                class="py-3 px-4 text-right font-mono text-blue-400 font-semibold"
              >
                {formatMs(row.value)}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>

  <div class="mt-8 p-4 bg-gray-900 rounded-lg border border-gray-700">
    <h3 class="text-sm font-semibold text-gray-300 mb-2">
      About This Calculator
    </h3>
    <p class="text-sm text-gray-400">
      This calculator converts tempo (BPM) to millisecond durations for various
      musical note subdivisions. Use these values for delay effects, sequencers,
      or synchronizing audio with visual elements.
    </p>
  </div>
</div>

<style>
  .bpm-calculator {
    max-width: 100%;
    padding: 1rem 0;
  }

  /* Remove spinner arrows from number input */
  input[type="number"]::-webkit-inner-spin-button,
  input[type="number"]::-webkit-outer-spin-button {
    -webkit-appearance: none;
    appearance: none;
    margin: 0;
  }

  input[type="number"] {
    -moz-appearance: textfield;
    appearance: textfield;
  }

  table {
    font-size: 0.9rem;
  }

  @media (max-width: 640px) {
    table {
      font-size: 0.85rem;
    }

    .py-3 {
      padding-top: 0.5rem;
      padding-bottom: 0.5rem;
    }
  }
</style>
