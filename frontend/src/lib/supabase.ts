import { createClient } from '@supabase/supabase-js';

import collectionImg1 from '../collection/WhatsApp Image 2026-08-20 at 6.56.51 PM (1).jpeg';
import collectionImg2 from '../collection/WhatsApp Image 2026-08-20 at 6.56.51 PM (2).jpeg';
import collectionImg3 from '../collection/WhatsApp Image 2026-08-20 at 6.56.51 PM (3).jpeg';
import collectionImg4 from '../collection/WhatsApp Image 2026-08-20 at 6.56.51 PM.jpeg';

const getEnvVar = (viteKey: string, nextKey: string) => {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[viteKey]) {
    return import.meta.env[viteKey];
  }
  if (typeof process !== 'undefined' && process.env && process.env[nextKey]) {
    return process.env[nextKey];
  }
  return undefined;
};

const supabaseUrl =
  getEnvVar('VITE_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_URL') ||
  'https://qlqowijkxmluakyzqqou.supabase.co';

const supabaseKey =
  getEnvVar('VITE_SUPABASE_PUBLISHABLE_KEY', 'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY') ||
  'sb_publishable_EdpgC3Vi_2XyZ_CwrzC00w_SxD_xDKV';

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface ProductColor {
  id: string;
  product_id: string;
  color_name: string;
  color_hex: string;
  image_url?: string | null;
  display_order?: number;
  created_at?: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  size_value: number;
  color_id: string;
  in_stock: boolean;
  stock_quantity?: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface Product {
  id: string;
  article_no?: string;
  title: string;
  description?: string;
  retail_price: number;
  wholesale_cost?: number;
  margin?: number;
  category: string;
  department?: 'Ladies' | 'Kids';
  fabric_type?: string;
  images: string[];
  in_stock: boolean;
  stock_quantity?: number;
  display_order?: number;
  created_at?: string;
  updated_at?: string;
}

export interface OrderItem {
  id: string;
  title: string;
  article_no?: string;
  quantity: number;
  price: number;
  image?: string;
  size?: number | string;
  color?: string;
  color_id?: string;
  variant_id?: string;
}

export interface Order {
  id?: string;
  customer_name: string;
  customer_phone: string;
  shipping_address: string;
  city: string;
  items: OrderItem[];
  total_amount: number;
  payment_method: string;
  status: 'Pending' | 'Dispatched' | 'Delivered' | 'Cancelled';
  created_at?: string;
}


export const FALLBACK_PRODUCTS: Product[] = [
  {
    id: 'omn-ladies-001',
    article_no: 'OMN-L-101',
    title: 'Omnora Signature Hand-Embroidered Velvet Suit',
    description: 'Bespoke luxury velvet attire decorated with intricate tilla embroideries and zardozi needlework, paired with an organza dupatta.',
    retail_price: 6500,
    wholesale_cost: 3800,
    margin: 2700,
    category: 'Ladies Wear',
    department: 'Ladies',
    fabric_type: 'Plush Velvet & Raw Silk',
    images: [collectionImg1],
    in_stock: true,
  },
  {
    id: 'omn-ladies-002',
    article_no: 'OMN-L-102',
    title: 'Omnora Royal Hand-Crafted Raw Silk Tunic',
    description: 'Tailored 80g pure raw silk tunic with exquisite resham hand needlework, pearl accents, and flared trousers.',
    retail_price: 6500,
    wholesale_cost: 3800,
    margin: 2700,
    category: 'Ladies Wear',
    department: 'Ladies',
    fabric_type: 'Pure Raw Silk 80g',
    images: [collectionImg2],
    in_stock: true,
  },
  {
    id: 'omn-ladies-003',
    article_no: 'OMN-L-103',
    title: 'Omnora Festive Chiffon Zardozi Ensemble',
    description: 'Multi-panel embroidered chiffon outfit featuring gold sequin detailing and delicate floral hand craftsmanship.',
    retail_price: 6500,
    wholesale_cost: 3800,
    margin: 2700,
    category: 'Ladies Wear',
    department: 'Ladies',
    fabric_type: 'Pure Crinkle Chiffon & Silk',
    images: [collectionImg3],
    in_stock: true,
  },
  {
    id: 'omn-ladies-004',
    article_no: 'OMN-L-104',
    title: 'Omnora Imperial Printed Silk Kurti Set',
    description: 'Designer printed silk ensemble adorned with delicate mirrorwork on neckline and sleeves.',
    retail_price: 6500,
    wholesale_cost: 3800,
    margin: 2700,
    category: 'Ladies Wear',
    department: 'Ladies',
    fabric_type: 'Pure Lawn Silk',
    images: [collectionImg4],
    in_stock: true,
  },
  {
    id: 'prod-001',
    article_no: 'CB-101',
    title: 'Noor-e-Zari Hand-Embroidered Velvet Suit',
    description: 'Midnight black plush velvet shirt with intricate gold tilla and zardozi needlework, paired with a sheer organza dupatta.',
    retail_price: 18500,
    wholesale_cost: 9500,
    margin: 9000,
    category: 'Ladies Wear',
    department: 'Ladies',
    fabric_type: 'Plush Micro-Velvet & Raw Silk',
    images: [
      'https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80'
    ],
    in_stock: true,
  },
  {
    id: 'prod-002',
    article_no: 'CB-102',
    title: 'Mah-ru Raw Silk Embroidered Co-ord Set',
    description: 'Tailored 80g pure raw silk tunic featuring hand-set pearl embellishments, threadwork accents, and flared culottes.',
    retail_price: 14200,
    wholesale_cost: 7200,
    margin: 7000,
    category: 'Ladies Wear',
    department: 'Ladies',
    fabric_type: 'Pure Raw Silk 80g',
    images: [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80'
    ],
    in_stock: true,
  },
  {
    id: 'prod-003',
    article_no: 'CB-103',
    title: 'Candy Kids Princess Embroidered Frock Set',
    description: 'Beautiful multi-panel embroidered frock for girls featuring resham floral motifs and sequin accents.',
    retail_price: 4500,
    wholesale_cost: 2200,
    margin: 2300,
    category: 'Girls',
    department: 'Kids',
    fabric_type: 'Soft Cotton & Chiffon',
    images: [
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=800&q=80'
    ],
    in_stock: true,
  },
];

const LOCAL_STORAGE_PRODUCTS_KEY = 'candy_boutique_products_v12';

function getLocalProducts(): Product[] {
  if (typeof window === 'undefined') return FALLBACK_PRODUCTS;
  try {
    const cached = localStorage.getItem(LOCAL_STORAGE_PRODUCTS_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to parse local products cache', e);
  }
  return FALLBACK_PRODUCTS;
}

function saveLocalProducts(products: Product[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_PRODUCTS_KEY, JSON.stringify(products));
    window.dispatchEvent(new Event('products-updated'));
  } catch (e) {
    console.error('Failed to save products to localStorage', e);
  }
}

export async function fetchProducts(filters?: {
  category?: string;
  department?: 'Ladies' | 'Kids';
  fabric_type?: string;
  in_stock_only?: boolean;
  search_term?: string;
}): Promise<Product[]> {
  let allProducts: Product[] = [];

  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      allProducts = data as Product[];
      saveLocalProducts(allProducts);
    } else {
      allProducts = getLocalProducts();
    }
  } catch (err) {
    console.warn('Supabase fetch failed, loading local cache:', err);
    allProducts = getLocalProducts();
  }

  let filtered = [...allProducts];

  if (filters?.department) {
    filtered = filtered.filter(p => {
      if (p.department) return p.department === filters.department;
      if (filters.department === 'Ladies') {
        return p.category === 'Ladies Wear' || p.category === 'Luxury Formals' || p.category === 'Pret / Ready-to-Wear';
      } else {
        return p.category === 'Kids Wear' || p.category === 'Girls';
      }
    });
  }

  if (filters?.category && filters.category !== 'All') {
    filtered = filtered.filter(p => p.category === filters.category);
  }
  if (filters?.fabric_type && filters.fabric_type !== 'All') {
    filtered = filtered.filter(p => p.fabric_type === filters.fabric_type);
  }
  if (filters?.in_stock_only) {
    filtered = filtered.filter(p => p.in_stock);
  }
  if (filters?.search_term && filters.search_term.trim() !== '') {
    const term = filters.search_term.toLowerCase();
    filtered = filtered.filter(p =>
      (p.title && p.title.toLowerCase().includes(term)) ||
      (p.article_no && p.article_no.toLowerCase().includes(term)) ||
      (p.description && p.description.toLowerCase().includes(term))
    );
  }

  return filtered;
}

