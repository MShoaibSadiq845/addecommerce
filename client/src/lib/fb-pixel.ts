/**
 * lib/fb-pixel.ts
 * ─────────────────────────────────────────────────────────────
 * Reusable Meta Pixel (Facebook Pixel) helper functions.
 *
 * All helpers are SSR-safe: they check that `window` and
 * `window.fbq` exist before firing, so they are safe to import
 * in both Server and Client Components.
 * ─────────────────────────────────────────────────────────────
 */

/* ── Type augmentation ───────────────────────────────────────── */
declare global {
  interface Window {
    fbq: (...args: unknown[]) => void;
  }
}

/** Guard that confirms the pixel is available in the browser. */
const isFbqReady = (): boolean =>
  typeof window !== "undefined" && typeof window.fbq === "function";

/* ── Shared parameter types ──────────────────────────────────── */

export interface ProductParams {
  /** Human-readable product / content name */
  name: string;
  /** Unique product / SKU identifier */
  contentId: string;
  /** Sale price of a single unit */
  value: number;
  /** ISO 4217 currency code, e.g. "USD", "GBP" */
  currency?: string;
  /** Product category label, e.g. "Furniture", "Electronics" */
  category?: string;
}

export interface PurchaseParams {
  /** Total order value (sum of all items) */
  totalValue: number;
  /** ISO 4217 currency code */
  currency?: string;
  /** Optional order / transaction reference */
  orderId?: string;
  /** Array of product IDs included in the order */
  contentIds?: string[];
  /** Number of items purchased */
  numItems?: number;
}

/* ── 1. ViewContent ──────────────────────────────────────────── */
/**
 * Fire when a visitor views a product detail page or modal.
 *
 * @example
 * trackViewContent({ name: "Velvet Sofa", contentId: "sku-42", value: 299, currency: "USD" });
 */
export function trackViewContent(product: ProductParams): void {
  if (!isFbqReady()) return;

  window.fbq("track", "ViewContent", {
    content_name: product.name,
    content_ids: [product.contentId],
    content_type: "product",
    value: product.value,
    currency: product.currency ?? "USD",
    content_category: product.category ?? "",
  });
}

/* ── 2. AddToCart ────────────────────────────────────────────── */
/**
 * Fire when a visitor adds a product to their shopping cart.
 *
 * @example
 * trackAddToCart({ name: "Velvet Sofa", contentId: "sku-42", value: 299, currency: "USD" });
 */
export function trackAddToCart(product: ProductParams): void {
  if (!isFbqReady()) return;

  window.fbq("track", "AddToCart", {
    content_name: product.name,
    content_ids: [product.contentId],
    content_type: "product",
    value: product.value,
    currency: product.currency ?? "USD",
  });
}

/* ── 3. InitiateCheckout ─────────────────────────────────────── */
/**
 * Fire when a visitor clicks "Buy Now" or proceeds to checkout.
 *
 * @example
 * trackInitiateCheckout({ name: "Velvet Sofa", contentId: "sku-42", value: 299, currency: "USD" });
 */
export function trackInitiateCheckout(product: ProductParams): void {
  if (!isFbqReady()) return;

  window.fbq("track", "InitiateCheckout", {
    content_name: product.name,
    content_ids: [product.contentId],
    content_type: "product",
    value: product.value,
    currency: product.currency ?? "USD",
    num_items: 1,
  });
}

/* ── 4. Purchase ─────────────────────────────────────────────── */
/**
 * Fire when a visitor successfully places an order.
 * `value` and `currency` are REQUIRED by Meta for purchase
 * deduplication and ROAS reporting.
 *
 * @example
 * trackPurchase({ totalValue: 598, currency: "USD", orderId: "ORD-001", contentIds: ["sku-42"], numItems: 2 });
 */
export function trackPurchase(params: PurchaseParams): void {
  if (!isFbqReady()) return;

  window.fbq("track", "Purchase", {
    value: params.totalValue,
    currency: params.currency ?? "USD",
    order_id: params.orderId ?? "",
    content_ids: params.contentIds ?? [],
    content_type: "product",
    num_items: params.numItems ?? 1,
  });
}
