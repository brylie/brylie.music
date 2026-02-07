import type { CollectionEntry } from "astro:content";

/**
 * Generates Schema.org SoftwareApplication structured data for an app
 */
export function generateAppSchema(
  app: CollectionEntry<"apps">,
  appUrl: string
) {
  // Determine operating systems based on available platforms
  const operatingSystems = [];
  if (!app.data.appStoreUrl && !app.data.playStoreUrl) {
    // Web-only app
    operatingSystems.push("Web Browser");
  } else {
    // Mobile app with optional web version
    if (app.data.appStoreUrl) operatingSystems.push("iOS");
    if (app.data.playStoreUrl) operatingSystems.push("Android");
    if (app.data.webUrl) operatingSystems.push("Web Browser");
  }

  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: app.data.title,
    description: app.data.description,
    url: appUrl,
    applicationCategory: "MultimediaApplication",
    operatingSystem: operatingSystems.join(", "),
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    // Only include browserRequirements for web apps
    ...(operatingSystems.includes("Web Browser") && {
      browserRequirements: "Requires JavaScript. HTML5 compatible browser.",
    }),
    // Add app store URLs if available
    downloadUrl:
      app.data.appStoreUrl || app.data.playStoreUrl || app.data.webUrl,
    keywords: app.data.keywords?.join(", "),
  };
}
