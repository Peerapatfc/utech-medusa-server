import { MedusaRequest, MedusaResponse } from '@medusajs/framework';

export const POST = (req: MedusaRequest, res: MedusaResponse) => {
	const features = [
		{
			name: 'medusa-plugin-demo1',
			description: 'This is feature 1',
			enabled: true,
		},
	];

	res.status(200).json({
		message: 'Available features',
		features,
	});
};
