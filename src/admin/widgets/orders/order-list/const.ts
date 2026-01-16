const DEFAULT_PROPERTIES = [
	'id',
	'status',
	'created_at',
	'email',
	'display_id',
	'payment_status',
	'fulfillment_status',
	'total',
	'currency_code',
	'metadata',
];

const DEFAULT_RELATIONS = ['*customer'];

export const DEFAULT_FIELDS = `${DEFAULT_PROPERTIES.join(
	',',
)},${DEFAULT_RELATIONS.join(',')}`;
