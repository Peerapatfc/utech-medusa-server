import { defineWidgetConfig } from '@medusajs/admin-sdk';
import { Container, Heading } from '@medusajs/ui';
import { Button, toast } from '@medusajs/ui';
import { BuildingStorefront } from '@medusajs/icons';
import type {
	AdminProduct,
	DetailWidgetProps,
} from '@medusajs/framework/types';
import { useQuery } from '@tanstack/react-query';
import { sdk } from '../../../../lib/client';
import { useEffect, useState } from 'react';

interface HealthCheck {
	backendUrl: string;
	storefrontUrl: string;
}

const PreviewOnStorefrontWidget = ({
	data,
}: DetailWidgetProps<AdminProduct>) => {
	if (data.status !== 'published') {
		return null;
	}

	const { data: healthCheckData } = useQuery({
		queryFn: () => sdk.client.fetch<HealthCheck>('/admin/health-check'),
		queryKey: ['admin.health-check'],
	});

	const [storefrontUrl, setStorefrontUrl] = useState('');
	useEffect(() => {
		if (healthCheckData) {
			setStorefrontUrl(healthCheckData.storefrontUrl);
		}
	}, [healthCheckData]);

	const handleClick = () => {
		toast.success('Redirecting to Storefront');
		window.open(`${storefrontUrl}/products/${data.handle}`, '_blank');
	};

	return (
		<Container className='divide-y p-0'>
			<div className='flex items-center justify-between px-6 py-4'>
				<Heading level='h2'>Preview on Storefront</Heading>
				{healthCheckData && (
					<Button
						type='button'
						onClick={handleClick}
						variant='secondary'
						className='w-1/5'
					>
						<BuildingStorefront className='mr-0' />
						Open
					</Button>
				)}
			</div>
		</Container>
	);
};

export const config = defineWidgetConfig({
	zone: 'product.details.side.after',
});

export default PreviewOnStorefrontWidget;
