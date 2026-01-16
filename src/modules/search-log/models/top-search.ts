import { model } from "@medusajs/framework/utils"

const TopSearchModel = model.define("top_search", {
  id: model.id({ prefix: "ts" }).primaryKey(),
  search: model.text(),
  count: model.number().default(0),
  type: model.enum([ "search-engine", "recommend" ]).default("search-engine"),
  product_id: model.text().nullable(),
  uri: model.text().nullable(),
})

export default TopSearchModel