export async function fetchProductById(idOrArticleNo: string): Promise<Product | null> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .or(`id.eq.${idOrArticleNo},article_no.eq.${idOrArticleNo}`)
      .single();

    if (!error && data) {
      return data as Product;
    }
  } catch (err) {}

  const local = getLocalProducts();
  return local.find(p => p.id === idOrArticleNo || p.article_no === idOrArticleNo) || FALLBACK_PRODUCTS[0];
}

export async function createOrder(order: Omit<Order, 'id' | 'created_at'>): Promise<Order | null> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .insert([
        {
          customer_name: order.customer_name,
          customer_phone: order.customer_phone,
          shipping_address: order.shipping_address,
          city: order.city,
          items: order.items,
          total_amount: order.total_amount,
          payment_method: order.payment_method,
          status: order.status || 'Pending',
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Supabase order creation error:', error);
      return {
        ...order,
        id: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
        created_at: new Date().toISOString(),
      };
    }
    return data as Order;
  } catch (err) {
    console.error('Supabase order creation failed:', err);
    return {
      ...order,
      id: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
      created_at: new Date().toISOString(),
    };
  }
}

export async function fetchOrders(): Promise<Order[]> {
  try {
    const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (error || !data) {
      return [];
    }
    return data as Order[];
  } catch (err) {
    console.error('Fetch orders error:', err);
    return [];
  }
}

