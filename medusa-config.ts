import {
	ContainerRegistrationKeys,
	Modules,
	defineConfig,
	loadEnv,
} from '@medusajs/framework/utils';

loadEnv(process.env.NODE_ENV || 'development', process.cwd());

const MEDUSA_BACKEND_URL =
	process.env.MEDUSA_BACKEND_URL || 'http://localhost:9000';
const MEDUSA_FRONTEND_URL =
	process.env.MEDUSA_FRONTEND_URL || 'http://localhost:8000';
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

const modules = [
	{
		resolve: '@medusajs/medusa/notification',
		options: {
			providers: [
				{
					id: 'sendgrid',
					resolve: '@medusajs/medusa/notification-sendgrid',
					options: {
						channels: ['email'],
						api_key: process.env.SENDGRID_API_KEY,
						from: process.env.SENDGRID_FROM,
					},
				},
				{
					resolve: '@medusajs/medusa/notification-local',
					id: 'local',
					options: {
						name: 'Local Notification Provider',
						channels: ['feed'],
					},
				},
				{
					resolve: './src/modules/my-notification',
					id: 'my-notification',
					options: {
						channels: ['store-notification'],
						redisUrl: REDIS_URL,
					},
				},
			],
		},
	},
	{
		resolve: '@medusajs/medusa/cache-redis',
		options: {
			redisUrl: REDIS_URL,
		},
	},
	{
		resolve: '@medusajs/medusa/event-bus-redis',
		options: {
			redisUrl: REDIS_URL,
		},
	},
	{
		resolve: '@medusajs/medusa/workflow-engine-redis',
		options: {
			redis: {
				url: REDIS_URL,
			},
		},
	},
	{
		resolve: '@medusajs/medusa/file',
		options: {
			providers: [
				{
					resolve: '@medusajs/medusa/file-s3',
					id: 's3',
					options: {
						file_url: process.env.S3_FILE_URL,
						access_key_id: process.env.S3_ACCESS_KEY_ID,
						secret_access_key: process.env.S3_SECRET_ACCESS_KEY,
						region: process.env.S3_REGION,
						bucket: process.env.S3_BUCKET,
						endpoint: process.env.S3_ENDPOINT,
						additional_client_config: {
							forcePathStyle: true,
						},
					},
				},
			],
		},
	},
	{
		resolve: '@medusajs/medusa/auth',
		dependencies: [Modules.CACHE, ContainerRegistrationKeys.LOGGER],
		options: {
			providers: [
				{
					resolve: '@medusajs/medusa/auth-emailpass',
					id: 'emailpass',
					options: {},
				},
				{
					resolve: '@medusajs/medusa/auth-google',
					id: 'google',
					options: {
						clientId: process.env.GOOGLE_CLIENT_ID,
						clientSecret: process.env.GOOGLE_CLIENT_SECRET,
						callbackUrl: process.env.GOOGLE_CALLBACK_URL,
					},
				},
				{
					resolve: './src/modules/auth-phone',
					id: 'auth-phone',
					dependencies: [Modules.CACHE, ContainerRegistrationKeys.LOGGER],
					options: {},
				},
				{
					resolve: '@zimpligital/medusa-plugin-auth-otp/providers/auth-otp',
					id: 'auth-otp',
					dependencies: [Modules.CACHE, ContainerRegistrationKeys.LOGGER],
					options: {},
				},
			],
		},
	},
	{
		resolve: '@medusajs/medusa/payment',
		options: {
			providers: [
				{
					resolve: './src/modules/payment/2c2p',
					id: '2c2p',
					options: {
						host: process.env.PAYMENT_2C2P_API_URL,
						merchantId: process.env.PAYMENT_2C2P_MERCHANT_ID,
						secretKey: process.env.PAYMENT_2C2P_MERCHANT_SECRET_KEY,
					},
				},
				{
					resolve: "@medusajs/medusa/payment-stripe",
					id: "stripe",
					options: {
						apiKey: process.env.STRIPE_API_KEY,
						webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
						capture: true,
					},
				},
			],
		},
	},
	{
		resolve: './src/modules/contact-us',
	},
	{
		resolve: './src/modules/product-variant-images',
	},
	{
		resolve: './src/modules/strapi/product-categories',
	},
	{
		resolve: './src/modules/strapi/homepage-banner',
	},
	{
		resolve: './src/modules/strapi/mini-banner',
	},
	{
		resolve: './src/modules/strapi/cms-page',
	},
	{
		resolve: './src/modules/strapi/block',
	},
	{
		resolve: './src/modules/strapi/home-category',
	},
	{
		resolve: './src/modules/strapi/pre-order',
	},
	{
		resolve: './src/modules/admin',
	},
	{
		resolve: './src/modules/config-data',
	},
	{
		resolve: './src/modules/search-log',
		dependencies: [Modules.EVENT_BUS, Modules.PRODUCT],
	},
	{
		resolve: './src/modules/meilisearch/product-meilisearch',
		options: {
			host: process.env.MEILISEARCH_URL,
			apiKey: process.env.MEILISEARCH_ADMIN_API_KEY,
		},
	},
	{
		resolve: './src/modules/product-attributes',
	},
	{
		resolve: './src/modules/strapi/product',
	},
	{
		resolve: './src/modules/strapi/brand-banner',
	},
	{
		resolve: './src/modules/master-address',
	},
	{
		resolve: './src/modules/payment-restriction',
	},
	{
		resolve: './src/modules/pre-order',
	},
	{
		resolve: './src/modules/promotion-custom',
	},
	{
		resolve: './src/modules/price-list-custom',
	},
	{
		resolve: '@medusajs/medusa/fulfillment',
		options: {
			providers: [
				{
					resolve: './src/modules/fulfillment-calculate',
					id: 'fulfillment-calculate-provider',
					options: {},
				},
			],
		},
	},
	{
		resolve: './src/modules/storefront',
	},
	{
		resolve: './src/modules/import',
	},
	{
		resolve: './src/modules/store-notification',
		dependencies: [Modules.NOTIFICATION],
	},
	{
		resolve: './src/modules/fulfillment-tracking',
	},
	{
		resolve: './src/modules/strapi/product-collection',
	},
	{
		resolve: './src/modules/personalization',
		dependencies: [Modules.EVENT_BUS],
	},
];

