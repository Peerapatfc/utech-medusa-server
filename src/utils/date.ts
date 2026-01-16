import type { CheckTimeRangeOverlapParams } from '@customTypes/date';
import dayjs from 'dayjs';
import 'dayjs/locale/th';
import buddhistEra from 'dayjs/plugin/buddhistEra';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import relativeTime from 'dayjs/plugin/relativeTime';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

dayjs.extend(buddhistEra);
dayjs.extend(timezone);
dayjs.extend(utc);
dayjs.extend(customParseFormat);
dayjs.extend(relativeTime);

const defaultTimezone = 'Asia/Bangkok';

export const getBuddhistDate = (date: Date | string) => {
	return dayjs(date).tz('Asia/Bangkok').format('DD/MM/BBBB');
};

/* 07 กุมภาพันธ์ 2566 */
export const DateLongTH = (date: Date) => {
	dayjs.locale('th');
	return dayjs(date).tz('Asia/Bangkok').format('DD MMMM BBBB');
};

/* 07 ก.พ. 2566 */
export const DateShortTH = (date: Date) => {
	dayjs.locale('th');
	return dayjs(date).tz('Asia/Bangkok').format('DD MMM BB');
};

/* 07 February 2023 */
export const DateLongEN = (date: Date) => {
	dayjs.locale('en');
	return dayjs(date).tz('Asia/Bangkok').format('DD MMMM YYYY');
};

/* 07 Feb 23 */
export const DateShortEN = (date: Date) => {
	dayjs.locale('en');
	return dayjs(date).tz('Asia/Bangkok').format('DD MMM YY');
};

export const getCurrentDate = (format = 'YYYY-MM-DD HH:mm:ss') => {
	return dayjs().tz(defaultTimezone).format(format);
};

/**
 * Checks if two time ranges overlap.
 *
 * @param {Object} params - The time range parameters.
 * @param {string | Date | null} params.starts_at_1 - Start time of the first range (nullable).
 * @param {string | Date | null} params.ends_at_1 - End time of the first range (nullable).
 * @param {string | Date | null} params.starts_at_2 - Start time of the second range (nullable).
 * @param {string | Date | null} params.ends_at_2 - End time of the second range (nullable).
 * @returns {boolean} - Returns `true` if the time ranges overlap, otherwise `false`.
 *
 * If a start time is `null`, it defaults to the earliest possible date (1970-01-01).
 * If an end time is `null`, it defaults to the latest possible date (9999-12-31).
 *
 * Overlapping conditions:
 * - The first range starts before the second range ends.
 * - The first range ends after the second range starts.
 *
 * Example usage:
 * ```ts
 * isTimeRangesOverlap({
 *   starts_at_1: '2025-03-01T10:00:00',
 *   ends_at_1: '2025-03-01T12:00:00',
 *   starts_at_2: '2025-03-01T11:00:00',
 *   ends_at_2: '2025-03-01T13:00:00'
 * }); // Returns: true
 * ```
 */
export const isTimeRangesOverlap = ({
	starts_at_1,
	ends_at_1,
	starts_at_2,
	ends_at_2,
}: CheckTimeRangeOverlapParams): boolean => {
	const defaultStart = dayjs('1970-01-01');
	const defaultEnd = dayjs('9999-12-31');

	const start1 = starts_at_1 ? dayjs(starts_at_1) : defaultStart;
	const end1 = ends_at_1 ? dayjs(ends_at_1) : defaultEnd;
	const start2 = starts_at_2 ? dayjs(starts_at_2) : defaultStart;
	const end2 = ends_at_2 ? dayjs(ends_at_2) : defaultEnd;

	return start1.isBefore(end2) && end1.isAfter(start2);
};

export const convertCustomFormatToUTC = (dateStr: string) => {
	return dayjs.tz(dateStr, 'M/D/YYYY H:mm', defaultTimezone).toISOString();
};

/**
 *
 * - case: second return  "a few seconds ago".
 * - case: minute return  "a minutes ago" - "44 minutes ago".
 * - case: hour return "an hour ago" - "21 hours ago".
 * - case: day return "a day ago" - "25 days ago".
 * - case: month return "a month ago" - "10 months ago".
 * - case: year return "a year ago" - "xxxx years ago".
 *
 * @param date - The date to calculate the time ago from. Can be a `Date` object or an ISO 8601 string.
 * @returns A string describing the time elapsed since the given date in a human-readable format.
 */
export const getTimeAgo = (date: Date | string) => {
	return dayjs(date).fromNow();
};

export const isMoreThan30Days = (start: Date): boolean => {
	const now = Date.now();
	const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
	return now - start.getTime() > THIRTY_DAYS_MS;
};
