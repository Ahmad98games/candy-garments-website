import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  fetchProductById, Product as SupabaseProduct,
  fetchProductColors, fetchProductVariants, ProductColor, ProductVariant,
  STANDARD_SIZES, supabase
} from '../lib/supabase';
import { useToast } from '../context/ToastContext';
import SmartImage from '../components/SmartImage';
import { ShoppingBag, Minus, Plus, ArrowLeft, ShieldCheck, Truck, MessageCircle, CheckCircle, XCircle, ChevronDown, ChevronUp, Ruler } from 'lucide-react';
import './Product.css';

export default function Product() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [product, setProduct] = useState<SupabaseProduct | null>(null);
  const [colors, setColors] = useState<ProductColor[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [selectedColorId, setSelectedColorId] = useState<string | null>(null);
  const [selectedSizeValue, setSelectedSizeValue] = useState<number | null>(null);

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'fabric' | 'sizechart' | 'delivery'>('fabric');

  const loadStockData = useCallback(async (productId: string) => {
    try {
      const colData = await fetchProductColors(productId);
      const varData = await fetchProductVariants(productId);
      setColors(colData);
      setVariants(varData);

      // Auto-select first available color
      if (colData.length > 0) {
        const initialColor = colData[0];
        setSelectedColorId(initialColor.id);

        // Auto-select first available size for that color
        const firstAvailSize = STANDARD_SIZES.find((sz) => {
          const matching = varData.find((v) => v.color_id === initialColor.id && Number(v.size_value) === sz);
          return matching ? matching.in_stock : true;
        });
        if (firstAvailSize) {
          setSelectedSizeValue(firstAvailSize);
        } else {
          setSelectedSizeValue(STANDARD_SIZES[0]);
        }
      }
    } catch (err) {
      console.error('Error loading variant stock:', err);
    }
  }, []);

  useEffect(() => {
    async function loadProduct() {
      if (!id) return;
      setLoading(true);
      try {
        const data = await fetchProductById(id);
        setProduct(data);
        if (data?.id) {
          await loadStockData(data.id);
        }
      } catch (err) {
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [id, loadStockData]);

  // SUPABASE REALTIME SUBSCRIPTION FOR LIVE VARIANT STOCK UPDATES (~1s SYNC)
  useEffect(() => {
    if (!product?.id) return;

    const channel = supabase
      .channel(`realtime-product-variants-${product.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'product_variants', filter: `product_id=eq.${product.id}` },
        () => {
          loadStockData(product.id);
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'product_colors', filter: `product_id=eq.${product.id}` },
        () => {
          loadStockData(product.id);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [product?.id, loadStockData]);

  // STOCK AVAILABILITY HELPER FUNCTIONS
  const isColorInStock = useCallback((colorId: string) => {
    return STANDARD_SIZES.some((sz) => {
      const matching = variants.find((v) => v.color_id === colorId && Number(v.size_value) === sz);
      return matching ? matching.in_stock : true;
    });
  }, [variants]);

  const isSizeInStockForColor = useCallback((sz: number, colorId: string | null) => {
    if (!colorId) return false;
    const matching = variants.find((v) => v.color_id === colorId && Number(v.size_value) === sz);
    return matching ? matching.in_stock : true;
  }, [variants]);

  const isWholeProductOut = useMemo(() => {
    if (!colors || colors.length === 0) return !product?.in_stock;
    return !colors.some((c) => isColorInStock(c.id));
  }, [colors, isColorInStock, product?.in_stock]);

  const selectedColorObj = useMemo(() => {
    return colors.find((c) => c.id === selectedColorId) || colors[0];
  }, [colors, selectedColorId]);

  const handleQuantityUpdate = (delta: number) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  };

  const handleAddToCart = () => {
    if (!product || !selectedColorId || !selectedSizeValue) return;

    if (!isSizeInStockForColor(selectedSizeValue, selectedColorId)) {
      showToast(`Size ${selectedSizeValue} in ${selectedColorObj?.color_name || 'color'} is sold out.`, 'error');
      return;
    }

    const matchingVariant = variants.find((v) => v.color_id === selectedColorId && Number(v.size_value) === selectedSizeValue);
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');

    const existingIndex = cart.findIndex(
      (item: any) => item.id === product.id && item.color_id === selectedColorId && Number(item.size) === selectedSizeValue
    );

    if (existingIndex > -1) {
      cart[existingIndex].quantity += quantity;
    } else {
      cart.push({
        id: product.id,
        name: product.title,
        price: product.retail_price,
        image: selectedColorObj?.image_url || product.images?.[0] || 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=800&q=80',
        quantity: quantity,
        articleNo: product.article_no || 'CK-01',
        size: selectedSizeValue,
        color: selectedColorObj?.color_name || 'Standard',
        color_id: selectedColorId,
        variant_id: matchingVariant?.id,
      });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cart-updated'));
    showToast(`Added ${quantity} × ${product.title} (${selectedColorObj?.color_name || ''}, Size: ${selectedSizeValue}) to Bag!`, 'success');
  };

  if (loading) {
    return (
      <div style={{ backgroundColor: '#FAFAFA', minHeight: '80vh', paddingTop: '100px', textAlign: 'center' }}>
        <p style={{ fontSize: '0.95rem', color: '#6B7280' }}>Loading Candy Kids product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ backgroundColor: '#FAFAFA', minHeight: '80vh', paddingTop: '100px', textAlign: 'center' }}>
        <h2>Product Not Found</h2>
        <Link to="/collection" style={{ color: '#E52535', marginTop: '16px', display: 'inline-block', fontWeight: 600 }}>
          Back to Candy Kids Collection
        </Link>
      </div>
    );
  }

  const mainImage = product.images?.[selectedImageIndex] || product.images?.[0] || 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=800&q=80';
  const currentUrl = window.location.href;

  // WhatsApp Pre-filled message protocol
  const encodedText = encodeURIComponent(
    `Assalamu Alaikum Candy Kids, I want to order ${product.title} - Price: Rs. ${product.retail_price}, Color: ${selectedColorObj?.color_name || 'Standard'}, Size: ${selectedSizeValue}. Product Link: ${currentUrl}`
  );
  const whatsappNativeUrl = `whatsapp://send?phone=923311498773&text=${encodedText}`;
  const whatsappWebUrl = `https://wa.me/923311498773?text=${encodedText}`;

  const handleWhatsAppOrder = (e: React.MouseEvent) => {
    e.preventDefault();
    window.location.href = whatsappNativeUrl;
    setTimeout(() => {
      window.open(whatsappWebUrl, '_blank');
    }, 500);
  };

  return (
    <div style={{ backgroundColor: '#FAFAFA', minHeight: '100vh', paddingTop: '30px', paddingBottom: '80px' }}>
      <div className="container">

        {/* BACK BUTTON */}
        <div style={{ marginBottom: '1.25rem' }}>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: '#6B7280', fontSize: '0.85rem', fontWeight: 600 }}>
            <ArrowLeft size={16} /> Back to Collection
          </button>
        </div>

        {/* TWO COLUMN PRODUCT LAYOUT */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2.5rem', alignItems: 'start' }}>

          {/* LEFT COLUMN: STICKY MULTI-IMAGE GALLERY WITH ZOOM PREVIEW */}
          <div style={{ position: 'sticky', top: '90px' }}>
            <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #E5E7EB', backgroundColor: '#FFFFFF', aspectRatio: '3 / 4' }}>
              <SmartImage src={mainImage} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>

            {/* THUMBNAILS */}
            {product.images && product.images.length > 1 && (
              <div style={{ display: 'flex', gap: '10px', marginTop: '12px', overflowX: 'auto' }}>
                {product.images.map((img, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    style={{
                      width: '68px',
                      height: '90px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      border: selectedImageIndex === idx ? '2px solid #E5E7EB' : '1px solid #E5E7EB',
                      borderColor: selectedImageIndex === idx ? '#E52535' : '#E5E7EB',
                      boxShadow: selectedImageIndex === idx ? '0 2px 8px rgba(229, 37, 53, 0.2)' : 'none'
                    }}
                  >
                    <img src={img} alt={`Thumbnail ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: PRODUCT METADATA */}
          <div style={{ backgroundColor: '#FFFFFF', padding: '2rem', borderRadius: '16px', border: '1px solid #E5E7EB', boxShadow: '0 2px 12px rgba(0, 0, 0, 0.03)' }}>
            
            {/* ARTICLE CODE & BRAND BADGE */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span className="font-mono" style={{ backgroundColor: '#FEF2F2', color: '#E52535', fontSize: '0.78rem', fontWeight: 700, padding: '4px 10px', borderRadius: '4px' }}>
                Article: {product.article_no || 'CK-01'}
              </span>
              {isWholeProductOut ? (
                <span style={{ fontSize: '0.78rem', color: '#DC2626', backgroundColor: '#FEF2F2', padding: '4px 10px', borderRadius: '4px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <XCircle size={14} /> Out of Stock
                </span>
              ) : (
                <span style={{ fontSize: '0.78rem', color: '#0F9D58', backgroundColor: '#ECFDF5', padding: '4px 10px', borderRadius: '4px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle size={14} /> Ready to Ship
                </span>
              )}
            </div>

            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#111827', margin: '0 0 10px 0', lineHeight: 1.2 }}>
              {product.title}
            </h1>

            {/* PRICE & DISCOUNT */}
            <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '1.8rem', fontWeight: 900, color: '#E52535' }}>
                Rs. {product.retail_price.toLocaleString()}
              </span>
              <span style={{ fontSize: '1rem', color: '#9CA3AF', textDecoration: 'line-through' }}>
                Rs. {Math.round(product.retail_price * 1.25).toLocaleString()}
              </span>
              <span style={{ backgroundColor: '#FEF2F2', color: '#E52535', fontSize: '0.75rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px' }}>
                SAVE 20%
              </span>
            </div>

            {/* COLOR SELECTOR SWATCHES */}
            {colors.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ fontSize: '0.88rem', fontWeight: 700, color: '#111827', display: 'block', marginBottom: '8px' }}>
                  Select Color: <span style={{ color: '#E52535' }}>{selectedColorObj?.color_name || 'Standard'}</span>
                </label>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                  {colors.map((col) => {
                    const colorAvailable = isColorInStock(col.id);
                    const isSelected = selectedColorId === col.id;

                    return (
                      <button
                        key={col.id}
                        type="button"
                        disabled={!colorAvailable}
                        onClick={() => {
                          if (colorAvailable) {
                            setSelectedColorId(col.id);
                            const firstSize = STANDARD_SIZES.find((sz) => isSizeInStockForColor(sz, col.id)) || STANDARD_SIZES[0];
                            setSelectedSizeValue(firstSize);
                          }
                        }}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 12px',
                          borderRadius: '20px',
                          border: isSelected ? '2px solid #E52535' : '1px solid #E5E7EB',
                          backgroundColor: isSelected ? '#FEF2F2' : colorAvailable ? '#FFFFFF' : '#F3F4F6',
                          cursor: colorAvailable ? 'pointer' : 'not-allowed',
                          opacity: colorAvailable ? 1 : 0.4,
                          boxShadow: isSelected ? '0 2px 8px rgba(229, 37, 53, 0.15)' : 'none',
                          transition: 'all 0.15s ease',
                        }}
                        title={!colorAvailable ? `${col.color_name} - Sold Out` : col.color_name}
                      >
                        {col.image_url ? (
                          <img src={col.image_url} alt={col.color_name} style={{ width: '18px', height: '18px', borderRadius: '50%', objectFit: 'cover' }} />
                        ) : (
                          <span style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: col.color_hex || '#E52535', border: '1px solid rgba(0,0,0,0.15)' }} />
                        )}
                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: isSelected ? '#E52535' : colorAvailable ? '#111827' : '#9CA3AF' }}>
                          {col.color_name}
                        </span>
                        {!colorAvailable && <span style={{ fontSize: '0.65rem', color: '#DC2626', fontWeight: 600 }}>(Sold Out)</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SIZE SELECTOR CHIPS FILTERED PER SELECTED COLOR */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '0.88rem', fontWeight: 700, color: '#111827' }}>
                  Select Size: <span style={{ color: '#E52535' }}>{selectedSizeValue ? `Size ${selectedSizeValue}` : 'Select a size'}</span>
                </label>
                <span style={{ fontSize: '0.78rem', color: '#1A73E8', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }} onClick={() => setActiveTab('sizechart')}>
                  <Ruler size={14} /> Size Guide
                </span>
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {STANDARD_SIZES.map((sz) => {
                  const isSizeInStock = isSizeInStockForColor(sz, selectedColorId);
                  const isSelected = selectedSizeValue === sz;

                  return (
                    <button
                      key={sz}
                      onClick={() => isSizeInStock && setSelectedSizeValue(sz)}
                      disabled={!isSizeInStock}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '8px',
                        border: '1.5px solid',
                        borderColor: isSelected ? '#E52535' : isSizeInStock ? '#E5E7EB' : '#F3F4F6',
                        backgroundColor: isSelected ? '#E52535' : isSizeInStock ? '#FFFFFF' : '#F9FAFB',
                        color: isSelected ? '#FFFFFF' : isSizeInStock ? '#111827' : '#9CA3AF',
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        cursor: isSizeInStock ? 'pointer' : 'not-allowed',
                        position: 'relative',
                        opacity: isSizeInStock ? 1 : 0.65
                      }}
                    >
                      {sz}
                      {!isSizeInStock && (
                        <span style={{ display: 'block', fontSize: '0.60rem', fontWeight: 500, color: '#DC2626', textDecoration: 'line-through' }}>Sold Out</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* QUANTITY SELECTOR */}
            <div style={{ marginBottom: '1.75rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#111827', display: 'block', marginBottom: '6px' }}>Quantity</label>
              <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid #E5E7EB', borderRadius: '8px', backgroundColor: '#F9FAFB' }}>
                <button onClick={() => handleQuantityUpdate(-1)} style={{ padding: '8px 14px', background: 'none', border: 'none', color: '#111827', cursor: 'pointer' }}>
                  <Minus size={14} />
                </button>
                <span className="font-mono" style={{ padding: '8px 16px', fontWeight: 700, minWidth: '40px', textAlign: 'center', fontSize: '0.9rem' }}>{quantity}</span>
                <button onClick={() => handleQuantityUpdate(1)} style={{ padding: '8px 14px', background: 'none', border: 'none', color: '#111827', cursor: 'pointer' }}>
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* DUAL ACTION BUTTONS */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '1.75rem' }}>
              {/* BRANDED RED BUTTON (#E52535) - ADD TO BAG */}
              <button
                onClick={handleAddToCart}
                disabled={isWholeProductOut || !selectedColorId || !selectedSizeValue || !isSizeInStockForColor(selectedSizeValue, selectedColorId)}
                className="btn btn-primary"
                style={{
                  height: '48px',
                  width: '100%',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  backgroundColor: (isWholeProductOut || !selectedColorId || !selectedSizeValue || !isSizeInStockForColor(selectedSizeValue, selectedColorId)) ? '#9CA3AF' : '#E52535',
                  borderColor: (isWholeProductOut || !selectedColorId || !selectedSizeValue || !isSizeInStockForColor(selectedSizeValue, selectedColorId)) ? '#9CA3AF' : '#E52535',
                  cursor: (isWholeProductOut || !selectedColorId || !selectedSizeValue || !isSizeInStockForColor(selectedSizeValue, selectedColorId)) ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <ShoppingBag size={18} /> {(isWholeProductOut || !selectedColorId || !selectedSizeValue || !isSizeInStockForColor(selectedSizeValue, selectedColorId)) ? 'Variant Sold Out' : 'Add to Bag'}
              </button>

              {/* WHATSAPP GREEN BUTTON (#0F9D58) - INSTANT WHATSAPP ORDER */}
              <a
                href={whatsappNativeUrl}
                onClick={handleWhatsAppOrder}
                className="btn btn-whatsapp"
                style={{
                  height: '48px',
                  width: '100%',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  backgroundColor: '#0F9D58',
                  borderColor: '#0F9D58',
                  textDecoration: 'none'
                }}
              >
                <MessageCircle size={18} /> Instant WhatsApp Order
              </a>
            </div>

            {/* COLLAPSIBLE SPEC TABS (FABRIC DETAILS, SIZE CHART, DELIVERY ESTIMATES) */}
            <div style={{ border: '1px solid #E5E7EB', borderRadius: '10px', overflow: 'hidden' }}>
              
              {/* TAB HEADERS */}
              <div style={{ display: 'flex', borderBottom: '1px solid #E5E7EB', backgroundColor: '#F9FAFB' }}>
                <button
                  onClick={() => setActiveTab('fabric')}
                  style={{
                    flex: 1,
                    padding: '10px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    border: 'none',
                    backgroundColor: activeTab === 'fabric' ? '#FFFFFF' : 'transparent',
                    color: activeTab === 'fabric' ? '#E52535' : '#4B5563',
                    borderBottom: activeTab === 'fabric' ? '2px solid #E52535' : 'none',
                    cursor: 'pointer'
                  }}
                >
                  Fabric Details
                </button>
                <button
                  onClick={() => setActiveTab('sizechart')}
                  style={{
                    flex: 1,
                    padding: '10px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    border: 'none',
                    backgroundColor: activeTab === 'sizechart' ? '#FFFFFF' : 'transparent',
                    color: activeTab === 'sizechart' ? '#E52535' : '#4B5563',
                    borderBottom: activeTab === 'sizechart' ? '2px solid #E52535' : 'none',
                    cursor: 'pointer'
                  }}
                >
                  Size Chart
                </button>
                <button
                  onClick={() => setActiveTab('delivery')}
                  style={{
                    flex: 1,
                    padding: '10px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    border: 'none',
                    backgroundColor: activeTab === 'delivery' ? '#FFFFFF' : 'transparent',
                    color: activeTab === 'delivery' ? '#E52535' : '#4B5563',
                    borderBottom: activeTab === 'delivery' ? '2px solid #E52535' : 'none',
                    cursor: 'pointer'
                  }}
                >
                  Delivery Specs
                </button>
              </div>

              {/* TAB CONTENT */}
              <div style={{ padding: '1rem', backgroundColor: '#FFFFFF', fontSize: '0.85rem', color: '#4B5563', lineHeight: 1.6 }}>
                {activeTab === 'fabric' && (
                  <div>
                    <p style={{ margin: '0 0 6px 0' }}><strong>Fabric Type:</strong> {product.fabric_type || 'Premium Soft Breathable Cotton Lawn'}</p>
                    <p style={{ margin: '0 0 6px 0' }}><strong>Dye Standard:</strong> Non-toxic skin-safe reactive dyes (Hypoallergenic for kids)</p>
                    <p style={{ margin: 0 }}><strong>Care Instructions:</strong> Gentle machine wash cold inside-out, line dry in shade.</p>
                  </div>
                )}

                {activeTab === 'sizechart' && (
                  <div>
                    <table style={{ width: '100%', fontSize: '0.78rem', borderCollapse: 'collapse', textAlign: 'center' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#F3F4F6', color: '#111827', fontWeight: 700 }}>
                          <th style={{ padding: '6px' }}>Age Group</th>
                          <th style={{ padding: '6px' }}>Chest (in)</th>
                          <th style={{ padding: '6px' }}>Length (in)</th>
                        </tr>
                      </thead>
                      <tbody>
                    <tr style={{ borderBottom: '1px solid #E5E7EB' }}><td>1-2 Years (Size 18)</td><td>18"</td><td>22"</td></tr>
                    <tr style={{ borderBottom: '1px solid #E5E7EB' }}><td>2-3 Years (Size 20)</td><td>20"</td><td>23"</td></tr>
                    <tr style={{ borderBottom: '1px solid #E5E7EB' }}><td>3-4 Years (Size 22)</td><td>22"</td><td>24"</td></tr>
                    <tr style={{ borderBottom: '1px solid #E5E7EB' }}><td>4-5 Years (Size 24)</td><td>24"</td><td>25"</td></tr>
                    <tr style={{ borderBottom: '1px solid #E5E7EB' }}><td>5-6 Years (Size 26)</td><td>26"</td><td>26"</td></tr>
                    <tr style={{ borderBottom: '1px solid #E5E7EB' }}><td>6-7 Years (Size 28)</td><td>28"</td><td>28"</td></tr>
                    <tr style={{ borderBottom: '1px solid #E5E7EB' }}><td>7-8 Years (Size 30)</td><td>30"</td><td>30"</td></tr>
                    <tr style={{ borderBottom: '1px solid #E5E7EB' }}><td>9-10 Years (Size 32)</td><td>32"</td><td>32"</td></tr>
                    <tr style={{ borderBottom: '1px solid #E5E7EB' }}><td>11-12 Years (Size 34)</td><td>34"</td><td>34"</td></tr>
                    <tr style={{ borderBottom: '1px solid #E5E7EB' }}><td>Teen / XS (Size 36)</td><td>36"</td><td>36"</td></tr>
                    <tr style={{ borderBottom: '1px solid #E5E7EB' }}><td>Small / S (Size 38)</td><td>38"</td><td>38"</td></tr>
                    <tr style={{ borderBottom: '1px solid #E5E7EB' }}><td>Medium / M (Size 40)</td><td>40"</td><td>40"</td></tr>
                    <tr style={{ borderBottom: '1px solid #E5E7EB' }}><td>Large / L (Size 42)</td><td>42"</td><td>42"</td></tr>
                    <tr style={{ borderBottom: '1px solid #E5E7EB' }}><td>X-Large / XL (Size 44)</td><td>44"</td><td>44"</td></tr>
                    <tr style={{ borderBottom: '1px solid #E5E7EB' }}><td>2X-Large / XXL (Size 46)</td><td>46"</td><td>46"</td></tr>
                    <tr style={{ borderBottom: '1px solid #E5E7EB' }}><td>3X-Large / 3XL (Size 48)</td><td>48"</td><td>48"</td></tr>
                      </tbody>
                    </table>
                  </div>
                )}

                {activeTab === 'delivery' && (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <Truck size={16} style={{ color: '#0F9D58' }} />
                      <span><strong>Free Nationwide TCS Shipping</strong> on orders above Rs. 3,000</span>
                    </div>
                    <p style={{ margin: '0 0 6px 0' }}>Dispatched nationwide exclusively via <strong>TCS Express Courier</strong> (2-3 working days).</p>
                    <p style={{ margin: 0, color: '#DC2626', fontWeight: 600 }}>No Cash on Delivery (COD). 100% Advance Faysal Bank transfer required.</p>
                  </div>
                )}
              </div>

            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
