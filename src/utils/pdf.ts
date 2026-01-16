import * as fs from 'node:fs';
import path from 'node:path';
import type { TFontDictionary } from 'pdfmake/interfaces';
import pdfMakePrinter from 'pdfmake';

export const pdfPrinter = () => {
	const fontPath = '../assets/fonts';
	const NotoSans = {
		normal: fs.readFileSync(
			path.resolve(__dirname, `${fontPath}/NotoSansThai-Regular.ttf`),
		),
		bold: fs.readFileSync(
			path.resolve(__dirname, `${fontPath}/NotoSansThai-Bold.ttf`),
		),
		italics: fs.readFileSync(
			path.resolve(__dirname, `${fontPath}/NotoSansThai-Thin.ttf`),
		),
		bolditalics: fs.readFileSync(
			path.resolve(__dirname, `${fontPath}/NotoSansThai-Medium.ttf`),
		),
	};
	const fonts: TFontDictionary = {
		NotoSans,
	};
	const printer = new pdfMakePrinter(fonts);

	return printer;
};