export async function updateOrderStatus(orderId: string, status: Order['status']): Promise<boolean> {
  try {
    const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);
    return !error;
  } catch (err) {
    console.error('Update order status error:', err);
    return false;
  }
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function upsertProduct(product: Partial<Product>): Promise<Product | null> {
  const margin = (Number(product.retail_price) || 0) - (Number(product.wholesale_cost) || 0);
  const stockQty = product.stock_quantity !== undefined && !isNaN(Number(product.stock_quantity)) 
    ? Number(product.stock_quantity) 
    : 10;
  
  const imagesArray = Array.isArray(product.images) && product.images.length > 0 
    ? product.images 
    : (typeof product.images === 'string' ? [product.images] : ['https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=800&q=80']);

  const payload: any = {
    article_no: product.article_no?.trim() || `CB-${Math.floor(100 + Math.random() * 900)}`,
    title: product.title?.trim() || 'Untitled Article',
    description: product.description || '',
    retail_price: Number(product.retail_price) || 0,
    wholesale_cost: Number(product.wholesale_cost) || 0,
    margin: margin > 0 ? margin : 0,
    category: product.category || 'Ladies Wear',
    department: product.department || 'Ladies',
    fabric_type: product.fabric_type || 'Pure Raw Silk 80g',
    images: imagesArray,
    stock_quantity: stockQty,
    in_stock: stockQty > 0 ? (product.in_stock ?? true) : false,
    display_order: 0,
    updated_at: new Date().toISOString(),
  };

  const isExistingUuid = product.id && UUID_REGEX.test(product.id);

  try {
    let savedRecord: Product | null = null;

    if (isExistingUuid) {
      // 1. UPDATE EXISTING RECORD
      const { data, error } = await supabase
        .from('products')
        .update(payload)
        .eq('id', product.id)
        .select();

      if (error) {
        alert(`UPDATE FAILED:\n${error.message}\n(Code: ${error.code})`);
        return null;
      }
      savedRecord = data && data[0] ? (data[0] as Product) : ({ ...payload, id: product.id } as Product);
    } else {
      // 2. INSERT NEW RECORD
      payload.created_at = new Date().toISOString();
      const { data, error } = await supabase
        .from('products')
        .insert([payload])
        .select();

      if (error) {
        alert(`INSERT FAILED:\n${error.message}\n(Code: ${error.code})`);
        return null;
      }
      if (data && data.length > 0) {
        savedRecord = data[0] as Product;
      } else {
        savedRecord = { ...payload, id: `local-${Date.now()}` } as Product;
      }
    }

    // Save directly to local cache
    const local = getLocalProducts();
    const index = local.findIndex(p => p.id === savedRecord!.id);
    if (index > -1) {
      local[index] = savedRecord;
    } else {
      local.unshift(savedRecord);
    }
    saveLocalProducts(local);

    return savedRecord;
  } catch (err: any) {
    alert(`UNEXPECTED ERROR:\n${err.message || err}`);
    return null;
  }
}

