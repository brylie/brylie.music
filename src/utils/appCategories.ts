/**
 * App category styling and utilities
 */

export type AppCategory = "rhythm" | "learning" | "creative" | "utility";

/**
 * Tailwind CSS classes for category badges.
 * Colors are chosen to be visually distinct and accessible on dark backgrounds.
 */
export const categoryColors: Record<AppCategory, string> = {
	rhythm: "bg-purple-900 text-purple-200 border-purple-700",
	learning: "bg-green-900 text-green-200 border-green-700",
	creative: "bg-pink-900 text-pink-200 border-pink-700",
	utility: "bg-blue-900 text-blue-200 border-blue-700",
};

/**
 * Get category badge classes for a given category.
 * Returns utility category colors as default if category is undefined.
 */
export function getCategoryBadgeClasses(category?: AppCategory): string {
	return category ? categoryColors[category] : categoryColors.utility;
}
