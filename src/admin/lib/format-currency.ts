export const formatCurrency = (amount: number, currency: string = 'thb') => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    signDisplay: "auto",
  }).format(amount)
}
