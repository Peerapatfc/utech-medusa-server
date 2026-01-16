import { defineWidgetConfig } from '@medusajs/admin-sdk';
import type {
	AdminCustomer,
	DetailWidgetProps,
} from '@medusajs/framework/types';
import { Button, Container, Heading } from '@medusajs/ui';
import { sdk } from '../../../lib/client';

const CustomerPushNotificationWidget = ({
	data,
}: DetailWidgetProps<AdminCustomer>) => {
	const datetimeString = Date.now();
	const notification = {
		subject: `Test Notification ${datetimeString}`,
		text: `This is a test notification ${datetimeString}. Please ignore it. Thank you!`,
		recipients: [data.id],
	};

	const handleSendNotification = async () => {
		try {
			await sdk.client.fetch('/admin/manual/notifications/push', {
				method: 'POST',
				body: {
					...notification,
				},
			});
		} catch (error) {
			console.error(error);
		}
	};

	return (
		<Container className='divide-y p-0'>
			<div className='flex items-center justify-between px-6 py-4'>
				<Heading level='h2'>Test Push Notification</Heading>
				<Button variant='secondary' onClick={handleSendNotification}>
					Send
				</Button>
			</div>
		</Container>
	);
};

// The widget's configurations
export const config = defineWidgetConfig({
	zone: 'customer.details.after',
});

export default CustomerPushNotificationWidget;
