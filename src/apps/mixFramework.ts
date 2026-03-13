// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Brylie Christopher Oxley

// ── TYPES ─────────────────────────────────────────────────────────────────────

export interface RuleItemData {
  rule: string;
  detail: string;
}

export interface PhaseSection {
  title: string;
  icon: string;
  items: RuleItemData[];
}

export interface PhaseData {
  label: string;
  name: string;
  color: string;
  tagline: string;
  sections: PhaseSection[];
}

export interface SpectrumBand {
  name: string;
  range: string;
  owner: string;
  color: string;
}

export interface SpectrumData {
  bands: SpectrumBand[];
}

export interface StructureElement {
  number: string;
  name: string;
  subtitle: string;
  color: string;
  description: string;
  spectrum: SpectrumData | null;
  tools: string[];
  rules: RuleItemData[];
  insight: string;
}

export type TabId = "overview" | "foundation" | "structure" | "movement";

export interface TabDefinition {
  id: TabId;
  label: string;
  sublabel: string;
  color?: string;
}

export interface FrameworkLayer {
  label: string;
  name: string;
  color: string;
  steps: string[];
}

export interface MonoCheck {
  when: string;
  why: string;
}

// ── DATA ──────────────────────────────────────────────────────────────────────

export const TABS: TabDefinition[] = [
  { id: "overview", label: "OVERVIEW", sublabel: "How to use this" },
  {
    id: "foundation",
    label: "FOUNDATION",
    sublabel: "Throughout production",
    color: "#6FCF8A",
  },
  {
    id: "structure",
    label: "STRUCTURE",
    sublabel: "Core elements",
    color: "#4A9ED4",
  },
  {
    id: "movement",
    label: "MOVEMENT",
    sublabel: "Time & automation",
    color: "#CF6F6F",
  },
];

export const frameworkLayers: FrameworkLayer[] = [
  {
    label: "Foundation",
    name: "Throughout Production",
    color: "#6FCF8A",
    steps: [
      "Gain staging at source (clip to 0 dBFS)",
      "Load reference tracks, match LUFS",
      "Set rough fader balance",
      "Group tracks logically",
      "Mono check before finishing session",
    ],
  },
  {
    label: "Structure",
    name: "Core Elements — Ordered by Impact",
    color: "#4A9ED4",
    steps: [
      "01 — Balance: highest impact; establish before anything else",
      "02 — Frequency: assign regions, EQ, high-pass",
      "03 — Panorama: pan placement, M/S width",
      "04 — Dimension: reverb/delay placement",
      "05 — Dynamics: compression, transient shaping",
      "→ Revisit any element when new sounds are introduced",
    ],
  },
  {
    label: "Movement",
    name: "Time & Automation",
    color: "#CF6F6F",
    steps: [
      "Interest: volume automation first, then sends and filters",
      "Section-level balance automation",
      "Reverb send rides and throws",
      "Filter and tonal automation",
      "Final mono check at mix peak",
      "LUFS / true peak check (−14 LUFS / −1 dBTP)",
      "Three-system playback check",
    ],
  },
];

export const monoChecks: MonoCheck[] = [
  {
    when: "End of production session",
    why: "Catch phase issues before they compound into the mix",
  },
  {
    when: "After Balance + Frequency (Structure, elements 1–2)",
    why: "Low-end decisions must be mono-safe before proceeding",
  },
  {
    when: "After Panorama (Structure, element 3)",
    why: "Confirm stereo width is real, not phase artefact",
  },
  {
    when: "After all Structure elements are settled",
    why: "Static mix must be solid in mono before automation begins",
  },
  {
    when: "At the peak moment in Movement",
    why: "Automation shifts M/S balance over time — check at the loudest, densest point",
  },
];

