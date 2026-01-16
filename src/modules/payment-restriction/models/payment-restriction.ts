import { model } from "@medusajs/framework/utils";

export const PaymentRestrictionModel = model.define("payment_restriction", {
	id: model.id().primaryKey(),
	name: model.text(),
	is_active: model.boolean(),
	payment_providers: model.array(),
	payment_restriction_rules: model.hasMany(() => PaymentRestrictionRuleModel),
});

export const PaymentRestrictionRuleModel = model.define("payment_restriction_rule", {
	id: model.id().primaryKey(),
	description: model.text(),
	attribute: model.text(),
	operator: model.text(),
	payment_restriction_rule_values: model.hasMany(() => PaymentRestrictionRuleValueModel),
	payment_restriction: model.belongsTo(() => PaymentRestrictionModel, {
		mappedBy: "payment_restriction_rules",
	}),
});

export const PaymentRestrictionRuleValueModel = model.define("payment_restriction_rule_value", {
	id: model.id().primaryKey(),
	value: model.text(),
	payment_restriction_rule: model.belongsTo(() => PaymentRestrictionRuleModel, {
		mappedBy: "payment_restriction_rule_values",
	}),
});
