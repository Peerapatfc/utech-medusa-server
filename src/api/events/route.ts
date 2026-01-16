import type { MedusaRequest, MedusaResponse } from '@medusajs/framework';
import type { ICacheService } from '@medusajs/framework/types';
import { Modules } from '@medusajs/framework/utils';

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
	const headers = {
		'Content-Type': 'text/event-stream',
		Connection: 'keep-alive',
		'Cache-Control': 'no-cache',
	};

	res.writeHead(200, headers);

	const cacheService: ICacheService = req.scope.resolve(Modules.CACHE);

	const interval = setInterval(async () => {
		const event = await cacheService.get('event');
		res.write(`data: ${JSON.stringify(event)}\n\n`);
	}, 10000);

	req.on('close', () => {
		clearInterval(interval);
		res.end();
	});

	return res;
};

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
	const body = req.body;

	const cacheService: ICacheService = req.scope.resolve(Modules.CACHE);

	await cacheService.set('event', body, 60);

	return res.json({
		message: 'Event stored',
		event: body,
	});
};
