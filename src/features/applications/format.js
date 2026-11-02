const gbp = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
  maximumFractionDigits: 0,
})

const gbpPence = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

/** "£40,000 – £50,000", "From £40,000", "Up to £50,000", or '' when unset. */
export function formatSalary(min, max) {
  const hasMin = typeof min === 'number'
  const hasMax = typeof max === 'number'
  if (hasMin && hasMax) return min === max ? gbp.format(min) : `${gbp.format(min)} – ${gbp.format(max)}`
  if (hasMin) return `From ${gbp.format(min)}`
  if (hasMax) return `Up to ${gbp.format(max)}`
  return ''
}

/** "£69,000" (whole pounds) or, with `pence`, "£37.53". */
export const formatMoney = (amount, { pence = false } = {}) => (pence ? gbpPence : gbp).format(amount)
