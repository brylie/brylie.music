import type { CollectionEntry } from "astro:content";
import { generateAppSchema } from "./appSchema";

/**
 * Generates Schema.org CollectionPage structured data for a collection of apps
 */
export function generateCollectionPageSchema(
  pageTitle: string,
  description: string,
  url: string,
  breadcrumbSchema: object,
  apps: CollectionEntry<"apps">[],
  siteUrl: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: pageTitle,
    description: description,
    url: url,
    breadcrumb: breadcrumbSchema,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: apps.length,
      itemListElement: apps.map((app, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: generateAppSchema(
          app,
          new URL(`/apps/${app.id}`, siteUrl).href
        ),
      })),
    },
  };
}