export const foundation: PhaseData = {
  label: "FOUNDATION",
  name: "Throughout Production",
  color: "#6FCF8A",
  tagline:
    "Habits that apply from the first sound to the final export. Return to these whenever a new element is introduced or a sound changes significantly.",
  sections: [
    {
      title: "Gain Staging",
      icon: "◈",
      items: [
        {
          rule: "Clip to 0 dBFS at the source",
          detail:
            "Record hot enough to avoid noise floor; trim before any processing so plugins receive signal in their intended range.",
        },
        {
          rule: "Floating-point headroom is large, but internal clipping is still possible",
          detail:
            "Modern DAWs use 32 or 64-bit floating point internally, providing wide headroom between plugins. However, clipping can still occur inside the session: analog-modeled plugins emulate real hardware saturation circuits and will distort when driven too hard, and some plugins operate on fixed-point or integer math internally. The DAC output and the final exported file are the most critical clipping points, but maintaining sensible levels throughout the chain protects plugin behavior and ensures intentional — not accidental — saturation.",
        },
        {
          rule: "Channel peaks at −18 dBFS average",
          detail:
            "This maps 0 dBFS digital to nominal 0 VU analogue. Gives headroom for transients and downstream processing.",
        },
        {
          rule: "No plugin input overloads",
          detail:
            "Saturation and distortion are choices, not accidents. Set input gain before the plugin, not the plugin's output trim.",
        },
        {
          rule: "Gain stage after every plugin in the chain",
          detail:
            "Compensate for gain added or lost at each step. Keep levels consistent so comparative bypass makes sense.",
        },
      ],
    },
    {
      title: "Reference Tracks",
      icon: "◉",
      items: [
        {
          rule: "Load references at the start, not the end",
          detail:
            "References inform decisions throughout, not just at the 'does this sound good?' check. Match their gain with a utility plugin.",
        },
        {
          rule: "Match perceived loudness before comparing",
          detail:
            "Louder always sounds better. Use REFERENCE plugin or manually match LUFS before A/B listening.",
        },
        {
          rule: "Pick 2–3 references in your genre",
          detail:
            "One for tonal balance, one for dynamic feel, one for spatial width. Ambient references differ significantly from pop.",
        },
        {
          rule: "Use tonal target curves to identify structural deficits",
          detail:
            "Genre-based tonal curves reveal systematic problems — a low-mid excess in ambient is common (too much warmth, not enough clarity); a high-end excess in electronic is common (harsh without air). Use these as diagnostic tools, not targets to hit exactly.",
        },
      ],
    },
    {
      title: "Rough Balance",
      icon: "◫",
      items: [
        {
          rule: "Set fader positions before any mix session",
          detail:
            "A 2-minute rough balance at the start of each session resets your ears and establishes a working baseline.",
        },
        {
          rule: "Mute, don't delete questionable layers",
          detail:
            "What you mute during production often comes back later. Decision-deferred is better than decision-lost.",
        },
        {
          rule: "Group tracks logically before mixing",
          detail:
            "Drums, bass, keys, pads, leads, FX. Grouping tracks makes Structure decisions faster and more coherent.",
        },
      ],
    },
    {
      title: "Mono Check Habit",
      icon: "◐",
      items: [
        {
          rule: "Check mono at the end of every production session",
          detail:
            "Catches phase issues early, before they compound. Use a Mono utility on the master bus momentarily.",
        },
        {
          rule: "Bass and kick must survive mono intact",
          detail:
            "If the low end collapses or thins, address it during production — not at mix-down.",
        },
      ],
    },
  ],
};

