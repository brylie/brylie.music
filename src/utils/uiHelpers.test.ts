import { describe, test, expect } from "vitest";
import { getMediaTypeBadgeClasses } from "./uiHelpers";

describe("getMediaTypeBadgeClasses", () => {
  test("returns correct classes for video type", () => {
    const classes = getMediaTypeBadgeClasses("video");
    expect(classes).toBe("bg-purple-500/20 text-purple-300 border border-purple-500/50");
  });

  test("returns correct classes for audio type", () => {
    const classes = getMediaTypeBadgeClasses("audio");
    expect(classes).toBe("bg-blue-500/20 text-blue-300 border border-blue-500/50");
  });

  test("returns correct classes for interactive type", () => {
    const classes = getMediaTypeBadgeClasses("interactive");
    expect(classes).toBe("bg-green-500/20 text-green-300 border border-green-500/50");
  });

  test("returns default classes for unknown type", () => {
    const classes = getMediaTypeBadgeClasses("unknown");
    expect(classes).toBe("bg-gray-500/20 text-gray-300 border border-gray-500/50");
  });

  test("returns default classes for empty string", () => {
    const classes = getMediaTypeBadgeClasses("");
    expect(classes).toBe("bg-gray-500/20 text-gray-300 border border-gray-500/50");
  });
});
