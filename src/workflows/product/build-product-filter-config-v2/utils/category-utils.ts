/**
 * Utility functions for category operations
 */

export interface Category {
	id: string;
	parent_category_id?: string;
	name?: string;
	is_active?: boolean;
	handle?: string;
	rank?: number;
}

/**
 * Get all descendant category IDs for a given parent category
 * @param parentId - The parent category ID
 * @param childrenMap - Map of parent category ID to its children
 * @param visited - Set to track visited categories to prevent infinite loops
 * @returns Array of descendant category IDs
 */
export const getAllDescendantIds = (
	parentId: string,
	childrenMap: Map<string, Category[]>,
	visited = new Set<string>(),
): string[] => {
	if (visited.has(parentId)) {
		return [];
	}
	visited.add(parentId);

	const children = childrenMap.get(parentId) || [];
	const allIds: string[] = [];

	for (const child of children) {
		allIds.push(child.id);
		allIds.push(...getAllDescendantIds(child.id, childrenMap, visited));
	}

	return allIds;
};

/**
 * Build a children map from categories array
 * @param categories - Array of all categories
 * @returns Map of parent category ID to its children
 */
export const buildChildrenMap = (
	categories: Category[],
): Map<string, Category[]> => {
	const childrenMap = new Map<string, Category[]>();

	for (const cat of categories) {
		if (cat.parent_category_id) {
			if (!childrenMap.has(cat.parent_category_id)) {
				childrenMap.set(cat.parent_category_id, []);
			}
			childrenMap.get(cat.parent_category_id)?.push(cat);
		}
	}

	return childrenMap;
};
