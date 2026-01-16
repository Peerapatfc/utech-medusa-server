import type {
	AuthenticatedMedusaRequest,
	MedusaRequest,
	MedusaResponse,
} from '@medusajs/framework/http';
import type { IProductModuleService } from '@medusajs/framework/types';
import { Modules } from '@medusajs/utils';
import updateProductsScoreWorkflow from '../../../../../../../workflows/product/update-products-score-workflow';
import { POST } from '../../../../../../store/custom/products/[id]/views/route';

jest.mock(
	'../../../../../../../workflows/product/update-products-score-workflow',
);

describe('POST /store/custom/products/[id]/views', () => {
	let req: AuthenticatedMedusaRequest;
	let res: MedusaResponse;
	let mockWorkflow: { run: jest.Mock<any, any> };
	let mockProductService: IProductModuleService;

	const MOCK_PRODUCT_ID = 'test-product-id';
	const MOCK_PRODUCT_VIEW = 5;
	const MOCK_PRODUCT_DATA = {
		id: MOCK_PRODUCT_ID,
		metadata: {
			view: MOCK_PRODUCT_VIEW,
		},
	};

	beforeEach(() => {
		jest.clearAllMocks();

		mockProductService = {
			retrieveProduct: jest.fn().mockResolvedValue(MOCK_PRODUCT_DATA),
			updateProducts: jest.fn().mockResolvedValue({
				...MOCK_PRODUCT_DATA,
				metadata: {
					view: MOCK_PRODUCT_VIEW + 1,
				},
			}),
		} as unknown as IProductModuleService;

		res = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn().mockReturnThis(),
		} as unknown as MedusaResponse;

		req = {
			auth_context: { actor_id: 'test-customer-id' },
			params: { id: MOCK_PRODUCT_ID },
			scope: {
				resolve: jest.fn().mockImplementation((key) => {
					if (key === Modules.PRODUCT) {
						return mockProductService;
					}
					return null;
				}),
			},
		} as unknown as AuthenticatedMedusaRequest;

		mockWorkflow = {
			run: jest.fn().mockResolvedValue({ result: [] }),
		};

		(updateProductsScoreWorkflow as unknown as jest.Mock).mockImplementation(
			() => mockWorkflow,
		);
	});

	describe('Success cases', () => {
		xit('should increment product view count and call workflow', async () => {
			await POST(req, res);

			expect(mockProductService.retrieveProduct).toHaveBeenCalledWith(
				MOCK_PRODUCT_ID,
			);
			// expect(mockProductService.updateProducts).toHaveBeenCalledWith(
			// 	MOCK_PRODUCT_ID,
			// 	{
			// 		metadata: {
			// 			view: MOCK_PRODUCT_VIEW + 1,
			// 		},
			// 	},
			// );

			// expect(updateProductsScoreWorkflow).toHaveBeenCalledWith(req.scope);
			// expect(mockWorkflow.run).toHaveBeenCalledWith({
			// 	input: {
			// 		productIds: [MOCK_PRODUCT_ID],
			// 	},
			// });

			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith({
				success: true,
			});
		});
	});

	describe('Error cases', () => {
		xit('should return 404 when product is not found', async () => {
			(mockProductService.retrieveProduct as jest.Mock).mockResolvedValue(null);

			await POST(req, res);

			expect(mockProductService.retrieveProduct).toHaveBeenCalledWith(
				MOCK_PRODUCT_ID,
			);

			expect(mockProductService.updateProducts).not.toHaveBeenCalled();
			expect(mockWorkflow.run).not.toHaveBeenCalled();

			expect(res.status).toHaveBeenCalledWith(404);
			expect(res.json).toHaveBeenCalledWith({
				success: false,
				message: 'Product not found',
			});
		});
	});
});
