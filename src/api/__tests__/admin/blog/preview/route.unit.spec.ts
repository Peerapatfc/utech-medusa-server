import { GET } from '../../../../admin/blog/preview/route';

const mockWorkflowRun = jest.fn();
jest.mock('../../../../../workflows/blog/preview', () => ({
	getBlogPreviewWorkflow: jest.fn(() => ({ run: mockWorkflowRun })),
}));

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
let req: any;
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
let res: any;

describe('GET /admin/blog/preview route', () => {
	req = {
		validatedQuery: { start_date: '2024-01-01', end_date: '2024-01-31' },
	};
	res = {
		status: jest.fn().mockReturnThis(),
		json: jest.fn(),
	};

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('returns JSON response', async () => {
		const blogData = [{ id: 1, title: 'Test Blog' }];
		mockWorkflowRun.mockResolvedValue({ result: blogData });

		await GET(req, res);

		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.json).toHaveBeenCalledWith(blogData);
	});

	it('passes correct parameters to workflow', async () => {
		mockWorkflowRun.mockResolvedValue({ result: [] });

		await GET(req, res);

		expect(mockWorkflowRun).toHaveBeenCalledWith({
			input: { start_date: '2024-01-01', end_date: '2024-01-31' },
		});
	});

	it('returns 500 on workflow error', async () => {
		mockWorkflowRun.mockRejectedValue(new Error());
		jest.spyOn(console, 'error').mockImplementation(() => {});

		await GET(req, res);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.json).toHaveBeenCalledWith({ message: 'Preview failed' });
	});
});
