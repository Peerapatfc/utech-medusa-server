export const defaultAdminStoreNotificationFields = [
	'id',
	'subject_line',
	'status',
	'description',
	'category',
	'customer_ids',
	'customer_group_ids',
	'recipient_type',
	'broadcast_type',
	'scheduled_at',
	'created_at',
	'updated_at',
	'created_by',
];

export const retrieveTransformQueryConfig = {
	defaults: defaultAdminStoreNotificationFields,
	isList: false,
};

export const listTransformQueryConfig = {
	...retrieveTransformQueryConfig,
	isList: true,
};
