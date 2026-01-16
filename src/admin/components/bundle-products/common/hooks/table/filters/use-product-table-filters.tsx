import { useTranslation } from 'react-i18next';
import type { Filter } from '../../../../../table/data-table/data-table-filter';
import { useProductTypes } from '../../../../../../hooks/api/product-types';
import { useProductTags } from '../../../../../../hooks/api/tags';
import { useSalesChannels } from '../../../../../../hooks/api/sales-channels';

const excludeableFields = [
	'sales_channel_id',
	'collections',
	'categories',
	'product_types',
	'product_tags',
] as const;

export const useProductTableFilters = (
	exclude?: (typeof excludeableFields)[number][],
) => {
	const { t } = useTranslation();

	const isProductTypeExcluded = exclude?.includes('product_types');

	const { product_types } = useProductTypes(
		{
			limit: 1000,
			offset: 0,
		},
		{
			enabled: !isProductTypeExcluded,
		},
	);

	const isProductTagExcluded = exclude?.includes('product_tags');

	const { product_tags } = useProductTags({
		limit: 1000,
		offset: 0,
	});

	const isSalesChannelExcluded = exclude?.includes('sales_channel_id');

	const { sales_channels } = useSalesChannels(
		{
			limit: 1000,
			fields: 'id,name',
		},
		{
			enabled: !isSalesChannelExcluded,
		},
	);

	let filters: Filter[] = [];

	if (product_types && !isProductTypeExcluded) {
		const typeFilter: Filter = {
			key: 'type_id',
			label: t('fields.type'),
			type: 'select',
			multiple: true,
			options: product_types.map((t) => ({
				label: t.value,
				value: t.id,
			})),
		};

		filters = [...filters, typeFilter];
	}

	if (product_tags && !isProductTagExcluded) {
		const tagFilter: Filter = {
			key: 'tag_id',
			label: t('fields.tag'),
			type: 'select',
			multiple: true,
			options: product_tags.map((t) => ({
				label: t.value,
				value: t.id,
			})),
		};

		filters = [...filters, tagFilter];
	}

	if (sales_channels) {
		const salesChannelFilter: Filter = {
			key: 'sales_channel_id',
			label: t('fields.salesChannel'),
			type: 'select',
			multiple: true,
			options: sales_channels.map((s) => ({
				label: s.name,
				value: s.id,
			})),
		};

		filters = [...filters, salesChannelFilter];
	}

	const dateFilters: Filter[] = [
		{ label: t('fields.createdAt'), key: 'created_at' },
		{ label: t('fields.updatedAt'), key: 'updated_at' },
	].map((f) => ({
		key: f.key,
		label: f.label,
		type: 'date',
	}));

	filters = [...filters, ...dateFilters];

	return filters;
};
