import { Module } from "@medusajs/framework/utils";
import MasterAddressModuleService from "./service";

export const MASTER_ADDRESS_MODULE = "masterAddressModuleService";

export default Module(MASTER_ADDRESS_MODULE, {
	service: MasterAddressModuleService,
});
