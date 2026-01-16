import { defineWidgetConfig } from '@medusajs/admin-sdk';
import { Container, Heading } from '@medusajs/ui';
import { Button, toast } from '@medusajs/ui';
import { ArrowPath } from '@medusajs/icons';
import type {
	AdminProduct,
	DetailWidgetProps,
} from '@medusajs/framework/types';
import { sdk } from '../../../../lib/client';

export function ButtonSecondary({ product }: { product: AdminProduct }) {
	const handleClick = () => {
		sync(product.id);
	};

	return (
		<Button
			type='button'
			onClick={handleClick}
			variant='secondary'
			className='w-1/5'
		>
			<ArrowPath className='mr-0' />
			Sync
		</Button>
	);
}

const ReSyncSearchEngineWidget = ({
	data,
}: DetailWidgetProps<AdminProduct>) => {
	return (
		<Container className='divide-y p-0'>
			<div className='flex items-center justify-between px-6 py-4'>
				<Heading level='h2'>Re-sync to Search engine</Heading>
				<ButtonSecondary product={data} />
			</div>
		</Container>
	);
};

export const config = defineWidgetConfig({
	zone: 'product.details.side.after',
});

export default ReSyncSearchEngineWidget;

const sync = async (id: string) => {
	toast.loading('Loading', {
		description: 'Syncing product to search engine',
	});

	await sdk.client
		.fetch(`/admin/manual/meilisearch/products/${id}`, {
			method: 'PATCH',
		})
		.then((_) => {
			setTimeout(() => {
				toast.dismiss();
				toast.success('Success', {
					description: 'Product synced to search engine',
				});
			}, 1500);
		})
		.catch((error) => {
			console.error(`Error: ${error?.message}`);
			toast.warning('Warning', {
				description: 'Something went wrong',
			});
		});
};
