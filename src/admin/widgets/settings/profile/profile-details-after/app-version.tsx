import { defineWidgetConfig } from '@medusajs/admin-sdk';
import { clx, Container, Heading, Text } from '@medusajs/ui';
import { useQuery } from '@tanstack/react-query';
import { sdk } from '../../../../lib/client';
import { useEffect, useState } from 'react';

interface HealthCheck {
	version: string;
}

const initialVerions = [
	{
		name: 'API',
		version: '',
	},
	{
		name: 'Admin Dashboard',
		version: '',
	},
	{
		name: 'Strapi',
		version: '',
	},
];

const AppVersionSection = () => {
	const [versions, setVersions] = useState(initialVerions);

	const { data: healthCheckData } = useQuery({
		queryFn: () => sdk.client.fetch<HealthCheck>('/admin/health-check'),
		queryKey: ['admin.health-check'],
	});

	useEffect(() => {
		import('../../../../data.json').then((data) => {
			setVersions((prev) =>
				prev.map((v) => {
					if (v.name === 'Admin Dashboard') {
						return { ...v, version: data.version };
					}

					return v;
				}),
			);
		});

		if (healthCheckData) {
			setVersions((prev) =>
				prev.map((v) => {
					if (v.name === 'API') {
						return { ...v, version: healthCheckData.version };
					}

					return v;
				}),
			);
		}
	}, [healthCheckData]);

	return (
		<Container className='divide-y p-0'>
			<div className='flex items-center justify-between px-6 py-4'>
				<div>
					<Heading level='h2'>App Version</Heading>
				</div>
			</div>

			{versions.map((v) => (
				<div
					key={v.name}
					className={clx(
						'text-ui-fg-subtle grid grid-cols-2 items-center px-6 py-4',
					)}
				>
					<Text size='small' weight='plus' leading='compact'>
						{v.name}
					</Text>

					<Text
						size='small'
						leading='compact'
						className='whitespace-pre-line text-pretty'
					>
						{v.version}
					</Text>
				</div>
			))}
		</Container>
	);
};

export const config = defineWidgetConfig({
	zone: 'profile.details.after',
});

export default AppVersionSection;
