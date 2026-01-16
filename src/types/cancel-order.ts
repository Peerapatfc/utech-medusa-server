import type { ConfigData } from "./config-data";

export type CancelOrderConfigDataForm = {
  general: CancelOrderGeneralData
}

export type CancelOrderGeneralData = {
  enabled?: ConfigData,
  condition?: ConfigData
}

export type CancelOrderConditionRowForm = {
  payment_method: string,
  time: number
}