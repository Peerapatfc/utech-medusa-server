import { useEffect, useState } from 'react';
import { Spinner } from '@medusajs/icons';
import { FocusModal, toast } from '@medusajs/ui';
import { useSortableTree } from '../../../../hooks/sortable-tree';
import SortableTree from '../../../../components/common/sortable-tree';
import { useTranslation } from 'react-i18next';
import type { ProductAttribute } from '@customTypes/attribute.ts';

const ProductAttributeOrganizeModal = () => {
	const { t } = useTranslation();
	const [updating, setUpdating] = useState(false);
	const [attributes, setAttributes] = useState<ProductAttribute[]>([]);

	useEffect(() => {
		const fetchAttributes = async () => {
			try {
				const response = await fetch('/admin/product-attributes', {
					credentials: 'include',
				});
				const data = await response.json();
				setAttributes(data.attributes);
			} catch (error) {
				console.error('Error fetching attributes:', error);
			}
		};
		fetchAttributes();
		document.addEventListener('fetchAttributes', fetchAttributes);
		return () => {
			document.removeEventListener('fetchAttributes', fetchAttributes);
		};
	}, []);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		const fetchData = async () => {
			if (updating) {
				const payload = attributes.map((attribute, index) => {
					return {
						id: attribute.id,
						rank: index,
					};
				});
				fetch('/admin/product-attributes', {
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(payload),
				})
					.then(() => {
						toast.success(t('general.success'), {
							description: 'Product Attribute rank updated.',
						});
					})
					.catch((error) => {
						console.error('Error:', error);
						toast.error(t('general.error'), {
							description: error.message,
						});
					});
				window.dispatchEvent(new CustomEvent('fetchAttributes'));
			}
		};
		fetchData();
	}, [updating, attributes]);

	const updateRank = async (_rank: number, _item: ProductAttribute) => {
		setUpdating(true);
	};

	const { handleRankChange, isLoading: isLoadingSort } = useSortableTree({
		updateRank,
		setItems: setAttributes,
	});

	return (
		<FocusModal.Content>
			<FocusModal.Header>
				{isLoadingSort ? (
					<Spinner className='animate-spin' />
				) : (
					<h1>Organize Product Attribute</h1>
				)}
			</FocusModal.Header>
			<FocusModal.Body className='bg-ui-bg-subtle flex flex-1 flex-col overflow-y-auto max-h-dvh'>
				<FocusModal.Title className='sr-only' />
				<div className='p-3 '>
					{attributes.length > 0 ? (
						<SortableTree items={attributes} onChange={handleRankChange} />
					) : (
						<div className='flex flex-col gap-y-[10px]'>
							<div className='border rounded-[5px] h-[46px] mx-[10px] bg-gray-300 animate-pulse' />
							<div className='border rounded-[5px] h-[46px] mx-[10px] bg-gray-300 animate-pulse' />
							<div className='border rounded-[5px] h-[46px] mx-[10px] bg-gray-300 animate-pulse' />
						</div>
					)}
				</div>
			</FocusModal.Body>
		</FocusModal.Content>
	);
};

export default ProductAttributeOrganizeModal;
