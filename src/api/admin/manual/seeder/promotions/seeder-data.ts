import type {
	CreateCampaignDTO,
	CreatePromotionDTO,
} from '@medusajs/framework/types';

interface CreateCampaignDTOnWithPromotions extends CreateCampaignDTO {
	promotions?: CreatePromotionDTO[];
}

export const campaigns: CreateCampaignDTOnWithPromotions[] = [
	{
		name: 'New Year 2025 Campaign',
		description: 'This is a test campaign 1 Jan - 31 Jan 2025',
		campaign_identifier: 'NY2025',
		starts_at: new Date('2025-01-01 00:00:00'),
		ends_at: new Date('2025-01-31 23:59:59'),
		budget: {
			type: 'usage',
			limit: 100,
			currency_code: 'THB',
		},
		promotions: [
			{
				code: 'NY-10',
				type: 'standard',
				status: 'active',
				is_automatic: false,
				application_method: {
					type: 'fixed',
					target_type: 'items',
					value: 10,
					max_quantity: 1,
					allocation: 'each',
					currency_code: 'THB',
				},
				rules: [],
				campaign_id: '',
			},
			{
				code: 'NY-20',
				type: 'standard',
				status: 'active',
				is_automatic: false,
				application_method: {
					type: 'fixed',
					target_type: 'items',
					value: 20,
					max_quantity: 1,
					allocation: 'each',
					currency_code: 'THB',
				},
				rules: [],
				campaign_id: '',
			},
			{
				code: 'NY-30',
				type: 'standard',
				status: 'active',
				is_automatic: false,
				application_method: {
					type: 'fixed',
					target_type: 'items',
					value: 30,
					max_quantity: 1,
					allocation: 'each',
					currency_code: 'THB',
				},
				rules: [],
				campaign_id: '',
			},
		],
	},
	{
		name: 'Campaign A',
		description: 'This is a Campaign A',
		campaign_identifier: 'CA',
		starts_at: new Date('2026-01-01 00:00:00'),
		ends_at: new Date('2026-01-31 23:59:59'),
		budget: {
			type: 'usage',
			limit: 1000,
			currency_code: 'THB',
		},
		promotions: [
			{
				code: 'CA-15',
				type: 'standard',
				status: 'active',
				is_automatic: false,
				application_method: {
					type: 'fixed',
					target_type: 'items',
					value: 15,
					max_quantity: 1,
					allocation: 'each',
					currency_code: 'THB',
				},
				rules: [],
				campaign_id: '',
			},
		],
	},
	{
		name: 'Feb 2026 Campaign',
		description: 'This is a Feb 2026 Campaign',
		campaign_identifier: 'FEB2026',
		starts_at: new Date('2026-02-01 00:00:00'),
		ends_at: new Date('2026-02-31 23:59:59'),
		budget: {
			type: 'usage',
			limit: 1000,
			currency_code: 'THB',
		},
		promotions: [
			{
				code: 'FEB-100',
				type: 'standard',
				status: 'active',
				is_automatic: false,
				application_method: {
					type: 'fixed',
					target_type: 'items',
					value: 100,
					max_quantity: 1,
					allocation: 'each',
					currency_code: 'THB',
				},
				rules: [],
				campaign_id: '',
			},
		],
	},
	{
		name: 'Membership Campaign',
		description: 'This is a Membership Campaign',
		campaign_identifier: 'MEMBER',
		starts_at: null,
		ends_at: null,
		budget: {
			type: 'usage',
			limit: 500,
			currency_code: 'THB',
		},
		promotions: [
			{
				code: 'MEM-500',
				type: 'standard',
				status: 'active',
				is_automatic: false,
				application_method: {
					type: 'fixed',
					target_type: 'items',
					value: 500,
					max_quantity: 1,
					allocation: 'each',
					currency_code: 'THB',
				},
				rules: [],
				campaign_id: '',
			},
		],
	},
];
