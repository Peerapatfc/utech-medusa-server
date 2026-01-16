import { GET } from '../../../../store/coupons/new-customers/route';
import {
	mockNewMemberVisible,
	mockPromotionRuleNewMembers,
} from '../../../../__mocks__/promotion.__mocks__';
import getPromotionListWorkflow from '../../../../../workflows/promotion/get-promotion-list-workflow';
jest.mock('../../../../../workflows/promotion/get-promotion-list-workflow');
import { medusaIntegrationTestRunner } from '@medusajs/test-utils';

describe('GET promotions new customers handler', () => {
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	let req: any;
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	let res: any;
	//biome-ignore lint/suspicious/noExplicitAny: <explanation>
	let mockWorkflow: any;

	beforeAll(() => {
		jest.useFakeTimers();
		jest.setSystemTime(new Date('2025-01-01T09:00:00.000Z'));
	});

	afterAll(() => {
		jest.useRealTimers();
	});

	beforeEach(() => {
		req = {
			query: { limit: '10', offset: '0', q: '' },
		};

		res = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn(),
		};

		mockWorkflow = {
			run: jest.fn().mockResolvedValue({ result: [] }),
		};
		(getPromotionListWorkflow as unknown as jest.Mock).mockReturnValue(
			mockWorkflow,
		);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('should handle empty promotions list', async () => {
		mockWorkflow.run.mockResolvedValue({
			result: {
				coupons: [],
				count: 0,
				offset: 0,
				limit: 10,
			},
		});

		await GET(req, res);
		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.json).toHaveBeenCalledWith({
			coupons: [],
			count: 0,
			offset: 0,
			limit: 10,
		});
	});

	it('should handle query limit and offset undefined empty promotions list', async () => {
		req.query.limit = undefined;
		req.query.offset = undefined;
		req.query.q = undefined;
		mockWorkflow.run.mockResolvedValue({
			result: {
				coupons: [],
				count: 0,
				offset: 0,
				limit: 20,
			},
		});

		await GET(req, res);
		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.json).toHaveBeenCalledWith({
			coupons: [],
			count: 0,
			offset: 0,
			limit: 20,
		});
	});

	it('should return filtered in time promotions, visible and not have search text', async () => {
		mockWorkflow.run.mockResolvedValue({
			result: {
				coupons: mockNewMemberVisible,
				count: mockNewMemberVisible.length,
				offset: 0,
				limit: 10,
			},
		});

		await GET(req, res);

		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.json).toHaveBeenCalledWith(
			expect.objectContaining({
				coupons: mockNewMemberVisible,
				count: mockNewMemberVisible.length,
				offset: 0,
				limit: 10,
			}),
		);
	});

	it('should return filtered in time promotions, visible and search text', async () => {
		req.query.q = 'promo-1';
		const coupons = [
			{
				id: 'in-time-promo-1',
				code: 'in-time-promo-1',
				campaign: {
					starts_at: '2024-12-01T23:59:59.000Z',
					ends_at: '2025-12-31T23:59:59.000Z',
					budget: {
						used: 1,
						limit: 1,
					},
				},
				promotion_detail: {
					name: 'In time promo 1',
					description: 'In time promo 1',
					is_store_visible: true,
					is_new_customer: true,
				},
				rules: mockPromotionRuleNewMembers,
			},
		];
		mockWorkflow.run.mockResolvedValue({
			result: {
				coupons,
				count: coupons.length,
				offset: 0,
				limit: 10,
			},
		});

		await GET(req, res);

		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.json).toHaveBeenCalledWith(
			expect.objectContaining({
				coupons,
				count: coupons.length,
				offset: 0,
				limit: 10,
			}),
		);
	});
});
