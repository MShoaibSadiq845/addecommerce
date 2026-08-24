import { MetadataRoute } from "next";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Product {
  _id: string;
  slug?: string;       // use slug if available, otherwise falls back to _id
  updatedAt: string;   // ISO date string
}

// ─── Config ───────────────────────────────────────────────────────────────────

const BASE_URL = "https://fabdecorco.com";
const API_URL  = "https://api.fabdecorco.com/products";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Fetches all products from the backend API.
 * Returns an empty array on failure so the sitemap is never broken.
 */
async function getProducts(): Promise<Product[]> {
  try {
    const res = await fetch(API_URL, {
      next: { revalidate: 86_400 }, // revalidate every 24 hours
    });

    if (!res.ok) {
      console.error(`[sitemap] Failed to fetch products: ${res.status} ${res.statusText}`);
      return [];
    }

    const data = await res.json();
    return Array.isArray(data) ? data : (data.products ?? []);
  } catch (err) {
    console.error("[sitemap] Unexpected error fetching products:", err);
    return [];
  }
}

// ─── Sitemap ──────────────────────────────────────────────────────────────────

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {

  // ── 1. Public static routes ───────────────────────────────────────────────
  //   Excluded (private / no SEO value):
  //     /login  /register  /auth/callback
  //     /admin/*  /productUpdate  /checkout  /order-confirmed
  const staticRoutes: MetadataRoute.Sitemap = [
    // ── Home (/  →  (store)/page.tsx) ──────────────────────────────────────
    {
      url: `${BASE_URL}/`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },

    // ── Shop  (/shop  →  (store)/shop/page.tsx) ──────────────────────────
    {
      url: `${BASE_URL}/shop`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },

    // ── Cart  (/cart  →  (store)/cart/page.tsx) ──────────────────────────
    {
      url: `${BASE_URL}/cart`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    },

    // ── Orders  (/orders  →  (store)/orders/page.tsx) ────────────────────
    {
      url: `${BASE_URL}/orders`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    },

    // ── FAQ  (/faq  →  (store)/faq/page.tsx) ─────────────────────────────
    {
      url: `${BASE_URL}/faq`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },

    // ── Help  (/help  →  (store)/help/page.tsx) ───────────────────────────
    {
      url: `${BASE_URL}/help`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  // ── 2. Dynamic product routes  (/productDetail/[id]) ─────────────────────
  const products = await getProducts();

  const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
    // Uses slug when available; falls back to _id
    url: `${BASE_URL}/productDetail/${product.slug ?? product._id}`,
    lastModified: product.updatedAt ? new Date(product.updatedAt) : new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // ── 3. Dynamic shop category / filter routes  (/shop/[id]) ───────────────
  //   If your /shop/[id] pages represent product categories or filters,
  //   fetch them here and add to the sitemap. Example:
  //
  //   const categories = await getCategories();
  //   const shopCategoryRoutes: MetadataRoute.Sitemap = categories.map((cat) => ({
  //     url: `${BASE_URL}/shop/${cat.slug ?? cat._id}`,
  //     lastModified: cat.updatedAt ? new Date(cat.updatedAt) : new Date(),
  //     changeFrequency: "weekly",
  //     priority: 0.75,
  //   }));
  //   return [...staticRoutes, ...productRoutes, ...shopCategoryRoutes];

  // ── 4. Merge & return ─────────────────────────────────────────────────────
  return [...staticRoutes, ...productRoutes];
}
