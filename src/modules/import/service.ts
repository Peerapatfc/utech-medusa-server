import { MedusaService } from '@medusajs/framework/utils';
import { ImportHistory } from './models/import-history';

class ImportService extends MedusaService({
	ImportHistory,
}) {}

export default ImportService;