export const structureElements: StructureElement[] = [
  {
    number: "01",
    name: "Balance",
    subtitle: "Volume & Level",
    color: "#4A9ED4",
    description:
      "The relative loudness of every element. The highest-impact decision in any mix — return to this whenever a new sound enters the arrangement.",
    spectrum: null,
    tools: ["Faders", "VCA groups", "Gain utility"],
    rules: [
      {
        rule: "Set rough balance before touching EQ or compression",
        detail:
          "Your ears will lie to you if you EQ an unbalanced mix. Balance first, always.",
      },
      {
        rule: "Mix at low volumes — around 75–80 dB SPL",
        detail:
          "Low volumes expose balance problems. Loud volumes make everything sound better than it is.",
      },
      {
        rule: "Leave 6 dB headroom on the master bus",
        detail:
          "Leaves room for mix bus processing and mastering. Don't ride the limiter during mixing.",
      },
      {
        rule: "Kick and bass together anchor everything",
        detail:
          "The relationship between kick and bass defines the energy of the whole mix. Get this pair right before moving on.",
      },
      {
        rule: "Clip peaks, don't limit them, when preserving transient snap",
        detail:
          "A hard clipper truncates the waveform instantly — the ear perceives the added harmonics as edge or clarity. A limiter uses attack and release, which can soften punch. Use clipping on individual tracks and subgroups; reserve limiting for the master bus.",
      },
      {
        rule: "Use VCA/group faders for section moves",
        detail:
          "Automation of individual faders is fragile. Group-level moves preserve internal balance while shaping the mix.",
      },
      {
        rule: "Unmask buried elements by pulling competitors down",
        detail:
          "If a melody or vocal is getting lost, try lowering the elements competing with it before reaching for a boost. Subtraction reveals; addition accumulates.",
      },
    ],
    insight:
      "A great balance is 80% of a mix. The remaining five elements are refinement.",
  },
  {
    number: "02",
    name: "Frequency",
    subtitle: "EQ & Tonal Space",
    color: "#D4CF4A",
    description:
      "How the mix occupies the spectrum. Every element needs its own region — overlapping claims cause masking.",
    spectrum: {
      bands: [
        {
          name: "Sub",
          range: "20–60 Hz",
          owner: "Kick body, bass fundamental",
          color: "#E05555",
        },
        {
          name: "Bass",
          range: "60–200 Hz",
          owner: "Bass, kick weight, piano low end",
          color: "#E07A55",
        },
        {
          name: "Low-mid",
          range: "200–600 Hz",
          owner: "Warmth, muddiness risk zone",
          color: "#D4CF4A",
        },
        {
          name: "Mid",
          range: "600 Hz–2 kHz",
          owner: "Presence, intelligibility, piano body",
          color: "#6FCF8A",
        },
        {
          name: "High-mid",
          range: "2–8 kHz",
          owner: "Clarity, edge, attack of transients",
          color: "#4A9ED4",
        },
        {
          name: "Air",
          range: "8–20 kHz",
          owner: "Sparkle, breath, room",
          color: "#A07ED4",
        },
      ],
    },
    tools: ["Parametric EQ", "High-pass / Low-pass", "Dynamic EQ", "M/S EQ"],
    rules: [
      {
        rule: "Cut first, boost second",
        detail:
          "Subtractive EQ removes problem content. Additive EQ adds new content. Start by removing what doesn't belong.",
      },
      {
        rule: "High-pass everything that doesn't need low end",
        detail:
          "Pads, room mics, guitars — even small sub content from unexpected sources accumulates fast.",
      },
      {
        rule: "One element owns each frequency region",
        detail:
          "Before EQing, decide who owns what. Then protect that ownership with complementary cuts on competing elements.",
      },
      {
        rule: "Unmask by cutting the masker, not boosting the masked",
        detail:
          "If a piano is buried under a pad, cut the pad at the piano's presence frequencies (1–3 kHz) rather than boosting the piano. Boosting raises the noise floor and adds new competition.",
      },
      {
        rule: "Low-mid is the muddiness zone (200–600 Hz)",
        detail:
          "Most amateur mixes have too much energy here. Gentle cuts on multiple elements clean up more than one deep cut.",
      },
      {
        rule: "Use M/S EQ on the bus",
        detail:
          "High-pass the Side signal aggressively below 100 Hz — Side content below this cancels on mono playback anyway.",
      },
      {
        rule: "Check in mono to catch masking",
        detail:
          "Masking problems hide in stereo. Mono reveals frequency clashes that width was disguising.",
      },
    ],
    insight:
      "Frequency masking is the primary reason mixes sound muddy. Assign regions before you EQ, don't just react to problems.",
  },
  {
    number: "03",
    name: "Panorama",
    subtitle: "Stereo Field & Width",
    color: "#CF6FCF",
    description:
      "The left-right placement of elements across the stereo field. Creates separation, width, and focus.",
    spectrum: null,
    tools: [
      "Pan knobs",
      "M/S processing",
      "Haas effect",
      "Stereo width plugin",
    ],
    rules: [
      {
        rule: "Kick, bass, lead, snare — keep centred",
        detail:
          "The load-bearing elements of a mix are always mono-compatible. Panning them introduces instability.",
      },
      {
        rule: "Symmetry is stable; asymmetry creates tension",
        detail:
          "Deliberate asymmetry is a compositional tool. Unintentional asymmetry is a mix problem.",
      },
      {
        rule: "Side content below 100 Hz cancels on mono playback",
        detail:
          "This is the core M/S rule. Low-frequency stereo width is illusory — it disappears on phones, mono speakers, club systems.",
      },
      {
        rule: "Wide elements should be coherent in mono",
        detail:
          "If an element thins or disappears in mono, it has phase issues. Width through phase cancellation is not real width.",
      },
      {
        rule: "Pan complementary elements opposite each other",
        detail:
          "Piano high register left, pad shimmer right. Acoustic guitar left, electric right. This creates space without emptiness.",
      },
      {
        rule: "Use spectral panning on pads and drones for enveloping width",
        detail:
          "Pan the high-frequency harmonics of a sound wider than its fundamental. The low body stays centred and mono-compatible; the upper shimmer fills the field. This mimics how the head physically filters sound arriving from the side, creating immersive width without phase instability.",
      },
    ],
    insight:
      "Check your mix in mono every 20 minutes. If the low end collapses, your stereo width is a lie.",
  },
  {
    number: "04",
    name: "Dimension",
    subtitle: "Depth & Space",
    color: "#6FCF8A",
    description:
      "The front-to-back depth of the mix. Creates the sense of real acoustic space and emotional distance.",
    spectrum: null,
    tools: ["Reverb", "Delay", "Pre-delay", "Reverb send bus"],
    rules: [
      {
        rule: "Dry = close, wet = distant",
        detail:
          "This is the perceptual physics of space. More reverb pushes an element back. Use this intentionally for each element.",
      },
      {
        rule: "Use pre-delay to keep transients clear",
        detail:
          "10–30 ms pre-delay on reverb lets the initial transient register before the wash arrives. Clarity without dryness.",
      },
      {
        rule: "One shared reverb creates cohesion",
        detail:
          "A single room or hall reverb on a send bus gives everything the same acoustic space. Multiple reverbs create multiple rooms.",
      },
      {
        rule: "Avoid reverb on low-frequency elements",
        detail:
          "Reverb on bass-heavy sources muddies the low-mid. High-pass the reverb return at 200–300 Hz.",
      },
      {
        rule: "Automate reverb sends for movement",
        detail:
          "Increasing a reverb send during a held note or at section endings creates natural bloom without flooding the mix.",
      },
    ],
    insight:
      "Depth is created by the relationship between elements, not the size of your reverb. Contrast — some dry, some wet — is what creates perceived space.",
  },
  {
    number: "05",
    name: "Dynamics",
    subtitle: "Compression & Transients",
    color: "#D4924A",
    description:
      "The relationship between loud and quiet — within elements and across the whole mix.",
    spectrum: null,
    tools: [
      "Compressor",
      "Transient shaper",
      "Parallel compression",
      "Limiter",
      "Clipper",
    ],
    rules: [
      {
        rule: "Shave peaks at track and subgroup level before they reach the master bus",
        detail:
          "Apply a hard clipper to individual channels and subgroups to remove 1–3 dB of extreme peaks. This prevents transient spikes from summing into an overloaded master bus, so the final limiter only needs 1–2 dB of work. The result is a denser, louder-feeling mix with a more transparent limiter.",
      },
      {
        rule: "Compress for feel, not just to reduce peaks",
        detail:
          "The best compression is felt as energy and glue, not heard as pumping or squashing. Set ratio low, threshold generous.",
      },
      {
        rule: "Attack time controls transient punch",
        detail:
          "Slow attack lets the transient through before gain reduction kicks in. This is how you keep snap on drums and piano attacks.",
      },
      {
        rule: "Sync compressor release time to a musical tempo subdivision",
        detail:
          "Set the release time to the millisecond equivalent of a quarter, eighth, or sixteenth note at your project tempo. This creates a subtle rhythmic pumping that locks the gain reduction to the groove rather than fighting it. The result is felt as tightness and cohesion rather than heard as compression. Some bus processors (e.g. Softube Bus Processor) offer a Tempo Sync mode that calculates this automatically.",
      },
      {
        rule: "Parallel compression preserves dynamics",
        detail:
          "Blend heavily compressed signal with the dry signal. You get density and sustain without losing the natural dynamic arc.",
      },
      {
        rule: "Mix bus compression: 1–2 dB max GR",
        detail:
          "Mix bus glue should be inaudible on its own. Bypass and the mix should feel slightly looser — not obviously louder.",
      },
      {
        rule: "Transient shaper before compressor on piano",
        detail:
          "For ambient piano, shaping attack and sustain at the transient level gives more musical control than compression alone.",
      },
    ],
    insight:
      "The loudest moment in a mix should feel inevitable — earned by what came before it. Dynamics create that sense of arrival. Don't compress it away.",
  },
];

