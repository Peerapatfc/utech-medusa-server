// Base types for tracking data
export interface TrackingEvent {
	seq_num: number;
	accept_time: string;
	remark: string;
}

export interface FulfillmentTracking {
	id: string;
	current_status: string;
	tracking_events: TrackingEvent[];
	updated_at: string;
}

// API response types from external tracking service
export interface TraceDetail {
	seqNum: number;
	acceptTime: number;
	remark: string;
	[key: string]: unknown;
}

export interface ExpressInfo {
	data?: {
		expressList?: Array<{
			currentScanType?: string;
			traceDetails?: TraceDetail[];
		}>;
	};
}

export interface AuthResponse {
	success: boolean;
	data?: {
		token: string;
	};
	error?: string;
}

// Internal data structures
export interface FulfillmentLabel {
	id: string;
	tracking_number: string;
	fulfillment_tracking?: FulfillmentTracking;
}

export interface Fulfillment {
	labels: FulfillmentLabel[];
}

export interface Order {
	id: string;
	fulfillments: Fulfillment[];
}

export interface OrderData {
	data: Order[];
}

// Workflow step input types
export interface QueryOrderDataInput {
	order_id: string;
}

export interface FetchExpressInfoInput {
	order_data: OrderData;
	auth_response: AuthResponse;
}

export interface CreateFulfillmentTrackingInput {
	tracking_events?: TrackingEvent[];
	current_status: string;
	express_info?: ExpressInfo | null;
}

export interface UpdateFulfillmentTrackingInput {
	tracking_events?: TrackingEvent[];
	current_status: string;
	fulfillment_tracking_id?: string;
	order_data?: OrderData;
	express_info?: ExpressInfo | null;
}

export interface LinkFulfillmentTrackingInput {
	order_data: OrderData | null;
	fulfillment_tracking: Array<{
		id: string;
	}>;
}

export interface ProcessTrackingDataInput {
	order_data: OrderData;
	express_info: ExpressInfo | null;
}
