import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';

interface DesktopFilterSidebarProps {
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

export const DesktopFilterSidebar: React.FC<DesktopFilterSidebarProps> = ({
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
  return (
    <div className="desktop-filter-card" style={{
      backgroundColor: '#FFFFFF',
      border: '1px solid #E5E7EB',
      borderRadius: '12px',
      padding: '1.25rem',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid #F3F4F6' }}>
        <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={16} style={{ color: '#E52535' }} /> Filter Products
        </h3>
        <button
          onClick={onReset}
          style={{
            background: 'none',
            border: 'none',
            color: '#E52535',
            fontSize: '0.75rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <RotateCcw size={12} /> Reset All
        </button>
      </div>

      {/* Department Quick Switcher */}
      <div style={{ marginBottom: '1.25rem' }}>
        <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>
          Department
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <button
            onClick={() => setActiveDepartment('Ladies')}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: activeDepartment === 'Ladies' ? '1.5px solid #111827' : '1px solid #E5E7EB',
              backgroundColor: activeDepartment === 'Ladies' ? '#111827' : '#F9FAFB',
              color: activeDepartment === 'Ladies' ? '#F59E0B' : '#374151',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            ✨ Ladies Wear Collection
          </button>
          <button
            onClick={() => setActiveDepartment('Kids')}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: activeDepartment === 'Kids' ? '1.5px solid #E52535' : '1px solid #E5E7EB',
              backgroundColor: activeDepartment === 'Kids' ? '#E52535' : '#F9FAFB',
              color: activeDepartment === 'Kids' ? '#FFFFFF' : '#374151',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            👑 Kids Wear Collection
          </button>
          <button
            onClick={() => setActiveDepartment('All')}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: activeDepartment === 'All' ? '1.5px solid #374151' : '1px solid #E5E7EB',
              backgroundColor: activeDepartment === 'All' ? '#374151' : '#F9FAFB',
              color: activeDepartment === 'All' ? '#FFFFFF' : '#374151',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            All Items
          </button>
        </div>
      </div>

      {/* Categories */}
      <div style={{ marginBottom: '1.25rem' }}>
        <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>
          Categories
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid',
                borderColor: selectedCategory === cat ? '#E52535' : '#E5E7EB',
                backgroundColor: selectedCategory === cat ? '#FEF2F2' : '#FFFFFF',
                color: selectedCategory === cat ? '#E52535' : '#4B5563',
                fontWeight: selectedCategory === cat ? 700 : 500,
                fontSize: '0.82rem',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range Slider */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Max Price
          </label>
          <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#E52535' }}>
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

      {/* In Stock Only Checkbox */}
      <div>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, color: '#374151' }}>
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => setInStockOnly(e.target.checked)}
            style={{ width: '16px', height: '16px', accentColor: '#E52535', cursor: 'pointer' }}
          />
          In-Stock Items Only
        </label>
      </div>
    </div>
  );
};
