/**
 * UI helper functions for consistent styling across components
 */

/**
 * Get Tailwind CSS classes for media type badges
 * @param mediaType - The type of media (video, audio, interactive)
 * @returns CSS classes for the badge
 */
export const getMediaTypeBadgeClasses = (mediaType: string): string => {
  switch (mediaType) {
    case "video":
      return "bg-purple-500/20 text-purple-300 border border-purple-500/50";
    case "audio":
      return "bg-blue-500/20 text-blue-300 border border-blue-500/50";
    case "interactive":
      return "bg-green-500/20 text-green-300 border border-green-500/50";
    default:
      return "bg-gray-500/20 text-gray-300 border border-gray-500/50";
  }
};
