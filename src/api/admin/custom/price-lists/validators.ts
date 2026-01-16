import { PriceListStatus } from '@medusajs/framework/utils';
import { z } from 'zod';
import {
	createFindParams,
	createOperatorMap,
	createSelectParams,
} from '../../../utils/validators';
import { applyAndAndOrOperators } from '../../../utils/common-validators';

export const AdminGetPriceListPricesParams = createSelectParams();

export const AdminGetPriceListsParamsFields = z.object({
	q: z.string().optional(),
	id: z.union([z.string(), z.array(z.string())]).optional(),
	starts_at: createOperatorMap().optional(),
	ends_at: createOperatorMap().optional(),
	status: z.array(z.nativeEnum(PriceListStatus)).optional(),
	rules_count: z.array(z.number()).optional(),
});

export const AdminGetPriceListsParams = createFindParams({
	offset: 0,
	limit: 50,
})
	.merge(AdminGetPriceListsParamsFields)
	.merge(applyAndAndOrOperators(AdminGetPriceListsParamsFields));

export const AdminGetPriceListParams = createSelectParams();
