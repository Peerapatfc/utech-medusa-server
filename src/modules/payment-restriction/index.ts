import { Module } from "@medusajs/framework/utils";
import PaymentRestrictionModuleService from "./service";

export const PAYMENT_RESTRICTION_MODULE = "paymentRestrictionModuleService";

export default Module(PAYMENT_RESTRICTION_MODULE, {
	service: PaymentRestrictionModuleService,
});
