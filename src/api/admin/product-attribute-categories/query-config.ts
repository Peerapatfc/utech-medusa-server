export const defaultAdminProductAttributeCategoryFields = [
	'id',
	'name',
	'description',
	'rank',
	'status',
	'metadata',
	// "attributes", // Relation, can be added if expansion is needed via query params
	'created_at',
	'updated_at',
];

export const retrieveTransformQueryConfig = {
	defaults: defaultAdminProductAttributeCategoryFields,
	isList: false,
};

export const listTransformQueryConfig = {
	defaults: defaultAdminProductAttributeCategoryFields,
	isList: true,
};
