import React, { useState, useEffect } from 'react';

import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag, MessageCircle, Truck, ShieldCheck, RefreshCw, PhoneCall, ChevronDown, Instagram } from 'lucide-react';
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
    const title = (product.title && !product.title.toLowerCase().includes('testing')) 
      ? product.title 
      : 'Velvet Embroidered Angrakha Set';
    const existing = JSON.parse(localStorage.getItem('cart') || '[]');
    const index = existing.findIndex((item: any) => item.id === product.id);
    if (index > -1) {
      existing[index].quantity += 1;
    } else {
      existing.push({
        id: product.id,
        name: title,
        price: product.retail_price,
        image: product.images?.[0] || 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=800&q=80',
        quantity: 1,
        articleNo: product.article_no || 'OMN-L-553'
      });
    }
    localStorage.setItem('cart', JSON.stringify(existing));
    window.dispatchEvent(new Event('cart-updated'));
    showToast(`Added ${title} to Bag!`, 'success');
  };

  const instagramPosts = [
    { id: 1, img: 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=600&q=80' },
    { id: 2, img: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=600&q=80' },
    { id: 3, img: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=600&q=80' },
    { id: 4, img: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80' },
    { id: 5, img: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=600&q=80' },
    { id: 6, img: 'https://images.unsplash.com/photo-1514090458221-65bb69cf63e6?auto=format&fit=crop&w=600&q=80' },
  ];

  return (
    <div className="home-magnum">

      {/* 1. EDITORIAL MAGAZINE HERO SECTION */}
      <section className="hero-magnum">
        <div className="hero-backdrop">
          <img
            src="https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=1600&q=80"
            alt="Candy Kids Editorial Collection"
            className="hero-backdrop-img"
          />
          <div className="hero-gradient-overlay"></div>
        </div>

        <div className="container hero-content">
          <span className="hero-eyebrow">AUTUMN / WINTER 2026 EDIT</span>
          <h1 className="hero-title font-serif">
            Handcrafted Luxury for <br />
            Girls & Festive Wear
          </h1>
          <p className="hero-subtitle">
            Curated pret, embroidered velvet ensembles, and festive couture handcrafted with fine artisans. Designed for timeless sophistication.
          </p>
          <div className="btn-group">
            <Link to="/collection" className="btn btn-hero-primary">
              Explore Collection →
            </Link>
            <Link to="/collection?category=Girls" className="btn btn-hero-secondary">
              View Catalog
            </Link>
          </div>
        </div>

        {/* SUBTLE SCROLL CUE */}
        <div className="hero-scroll-cue">
          <span className="scroll-label font-mono">SCROLL</span>
          <ChevronDown size={14} strokeWidth={1.5} className="scroll-chevron" />
        </div>
      </section>

      {/* 2. SHOP BY CATEGORY SECTION (WARM IVORY CANVAS BACKDROP) */}
      <section className="section-category-luxury">
        <div className="container">
          <div className="category-header-center">
            <span className="section-eyebrow-gold">COUTURE SELECTIONS</span>
            <h2 className="section-title-white font-serif">Shop by Category</h2>
            <p className="section-subtitle-muted">Explore handcrafted silhouettes designed for comfort, luxury, and festive elegance</p>
          </div>

          <div className="category-grid-luxury">
            <Link to="/collection?category=Girls" className="category-card-luxury group">
              <div className="category-img-wrapper">
                <img
                  src="https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=800&q=80"
                  alt="Girls Couture Collection"
                  className="category-img-zoom"
                />
                <div className="category-chip-label">
                  <span className="category-tag-gold">FESTIVE FORMALS</span>
                  <h3 className="category-name font-serif">Girls Collection</h3>
                </div>
              </div>
              <div className="category-card-footer">
                <span className="category-explore-link">
                  Explore Category <ArrowRight size={14} strokeWidth={1.5} />
                </span>
              </div>
            </Link>

            <Link to="/collection/ladies" className="category-card-luxury group">
              <div className="category-img-wrapper">
                <img
                  src="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80"
                  alt="Ladies Velvet Wear"
                  className="category-img-zoom"
                />
                <div className="category-chip-label">
                  <span className="category-tag-gold">LUXURY PRET</span>
                  <h3 className="category-name font-serif">Ladies Collection</h3>
                </div>
              </div>
              <div className="category-card-footer">
                <span className="category-explore-link">
                  Explore Category <ArrowRight size={14} strokeWidth={1.5} />
                </span>
              </div>
            </Link>

            <Link to="/collection/kids" className="category-card-luxury group">
              <div className="category-img-wrapper">
                <img
                  src="https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=800&q=80"
                  alt="Girls & Kids Festive"
                  className="category-img-zoom"
                />
                <div className="category-chip-label">
                  <span className="category-tag-gold">NEW ARRIVALS</span>
                  <h3 className="category-name font-serif">Girls & Kids Wear</h3>
                </div>
              </div>
              <div className="category-card-footer">
                <span className="category-explore-link">
                  Explore Category <ArrowRight size={14} strokeWidth={1.5} />
                </span>
              </div>
            </Link>

            <Link to="/collection" className="category-card-luxury group">
              <div className="category-img-wrapper">
                <img
                  src="https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=800&q=80"
                  alt="Complete Catalog"
                  className="category-img-zoom"
                />
                <div className="category-chip-label">
                  <span className="category-tag-gold">FULL EDITIONS</span>
                  <h3 className="category-name font-serif">All Collections</h3>
                </div>
              </div>
              <div className="category-card-footer">
                <span className="category-explore-link">
                  Explore All <ArrowRight size={14} strokeWidth={1.5} />
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* 3. TRENDING ARRIVALS PRODUCT GRID */}
      <section className="section-pad-luxury bg-cream">
        <div className="container">
          <div className="header-row-luxury">
            <div>
              <span className="section-eyebrow-amber">THE CURATED EDIT</span>
              <h2 className="section-title-dark font-serif">Trending Arrivals</h2>
            </div>
            <Link to="/collection" className="link-view-all-luxury">
              View All ({products.length > 0 ? products.length : 12}) <ArrowRight size={14} strokeWidth={1.5} />
            </Link>
          </div>

          <div className="product-grid-editorial">
            {products.map((p) => {
              const primaryImg = p.images?.[0] || 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=800&q=80';
              const secondaryImg = p.images?.[1] || primaryImg;
              const originalPrice = Math.round(p.retail_price * 1.25);
              const discountPercent = 20;
              const displayTitle = (p.title && !p.title.toLowerCase().includes('testing')) 
                ? p.title 
                : 'Velvet Embroidered Angrakha Set';
              const displayArticleNo = p.article_no || 'OMN-L-553';

              return (
                <div key={p.id} className="luxury-product-card group">
                  <div className="card-img-container">
                    <img src={primaryImg} alt={displayTitle} className="card-img-primary" />
                    <img src={secondaryImg} alt={`${displayTitle} detail`} className="card-img-secondary" />

                    {/* Floating Brand-Red Discount Badge (Top-Left 12px inset) */}
                    <span className="badge-discount-red font-sans">
                      -{discountPercent}% OFF
                    </span>

                    {/* Quick WhatsApp Inquiry Floating Icon */}
                    <a
                      href={generateWhatsAppLink(displayArticleNo, displayTitle, p.retail_price)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-quick-whatsapp"
                      title="Quick Inquiry on WhatsApp"
                    >
                      <MessageCircle size={15} strokeWidth={1.5} />
                    </a>
                  </div>

                  <div className="card-content-editorial">
                    <div>
                      <h3 className="product-title-editorial">
                        {displayTitle}
                      </h3>
                      <div className="product-meta-row">
                        <span className="product-fabric-tag">{p.fabric_type || p.category || 'Pure Velvet Couture'}</span>
                        <span className="product-sku-caption font-mono">SKU: {displayArticleNo}</span>
                      </div>
                    </div>

                    <div>
                      <div className="price-row-editorial">
                        <span className="price-sale-ink font-semibold">
                          Rs. {p.retail_price.toLocaleString()}
                        </span>
                        <span className="price-original-gray font-sans">
                          Rs. {originalPrice.toLocaleString()}
                        </span>
                      </div>

                      {/* Single Full-Width Primary Action */}
                      <button onClick={() => handleAddToCart(p)} className="btn-add-to-bag-full">
                        <ShoppingBag size={14} strokeWidth={1.5} /> Add to Bag
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. INSTAGRAM VISUAL GALLERY (DEEP CHARCOAL BACKDROP) */}
      <section className="section-social-luxury">
        <div className="container">
          <div className="header-row-luxury" style={{ alignItems: 'center', marginBottom: '2.5rem' }}>
            <div>
              <span className="section-eyebrow-gold">INSTAGRAM JOURNAL</span>
              <h2 className="section-title-white font-serif">Follow Us @candy_kids_garments</h2>
            </div>
            <a
              href="https://www.instagram.com/candy_kids_garments?igsh=ZjM0MG5nazlqZXk3"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-instagram-outline"
            >
              Visit Instagram Profile <ArrowRight size={14} strokeWidth={1.5} />
            </a>
          </div>

          <div className="instagram-grid-luxury">
            {instagramPosts.map((post) => (
              <a
                key={post.id}
                href="https://www.instagram.com/candy_kids_garments?igsh=ZjM0MG5nazlqZXk3"
                target="_blank"
                rel="noopener noreferrer"
                className="insta-card-luxury group"
              >
                <img src={post.img} alt={`Candy Kids Journal ${post.id}`} className="insta-img-luxury" />
                <div className="insta-overlay-luxury">
                  <Instagram size={20} strokeWidth={1.5} className="insta-icon-fade" />
                  <span className="insta-overlay-text font-serif">View Post</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* 5. VALUE PROPOSITIONS STRIP (BORDER DIVIDER STRIP) */}
      <section className="value-strip-luxury">
        <div className="container">
          <div className="value-grid-4col">
            <div className="value-item-luxury">
              <div className="value-icon-box">
                <Truck size={22} strokeWidth={1.5} />
              </div>
              <div className="value-text-wrapper">
                <div className="value-item-title font-semibold">Nationwide Express Delivery</div>
                <div className="value-item-desc">Complimentary shipping on orders over Rs. 3,000</div>
              </div>
            </div>

            <div className="value-item-luxury">
              <div className="value-icon-box">
                <ShieldCheck size={22} strokeWidth={1.5} />
              </div>
              <div className="value-text-wrapper">
                <div className="value-item-title font-semibold">100% Pure Fabric Guarantee</div>
                <div className="value-item-desc">Premium skin-safe weave & handcrafted embroidery</div>
              </div>
            </div>

            <div className="value-item-luxury">
              <div className="value-icon-box">
                <RefreshCw size={22} strokeWidth={1.5} />
              </div>
              <div className="value-text-wrapper">
                <div className="value-item-title font-semibold">7-Day Hassle-Free Exchange</div>
                <div className="value-item-desc">Seamless size exchanges & store credit support</div>
              </div>
            </div>

            <div className="value-item-luxury">
              <div className="value-icon-box">
                <PhoneCall size={22} strokeWidth={1.5} />
              </div>
              <div className="value-text-wrapper">
                <div className="value-item-title font-semibold">Dedicated Concierge Support</div>
                <div className="value-item-desc">Personalized assistance via WhatsApp 0331-1498773</div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