export async function toggleProductStock(productId: string, inStock: boolean): Promise<boolean> {
  try {
    await supabase.from('products').update({ in_stock: inStock }).eq('id', productId);
  } catch (err) {}

  const local = getLocalProducts();
  const index = local.findIndex(p => p.id === productId);
  if (index > -1) {
    local[index].in_stock = inStock;
    if (!inStock) {
      local[index].stock_quantity = 0;
    } else if ((local[index].stock_quantity || 0) <= 0) {
      local[index].stock_quantity = 10;
    }
    saveLocalProducts(local);
  }
  return true;
}

export async function deleteProduct(productId: string): Promise<boolean> {
  try {
    await supabase.from('products').delete().eq('id', productId);
  } catch (err) {
    console.warn('Supabase delete warning:', err);
  }

  const local = getLocalProducts();
  const filtered = local.filter(p => p.id !== productId);
  saveLocalProducts(filtered);
  return true;
}

export async function decrementProductStock(productId: string, quantityToDeduct: number): Promise<boolean> {
  const local = getLocalProducts();
  const product = local.find(p => p.id === productId);
  if (!product) return false;

  const currentQty = product.stock_quantity !== undefined ? product.stock_quantity : 10;
  const newQty = Math.max(0, currentQty - quantityToDeduct);
  const newInStock = newQty > 0;

  try {
    await supabase.from('products').update({
      stock_quantity: newQty,
      in_stock: newInStock
    }).eq('id', productId);
  } catch (err) {}

  product.stock_quantity = newQty;
  product.in_stock = newInStock;

  const index = local.findIndex(p => p.id === productId);
  if (index > -1) {
    local[index] = product;
    saveLocalProducts(local);
  }
  return true;
}

/**
 * Directly update stock_quantity for a product and auto-sync in_stock boolean status
 */
export async function updateStockQuantity(productId: string, newQty: number): Promise<boolean> {
  const sanitizedQty = Math.max(0, Math.floor(newQty));
  const newInStock = sanitizedQty > 0;

  try {
    await supabase.from('products').update({
      stock_quantity: sanitizedQty,
      in_stock: newInStock
    }).eq('id', productId);
  } catch (err) {
    console.warn('Supabase stock quantity update warning:', err);
  }

  const local = getLocalProducts();
  const index = local.findIndex(p => p.id === productId);
  if (index > -1) {
    local[index].stock_quantity = sanitizedQty;
    local[index].in_stock = newInStock;
    saveLocalProducts(local);
  }

  window.dispatchEvent(new Event('products-updated'));
  return true;
}

/**
 * Helper to generate pre-filled WhatsApp ordering link
 */
export function generateWhatsAppLink(articleNo: string, title: string, price: number, phone = '923311498773'): string {
  const text = `Hi Candy Boutique! I want to order Article No: ${articleNo || 'N/A'} - ${title} (Rs. ${price}). Please confirm availability.`;
  return `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(text)}`;
}

export const STANDARD_SIZES = [22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 42, 44, 46, 48];

const LOCAL_COLORS_KEY = 'omnora_product_colors_v1';
const LOCAL_VARIANTS_KEY = 'omnora_product_variants_v1';

