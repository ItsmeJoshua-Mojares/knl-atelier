/** Format price as Philippine Peso */
export function formatPrice(amount: number): string {
  return `\u20B1${amount.toLocaleString("en-PH")}`;
}
