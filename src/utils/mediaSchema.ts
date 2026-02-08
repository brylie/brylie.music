import type { CollectionEntry } from "astro:content";

/**
 * Converts human-readable duration formats to ISO 8601 duration strings
 * Supports formats: "M:SS", "MM:SS", "H:MM:SS"
 * Examples: "4:42" → "PT4M42S", "1:23:45" → "PT1H23M45S"
 * Falls back to original value if already ISO 8601 (starts with "PT")
 */
export function convertDurationToISO8601(duration: string): string {
  // If already ISO 8601 format, return as-is
  if (duration.startsWith("PT")) {
    return duration;
  }

  // Split by colon to parse time components
  const parts = duration.split(":").map((p) => parseInt(p, 10));

  // Handle invalid input
  if (parts.some(isNaN) || parts.length < 1 || parts.length > 3) {
    return duration; // Fallback to original
  }

  let hours = 0;
  let minutes = 0;
  let seconds = 0;

  if (parts.length === 3) {
    // H:MM:SS format
    [hours, minutes, seconds] = parts;
  } else if (parts.length === 2) {
    // M:SS or MM:SS format
    [minutes, seconds] = parts;
  } else {
    // Single number (seconds only)
    seconds = parts[0];
  }

  // Build ISO 8601 duration string
  let iso8601 = "PT";
  if (hours > 0) iso8601 += `${hours}H`;
  if (minutes > 0) iso8601 += `${minutes}M`;
  if (seconds > 0 || (hours === 0 && minutes === 0)) iso8601 += `${seconds}S`;

  return iso8601;
}

/**
 * Generates Schema.org structured data for media content
 * Returns VideoObject, AudioObject, or CreativeWork based on mediaType
 */
export function generateMediaSchema(
  media: CollectionEntry<"media">,
  mediaUrl: string,
  siteUrl?: string
): Record<string, unknown> {
  // Determine the appropriate schema.org type
  const schemaType =
    media.data.mediaType === "video"
      ? "VideoObject"
      : media.data.mediaType === "audio"
        ? "AudioObject"
        : "CreativeWork";

  // Build content URL based on platform identifiers
  let contentUrl: string | undefined;
  if (media.data.youtubeId) {
    contentUrl = `https://www.youtube.com/watch?v=${media.data.youtubeId}`;
  } else if (media.data.iaIdentifier) {
    contentUrl = `https://archive.org/details/${media.data.iaIdentifier}`;
  } else if (media.data.videoUrl) {
    contentUrl = media.data.videoUrl;
  } else if (media.data.audioUrl) {
    contentUrl = media.data.audioUrl;
  }

  // Build thumbnail URL
  let thumbnailUrl: string | undefined;
  if (media.data.coverImage) {
    thumbnailUrl = siteUrl
      ? new URL(media.data.coverImage.src, siteUrl).toString()
      : media.data.coverImage.src;
  } else if (media.data.youtubeId) {
    thumbnailUrl = `https://img.youtube.com/vi/${media.data.youtubeId}/hqdefault.jpg`;
  } else if (media.data.iaIdentifier) {
    thumbnailUrl = `https://archive.org/download/${media.data.iaIdentifier}/__ia_thumb.jpg`;
  }

  // Build base schema
  const baseSchema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": schemaType,
    name: media.data.title,
    description: media.data.description,
    url: mediaUrl,
    datePublished: media.data.datePublished.toISOString(),
    ...(media.data.dateModified && {
      dateModified: media.data.dateModified.toISOString(),
    }),
    ...(media.data.author && {
      author: {
        "@type": "Person",
        name: media.data.author,
      },
    }),
    ...(contentUrl && { contentUrl }),
    ...(thumbnailUrl && { thumbnailUrl }),
    ...(media.data.duration && { duration: convertDurationToISO8601(media.data.duration) }),
    ...(media.data.keywords && { keywords: media.data.keywords.join(", ") }),
    license: media.data.licenseUrl || `https://creativecommons.org/licenses/by/4.0/`,
  };

  // Add video-specific fields
  if (media.data.mediaType === "video" && media.data.resolution) {
    baseSchema.videoQuality = media.data.resolution;
  }

  // Add collaborators
  if (media.data.collaborators && media.data.collaborators.length > 0) {
    baseSchema.contributor = media.data.collaborators.map((name) => ({
      "@type": "Person",
      name,
    }));
  }

  // Add topics as keywords if keywords not already set
  if (!media.data.keywords && media.data.topics) {
    baseSchema.keywords = media.data.topics.join(", ");
  }

  return baseSchema;
}

/**
 * Helper to construct Internet Archive embed URL
 */
export function getInternetArchiveEmbedUrl(identifier: string): string {
  return `https://archive.org/embed/${identifier}`;
}

/**
 * Helper to construct Internet Archive details page URL
 */
export function getInternetArchiveDetailsUrl(identifier: string): string {
  return `https://archive.org/details/${identifier}`;
}

/**
 * Helper to construct Internet Archive download URL
 */
export function getInternetArchiveDownloadUrl(identifier: string, filename?: string): string {
  if (filename) {
    return `https://archive.org/download/${identifier}/${filename}`;
  }
  return `https://archive.org/download/${identifier}`;
}
