import { format } from 'date-fns';

export const dateTimeFormat = (date: string | null | undefined) => {
  if(!date) return '-';
  const value = new Date(date);
	const timestampFormat = 'dd MMM yyyy HH:mm';
	const dateWithFormat = format(value, timestampFormat);
  return dateWithFormat;
}

export const dateFormat = (date: string | null | undefined) => {
  if(!date) return '-';
  const value = new Date(date);
	const timestampFormat = 'dd MMM yyyy';
	const dateWithFormat = format(value, timestampFormat);
  return dateWithFormat;
}