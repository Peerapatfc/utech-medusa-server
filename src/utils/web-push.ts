import * as webpush from 'web-push';

const publicVapidKey =
	'BHxmE4HU5fWdUZrpX-2X8EvtypiyQmDdq7KfFdWdD2IoKTRxp7FrighFbNLjtzcwsxqfOkLiNrjSI93MannoJ4s';
const privateVapidKey = 'UEHtlO6hNiXBcIBpXwTXuTH3mGINYWqU5xacOs3Kq9M';

export const sendNotificationWebPush = (
	subscription: webpush.PushSubscription,
	data: string,
): Promise<webpush.SendResult> => {
	webpush.setVapidDetails(
		'mailto:test@test.com',
		publicVapidKey,
		privateVapidKey,
	);
	return webpush.sendNotification(subscription, data);
};
