import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    ShoppingCart, User, LogOut, Menu, X, Search, Heart,
    LayoutDashboard, Home as HomeIcon, Grid, MessageSquare, Phone
} from 'lucide-react';
import './OmnoraLayout.css';
import Footer from './Footer';

interface CartItem {
    quantity: number;
}

export default function Layout() {
    const [cartCount, setCartCount] = useState(0);
    const [wishlistCount, setWishlistCount] = useState(0);
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const { user, logout, isAdmin, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // 1. SCROLL PHYSICS
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 40) setScrolled(true);
            else setScrolled(false);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // 2. SCROLL LOCK WHEN MOBILE OVERLAY IS OPEN
    useEffect(() => {
        document.body.style.overflow = menuOpen ? 'hidden' : 'unset';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [menuOpen]);

    // 3. CART & WISHLIST COUNTER SYNC SYSTEM
    const updateCounts = useCallback(() => {
        try {
            const cart: CartItem[] = JSON.parse(localStorage.getItem('cart') || '[]');
            const totalCart = cart.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
            setCartCount(totalCart);

            const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
            setWishlistCount(Array.isArray(wishlist) ? wishlist.length : 0);
        } catch (error) {
            setCartCount(0);
            setWishlistCount(0);
        }
    }, []);

    useEffect(() => {
        updateCounts();
        window.addEventListener('cart-updated', updateCounts);
        window.addEventListener('wishlist-updated', updateCounts);
        window.addEventListener('storage', updateCounts);
        return () => {
            window.removeEventListener('cart-updated', updateCounts);
            window.removeEventListener('wishlist-updated', updateCounts);
            window.removeEventListener('storage', updateCounts);
        };
    }, [updateCounts]);

    // 4. NAVIGATION HANDLERS
    const handleNavAction = () => setMenuOpen(false);

    const handleSearch = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && searchQuery.trim()) {
            navigate(`/collection?q=${encodeURIComponent(searchQuery)}`);
            setSearchQuery('');
            setMenuOpen(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        handleNavAction();
        navigate('/');
    };

    const isActive = (path: string) => location.pathname === path ? 'active' : '';

    const whatsappDirectLink = "https://wa.me/923311498773?text=" + encodeURIComponent("Assalamu Alaikum Candy Kids! I have an inquiry.");

    // 5. DISMISSIBLE MOBILE BOTTOM DOCK
    const [showMobileDock, setShowMobileDock] = useState<boolean>(() => {
        return localStorage.getItem('candy_hide_mobile_dock') !== 'true';
    });

    return (
        <div className="layout">
            {/* === 1. TOP ANNOUNCEMENT BAR === */}
            <div className="top-announcement-bar">
                <div className="announcement-text">
                    <span>✨ Free Delivery on Orders Above Rs. 3,000 | Helpline: </span>
                    <a href="tel:03311498773">0331-1498773</a>
                    <span> / </span>
                    <a href="tel:03341495788">0334-1495788</a>
                </div>

                <div className="top-social-links">
                    <a
                        href="https://www.facebook.com/share/1DJSvC3piZ/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="top-social-link"
                        title="Facebook"
                    >
                        <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                    </a>
                    <a
                        href="https://www.instagram.com/candy_kids_garments?igsh=ZjM0MG5nazlqZXk3"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="top-social-link"
                        title="Instagram"
                    >
                        <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                        </svg>
                    </a>
                </div>
            </div>

            {/* === 2. GLASSMORPHISM MAIN HEADER === */}
            <header className={`candy-header ${scrolled ? 'scrolled' : ''}`}>
                <div className="header-container">

                    {/* BRAND IDENTITY LOGO */}
                    <Link to="/" className="logo" onClick={handleNavAction}>
                        <img src="/images/candy.jpg" alt="Candy Kids Logo" style={{ height: '42px', width: 'auto', borderRadius: '6px', objectFit: 'cover', border: '1px solid #E5E7EB' }} />
                        <div className="logo-text-wrapper">
                            <span className="logo-text">CANDY KIDS</span>
                            <span className="logo-subtext">CANDY GARMENTS</span>
                        </div>
                    </Link>

                    {/* DESKTOP NAVIGATION LINKS */}
                    <nav className="nav-desktop">
                        <Link to="/" className={`nav-link ${isActive('/')}`}>New In</Link>
                        <Link to="/collection/ladies" className={`nav-link ${location.pathname.includes('/ladies') ? 'active' : ''}`}>Ladies Wear</Link>
                        <Link to="/collection/kids" className={`nav-link ${location.pathname.includes('/kids') ? 'active' : ''}`}>Kids Wear</Link>
                        <Link to="/collection" className={`nav-link ${isActive('/collection') && !location.search.includes('sale=true') ? 'active' : ''}`}>All Collections</Link>
                        <Link to="/collection?sale=true" className={`nav-link sale-link ${location.search.includes('sale=true') ? 'active' : ''}`}>Sale</Link>
                    </nav>

                    {/* ACTIONS TERMINAL */}
                    <div className="nav-actions">

                        {/* Search Bar */}
                        <div className="search-terminal">
                            <Search size={15} className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search products..."
                                className="search-input"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={handleSearch}
                            />
                        </div>

                        {/* Wishlist Icon */}
                        <Link to="/wishlist" className="action-btn" title="Wishlist">
                            <Heart size={20} />
                            {wishlistCount > 0 && <span className="cart-badge" style={{ backgroundColor: '#1A73E8' }}>{wishlistCount}</span>}
                        </Link>

                        {/* User Auth */}
                        {!authLoading && user ? (
                            <>
                                {isAdmin && (
                                    <Link to="/admin" className="action-btn" title="Admin Dashboard">
                                        <LayoutDashboard size={20} />
                                    </Link>
                                )}
                                <Link to="/profile" className="action-btn" title="Profile">
                                    <User size={20} />
                                </Link>
                                <button onClick={handleLogout} className="action-btn" title="Logout">
                                    <LogOut size={20} />
                                </button>
                            </>
                        ) : !authLoading ? (
                            <Link to="/login" className="action-btn" title="Login">
                                <User size={20} />
                            </Link>
                        ) : null}

                        {/* Cart */}
                        <Link to="/cart" className="action-btn cart-btn" title="Shopping Bag">
                            <ShoppingCart size={20} />
                            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                        </Link>

                        {/* Mobile Menu Toggle */}
                        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
                            {menuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </header>

            {/* === 3. MOBILE OVERLAY MENU === */}
            <div className={`mobile-overlay ${menuOpen ? 'open' : ''}`}>
                <nav className="mobile-nav">
                    <Link to="/" className="mobile-link" onClick={handleNavAction}>New In</Link>
                    <Link to="/collection/ladies" className="mobile-link" onClick={handleNavAction}>Ladies Wear Collection</Link>
                    <Link to="/collection/kids" className="mobile-link" onClick={handleNavAction}>Girls & Kids Collection</Link>
                    <Link to="/collection" className="mobile-link" onClick={handleNavAction}>All Collections</Link>
                    <Link to="/collection?sale=true" className="mobile-link" style={{ color: '#E52535', fontWeight: 700 }} onClick={handleNavAction}>🔥 Sale & Promotions</Link>
                    <Link to="/about" className="mobile-link" onClick={handleNavAction}>About Candy Kids</Link>
                    <Link to="/contact" className="mobile-link" onClick={handleNavAction}>Contact & Support</Link>

                    <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <a href="tel:03311498773" className="btn btn-outline" style={{ justifyContent: 'flex-start' }}>
                            <Phone size={16} /> Helpline 1: 0331-1498773
                        </a>
                        <a href="tel:03341495788" className="btn btn-outline" style={{ justifyContent: 'flex-start' }}>
                            <Phone size={16} /> Helpline 2: 0334-1495788
                        </a>
                        <a href={whatsappDirectLink} className="btn btn-whatsapp" style={{ justifyContent: 'center' }}>
                            <MessageSquare size={16} /> WhatsApp Direct Order
                        </a>
                    </div>
                </nav>
            </div>

            {/* === 4. SYSTEM MAIN CONTENT === */}
            <main className="main-content" style={{ paddingBottom: showMobileDock ? '64px' : '0' }}>
                <Outlet />
            </main>

            {/* === 5. OPTIONAL & DISMISSIBLE MOBILE BOTTOM APP DOCK === */}
            {showMobileDock && (
                <div className="mobile-bottom-dock">
                    <Link to="/" className={`dock-item ${isActive('/')}`}>
                        <HomeIcon size={20} />
                        <span>Home</span>
                    </Link>
                    <Link to="/collection" className={`dock-item ${isActive('/collection')}`}>
                        <Grid size={20} />
                        <span>Categories</span>
                    </Link>
                    <Link to="/cart" className={`dock-item ${isActive('/cart')}`}>
                        <ShoppingCart size={20} />
                        <span>Bag ({cartCount})</span>
                    </Link>
                    <a href={whatsappDirectLink} className="dock-item whatsapp-dock" target="_blank" rel="noopener noreferrer">
                        <MessageSquare size={20} />
                        <span>WhatsApp</span>
                    </a>
                    <button 
                        className="dock-dismiss-btn"
                        onClick={() => {
                            setShowMobileDock(false);
                            localStorage.setItem('candy_hide_mobile_dock', 'true');
                        }}
                        title="Dismiss bottom bar"
                    >
                        <X size={14} />
                    </button>
                </div>
            )}

            {/* === 6. SYSTEM FOOTER === */}
            <Footer />
        </div>
    );
}