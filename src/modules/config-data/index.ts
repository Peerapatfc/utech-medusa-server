import ConfigDataModuleService from "./service";
import { Module } from "@medusajs/framework/utils";

export const CONFIG_DATA_MODULE = "configDataModuleService";

export default Module(CONFIG_DATA_MODULE, {
  service: ConfigDataModuleService,
});
