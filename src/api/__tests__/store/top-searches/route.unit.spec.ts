import { GET } from '../../../store/top-searches/route';
import getProductDetailWorkflow from '../../../../workflows/product/get-products-detail';
import {
	recommends,
	searchEngines,
	suggestion_products,
} from '../../../__mocks__/top-search.__mocks__';
jest.mock('../../../../workflows/product/get-products-detail');

describe('GET store/top-searches', () => {
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	let req: any;
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	let res: any;
	//biome-ignore lint/suspicious/noExplicitAny: <explanation>
	let mockWorkflow: any;

	beforeEach(() => {
		req = {
			query: {},
			scope: {
				resolve: jest.fn(() => ({
					graph: jest.fn(),
					getByPaths: jest.fn(),
					listTopSearches: jest.fn(),
					getSuggestProducts: jest.fn(),
					error: jest.fn(),
				})),
			},
		};
		res = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn(),
		};

		mockWorkflow = {
			run: jest.fn().mockResolvedValue({ result: [] }),
		};
		(getProductDetailWorkflow as unknown as jest.Mock).mockReturnValue(
			mockWorkflow,
		);
	});

	it('should return top-search disabled but suggestion_score suggestion products undefined.', async () => {
		const config = [
			{
				id: '01J8P2JYGXV218394QCKH4F2C4',
				path: 'top-search/general/enabled',
				value: '0',
				created_by: 'user_01J4GFNPNKZAB7CRPWYWEBWDJ3',
				updated_by: 'user_01JCMD0N5GMY4GF7MYEBHV0K35',
				metadata: null,
				deleted_at: null,
			},
		];

		req.scope.resolve.mockImplementation(() => ({
			getByPaths: jest.fn().mockResolvedValue(config),
			graph: jest.fn().mockResolvedValue({
				data: suggestion_products.map((product) => ({
					...product,
					metadata: {
						...product.metadata,
						suggestion_score: undefined,
					},
				})),
			}),
			error: jest.fn(),
		}));

		mockWorkflow.run.mockResolvedValue({
			data: suggestion_products.map((product) => ({
				...product,
				metadata: {
					...product.metadata,
					suggestion_score: undefined,
				},
			})),
		});

		await GET(req, res);
		expect(res.json).toHaveBeenCalledWith({
			success: true,
			top_searches: [],
			suggestion_products: [],
		});
	});

	it('should return top-search disabled and suggestion products empty', async () => {
		const config = [
			{
				id: '01J8P2JYGXV218394QCKH4F2C4',
				path: 'top-search/general/enabled',
				value: '0',
				created_by: 'user_01J4GFNPNKZAB7CRPWYWEBWDJ3',
				updated_by: 'user_01JCMD0N5GMY4GF7MYEBHV0K35',
				metadata: null,
				deleted_at: null,
			},
		];

		req.scope.resolve.mockImplementation(() => ({
			getByPaths: jest.fn().mockResolvedValue(config),
			graph: jest.fn().mockResolvedValue({ data: [] }),
		}));

		mockWorkflow.run.mockResolvedValue({ result: [] });

		await GET(req, res);
		expect(res.json).toHaveBeenCalledWith({
			success: true,
			top_searches: [],
			suggestion_products: [],
		});
	});

	it('should return top-search disabled', async () => {
		const config = [
			{
				id: '01J8P2JYGXV218394QCKH4F2C4',
				path: 'top-search/general/enabled',
				value: '0',
				created_by: 'user_01J4GFNPNKZAB7CRPWYWEBWDJ3',
				updated_by: 'user_01JCMD0N5GMY4GF7MYEBHV0K35',
				metadata: null,
				deleted_at: null,
			},
		];

		req.scope.resolve.mockImplementation(() => ({
			getByPaths: jest.fn().mockResolvedValue(config),
			graph: jest.fn().mockResolvedValue({ data: suggestion_products }),
		}));

		mockWorkflow.run.mockResolvedValue({ result: suggestion_products });

		await GET(req, res);
		expect(res.json).toHaveBeenCalledWith({
			success: true,
			top_searches: [],
			suggestion_products,
		});
	});

	it('should return top-search enabled and choose search-engine mode', async () => {
		const config = [
			{
				id: '01J8P2JYGXV218394QCKH4F2C4',
				path: 'top-search/general/enabled',
				value: '1',
				created_by: 'user_01J4GFNPNKZAB7CRPWYWEBWDJ3',
				updated_by: 'user_01JCMD0N5GMY4GF7MYEBHV0K35',
				metadata: null,
				deleted_at: null,
			},
			{
				id: '01J8P2JYNH8W26TAZ2WTFC0RRQ',
				path: 'top-search/general/display_mode',
				value: 'search-engine',
				created_by: 'user_01J4GFNPNKZAB7CRPWYWEBWDJ3',
				updated_by: 'user_01JCMD0N5GMY4GF7MYEBHV0K35',
				metadata: null,
				deleted_at: null,
			},
		];

		req.scope.resolve.mockImplementation(() => ({
			getByPaths: jest.fn().mockResolvedValue(config),
			graph: jest.fn().mockResolvedValue({ data: suggestion_products }),
			listTopSearches: jest
				.fn()
				.mockResolvedValueOnce(recommends)
				.mockResolvedValueOnce(searchEngines),
		}));

		mockWorkflow.run.mockResolvedValue({ result: suggestion_products });

		await GET(req, res);
		expect(res.json).toHaveBeenCalledWith({
			success: true,
			top_searches: [
				{
					id: 'ts_01JMGTS4TKJ11V97JW9R0VH7XD',
					search: 'i',
					type: 'search-engine',
					uri: 'i',
				},
				{
					id: 'ts_01JMGV4BCFWBYQVD3CVKW6790M',
					search: 'a',
					type: 'search-engine',
					uri: 'a',
				},
				{
					id: 'ts_01J9JH3W1ZAJZ9S6F7ZXJY9E4T',
					search: 'iphone',
					type: 'search-engine',
					uri: 'iphone',
				},
				{
					id: 'ts_01JSB6XH3E2MVFY2P3DE4Y4VGR',
					search: 'ip',
					type: 'search-engine',
					uri: 'ip',
				},
				{
					id: 'ts_01J8444ZCP5259K1B72WBJPJCW',
					search: 'apple',
					type: 'search-engine',
					uri: 'apple',
				},
			],
			suggestion_products,
		});
	});

	it('should return top-search enabled and choose recommend mode', async () => {
		const config = [
			{
				id: '01J8P2JYGXV218394QCKH4F2C4',
				path: 'top-search/general/enabled',
				value: '1',
				created_by: 'user_01J4GFNPNKZAB7CRPWYWEBWDJ3',
				updated_by: 'user_01JCMD0N5GMY4GF7MYEBHV0K35',
				metadata: null,
				deleted_at: null,
			},
			{
				id: '01J8P2JYNH8W26TAZ2WTFC0RRQ',
				path: 'top-search/general/display_mode',
				value: 'recommend',
				created_by: 'user_01J4GFNPNKZAB7CRPWYWEBWDJ3',
				updated_by: 'user_01JCMD0N5GMY4GF7MYEBHV0K35',
				metadata: null,
				deleted_at: null,
			},
		];

		req.scope.resolve.mockImplementation(() => ({
			getByPaths: jest.fn().mockResolvedValue(config),
			graph: jest.fn().mockResolvedValue({ data: suggestion_products }),
			listTopSearches: jest
				.fn()
				.mockResolvedValueOnce(recommends)
				.mockResolvedValueOnce(searchEngines),
		}));

		mockWorkflow.run.mockResolvedValue({ result: suggestion_products });

		await GET(req, res);
		expect(res.json).toHaveBeenCalledWith({
			success: true,
			top_searches: [
				{
					id: 'ts_01J81XZW3YEFYT6N7RB425BCJG',
					search: 'test dd',
					type: 'recommend',
					uri: '/test-ss',
				},
				{
					id: 'ts_01J8P2JYTEJBHGDP6XGW9S72NA',
					search: 'tes ee',
					type: 'recommend',
					uri: '/test-ee',
				},
				{
					id: 'ts_01JN6299ZER13A0Q5J2337PASD',
					search: 'd',
					type: 'recommend',
					uri: 'd',
				},
				{
					id: 'ts_01JN6299ZER13A0Q5J2337PASC',
					search: 'c',
					type: 'recommend',
					uri: 'c',
				},
				{
					id: 'ts_01JN6299ZER13A0Q5J2337PASG',
					search: 'g',
					type: 'recommend',
					uri: 'g',
				},
				{
					id: 'ts_01JN6299ZER13A0Q5J2337PASR',
					search: 'r',
					type: 'recommend',
					uri: 'r',
				},
				{
					id: 'ts_01JN6299ZER13A0Q5J2337PASS',
					search: 's',
					type: 'recommend',
					uri: 's',
				},
				{
					id: 'ts_01JN6299ZER13A0Q5J2337PAST',
					search: 't',
					type: 'recommend',
					uri: 't',
				},
				{
					id: 'ts_01JN6299ZER13A0Q5J2337PASU',
					search: 'u',
					type: 'recommend',
					uri: 'u',
				},
				{
					id: 'ts_01JN6299ZER13A0Q5J2337PASV',
					search: 'v',
					type: 'recommend',
					uri: 'v',
				},
				{
					id: 'ts_01JN6299ZER13A0Q5J2337PASW',
					search: 'w',
					type: 'recommend',
					uri: 'w',
				},
			],
			suggestion_products,
		});
	});

	it('should return top-search enabled and choose both mode', async () => {
		const config = [
			{
				id: '01J8P2JYGXV218394QCKH4F2C4',
				path: 'top-search/general/enabled',
				value: '1',
				created_by: 'user_01J4GFNPNKZAB7CRPWYWEBWDJ3',
				updated_by: 'user_01JCMD0N5GMY4GF7MYEBHV0K35',
				metadata: null,
				deleted_at: null,
			},
			{
				id: '01J8P2JYNH8W26TAZ2WTFC0RRQ',
				path: 'top-search/general/display_mode',
				value: 'both',
				created_by: 'user_01J4GFNPNKZAB7CRPWYWEBWDJ3',
				updated_by: 'user_01JCMD0N5GMY4GF7MYEBHV0K35',
				metadata: null,
				deleted_at: null,
			},
		];

		req.scope.resolve.mockImplementation(() => ({
			getByPaths: jest.fn().mockResolvedValue(config),
			graph: jest.fn().mockResolvedValue({ data: suggestion_products }),
			listTopSearches: jest
				.fn()
				.mockResolvedValueOnce(recommends.slice(0, 3))
				.mockResolvedValueOnce(searchEngines),
		}));

		mockWorkflow.run.mockResolvedValue({ result: suggestion_products });

		await GET(req, res);
		expect(res.json).toHaveBeenCalledWith({
			success: true,
			top_searches: [
				{
					id: 'ts_01JMGTS4TKJ11V97JW9R0VH7XD',
					search: 'i',
					type: 'search-engine',
					uri: 'i',
				},
				{
					id: 'ts_01JMGV4BCFWBYQVD3CVKW6790M',
					search: 'a',
					type: 'search-engine',
					uri: 'a',
				},
				{
					id: 'ts_01J9JH3W1ZAJZ9S6F7ZXJY9E4T',
					search: 'iphone',
					type: 'search-engine',
					uri: 'iphone',
				},
				{
					id: 'ts_01JSB6XH3E2MVFY2P3DE4Y4VGR',
					search: 'ip',
					type: 'search-engine',
					uri: 'ip',
				},
				{
					id: 'ts_01J8444ZCP5259K1B72WBJPJCW',
					search: 'apple',
					type: 'search-engine',
					uri: 'apple',
				},
				{
					id: 'ts_01J81XZW3YEFYT6N7RB425BCJG',
					search: 'test dd',
					type: 'recommend',
					uri: '/test-ss',
				},
				{
					id: 'ts_01J8P2JYTEJBHGDP6XGW9S72NA',
					search: 'tes ee',
					type: 'recommend',
					uri: '/test-ee',
				},
				{
					id: 'ts_01JN6299ZER13A0Q5J2337PASD',
					search: 'd',
					type: 'recommend',
					uri: 'd',
				},
			],
			suggestion_products,
		});
	});

	it('should return top-search enabled and choose both mode recommend more then 10 items', async () => {
		const config = [
			{
				id: '01J8P2JYGXV218394QCKH4F2C4',
				path: 'top-search/general/enabled',
				value: '1',
				created_by: 'user_01J4GFNPNKZAB7CRPWYWEBWDJ3',
				updated_by: 'user_01JCMD0N5GMY4GF7MYEBHV0K35',
				metadata: null,
				deleted_at: null,
			},
			{
				id: '01J8P2JYNH8W26TAZ2WTFC0RRQ',
				path: 'top-search/general/display_mode',
				value: 'both',
				created_by: 'user_01J4GFNPNKZAB7CRPWYWEBWDJ3',
				updated_by: 'user_01JCMD0N5GMY4GF7MYEBHV0K35',
				metadata: null,
				deleted_at: null,
			},
		];

		req.scope.resolve.mockImplementation(() => ({
			getByPaths: jest.fn().mockResolvedValue(config),
			graph: jest.fn().mockResolvedValue({ data: suggestion_products }),
			listTopSearches: jest
				.fn()
				.mockResolvedValueOnce(recommends)
				.mockResolvedValueOnce(searchEngines),
		}));

		mockWorkflow.run.mockResolvedValue({ result: suggestion_products });

		await GET(req, res);
		expect(res.json).toHaveBeenCalledWith({
			success: true,
			top_searches: [
				{
					id: 'ts_01J81XZW3YEFYT6N7RB425BCJG',
					search: 'test dd',
					type: 'recommend',
					uri: '/test-ss',
				},
				{
					id: 'ts_01J8P2JYTEJBHGDP6XGW9S72NA',
					search: 'tes ee',
					type: 'recommend',
					uri: '/test-ee',
				},
				{
					id: 'ts_01JN6299ZER13A0Q5J2337PASD',
					search: 'd',
					type: 'recommend',
					uri: 'd',
				},
				{
					id: 'ts_01JN6299ZER13A0Q5J2337PASC',
					search: 'c',
					type: 'recommend',
					uri: 'c',
				},
				{
					id: 'ts_01JN6299ZER13A0Q5J2337PASG',
					search: 'g',
					type: 'recommend',
					uri: 'g',
				},
				{
					id: 'ts_01JN6299ZER13A0Q5J2337PASR',
					search: 'r',
					type: 'recommend',
					uri: 'r',
				},
				{
					id: 'ts_01JN6299ZER13A0Q5J2337PASS',
					search: 's',
					type: 'recommend',
					uri: 's',
				},
				{
					id: 'ts_01JN6299ZER13A0Q5J2337PAST',
					search: 't',
					type: 'recommend',
					uri: 't',
				},
				{
					id: 'ts_01JN6299ZER13A0Q5J2337PASU',
					search: 'u',
					type: 'recommend',
					uri: 'u',
				},
				{
					id: 'ts_01JN6299ZER13A0Q5J2337PASV',
					search: 'v',
					type: 'recommend',
					uri: 'v',
				},
			],
			suggestion_products,
		});
	});

	it('should return top-search enabled and choose both mode but recommend empty', async () => {
		const config = [
			{
				id: '01J8P2JYGXV218394QCKH4F2C4',
				path: 'top-search/general/enabled',
				value: '1',
				created_by: 'user_01J4GFNPNKZAB7CRPWYWEBWDJ3',
				updated_by: 'user_01JCMD0N5GMY4GF7MYEBHV0K35',
				metadata: null,
				deleted_at: null,
			},
			{
				id: '01J8P2JYNH8W26TAZ2WTFC0RRQ',
				path: 'top-search/general/display_mode',
				value: 'both',
				created_by: 'user_01J4GFNPNKZAB7CRPWYWEBWDJ3',
				updated_by: 'user_01JCMD0N5GMY4GF7MYEBHV0K35',
				metadata: null,
				deleted_at: null,
			},
		];

		req.scope.resolve.mockImplementation(() => ({
			getByPaths: jest.fn().mockResolvedValue(config),
			graph: jest.fn().mockResolvedValue({ data: suggestion_products }),
			listTopSearches: jest
				.fn()
				.mockResolvedValueOnce([])
				.mockResolvedValueOnce(searchEngines),
		}));

		mockWorkflow.run.mockResolvedValue({ result: suggestion_products });

		await GET(req, res);
		expect(res.json).toHaveBeenCalledWith({
			success: true,
			top_searches: [
				{
					id: 'ts_01JMGTS4TKJ11V97JW9R0VH7XD',
					search: 'i',
					type: 'search-engine',
					uri: 'i',
				},
				{
					id: 'ts_01JMGV4BCFWBYQVD3CVKW6790M',
					search: 'a',
					type: 'search-engine',
					uri: 'a',
				},
				{
					id: 'ts_01J9JH3W1ZAJZ9S6F7ZXJY9E4T',
					search: 'iphone',
					type: 'search-engine',
					uri: 'iphone',
				},
				{
					id: 'ts_01JSB6XH3E2MVFY2P3DE4Y4VGR',
					search: 'ip',
					type: 'search-engine',
					uri: 'ip',
				},
				{
					id: 'ts_01J8444ZCP5259K1B72WBJPJCW',
					search: 'apple',
					type: 'search-engine',
					uri: 'apple',
				},
			],
			suggestion_products,
		});
	});
});
