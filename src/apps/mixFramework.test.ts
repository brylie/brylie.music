import { describe, it, expect } from "vitest";
import { phase0, phase1Elements, phase2, TABS } from "./mixFramework";

describe("phase0", (): void => {
  it("has the expected label and name", (): void => {
    expect(phase0.label).toBe("PHASE 0");
    expect(phase0.name).toBe("Production-Integrated");
    expect(phase0.color).toBe("#6FCF8A");
  });

  it("has exactly 4 sections", (): void => {
    expect(phase0.sections).toHaveLength(4);
  });

  it("each section has a non-empty title, icon, and items array", (): void => {
    for (const section of phase0.sections) {
      expect(section.title.length).toBeGreaterThan(0);
      expect(section.icon.length).toBeGreaterThan(0);
      expect(Array.isArray(section.items)).toBe(true);
      expect(section.items.length).toBeGreaterThan(0);
    }
  });

  it("every item has non-empty rule and detail strings", (): void => {
    for (const section of phase0.sections) {
      for (const item of section.items) {
        expect(item.rule.length).toBeGreaterThan(0);
        expect(item.detail.length).toBeGreaterThan(0);
      }
    }
  });
});

describe("phase1Elements", (): void => {
  it("has exactly 6 elements", (): void => {
    expect(phase1Elements).toHaveLength(6);
  });

  it("element numbers are '01' through '06'", (): void => {
    const numbers = phase1Elements.map((e) => e.number);
    expect(numbers).toEqual(["01", "02", "03", "04", "05", "06"]);
  });

  it("each element has required string fields", (): void => {
    for (const el of phase1Elements) {
      expect(el.name.length).toBeGreaterThan(0);
      expect(el.subtitle.length).toBeGreaterThan(0);
      expect(el.color.length).toBeGreaterThan(0);
      expect(el.description.length).toBeGreaterThan(0);
      expect(el.insight.length).toBeGreaterThan(0);
    }
  });

  it("element colors are valid hex strings", (): void => {
    const hexPattern = /^#[0-9A-Fa-f]{6}$/;
    for (const el of phase1Elements) {
      expect(el.color).toMatch(hexPattern);
    }
  });

  it("each element has at least one tool and at least one rule", (): void => {
    for (const el of phase1Elements) {
      expect(el.tools.length).toBeGreaterThan(0);
      expect(el.rules.length).toBeGreaterThan(0);
    }
  });

  it("every rule has non-empty rule and detail strings", (): void => {
    for (const el of phase1Elements) {
      for (const r of el.rules) {
        expect(r.rule.length).toBeGreaterThan(0);
        expect(r.detail.length).toBeGreaterThan(0);
      }
    }
  });

  it("the Frequency element (index 1) has a spectrum with 6 bands", (): void => {
    const freq = phase1Elements[1];
    expect(freq.name).toBe("Frequency");
    expect(freq.spectrum).not.toBeNull();
    expect(freq.spectrum!.bands).toHaveLength(6);
  });

  it("each spectrum band has name, range, owner, and color", (): void => {
    const bands = phase1Elements[1].spectrum!.bands;
    for (const band of bands) {
      expect(band.name.length).toBeGreaterThan(0);
      expect(band.range.length).toBeGreaterThan(0);
      expect(band.owner.length).toBeGreaterThan(0);
      expect(band.color.length).toBeGreaterThan(0);
    }
  });

  it("all elements except Frequency have spectrum === null", (): void => {
    const nonFreq = phase1Elements.filter((_, i) => i !== 1);
    for (const el of nonFreq) {
      expect(el.spectrum).toBeNull();
    }
  });
});

describe("phase2", (): void => {
  it("has the expected label and name", (): void => {
    expect(phase2.label).toBe("PHASE 2");
    expect(phase2.name).toBe("Dynamic Mix");
    expect(phase2.color).toBe("#CF6F6F");
  });

  it("has exactly 4 sections", (): void => {
    expect(phase2.sections).toHaveLength(4);
  });

  it("every item has non-empty rule and detail strings", (): void => {
    for (const section of phase2.sections) {
      for (const item of section.items) {
        expect(item.rule.length).toBeGreaterThan(0);
        expect(item.detail.length).toBeGreaterThan(0);
      }
    }
  });
});

describe("TABS", (): void => {
  it("has exactly 4 tabs", (): void => {
    expect(TABS).toHaveLength(4);
  });

  it("tab ids are 'sequence', 'phase0', 'phase1', 'phase2'", (): void => {
    const ids = TABS.map((t) => t.id);
    expect(ids).toEqual(["sequence", "phase0", "phase1", "phase2"]);
  });

  it("each tab has a non-empty label and sublabel", (): void => {
    for (const tab of TABS) {
      expect(tab.label.length).toBeGreaterThan(0);
      expect(tab.sublabel.length).toBeGreaterThan(0);
    }
  });

  it("phase tabs have a color, sequence tab does not", (): void => {
    expect(TABS[0].color).toBeUndefined();
    expect(TABS[1].color).toBe("#6FCF8A");
    expect(TABS[2].color).toBe("#4A9ED4");
    expect(TABS[3].color).toBe("#CF6F6F");
  });
});
