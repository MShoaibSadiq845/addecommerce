/**
 * Formats an order ID consistently across the storefront and admin panel.
 * Extracts the explicit `orderId` or standard 8-character uppercase hex suffix of `_id`.
 */
export function formatOrderId(orderOrId?: any): string {
  if (!orderOrId) return '';
  if (typeof orderOrId === 'object') {
    if (orderOrId.orderId) {
      return String(orderOrId.orderId).toUpperCase().replace(/^#/, '');
    }
    if (orderOrId._id) {
      const str = String(orderOrId._id).trim().replace(/^#/, '');
      return str.length > 8 ? str.slice(-8).toUpperCase() : str.toUpperCase();
    }
  }
  const str = String(orderOrId).trim().replace(/^#/, '');
  return str.length > 8 ? str.slice(-8).toUpperCase() : str.toUpperCase();
}
