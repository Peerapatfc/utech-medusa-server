import { GET } from '../../../../admin/blog/export/route';

const mockWorkflowRun = jest.fn();
jest.mock('../../../../../workflows/blog/export', () => ({
	getBlogExportWorkflow: jest.fn(() => ({ run: mockWorkflowRun })),
}));

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
let req: any;
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
let res: any;

describe('GET /admin/blog/export route', () => {
	req = {
		validatedQuery: { start_date: '2024-01-01', end_date: '2024-01-31' },
	};
	res = {
		setHeader: jest.fn(),
		status: jest.fn().mockReturnThis(),
		send: jest.fn(),
		json: jest.fn(),
	};

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('returns CSV with proper headers', async () => {
		const csvData = { csvContent: 'data', filename: 'test.csv' };
		mockWorkflowRun.mockResolvedValue({ result: csvData });

		await GET(req, res);

		expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'text/csv');
		expect(res.setHeader).toHaveBeenCalledWith(
			'Content-Disposition',
			`attachment; filename="${csvData.filename}"`,
		);
		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.send).toHaveBeenCalledWith(csvData.csvContent);
	});

	it('passes correct parameters to workflow', async () => {
		mockWorkflowRun.mockResolvedValue({
			result: { csvContent: '', filename: '' },
		});

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
		expect(res.json).toHaveBeenCalledWith({ message: 'Export failed' });
	});
});
