import { useEffect, useState, useMemo, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AlertTriangle, ArrowLeft } from 'lucide-react'
import './Cart.css'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { useToast } from '../context/ToastContext'
import { FALLBACK_IMAGE } from '../constants'
import { calculateOrderTotal } from '../utils/currencyEngine'

type CartItem = { id: string; name: string; price: number; image?: string; quantity: number }

export default function Cart() {
  const [items, setItems] = useState<CartItem[]>([])
  const navigate = useNavigate()
  const { showToast } = useToast()
  const contentRef = useScrollReveal()
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('cart') || '[]') as CartItem[]
    setItems(data)
  }, [])

  const syncCartToStorage = (newItems: CartItem[]) => {
    localStorage.setItem('cart', JSON.stringify(newItems))
    window.dispatchEvent(new Event('cart-updated'))
  }

  const updateCart = (newItems: CartItem[]) => {
    setItems(newItems)
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
    debounceTimerRef.current = setTimeout(() => {
      syncCartToStorage(newItems)
    }, 150)
  }

  const removeItem = (id: string, name: string) => {
    if (confirm(`Remove "${name}" from your bag?`)) {
      const updated = items.filter(i => i.id !== id)
      setItems(updated)
      syncCartToStorage(updated)
      showToast('Item removed from bag', 'info')
    }
  }

  const updateQty = (id: string, delta: number) => {
    const updatedItems = items.map(i => {
      if (i.id === id) {
        const newQty = Math.max(1, i.quantity + delta)
        return { ...i, quantity: newQty }
      }
      return i
    })
    updateCart(updatedItems)
  }

  const clearCart = () => {
    if (confirm('Are you sure you want to empty your bag? This action cannot be undone.')) {
      setItems([])
      syncCartToStorage([])
      showToast('Shopping bag cleared', 'info')
    }
  }

  const orderCalculations = useMemo(() => {
    return calculateOrderTotal({ items: items.map(i => ({ price: i.price, quantity: i.quantity })) })
  }, [items])

  const subtotal = orderCalculations.subtotal
  const totalItems = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items])

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = FALLBACK_IMAGE
    e.currentTarget.onerror = null
  }

  if (items.length === 0) {
    return (
      <div className="cart-page empty-cart animate-fade-in">
        <div className="empty-cart-content">
          <h2>Your Bag Is Empty</h2>
          <p>Discover our curated collection of luxury pret and handcrafted garments.</p>
          <Link to="/collection" className="btn btn-primary">
            Explore Collection
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="cart-page">
      {/* HERO HEADER - Matches Home, OmnoraCollection, & Product Page Aesthetic */}
      <div style={{ textAlign: 'center', marginBottom: '2rem', paddingTop: '10px' }}>
        <span style={{ backgroundColor: '#FEF2F2', color: '#E52535', fontSize: '0.75rem', fontWeight: 800, padding: '5px 16px', borderRadius: '9999px', textTransform: 'uppercase', letterSpacing: '0.15em', display: 'inline-block', marginBottom: '0.75rem', boxShadow: '0 2px 8px rgba(229,37,53,0.1)' }}>
          LUXURY BAG
        </span>
        <h1 style={{ fontFamily: "'Outfit', 'Inter', sans-serif", fontSize: 'clamp(2rem, 5vw, 2.75rem)', fontWeight: 900, color: '#111827', margin: '0 0 0.5rem 0', letterSpacing: '-0.02em' }}>
          Shopping Bag
        </h1>
        <p style={{ fontSize: '0.95rem', color: '#6B7280', fontWeight: 600 }}>
          {totalItems} {totalItems === 1 ? 'Item' : 'Items'} • Total: <span style={{ color: '#E52535', fontWeight: 800 }}>PKR {subtotal.toLocaleString()}</span>
        </p>
      </div>

      <div className="cart-container" ref={contentRef}>
        {/* FIXED PRICE & ADVANCE PAYMENT POLICY BANNER */}
        <div className="policy-banner">
          <AlertTriangle className="policy-banner-icon" size={22} />
          <div className="policy-banner-content">
            <span className="policy-banner-title">⚠️ Strict Advance Payment & Fixed-Price Policy</span>
            All articles are sold at firm, fixed factory rates. No Cash on Delivery (COD). Orders are strictly dispatched nationwide via <strong>TCS Express Courier</strong> upon receipt of 100% advance bank payment.
          </div>
        </div>

        <div className="cart-content">
          <div className="cart-items">
            <div className="cart-header">
              <span>Product</span>
              <span>Quantity</span>
              <span style={{ textAlign: 'right' }}>Total</span>
            </div>

            {items.map((item, index) => (
              <div
                key={item.id}
                className="cart-item animate-slide-in-right"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="item-info">
                  <div className="item-image-placeholder">
                    <img
                      src={item.image || FALLBACK_IMAGE}
                      alt={item.name}
                      onError={handleImageError}
                      loading="lazy"
                    />
                  </div>
                  <div>
                    <h3>{item.name}</h3>
                    <p>PKR {item.price.toLocaleString()}</p>
                    <button
                      onClick={() => removeItem(item.id, item.name)}
                      className="remove-btn"
                      aria-label={`Remove ${item.name} from cart`}
                    >
                      Remove
                    </button>
                  </div>
                </div>

                <div className="item-quantity">
                  <button
                    onClick={() => updateQty(item.id, -1)}
                    aria-label="Decrease quantity"
                    disabled={item.quantity <= 1}
                  >
                    −
                  </button>
                  <span aria-label={`Quantity: ${item.quantity}`}>
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQty(item.id, 1)}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>

                <div className="item-total">
                  PKR {(item.price * item.quantity).toLocaleString()}
                </div>
              </div>
            ))}

            <button
              onClick={clearCart}
              className="clear-cart-btn"
              aria-label="Clear entire shopping bag"
            >
              Clear Shopping Bag
            </button>
          </div>

          <div className="order-summary animate-fade-in-up">
            <h2>Order Summary</h2>

            <div className="summary-row">
              <span>Items ({totalItems})</span>
              <span>PKR {subtotal.toLocaleString()}</span>
            </div>

            <div className="summary-row">
              <span>Subtotal</span>
              <span>PKR {subtotal.toLocaleString()}</span>
            </div>

            <p className="shipping-note">
              Nationwide delivery via TCS Express Courier (2–3 working days). 100% Advance Bank Transfer required before dispatch.
            </p>

            <div className="summary-total">
              <span>Total</span>
              <span>PKR {subtotal.toLocaleString()}</span>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="btn btn-primary checkout-btn"
              aria-label={`Proceed to checkout with ${totalItems} items totaling PKR ${subtotal.toLocaleString()}`}
            >
              Proceed to Checkout
            </button>

            <div style={{ marginTop: '1.25rem', textAlign: 'center' }}>
              <Link
                to="/collection"
                style={{
                  color: 'var(--text-muted)',
                  textDecoration: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <ArrowLeft size={14} /> Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}