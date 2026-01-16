import { ArrowPath } from '@medusajs/icons';
import { useState } from 'react';
import { toast } from '@medusajs/ui';
import { sdk } from '../../../../../lib/client';

export const SyncData = () => {
	const [isSyncingProducts, setIsSyncingProducts] = useState(false);

	const handleSyncProduct = async () => {
		setIsSyncingProducts(true);

		try {
			await sdk.client.fetch('/admin/sync/products', {
				method: 'POST',
				credentials: 'include',
			});
			await new Promise((resolve) => setTimeout(resolve, 2000));

			toast.success('Sync Products completed', {
				position: 'top-center',
			});
		} catch (err: any) {
			toast.error(`Sync failed: ${err?.message || 'Unknown error'}`, {
				position: 'top-center',
			});
		} finally {
			setIsSyncingProducts(false);
		}
	};

	return (
		<li>
			<span className='block p-2 bg-ui-bg-subtle rounded-md font-medium'>
				Sync Data
			</span>
			<ul className='ml-4 space-y-1'>
				<li>
					<button
						onClick={handleSyncProduct}
						type='button'
						className='inline-flex items-center gap-2 px-4 py-2 rounded-md p-2 font-medium text-blue-600'
					>
						{isSyncingProducts && (
							<>
								<span>Syncing Products...</span>
								<ArrowPath className='animate-spin' />
							</>
						)}
						{!isSyncingProducts && (
							<>
								<span>Sync Products</span>
								<ArrowPath />
							</>
						)}
					</button>
				</li>
			</ul>
		</li>
	);
};
