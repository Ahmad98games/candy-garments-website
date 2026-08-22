import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchProductById, Product as SupabaseProduct } from '../lib/supabase';
import { useToast } from '../context/ToastContext';
import SmartImage from '../components/SmartImage';
import { ShoppingBag, Minus, Plus, ArrowLeft, ShieldCheck, Truck, MessageCircle, CheckCircle, ChevronDown, ChevronUp, Ruler } from 'lucide-react';
import './Product.css';

export default function Product() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [product, setProduct] = useState<SupabaseProduct | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string>('3-4Y');
  const [activeTab, setActiveTab] = useState<'fabric' | 'sizechart' | 'delivery'>('fabric');

  const ageSizes = [
    { label: '1-2Y', inStock: true },
    { label: '2-3Y', inStock: true },
    { label: '3-4Y', inStock: true },
    { label: '4-5Y', inStock: true },
    { label: '5-6Y', inStock: true },
    { label: '6-7Y', inStock: false },
    { label: '7-8Y', inStock: true },
  ];

  useEffect(() => {
    async function loadProduct() {
      if (!id) return;
      setLoading(true);
      try {
        const data = await fetchProductById(id);
        setProduct(data);
      } catch (err) {
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [id]);

  const handleQuantityUpdate = (delta: number) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  };

  const handleAddToCart = () => {
    if (!product) return;
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingIndex = cart.findIndex((item: any) => item.id === product.id && item.size === selectedSize);
    if (existingIndex > -1) {
      cart[existingIndex].quantity += quantity;
    } else {
      cart.push({
        id: product.id,
        name: product.title,
        price: product.retail_price,
        image: product.images?.[0] || 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=800&q=80',
        quantity: quantity,
        articleNo: product.article_no || 'CK-01',
        size: selectedSize,
      });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cart-updated'));
    showToast(`Added ${quantity} x ${product.title} (Size: ${selectedSize}) to Bag!`, 'success');
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
    `Assalamu Alaikum Candy Kids, I want to order ${product.title} - Price: Rs. ${product.retail_price}, Size: ${selectedSize}. Product Link: ${currentUrl}`
  );
  const whatsappNativeUrl = `whatsapp://send?phone=923311498773&text=${encodedText}`;
  const whatsappWebUrl = `https://wa.me/923311498773?text=${encodedText}`;

  const handleWhatsAppOrder = (e: React.MouseEvent) => {
    e.preventDefault();
    // Try launching native whatsapp scheme first, with web fallback
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
              <span style={{ fontSize: '0.78rem', color: '#0F9D58', backgroundColor: '#ECFDF5', padding: '4px 10px', borderRadius: '4px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle size={14} /> Ready to Ship
              </span>
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

            {/* AGE/SIZE SELECTOR PILLS WITH REAL-TIME STOCK INDICATORS */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '0.88rem', fontWeight: 700, color: '#111827' }}>
                  Select Age / Size: <span style={{ color: '#E52535' }}>{selectedSize}</span>
                </label>
                <span style={{ fontSize: '0.78rem', color: '#1A73E8', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }} onClick={() => setActiveTab('sizechart')}>
                  <Ruler size={14} /> Size Guide
                </span>
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {ageSizes.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => item.inStock && setSelectedSize(item.label)}
                    disabled={!item.inStock}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '8px',
                      border: '1.5px solid',
                      borderColor: selectedSize === item.label ? '#E52535' : item.inStock ? '#E5E7EB' : '#F3F4F6',
                      backgroundColor: selectedSize === item.label ? '#E52535' : item.inStock ? '#FFFFFF' : '#F9FAFB',
                      color: selectedSize === item.label ? '#FFFFFF' : item.inStock ? '#111827' : '#9CA3AF',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      cursor: item.inStock ? 'pointer' : 'not-allowed',
                      position: 'relative',
                      opacity: item.inStock ? 1 : 0.6
                    }}
                  >
                    {item.label}
                    {!item.inStock && (
                      <span style={{ display: 'block', fontSize: '0.62rem', fontWeight: 500, color: '#DC2626' }}>Sold Out</span>
                    )}
                  </button>
                ))}
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
                className="btn btn-primary"
                style={{
                  height: '48px',
                  width: '100%',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  backgroundColor: '#E52535',
                  borderColor: '#E52535'
                }}
              >
                <ShoppingBag size={18} /> Add to Bag
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
                        <tr style={{ borderBottom: '1px solid #E5E7EB' }}><td>1-2 Years</td><td>22"</td><td>18"</td></tr>
                        <tr style={{ borderBottom: '1px solid #E5E7EB' }}><td>2-3 Years</td><td>23"</td><td>20"</td></tr>
                        <tr style={{ borderBottom: '1px solid #E5E7EB' }}><td>3-4 Years</td><td>24"</td><td>22"</td></tr>
                        <tr style={{ borderBottom: '1px solid #E5E7EB' }}><td>5-6 Years</td><td>26"</td><td>26"</td></tr>
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
