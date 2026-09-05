import { supabase, ProductColor, ProductVariant } from './supabase';

export interface ProductLike {
  id: string;
  in_stock?: boolean;
  stock_quantity?: number;
}

/**
 * Single Source of Truth Availability Helpers
 */

/**
 * Returns true ONLY if a product has variants registered and EVERY SINGLE variant is out of stock (in_stock === false || stock_quantity <= 0).
 * If no variants exist for the product in product_variants, falls back to the product's top-level `in_stock` boolean.
 */
export function isProductWholeSoldOut(product: ProductLike, variants: ProductVariant[]): boolean {
  const productVariants = variants.filter((v) => v.product_id === product.id);

  if (productVariants.length > 0) {
    const hasAnyInStock = productVariants.some((v) => {
      const isStockTrue = v.in_stock !== false;
      const isQtyAvailable = v.stock_quantity === null || v.stock_quantity === undefined || v.stock_quantity > 0;
      return isStockTrue && isQtyAvailable;
    });
    return !hasAnyInStock;
  }

  // Fallback to top-level product flag if no variants exist
  if (product.in_stock === false) return true;
  if (product.stock_quantity !== undefined && product.stock_quantity !== null && product.stock_quantity <= 0) return true;

  return false;
}

/**
 * Returns true if a product has AT LEAST ONE in-stock variant matching the given size (across any color).
 */
export function isSizeAvailableForProduct(product: ProductLike, variants: ProductVariant[], sizeValue: number): boolean {
  const matchingVariants = variants.filter(
    (v) => v.product_id === product.id && Number(v.size_value) === Number(sizeValue)
  );

  if (matchingVariants.length > 0) {
    return matchingVariants.some((v) => {
      const isStockTrue = v.in_stock !== false;
      const isQtyAvailable = v.stock_quantity === null || v.stock_quantity === undefined || v.stock_quantity > 0;
      return isStockTrue && isQtyAvailable;
    });
  }

  // Fallback: if no variants exist for this size specifically, check whole product
  return !isProductWholeSoldOut(product, variants);
}

/**
 * Returns true if a product has AT LEAST ONE in-stock variant matching the given colorId (across any size).
 */
export function isColorAvailableForProduct(product: ProductLike, variants: ProductVariant[], colorId: string): boolean {
  const matchingVariants = variants.filter(
    (v) => v.product_id === product.id && v.color_id === colorId
  );

  if (matchingVariants.length > 0) {
    return matchingVariants.some((v) => {
      const isStockTrue = v.in_stock !== false;
      const isQtyAvailable = v.stock_quantity === null || v.stock_quantity === undefined || v.stock_quantity > 0;
      return isStockTrue && isQtyAvailable;
    });
  }

  return false;
}

/**
 * Returns true if the exact size x color variant combination is in stock.
 */
export function isVariantInStock(variants: ProductVariant[], sizeValue: number, colorId: string): boolean {
  const matching = variants.find(
    (v) => v.color_id === colorId && Number(v.size_value) === Number(sizeValue)
  );

  if (matching) {
    const isStockTrue = matching.in_stock !== false;
    const isQtyAvailable = matching.stock_quantity === null || matching.stock_quantity === undefined || matching.stock_quantity > 0;
    return isStockTrue && isQtyAvailable;
  }

  // Default to true if not explicitly marked sold out
  return true;
}

/**
 * Batch fetch product_variants for an array of product IDs efficiently in a single Supabase query.
 */
export async function batchFetchVariantsForProducts(productIds: string[]): Promise<ProductVariant[]> {
  if (!productIds || productIds.length === 0) return [];

  try {
    const { data, error } = await supabase
      .from('product_variants')
      .select('*')
      .in('product_id', productIds);

    if (error || !data) {
      console.warn('batchFetchVariantsForProducts Supabase error:', error?.message);
      // Fallback to local storage
      const allCached: ProductVariant[] = [];
      productIds.forEach((pid) => {
        const key = `omnora_product_variants_v1_${pid}`;
        const raw = localStorage.getItem(key);
        if (raw) {
          try {
            allCached.push(...JSON.parse(raw));
          } catch (e) {
            // ignore
          }
        }
      });
      return allCached;
    }

    return data as ProductVariant[];
  } catch (e) {
    console.warn('batchFetchVariantsForProducts exception:', e);
    return [];
  }
}

/**
 * Batch fetch product_colors for an array of product IDs efficiently in a single Supabase query.
 */
export async function batchFetchColorsForProducts(productIds: string[]): Promise<ProductColor[]> {
  if (!productIds || productIds.length === 0) return [];

  try {
    const { data, error } = await supabase
      .from('product_colors')
      .select('*')
      .in('product_id', productIds)
      .order('display_order', { ascending: true });

    if (error || !data) {
      console.warn('batchFetchColorsForProducts Supabase error:', error?.message);
      return [];
    }

    return data as ProductColor[];
  } catch (e) {
    console.warn('batchFetchColorsForProducts exception:', e);
    return [];
  }
}
