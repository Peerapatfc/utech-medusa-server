import type { MedusaRequest, AuthContext } from '@medusajs/framework';

export interface MedusaRequestWithAuth extends MedusaRequest {
	auth_context: AuthContext;
}
