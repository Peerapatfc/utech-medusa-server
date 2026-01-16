import { useQueryParams } from '../../../../../../hooks/use-query-params';

export const useBroadCastsTableQuery = ({
	pageSize = 20,
	prefix,
}: {
	pageSize?: number;
	prefix?: string;
}) => {
	const raw = useQueryParams(
		[
			'offset',
			'q',
			'order',
			'status',
			'category',
			'recipient_type',
			'broadcast_type',
			'scheduled_at',
			'created_at',
			'updated_at',
		],
		prefix,
	);
	const params = new URLSearchParams();
	if (pageSize) {
		params.set('limit', pageSize.toString());
	}
	if (raw.offset) {
		params.set('offset', raw.offset);
	}
	if (raw.order) {
		params.set('order', raw.order);
	} else {
		params.set('order', '-created_at');
	}
	if (raw.category) {
		params.set('category', raw.category);
	}
	if (raw.recipient_type) {
		params.set('recipient_type', raw.recipient_type);
	}
	if (raw.broadcast_type) {
		params.set('broadcast_type', raw.broadcast_type);
	}
	if (raw.status) {
		params.set('status', raw.status);
	}
	if (raw.scheduled_at) {
		const scheduled_at = JSON.parse(raw.scheduled_at);
		for (const key of Object.keys(scheduled_at)) {
			params.set(`scheduled_at[${key}]`, scheduled_at[key]);
		}
	}
	if (raw.created_at) {
		const created_at = JSON.parse(raw.created_at);
		for (const key of Object.keys(created_at)) {
			params.set(`created_at[${key}]`, created_at[key]);
		}
	}
	if (raw.updated_at) {
		const updated_at = JSON.parse(raw.updated_at);
		for (const key of Object.keys(updated_at)) {
			params.set(`updated_at[${key}]`, updated_at[key]);
		}
	}
	if (raw.q) {
		params.set('q', raw.q);
	}

	const searchParams = {
		limit: pageSize,
		offset: raw.offset ? Number(raw.offset) : 0,
		order: raw.order,
		status: raw.status,
		category: raw.category,
		recipient_type: raw.recipient_type,
		broadcast_type: raw.broadcast_type,
		scheduled_at: raw.scheduled_at,
		created_at: raw.created_at,
		updated_at: raw.updated_at,
		q: raw.q,
	};

	return {
		searchQuery: params.toString(),
		searchParams,
		raw,
	};
};
