/**
 * Synchronizes any hardcoded price in a product description string with the actual product price.
 * Matches patterns like:
 * - "Complete 3-Piece Set price is Rs. 2,699." -> "Complete 3-Piece Set price is Rs. 2,799."
 * - "**Price: Rs. 2,799**" -> "**Price: Rs. 2,899**"
 * - "Price: Rs. 2,299" -> "Price: Rs. 2,399"
 * - "Price: Rs. 1000 per seat" -> "Price: Rs. 1,000 per seat"
 * - "Price is Rs. 2,699" -> "Price is Rs. 2,799"
 * - "price is 2,699" -> "price is 2,799"
 * - "Price: PKR 2,500"
 * - "Price: ₨ 1,800"
 * - "Price: 2,899"
 * - "Price - Rs. 2,899"
 */
export function syncPriceInDescription(
  description?: string | null,
  newPrice?: number | string | null,
): string {
  if (!description || typeof description !== 'string') {
    return description || '';
  }

  const num = Number(newPrice);
  if (newPrice === undefined || newPrice === null || isNaN(num) || num < 0) {
    return description;
  }

  const formattedPrice = num.toLocaleString('en-US');

  // Group 1: Optional asterisks + "Price" (or "price is", "price:", "price -", "price") + optional separator/is + optional currency (Rs, Rs., PKR, ₨) + optional asterisks/spaces
  // Group 2: The old numeric price (with optional commas and decimals)
  // Group 3: Optional suffix such as "/-", "per seat", "/ seat", "/ piece", and closing asterisks "**"
  const priceRegex =
    /(\*{0,2}Price\s*(?:is|[:\-])?\s*(?:Rs\.?|PKR|₨)?\s*\*{0,2}\s*)([\d,]+(?:\.\d{1,2})?)(\s*(?:\/-)?\s*(?:per\s*seat|\/\s*seat|\/\s*piece|\/\s*meter|\/\s*set)?\s*\*{0,2})/gi;

  if (priceRegex.test(description)) {
    return description.replace(priceRegex, (_match, prefix, _oldPrice, suffix) => {
      return `${prefix}${formattedPrice}${suffix}`;
    });
  }

  return description;
}
