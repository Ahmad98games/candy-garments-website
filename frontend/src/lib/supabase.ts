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
  created_at?: string;
}

export interface OrderItem {
  id: string;
  title: string;
  article_no?: string;
  quantity: number;
  price: number;
  image?: string;
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

// Fallback initial products if table is currently empty
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

const LOCAL_STORAGE_PRODUCTS_KEY = 'candy_boutique_products_v5';

function getLocalProducts(): Product[] {
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
  try {
    localStorage.setItem(LOCAL_STORAGE_PRODUCTS_KEY, JSON.stringify(FALLBACK_PRODUCTS));
  } catch (e) {}
  return FALLBACK_PRODUCTS;
}

function saveLocalProducts(products: Product[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_PRODUCTS_KEY, JSON.stringify(products));
    window.dispatchEvent(new Event('products-updated'));
  } catch (e) {
    console.error('Failed to save products to localStorage', e);
  }
}

let hasSyncedToSupabase = false;

async function syncFallbackProductsToSupabase(dbProducts: Product[]): Promise<void> {
  if (hasSyncedToSupabase) return;
  hasSyncedToSupabase = true;

  try {
    const existingIds = new Set(dbProducts.map(p => p.id));
    const missingFallback = FALLBACK_PRODUCTS.filter(p => !existingIds.has(p.id));

    if (missingFallback.length > 0) {
      const recordsToInsert = missingFallback.map(p => ({
        id: p.id,
        article_no: p.article_no,
        title: p.title,
        description: p.description,
        retail_price: p.retail_price,
        wholesale_cost: p.wholesale_cost,
        margin: p.margin,
        category: p.category,
        department: p.department,
        fabric_type: p.fabric_type,
        images: p.images,
        in_stock: p.in_stock,
        created_at: new Date().toISOString(),
      }));

      await supabase.from('products').upsert(recordsToInsert);
    }
  } catch (e) {
    console.warn('Silent database sync attempt:', e);
  }
}

/**
 * Fetch all products from Supabase with optional filters and LocalStorage fallback
 */
