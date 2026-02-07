import { describe, test, expect } from "vitest";
import { generateCollectionPageSchema } from "./collectionSchema";
import type { CollectionEntry } from "astro:content";

describe("generateCollectionPageSchema", () => {
  const mockApps: CollectionEntry<"apps">[] = [
    {
      id: "test-app",
      collection: "apps",
      data: {
        title: "Test App",
        description: "A test application",
        category: "utility",
        keywords: ["test", "app"],
      },
    } as CollectionEntry<"apps">,
  ];

  const mockBreadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [],
  };

  test("generates valid CollectionPage schema", () => {
    const schema = generateCollectionPageSchema(
      "Test Collection",
      "Test description",
      "https://example.com/apps",
      mockBreadcrumbSchema,
      mockApps,
      "https://example.com"
    );

    expect(schema["@context"]).toBe("https://schema.org");
    expect(schema["@type"]).toBe("CollectionPage");
    expect(schema.name).toBe("Test Collection");
    expect(schema.description).toBe("Test description");
    expect(schema.url).toBe("https://example.com/apps");
  });

  test("includes breadcrumb schema", () => {
    const schema = generateCollectionPageSchema(
      "Test Collection",
      "Test description",
      "https://example.com/apps",
      mockBreadcrumbSchema,
      mockApps,
      "https://example.com"
    );

    expect(schema.breadcrumb).toEqual(mockBreadcrumbSchema);
  });

  test("generates ItemList with correct number of items", () => {
    const schema = generateCollectionPageSchema(
      "Test Collection",
      "Test description",
      "https://example.com/apps",
      mockBreadcrumbSchema,
      mockApps,
      "https://example.com"
    );

    expect(schema.mainEntity["@type"]).toBe("ItemList");
    expect(schema.mainEntity.numberOfItems).toBe(1);
    expect(schema.mainEntity.itemListElement).toHaveLength(1);
  });

  test("generates ListItem elements with correct positions", () => {
    const multipleApps = [
      ...mockApps,
      {
        id: "second-app",
        collection: "apps",
        data: {
          title: "Second App",
          description: "Another test app",
          category: "creative",
        },
      } as CollectionEntry<"apps">,
    ];

    const schema = generateCollectionPageSchema(
      "Test Collection",
      "Test description",
      "https://example.com/apps",
      mockBreadcrumbSchema,
      multipleApps,
      "https://example.com"
    );

    expect(schema.mainEntity.itemListElement[0]["@type"]).toBe("ListItem");
    expect(schema.mainEntity.itemListElement[0].position).toBe(1);
    expect(schema.mainEntity.itemListElement[1].position).toBe(2);
  });

  test("generates app schemas for each item", () => {
    const schema = generateCollectionPageSchema(
      "Test Collection",
      "Test description",
      "https://example.com/apps",
      mockBreadcrumbSchema,
      mockApps,
      "https://example.com"
    );

    const firstItem = schema.mainEntity.itemListElement[0].item;
    expect(firstItem["@type"]).toBe("SoftwareApplication");
    expect(firstItem.name).toBe("Test App");
    expect(firstItem.description).toBe("A test application");
  });
});
