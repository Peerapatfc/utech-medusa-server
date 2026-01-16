import { MedusaRequest, MedusaResponse } from '@medusajs/framework';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const AWS_S3_BUCKET = process.env.S3_BUCKET;
const AWS_REGION = process.env.S3_REGION;
const AWS_ACCESS_KEY_ID = process.env.S3_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.S3_SECRET_ACCESS_KEY;

const s3 = new S3Client({
	region: AWS_REGION,
	credentials: {
		accessKeyId: AWS_ACCESS_KEY_ID,
		secretAccessKey: AWS_SECRET_ACCESS_KEY,
	},
});
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
	const { fileName, fileType } = req.query;
	if (!fileName || !fileType) {
		return res.status(400).json({
			error: "Missing required query parameters 'fileName' or 'fileType'",
		});
	}

	const key = `uploads/${Date.now()}-${fileName}`;

	const command = new PutObjectCommand({
		Bucket: AWS_S3_BUCKET as string,
		Key: key,
		ContentType: fileType as string,
	});

	const signedUrl = await getSignedUrl(s3, command, { expiresIn: 60 }); // 60s
	const fileUrl = `https://${AWS_S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com/${key}`;

	res.json({
		uploadUrl: signedUrl,
		fileUrl,
	});
};
