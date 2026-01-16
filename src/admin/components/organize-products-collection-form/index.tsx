import { useCallback, useEffect, useState } from 'react';
import { RouteFocusModal } from '../../components/modals/route-focus-modal';
import { useProducts } from '../../../admin/hooks/api/products';
import type { ProductMetadataT, ProductT } from '../../../types/products';
import SortableTree from '../common/sortable-tree';
import { Spinner } from '@medusajs/icons';
import { useSortableTree } from '../../hooks/sortable-tree';

const OrganizeProductsCollectionForm = ({
	collectionId,
}: { collectionId: string }) => {
	const [products, setProducts] = useState<ProductT[]>([]);

	const { products: productList, isFetching } = useProducts(
		{
			collection_id: [collectionId],
		},
		{ staleTime: 0 },
	);

	useEffect(() => {
		const rankedProducts = ((productList as ProductT[]) || []).sort((a, b) => {
			const rankA =
				(a.metadata?.collection_rank as number) ?? Number.MAX_SAFE_INTEGER;
			const rankB =
				(b.metadata?.collection_rank as number) ?? Number.MAX_SAFE_INTEGER;
			return rankA - rankB;
		});
		setProducts(rankedProducts);
		console.log('useEffect : ', rankedProducts);
	}, [productList]);

	const updateRank = useCallback(async (rank: number, product: ProductT) => {
		const metadata: ProductMetadataT = {
			...product.metadata,
			collection_rank: rank,
		};

		const response = await fetch(`/admin/products/${product.id}`, {
			credentials: 'include',
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				metadata,
			}),
		});

		if (!response.ok) {
			throw new Error('Failed to update rank for Products collection');
		}
	}, []);

	const { handleRankChange, isLoading } = useSortableTree({
		updateRank,
		setItems: setProducts,
		successMessage: 'Update ranking products success',
		errorMessage: 'Update ranking products failed',
	});

	return (
		<div className='flex h-full flex-col overflow-hidden'>
			<RouteFocusModal.Header>
				{isFetching || isLoading ? (
					<Spinner className='animate-spin' />
				) : (
					<h1>Organize Productions Collection</h1>
				)}
			</RouteFocusModal.Header>

			<RouteFocusModal.Body className='bg-ui-bg-subtle flex flex-1 flex-col overflow-y-auto'>
				<RouteFocusModal.Title className='sr-only' />
				<div className='p-3 '>
					{!isFetching ? (
						<SortableTree items={products} onChange={handleRankChange} />
					) : (
						<div className='flex flex-col gap-y-[10px]'>
							<div className='border rounded-[5px] h-[65px] mx-[10px] bg-gray-300 animate-pulse' />
							<div className='border rounded-[5px] h-[65px] mx-[10px] bg-gray-300 animate-pulse' />
							<div className='border rounded-[5px] h-[65px] mx-[10px] bg-gray-300 animate-pulse' />
						</div>
					)}
				</div>
			</RouteFocusModal.Body>
		</div>
	);
};

export default OrganizeProductsCollectionForm;
