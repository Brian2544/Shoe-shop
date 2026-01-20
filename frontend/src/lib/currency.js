export const CURRENCY_CODE = 'KES'
export const CURRENCY_LABEL = 'Ksh'
export const KSH_PER_USD = 150
export const FREE_SHIPPING_THRESHOLD = 15000
export const SHIPPING_FEE = 1500

export const formatCurrency = (value, options = {}) => {
  const amount = Number(value || 0)
  const minimumFractionDigits = options.minimumFractionDigits ?? 2
  const maximumFractionDigits = options.maximumFractionDigits ?? 2

  const formatted = amount.toLocaleString('en-KE', {
    minimumFractionDigits,
    maximumFractionDigits,
  })

  return `${CURRENCY_LABEL} ${formatted}`
}
