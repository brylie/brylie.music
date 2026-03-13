import { describe, it, expect } from "vitest";
import { foundation, structureElements, movement, TABS } from "./mixFramework";

describe("foundation", (): void => {
  it("has the expected label and name", (): void => {
    expect(foundation.label).toBe("FOUNDATION");
    expect(foundation.name).toBe("Throughout Production");
    expect(foundation.color).toBe("#6FCF8A");
  });

  it("has exactly 4 sections", (): void => {
    expect(foundation.sections).toHaveLength(4);
  });

  it("each section has a non-empty title, icon, and items array", (): void => {
    for (const section of foundation.sections) {
      expect(section.title.length).toBeGreaterThan(0);
      expect(section.icon.length).toBeGreaterThan(0);
      expect(Array.isArray(section.items)).toBe(true);
      expect(section.items.length).toBeGreaterThan(0);
    }
  });

  it("every item has non-empty rule and detail strings", (): void => {
    for (const section of foundation.sections) {
      for (const item of section.items) {
        expect(item.guideline.length).toBeGreaterThan(0);
        expect(item.detail.length).toBeGreaterThan(0);
      }
    }
  });
});

describe("structureElements", (): void => {
  it("has exactly 6 elements", (): void => {
    expect(structureElements).toHaveLength(6);
  });

  it("element numbers are '01' through '06'", (): void => {
    const numbers = structureElements.map((e) => e.number);
    expect(numbers).toEqual(["01", "02", "03", "04", "05", "06"]);
  });

  it("each element has required string fields", (): void => {
    for (const el of structureElements) {
      expect(el.name.length).toBeGreaterThan(0);
      expect(el.subtitle.length).toBeGreaterThan(0);
      expect(el.color.length).toBeGreaterThan(0);
      expect(el.description.length).toBeGreaterThan(0);
      expect(el.insight.length).toBeGreaterThan(0);
    }
  });

  it("element colors are valid hex strings", (): void => {
    const hexPattern = /^#[0-9A-Fa-f]{6}$/;
    for (const el of structureElements) {
      expect(el.color).toMatch(hexPattern);
    }
  });

  it("each element has at least one tool and at least one rule", (): void => {
    for (const el of structureElements) {
      expect(el.tools.length).toBeGreaterThan(0);
      expect(el.guidelines.length).toBeGreaterThan(0);
    }
  });

  it("every rule has non-empty rule and detail strings", (): void => {
    for (const el of structureElements) {
      for (const r of el.guidelines) {
        expect(r.guideline.length).toBeGreaterThan(0);
        expect(r.detail.length).toBeGreaterThan(0);
      }
    }
  });

  it("the Frequency element (index 1) has a spectrum with 6 bands", (): void => {
    const freq = structureElements[1];
    expect(freq.name).toBe("Frequency");
    expect(freq.spectrum).not.toBeNull();
    expect(freq.spectrum!.bands).toHaveLength(6);
  });

  it("each spectrum band has name, range, owner, and color", (): void => {
    const bands = structureElements[1].spectrum!.bands;
    for (const band of bands) {
      expect(band.name.length).toBeGreaterThan(0);
      expect(band.range.length).toBeGreaterThan(0);
      expect(band.owner.length).toBeGreaterThan(0);
      expect(band.color.length).toBeGreaterThan(0);
    }
  });

  it("all elements except Frequency have spectrum === null", (): void => {
    const nonFreq = structureElements.filter((_, i) => i !== 1);
    for (const el of nonFreq) {
      expect(el.spectrum).toBeNull();
    }
  });
});

describe("movement", (): void => {
  it("has the expected label and name", (): void => {
    expect(movement.label).toBe("MOVEMENT");
    expect(movement.name).toBe("Time & Automation");
    expect(movement.color).toBe("#CF6F6F");
  });

  it("has exactly 4 sections", (): void => {
    expect(movement.sections).toHaveLength(4);
  });

  it("every item has non-empty rule and detail strings", (): void => {
    for (const section of movement.sections) {
      for (const item of section.items) {
        expect(item.guideline.length).toBeGreaterThan(0);
        expect(item.detail.length).toBeGreaterThan(0);
      }
    }
  });
});

describe("TABS", (): void => {
  it("has exactly 4 tabs", (): void => {
    expect(TABS).toHaveLength(4);
  });

  it("tab ids are 'overview', 'foundation', 'structure', 'movement'", (): void => {
    const ids = TABS.map((t) => t.id);
    expect(ids).toEqual(["overview", "foundation", "structure", "movement"]);
  });

  it("each tab has a non-empty label and sublabel", (): void => {
    for (const tab of TABS) {
      expect(tab.label.length).toBeGreaterThan(0);
      expect(tab.sublabel.length).toBeGreaterThan(0);
    }
  });

  it("foundation/structure/movement tabs have a color, overview tab does not", (): void => {
    expect(TABS[0].color).toBeUndefined();
    expect(TABS[1].color).toBe("#6FCF8A");
    expect(TABS[2].color).toBe("#4A9ED4");
    expect(TABS[3].color).toBe("#CF6F6F");
  });
});
