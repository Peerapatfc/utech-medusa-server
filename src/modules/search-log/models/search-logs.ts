import { model } from "@medusajs/framework/utils"

const SearchLog = model.define("search_logs", {
  id: model.id({ prefix: "slog" }).primaryKey(),
  search: model.text(),
})

export default SearchLog