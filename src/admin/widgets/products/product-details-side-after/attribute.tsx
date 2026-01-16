import { defineWidgetConfig } from '@medusajs/admin-sdk';
import type { AdminProduct, HttpTypes } from '@medusajs/framework/types';
import { PencilSquare } from '@medusajs/icons';
import { Container, Heading, Text } from '@medusajs/ui';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActionMenu } from '../../../components/common/action-menu';
import { SectionRow } from '../../../components/common/section';
import { useProductAttributes } from '../../../hooks/api/product-attributes';
import { sdk } from '../../../lib/client';
import {
	type MappedAttribute,
	mapProductAttributes,
} from '../../../utils/map-product-attributes';

const ProductAttributeWidget = ({ data }: { data: AdminProduct }) => {
	const { t } = useTranslation();
	const [attributes, setAttributes] = useState<Record<string, MappedAttribute>>(
		{},
	);

	const { data: productWithMetadata, isPending: isProductPending } = useQuery({
		queryFn: () =>
			sdk.client.fetch<HttpTypes.AdminProductResponse>(
				`/admin/products/${data.id}`,
			),
		queryKey: ['product-with-metadata', { id: data.id }],
	});

	const { attributes: productAttributeData, isPending: isAttributePending } =
		useProductAttributes({ status: 'true' });

	// when productWithMetadata and productAttributeData change map the custom attributes
	useEffect(() => {
		if (!productWithMetadata || !productAttributeData) return;

		const productMetadata = productWithMetadata.product.metadata;
		const mapped = mapProductAttributes(productMetadata, productAttributeData);
		setAttributes(mapped);
	}, [productWithMetadata, productAttributeData]);

	if (isProductPending || isAttributePending) return <Text>Loading...</Text>;

	return (
		<div className='flex flex-col gap-y-3'>
			<Container className='divide-y p-0'>
				<div className='flex items-center justify-between px-6 py-4'>
					<Heading level='h2'>Custom Attributes</Heading>
					<ActionMenu
						groups={[
							{
								actions: [
									{
										label: t('actions.assign_edit', 'Assign Attributes & Edit'),
										to: 'custom-attributes',
										icon: <PencilSquare />,
									},
								],
							},
						]}
					/>
				</div>

				{Object.entries(attributes).length > 0 ? (
					Object.entries(attributes).map(([key, attribute]) => {
						// Handle new attribute structure
						const attrValue =
							typeof attribute === 'object' && attribute !== null
								? (attribute as { value: string; isDefault: boolean })
								: { value: String(attribute), isDefault: false };

						return (
							<SectionRow
								key={key}
								title={key}
								value={attrValue.value || '-'}
							/>
						);
					})
				) : (
					<Text className='px-6 py-4'>No custom attributes available.</Text>
				)}
			</Container>
		</div>
	);
};

export const config = defineWidgetConfig({
	zone: 'product.details.side.after',
});

export default ProductAttributeWidget;
