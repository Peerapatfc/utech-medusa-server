import { model } from '@medusajs/framework/utils';

export const ImportHistory = model.define('import_histories', {
	id: model.id({ prefix: 'im_his' }).primaryKey(),
	import_type: model.text(),
	imported_file_id: model.text(),
	imported_file_url: model.text(),
	imported_result_file_id: model.text(),
	imported_result_file_url: model.text(),
	status: model.enum(['success', 'failed']).default('success'),
	errors: model.text().nullable(), //unused, will be removed later
	imported_by: model.text().nullable(),
	original_filename: model.text(),
	description: model.text().nullable(),
});
