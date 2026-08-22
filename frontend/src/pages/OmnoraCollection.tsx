import { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { fetchProducts, Product, generateWhatsAppLink } from '../lib/supabase';
import { formatCurrencyPKR } from '../utils/currencyEngine';
import { useToast } from '../context/ToastContext';
import { ShoppingBag, Search, Filter, MessageCircle, X, ChevronDown } from 'lucide-react';
import SkeletonProductCard from '../components/SkeletonProductCard';
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
      <div className="container">

        {/* TOP DEPARTMENT COLLECTION SWITCHER */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '1.5rem', borderBottom: '2px solid #E5E7EB', paddingBottom: '12px' }}>
          <button
            onClick={() => {
              setActiveDepartment('Ladies');
              navigate('/collection/ladies');
            }}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.95rem',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: activeDepartment === 'Ladies' ? '#111827' : '#F3F4F6',
              color: activeDepartment === 'Ladies' ? '#F59E0B' : '#4B5563',
              boxShadow: activeDepartment === 'Ladies' ? '0 4px 12px rgba(17, 24, 39, 0.15)' : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            ✨ Ladies Wear Collection
          </button>
          <button
            onClick={() => {
              setActiveDepartment('Kids');
              navigate('/collection/kids');
            }}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.95rem',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: activeDepartment === 'Kids' ? '#E52535' : '#F3F4F6',
              color: activeDepartment === 'Kids' ? '#FFFFFF' : '#4B5563',
              boxShadow: activeDepartment === 'Kids' ? '0 4px 12px rgba(229, 37, 53, 0.2)' : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            👑 Kids Wear Collection
          </button>
          <button
            onClick={() => {
              setActiveDepartment('All');
              navigate('/collection');
            }}
            style={{
              padding: '10px 16px',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.9rem',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: activeDepartment === 'All' ? '#374151' : '#F3F4F6',
              color: activeDepartment === 'All' ? '#FFFFFF' : '#6B7280',
              transition: 'all 0.2s ease',
            }}
          >
            All Items
          </button>
        </div>

        {/* BREADCRUMB & DYNAMIC LUXURY HEADER */}
        <div style={{
          marginBottom: '1.75rem',
          padding: '1.75rem 2rem',
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
          <h1 style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.02em', margin: 0, color: activeDepartment === 'Ladies' ? '#F59E0B' : '#111827' }}>
            {activeDepartment === 'Ladies' ? 'Candy Ladies Wear Collection' : activeDepartment === 'Kids' ? 'Candy Kids Collection' : 'Candy Store Catalog'}
          </h1>
          <div style={{ fontSize: '0.8rem', color: activeDepartment === 'Ladies' ? '#F59E0B' : '#E52535', fontWeight: 700, marginTop: '4px' }}>
            Engineered by Omnora-Ahmad Mahboob
          </div>
          <p style={{ color: activeDepartment === 'Ladies' ? '#D1D5DB' : '#4B5563', fontSize: '0.95rem', marginTop: '6px', maxWidth: '700px' }}>
            {activeDepartment === 'Ladies'
              ? 'Bespoke hand-embroidered velvet suits, raw silk tunics, and designer ensembles crafted for elegance and comfort. Available at PKR 6,500.'
              : activeDepartment === 'Kids'
                ? 'Handcrafted premium frocks, kurtas, and traditional luxury wear for Girls and Kids.'
                : 'Explore our complete catalog of handcrafted ladies wear and kids couture.'}
          </p>
        </div>

        {/* MOBILE FILTER TRIGGER BAR */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '1.5rem', flexWrap: 'wrap' }} className="lg:hidden">
          <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
            <input
              type="text"
              placeholder="Search by article, title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px 10px 38px',
                borderRadius: '8px',
                border: '1px solid #E5E7EB',
                backgroundColor: '#FFFFFF',
                fontSize: '0.85rem',
                outline: 'none'
              }}
            />
          </div>
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="btn btn-outline"
            style={{ height: '40px', padding: '0 14px', fontSize: '0.85rem' }}
          >
            <Filter size={16} /> Filters
          </button>
        </div>

        {/* MAIN LAYOUT: STICKY DESKTOP SIDEBAR + CATALOG GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '2rem' }} className="catalog-layout-grid">

          {/* DESKTOP STICKY SIDEBAR FILTERS */}
          <aside style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '1.25rem', height: 'fit-content', position: 'sticky', top: '90px' }} className="desktop-sidebar-filters">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #F3F4F6', paddingBottom: '0.75rem' }}>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#111827', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Filter size={16} className="text-brand" /> Filter Products
              </div>
              <button onClick={resetFilters} style={{ background: 'none', border: 'none', color: '#E52535', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>
                Reset All
              </button>
            </div>

            {/* CATEGORY SELECTOR */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#111827', display: 'block', marginBottom: '6px' }}>
                {activeDepartment === 'Ladies' ? 'Ladies Wear Categories' : activeDepartment === 'Kids' ? 'Kids Wear Categories' : 'Categories'}
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {categoriesToDisplay.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => { setSelectedCategory(cat); setSearchParams({ category: cat }); }}
                    style={{
                      textAlign: 'left',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid',
                      borderColor: selectedCategory === cat ? (activeDepartment === 'Ladies' ? '#F59E0B' : '#E52535') : '#E5E7EB',
                      backgroundColor: selectedCategory === cat ? (activeDepartment === 'Ladies' ? '#FEF3C7' : '#FEF2F2') : '#FFFFFF',
                      color: selectedCategory === cat ? (activeDepartment === 'Ladies' ? '#B45309' : '#E52535') : '#374151',
                      fontWeight: selectedCategory === cat ? 700 : 500,
                      fontSize: '0.82rem',
                      cursor: 'pointer'
                    }}
                  >
                    {cat === 'All' ? 'All Items' : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* PRICE RANGE */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, color: '#111827', marginBottom: '6px' }}>
                <span>Max Price:</span>
                <span style={{ color: '#E52535' }}>Rs. {priceRange.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="1000"
                max="50000"
                step="1000"
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#E52535' }}
              />
            </div>

            {/* IN STOCK ONLY TOGGLE */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '0.5rem', borderTop: '1px solid #F3F4F6' }}>
              <input
                type="checkbox"
                id="inStockCheck"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: '#0F9D58' }}
              />
              <label htmlFor="inStockCheck" style={{ fontSize: '0.82rem', color: '#374151', fontWeight: 600, cursor: 'pointer' }}>
                In-Stock Only
              </label>
            </div>
          </aside>

          {/* CATALOG PRODUCT GRID */}
          <main>
            {/* DESKTOP SEARCH BAR */}
            <div style={{ position: 'relative', marginBottom: '1.25rem' }} className="desktop-search-wrapper">
              <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
              <input
                type="text"
                placeholder="Search products by title, article code, or fabric details..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 42px',
                  borderRadius: '10px',
                  border: '1px solid #E5E7EB',
                  backgroundColor: '#FFFFFF',
                  fontSize: '0.88rem',
                  outline: 'none'
                }}
              />
            </div>

            {/* SKELETON LOADERS DURING FETCH */}
            {loading ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.25rem' }}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonProductCard key={i} />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              /* ZERO EMPTY STATES HANDLING */
              <div style={{ textAlign: 'center', padding: '4rem 2rem', backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
                <div style={{ width: '56px', height: '56px', backgroundColor: '#FEF2F2', color: '#E52535', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyCenter: 'center', margin: '0 auto 1rem auto' }}>
                  <Filter size={24} />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#111827', marginBottom: '0.5rem' }}>No products found matching your filter criteria</h3>
                <p style={{ color: '#6B7280', fontSize: '0.88rem', marginBottom: '1.25rem' }}>Try relaxing your search terms or resetting price filters.</p>
                <button onClick={resetFilters} className="btn btn-primary" style={{ fontSize: '0.85rem' }}>
                  Reset Filters
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '1.25rem' }}>
                {filteredProducts.map((p) => (
                  <div key={p.id} className="candy-product-card gpu-layer">
                    <Link to={`/product/${p.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <div className="card-img-wrapper aspect-3-4" style={{ position: 'relative', width: '100%', overflow: 'hidden' }}>
                        <img
                          src={p.images?.[0] || 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=800&q=80'}
                          alt={p.title}
                          loading="lazy"
                          decoding="async"
                          className="card-primary-img aspect-3-4"
                        />
                        <img
                          src={p.images?.[1] || p.images?.[0] || 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=800&q=80'}
                          alt={`${p.title} alternate`}
                          loading="lazy"
                          decoding="async"
                          className="card-secondary-img aspect-3-4"
                        />

                        {p.in_stock ? (
                          <span style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: '#0F9D58', color: '#FFFFFF', fontSize: '0.68rem', fontWeight: 700, padding: '3px 8px', borderRadius: '4px' }}>
                            In Stock
                          </span>
                        ) : (
                          <span style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: '#9CA3AF', color: '#FFFFFF', fontSize: '0.68rem', fontWeight: 700, padding: '3px 8px', borderRadius: '4px' }}>
                            Out of Stock
                          </span>
                        )}

                        {p.article_no && (
                          <span className="font-mono" style={{ position: 'absolute', bottom: '10px', left: '10px', backgroundColor: 'rgba(17, 24, 39, 0.85)', color: '#FFFFFF', fontSize: '0.68rem', padding: '3px 8px', borderRadius: '4px' }}>
                            {p.article_no}
                          </span>
                        )}
                      </div>

                      <div style={{ padding: '0.85rem' }}>
                        <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#111827', margin: '0 0 4px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {p.title}
                        </h3>
                        <p style={{ fontSize: '0.78rem', color: '#6B7280', margin: '0 0 8px 0' }}>{p.fabric_type || p.category}</p>

                        <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#E52535', marginBottom: '10px' }}>
                          {formatCurrencyPKR(p.retail_price)}
                        </div>
                      </div>
                    </Link>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '0 0.85rem 0.85rem 0.85rem' }}>
                      <button onClick={() => handleAddToCart(p)} className="btn btn-outline touch-target-48" style={{ fontSize: '0.78rem', minHeight: '44px', padding: '0 8px' }}>
                        <ShoppingBag size={15} /> Add
                      </button>
                      <a
                        href={generateWhatsAppLink(p.article_no || '', p.title, p.retail_price)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-whatsapp touch-target-48"
                        style={{ fontSize: '0.78rem', minHeight: '44px', padding: '0 8px' }}
                      >
                        <MessageCircle size={15} /> WhatsApp
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>

        {/* MOBILE SLIDE-UP BOTTOM SHEET FILTERS */}
        {mobileFilterOpen && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 9999, display: 'flex', alignItems: 'flex-end' }}>
            <div style={{ width: '100%', backgroundColor: '#FFFFFF', borderTopLeftRadius: '20px', borderTopRightRadius: '20px', padding: '1.5rem', maxHeight: '85vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #E5E7EB', paddingBottom: '0.75rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Filter Products</h3>
                <button onClick={() => setMobileFilterOpen(false)} style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Select Gender / Category</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    {['All', 'Girls', 'Kids Wear'].map((g) => (
                      <button
                        key={g}
                        onClick={() => setSelectedGender(g)}
                        style={{
                          padding: '10px',
                          borderRadius: '8px',
                          border: '1px solid',
                          borderColor: selectedGender === g ? '#E52535' : '#E5E7EB',
                          backgroundColor: selectedGender === g ? '#FEF2F2' : '#FFFFFF',
                          color: selectedGender === g ? '#E52535' : '#374151',
                          fontWeight: 700,
                          fontSize: '0.85rem'
                        }}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                    <span>Max Price:</span>
                    <span style={{ color: '#E52535' }}>Rs. {priceRange.toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min="1000"
                    max="50000"
                    step="1000"
                    value={priceRange}
                    onChange={(e) => setPriceRange(Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#E52535' }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    id="mobileInStock"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: '#0F9D58' }}
                  />
                  <label htmlFor="mobileInStock" style={{ fontSize: '0.88rem', fontWeight: 600 }}>
                    In-Stock Only
                  </label>
                </div>

                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="btn btn-primary"
                  style={{ width: '100%', height: '44px', marginTop: '1rem' }}
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
