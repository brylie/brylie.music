import { describe, test, expect } from "vitest";
import { getVideoMimeType, getAudioMimeType } from "./mimeTypes";

describe("getVideoMimeType", () => {
  test("returns explicit MIME type when provided", () => {
    expect(getVideoMimeType("https://example.com/video.mp4", "video/custom")).toBe("video/custom");
  });

  test("detects MP4 from extension", () => {
    expect(getVideoMimeType("https://example.com/video.mp4")).toBe("video/mp4");
    expect(getVideoMimeType("https://example.com/path/to/video.MP4")).toBe("video/mp4");
  });

  test("detects WebM from extension", () => {
    expect(getVideoMimeType("https://example.com/video.webm")).toBe("video/webm");
  });

  test("detects OGG/OGV from extension", () => {
    expect(getVideoMimeType("https://example.com/video.ogg")).toBe("video/ogg");
    expect(getVideoMimeType("https://example.com/video.ogv")).toBe("video/ogg");
  });

  test("detects MOV from extension", () => {
    expect(getVideoMimeType("https://example.com/video.mov")).toBe("video/quicktime");
  });

  test("detects AVI from extension", () => {
    expect(getVideoMimeType("https://example.com/video.avi")).toBe("video/x-msvideo");
  });

  test("detects MKV from extension", () => {
    expect(getVideoMimeType("https://example.com/video.mkv")).toBe("video/x-matroska");
  });

  test("detects M4V from extension", () => {
    expect(getVideoMimeType("https://example.com/video.m4v")).toBe("video/x-m4v");
  });

  test("handles URLs with query parameters", () => {
    expect(getVideoMimeType("https://example.com/video.mp4?quality=hd")).toBe("video/mp4");
  });

  test("handles URLs with fragments", () => {
    expect(getVideoMimeType("https://example.com/video.webm#t=10")).toBe("video/webm");
  });

  test("falls back to video/* for unknown extensions", () => {
    expect(getVideoMimeType("https://example.com/video.xyz")).toBe("video/*");
  });

  test("falls back to video/* when no extension", () => {
    expect(getVideoMimeType("https://example.com/video")).toBe("video/*");
  });

  test("handles relative URLs", () => {
    expect(getVideoMimeType("/videos/sample.mp4")).toBe("video/mp4");
  });

  test("handles case insensitivity", () => {
    expect(getVideoMimeType("https://example.com/VIDEO.WEBM")).toBe("video/webm");
  });
});

describe("getAudioMimeType", () => {
  test("returns explicit MIME type when provided", () => {
    expect(getAudioMimeType("https://example.com/audio.mp3", "audio/custom")).toBe("audio/custom");
  });

  test("detects MP3 from extension", () => {
    expect(getAudioMimeType("https://example.com/audio.mp3")).toBe("audio/mpeg");
    expect(getAudioMimeType("https://example.com/audio.mpeg")).toBe("audio/mpeg");
  });

  test("detects OGG/OGA from extension", () => {
    expect(getAudioMimeType("https://example.com/audio.ogg")).toBe("audio/ogg");
    expect(getAudioMimeType("https://example.com/audio.oga")).toBe("audio/ogg");
  });

  test("detects Opus from extension", () => {
    expect(getAudioMimeType("https://example.com/audio.opus")).toBe("audio/opus");
  });

  test("detects WAV from extension", () => {
    expect(getAudioMimeType("https://example.com/audio.wav")).toBe("audio/wav");
    expect(getAudioMimeType("https://example.com/audio.wave")).toBe("audio/wav");
  });

  test("detects WebM from extension", () => {
    expect(getAudioMimeType("https://example.com/audio.webm")).toBe("audio/webm");
  });

  test("detects M4A from extension", () => {
    expect(getAudioMimeType("https://example.com/audio.m4a")).toBe("audio/mp4");
  });

  test("detects AAC from extension", () => {
    expect(getAudioMimeType("https://example.com/audio.aac")).toBe("audio/aac");
  });

  test("detects FLAC from extension", () => {
    expect(getAudioMimeType("https://example.com/audio.flac")).toBe("audio/flac");
  });

  test("handles URLs with query parameters", () => {
    expect(getAudioMimeType("https://example.com/audio.mp3?download=true")).toBe("audio/mpeg");
  });

  test("handles URLs with fragments", () => {
    expect(getAudioMimeType("https://example.com/audio.ogg#t=30")).toBe("audio/ogg");
  });

  test("falls back to audio/* for unknown extensions", () => {
    expect(getAudioMimeType("https://example.com/audio.xyz")).toBe("audio/*");
  });

  test("falls back to audio/* when no extension", () => {
    expect(getAudioMimeType("https://example.com/audio")).toBe("audio/*");
  });

  test("handles relative URLs", () => {
    expect(getAudioMimeType("/audio/sample.mp3")).toBe("audio/mpeg");
  });

  test("handles case insensitivity", () => {
    expect(getAudioMimeType("https://example.com/AUDIO.MP3")).toBe("audio/mpeg");
  });
});
