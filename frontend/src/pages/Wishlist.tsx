import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { Heart, ShoppingBag, X, ArrowRight, Loader2 } from 'lucide-react';
import SmartImage from '../components/SmartImage';
import { FALLBACK_IMAGE } from '../constants';
import { batchFetchVariantsForProducts, isProductWholeSoldOut } from '../lib/availability';
import { ProductVariant } from '../lib/supabase';
import './Wishlist.css';

type Product = {
    _id: string;
    id?: string;
    name: string;
    price: number;
    image: string;
    inStock?: boolean;
    category?: string;
};

export default function Wishlist() {
    const [wishlist, setWishlist] = useState<Product[]>([]);
    const [variants, setVariants] = useState<ProductVariant[]>([]);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();

    useEffect(() => {
        let isMounted = true;
        const saved: Product[] = JSON.parse(localStorage.getItem('wishlist') || '[]');
        
        const loadWishlistStock = async () => {
            if (saved.length > 0) {
                const productIds = saved.map((p) => p._id || p.id || '');
                const vData = await batchFetchVariantsForProducts(productIds.filter(Boolean));
                if (isMounted) {
                    setVariants(vData);
                }
            }
            if (isMounted) {
                setWishlist(saved);
                setLoading(false);
            }
        };

        loadWishlistStock();

        return () => {
            isMounted = false;
        };
    }, []);

    const removeFromWishlist = (productId: string) => {
        const updated = wishlist.filter(p => (p._id || p.id) !== productId);
        setWishlist(updated);
        localStorage.setItem('wishlist', JSON.stringify(updated));
        showToast('Artifact removed from vault', 'info');
    };

    const addToCart = (product: Product) => {
        const productId = product._id || product.id || '';
        const isSoldOut = isProductWholeSoldOut({ id: productId, in_stock: product.inStock }, variants);
        if (isSoldOut) {
            showToast(`${product.name} is currently Sold Out`, 'error');
            return;
        }

        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const existing = cart.find((i: any) => i.id === productId);

        if (existing) {
            existing.quantity++;
        } else {
            cart.push({
                id: productId,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: 1
            });
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        window.dispatchEvent(new Event('cart-updated'));
        showToast(`${product.name} secured in bag`, 'success');
    };

    if (loading) {
        return (
            <div className="wishlist-page">
                <div className="loading-state">
                    <Loader2 size={48} className="animate-spin text-cyan" />
                    <p>Accessing Dream Vault...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="wishlist-page">
            <div className="noise-layer" />
            
            <div className="container">
                <header className="wishlist-header">
                    <h1 className="page-title">Dream Vault</h1>
                    <p className="page-subtitle">
                        {wishlist.length} {wishlist.length === 1 ? 'Artifact' : 'Artifacts'} Saved
                    </p>
                </header>

                {wishlist.length === 0 ? (
                    <div className="empty-state-magnum">
                        <Heart size={64} className="empty-icon" />
                        <h2>Your Vault is Empty</h2>
                        <p>Curate your personal collection of desires.</p>
                        <Link to="/collection" className="btn-cinema">
                            Explore Artifacts <ArrowRight size={18} />
                        </Link>
                    </div>
                ) : (
                    <div className="wishlist-grid">
                        {wishlist.map((product) => {
                            const productId = product._id || product.id || '';
                            const isSoldOut = isProductWholeSoldOut({ id: productId, in_stock: product.inStock }, variants);

                            return (
                                <div key={productId} className="wishlist-card animate-fade-in-up">
                                    <div className="card-image-box">
                                        <Link to={`/product/${productId}`}>
                                            <SmartImage 
                                                src={product.image || FALLBACK_IMAGE} 
                                                alt={product.name} 
                                                aspectRatio="1/1"
                                                className="wishlist-img"
                                            />
                                        </Link>
                                        <button 
                                            className="btn-remove"
                                            onClick={() => removeFromWishlist(productId)}
                                            title="Remove"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>

                                    <div className="card-details">
                                        <Link to={`/product/${productId}`} className="product-link">
                                            <h3 className="product-title">{product.name}</h3>
                                        </Link>
                                        <p className="product-price">PKR {product.price.toLocaleString()}</p>
                                        
                                        <div className="card-actions">
                                            {!isSoldOut ? (
                                                <button 
                                                    className="btn-add-cart"
                                                    onClick={() => addToCart(product)}
                                                >
                                                    Add to Bag <ShoppingBag size={16} />
                                                </button>
                                            ) : (
                                                <button className="btn-disabled" disabled style={{ opacity: 0.6, cursor: 'not-allowed', backgroundColor: '#9CA3AF' }}>
                                                    Sold Out
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}