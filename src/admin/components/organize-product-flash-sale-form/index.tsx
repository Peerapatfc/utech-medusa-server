import { Spinner } from '@medusajs/icons';
import { toast } from '@medusajs/ui';
import { useCallback, useEffect, useState } from 'react';
import { useProducts } from '../../../admin/hooks/api/products';
import type { AdminPriceList } from '../../../types/price-list-custom';
import type { ProductT } from '../../../types/products';
import { useSortableTree } from '../../hooks/sortable-tree';
import { sdk } from '../../lib/client';
import SortableTree from '../common/sortable-tree';
import { RouteFocusModal } from '../modals/route-focus-modal';

const OrganizeFlashSaleForm = ({ priceListId }: { priceListId: string }) => {
	const [products, setProducts] = useState<ProductT[]>([]);
	const [updating, setUpdating] = useState(false);
	const successMessage = 'Update ranking products success';
	const errorMessage = 'Update ranking products failed';
	const [priceList, setPriceList] = useState<AdminPriceList | null>(null);

	const getFlashSale = useCallback(async (id: string) => {
		try {
			const response = await sdk.admin.priceList.retrieve(id, {
				fields: '+price_list_custom.products',
			});

			setPriceList(response.price_list as AdminPriceList);
		} catch (error) {
			console.error('Error fetching flash sale:', error);
		}
	}, []);

	useEffect(() => {
		if (priceListId) {
			getFlashSale(priceListId);
		}
	}, [priceListId, getFlashSale]);

	const price_list = priceList as AdminPriceList;
	const { products: productList, isFetching } = useProducts(
		{
			price_list_id: price_list?.id ? [price_list.id] : [],
		},
		{ enabled: !!price_list?.id, staleTime: 0 },
	);

	const productListOriginal = price_list?.price_list_custom?.products ?? [];
	const productSecond = productList ?? [];
	const rankMap = new Map(
		productListOriginal.map((item) => [item.id, item.rank]),
	);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		const rankedProducts = productSecond.sort((a, b) => {
			return (
				(rankMap.get(a.id) ?? Number.MAX_SAFE_INTEGER) -
				(rankMap.get(b.id) ?? Number.MAX_SAFE_INTEGER)
			);
		});
		setProducts(rankedProducts as ProductT[]);
	}, [productList]);

	const updateRank = async (_rank: number, _item: ProductT) => {
		setUpdating(true);
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	const updateProducts = useCallback(
		async (payload: { id: string; rank: number }[]) => {
			try {
				const response = await fetch(
					`/admin/custom/flash-sales/${priceListId}/rank`,
					{
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({
							price_list_id: price_list?.price_list_custom.id,
							product_update: payload,
						}),
					},
				);

				const result = await response.json();
				toast.success(successMessage, {
					position: 'top-center',
				});

				if (!response.ok) throw new Error(result.error);
			} catch (error) {
				toast.error(errorMessage, {
					position: 'top-center',
				});
				console.error('Failed to update product order:', error);
			}
		},
		[price_list?.price_list_custom.id],
	);

	const { handleRankChange, isLoading } = useSortableTree({
		updateRank,
		setItems: setProducts,
	});

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		if (
			updating &&
			price_list.price_list_custom &&
			price_list.price_list_custom.id
		) {
			const payload = products.map((product, index) => {
				return {
					id: product.id,
					rank: index,
				};
			});
			setTimeout(async () => {
				await updateProducts(payload);
				setUpdating(false);
			}, 500);
		}
	}, [updating, price_list]);

	return (
		<RouteFocusModal>
			<RouteFocusModal.Header>
				{isFetching || isLoading || updating ? (
					<Spinner className='animate-spin' />
				) : (
					<h1>Organize Product Flash Sale</h1>
				)}
			</RouteFocusModal.Header>
			<RouteFocusModal.Body className='bg-ui-bg-subtle flex flex-1 flex-col max-h-dvh overflow-y-auto   '>
				<RouteFocusModal.Title className='sr-only' />
				<div className='p-3 '>
					{!isFetching && products.length > 0 ? (
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
		</RouteFocusModal>
	);
};

export default OrganizeFlashSaleForm;
