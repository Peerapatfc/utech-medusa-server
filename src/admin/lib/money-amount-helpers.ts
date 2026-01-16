import { currencies } from "./data/currencies"

export const getDecimalDigits = (currency: string) => {
  return currencies[currency.toUpperCase()]?.decimal_digits ?? 0
}

/**
 * Returns a formatted amount based on the currency code using the browser's locale
 * @param amount - The amount to format
 * @param currencyCode - The currency code to format the amount in
 * @returns - The formatted amount
 *
 * @example
 * getFormattedAmount(10, "usd") // '$10.00' if the browser's locale is en-US
 * getFormattedAmount(10, "usd") // '10,00 $' if the browser's locale is fr-FR
 */
export const getLocaleAmount = (amount: number, currencyCode: string) => {
  const formatter = new Intl.NumberFormat([], {
    style: "currency",
    currencyDisplay: "narrowSymbol",
    currency: currencyCode,
  })

  return formatter.format(amount)
}

export const getNativeSymbol = (currencyCode: string) => {
  const formatted = new Intl.NumberFormat([], {
    style: "currency",
    currency: currencyCode,
    currencyDisplay: "narrowSymbol",
  }).format(0)

  return formatted.replace(/\d/g, "").replace(/[.,]/g, "").trim()
}

export const getStylizedAmount = (amount: number, currencyCode: string) => {
  const symbol = getNativeSymbol(currencyCode)
  const decimalDigits = getDecimalDigits(currencyCode)

  const total = amount.toLocaleString(undefined, {
    minimumFractionDigits: decimalDigits,
    maximumFractionDigits: decimalDigits,
  })

  return `${symbol} ${total} ${currencyCode.toUpperCase()}`
}