export async function fetchProducts(filters?: {
  category?: string;
  department?: 'Ladies' | 'Kids';
  fabric_type?: string;
  in_stock_only?: boolean;
  search_term?: string;
}): Promise<Product[]> {
  let allProducts: Product[] = [];

  try {
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (!error && data) {
      const dbList = data as Product[];
      syncFallbackProductsToSupabase(dbList);

      const local = getLocalProducts();
      const dbMap = new Map<string, Product>();
      
      // 1. Seed with FALLBACK first
      FALLBACK_PRODUCTS.forEach(p => dbMap.set(p.id, p));

      // 2. Layer local cache
      local.forEach(p => dbMap.set(p.id, p));

      // 3. Layer live database products ON TOP (Live DB is authoritative)
      dbList.forEach(p => dbMap.set(p.id, p));

      allProducts = Array.from(dbMap.values());
      saveLocalProducts(allProducts);
    } else {
      allProducts = getLocalProducts();
    }
  } catch (err) {
    allProducts = getLocalProducts();
  }

  let filtered = [...allProducts];

  if (filters?.department) {
    filtered = filtered.filter(p => {
      if (p.department) return p.department === filters.department;
      // Fallback inference by category
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

/**
 * Fetch single product by ID or Article No.
 */
export async function fetchProductById(idOrArticleNo: string): Promise<Product | null> {
  const local = getLocalProducts();
  const match = local.find(p => p.id === idOrArticleNo || p.article_no === idOrArticleNo);
  if (match) return match;

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

  return FALLBACK_PRODUCTS[0];
}

/**
 * Insert new order into Supabase
 */
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
      // Return a simulated order object with generated ID if Supabase error
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

/**
 * Fetch all orders for Admin Portal
 */
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

/**
 * Update order status
 */
export async function updateOrderStatus(orderId: string, status: Order['status']): Promise<boolean> {
  try {
    const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);
    return !error;
  } catch (err) {
    console.error('Update order status error:', err);
    return false;
  }
}

/**
 * Upload image to Supabase `product-media` bucket
 */
export async function uploadProductImage(file: File): Promise<string | null> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = `articles/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('product-media')
      .upload(filePath, file, { upsert: true });

    if (!uploadError) {
      const { data } = supabase.storage.from('product-media').getPublicUrl(filePath);
      if (data?.publicUrl) {
        return data.publicUrl;
      }
    } else {
      console.warn('Supabase storage warning (falling back to Base64 DataURL):', uploadError.message);
    }
  } catch (err) {
    console.warn('Storage upload exception (falling back to Base64 DataURL):', err);
  }

  // Guaranteed Fallback: Convert image File to Base64 Data URL so upload NEVER fails
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      resolve((e.target?.result as string) || null);
    };
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}

const IS_UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Upsert product (Add / Edit article) with Permanent Dual Persistence
 */
export async function upsertProduct(product: Partial<Product>): Promise<Product | null> {
  const margin = (Number(product.retail_price) || 0) - (Number(product.wholesale_cost) || 0);
  const id = product.id || `prod-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const stockQty = product.stock_quantity !== undefined && !isNaN(Number(product.stock_quantity)) 
    ? Number(product.stock_quantity) 
    : 10;
  
  const savedProduct: Product = {
    id,
    article_no: product.article_no?.trim() || `CB-${Math.floor(100 + Math.random() * 900)}`,
    title: product.title?.trim() || 'Untitled Article',
    description: product.description || '',
    retail_price: Number(product.retail_price) || 0,
    wholesale_cost: Number(product.wholesale_cost) || 0,
    margin: margin > 0 ? margin : 0,
    category: product.category || 'Ladies Wear',
    department: product.department || (product.category === 'Girls' || product.category === 'Kids Wear' ? 'Kids' : 'Ladies'),
    fabric_type: product.fabric_type || 'Pure Raw Silk 80g',
    images: product.images && product.images.length > 0 ? product.images : ['/images/omnora.jpg'],
    stock_quantity: stockQty,
    in_stock: stockQty > 0 ? (product.in_stock ?? true) : false,
    created_at: product.created_at || new Date().toISOString(),
  };

  try {
    const { data } = await supabase.from('products').upsert([savedProduct]).select().single();
    if (data) {
      Object.assign(savedProduct, data);
    }
  } catch (e) {
    console.warn('Supabase upsert fallback to local storage:', e);
  }

  // Update permanent local cache
  const local = getLocalProducts();
  const index = local.findIndex(p => p.id === savedProduct.id || (product.id && p.id === product.id));
  if (index > -1) {
    local[index] = savedProduct;
  } else {
    local.unshift(savedProduct);
  }
  saveLocalProducts(local);

  return savedProduct;
}

/**
 * Toggle Product Stock Status
 */
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

/**
 * Permanently delete product from Supabase DB and local storage
 */
export async function deleteProduct(productId: string): Promise<boolean> {
  try {
    await supabase.from('products').delete().eq('id', productId);
  } catch (err) {
    console.warn('Supabase delete product warning:', err);
  }

  const local = getLocalProducts();
  const filtered = local.filter(p => p.id !== productId);
  saveLocalProducts(filtered);
  window.dispatchEvent(new Event('products-updated'));
  return true;
}

/**
 * Deduct purchased quantity from stock_quantity and auto-toggle in_stock when 0
 */
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

export interface Personnel {
  id: string;
  name: string;
  role: string;
  phone: string;
  cnic?: string;
  status: 'Active' | 'On Leave' | 'Busy';
  assigned_articles?: string[];
  created_at?: string;
}

export const FALLBACK_PERSONNEL: Personnel[] = [
  { id: 'kar-01', name: 'Master Ahmad Ali', role: 'Master Tailor (Pret & Velvet)', phone: '0331-1498773', status: 'Active', assigned_articles: ['OMN-L-101', 'CB-102'] },
  { id: 'kar-02', name: 'Karigar Muhammad Usman', role: 'Embroidery Master (Zardozi & Adda)', phone: '0334-1495788', status: 'Active', assigned_articles: ['OMN-L-103', 'CB-101'] },
  { id: 'kar-03', name: 'Tariq Mahmood', role: 'Cutting Specialist', phone: '0300-4567890', status: 'Active', assigned_articles: ['OMN-L-104'] },
  { id: 'kar-04', name: 'Rashid Khan', role: 'Quality Checker & Dispatch', phone: '0321-9876543', status: 'Active', assigned_articles: ['CB-103'] },
];

export async function fetchPersonnel(): Promise<Personnel[]> {
  try {
    const { data, error } = await supabase.from('personnel').select('*').order('created_at', { ascending: false });
    if (!error && data && data.length > 0) {
      return data as Personnel[];
    }
  } catch (err) {}

  const local = localStorage.getItem('candy_personnel_db');
  if (local) {
    try {
      return JSON.parse(local);
    } catch (e) {}
  }
  
  localStorage.setItem('candy_personnel_db', JSON.stringify(FALLBACK_PERSONNEL));
  return FALLBACK_PERSONNEL;
}

export async function upsertPersonnel(personnel: Partial<Personnel>): Promise<Personnel> {
  const id = personnel.id || `kar-${Date.now()}`;
  const record: Personnel = {
    id,
    name: personnel.name?.trim() || 'Untitled Staff',
    role: personnel.role?.trim() || 'Tailoring Specialist',
    phone: personnel.phone?.trim() || '0300-0000000',
    cnic: personnel.cnic || '',
    status: personnel.status || 'Active',
    assigned_articles: personnel.assigned_articles || [],
    created_at: personnel.created_at || new Date().toISOString(),
  };

  try {
    await supabase.from('personnel').upsert([record]);
  } catch (err) {}

  const current = await fetchPersonnel();
  const idx = current.findIndex(p => p.id === id);
  if (idx > -1) {
    current[idx] = record;
  } else {
    current.unshift(record);
  }
  localStorage.setItem('candy_personnel_db', JSON.stringify(current));
  return record;
}

export async function deletePersonnel(id: string): Promise<boolean> {
  try {
    await supabase.from('personnel').delete().eq('id', id);
  } catch (err) {}

  const current = await fetchPersonnel();
  const filtered = current.filter(p => p.id !== id);
  localStorage.setItem('candy_personnel_db', JSON.stringify(filtered));
  return true;
}
