import type PromotionCustomModuleService from '../../../../../../../modules/promotion-custom/service';
import {
	GET,
	PATCH,
} from '../../../../../../admin/custom/promotions/[id]/detail/route';

describe('GET admin/custom/promotions/[id]/detail', () => {
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	let req: any;
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	let res: any;

	beforeEach(() => {
		req = {
			query: {},
			params: { id: 'promo_01JJ1B7X3TAMFKRCSYEZRKNGB1' },
			scope: {
				resolve: jest.fn(() => ({
					graph: jest.fn(),
				})),
			},
		};
		res = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn(),
		};
	});

	it('should handle empty promotions', async () => {
		req.scope.resolve.mockImplementation(() => ({
			graph: jest.fn().mockResolvedValue({ data: [] }),
		}));

		await GET(req, res);
		expect(res.status).toHaveBeenCalledWith(404);
		expect(res.json).toHaveBeenCalledWith({
			success: false,
			message: 'Promotion not found',
		});
	});

	it('should handle empty promotion detail', async () => {
		const mockEmptyPromotions = [
			{
				id: 'promo_01JJ1B7X3TAMFKRCSYEZRKNGB1',
				code: 'TERSDFS',
				is_automatic: false,
				type: 'standard',
				status: 'draft',
				campaign_id: 'procamp_01JJ4RW4JP21K0WZSVVD5YBTEX',
				campaign: {
					id: 'procamp_01JJ4RW4JP21K0WZSVVD5YBTEX',
				},
				application_method: {
					id: 'proappmet_01JJ1B7X46SCD52EDYEZT7TVV8',
				},
				created_at: '2025-01-20T07:53:39.249Z',
				updated_at: '2025-01-20T07:53:39.249Z',
				deleted_at: null,
			},
		];
		req.scope.resolve.mockImplementation(() => ({
			graph: jest.fn().mockResolvedValue({ data: mockEmptyPromotions }),
		}));

		await GET(req, res);
		expect(res.status).toHaveBeenCalledWith(404);
		expect(res.json).toHaveBeenCalledWith({
			success: false,
			message: 'Promotion detail not found',
		});
	});

	it('should return promotion', async () => {
		const mockPromotions = [
			{
				id: 'promo_01JJ1B7X3TAMFKRCSYEZRKNGB1',
				code: 'TERSDFS',
				is_automatic: false,
				type: 'standard',
				status: 'draft',
				campaign_id: 'procamp_01JJ4RW4JP21K0WZSVVD5YBTEX',
				campaign: {
					id: 'procamp_01JJ4RW4JP21K0WZSVVD5YBTEX',
				},
				application_method: {
					id: 'proappmet_01JJ1B7X46SCD52EDYEZT7TVV8',
				},
				created_at: '2025-01-20T07:53:39.249Z',
				updated_at: '2025-01-20T07:53:39.249Z',
				deleted_at: null,
				promotion_detail: {
					id: 'prode_01JJ4RSQW72S3P1W710J5R09Z0',
					name: 'CAMPAIGN',
					description: 'campaign description',
					is_store_visible: true,
					metadata: null,
					custom_rules: null,
					created_at: '2025-01-21T15:48:18.439Z',
					updated_at: '2025-01-21T15:50:57.775Z',
					deleted_at: null,
				},
			},
		];
		req.scope.resolve.mockImplementation(() => ({
			graph: jest.fn().mockResolvedValue({ data: mockPromotions }),
		}));

		const promotion = mockPromotions[0];
		await GET(req, res);
		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.json).toHaveBeenCalledWith({
			success: true,
			message: '',
			promotion,
		});
	});
});

