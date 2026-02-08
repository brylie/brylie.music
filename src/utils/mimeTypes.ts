/**
 * Utility functions for determining media MIME types
 */

/**
 * Map of common file extensions to video MIME types
 */
const videoMimeTypes: Record<string, string> = {
  mp4: "video/mp4",
  webm: "video/webm",
  ogg: "video/ogg",
  ogv: "video/ogg",
  mov: "video/quicktime",
  avi: "video/x-msvideo",
  mkv: "video/x-matroska",
  m4v: "video/x-m4v",
};

/**
 * Map of common file extensions to audio MIME types
 */
const audioMimeTypes: Record<string, string> = {
  mp3: "audio/mpeg",
  mpeg: "audio/mpeg",
  ogg: "audio/ogg",
  oga: "audio/ogg",
  opus: "audio/opus",
  wav: "audio/wav",
  wave: "audio/wav",
  webm: "audio/webm",
  m4a: "audio/mp4",
  aac: "audio/aac",
  flac: "audio/flac",
};

/**
 * Extracts the file extension from a URL
 * @param url - The URL to extract extension from
 * @returns The lowercase file extension without the dot, or empty string if none found
 */
function getFileExtension(url: string): string {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const lastDot = pathname.lastIndexOf(".");
    if (lastDot === -1) return "";
    return pathname.slice(lastDot + 1).toLowerCase();
  } catch {
    // If URL parsing fails, try simple string extraction
    const lastDot = url.lastIndexOf(".");
    const lastSlash = url.lastIndexOf("/");
    if (lastDot === -1 || lastDot < lastSlash) return "";
    return url.slice(lastDot + 1).toLowerCase();
  }
}

/**
 * Determines the MIME type for a video URL
 * @param videoUrl - The URL of the video file
 * @param explicitMime - Optional explicit MIME type override
 * @returns The MIME type string
 */
export function getVideoMimeType(
  videoUrl: string,
  explicitMime?: string,
): string {
  if (explicitMime) return explicitMime;

  const extension = getFileExtension(videoUrl);
  return videoMimeTypes[extension] || "video/*";
}

/**
 * Determines the MIME type for an audio URL
 * @param audioUrl - The URL of the audio file
 * @param explicitMime - Optional explicit MIME type override
 * @returns The MIME type string
 */
export function getAudioMimeType(
  audioUrl: string,
  explicitMime?: string,
): string {
  if (explicitMime) return explicitMime;

  const extension = getFileExtension(audioUrl);
  return audioMimeTypes[extension] || "audio/*";
}
