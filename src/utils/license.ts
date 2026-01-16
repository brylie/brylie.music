/**
 * Builds a Creative Commons license URL from an SPDX identifier.
 * Normalizes the identifier by removing the "cc-" prefix and replacing all hyphens with slashes.
 * 
 * @param spdxLicense - SPDX license identifier (e.g., "CC-BY-SA-4.0")
 * @returns Creative Commons license URL
 * 
 * @example
 * buildLicenseUrl("CC-BY-SA-4.0") // returns "https://creativecommons.org/licenses/by-sa/4.0/"
 * buildLicenseUrl("cc-by-nc-4.0") // returns "https://creativecommons.org/licenses/by-nc/4.0/"
 */
export function buildLicenseUrl(spdxLicense: string): string {
  const normalized = spdxLicense.toLowerCase().replace(/^cc-/i, "").replace(/-/g, "/");
  return `https://creativecommons.org/licenses/${normalized}/`;
}