describe('PATCH admin/custom/promotions/[id]/detail', () => {
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	let req: any;
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	let res: any;
	let promotionCustomService: Partial<PromotionCustomModuleService>;

	beforeEach(() => {
		promotionCustomService = {
			updatePromotionDetails: jest.fn().mockResolvedValue(Promise.resolve()),
		};
		req = {
			params: { id: 'promo_01JJ1B7X3TAMFKRCSYEZRKNGB1' },
			query: {},
			scope: {
				resolve: jest.fn(() => ({
					graph: jest.fn(),
					updatePromotionDetails: jest.fn(),
					revalidateTag: jest.fn(),
				})),
			},
		};
		res = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn(),
		};
	});

	it('should handle empty promotions', async () => {
		req.scope.resolve.mockImplementation(() => ({
			graph: jest.fn().mockResolvedValue({ data: [] }),
		}));

		await PATCH(req, res);
		expect(res.status).toHaveBeenCalledWith(404);
		expect(res.json).toHaveBeenCalledWith({
			success: false,
			message: 'Promotion not found',
		});
	});

	const mockEmptyPromotionDetail = [
		{
			id: 'promo_01JJ1B7X3TAMFKRCSYEZRKNGB1',
			code: 'TERSDFS',
			is_automatic: false,
			type: 'standard',
			status: 'draft',
			campaign_id: 'procamp_01JJ4RW4JP21K0WZSVVD5YBTEX',
			campaign: {
				id: 'procamp_01JJ4RW4JP21K0WZSVVD5YBTEX',
			},
			application_method: {
				id: 'proappmet_01JJ1B7X46SCD52EDYEZT7TVV8',
			},
			created_at: '2025-01-20T07:53:39.249Z',
			updated_at: '2025-01-20T07:53:39.249Z',
			deleted_at: null,
		},
	];
	it('should handle empty promotion detail', async () => {
		req.scope.resolve.mockImplementation(() => ({
			graph: jest.fn().mockResolvedValue({ data: mockEmptyPromotionDetail }),
		}));

		await PATCH(req, res);
		expect(res.status).toHaveBeenCalledWith(404);
		expect(res.json).toHaveBeenCalledWith({
			success: false,
			message: 'Promotion detail not found',
		});
	});

	const mockPromotions = [
		{
			id: 'promo_01JJ1B7X3TAMFKRCSYEZRKNGB1',
			code: 'TERSDFS',
			is_automatic: false,
			type: 'standard',
			status: 'draft',
			campaign_id: 'procamp_01JJ4RW4JP21K0WZSVVD5YBTEX',
			campaign: {
				id: 'procamp_01JJ4RW4JP21K0WZSVVD5YBTEX',
			},
			application_method: {
				id: 'proappmet_01JJ1B7X46SCD52EDYEZT7TVV8',
			},
			created_at: '2025-01-20T07:53:39.249Z',
			updated_at: '2025-01-20T07:53:39.249Z',
			deleted_at: null,
			promotion_detail: {
				id: 'prode_01JJ4RSQW72S3P1W710J5R09Z0',
				name: 'CAMPAIGN',
				description: 'campaign description',
				is_store_visible: true,
				metadata: null,
				custom_rules: null,
				created_at: '2025-01-21T15:48:18.439Z',
				updated_at: '2025-01-21T15:50:57.775Z',
				deleted_at: null,
			},
		},
	];
	it('should handle update promotion detail fail', async () => {
		req.scope.resolve.mockImplementation(() => ({
			graph: jest.fn().mockResolvedValue({ data: mockPromotions }),
			updatePromotionDetails: jest
				.fn()
				.mockResolvedValue({ data: mockPromotions[0] }),
			revalidateTag: jest.fn(),
		}));

		await PATCH(req, res);
		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.json).toHaveBeenCalledWith({
			success: false,
			message: 'Could not update promotion detail',
			error: "Cannot read properties of undefined (reading 'is_custom_rule')",
		});
	});

	it('should handle update promotion detail without custom_rules success', async () => {
		req.body = {
			name: 'Test Promotion',
			description: 'Test Promotion Description',
			custom_rules: undefined,
			is_custom_rule: undefined,
		};
		req.scope.resolve.mockImplementation(() => ({
			graph: jest.fn().mockResolvedValue({ data: mockPromotions }),
			updatePromotionDetails: jest
				.fn()
				.mockResolvedValue({ data: mockPromotions[0] }),
			revalidateTag: jest.fn(),
		}));

		await PATCH(req, res);
		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.json).toHaveBeenCalledWith({
			success: true,
			message: 'Promotion detail updated',
			data: mockPromotions[0],
		});
	});

	it('should handle update promotion detail width custom_rules success', async () => {
		req.query = {};
		req.body = {
			name: undefined,
			description: undefined,
			custom_rules: {
				subtotal: {
					gte: 2000,
				},
			},
			is_custom_rule: true,
		};
		req.scope.resolve.mockImplementation(() => ({
			graph: jest.fn().mockResolvedValue({ data: mockPromotions }),
			updatePromotionDetails: jest
				.fn()
				.mockResolvedValue({ data: mockPromotions[0] }),
			revalidateTag: jest.fn(),
		}));

		await PATCH(req, res);
		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.json).toHaveBeenCalledWith({
			success: true,
			message: 'Promotion detail updated',
			data: mockPromotions[0],
		});
	});
});
