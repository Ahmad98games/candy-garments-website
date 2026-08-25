Import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag, MessageCircle, Truck, ShieldCheck, RefreshCw, PhoneCall } from 'lucide-react';
import { fetchProducts, Product, generateWhatsAppLink } from '../lib/supabase';
import { useToast } from '../context/ToastContext';
import Carousel from '../components/Carousel';
import './OmnoraFinal.css';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const { showToast } = useToast();

  useEffect(() => {
    async function loadArrivals() {
      const data = await fetchProducts({ in_stock_only: true });
      setProducts(data.slice(0, 8));
    }
    loadArrivals();

    const handleProductsUpdated = () => {
      loadArrivals();
    };

    window.addEventListener('products-updated', handleProductsUpdated);
    window.addEventListener('storage', handleProductsUpdated);
    return () => {
      window.removeEventListener('products-updated', handleProductsUpdated);
      window.removeEventListener('storage', handleProductsUpdated);
    };
  }, []);

  const handleAddToCart = (product: Product) => {
    const existing = JSON.parse(localStorage.getItem('cart') || '[]');
    const index = existing.findIndex((item: any) => item.id === product.id);
    if (index > -1) {
      existing[index].quantity += 1;
    } else {
      existing.push({
        id: product.id,
        name: product.title,
        price: product.retail_price,
        image: product.images?.[0] || 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=800&q=80',
        quantity: 1,
        articleNo: product.article_no || 'CK-01'
      });
    }
    localStorage.setItem('cart', JSON.stringify(existing));
    window.dispatchEvent(new Event('cart-updated'));
    showToast(`Added ${product.title} to Bag!`, 'success');
  };

  const instagramPosts = [
    { id: 1, img: 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=600&q=80' },
    { id: 2, img: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=600&q=80' },
    { id: 3, img: 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=600&q=80' },
    { id: 4, img: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80' },
    { id: 5, img: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=600&q=80' },
    { id: 6, img: 'https://images.unsplash.com/photo-1514090458221-65bb69cf63e6?auto=format&fit=crop&w=600&q=80' },
  ];

  return (
    <div className="home-magnum">

      {/* 1. HERO SHOWCASE SLIDER */}
      <section className="hero-magnum">
        <div className="hero-backdrop">
          <img
            src="https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=1600&q=80"
            alt="Candy Kids Collection"
            className="hero-backdrop-img"
          />
        </div>

        <div className="container hero-content">
          <span className="hero-badge">NEW SEASON EDIT • CANDY GARMENTS</span>
          <h1 className="hero-title">
            Luxury Fashion <br />
            For Girls & Kids Wear
          </h1>
          <div className="hero-slogan">
            "Change Your LifeStyle with Candy Kids"
          </div>
          <p className="hero-subtitle">
            Premium quality fabrics, elegant designs, and vibrant couture for Girls, Kids, and Ladies Wear. Handcrafted with care for every special occasion.
          </p>
          <div className="btn-group">
            <Link to="/collection" className="btn btn-primary" style={{ height: '48px', padding: '0 24px', fontSize: '0.95rem' }}>
              Shop Collection <ArrowRight size={18} />
            </Link>
            <Link to="/collection?new=true" className="btn btn-outline" style={{ height: '48px', padding: '0 24px', fontSize: '0.95rem' }}>
              New Arrivals
            </Link>
          </div>
        </div>
      </section>

      {/* --- CATEGORY QUICK ACCESS --- */}
      <section className="container section">
        <h2 className="section-title">Shop by Category</h2>
        <p className="section-subtitle">Explore handcrafted couture designed for comfort and elegance</p>

        <div className="category-grid">
          <Link to="/collection?category=Girls" className="category-card">
            <img
              src="https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=800&q=80"
              alt="Girls Collection"
              className="category-card-img"
            />
            <div className="category-card-overlay">
              <div className="category-card-title">Girls Collection</div>
              <div className="category-card-sub">Dresses, Frocks & Traditional Suits</div>
            </div>
          </Link>

          <Link to="/collection/ladies" className="category-card">
            <img
              src="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80"
              alt="Ladies Collection"
              className="category-card-img"
            />
            <div className="category-card-overlay">
              <div className="category-card-title">Ladies Collection</div>
              <div className="category-card-sub">Velvet Suits, Raw Silk & Chiffon Formals</div>
            </div>
          </Link>

          <Link to="/collection/kids" className="category-card">
            <img
              src="https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=800&q=80"
              alt="Girls & Kids Collection"
              className="category-card-img"
            />
            <div className="category-card-overlay">
              <div className="category-card-title">Girls & Kids Collection</div>
              <div className="category-card-sub">Pret, Traditional Suits & Festive Wear</div>
            </div>
          </Link>

          <Link to="/collection" className="category-card">
            <img
              src="https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=800&q=80"
              alt="All Collections"
              className="category-card-img"
            />
            <div className="category-card-overlay">
              <div className="category-card-title">All Collections</div>
              <div className="category-card-sub">View Complete Catalog</div>
            </div>
          </Link>
        </div>
      </section>

      {/* 3. FEATURED / TRENDING CAROUSEL */}
      <section className="section-pad" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="container">
          <div className="header-row">
            <div>
              <span className="section-badge">FEATURED EDITS</span>
              <h2 className="section-title">Trending Arrivals</h2>
            </div>
            <Link to="/collection" className="link-view-all" style={{ fontSize: '0.88rem', color: '#E52535' }}>
              View All Articles →
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
            {products.map((p) => {
              const primaryImg = p.images?.[0] || 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=800&q=80';
              const secondaryImg = p.images?.[1] || primaryImg;
              const originalPrice = Math.round(p.retail_price * 1.25);
              const discountPercent = 20;

              return (
                <div key={p.id} className="candy-product-card">
                  <div className="card-img-wrapper">
                    <img src={primaryImg} alt={p.title} className="card-primary-img" />
                    <img src={secondaryImg} alt={`${p.title} secondary`} className="card-secondary-img" />

                    <span style={{ position: 'absolute', top: '10px', left: '10px', backgroundColor: '#E52535', color: '#FFFFFF', fontSize: '0.72rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px' }}>
                      -{discountPercent}% OFF
                    </span>

                    {p.article_no && (
                      <span className="font-mono" style={{ position: 'absolute', bottom: '10px', left: '10px', backgroundColor: 'rgba(17, 24, 39, 0.85)', color: '#FFFFFF', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px' }}>
                        {p.article_no}
                      </span>
                    )}
                  </div>

                  <div style={{ padding: '1rem' }}>
                    <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#111827', margin: '0 0 4px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {p.title}
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: '#6B7280', margin: '0 0 10px 0' }}>{p.fabric_type || p.category}</p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                      <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#E52535' }}>
                        Rs. {p.retail_price.toLocaleString()}
                      </span>
                      <span style={{ fontSize: '0.82rem', color: '#9CA3AF', textDecoration: 'line-through' }}>
                        Rs. {originalPrice.toLocaleString()}
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <button onClick={() => handleAddToCart(p)} className="btn btn-outline" style={{ fontSize: '0.78rem', height: '38px', padding: '0 8px' }}>
                        <ShoppingBag size={14} /> Add to Bag
                      </button>
                      <a
                        href={generateWhatsAppLink(p.article_no || '', p.title, p.retail_price)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-whatsapp"
                        style={{ fontSize: '0.78rem', height: '38px', padding: '0 8px' }}
                      >
                        <MessageCircle size={14} /> WhatsApp
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. INSTAGRAM VISUAL FEED (6-column square grid) */}
      <section className="section-pad container">
        <div className="header-row" style={{ alignItems: 'center' }}>
          <div>
            <span className="section-badge">SOCIAL GALLERY</span>
            <h2 className="section-title">Follow Us @candy_kids_garments</h2>
          </div>
          <a
            href="https://www.instagram.com/candy_kids_garments?igsh=ZjM0MG5nazlqZXk3"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline"
            style={{ fontSize: '0.85rem' }}
          >
            Visit Instagram Profile →
          </a>
        </div>

        <div className="instagram-grid-6col">
          {instagramPosts.map((post) => (
            <a
              key={post.id}
              href="https://www.instagram.com/candy_kids_garments?igsh=ZjM0MG5nazlqZXk3"
              target="_blank"
              rel="noopener noreferrer"
              className="insta-item"
            >
              <img src={post.img} alt={`Candy Kids Instagram ${post.id}`} className="insta-img" />
              <div className="insta-overlay">
                <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>View Post</span>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* 5. TRUST BADGES (4 Clean Columns) */}
      <section className="section-pad container" style={{ paddingTop: '0' }}>
        <div className="trust-badges-grid">
          <div className="trust-badge-card">
            <div className="trust-badge-icon">
              <Truck size={24} />
            </div>
            <div>
              <div className="trust-badge-title">Nationwide Shipping</div>
              <div className="trust-badge-desc">Fast delivery across Pakistan</div>
            </div>
          </div>

          <div className="trust-badge-card">
            <div className="trust-badge-icon">
              <ShieldCheck size={24} />
            </div>
            <div>
              <div className="trust-badge-title">Premium Fabric</div>
              <div className="trust-badge-desc">100% skin-safe & durable</div>
            </div>
          </div>

          <div className="trust-badge-card">
            <div className="trust-badge-icon">
              <RefreshCw size={24} />
            </div>
            <div>
              <div className="trust-badge-title">Easy Exchanges</div>
              <div className="trust-badge-desc">7-day hassle-free exchange</div>
            </div>
          </div>

          <div className="trust-badge-card">
            <div className="trust-badge-icon">
              <PhoneCall size={24} />
            </div>
            <div>
              <div className="trust-badge-title">24/7 Helpline</div>
              <div className="trust-badge-desc">WhatsApp: 0331-1498773</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
