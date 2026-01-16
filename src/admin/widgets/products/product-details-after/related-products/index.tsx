import { defineWidgetConfig } from '@medusajs/admin-sdk';
import type { HttpTypes } from '@medusajs/framework/types';
import { Plus } from '@medusajs/icons';
import {
	Button,
	Container,
	Heading,
	StatusBadge,
	Text,
	Tooltip,
	toast,
} from '@medusajs/ui';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { ActionMenu } from '../../../../components/common/action-menu';
import { SortableList } from '../../../../components/common/sortable-list';
import { Thumbnail } from '../../../../components/common/thumbnail';
import { CollectionCell } from '../../../../components/table/table-cells/product/collection-cell';
import { SalesChannelsCell } from '../../../../components/table/table-cells/product/sales-channels-cell';
import { VariantCell } from '../../../../components/table/table-cells/product/variant-cell';
import { sdk } from '../../../../lib/client';

const RelatedProductsWidget = () => {
	const { t } = useTranslation();
	const { id } = useParams();
	const [products] = useState<HttpTypes.AdminProduct[]>([]);
	const [filteredData, setFilteredData] = useState<HttpTypes.AdminProduct[]>(
		[],
	);
	const [hasReordered, setHasReordered] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);
	const [totalItems, setTotalItems] = useState(0);
	const ITEMS_PER_PAGE = 20;

	const fetchRelatedProducts = useCallback(
		async (resetPage = true, pageToUse = page) => {
			if (!id) return;

			try {
				setIsLoading(true);

				const { product } = await sdk.admin.product.retrieve(id);
				const relatedProductIds =
					(product?.metadata?.related_products as string[]) || [];

				// Handle empty related products case
				if (relatedProductIds.length === 0) {
					setFilteredData([]);
					setHasMore(false);
					setTotalItems(0);
					return;
				}

				// Set the total count of related products
				setTotalItems(relatedProductIds.length);

				// Calculate pagination values
				const currentPage = resetPage ? 1 : pageToUse;
				const limit = ITEMS_PER_PAGE;
				const offset = (currentPage - 1) * limit;

				// Get IDs for the current page
				const paginatedIds = relatedProductIds.slice(offset, offset + limit);

				// Fetch products for the current page
				const { products } = await sdk.admin.product.list({
					id: paginatedIds,
				});

				// Sort products according to the order in relatedProductIds
				const sortedProducts = paginatedIds
					.map((id) => products.find((product) => product.id === id))
					.filter(Boolean) as HttpTypes.AdminProduct[];

				// Update filtered data based on pagination
				setFilteredData((prevData) =>
					resetPage ? sortedProducts : [...prevData, ...sortedProducts],
				);

				// Update pagination state
				setHasMore(offset + limit < relatedProductIds.length);
				if (resetPage) {
					setPage(1);
				}

				setHasReordered(false);
			} catch (error) {
				console.error('Error fetching related products:', error);
				toast.error('Failed to fetch related products');
			} finally {
				setIsLoading(false);
			}
		},
		[id, page],
	);

	//biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		fetchRelatedProducts(true);
	}, []);

	const handleReorder = useCallback(
		(items: HttpTypes.AdminProduct[]) => {
			const reorderedData = items
				.map((item) => filteredData.find((product) => product.id === item.id))
				.filter((product): product is HttpTypes.AdminProduct => !!product);

			setFilteredData(reorderedData);
			setHasReordered(true);
		},
		[filteredData],
	);

	const handleLoadMore = () => {
		const nextPage = page + 1;
		setPage(nextPage);
		fetchRelatedProducts(false, nextPage);
	};

	const handleSave = async () => {
		if (!id) return;
		try {
			const updatedMetadata = {
				...products[0]?.metadata,
				related_products: filteredData.map((p) => p.id),
			};

			await sdk.admin.product.update(id, {
				metadata: updatedMetadata,
			});

			toast.success('Related products were successfully updated.');
			setHasReordered(false);
		} catch (error) {
			console.error('Error updating related products:', error);
			toast.error('Failed to update related products');
		}
	};

	type StatusColor = 'grey' | 'blue' | 'green' | 'red';
	const renderStatus = (status: string) => {
		const statusMap = {
			draft: { color: 'grey', text: status },
			proposed: { color: 'blue', text: status },
			published: { color: 'green', text: status },
			rejected: { color: 'red', text: status },
		};

		const statusConfig = statusMap[status as keyof typeof statusMap];
		if (!statusConfig) return null;

		return (
			<StatusBadge color={statusConfig.color as StatusColor}>
				{statusConfig.text}
			</StatusBadge>
		);
	};

	return (
		<Container className='divide-y p-0'>
			<div className='flex items-center justify-between px-6 py-4'>
				<div className='flex items-center gap-2'>
					<Heading level='h2'>Related Products</Heading>
				</div>
				<div className='flex items-center gap-2'>
					{hasReordered && (
						<Button variant='primary' size='small' onClick={handleSave}>
							Save
						</Button>
					)}
					<ActionMenu
						groups={[
							{
								actions: [
									{
										label: t('actions.add'),
										to: 'related-products',
										icon: <Plus />,
									},
								],
							},
						]}
					/>
				</div>
			</div>
			<div className='py-6 overflow-auto'>
				{filteredData.length === 0 ? (
					<div className='flex flex-col items-center justify-center py-12 text-ui-fg-subtle min-h-[300px]'>
						<h3 className='text-[13px] font-bold text-[#27272A] leading-relaxed'>
							No Records
						</h3>
						<div className='text-center text-[11px] text-[#4B5563] font-normal leading-relaxed'>
							There are no products in the category.
						</div>
					</div>
				) : (
					<div className='min-w-[850px] max-h-[500px] overflow-y-auto'>
						<div className='flex items-center gap-3 border-b px-6 py-3.5'>
							<div className='w-[28px]' />
							<div className='w-[60px]'>
								<Text size='small' leading='compact' weight='plus'>
									No.
								</Text>
							</div>
							<div className='w-[176px]'>
								<Text size='small' leading='compact' weight='plus'>
									Product
								</Text>
							</div>
							<div className='flex-1'>
								<Text size='small' leading='compact' weight='plus'>
									Collection
								</Text>
							</div>
							<div className='flex-1'>
								<Text size='small' leading='compact' weight='plus'>
									Sales Channels
								</Text>
							</div>
							<div className='flex-1'>
								<Text size='small' leading='compact' weight='plus'>
									Variants
								</Text>
							</div>
							<div className='w-[100px]'>
								<Text size='small' leading='compact' weight='plus'>
									Status
								</Text>
							</div>
						</div>
						<SortableList
							items={filteredData}
							onChange={handleReorder}
							renderItem={(product, index) => (
								<SortableList.Item
									id={product.id}
									className='bg-ui-bg-base border-b'
								>
									<div className='text-ui-fg-subtle flex w-full items-center gap-3 px-6 py-3.5 text-[13px]'>
										<div className='w-[28px]'>
											<SortableList.DragHandle />
										</div>
										<div className='w-[60px]'>{index + 1}</div>
										<div className='w-[176px] flex gap-x-3 items-center h-full'>
											<div className='w-fit flex-shrink-0'>
												<Thumbnail src={product.thumbnail} />
											</div>
											<Tooltip content={product.title}>
												<span className='truncate max-w-[140px] block'>
													{product.title}
												</span>
											</Tooltip>
										</div>
										<div className='flex-1'>
											<span className='truncate text-center'>
												<CollectionCell collection={product.collection} />
											</span>
										</div>
										<div className='flex-1'>
											<span className='truncate'>
												<SalesChannelsCell
													salesChannels={product.sales_channels}
												/>
											</span>
										</div>
										<div className='flex-1'>
											<span className='truncate text-center'>
												<VariantCell variants={product.variants} />
											</span>
										</div>
										<div className='w-[100px]'>
											<span className='truncate capitalize'>
												{product.status && renderStatus(product.status)}
											</span>
										</div>
									</div>
								</SortableList.Item>
							)}
						/>
						<div className='flex flex-col items-center py-4 gap-2'>
							<div className='text-ui-fg-subtle text-[13px] px-6 self-start'>
								Showing {filteredData.length} of {totalItems} items
							</div>
							{hasMore && (
								<Button
									variant='secondary'
									size='small'
									onClick={handleLoadMore}
									disabled={isLoading}
								>
									{isLoading ? 'Loading...' : 'Load More'}
								</Button>
							)}
						</div>
					</div>
				)}
			</div>
		</Container>
	);
};

export const config = defineWidgetConfig({
	zone: 'product.details.after',
});

export default RelatedProductsWidget;
