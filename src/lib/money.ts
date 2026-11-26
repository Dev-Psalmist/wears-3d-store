/** Prices are quoted in Nigerian naira; the catalogue stores whole naira amounts. */
const naira = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  maximumFractionDigits: 0,
})

/** 92000 -> "₦92,000" */
export function formatNaira(value: number): string {
  return naira.format(Math.round(value)).replace(/\u00A0/g, '')
}

/** 92000 -> "92,000" (for places that print the symbol separately) */
export function formatNairaAmount(value: number): string {
  return new Intl.NumberFormat('en-NG', { maximumFractionDigits: 0 }).format(Math.round(value))
}
