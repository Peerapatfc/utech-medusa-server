import { ArrowPath } from '@medusajs/icons';
import { useState } from 'react';
import { toast } from '@medusajs/ui';
import { sdk } from '../../../../../lib/client';

const CACHE_TAGS = [
	'products',
	'custom-products',
	'flash-sales',
	'products-labels',
	'products-filter',
	'product-attributes',
	'product-attributes-options',
	'categories',
	'custom-categories',
	'collections',
	'coupons',
	'nav-menus',
];
export const RevalidateCache = () => {
	const [isRevalidating, setIsRevalidating] = useState(false);
	const [tagRevalidating, setTagRevalidating] = useState<string | null>(null);

	const handleRevalidate = async (tag: string) => {
		setTagRevalidating(tag);
		setIsRevalidating(true);

		await new Promise((resolve) => setTimeout(resolve, 500));
		try {
			await sdk.client.fetch('/admin/manual/revalidate', {
				method: 'POST',
				credentials: 'include',
				body: { tags: [tag] },
			});
			toast.success('Revalidate cache completed', {
				position: 'top-center',
			});
		} catch (err: any) {
			toast.error(
				`Revalidate cache failed: ${err?.message || 'Unknown error'}`,
				{
					position: 'top-center',
				},
			);
		} finally {
			setIsRevalidating(false);
			setTagRevalidating(null);
		}
	};

	return (
		<li>
			<span className='block p-2 bg-ui-bg-subtle rounded-md font-medium'>
				Revalidate Cache
			</span>
			<ul className='ml-4 space-y-1'>
				{CACHE_TAGS.map((tag) => (
					<li key={tag}>
						<button
							onClick={() => handleRevalidate(tag)}
							type='button'
							className='inline-flex items-center gap-2 px-4 py-2 rounded-md p-2 font-medium text-blue-600'
						>
							<span>
								{tag
									.replace(/-/g, ' ')
									.replace(/\b\w/g, (c) => c.toUpperCase())}
							</span>
							{isRevalidating && tagRevalidating === tag && (
								<ArrowPath className='animate-spin' />
							)}
							{isRevalidating && tagRevalidating !== tag && <ArrowPath />}

							{!isRevalidating && <ArrowPath />}
						</button>
					</li>
				))}
			</ul>
		</li>
	);
};
