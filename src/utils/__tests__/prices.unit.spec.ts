import { formatPriceString, formatPriceWithDecimal } from '../prices';

describe('utils formatPriceString', () => {
	const mocks = [
		{
			input: 1000,
			output: '1,000',
		},
		{
			input: 0,
			output: '0',
		},
		{
			input: 1234567890,
			output: '1,234,567,890',
		},
		{
			input: -1000,
			output: '-1,000',
		},
	];

	describe.each(mocks)('formatPriceString', ({ input, output }) => {
		it(`should format ${input} as ${output}`, () => {
			expect(formatPriceString(input)).toBe(output);
		});
	});
});

describe('utils formatPriceWithDecimal', () => {
	const mocks = [
		{
			input: 1000,
			output: '1,000.00',
		},
		{
			input: 0,
			output: '0.00',
		},
		{
			input: 1234567890,
			output: '1,234,567,890.00',
		},
		{
			input: -1000,
			output: '-1,000.00',
		},
		{
			input: 1234.567,
			output: '1,234.57',
		},
		{
			input: 123456789.234,
			output: '123,456,789.23',
		},
	];

	describe.each(mocks)('formatPriceWithDecimal', ({ input, output }) => {
		it(`should format ${input} as ${output}`, () => {
			expect(formatPriceWithDecimal(input)).toBe(output);
		});
	});
});
