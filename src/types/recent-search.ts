import type { ConfigData } from "./config-data";

export type RecentSearchConfigDataForm = {
  general: RecentSearchGeneralData
}

export type RecentSearchGeneralData = {
  enabled: ConfigData,
  prohibited_word: ConfigData,
}

export interface RecentSearchesBody {
  id: string
  search: string
  product_id?: string
  type: "search-engine" | "recommend"
  uri: string
  deleted_at?: Date
}