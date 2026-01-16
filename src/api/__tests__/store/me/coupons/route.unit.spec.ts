import { GET } from '../../../../store/me/coupons/route';

jest.mock('../../../../../workflows/customer/get-coupons-workflow', () => ({
	getCustomerCouponsWorkflow: jest.fn().mockReturnValue({
		run: jest.fn().mockResolvedValue({
			result: {
				coupons: [
					{ id: 'promo_1', code: 'SAVE10', name: 'Save 10%' },
					{ id: 'promo_2', code: 'WELCOME20', name: 'Welcome 20%' },
				],
				count: 2,
				offset: 0,
				limit: 20,
			},
		}),
	}),
}));

describe('GET /me/coupons route', () => {
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	let req: any;
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	let res: any;

	const mockCustomerId = 'customer_123';
	const mockScope = 'test-scope';

	const mockSuccessResult = {
		coupons: [
			{ id: 'promo_1', code: 'SAVE10', name: 'Save 10%' },
			{ id: 'promo_2', code: 'WELCOME20', name: 'Welcome 20%' },
		],
		count: 2,
		offset: 0,
		limit: 20,
	};

	beforeEach(() => {
		req = {
			query: {
				limit: '20',
				offset: '0',
				tab: 'all',
				search: '',
			},
			auth_context: {
				actor_id: mockCustomerId,
			},
			scope: mockScope,
		};

		res = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn(),
		};
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('successful requests', () => {
		it('should return 200 status with default parameters', async () => {
			await GET(req, res);

			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith(mockSuccessResult);
		});

		it('should return 200 status with custom query parameters', async () => {
			req.query = {
				limit: '10',
				offset: '5',
				tab: 'used',
				search: 'SAVE',
			};

			await GET(req, res);

			expect(res.status).toHaveBeenCalledWith(200);
		});

		it('should return 200 status with expired tab filter', async () => {
			req.query.tab = 'expired';

			await GET(req, res);

			expect(res.status).toHaveBeenCalledWith(200);
		});

		it('should return 200 status with missing query parameters', async () => {
			req.query = {};

			await GET(req, res);

			expect(res.status).toHaveBeenCalledWith(200);
		});

		it('should return 200 status with undefined query parameters', async () => {
			req.query = {
				limit: undefined,
				offset: undefined,
				tab: undefined,
				search: undefined,
			};

			await GET(req, res);

			expect(res.status).toHaveBeenCalledWith(200);
		});
	});

	describe('error handling', () => {
		beforeEach(() => {
			jest.clearAllMocks();
		});

		it('should handle workflow errors and return 500 status', async () => {
			// Temporarily override the mock
			jest.resetModules();
			jest.doMock(
				'../../../../../workflows/customer/get-coupons-workflow',
				() => ({
					getCustomerCouponsWorkflow: jest.fn().mockReturnValue({
						run: jest.fn().mockRejectedValue(new Error('Workflow failed')),
					}),
				}),
			);

			const { GET: getHandler } = require('../../../../store/me/coupons/route');

			await getHandler(req, res);

			expect(res.status).toHaveBeenCalledWith(500);
			expect(res.json).toHaveBeenCalledWith({
				success: false,
				message: 'Workflow failed',
			});
		});

		it('should handle errors without message', async () => {
			// Temporarily override the mock
			jest.resetModules();
			jest.doMock(
				'../../../../../workflows/customer/get-coupons-workflow',
				() => ({
					getCustomerCouponsWorkflow: jest.fn().mockReturnValue({
						run: jest.fn().mockRejectedValue({}),
					}),
				}),
			);

			const { GET: getHandler } = require('../../../../store/me/coupons/route');

			await getHandler(req, res);

			expect(res.status).toHaveBeenCalledWith(500);
			expect(res.json).toHaveBeenCalledWith({
				success: false,
				message: 'An error occurred',
			});
		});
	});
});
