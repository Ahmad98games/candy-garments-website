import { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { fetchProducts, Product, generateWhatsAppLink } from '../lib/supabase';
import { formatCurrencyPKR } from '../utils/currencyEngine';
import { useToast } from '../context/ToastContext';
import { ShoppingBag, Search, Filter, MessageCircle, X, ChevronDown, CheckCircle, XCircle } from 'lucide-react';
import SkeletonProductCard from '../components/SkeletonProductCard';
import { DesktopFilterSidebar } from '../components/catalog/DesktopFilterSidebar';
import { FilterDrawer } from '../components/catalog/FilterDrawer';
import './OmnoraCollection.css';

interface CollectionProps {
  defaultDepartment?: 'Ladies' | 'Kids';
}

export default function Collection({ defaultDepartment }: CollectionProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [activeDepartment, setActiveDepartment] = useState<'Ladies' | 'Kids' | 'All'>(
    defaultDepartment || (searchParams.get('dept') as any) || 'All'
  );
  const [selectedGender, setSelectedGender] = useState(searchParams.get('gender') || 'All');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [saleOnly, setSaleOnly] = useState(searchParams.get('sale') === 'true');
  const [priceRange, setPriceRange] = useState<number>(30000);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const { showToast } = useToast();

  useEffect(() => {
    if (defaultDepartment) {
      setActiveDepartment(defaultDepartment);
    }
  }, [defaultDepartment]);

  useEffect(() => {
    // Sync with URL params
    const genderFromUrl = searchParams.get('gender');
    if (genderFromUrl) setSelectedGender(genderFromUrl);
    const qFromUrl = searchParams.get('q');
    if (qFromUrl) setSearchTerm(qFromUrl);
    const deptFromUrl = searchParams.get('dept');
    if (deptFromUrl && !defaultDepartment) setActiveDepartment(deptFromUrl as any);
    const saleFromUrl = searchParams.get('sale');
    setSaleOnly(saleFromUrl === 'true');
  }, [searchParams, defaultDepartment]);

  useEffect(() => {
    async function loadCollection() {
      setLoading(true);
      try {
        const data = await fetchProducts({
          department: activeDepartment !== 'All' ? activeDepartment : undefined,
          category: selectedCategory !== 'All' ? selectedCategory : undefined,
          in_stock_only: inStockOnly,
          search_term: searchTerm,
        });
        setProducts(data);
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    }

    const timer = setTimeout(() => {
      loadCollection();
    }, 250);

    return () => clearTimeout(timer);
  }, [activeDepartment, selectedCategory, inStockOnly, searchTerm]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Sale filter matching
      if (saleOnly) {
        if (p.retail_price > 6500 && !p.margin) return false;
      }
      // Category filter matching
      if (selectedCategory !== 'All' && p.category !== selectedCategory) {
        return false;
      }
      // Gender filter matching
      if (selectedGender !== 'All') {
        const titleCat = (p.title + ' ' + (p.category || '')).toLowerCase();
        if (selectedGender === 'Girls' && !titleCat.includes('girl') && !titleCat.includes('frock') && !titleCat.includes('dress')) return false;
      }
      return p.retail_price <= priceRange;
    });
  }, [products, selectedCategory, selectedGender, priceRange, saleOnly]);

  const handleAddToCart = (product: Product) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingIndex = cart.findIndex((item: any) => item.id === product.id);
    if (existingIndex > -1) {
      cart[existingIndex].quantity += 1;
    } else {
      cart.push({
        id: product.id,
        name: product.title,
        price: product.retail_price,
        image: product.images?.[0] || 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=800&q=80',
        quantity: 1,
        articleNo: product.article_no || 'CK-01',
      });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cart-updated'));
    showToast(`Added ${product.title} to Bag!`, 'success');
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedGender('All');
    setSelectedCategory('All');
    setInStockOnly(false);
    setSaleOnly(false);
    setPriceRange(30000);
    setSearchParams({});
  };

  const categoriesToDisplay = useMemo(() => {
    if (activeDepartment === 'Ladies') {
      return ['All', 'Ladies Wear', 'Luxury Formals', 'Pret / Ready-to-Wear', 'Unstitched Luxury'];
    } else if (activeDepartment === 'Kids') {
      return ['All', 'Girls', 'Frocks & Dresses'];
    }
    return ['All', 'Ladies Wear', 'Girls'];
  }, [activeDepartment]);

  return (
    <div style={{ backgroundColor: '#FAFAFA', minHeight: '100vh', paddingTop: '20px', paddingBottom: '60px' }}>
      <div className="container" style={{ maxWidth: '1380px', margin: '0 auto', padding: '0 1rem' }}>

        {/* BREADCRUMB & DYNAMIC LUXURY HEADER */}
        <div style={{
          marginBottom: '1.5rem',
          padding: '1.5rem 1.75rem',
          borderRadius: '16px',
          background: activeDepartment === 'Ladies'
            ? 'linear-gradient(135deg, #111827 0%, #1F2937 100%)'
            : activeDepartment === 'Kids'
              ? 'linear-gradient(135deg, #FFF5F5 0%, #FED7D7 100%)'
              : 'linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)',
          color: activeDepartment === 'Ladies' ? '#FFFFFF' : '#111827',
          border: '1px solid ' + (activeDepartment === 'Ladies' ? '#374151' : '#E5E7EB'),
          boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
        }}>
          <div style={{ fontSize: '0.8rem', color: activeDepartment === 'Ladies' ? '#9CA3AF' : '#6B7280', marginBottom: '6px' }}>
            <Link to="/" style={{ color: activeDepartment === 'Ladies' ? '#D1D5DB' : '#6B7280', textDecoration: 'none' }}>Home</Link> / <span style={{ color: activeDepartment === 'Ladies' ? '#F59E0B' : '#E52535', fontWeight: 600 }}>{activeDepartment === 'Ladies' ? 'Ladies Wear' : activeDepartment === 'Kids' ? 'Kids Wear' : 'All Collections'}</span>
          </div>
          <h1 style={{ fontSize: 'clamp(1.5rem, 5vw, 2.2rem)', fontWeight: 900, letterSpacing: '-0.02em', margin: 0, color: activeDepartment === 'Ladies' ? '#F59E0B' : '#111827' }}>
            {activeDepartment === 'Ladies' ? 'Candy Ladies Wear Collection' : activeDepartment === 'Kids' ? 'Candy Kids Collection' : 'Candy Store Catalog'}
          </h1>
          <div style={{ fontSize: '0.78rem', color: activeDepartment === 'Ladies' ? '#F59E0B' : '#E52535', fontWeight: 700, marginTop: '4px' }}>
            Engineered by Omnora-Ahmad Mahboob
          </div>
          <p style={{ color: activeDepartment === 'Ladies' ? '#D1D5DB' : '#4B5563', fontSize: '0.9rem', marginTop: '6px', maxWidth: '700px', lineHeight: 1.4 }}>
            {activeDepartment === 'Ladies'
              ? 'Bespoke hand-embroidered velvet suits, raw silk tunics, and designer ensembles crafted for elegance and comfort. Available at PKR 6,500.'
              : activeDepartment === 'Kids'
                ? 'Handcrafted premium frocks, kurtas, and traditional luxury wear for Girls and Kids.'
                : 'Explore our complete catalog of handcrafted ladies wear and kids couture.'}
          </p>
        </div>

        {/* MOBILE STICKY TOP BAR (SEARCH + FILTER BUTTON - VISIBLE ONLY ON MOBILE <1024px) */}
        <div className="mobile-top-bar" style={{ gap: '8px', marginBottom: '1.25rem', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 0 }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
            <input
              type="text"
              placeholder="Search by article, title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px 10px 36px',
                borderRadius: '8px',
                border: '1px solid #E5E7EB',
                backgroundColor: '#FFFFFF',
                fontSize: '0.82rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>
          <button
            onClick={() => setMobileFilterOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 14px',
              fontSize: '0.82rem',
              fontWeight: 700,
              backgroundColor: '#FFFFFF',
              border: '1px solid #D1D5DB',
              borderRadius: '8px',
              color: '#111827',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
            }}
          >
            <Filter size={15} style={{ color: '#E52535' }} /> Filters
          </button>
        </div>

        {/* MAIN LAYOUT: DESKTOP SIDEBAR + CATALOG GRID */}
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>

          {/* 1. DESKTOP STICKY SIDEBAR (STRICTLY HIDDEN ON MOBILE <1024px via CSS) */}
          <aside className="desktop-sidebar-aside">
            <DesktopFilterSidebar
              activeDepartment={activeDepartment}
              setActiveDepartment={(dept) => {
                setActiveDepartment(dept);
                navigate(dept === 'Ladies' ? '/collection/ladies' : dept === 'Kids' ? '/collection/kids' : '/collection');
              }}
              categories={categoriesToDisplay}
              selectedCategory={selectedCategory}
              setSelectedCategory={(cat) => {
                setSelectedCategory(cat);
                setSearchParams({ category: cat });
              }}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              inStockOnly={inStockOnly}
              setInStockOnly={setInStockOnly}
              onReset={resetFilters}
            />
          </aside>

          {/* 2. CATALOG PRODUCT GRID */}
          <section style={{ flex: 1, width: '100%', minWidth: 0 }}>
            {/* DESKTOP SEARCH HEADER (HIDDEN ON MOBILE TO ELIMINATE DUPLICATION) */}
            <div className="desktop-search-header" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid #F3F4F6' }}>
              <div style={{ position: 'relative', width: '380px', maxWidth: '100%' }}>
                <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                <input
                  type="text"
                  placeholder="Search products by title, article code, or fabric details..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px 10px 42px',
                    borderRadius: '10px',
                    border: '1px solid #E5E7EB',
                    backgroundColor: '#FFFFFF',
                    fontSize: '0.88rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <span style={{ fontSize: '0.82rem', color: '#6B7280', fontWeight: 600 }}>
                Showing {filteredProducts.length} In-Stock Items
              </span>
            </div>

            {/* SKELETON LOADERS DURING FETCH */}
            {loading ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '1.25rem' }}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonProductCard key={i} />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              /* ZERO EMPTY STATES HANDLING */
              <div style={{ textAlign: 'center', padding: '4rem 2rem', backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
                <div style={{ width: '56px', height: '56px', backgroundColor: '#FEF2F2', color: '#E52535', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                  <Filter size={24} />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#111827', marginBottom: '0.5rem' }}>No products found matching your filter criteria</h3>
                <p style={{ color: '#6B7280', fontSize: '0.88rem', marginBottom: '1.25rem' }}>Try relaxing your search terms or resetting price filters.</p>
                <button onClick={resetFilters} className="btn btn-primary" style={{ fontSize: '0.85rem' }}>
                  Reset Filters
                </button>
              </div>
            ) : (
              /* RESPONSIVE PRODUCT CARDS GRID */
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '1.25rem', width: '100%', minWidth: 0 }}>
                {filteredProducts.map((p) => {
                  const isOutOfStock = !p.in_stock || (p.stock_quantity !== undefined && p.stock_quantity <= 0);
                  const whatsappUrl = generateWhatsAppLink(p.article_no || '', p.title, p.retail_price);
                  return (
                    <div key={p.id} className="candy-product-card gpu-layer" style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '1rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <Link to={`/product/${p.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div className="card-img-wrapper aspect-3-4" style={{ position: 'relative', width: '100%', overflow: 'hidden', borderRadius: '8px', marginBottom: '0.75rem', aspectRatio: '3 / 4', backgroundColor: '#F3F4F6' }}>
                          <img
                            src={p.images?.[0] || 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=800&q=80'}
                            alt={p.title}
                            loading="lazy"
                            decoding="async"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />

                          {/* ARTICLE NO BADGE */}
                          <span style={{ position: 'absolute', bottom: '8px', left: '8px', backgroundColor: 'rgba(17, 24, 39, 0.85)', color: '#FFFFFF', fontSize: '0.68rem', fontWeight: 800, padding: '3px 8px', borderRadius: '4px', backdropFilter: 'blur(4px)', fontFamily: 'monospace' }}>
                            {p.article_no || 'CK-01'}
                          </span>

                          {/* STOCK STATUS BADGE */}
                          {isOutOfStock ? (
                            <span style={{ position: 'absolute', top: '8px', right: '8px', backgroundColor: '#EF4444', color: '#FFFFFF', fontSize: '0.68rem', fontWeight: 800, padding: '3px 8px', borderRadius: '4px' }}>
                              Out of Stock
                            </span>
                          ) : (
                            <span style={{ position: 'absolute', top: '8px', right: '8px', backgroundColor: '#10B981', color: '#FFFFFF', fontSize: '0.68rem', fontWeight: 800, padding: '3px 8px', borderRadius: '4px' }}>
                              In Stock
                            </span>
                          )}
                        </div>

                        <h3 className="card-title" style={{ fontSize: '0.95rem', fontWeight: 700, color: '#111827', margin: '0 0 4px 0', lineHeight: 1.3 }}>
                          {p.title}
                        </h3>
                        <p style={{ fontSize: '0.78rem', color: '#6B7280', margin: '0 0 8px 0' }}>
                          {p.fabric_type || p.category}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '0.85rem' }}>
                          <span className="card-price" style={{ fontSize: '1.1rem', fontWeight: 900, color: '#E52535' }}>
                            Rs. {p.retail_price.toLocaleString()}
                          </span>
                        </div>
                      </Link>

                      {/* CARD ACTION BUTTONS */}
                      <div style={{ display: 'flex', gap: '6px', marginTop: 'auto' }}>
                        <button
                          onClick={() => handleAddToCart(p)}
                          disabled={isOutOfStock}
                          style={{
                            flex: 1,
                            padding: '8px 10px',
                            borderRadius: '6px',
                            border: 'none',
                            backgroundColor: isOutOfStock ? '#9CA3AF' : '#E52535',
                            color: '#FFFFFF',
                            fontWeight: 700,
                            fontSize: '0.78rem',
                            cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px'
                          }}
                        >
                          <ShoppingBag size={14} /> {isOutOfStock ? 'Sold Out' : 'Add'}
                        </button>
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            padding: '8px 10px',
                            borderRadius: '6px',
                            border: 'none',
                            backgroundColor: '#0F9D58',
                            color: '#FFFFFF',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            textDecoration: 'none'
                          }}
                          title="WhatsApp Quick Order"
                        >
                          <MessageCircle size={14} />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>

      {/* 3. MOBILE SLIDE-OVER FILTER DRAWER MODAL (OPENED VIA MOBILE FILTERS BUTTON) */}
      <FilterDrawer
        isOpen={mobileFilterOpen}
        onClose={() => setMobileFilterOpen(false)}
        activeDepartment={activeDepartment}
        setActiveDepartment={(dept) => {
          setActiveDepartment(dept);
          navigate(dept === 'Ladies' ? '/collection/ladies' : dept === 'Kids' ? '/collection/kids' : '/collection');
        }}
        categories={categoriesToDisplay}
        selectedCategory={selectedCategory}
        setSelectedCategory={(cat) => {
          setSelectedCategory(cat);
          setSearchParams({ category: cat });
        }}
        priceRange={priceRange}
        setPriceRange={setPriceRange}
        inStockOnly={inStockOnly}
        setInStockOnly={setInStockOnly}
        onReset={resetFilters}
      />
    </div>
  );
}
