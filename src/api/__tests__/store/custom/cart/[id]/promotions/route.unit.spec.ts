import validateStorePromotionsWorkflow from '../../../../../../../workflows/validate-store-promotions/validate-store-promotions.workflow';
import { GET } from '../../../../../../store/custom/cart/[id]/promotions/route';

jest.mock(
	'../../../../../../../workflows/validate-store-promotions/validate-store-promotions.workflow',
);

describe('GET /store/custom/cart/[id]/promotions', () => {
	// Common test data
	const VALID_CART_ID = 'cart_123';
	const VALID_PROMO_CODE = 'DISCOUNT10';
	const MOCK_PROMOTIONS = [{ id: 'promo_1', code: 'DISCOUNT10' }];

	//biome-ignore lint/suspicious/noExplicitAny: <explanation>
	let req: any;
	//biome-ignore lint/suspicious/noExplicitAny: <explanation>
	let res: any;
	//biome-ignore lint/suspicious/noExplicitAny: <explanation>
	let mockWorkflow: any;

	beforeEach(() => {
		jest.clearAllMocks();

		res = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn().mockReturnThis(),
		};

		req = {
			params: {},
			query: {},
			scope: {},
		};

		mockWorkflow = {
			run: jest.fn().mockResolvedValue({ result: [] }),
		};
		(validateStorePromotionsWorkflow as unknown as jest.Mock).mockReturnValue(
			mockWorkflow,
		);
	});

	describe('Success cases', () => {
		it('should return promotions list when given valid cart ID', async () => {
			req.params.id = VALID_CART_ID;
			mockWorkflow.run.mockResolvedValue({ result: MOCK_PROMOTIONS });

			await GET(req, res);

			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith({ promotions: MOCK_PROMOTIONS });
		});

		it('should return promotions when given valid cart ID and promo code', async () => {
			req.params.id = VALID_CART_ID;
			req.query.code = VALID_PROMO_CODE;
			mockWorkflow.run.mockResolvedValue({ result: MOCK_PROMOTIONS });

			await GET(req, res);

			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith({ promotions: MOCK_PROMOTIONS });
		});

		it('should pass validate_only flag to workflow', async () => {
			req.params.id = VALID_CART_ID;
			req.query.code = VALID_PROMO_CODE;
			req.query.validate_only = 'true';

			await GET(req, res);

			expect(mockWorkflow.run).toHaveBeenCalledWith({
				input: {
					cart_id: VALID_CART_ID,
					promo_code: VALID_PROMO_CODE,
					validate_only: true,
				},
			});
		});
	});

	describe('Error handling', () => {
		it('should return 400 when cart ID is missing', async () => {
			await GET(req, res);

			expect(res.status).toHaveBeenCalledWith(400);
			expect(res.json).toHaveBeenCalledWith({
				message: 'Cart ID is required',
			});
		});

		it('should return 500 with error message on workflow error', async () => {
			req.params.id = VALID_CART_ID;
			mockWorkflow.run.mockRejectedValue(new Error('Workflow error'));

			await GET(req, res);

			expect(res.status).toHaveBeenCalledWith(500);
			expect(res.json).toHaveBeenCalledWith({
				message: 'Internal server error',
				error: 'Workflow error',
			});
		});

		it('should return 500 with unknown error message when error is not Error instance', async () => {
			req.params.id = VALID_CART_ID;
			mockWorkflow.run.mockRejectedValue('String error');

			await GET(req, res);

			expect(res.status).toHaveBeenCalledWith(500);
			expect(res.json).toHaveBeenCalledWith({
				message: 'Internal server error',
				error: 'Unknown error',
			});
		});
	});

	describe('Edge cases', () => {
		it('should handle empty promo code', async () => {
			req.params.id = VALID_CART_ID;
			req.query.code = '';

			await GET(req, res);

			expect(mockWorkflow.run).toHaveBeenCalledWith({
				input: {
					cart_id: VALID_CART_ID,
					promo_code: '',
					validate_only: false,
				},
			});
		});

		it('should handle undefined promo code', async () => {
			req.params.id = VALID_CART_ID;
			req.query.code = undefined;

			await GET(req, res);

			expect(mockWorkflow.run).toHaveBeenCalledWith({
				input: {
					cart_id: VALID_CART_ID,
					promo_code: undefined,
					validate_only: false,
				},
			});
		});

		it('should default validate_only to false for invalid values', async () => {
			req.params.id = VALID_CART_ID;
			req.query.validate_only = 'invalid';

			await GET(req, res);

			expect(mockWorkflow.run).toHaveBeenCalledWith({
				input: {
					cart_id: VALID_CART_ID,
					promo_code: undefined,
					validate_only: false,
				},
			});
		});
	});
});
