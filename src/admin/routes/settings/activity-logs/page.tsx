import { defineRouteConfig } from '@medusajs/admin-sdk';
import { Container, Heading, Text } from '@medusajs/ui';
import ActivityLogsTable from './components/activity-logs-table';

const AdminActivityLogsPage = () => {
	return (
		<Container className='divide-y p-0'>
			<div className='flex items-center justify-between px-6 py-4'>
				<Heading level='h1'>
					Admin activity logs
					<Text className='text-ui-fg-subtle' size='small'>
						Activity logs from the admin dashboard
					</Text>
				</Heading>
			</div>
			<ActivityLogsTable />
		</Container>
	);
};

export const config = defineRouteConfig({
	label: 'Admin activity logs',
});

export default AdminActivityLogsPage;
