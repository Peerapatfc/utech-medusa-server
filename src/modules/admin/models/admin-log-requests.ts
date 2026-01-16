import { model } from '@medusajs/framework/utils';

export const AdminLogRequests = model.define('admin-log-requests', {
	id: model.id({ prefix: 'alr' }).primaryKey(),
	path: model.text().nullable(),
	method: model.text().nullable(),
	query: model.json().nullable(),
	body: model.json().nullable(),
	actor_id: model.text().nullable(),
	metadata: model.json().nullable(),
});

export default AdminLogRequests;
