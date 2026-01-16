import type {
	SubscriberArgs,
	SubscriberConfig,
} from '@medusajs/framework/subscribers';
import type { IUserModuleService } from '@medusajs/framework/types';
import { InviteWorkflowEvents, Modules } from '@medusajs/framework/utils';

export default async function adminInvitedHandler({
	event: { data },
	container,
}: SubscriberArgs<{ id: string }>) {
	const logger = container.resolve('logger');
	const inviteId = data.id;
	const userService: IUserModuleService = container.resolve(Modules.USER);
	const invite = await userService
		.listInvites({ id: inviteId })
		.then((res) => res[0]);

	const INVITE_URL = `${process.env.MEDUSA_BACKEND_URL}/app/invite?token=`;
	const inviteLink = `${INVITE_URL}${invite.token}`;
	logger.info(`Invite created for ${invite.email} with link: ${inviteLink}`);
}

export const config: SubscriberConfig = {
	event: InviteWorkflowEvents.CREATED,
};
