import { describe, test, expect } from "vitest";
import {
  generateMediaSchema,
  getInternetArchiveEmbedUrl,
  getInternetArchiveDetailsUrl,
  getInternetArchiveDownloadUrl,
} from "./mediaSchema";
import type { CollectionEntry } from "astro:content";

describe("generateMediaSchema", () => {
  test("generates VideoObject schema for video media type", () => {
    const mockMedia: CollectionEntry<"media"> = {
      id: "test-video",
      collection: "media",
      data: {
        title: "Test Video",
        description: "A test video",
        datePublished: new Date("2023-08-03"),
        mediaType: "video",
        youtubeId: "abc123",
        keywords: ["test", "video"],
        license: "CC-BY-4.0",
      },
    } as CollectionEntry<"media">;

    const schema = generateMediaSchema(
      mockMedia,
      "https://example.com/media/test-video"
    );

    expect(schema["@context"]).toBe("https://schema.org");
    expect(schema["@type"]).toBe("VideoObject");
    expect(schema.name).toBe("Test Video");
    expect(schema.description).toBe("A test video");
    expect(schema.contentUrl).toBe("https://www.youtube.com/watch?v=abc123");
  });

  test("generates AudioObject schema for audio media type", () => {
    const mockMedia: CollectionEntry<"media"> = {
      id: "test-audio",
      collection: "media",
      data: {
        title: "Test Audio",
        description: "A test audio file",
        datePublished: new Date("2023-08-03"),
        mediaType: "audio",
        audioUrl: "https://example.com/audio.mp3",
        license: "CC-BY-4.0",
      },
    } as CollectionEntry<"media">;

    const schema = generateMediaSchema(
      mockMedia,
      "https://example.com/media/test-audio"
    );

    expect(schema["@type"]).toBe("AudioObject");
    expect(schema.contentUrl).toBe("https://example.com/audio.mp3");
  });

  test("generates CreativeWork schema for interactive media type", () => {
    const mockMedia: CollectionEntry<"media"> = {
      id: "test-interactive",
      collection: "media",
      data: {
        title: "Test Interactive",
        description: "An interactive piece",
        datePublished: new Date("2023-08-03"),
        mediaType: "interactive",
        license: "CC-BY-4.0",
      },
    } as CollectionEntry<"media">;

    const schema = generateMediaSchema(
      mockMedia,
      "https://example.com/media/test-interactive"
    );

    expect(schema["@type"]).toBe("CreativeWork");
  });

  test("uses Internet Archive identifier for contentUrl", () => {
    const mockMedia: CollectionEntry<"media"> = {
      id: "media-detox",
      collection: "media",
      data: {
        title: "Media Detox",
        description: "A video from Internet Archive",
        datePublished: new Date("2023-08-03"),
        mediaType: "video",
        iaIdentifier: "bco-2023-08-03-media-detox",
        license: "CC-BY-4.0",
      },
    } as CollectionEntry<"media">;

    const schema = generateMediaSchema(
      mockMedia,
      "https://example.com/media/media-detox"
    );

    expect(schema.contentUrl).toBe(
      "https://archive.org/details/bco-2023-08-03-media-detox"
    );
  });

  test("includes author information when provided", () => {
    const mockMedia: CollectionEntry<"media"> = {
      id: "test-video",
      collection: "media",
      data: {
        title: "Test Video",
        description: "A test video",
        datePublished: new Date("2023-08-03"),
        author: "John Doe",
        mediaType: "video",
        license: "CC-BY-4.0",
      },
    } as CollectionEntry<"media">;

    const schema = generateMediaSchema(
      mockMedia,
      "https://example.com/media/test-video"
    );

    expect(schema.author).toEqual({
      "@type": "Person",
      name: "John Doe",
    });
  });

  test("includes dateModified when provided", () => {
    const mockMedia: CollectionEntry<"media"> = {
      id: "test-video",
      collection: "media",
      data: {
        title: "Test Video",
        description: "A test video",
        datePublished: new Date("2023-08-03"),
        dateModified: new Date("2023-09-01"),
        mediaType: "video",
        license: "CC-BY-4.0",
      },
    } as CollectionEntry<"media">;

    const schema = generateMediaSchema(
      mockMedia,
      "https://example.com/media/test-video"
    );

    expect(schema.dateModified).toBe("2023-09-01T00:00:00.000Z");
  });

  test("includes duration when provided", () => {
    const mockMedia: CollectionEntry<"media"> = {
      id: "test-video",
      collection: "media",
      data: {
        title: "Test Video",
        description: "A test video",
        datePublished: new Date("2023-08-03"),
        mediaType: "video",
        duration: "4:32",
        license: "CC-BY-4.0",
      },
    } as CollectionEntry<"media">;

    const schema = generateMediaSchema(
      mockMedia,
      "https://example.com/media/test-video"
    );

    expect(schema.duration).toBe("4:32");
  });

  test("includes video quality for video media with resolution", () => {
    const mockMedia: CollectionEntry<"media"> = {
      id: "test-video",
      collection: "media",
      data: {
        title: "Test Video",
        description: "A test video",
        datePublished: new Date("2023-08-03"),
        mediaType: "video",
        resolution: "1920x1080",
        license: "CC-BY-4.0",
      },
    } as CollectionEntry<"media">;

    const schema = generateMediaSchema(
      mockMedia,
      "https://example.com/media/test-video"
    );

    expect(schema.videoQuality).toBe("1920x1080");
  });

  test("includes collaborators as contributors", () => {
    const mockMedia: CollectionEntry<"media"> = {
      id: "test-video",
      collection: "media",
      data: {
        title: "Test Video",
        description: "A test video",
        datePublished: new Date("2023-08-03"),
        mediaType: "video",
        collaborators: ["Jane Smith", "Bob Johnson"],
        license: "CC-BY-4.0",
      },
    } as CollectionEntry<"media">;

    const schema = generateMediaSchema(
      mockMedia,
      "https://example.com/media/test-video"
    );

    expect(schema.contributor).toEqual([
      { "@type": "Person", name: "Jane Smith" },
      { "@type": "Person", name: "Bob Johnson" },
    ]);
  });

  test("uses topics as keywords when keywords not provided", () => {
    const mockMedia: CollectionEntry<"media"> = {
      id: "test-video",
      collection: "media",
      data: {
        title: "Test Video",
        description: "A test video",
        datePublished: new Date("2023-08-03"),
        mediaType: "video",
        topics: ["music", "modular", "eurorack"],
        license: "CC-BY-4.0",
      },
    } as CollectionEntry<"media">;

    const schema = generateMediaSchema(
      mockMedia,
      "https://example.com/media/test-video"
    );

    expect(schema.keywords).toBe("music, modular, eurorack");
  });

  test("prefers keywords over topics when both provided", () => {
    const mockMedia: CollectionEntry<"media"> = {
      id: "test-video",
      collection: "media",
      data: {
        title: "Test Video",
        description: "A test video",
        datePublished: new Date("2023-08-03"),
        mediaType: "video",
        keywords: ["seo", "keyword"],
        topics: ["music", "modular"],
        license: "CC-BY-4.0",
      },
    } as CollectionEntry<"media">;

    const schema = generateMediaSchema(
      mockMedia,
      "https://example.com/media/test-video"
    );

    expect(schema.keywords).toBe("seo, keyword");
  });

  test("includes thumbnailUrl with siteUrl", () => {
    const mockMedia: CollectionEntry<"media"> = {
      id: "test-video",
      collection: "media",
      data: {
        title: "Test Video",
        description: "A test video",
        datePublished: new Date("2023-08-03"),
        mediaType: "video",
        coverImage: { src: "/images/cover.jpg" } as any,
        license: "CC-BY-4.0",
      },
    } as CollectionEntry<"media">;

    const schema = generateMediaSchema(
      mockMedia,
      "https://example.com/media/test-video",
      "https://example.com"
    );

    expect(schema.thumbnailUrl).toBe("https://example.com/images/cover.jpg");
  });

  test("prioritizes YouTube over other platforms", () => {
    const mockMedia: CollectionEntry<"media"> = {
      id: "test-video",
      collection: "media",
      data: {
        title: "Test Video",
        description: "A test video",
        datePublished: new Date("2023-08-03"),
        mediaType: "video",
        youtubeId: "youtube123",
        iaIdentifier: "ia-identifier",
        videoUrl: "https://example.com/video.mp4",
        license: "CC-BY-4.0",
      },
    } as CollectionEntry<"media">;

    const schema = generateMediaSchema(
      mockMedia,
      "https://example.com/media/test-video"
    );

    expect(schema.contentUrl).toBe("https://www.youtube.com/watch?v=youtube123");
  });
});

describe("Internet Archive helpers", () => {
  test("getInternetArchiveEmbedUrl generates correct embed URL", () => {
    const url = getInternetArchiveEmbedUrl("bco-2023-08-03-media-detox");
    expect(url).toBe("https://archive.org/embed/bco-2023-08-03-media-detox");
  });

  test("getInternetArchiveDetailsUrl generates correct details URL", () => {
    const url = getInternetArchiveDetailsUrl("bco-2023-08-03-media-detox");
    expect(url).toBe("https://archive.org/details/bco-2023-08-03-media-detox");
  });

  test("getInternetArchiveDownloadUrl generates correct download URL without filename", () => {
    const url = getInternetArchiveDownloadUrl("bco-2023-08-03-media-detox");
    expect(url).toBe("https://archive.org/download/bco-2023-08-03-media-detox");
  });

  test("getInternetArchiveDownloadUrl generates correct download URL with filename", () => {
    const url = getInternetArchiveDownloadUrl(
      "bco-2023-08-03-media-detox",
      "BCO-2023-08-03-MediaDetox.mp4"
    );
    expect(url).toBe(
      "https://archive.org/download/bco-2023-08-03-media-detox/BCO-2023-08-03-MediaDetox.mp4"
    );
  });
});
