export const mockPromotionRuleMembers = [
	{
		attribute: 'customer.groups.id',
		values: [
			{
				value: 'member',
			},
		],
	},
];
export const mockPromotionRuleNewMembers = [
	{
		attribute: 'customer.groups.id',
		values: [
			{
				value: 'new-member',
			},
		],
	},
];
const expiredPromotions = [
	{
		id: 'expired-promo-1',
		campaign: {
			starts_at: '2024-12-01T23:59:59.000Z',
			ends_at: '2024-12-31T23:59:59.000Z',
			budget: {
				used: 1,
				limit: 1,
			},
		},
		promotion_detail: {
			is_store_visible: true,
			is_new_customer: false,
		},
		rules: mockPromotionRuleMembers,
	},
	{
		id: 'expired-promo-2',
		campaign: {
			starts_at: '2024-12-01T23:59:59.000Z',
			ends_at: '2024-12-31T23:59:59.000Z',
			budget: {
				used: 1,
				limit: 1,
			},
		},
		promotion_detail: {
			is_store_visible: true,
			is_new_customer: true,
		},
		rules: mockPromotionRuleNewMembers,
	},
	{
		id: 'yesterday-promo-1',
		campaign: {
			starts_at: '2024-12-31T00:00:00.000Z',
			ends_at: '2024-12-31T23:59:59.000Z',
			budget: {
				used: 1,
				limit: 1,
			},
		},
		promotion_detail: {
			is_store_visible: true,
			is_new_customer: false,
		},
		rules: mockPromotionRuleMembers,
	},
];

const inTimePromotions = [
	{
		id: 'in-time-promo-1',
		campaign: {
			starts_at: '2024-12-01T23:59:59.000Z',
			ends_at: '2025-12-31T23:59:59.000Z',
			budget: {
				used: 1,
				limit: 1,
			},
		},
		promotion_detail: {
			is_store_visible: true,
			is_new_customer: true,
		},
		rules: mockPromotionRuleNewMembers,
	},
	{
		id: 'in-time-promo-2',
		campaign: {
			starts_at: '2024-12-01T23:59:59.000Z',
			ends_at: '2025-12-31T23:59:59.000Z',
			budget: {
				used: 1,
				limit: 1,
			},
		},
		promotion_detail: {
			is_store_visible: true,
			is_new_customer: false,
		},
		rules: mockPromotionRuleMembers,
	},
	{
		id: 'in-time-promo-3',
		campaign: {
			starts_at: '2024-12-01T23:59:59.000Z',
			ends_at: '2025-12-31T23:59:59.000Z',
			budget: {
				used: 1,
				limit: 1,
			},
		},
		promotion_detail: {
			is_store_visible: true,
			is_new_customer: false,
		},
		rules: mockPromotionRuleMembers,
	},
];

export const mockMemberVisible = [
	{
		id: 'in-time-promo-2',
		campaign: {
			starts_at: '2024-12-01T23:59:59.000Z',
			ends_at: '2025-12-31T23:59:59.000Z',
			budget: {
				used: 1,
				limit: 1,
			},
		},
		promotion_detail: {
			is_store_visible: true,
			is_new_customer: false,
		},
		rules: mockPromotionRuleMembers,
	},
	{
		id: 'in-time-promo-3',
		campaign: {
			starts_at: '2024-12-01T23:59:59.000Z',
			ends_at: '2025-12-31T23:59:59.000Z',
			budget: {
				used: 1,
				limit: 1,
			},
		},
		promotion_detail: {
			is_store_visible: true,
			is_new_customer: false,
		},
		rules: mockPromotionRuleMembers,
	},
	{
		id: 'visible-promo-1',
		campaign: {
			starts_at: '2024-12-01T23:59:59.000Z',
			ends_at: '2025-12-31T23:59:59.000Z',
			budget: {
				used: 1,
				limit: 1,
			},
		},
		promotion_detail: {
			is_store_visible: true,
			is_new_customer: false,
		},
		rules: mockPromotionRuleMembers,
		budget: {
			used: 1,
			limit: 1,
		},
	},
];

export const mockNewMemberVisible = [
	{
		id: 'in-time-promo-1',
		code: 'in-time-promo-1',
		campaign: {
			starts_at: '2024-12-01T23:59:59.000Z',
			ends_at: '2025-12-31T23:59:59.000Z',
			budget: {
				used: 1,
				limit: 1,
			},
		},
		promotion_detail: {
			name: 'In time promo 1',
			description: 'In time promo 1',
			is_store_visible: true,
			is_new_customer: true,
		},
		rules: mockPromotionRuleNewMembers,
	},
	{
		id: 'in-time-promo-3',
		code: 'in-time-promo-3',
		campaign: {
			starts_at: '2024-12-01T23:59:59.000Z',
			ends_at: '2025-12-31T23:59:59.000Z',
			budget: {
				used: 1,
				limit: 1,
			},
		},
		promotion_detail: {
			name: 'In time promo 3',
			description: 'In time promo 3',
			is_store_visible: true,
			is_new_customer: true,
		},
		rules: mockPromotionRuleNewMembers,
	},
];

const futurePromotions = [
	{
		id: 'tomorrow-promo-1',
		campaign: {
			starts_at: '2025-01-02T00:00:00.000Z',
			ends_at: '2025-01-02T23:59:59.000Z',
			budget: {
				used: 1,
				limit: 1,
			},
		},
		promotion_detail: {
			is_store_visible: true,
			is_new_customer: true,
		},
		rules: mockPromotionRuleNewMembers,
	},
];

export const mockPromotions = [
	...expiredPromotions,
	...inTimePromotions,
	...futurePromotions,
	{
		id: 'visible-promo-1',
		campaign: {
			starts_at: '2024-12-01T23:59:59.000Z',
			ends_at: '2025-12-31T23:59:59.000Z',
			budget: {
				used: 1,
				limit: 1,
			},
		},
		promotion_detail: {
			is_store_visible: true,
			is_new_customer: false,
		},
		rules: mockPromotionRuleMembers,
		budget: {
			used: 1,
			limit: 1,
		},
	},
	{
		id: 'not-visible-promo-1',
		campaign: {
			starts_at: '2024-12-01T23:59:59.000Z',
			ends_at: '2025-12-31T23:59:59.000Z',
			budget: {
				used: 1,
				limit: 1,
			},
		},
		promotion_detail: {
			is_store_visible: false,
			is_new_customer: false,
		},
		rules: mockPromotionRuleMembers,
	},
	{
		id: 'not-visible-promo-2',
		campaign: {
			starts_at: '2024-12-01T23:59:59.000Z',
			ends_at: '2025-12-31T23:59:59.000Z',
			budget: {
				used: 1,
				limit: 1,
			},
		},
		promotion_detail: {
			is_store_visible: false,
			is_new_customer: true,
		},
		rules: mockPromotionRuleNewMembers,
	},
];
