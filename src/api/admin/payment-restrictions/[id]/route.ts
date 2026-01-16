import type {
	MedusaRequest,
	MedusaResponse,
	AuthContext,
} from '@medusajs/framework/http';
import type PaymentRestrictionModuleService from '../../../../modules/payment-restriction/service';
import { PAYMENT_RESTRICTION_MODULE } from '../../../../modules/payment-restriction';
import type {
	PaymentRestriction,
	PaymentRestrictionRule,
	PaymentRestrictionRuleValue,
} from '@customTypes/payment-restriction';

interface CustomMedusaRequest extends MedusaRequest {
	auth_context: AuthContext;
}

export const GET = async (req: CustomMedusaRequest, res: MedusaResponse) => {
	try {
		const { actor_id } = req.auth_context;
		if (!actor_id) {
			return res.status(401).json({ message: 'Unauthorized' });
		}

		const id = req.params.id;
		const paymentRestrictionsModuleService: PaymentRestrictionModuleService =
			req.scope.resolve(PAYMENT_RESTRICTION_MODULE);
		const payment_restriction =
			await paymentRestrictionsModuleService.retrievePaymentRestrictionModel(
				id,
				{
					relations: [
						'payment_restriction_rules',
						'payment_restriction_rules.payment_restriction_rule_values',
					],
				},
			);

		res.json({
			payment_restriction,
		});
	} catch (err) {
		res.status(500).json({
			message: err.message,
		});
	}
};

export const POST = async (req: CustomMedusaRequest, res: MedusaResponse) => {
	try {
		const { actor_id } = req.auth_context;
		if (!actor_id) {
			return res.status(401).json({ message: 'Unauthorized' });
		}

		const id = req.params.id;
		const body = req.body as PaymentRestriction;
		const paymentRestrictionsModuleService: PaymentRestrictionModuleService =
			req.scope.resolve(PAYMENT_RESTRICTION_MODULE);

		const data =
			await paymentRestrictionsModuleService.retrievePaymentRestrictionModel(
				id,
				{
					relations: [
						'payment_restriction_rules',
						'payment_restriction_rules.payment_restriction_rule_values',
					],
				},
			);
		await Promise.all(
			data.payment_restriction_rules.map(async (rule) => {
				await Promise.all(
					rule.payment_restriction_rule_values.map(async (value) => {
						await paymentRestrictionsModuleService.deletePaymentRestrictionRuleValueModels(
							value.id,
						);
					}),
				);
				await paymentRestrictionsModuleService.deletePaymentRestrictionRuleModels(
					rule.id,
				);
			}),
		);

		const isActive = body.is_active === '1';

		const payment_restriction = {
			id,
			is_active: isActive,
			name: body.name,
			payment_providers: body.payment_providers,
		};
		const result =
			await paymentRestrictionsModuleService.updatePaymentRestrictionModels(
				payment_restriction,
			);

		const payment_restriction_rule_values = [];
		const payment_restriction_rules = [];
		body.rules.map((rule) => {
			payment_restriction_rules.push({
				description: '',
				attribute: rule.attribute,
				operator: rule.operator,
				payment_restriction_id: id,
			});
		});
		const result_rules =
			await paymentRestrictionsModuleService.createPaymentRestrictionRuleModels(
				payment_restriction_rules,
			);

		body.rules.map(async (rule) => {
			const result_rule = result_rules.filter(
				(filter) => rule.attribute === filter.attribute,
			)[0];
			if (Array.isArray(rule.values)) {
				rule.values.map((value) => {
					payment_restriction_rule_values.push({
						value: value,
						payment_restriction_rule_id: result_rule.id,
					});
				});
			} else {
				payment_restriction_rule_values.push({
					value: rule.values,
					payment_restriction_rule_id: result_rule.id,
				});
			}
		});
		const result_rule_values =
			await paymentRestrictionsModuleService.createPaymentRestrictionRuleValueModels(
				payment_restriction_rule_values,
			);

		res.json({
			result,
			result_rules,
			result_rule_values,
		});
	} catch (err) {
		res.status(500).json({
			message: err.message,
		});
	}
};
