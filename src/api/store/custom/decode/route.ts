import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import jwt from 'jsonwebtoken';

export const POST = async (
	req: MedusaRequest<{
		encoded: string;
	}>,
	res: MedusaResponse,
) => {
	const secretKey = process.env.JWT_SECRET || 'secret';
	const decoded = jwt.verify(req.body.encoded, secretKey);

	res.json({
		decoded,
	});
};