export const movement: PhaseData = {
  label: "MOVEMENT",
  name: "Time & Automation",
  color: "#CF6F6F",
  tagline:
    "Where structural decisions become dynamic gestures. These considerations apply once sounds are established, but can be revisited at any stage.",
  sections: [
    {
      title: "Interest — Automation & Movement",
      icon: "◎",
      items: [
        {
          rule: "Automate volume before anything else",
          detail:
            "Level automation is the most natural-feeling movement. A fader ride on the vocal feels human in a way that compressor pumping does not.",
        },
        {
          rule: "Subtle automation is felt, not heard",
          detail:
            "If a listener can identify your automation moves, they're probably too dramatic. It should feel like the song breathing.",
        },
        {
          rule: "Build-ups via reverb send + filter sweeps",
          detail:
            "Increasing reverb send while low-passing the dry signal creates a retreat into space — useful for transitions and emotional peaks.",
        },
        {
          rule: "Breakdowns should feel like release",
          detail:
            "Strip out elements and let the reverb tail carry the energy out. The breakdown earns the return.",
        },
        {
          rule: "Automate after all static decisions are locked",
          detail:
            "Don't automate a poor balance. Settle the structural elements first — balance, frequency, panorama, dimension, dynamics — then animate them.",
        },
      ],
    },
    {
      title: "Section-Level Balance",
      icon: "◈",
      items: [
        {
          rule: "Map the emotional arc of the piece first",
          detail:
            "Before automating anything, write out: intro, build, peak, release, outro. Every automation move serves this arc.",
        },
        {
          rule: "Each section should have a distinct density",
          detail:
            "Intro: sparse. Build: accumulating. Peak: full. Release: sudden subtraction. Outro: dissolve. Commit to these contrasts.",
        },
        {
          rule: "Volume automation on groups, not individual tracks",
          detail:
            "Push the whole drums group up going into the peak rather than riding individual elements. Maintain internal balance.",
        },
      ],
    },
    {
      title: "Reverb & Delay Rides",
      icon: "◉",
      items: [
        {
          rule: "Automate reverb send up at emotional peaks",
          detail:
            "The feeling of 'blooming' at the climax of a piece is usually a reverb send increase. 2–3 dB is enough.",
        },
        {
          rule: "Pre-delay automation for intimacy shifts",
          detail:
            "Shortening pre-delay brings an element forward. Lengthening it pushes it back. Automate this for lead/background shifts.",
        },
        {
          rule: "Delay throw on final notes before section changes",
          detail:
            "A tempo-synced throw on the last note of a phrase glues sections together and creates a sense of continuation.",
        },
      ],
    },
    {
      title: "Tonal Automation",
      icon: "◫",
      items: [
        {
          rule: "Low-pass filter sweeps down into breakdowns",
          detail:
            "Filtering high content out signals 'going away'. Removing the filter returns them signals 'coming back'.",
        },
        {
          rule: "Dynamic EQ on problem frequencies over time",
          detail:
            "A resonance that's fine in verse may clash in the chorus. Dynamic EQ tied to level is cleaner than static cuts.",
        },
        {
          rule: "Automate high-pass on pads during dense sections",
          detail:
            "In dense arrangements, raising the pad high-pass frees up low-mid space for the more important elements that arrive.",
        },
      ],
    },
    {
      title: "Final Checks",
      icon: "◐",
      items: [
        {
          rule: "Mono check after all automation is written",
          detail:
            "Automation can shift the phase balance of M/S content over time. Check mono at the peak of the mix, not just the intro.",
        },
        {
          rule: "LUFS integrated target: −14 LUFS for streaming",
          detail:
            "Streaming platforms normalise to approximately −14 LUFS. Mixing louder than this wastes dynamic range — normalisation will pull it back anyway.",
        },
        {
          rule: "For ambient music, −18 to −16 LUFS integrated is a valid target",
          detail:
            "Streaming normalisation will turn a −8 LUFS master down, but it will not restore the dynamic range that was compressed away to reach it. Ambient music relies on the contrast between soft and loud passages. Mastering quieter preserves that breath — it is not under-mastering.",
        },
        {
          rule: "True peak ceiling: −1 dBTP",
          detail:
            "Intersample peaks cause clipping on streaming encoders even when your waveform shows headroom. Limit at −1 dBTP minimum.",
        },
        {
          rule: "Listen on at least three playback systems",
          detail:
            "Studio monitors → headphones → phone speaker (mono). If it translates across all three, it's done.",
        },
      ],
    },
  ],
};
