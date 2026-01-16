import { MedusaService } from "@medusajs/framework/utils";
import { PaymentRestrictionModel, PaymentRestrictionRuleModel, PaymentRestrictionRuleValueModel } from "./models/payment-restriction";

class PaymentRestrictionModuleService extends MedusaService({
	PaymentRestrictionModel,
	PaymentRestrictionRuleModel,
	PaymentRestrictionRuleValueModel,
}) {

}

export default PaymentRestrictionModuleService;
