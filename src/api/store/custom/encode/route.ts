import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import jwt from 'jsonwebtoken';

export const POST = async (
	req: MedusaRequest<Record<string, unknown> | string>,
	res: MedusaResponse,
) => {
	const secretKey = process.env.JWT_SECRET || 'secret';
	const encoded = jwt.sign(req.body, secretKey, {
		expiresIn: '1y',
	});

	res.json({
		encoded,
	});
};
