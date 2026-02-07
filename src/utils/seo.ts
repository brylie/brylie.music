/**
 * SEO utilities for generating and validating metadata
 */

export interface SEOData {
  title: string;
  description: string;
  keywords?: string[];
  author?: string;
  canonicalURL?: string;
  robots?: string;
}

/**
 * Validates and formats SEO metadata
 */
export class SEOHelper {
  /**
   * Validates that the title is within SEO best practices length
   */
  static validateTitle(title: string): { isValid: boolean; message?: string } {
    if (title.length > 60) {
      return {
        isValid: false,
        message: `Title is ${title.length} characters. Consider keeping it under 60 characters for optimal search results display.`
      };
    }
    return { isValid: true };
  }

  /**
   * Validates that the description is within SEO best practices length
   */
  static validateDescription(description: string): { isValid: boolean; message?: string } {
    if (description.length > 160) {
      return {
        isValid: false,
        message: `Description is ${description.length} characters. Consider keeping it under 160 characters for optimal search results display.`
      };
    }
    if (description.length < 120) {
      return {
        isValid: false,
        message: `Description is ${description.length} characters. Consider making it at least 120 characters for better search results display.`
      };
    }
    return { isValid: true };
  }

  /**
   * Generates keyword suggestions based on title and description
   */
  static suggestKeywords(title: string, description: string): string[] {
    const text = `${title} ${description}`.toLowerCase();
    const words = text
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3)
      .filter(word => !['this', 'that', 'with', 'from', 'they', 'been', 'have', 'will', 'your', 'what', 'when', 'where'].includes(word));
    
    // Get unique words and sort by frequency
    const wordCount = words.reduce((acc, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(wordCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([word]) => word);
  }

  /**
   * Creates a complete SEO metadata object with validation
   */
  static createSEOData(data: SEOData): SEOData & { warnings: string[] } {
    const warnings: string[] = [];

    // Validate title
    const titleValidation = this.validateTitle(data.title);
    if (!titleValidation.isValid && titleValidation.message) {
      warnings.push(titleValidation.message);
    }

    // Validate description
    const descriptionValidation = this.validateDescription(data.description);
    if (!descriptionValidation.isValid && descriptionValidation.message) {
      warnings.push(descriptionValidation.message);
    }

    // Validate canonical URL format
    if (data.canonicalURL) {
      try {
        new URL(data.canonicalURL);
      } catch {
        warnings.push('Canonical URL is not a valid URL format.');
      }
    }

    // Validate keywords count
    if (data.keywords && data.keywords.length > 10) {
      warnings.push('Consider limiting keywords to 10 or fewer for better focus.');
    }

    return {
      ...data,
      warnings
    };
  }

  /**
   * Generates structured data for articles
   */
  static generateArticleStructuredData(data: {
    title: string;
    description: string;
    author?: string;
    pubDate: Date;
    updatedDate?: Date;
    url: string;
    imageUrl?: string;
  }): object {
    return {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: data.title,
      description: data.description,
      author: data.author ? {
        '@type': 'Person',
        name: data.author
      } : undefined,
      datePublished: data.pubDate.toISOString(),
      dateModified: (data.updatedDate || data.pubDate).toISOString(),
      url: data.url,
      image: data.imageUrl,
    };
  }
}

/**
 * Default robots directives for different content types
 */
export const ROBOTS_DIRECTIVES = {
  DEFAULT: 'index, follow',
  NO_INDEX: 'noindex, follow',
  NO_FOLLOW: 'index, nofollow',
  NO_INDEX_NO_FOLLOW: 'noindex, nofollow',
  NO_CACHE: 'index, follow, noarchive',
} as const;

/**
 * Common SEO metadata for different page types
 */
export const SEO_DEFAULTS = {
  BLOG_POST: {
    robots: ROBOTS_DIRECTIVES.DEFAULT,
  },
  LANDING_PAGE: {
    robots: ROBOTS_DIRECTIVES.DEFAULT,
  },
  DRAFT_CONTENT: {
    robots: ROBOTS_DIRECTIVES.NO_INDEX,
  },
} as const;

/**
 * Safely serializes JSON for embedding in HTML <script type="application/ld+json"> tags.
 * Prevents XSS by escaping script-breaking characters that could prematurely close the script tag.
 * 
 * @param data - The data to serialize
 * @returns A safe JSON string that can be used with set:html
 * 
 * @example
 * <script type="application/ld+json" set:html={safeJsonLdString(schemaData)} />
 */
export function safeJsonLdString(data: unknown): string {
  let json: string | undefined;
  
  try {
    json = JSON.stringify(data);
  } catch {
    // Handle serialization errors (e.g., circular references)
    return 'null';
  }
  
  // Handle undefined result from JSON.stringify
  if (json == null) {
    return 'null';
  }
  
  return json
    .replace(/</g, '\\u003c')  // Escape < to prevent </script> breaking
    .replace(/>/g, '\\u003e')  // Escape > for consistency
    .replace(/\u2028/g, '\\u2028')  // Escape line separator
    .replace(/\u2029/g, '\\u2029'); // Escape paragraph separator
}
