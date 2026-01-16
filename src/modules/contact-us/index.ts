import { Module } from "@medusajs/framework/utils";
import ContactUsModuleService from "./service";

export const CONTACT_US_MODULE = "contactUsModuleService";

export default Module(CONTACT_US_MODULE, {
	service: ContactUsModuleService,
});
