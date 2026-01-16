import type { MedusaRequest, MedusaResponse } from '@medusajs/framework';
import { GET } from '../../../store/foo/route';
import type { ICustomerModuleService } from '@medusajs/framework/types';

describe('GET handler', () => {
	let mockReq: Partial<MedusaRequest>;
	let mockRes: Partial<MedusaResponse>;
	let mockCustomerService: Partial<ICustomerModuleService>;

	beforeEach(() => {
		mockCustomerService = {
			listCustomers: jest.fn().mockResolvedValue([
				{ id: 1, name: 'Alice' },
				{ id: 2, name: 'Bob' },
			]),

			// listCusxxxx: jest.fn().mockResolvedValue(
			// 	Promise.resolve()
			// )
		};

		mockReq = {
			query: {},
			// @ts-ignore
			scope: {
				resolve: jest.fn().mockReturnValue(mockCustomerService),
			},
			body: {
				test: 'xxx',
			},
		};

		mockRes = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn(),
		};
	});

	test('should return 200 with message when no error query is present', async () => {
		mockCustomerService.listCustomers = jest.fn().mockResolvedValue([
			{ id: 10, name: 'Alice' },
			{ id: 20, name: 'Bob' },
		]);
		// Act
		await GET(mockReq as MedusaRequest, mockRes as MedusaResponse);

		// Assert
		expect(mockRes.status).toHaveBeenCalledWith(200);
		expect(mockRes.json).toHaveBeenCalledWith({
			message: 'Hello from store route',
			customers: [
				{ id: 10, name: 'Alice' },
				{ id: 20, name: 'Bob' },
			],
		});
	});

	test('should return 500 with error message when error query is present', async () => {
		// Arrange
		mockReq.query = { error: 'true' };

		// Act
		await GET(mockReq as MedusaRequest, mockRes as MedusaResponse);

		// Assert
		expect(mockRes.status).toHaveBeenCalledWith(500);
		expect(mockRes.json).toHaveBeenCalledWith({
			error: 'Error from store route',
		});
	});

	test('should handle unexpected errors gracefully', async () => {
		// Arrange
		mockRes.json = jest.fn().mockImplementation(() => {
			throw new Error('Unexpected failure');
		});

		// Act & Assert
		await expect(
			GET(mockReq as MedusaRequest, mockRes as MedusaResponse),
		).rejects.toThrow('Unexpected failure');
	});
});
