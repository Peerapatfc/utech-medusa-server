export type PaymentRestriction = {
	id?: string;
	name: string;
	payment_providers: string[];
	is_active: string | boolean;
	payment_restriction_rules?: PaymentRestrictionRule[];
	rules?: {
		attribute: string;
		operator: string;
		values: string | string[];
		required: boolean;
		disguised: boolean;
	}[];
};

export type PaymentRestrictionRule = {
	id?: string;
	description?: string;
	attribute: string;
	operator: string;
	payment_restriction_id: string;
	payment_restriction?: PaymentRestriction;
	payment_restriction_rule_values?: PaymentRestrictionRuleValue[];
};

export type PaymentRestrictionRuleValue = {
	id?: string;
	value: string;
	payment_restriction_rule_id: string;
	payment_restriction_rule?: PaymentRestrictionRule;
};

export type Response = {
	status: Status;
	code: Code;
	message: string;
};

export enum Status {
	SUCCESS = 'success',
	BADREQUEST = 'bad_request',
}

export enum Code {
	SUCCESS = 200,
	BADREQUEST = 400,
}
