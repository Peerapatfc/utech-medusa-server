import type { MedusaContainer } from '@medusajs/framework/types';
import { ContainerRegistrationKeys } from '@medusajs/framework/utils';

export const getChildrenCategoryIds = async ({
	container,
	categoryIds,
}: {
	container: MedusaContainer;
	categoryIds: string[];
}): Promise<string[]> => {
	const query = container.resolve(ContainerRegistrationKeys.QUERY);

	const { data: categories } = await query.graph({
		entity: 'product_category',
		fields: ['*'],
		filters: {
			parent_category_id: {
				$in: categoryIds,
			},
		},
	});

	const childrenIds = categories.map((category) => category.id);
	if (childrenIds.length) {
		const _childrenIds = await getChildrenCategoryIds({
			container,
			categoryIds: childrenIds,
		});
		return [...childrenIds, ..._childrenIds];
	}

	return childrenIds;
};

export const getAllChildCategoryIds = (
	parentId: string,
	allCategories: Array<{
		id: string;
		parent_category_id?: string | null;
	}>,
): string[] => {
	const childIds: string[] = [];
	const directChildren = allCategories.filter(
		(cat) => cat.parent_category_id === parentId,
	);

	for (const child of directChildren) {
		childIds.push(child.id);
		// Recursively get grandchildren
		childIds.push(...getAllChildCategoryIds(child.id, allCategories));
	}

	return childIds;
};
