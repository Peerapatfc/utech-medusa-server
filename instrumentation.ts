import Sentry from '@sentry/node';
import otelApi from '@opentelemetry/api';
import { registerOtel } from '@medusajs/medusa';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import {
	SentrySpanProcessor,
	SentryPropagator,
} from '@sentry/opentelemetry-node';

const SENTRY_DSN = process.env.SENTRY_DSN;
const ENVIRONMENT = process.env.NODE_ENV || 'development';

if (SENTRY_DSN && ENVIRONMENT !== 'development') {
	Sentry.init({
		dsn: SENTRY_DSN,
		tracesSampleRate: 1.0,
		// @ts-ignore
		instrumenter: 'otel',
		environment: ENVIRONMENT,
		// debug: true,
	});

	console.log(
		`Sentry initialized in instrumentation.ts with environment: ${process.env.NODE_ENV}`,
	);

	// Sentry.captureMessage('Test Sentry message');
	// Sentry.captureException(new Error('Test error from Node.js'));
}

otelApi.propagation.setGlobalPropagator(new SentryPropagator());

export function register() {
	registerOtel({
		serviceName: 'medusa',
		spanProcessor: new SentrySpanProcessor(),
		traceExporter: new OTLPTraceExporter(),
		instrument: {
			http: true,
			workflows: true,
			query: true,
		},
	});
}