function getLocalColors(productId: string): ProductColor[] {
  try {
    const raw = localStorage.getItem(`${LOCAL_COLORS_KEY}_${productId}`);
    if (raw) return JSON.parse(raw);
  } catch (e) {}

  // Initial default colors for demo fallback
  const defaults: ProductColor[] = [
    { id: `c-red-${productId}`, product_id: productId, color_name: 'Red', color_hex: '#E52535', display_order: 1 },
    { id: `c-blue-${productId}`, product_id: productId, color_name: 'Royal Blue', color_hex: '#1D4ED8', display_order: 2 },
    { id: `c-black-${productId}`, product_id: productId, color_name: 'Midnight Black', color_hex: '#111827', display_order: 3 },
  ];
  saveLocalColors(productId, defaults);
  return defaults;
}

function saveLocalColors(productId: string, colors: ProductColor[]): void {
  try {
    localStorage.setItem(`${LOCAL_COLORS_KEY}_${productId}`, JSON.stringify(colors));
  } catch (e) {}
}

function getLocalVariants(productId: string, colors: ProductColor[]): ProductVariant[] {
  try {
    const raw = localStorage.getItem(`${LOCAL_VARIANTS_KEY}_${productId}`);
    if (raw) return JSON.parse(raw);
  } catch (e) {}

  // Generate initial fallback variants for all sizes x colors
  const defaults: ProductVariant[] = [];
  colors.forEach(c => {
    STANDARD_SIZES.forEach(sz => {
      defaults.push({
        id: `v-${productId}-${c.id}-${sz}`,
        product_id: productId,
        color_id: c.id,
        size_value: sz,
        in_stock: true,
      });
    });
  });
  saveLocalVariants(productId, defaults);
  return defaults;
}

function saveLocalVariants(productId: string, variants: ProductVariant[]): void {
  try {
    localStorage.setItem(`${LOCAL_VARIANTS_KEY}_${productId}`, JSON.stringify(variants));
  } catch (e) {}
}

export async function fetchProductColors(productId: string): Promise<ProductColor[]> {
  try {
    const { data, error } = await supabase
      .from('product_colors')
      .select('*')
      .eq('product_id', productId)
      .order('display_order', { ascending: true });

    if (!error && data && data.length > 0) {
      saveLocalColors(productId, data as ProductColor[]);
      return data as ProductColor[];
    }
  } catch (err) {}

  return getLocalColors(productId);
}

export async function fetchProductVariants(productId: string): Promise<ProductVariant[]> {
  const colors = await fetchProductColors(productId);
  try {
    const { data, error } = await supabase
      .from('product_variants')
      .select('*')
      .eq('product_id', productId);

    if (!error && data && data.length > 0) {
      saveLocalVariants(productId, data as ProductVariant[]);
      return data as ProductVariant[];
    }
  } catch (err) {}

  return getLocalVariants(productId, colors);
}

export async function addProductColor(color: {
  product_id: string;
  color_name: string;
  color_hex: string;
  image_url?: string | null;
}): Promise<{ color: ProductColor; variants: ProductVariant[] } | null> {
  const payload = {
    product_id: color.product_id,
    color_name: color.color_name.trim(),
    color_hex: color.color_hex.trim(),
    image_url: color.image_url?.trim() || null,
    display_order: Date.now(),
  };

  try {
    const { data, error } = await supabase
      .from('product_colors')
      .insert([payload])
      .select()
      .single();

    if (!error && data) {
      const insertedColor = data as ProductColor;
      
      // Auto-insert variants if trigger didn't run or to guarantee client state sync
      const variantInserts = STANDARD_SIZES.map(sz => ({
        product_id: color.product_id,
        color_id: insertedColor.id,
        size_value: sz,
        in_stock: true,
      }));

      const { data: variantsData } = await supabase
        .from('product_variants')
        .insert(variantInserts)
        .select();

      const createdVariants = (variantsData as ProductVariant[]) || variantInserts.map(v => ({ ...v, id: `v-${Date.now()}-${v.size_value}` }));

      // Sync local cache
      const currentColors = getLocalColors(color.product_id);
      currentColors.push(insertedColor);
      saveLocalColors(color.product_id, currentColors);

      const currentVariants = getLocalVariants(color.product_id, currentColors);
      const updatedVariants = [...currentVariants, ...createdVariants];
      saveLocalVariants(color.product_id, updatedVariants);

      return { color: insertedColor, variants: createdVariants };
    }
  } catch (err) {
    console.warn('Supabase add color warning:', err);
  }

  // Fallback for offline/local state
  const fallbackColor: ProductColor = {
    id: `col-${Date.now()}`,
    ...payload,
  };
  const fallbackVariants: ProductVariant[] = STANDARD_SIZES.map(sz => ({
    id: `v-${Date.now()}-${sz}`,
    product_id: color.product_id,
    color_id: fallbackColor.id,
    size_value: sz,
    in_stock: true,
  }));

  const localColors = getLocalColors(color.product_id);
  localColors.push(fallbackColor);
  saveLocalColors(color.product_id, localColors);

  const localVariants = getLocalVariants(color.product_id, localColors);
  const nextVariants = [...localVariants, ...fallbackVariants];
  saveLocalVariants(color.product_id, nextVariants);

  return { color: fallbackColor, variants: fallbackVariants };
}

