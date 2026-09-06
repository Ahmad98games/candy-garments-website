import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { fetchProducts, Product, ProductVariant, generateWhatsAppLink } from '../../lib/supabase';
import { batchFetchVariantsForProducts, isProductWholeSoldOut, isSizeAvailableForProduct } from '../../lib/availability';
import { useToast } from '../../context/ToastContext';
import { ShoppingBag, Search, Filter, RotateCcw, ChevronDown, FilterX, MessageCircle } from 'lucide-react';
import SkeletonProductCard from '../SkeletonProductCard';
import './CollectionLayout.css';

export interface CollectionLayoutProps {
  presetType?: 'all' | 'ladies' | 'kids' | 'new-in' | 'sale';
  eyebrowText?: string;
  titleText?: string;
  descriptionText?: string;
}

const resolveProductImage = (imgs: any): string => {
  const fallback = 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=800&q=80';
  if (!imgs) return fallback;

  let list: string[] = [];
  if (Array.isArray(imgs)) {
    list = imgs;
  } else if (typeof imgs === 'string') {
    if (imgs.startsWith('[') || imgs.startsWith('{')) {
      try {
        const parsed = JSON.parse(imgs);
        list = Array.isArray(parsed) ? parsed : [imgs];
      } catch {
        list = [imgs];
      }
    } else {
      list = [imgs];
    }
  }

  const validUrls = list.filter((url) => typeof url === 'string' && url.trim().length > 0);
  return validUrls.length > 0 ? validUrls[0] : fallback;
};

