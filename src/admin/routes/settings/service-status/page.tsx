import { defineRouteConfig } from '@medusajs/admin-sdk';
import { Container, Heading, Table, Text } from '@medusajs/ui';
import { StatusCell } from '../../../components/table/table-cells/common/status-cell';

const ServiceStatusPage = () => {
	const services = [
		{
			service: 'Payment Gateway',
			provider: '2C2P',
			status: true,
			description: '',
		},
		{
			service: 'Mail Service',
			provider: 'SendGrid',
			status: true,
			description: '',
		},
		{
			service: 'CMS',
			provider: 'Strapi',
			status: true,
			description: '',
		},
		{
			service: 'Search Engine',
			provider: 'MeiliSearch',
			status: true,
			description: '',
		},
	];

	return (
		<Container>
			<Heading level='h1' className='inline-flex'>
				Service Status
			</Heading>
			<Text className='mt-1 font-normal font-sans txt-small text-ui-fg-subtle'>
				Here you can see the status of all the services that are running in the
				system.
			</Text>

			<div className='mt-5 mb-5'>
				<Table>
					<Table.Header>
						<Table.Row>
							<Table.HeaderCell>#</Table.HeaderCell>
							<Table.HeaderCell>Status</Table.HeaderCell>
							<Table.HeaderCell>Service</Table.HeaderCell>
							<Table.HeaderCell>Provider</Table.HeaderCell>
							<Table.HeaderCell>Description</Table.HeaderCell>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{services.map((service, index) => (
							<Table.Row
								key={service.provider}
								className='[&_td:last-child]:w-[1%] [&_td:last-child]:whitespace-nowrap'
							>
								<Table.Cell>{index + 1}</Table.Cell>
								<Table.Cell>
									<StatusCell color='green'>
										{service.status ? 'Active' : 'Inactive'}
									</StatusCell>
								</Table.Cell>
								<Table.Cell>{service.service}</Table.Cell>
								<Table.Cell>{service.provider}</Table.Cell>
								<Table.Cell>{service.description}</Table.Cell>
							</Table.Row>
						))}
					</Table.Body>
				</Table>
			</div>
		</Container>
	);
};

// export const config = defineRouteConfig({
// 	label: 'Service Status',
// });

export default ServiceStatusPage;
