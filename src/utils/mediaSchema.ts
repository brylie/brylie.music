import type { CollectionEntry } from "astro:content";

/**
 * Generates Schema.org structured data for media content
 * Returns VideoObject, AudioObject, or CreativeWork based on mediaType
 */
export function generateMediaSchema(
  media: CollectionEntry<"media">,
  mediaUrl: string,
  siteUrl?: string
) {
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
  const thumbnailUrl = media.data.coverImage
    ? siteUrl
      ? new URL(media.data.coverImage.src, siteUrl).toString()
      : media.data.coverImage.src
    : undefined;

  // Build base schema
  const baseSchema: Record<string, any> = {
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
    ...(media.data.duration && { duration: media.data.duration }),
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