export async function deleteProductColor(colorId: string, productId: string): Promise<boolean> {
  try {
    await supabase.from('product_colors').delete().eq('id', colorId);
  } catch (err) {
    console.warn('Supabase delete color warning:', err);
  }

  const colors = getLocalColors(productId).filter(c => c.id !== colorId);
  saveLocalColors(productId, colors);

  const variants = getLocalVariants(productId, colors).filter(v => v.color_id !== colorId);
  saveLocalVariants(productId, variants);

  return true;
}

export async function toggleVariantStock(
  productId: string,
  sizeValue: number,
  colorId: string,
  inStock: boolean
): Promise<boolean> {
  try {
    const { data } = await supabase
      .from('product_variants')
      .upsert(
        {
          product_id: productId,
          size_value: sizeValue,
          color_id: colorId,
          in_stock: inStock,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'product_id,size_value,color_id' }
      )
      .select();
  } catch (err) {
    console.warn('Supabase toggle variant warning:', err);
  }

  const colors = getLocalColors(productId);
  const variants = getLocalVariants(productId, colors);
  const idx = variants.findIndex(v => v.product_id === productId && v.color_id === colorId && Number(v.size_value) === Number(sizeValue));
  
  if (idx > -1) {
    variants[idx].in_stock = inStock;
  } else {
    variants.push({
      id: `v-${productId}-${colorId}-${sizeValue}`,
      product_id: productId,
      color_id: colorId,
      size_value: sizeValue,
      in_stock: inStock,
    });
  }
  saveLocalVariants(productId, variants);
  return true;
}

export async function validateCartVariants(items: any[]): Promise<{
  valid: boolean;
  invalidItems: { item: any; reason: string }[];
}> {
  if (!items || items.length === 0) return { valid: true, invalidItems: [] };

  const invalidItems: { item: any; reason: string }[] = [];

  for (const item of items) {
    if (!item.id || !item.color_id || item.size === undefined) continue;

    const sizeNum = parseInt(String(item.size).replace(/[^0-9]/g, ''), 10);
    if (isNaN(sizeNum)) continue;

    const colors = await fetchProductColors(item.id);
    const colorExists = colors.some(c => c.id === item.color_id || c.color_name.toLowerCase() === (item.color || '').toLowerCase());
    
    if (!colorExists) {
      invalidItems.push({
        item,
        reason: `Color "${item.color || 'selected color'}" for "${item.name}" is no longer available.`,
      });
      continue;
    }

    const variants = await fetchProductVariants(item.id);
    const matchingVariant = variants.find(
      v => (v.color_id === item.color_id || colors.find(c => c.id === v.color_id)?.color_name.toLowerCase() === (item.color || '').toLowerCase()) &&
           Number(v.size_value) === sizeNum
    );

    if (!matchingVariant || !matchingVariant.in_stock) {
      invalidItems.push({
        item,
        reason: `Size ${item.size} in ${item.color || 'selected color'} for "${item.name}" is sold out.`,
      });
    }
  }

  return {
    valid: invalidItems.length === 0,
    invalidItems,
  };
}