const DATABASE_POOL_MAX = process.env.DATABASE_POOL_MAX
	? +process.env.DATABASE_POOL_MAX
	: 8;

const plugins = [
	{
		resolve: '@zimpligital/medusa-plugin-auth-otp',
		options: {
			awsSNSAccessKeyId: process.env.AWS_SNS_ACCESS_KEY_ID,
			awsSNSAccessKeySecret: process.env.AWS_SNS_SECRET_ACCESS_KEY,
			awsSNSRegion: process.env.AWS_SNS_REGION,
			jwtSecret: process.env.JWT_SECRET,
			otpConfigs: {
				subject: 'UTECH-OTP',
				message:
					'Your verification code is {otp} (ref. :{ref_code}) please verify within 90 secs',
				expiry: 90,
				verifyAttemptLimit: 5,
				retryDelay: 90,
				webUrl: process.env.MEDUSA_FRONTEND_URL,
			},
		},
	},
	{
		resolve: '@zimpligital/medusa-plugin-order-export',
		options: {},
	},
	{
		resolve: '@zimpligital/medusa-plugin-product-review',
		options: {},
	},
];

const WORKER_MODE = process.env.WORKER_MODE as 'shared' | 'server' | 'worker';
const ADMIN_DISABLED = process.env.ADMIN_DISABLED === 'true';

module.exports = defineConfig({
	plugins,
	admin: {
		backendUrl: MEDUSA_BACKEND_URL,
		storefrontUrl: MEDUSA_FRONTEND_URL,
		disable: ADMIN_DISABLED || false,
	},
	projectConfig: {
		workerMode: WORKER_MODE || 'shared',
		databaseUrl: process.env.DATABASE_URL,
		databaseDriverOptions: {
			pool: {
				max: DATABASE_POOL_MAX,
				idleTimeoutMillis: 30000,
				// connectionTimeoutMillis: 10000,
				acquireTimeoutMillis: 30000,
				createRetryIntervalMillis: 100,
			},
		},
		redisUrl: REDIS_URL,
		// database_extra:
		//   process.env.NODE_ENV === "develop"
		//     ? { ssl: { rejectUnauthorized: false } }
		//     : {},
		http: {
			storeCors: process.env.STORE_CORS,
			adminCors: process.env.ADMIN_CORS,
			authCors: process.env.AUTH_CORS,
			jwtSecret: process.env.JWT_SECRET || 'supersecret',
			cookieSecret: process.env.COOKIE_SECRET || 'supersecret',
		},
	},
	modules,
});
