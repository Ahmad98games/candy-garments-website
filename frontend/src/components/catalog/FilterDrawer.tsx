import React from 'react';
import { X, Filter, RotateCcw } from 'lucide-react';

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeDepartment: 'Ladies' | 'Kids' | 'All';
  setActiveDepartment: (dept: 'Ladies' | 'Kids' | 'All') => void;
  categories: string[];
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  priceRange: number;
  setPriceRange: (price: number) => void;
  inStockOnly: boolean;
  setInStockOnly: (val: boolean) => void;
  onReset: () => void;
}

export const FilterDrawer: React.FC<FilterDrawerProps> = ({
  isOpen,
  onClose,
  activeDepartment,
  setActiveDepartment,
  categories,
  selectedCategory,
  setSelectedCategory,
  priceRange,
  setPriceRange,
  inStockOnly,
  setInStockOnly,
  onReset,
}) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      display: 'flex',
      justifyContent: 'flex-end',
    }}>
      {/* Backdrop overlay with smooth blur */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          transition: 'opacity 0.2s ease',
        }}
      />

      {/* Slide-over Content Card */}
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: '340px',
        height: '100%',
        backgroundColor: '#FFFFFF',
        boxShadow: '-4px 0 25px rgba(0, 0, 0, 0.2)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        zIndex: 10000,
        animation: 'slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        {/* Drawer Header */}
        <div style={{
          padding: '1.2rem 1.25rem',
          borderBottom: '1px solid #E5E7EB',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#FAFAFA'
        }}>
          <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={18} style={{ color: '#E52535' }} /> Filter Products
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#6B7280',
              padding: '6px',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Drawer Scrollable Body */}
        <div style={{ padding: '1.25rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Department Switcher */}
          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>
              Department
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <button
                onClick={() => setActiveDepartment('Ladies')}
                style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: activeDepartment === 'Ladies' ? '1.5px solid #111827' : '1px solid #E5E7EB',
                  backgroundColor: activeDepartment === 'Ladies' ? '#111827' : '#F9FAFB',
                  color: activeDepartment === 'Ladies' ? '#F59E0B' : '#374151',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                ✨ Ladies Wear Collection
              </button>
              <button
                onClick={() => setActiveDepartment('Kids')}
                style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: activeDepartment === 'Kids' ? '1.5px solid #E52535' : '1px solid #E5E7EB',
                  backgroundColor: activeDepartment === 'Kids' ? '#E52535' : '#F9FAFB',
                  color: activeDepartment === 'Kids' ? '#FFFFFF' : '#374151',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                👑 Kids Wear Collection
              </button>
              <button
                onClick={() => setActiveDepartment('All')}
                style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: activeDepartment === 'All' ? '1.5px solid #374151' : '1px solid #E5E7EB',
                  backgroundColor: activeDepartment === 'All' ? '#374151' : '#F9FAFB',
                  color: activeDepartment === 'All' ? '#FFFFFF' : '#374151',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                All Items
              </button>
            </div>
          </div>

          {/* Categories */}
          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>
              Categories
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: selectedCategory === cat ? '#E52535' : '#E5E7EB',
                    backgroundColor: selectedCategory === cat ? '#FEF2F2' : '#FFFFFF',
                    color: selectedCategory === cat ? '#E52535' : '#4B5563',
                    fontWeight: selectedCategory === cat ? 700 : 500,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Max Price
              </label>
              <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#E52535' }}>
                Rs. {priceRange.toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              min="2000"
              max="30000"
              step="500"
              value={priceRange}
              onChange={(e) => setPriceRange(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#E52535', cursor: 'pointer' }}
            />
          </div>

          {/* In-Stock Toggle */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 600, color: '#374151' }}>
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: '#E52535', cursor: 'pointer' }}
              />
              In-Stock Items Only
            </label>
          </div>
        </div>

        {/* Drawer Action Footer */}
        <div style={{
          padding: '1rem 1.25rem',
          borderTop: '1px solid #E5E7EB',
          display: 'flex',
          gap: '10px',
          backgroundColor: '#FAFAFA'
        }}>
          <button
            onClick={() => {
              onReset();
            }}
            style={{
              padding: '10px 14px',
              borderRadius: '8px',
              border: '1px solid #D1D5DB',
              backgroundColor: '#FFFFFF',
              color: '#374151',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <RotateCcw size={14} /> Reset
          </button>

          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '10px 16px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#E52535',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: '0.88rem',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(229, 37, 53, 0.25)'
            }}
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};
