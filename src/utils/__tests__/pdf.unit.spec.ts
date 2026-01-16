import * as fs from 'node:fs';
import path from 'node:path';
import pdfMakePrinter from 'pdfmake';
import { pdfPrinter } from '../pdf'; // Adjust the import based on your file structure

jest.mock('node:fs');
jest.mock('node:path', () => ({
	resolve: jest.fn(),
}));
jest.mock('pdfmake');

describe('pdfPrinter', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('should create a pdfMakePrinter instance with the correct fonts', () => {
		// Mock font paths
		(path.resolve as jest.Mock).mockImplementation((...args) => args.join('/'));

		// Mock font file data
		const mockFontBuffer = Buffer.from('mock font data');
		(fs.readFileSync as jest.Mock).mockReturnValue(mockFontBuffer);

		// Call the function
		const printer = pdfPrinter();

		// Assert pdfMakePrinter was created with correct fonts
		expect(pdfMakePrinter).toHaveBeenCalledWith({
			NotoSans: {
				normal: mockFontBuffer,
				bold: mockFontBuffer,
				italics: mockFontBuffer,
				bolditalics: mockFontBuffer,
			},
		});

		// Assert the returned printer is the mocked pdfMakePrinter
		expect(printer).toBeInstanceOf(pdfMakePrinter);
	});
});
