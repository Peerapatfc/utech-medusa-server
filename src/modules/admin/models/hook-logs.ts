import { model } from '@medusajs/framework/utils';

export const HookLog = model.define('hook-logs', {
	id: model.id({ prefix: 'hl' }).primaryKey(),
	path: model.text().nullable(),
	name: model.text().nullable(),
	method: model.text().nullable(),
	query: model.json().nullable(),
	body: model.json().nullable(),
	actor_id: model.text().nullable(),
	metadata: model.json().nullable(),
});

export default HookLog;
