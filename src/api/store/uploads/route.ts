import { uploadFilesWorkflow } from '@medusajs/core-flows';
import type { MedusaResponse, MedusaRequest } from '@medusajs/framework/http';
import { MedusaError } from '@medusajs/framework/utils';
import type { HttpTypes } from '@medusajs/framework/types';

export const POST = async (
	req: MedusaRequest<HttpTypes.AdminUploadFile>,
	res: MedusaResponse<HttpTypes.AdminFileListResponse>,
) => {
	// @ts-ignore
	const input = req.files as Express.Multer.File[];

	const oversizedFiles = input.filter((f) => {
		if (f.mimetype.startsWith('image')) {
			return f.size > 20000000;
		}
		if (f.mimetype.startsWith('video')) {
			return f.size > 50000000;
		}
		return true;
	});

	if (oversizedFiles.length) {
		throw new MedusaError(
			MedusaError.Types.INVALID_DATA,
			'File size exceeds limit (20MB for images, 50MB for videos)',
		);
	}

	// validate mimetype must be image or video
	const invalidFiles = input.filter(
		(f) => !f.mimetype.startsWith('image') && !f.mimetype.startsWith('video'),
	);
	if (invalidFiles.length) {
		throw new MedusaError(
			MedusaError.Types.INVALID_DATA,
			'Invalid file type. Only images and videos are allowed',
		);
	}

	if (!input?.length) {
		throw new MedusaError(
			MedusaError.Types.INVALID_DATA,
			'No files were uploaded',
		);
	}

	// rename f.originalname if has thai characters
	const thaiCharacters = /[ก-๙]/;
	const hasThaiCharacters = input.some((f) =>
		thaiCharacters.test(f.originalname),
	);
	if (hasThaiCharacters) {
		for (const f of input) {
			if (thaiCharacters.test(f.originalname)) {
				const ext = f.originalname.split('.').pop();
				f.originalname = `${Date.now()}.${ext}`;
			}
		}
	}

	try {
		const { result } = await uploadFilesWorkflow(req.scope).run({
			input: {
				files: input?.map((f) => ({
					filename: f.originalname,
					mimeType: f.mimetype,
					content: f.buffer.toString('binary'),
					access: 'public',
				})),
			},
		});

		res.status(200).json({ files: result });
	} catch (error) {
		console.error(error);
		throw new MedusaError(
			MedusaError.Types.INVALID_DATA,
			'Error uploading files',
		);
	}
};
