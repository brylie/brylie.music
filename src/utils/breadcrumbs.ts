/**
 * Breadcrumb utilities for generating schema.org structured data
 */

export interface BreadcrumbItem {
	name: string;
	href: string;
	current?: boolean;
}

/**
 * Generate schema.org BreadcrumbList structured data from breadcrumb items
 */
export function generateBreadcrumbSchema(items: BreadcrumbItem[]) {
	return {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: items.map((item, index) => ({
			"@type": "ListItem",
			position: index + 1,
			name: item.name,
			item: item.href,
		})),
	};
}
