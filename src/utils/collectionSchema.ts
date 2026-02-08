import type { CollectionEntry } from "astro:content";
import { generateAppSchema } from "./appSchema";
import { generateMediaSchema } from "./mediaSchema";

/**
 * Type for supported collection types
 */
type SupportedCollection = "apps" | "media";

/**
 * Generates Schema.org CollectionPage structured data for a collection
 * Supports multiple collection types (apps, media)
 */
export function generateCollectionPageSchema(
  pageTitle: string,
  description: string,
  url: string,
  breadcrumbSchema: object,
  items: CollectionEntry<"apps">[] | CollectionEntry<"media">[],
  siteUrl: string,
  collectionType: SupportedCollection = "apps"
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
      numberOfItems: items.length,
      itemListElement: items.map((item, index) => {
        let itemSchema: any;
        
        // Generate appropriate schema based on collection type
        if (collectionType === "apps") {
          const app = item as CollectionEntry<"apps">;
          const { '@context': _, ...appSchema } = generateAppSchema(
            app,
            new URL(`/apps/${app.id}`, siteUrl).href
          );
          itemSchema = appSchema;
        } else if (collectionType === "media") {
          const media = item as CollectionEntry<"media">;
          const { '@context': _, ...mediaSchema } = generateMediaSchema(
            media,
            new URL(`/media/${media.id}`, siteUrl).href,
            siteUrl
          );
          itemSchema = mediaSchema;
        }
        
        return {
          "@type": "ListItem",
          position: index + 1,
          item: itemSchema,
        };
      }),
    },
  };
}