export const CollectionLayout: React.FC<CollectionLayoutProps> = ({
  presetType = 'all',
  eyebrowText,
  titleText,
  descriptionText,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & State
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [activeDepartment, setActiveDepartment] = useState<'Ladies' | 'Kids' | 'All'>(() => {
    if (presetType === 'ladies') return 'Ladies';
    if (presetType === 'kids') return 'Kids';
    return (searchParams.get('dept') as any) || 'All';
  });

  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [selectedSizeFilter, setSelectedSizeFilter] = useState<number | 'All'>('All');
  const [selectedFabricFilter, setSelectedFabricFilter] = useState<string>('All');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [saleOnly, setSaleOnly] = useState(presetType === 'sale' || searchParams.get('sale') === 'true');
  const [priceRange, setPriceRange] = useState<number>(40000);
  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'latest'>('featured');

  const { showToast } = useToast();

  // Presets mapping
  const headerEyebrow = eyebrowText || (
    presetType === 'sale' ? 'SEASONAL SALE' :
    presetType === 'ladies' ? 'LUXURY PRET & FORMALS' :
    presetType === 'kids' ? 'COUTURE KIDS & FESTIVE' :
    presetType === 'new-in' ? 'NEW ARRIVALS 2026' :
    'CANDY KIDS COUTURE'
  );

  const headerTitle = titleText || (
    presetType === 'sale' ? 'End of Season Sale' :
    presetType === 'ladies' ? 'Ladies Wear Collection' :
    presetType === 'kids' ? 'Girls & Kids Collection' :
    presetType === 'new-in' ? 'New In Ensembles' :
    'All Collections'
  );

  const headerDesc = descriptionText || (
    presetType === 'sale' ? 'Exclusive discounts on handcrafted festive ensembles, embroidered organza, and raw silk suits.' :
    presetType === 'ladies' ? 'Handcrafted festive couture, silk lawn suits, and finely tailored embroidered ensembles.' :
    presetType === 'kids' ? 'Royal festive frocks, vibrant lehenga cholis, and traditional embroidered dresses for children.' :
    'Explore our full catalogue of luxury festive couture, handcrafted with intricate embroideries and premium fabrics.'
  );

  // Load products
  const loadCollection = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchProducts({
        department: activeDepartment !== 'All' ? activeDepartment : undefined,
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        in_stock_only: inStockOnly,
        search_term: searchTerm,
      });

      let filtered = data || [];
      if (presetType === 'new-in') {
        filtered = filtered.filter((p) => p.is_new_arrival ?? true);
      } else if (saleOnly) {
        filtered = filtered.filter((p) => p.is_on_sale || (p.sale_price && p.sale_price < (p.retail_price || p.price || 0)));
      }

      setProducts(filtered);

      if (filtered.length > 0) {
        const pIds = filtered.map((p) => p.id);
        const vData = await batchFetchVariantsForProducts(pIds);
        setVariants(vData);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  }, [activeDepartment, selectedCategory, inStockOnly, searchTerm, saleOnly, presetType]);

  useEffect(() => {
    loadCollection();
  }, [loadCollection]);

  // Client-side filtering & sorting
  const processedProducts = useMemo(() => {
    let list = [...products];

    // Filter by Price
    list = list.filter((p) => {
      const actual = Number(p.retail_price || p.price || 0);
      const currentPrice = p.sale_price && Number(p.sale_price) < actual ? Number(p.sale_price) : actual;
      return currentPrice <= priceRange;
    });

    // Filter by Fabric
    if (selectedFabricFilter !== 'All') {
      list = list.filter((p) => p.fabric_type && p.fabric_type.toLowerCase().includes(selectedFabricFilter.toLowerCase()));
    }

    // Filter by Size (using variant stock matrix)
    if (selectedSizeFilter !== 'All') {
      list = list.filter((product) => {
        return isSizeAvailableForProduct(product.id, selectedSizeFilter, variants);
      });
    }

    // Sorting
    if (sortBy === 'price-low') {
      list.sort((a, b) => {
        const pA = (a.sale_price && a.sale_price < (a.retail_price || a.price || 0)) ? a.sale_price : (a.retail_price || a.price || 0);
        const pB = (b.sale_price && b.sale_price < (b.retail_price || b.price || 0)) ? b.sale_price : (b.retail_price || b.price || 0);
        return pA - pB;
      });
    } else if (sortBy === 'price-high') {
      list.sort((a, b) => {
        const pA = (a.sale_price && a.sale_price < (a.retail_price || a.price || 0)) ? a.sale_price : (a.retail_price || a.price || 0);
        const pB = (b.sale_price && b.sale_price < (b.retail_price || b.price || 0)) ? b.sale_price : (b.retail_price || b.price || 0);
        return pB - pA;
      });
    } else if (sortBy === 'latest') {
      list.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
    }

    return list;
  }, [products, priceRange, selectedFabricFilter, selectedSizeFilter, variants, sortBy]);

  const handleResetFilters = () => {
    setSelectedCategory('All');
    setSelectedSizeFilter('All');
    setSelectedFabricFilter('All');
    setInStockOnly(false);
    setPriceRange(40000);
    setSearchTerm('');
    if (presetType === 'all') setActiveDepartment('All');
  };

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();

    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingIndex = cart.findIndex((item: any) => item.product.id === product.id);

    if (existingIndex > -1) {
      cart[existingIndex].quantity += 1;
    } else {
      cart.push({ product, quantity: 1, selectedSize: 32, selectedColor: 'Standard' });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
    showToast(`Added ${product.title} to your bag`, 'success');
  };

  return (
    <div>
      {/* Header Banner */}
      <section className={`collection-hero-header ${presetType === 'sale' ? 'sale-header' : ''}`}>
        <div className="container">
          <span className={`collection-eyebrow ${presetType === 'sale' ? 'sale-badge-pill' : ''}`}>
            {headerEyebrow}
          </span>
          <h1 className="collection-title">{headerTitle}</h1>
          <p className="collection-subtitle">{headerDesc}</p>
        </div>
      </section>

      {/* Main Body */}
      <section className="collection-page-body">
        <div className="container">
          <div className="collection-layout-grid">
            {/* Sidebar Filters */}
            <aside className="collection-sidebar-card">
              <div className="collection-sidebar-header">
                <span className="collection-sidebar-title">
                  <Filter size={15} style={{ color: '#B08D4F' }} /> Filter Ensembles
                </span>
                <button onClick={handleResetFilters} className="collection-reset-btn">
                  <RotateCcw size={12} /> Reset
                </button>
              </div>

              {/* Department */}
              {presetType === 'all' && (
                <div className="collection-filter-section">
                  <span className="collection-filter-label">Department</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {['All', 'Ladies', 'Kids'].map((dept) => (
                      <button
                        key={dept}
                        onClick={() => setActiveDepartment(dept as any)}
                        style={{
                          padding: '8px 12px',
                          borderRadius: '8px',
                          border: activeDepartment === dept ? '1px solid #A32638' : '1px solid rgba(122, 112, 104, 0.2)',
                          background: activeDepartment === dept ? '#A32638' : '#FAF6F1',
                          color: activeDepartment === dept ? '#FAF6F1' : '#1F1B18',
                          fontSize: '12px',
                          fontWeight: 600,
                          textAlign: 'left',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        {dept === 'All' ? '✨ All Departments' : dept === 'Ladies' ? '💃 Ladies Couture' : '👑 Kids Festive'}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size Filter */}
              <div className="collection-filter-section">
                <span className="collection-filter-label">Filter by Size</span>
                <div className="size-chip-grid">
                  <button
                    onClick={() => setSelectedSizeFilter('All')}
                    className={`size-chip ${selectedSizeFilter === 'All' ? 'active' : ''}`}
                  >
                    All
                  </button>
                  {[30, 32, 34, 36, 38, 40, 42, 44].map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setSelectedSizeFilter(sz)}
                      className={`size-chip ${selectedSizeFilter === sz ? 'active' : ''}`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fabric Type */}
              <div className="collection-filter-section">
                <span className="collection-filter-label">Fabric Type</span>
                <div className="luxury-select-wrapper">
                  <select
                    className="luxury-select"
                    value={selectedFabricFilter}
                    onChange={(e) => setSelectedFabricFilter(e.target.value)}
                  >
                    <option value="All">All Fabrics</option>
                    <option value="Silk">Raw Silk</option>
                    <option value="Organza">Organza</option>
                    <option value="Lawn">Embroidered Lawn</option>
                    <option value="Chiffon">Pure Chiffon</option>
                    <option value="Velvet">Velvet</option>
                  </select>
                  <ChevronDown size={14} className="luxury-select-icon" />
                </div>
              </div>

              {/* Price Range */}
              <div className="collection-filter-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span className="collection-filter-label" style={{ margin: 0 }}>Max Price</span>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#A32638', fontFamily: 'monospace' }}>
                    Rs. {priceRange.toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min={3000}
                  max={60000}
                  step={1000}
                  value={priceRange}
                  onChange={(e) => setPriceRange(Number(e.target.value))}
                  className="luxury-range"
                />
              </div>

              {/* Custom Stock Checkbox */}
              <div className="collection-filter-section">
                <label className="luxury-checkbox-label">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="luxury-checkbox"
                  />
                  <span>In Stock Only</span>
                </label>
              </div>
            </aside>

            {/* Product Display Main Column */}
            <main>
              {/* Toolbar */}
              <div className="collection-toolbar">
                <div className="collection-results-count">
                  Showing <strong>{processedProducts.length}</strong> available ensembles
                </div>

                <div className="collection-toolbar-actions">
                  {/* Search Bar */}
                  <div style={{ position: 'relative', width: '200px' }}>
                    <input
                      type="text"
                      placeholder="Search title, SKU..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="luxury-input"
                      style={{ paddingRight: '32px', fontSize: '13px' }}
                    />
                    <Search size={14} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#7A7068' }} />
                  </div>

                  {/* Sort Dropdown */}
                  <div className="luxury-select-wrapper" style={{ width: '180px' }}>
                    <select
                      className="luxury-select"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      style={{ fontSize: '13px' }}
                    >
                      <option value="featured">Featured Ensembles</option>
                      <option value="latest">Newest Arrivals</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                    </select>
                    <ChevronDown size={14} className="luxury-select-icon" />
                  </div>
                </div>
              </div>

              {/* Grid or Loading or Empty State */}
              {loading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
                  {[1, 2, 3, 4, 5, 6].map((idx) => (
                    <SkeletonProductCard key={idx} />
                  ))}
                </div>
              ) : processedProducts.length === 0 ? (
                /* Designed Empty State */
                <div className="collection-empty-state">
                  <div className="collection-empty-icon-wrap">
                    <FilterX size={28} />
                  </div>
                  <h3 className="collection-empty-title">No Ensembles Match Your Selection</h3>
                  <p className="collection-empty-desc">
                    We couldn't find any products matching your active filters. Try adjusting your size, price range, or category filter to discover our available couture pieces.
                  </p>
                  <button onClick={handleResetFilters} className="collection-empty-clear-btn">
                    Clear All Filters
                  </button>
                </div>
              ) : (
                /* Reused Part 5 Product Card Grid */
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
                  {processedProducts.map((product) => {
                    const isSoldOut = isProductWholeSoldOut(product.id, variants);
                    const mainImage = resolveProductImage(product.images);
                    const actualPrice = Number(product.retail_price || product.price || 0);
                    const salePrice = product.sale_price && Number(product.sale_price) < actualPrice ? Number(product.sale_price) : null;
                    const discountPct = (salePrice && actualPrice > 0)
                      ? Math.round(((actualPrice - salePrice) / actualPrice) * 100)
                      : null;
                    const isNew = product.is_new_arrival ?? true;

                    return (
                      <div
                        key={product.id}
                        className="luxury-product-card"
                        style={{
                          background: '#FFFFFF',
                          border: '1px solid rgba(122, 112, 104, 0.18)',
                          borderRadius: '12px',
                          overflow: 'hidden',
                          display: 'flex',
                          flexDirection: 'column',
                          position: 'relative',
                          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                        }}
                      >
                        {/* Image Container with 3:4 Aspect Ratio */}
                        <div style={{ position: 'relative', width: '100%', aspectRatio: '3 / 4', overflow: 'hidden', background: '#F3ECE3' }}>
                          <Link to={`/product/${product.id}`} style={{ display: 'block', width: '100%', height: '100%' }}>
                            <img
                              src={mainImage}
                              alt={product.title}
                              style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                              loading="lazy"
                            />
                          </Link>

                          {/* Discount Tag or New Stock Badge */}
                          {discountPct && !isSoldOut ? (
                            <span style={{
                              position: 'absolute',
                              top: '12px',
                              left: '12px',
                              background: '#A32638',
                              color: '#FAF6F1',
                              fontSize: '11px',
                              fontWeight: 700,
                              padding: '4px 10px',
                              borderRadius: '6px',
                              letterSpacing: '0.05em'
                            }}>
                              -{discountPct}% OFF
                            </span>
                          ) : isNew && !isSoldOut ? (
                            <span style={{
                              position: 'absolute',
                              top: '12px',
                              left: '12px',
                              background: '#B08D4F',
                              color: '#FAF6F1',
                              fontSize: '11px',
                              fontWeight: 700,
                              padding: '4px 10px',
                              borderRadius: '6px',
                              letterSpacing: '0.05em'
                            }}>
                              NEW STOCK
                            </span>
                          ) : null}

                          {/* Sold Out Badge */}
                          {isSoldOut && (
                            <span style={{
                              position: 'absolute',
                              top: '12px',
                              left: '12px',
                              background: '#1F1B18',
                              color: '#FAF6F1',
                              fontSize: '11px',
                              fontWeight: 700,
                              padding: '4px 10px',
                              borderRadius: '6px',
                              letterSpacing: '0.05em'
                            }}>
                              SOLD OUT
                            </span>
                          )}

                          {/* WhatsApp Inquiry Button */}
                          <a
                            href={generateWhatsAppLink(product.title, product.article_no || product.id)}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              position: 'absolute',
                              top: '12px',
                              right: '12px',
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              background: 'rgba(255, 255, 255, 0.9)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#10B981',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                              transition: 'transform 0.2s ease',
                            }}
                            title="Instant WhatsApp Inquiry"
                          >
                            <MessageCircle size={16} />
                          </a>
                        </div>

                        {/* Card Info Content Area */}
                        <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                          {/* SKU Tag */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#7A7068' }}>
                              SKU: {product.article_no || 'OMN-773'}
                            </span>
                            {product.fabric_type && (
                              <span style={{ fontSize: '11px', color: '#7A7068' }}>
                                {product.fabric_type}
                              </span>
                            )}
                          </div>

                          {/* Two-line Clamped Title */}
                          <h3 style={{
                            fontFamily: 'Inter, sans-serif',
                            fontSize: '15px',
                            fontWeight: 500,
                            color: '#1F1B18',
                            margin: '0 0 10px 0',
                            lineHeight: 1.35,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            minHeight: '2.7em',
                          }}>
                            <Link to={`/product/${product.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                              {product.title}
                            </Link>
                          </h3>

                          {/* Price Display */}
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '1rem', marginTop: 'auto' }}>
                            <span style={{ fontSize: '16px', fontWeight: 700, color: '#1F1B18', fontFamily: 'monospace' }}>
                              Rs. {(salePrice || actualPrice).toLocaleString()}
                            </span>
                            {salePrice && (
                              <span style={{ fontSize: '13px', color: '#7A7068', textDecoration: 'line-through', fontFamily: 'monospace' }}>
                                Rs. {actualPrice.toLocaleString()}
                              </span>
                            )}
                          </div>

                          {/* Full-width Add to Bag Button */}
                          <button
                            onClick={(e) => handleAddToCart(e, product)}
                            disabled={isSoldOut}
                            style={{
                              width: '100%',
                              padding: '10px',
                              background: isSoldOut ? '#E2D9CF' : '#1F1B18',
                              color: isSoldOut ? '#7A7068' : '#FAF6F1',
                              border: 'none',
                              borderRadius: '8px',
                              fontSize: '13px',
                              fontWeight: 600,
                              cursor: isSoldOut ? 'not-allowed' : 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '8px',
                              transition: 'background 0.2s ease',
                            }}
                          >
                            <ShoppingBag size={14} strokeWidth={1.5} />
                            {isSoldOut ? 'Sold Out' : 'Add to Bag'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </main>
          </div>
        </div>
      </section>
    </div>
  );
};
