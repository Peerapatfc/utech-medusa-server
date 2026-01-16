import { model } from "@medusajs/framework/utils";

export const ConfigDataModel = model.define("config_data", {
  id: model.id().primaryKey(),
  path: model.text(),
  value: model.text(),
  created_by: model.text(),
  updated_by: model.text().nullable(),
  metadata: model.json().nullable(),
});

export default ConfigDataModel;
