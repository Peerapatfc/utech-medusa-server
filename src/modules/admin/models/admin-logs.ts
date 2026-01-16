import { model } from "@medusajs/framework/utils"

export const AdminLog = model.define("admin-logs", {
  id: model.id().primaryKey(),
  action: model.text(),
  actor_id: model.text(),
  resource_id: model.text().nullable(),
  resource_type: model.text().nullable(),
  metadata: model.json().nullable(),
})

export default AdminLog
