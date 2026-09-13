import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  fetchProductById, fetchProducts, Product as SupabaseProduct,
  fetchProductColors, fetchProductVariants, ProductColor, ProductVariant,
  STANDARD_SIZES, supabase, generateWhatsAppLink
} from '../lib/supabase';
import { isProductWholeSoldOut } from '../lib/availability';
import { useToast } from '../context/ToastContext';
import SmartImage from '../components/SmartImage';
import {
  ShoppingBag, Minus, Plus, ArrowLeft, ShieldCheck, Truck, MessageCircle,
  CheckCircle, XCircle, ChevronDown, ChevronUp, Ruler, ZoomIn, X
} from 'lucide-react';
import './Product.css';
import { ProductMediaViewer } from '../components/product/ProductMediaViewer';

export default function Product() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [product, setProduct] = useState<SupabaseProduct | null>(null);
  const [colors, setColors] = useState<ProductColor[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<SupabaseProduct[]>([]);
  const [selectedColorId, setSelectedColorId] = useState<string | null>(null);
  const [selectedSizeValue, setSelectedSizeValue] = useState<number | null>(null);

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [zoomModalOpen, setZoomModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  // FAQ-style accordion state
  const [openAccordion, setOpenAccordion] = useState<'fabric' | 'sizing' | 'shipping' | null>('fabric');

  const loadStockData = useCallback(async (productId: string) => {
    try {
      const colData = await fetchProductColors(productId);
      const varData = await fetchProductVariants(productId);
      setColors(colData);
      setVariants(varData);

      if (colData.length > 0) {
        const initialColor = colData[0];
        setSelectedColorId(initialColor.id);

        const firstAvailSize = STANDARD_SIZES.find((sz) => {
          const matching = varData.find((v) => v.color_id === initialColor.id && Number(v.size_value) === sz);
          return matching ? matching.in_stock : true;
        });
        setSelectedSizeValue(firstAvailSize || STANDARD_SIZES[0]);
      } else {
        setSelectedSizeValue(STANDARD_SIZES[0]);
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
          // Load related products from same department/category
          const allProds = await fetchProducts({ department: data.department });
          setRelatedProducts((allProds || []).filter((p) => p.id !== data.id).slice(0, 4));
        }
      } catch (err) {
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [id, loadStockData]);

  // Realtime variant stock changes
  useEffect(() => {
    if (!product?.id) return;

    const channel = supabase
      .channel(`realtime-product-variants-${product.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'product_variants', filter: `product_id=eq.${product.id}` },
        () => loadStockData(product.id)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [product?.id, loadStockData]);

  const isColorInStock = useCallback((colorId: string) => {
    return STANDARD_SIZES.some((sz) => {
      const matching = variants.find((v) => v.color_id === colorId && Number(v.size_value) === sz);
      return matching ? matching.in_stock : true;
    });
  }, [variants]);

  const isSizeInStockForColor = useCallback((sz: number, colorId: string | null) => {
    if (!colorId) return true;
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

  const handleAddToCart = () => {
    if (!product) return;

    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingIndex = cart.findIndex((item: any) => item.product.id === product.id);

    if (existingIndex > -1) {
      cart[existingIndex].quantity += quantity;
    } else {
      cart.push({
        product,
        quantity,
        selectedSize: selectedSizeValue || 32,
        selectedColor: selectedColorObj?.color_name || 'Standard',
      });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
    showToast(`Added ${quantity} × ${product.title} to your bag`, 'success');
  };

  if (loading) {
    return (
      <div className="pdp-page-container" style={{ textAlign: 'center', paddingTop: '100px' }}>
        <p style={{ color: '#7A7068' }}>Loading luxury ensemble details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pdp-page-container" style={{ textAlign: 'center', paddingTop: '100px' }}>
        <h2 style={{ fontFamily: 'Fraunces, serif' }}>Ensemble Not Found</h2>
        <Link to="/collection" style={{ color: '#A32638', marginTop: '16px', display: 'inline-block', fontWeight: 600 }}>
          Back to Collections
        </Link>
      </div>
    );
  }

  const mainImage = product.images?.[selectedImageIndex] || product.images?.[0] || 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=800&q=80';
  const whatsappUrl = generateWhatsAppLink(product.title, product.article_no || product.id);
  const originalPrice = Math.round(product.price * 1.25);

  return (
    <div className="pdp-page-container">
      <div className="container">
        {/* Breadcrumb Nav */}
        <div className="pdp-breadcrumb-nav">
          <button onClick={() => navigate(-1)} className="pdp-breadcrumb-btn">
            <ArrowLeft size={14} /> Collections
          </button>
          <span>/</span>
          <span style={{ color: '#B08D4F', fontWeight: 600 }}>{product.category || 'Luxury Pret'}</span>
          <span>/</span>
          <span style={{ color: '#1F1B18' }}>{product.title}</span>
        </div>

        {/* Product Grid */}
        <div className="pdp-grid-container">
          {/* Left Column: Vertical Thumbnails + Main Image with Soft Click Zoom */}
          {/* Left Column: ProductMediaViewer with 4x Macro Lens & Zero-Color-Correction Daylight Toggle */}
          <div className="pdp-gallery-wrap">
            <ProductMediaViewer
              studioImages={product.images && product.images.length > 0 ? product.images : [mainImage]}
              productName={product.title}
              articleNo={product.article_no}
            />
          </div>

          {/* Right Column: Specifications & Variant Swatches */}
          <div className="pdp-info-card">
            <span className="pdp-eyebrow">{product.department || 'CANDY KIDS'} • {product.category || 'FESTIVE WEAR'}</span>
            <h1 className="pdp-title">{product.title}</h1>

            {/* Price Row */}
            <div className="pdp-price-row">
              <span className="pdp-sale-price">Rs. {product.price.toLocaleString()}</span>
              <span className="pdp-orig-price">Rs. {originalPrice.toLocaleString()}</span>
              <span className="pdp-discount-pill">-20% OFF</span>
              <span style={{ marginLeft: 'auto', fontSize: '11px', fontFamily: 'monospace', color: '#7A7068' }}>
                SKU: {product.article_no || 'OMN-882'}
              </span>
            </div>

            {/* Color Swatches */}
            {colors.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <span className="pdp-variant-label">
                  Color: <strong style={{ color: '#A32638' }}>{selectedColorObj?.color_name || 'Standard'}</strong>
                </span>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {colors.map((col) => {
                    const available = isColorInStock(col.id);
                    const active = selectedColorId === col.id;
                    return (
                      <button
                        key={col.id}
                        disabled={!available}
                        onClick={() => {
                          setSelectedColorId(col.id);
                          const firstSize = STANDARD_SIZES.find((sz) => isSizeInStockForColor(sz, col.id)) || STANDARD_SIZES[0];
                          setSelectedSizeValue(firstSize);
                        }}
                        className={`pdp-variant-chip ${active ? 'active' : ''}`}
                      >
                        {col.color_name} {!available && '(Sold Out)'}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Size Chips */}
            <div style={{ marginBottom: '1.5rem' }}>
              <span className="pdp-variant-label">
                Size: <strong style={{ color: '#A32638' }}>{selectedSizeValue ? `Size ${selectedSizeValue}` : 'Select Size'}</strong>
              </span>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {STANDARD_SIZES.map((sz) => {
                  const inStock = isSizeInStockForColor(sz, selectedColorId);
                  const active = selectedSizeValue === sz;
                  return (
                    <button
                      key={sz}
                      disabled={!inStock}
                      onClick={() => inStock && setSelectedSizeValue(sz)}
                      className={`pdp-variant-chip ${active ? 'active' : ''}`}
                    >
                      {sz}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity Selector */}
            <div style={{ marginBottom: '1.5rem' }}>
              <span className="pdp-variant-label">Quantity</span>
              <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid rgba(122, 112, 104, 0.25)', borderRadius: '12px', background: '#FAF6F1' }}>
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  style={{ padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer', color: '#1F1B18' }}
                >
                  <Minus size={14} />
                </button>
                <span style={{ padding: '0 16px', fontWeight: 700, fontSize: '14px', fontFamily: 'monospace', color: '#1F1B18' }}>
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  style={{ padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer', color: '#1F1B18' }}
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* CTA Pairing */}
            <div className="pdp-cta-pairing">
              <button
                onClick={handleAddToCart}
                disabled={isWholeProductOut}
                className="pdp-btn-primary"
              >
                <ShoppingBag size={18} strokeWidth={1.5} />
                {isWholeProductOut ? 'Sold Out' : 'Add to Bag'}
              </button>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="pdp-btn-secondary"
              >
                <MessageCircle size={18} strokeWidth={1.5} />
                Instant WhatsApp Order
              </a>
            </div>

            {/* FAQ-style Accordion */}
            <div className="pdp-accordion-wrap">
              {/* Accordion Item 1 */}
              <div className="pdp-accordion-item">
                <button
                  className="pdp-accordion-header"
                  onClick={() => setOpenAccordion(openAccordion === 'fabric' ? null : 'fabric')}
                >
                  <span>Fabric & Craftsmanship</span>
                  {openAccordion === 'fabric' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {openAccordion === 'fabric' && (
                  <div className="pdp-accordion-body">
                    Hand-crafted from premium {product.fabric_type || 'Embroidered Silk Lawn'} with intricate zari thread work and skin-safe dyes tailored specifically for luxury couture.
                  </div>
                )}
              </div>

              {/* Accordion Item 2 */}
              <div className="pdp-accordion-item">
                <button
                  className="pdp-accordion-header"
                  onClick={() => setOpenAccordion(openAccordion === 'sizing' ? null : 'sizing')}
                >
                  <span>Sizing & Measurement Guide</span>
                  {openAccordion === 'sizing' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {openAccordion === 'sizing' && (
                  <div className="pdp-accordion-body">
                    Standard Pakistani size chart: Size 32 (Chest 32", Length 38"), Size 34 (Chest 34", Length 40"), Size 36 (Chest 36", Length 42"). Fits true to size with a tailored couture drape.
                  </div>
                )}
              </div>

              {/* Accordion Item 3 */}
              <div className="pdp-accordion-item">
                <button
                  className="pdp-accordion-header"
                  onClick={() => setOpenAccordion(openAccordion === 'shipping' ? null : 'shipping')}
                >
                  <span>Shipping & Nationwide Delivery</span>
                  {openAccordion === 'shipping' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {openAccordion === 'shipping' && (
                  <div className="pdp-accordion-body">
                    Complimentary TCS Express shipping across Pakistan on orders over Rs. 3,000. Expected delivery within 2-3 working days.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Related Ensembles Section */}
        {relatedProducts.length > 0 && (
          <div style={{ marginTop: '5rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <span className="pdp-eyebrow">CURATED FOR YOU</span>
              <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: '2rem', color: '#1F1B18' }}>
                You May Also Like
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.5rem' }}>
              {relatedProducts.map((rel) => (
                <div
                  key={rel.id}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid rgba(122, 112, 104, 0.18)',
                    borderRadius: '12px',
                    overflow: 'hidden',
                  }}
                >
                  <Link to={`/product/${rel.id}`} style={{ display: 'block', aspectRatio: '3 / 4' }}>
                    <img
                      src={rel.images?.[0] || mainImage}
                      alt={rel.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </Link>
                  <div style={{ padding: '1rem' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 500, margin: '0 0 6px 0', color: '#1F1B18' }}>
                      <Link to={`/product/${rel.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                        {rel.title}
                      </Link>
                    </h4>
                    <span style={{ fontSize: '15px', fontWeight: 700, fontFamily: 'monospace', color: '#1F1B18' }}>
                      Rs. {rel.price.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Detail Zoom Lightbox Modal */}
      {zoomModalOpen && (
        <div className="pdp-zoom-modal-overlay" onClick={() => setZoomModalOpen(false)}>
          <div className="pdp-zoom-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="pdp-zoom-modal-close" onClick={() => setZoomModalOpen(false)}>
              <X size={28} />
            </button>
            <img src={mainImage} alt={`Detail view of ${product.title}`} />
          </div>
        </div>
      )}
    </div>
  );
}
