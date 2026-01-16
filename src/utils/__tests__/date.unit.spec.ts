// jest.setup.js
import dayjs from 'dayjs';
import buddhistEra from 'dayjs/plugin/buddhistEra';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import 'dayjs/locale/th';

// Setup plugins and locale for testing
dayjs.extend(buddhistEra);
dayjs.extend(timezone);
dayjs.extend(utc);
dayjs.locale('en');

// Tests
import {
	getBuddhistDate,
	DateLongTH,
	DateShortTH,
	DateLongEN,
	DateShortEN,
	getCurrentDate,
} from '../date';

describe('Date Utility Functions', () => {
	const mockDate = new Date('2023-02-07T00:00:00Z'); // Fixed UTC date for testing
	const bangkokTimezone = 'Asia/Bangkok';

	test('getBuddhistDate formats correctly in Buddhist Era', () => {
		const result = getBuddhistDate(mockDate);
		expect(result).toBe('07/02/2566');
	});

	test('DateLongTH returns the correct Thai long date format', () => {
		const result = DateLongTH(mockDate);
		expect(result).toBe('07 กุมภาพันธ์ 2566');
	});

	test('DateShortTH returns the correct Thai short date format', () => {
		const result = DateShortTH(mockDate);
		expect(result).toBe('07 ก.พ. 66');
	});

	test('DateLongEN returns the correct English long date format', () => {
		const result = DateLongEN(mockDate);
		expect(result).toBe('07 February 2023');
	});

	test('DateShortEN returns the correct English short date format', () => {
		const result = DateShortEN(mockDate);
		expect(result).toBe('07 Feb 23');
	});

	test('getCurrentDate returns the current date in default format', () => {
		const now = dayjs().tz(bangkokTimezone).format('YYYY-MM-DD HH:mm:ss');
		const result = getCurrentDate();
		expect(result).toBe(now);
	});

	test('getCurrentDate returns the current date in custom format', () => {
		const customFormat = 'DD/MM/YYYY';
		const now = dayjs().tz(bangkokTimezone).format(customFormat);
		const result = getCurrentDate(customFormat);
		expect(result).toBe(now);
	});
});
