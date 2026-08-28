import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
<<<<<<< HEAD
import { fetchProducts, upsertProduct, toggleProductStock, deleteProduct, Product } from '../lib/supabase';
import { useToast } from '../context/ToastContext';
import { processAndUploadImage } from '../utils/imageUpload';
import {
    Plus, Edit3, Trash2, X, Upload, RefreshCw, Search
=======
import { fetchProducts, upsertProduct, toggleProductStock, updateStockQuantity, deleteProduct, Product, supabase } from '../lib/supabase';
import { useToast } from '../context/ToastContext';
import { processAndUploadImage } from '../utils/imageUpload';
import {
    Plus, Edit3, Trash2, X, Upload, CheckCircle, XCircle, RefreshCw, Search,
    Download, FileSpreadsheet, GripVertical, ChevronLeft, ChevronRight, AlertTriangle,
    Package, PackageX, Minus, Layers
>>>>>>> a6e2b54 (feat(admin): stock-out metrics, stock status filters, quick inline quantity controls and mobile responsiveness)
} from 'lucide-react';
import './AdminProducts.css';

const INITIAL_FORM_STATE: Partial<Product> = {
    article_no: '',
    title: '',
    description: '',
    retail_price: 0,
    wholesale_cost: 0,
    category: 'Ladies Wear',
    department: 'Ladies',
    fabric_type: 'Cotton Lawn',
    images: [],
    stock_quantity: 10,
    in_stock: true,
};

const getSafeImagesArray = (imgs: any): string[] => {
    if (!imgs) return [];
    if (Array.isArray(imgs)) return imgs;
    if (typeof imgs === 'string') {
        if (imgs.startsWith('[')) {
            try { return JSON.parse(imgs); } catch { return [imgs]; }
        }
        return [imgs];
    }
    return [];
};

interface AdminProductsProps {
    defaultDepartment?: 'Ladies' | 'Kids';
}

const AdminProducts: React.FC<AdminProductsProps> = ({ defaultDepartment }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

    const [editingId, setEditingId] = useState<string | null>(null);
    const [selectedDepartment, setSelectedDepartment] = useState<'Ladies' | 'Kids' | 'All'>(
        defaultDepartment || 'All'
    );
    const [formData, setFormData] = useState<Partial<Product>>(INITIAL_FORM_STATE);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [stockFilter, setStockFilter] = useState<'all' | 'in_stock' | 'out_of_stock' | 'low_stock'>('all');

    const [pageSize] = useState<number>(24);
    const [currentPage] = useState<number>(1);

    const [imageUrlInput, setImageUrlInput] = useState('');
    const [uploadProgress, setUploadProgress] = useState<number>(0);

    const { showToast } = useToast();

    useEffect(() => {
        if (defaultDepartment) {
            setSelectedDepartment(defaultDepartment);
        }
    }, [defaultDepartment]);

    const loadProducts = useCallback(async () => {
        setLoading(true);
        try {
            const data = await fetchProducts({
                search_term: searchTerm,
                department: selectedDepartment !== 'All' ? selectedDepartment : undefined,
            });
            const safeData = Array.isArray(data) ? [...data] : [];
            safeData.sort((a: any, b: any) => {
                if (a.display_order !== b.display_order && a.display_order && b.display_order) {
                    return a.display_order - b.display_order;
                }
                return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
            });
            setProducts(safeData);
        } catch (err) {
            console.error('Fetch products error:', err);
            showToast('Failed to load products', 'error');
            setProducts([]);
        } finally {
            setLoading(false);
        }
    }, [searchTerm, selectedDepartment, showToast]);

    useEffect(() => {
        loadProducts();
    }, [loadProducts]);

<<<<<<< HEAD
    const paginatedProducts = (products || []).slice((currentPage - 1) * pageSize, currentPage * pageSize);
=======
    // FILTER PRODUCTS BY STOCK STATUS AND SEARCH
    const filteredProducts = React.useMemo(() => {
        return products.filter((p) => {
            const qty = p.stock_quantity !== undefined ? p.stock_quantity : (p.in_stock ? 10 : 0);
            const isInStock = p.in_stock && qty > 0;
            const isLowStock = isInStock && qty <= 3;

            if (stockFilter === 'in_stock' && !isInStock) return false;
            if (stockFilter === 'out_of_stock' && isInStock) return false;
            if (stockFilter === 'low_stock' && !isLowStock) return false;
            return true;
        });
    }, [products, stockFilter]);

    // INVENTORY STOCK METRICS
    const metrics = React.useMemo(() => {
        let total = products.length;
        let inStock = 0;
        let lowStock = 0;
        let outOfStock = 0;

        products.forEach((p) => {
            const qty = p.stock_quantity !== undefined ? p.stock_quantity : (p.in_stock ? 10 : 0);
            const isInStock = p.in_stock && qty > 0;
            if (!isInStock) {
                outOfStock++;
            } else {
                inStock++;
                if (qty <= 3) lowStock++;
            }
        });

        return { total, inStock, lowStock, outOfStock };
    }, [products]);

    // PAGINATION CALCULATIONS
    const totalPages = Math.ceil(filteredProducts.length / pageSize) || 1;
    const paginatedProducts = filteredProducts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    // Delete Article state
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
>>>>>>> a6e2b54 (feat(admin): stock-out metrics, stock status filters, quick inline quantity controls and mobile responsiveness)

    const handleDeleteClick = (product: Product) => {
        setDeletingProduct(product);
        setDeleteId(product.id);
    };

    const handleConfirmDelete = async () => {
        if (!deleteId) return;
        const success = await deleteProduct(deleteId);
        if (success) {
            showToast(`Article deleted permanently!`, 'success');
            setProducts((prev) => prev.filter((p) => p.id !== deleteId));
        } else {
            showToast('Failed to delete article.', 'error');
        }
        setDeleteId(null);
        setDeletingProduct(null);
    };

    const handleEdit = (product: Product) => {
        setEditingId(product.id);
        setFormData({
            id: product.id,
            article_no: product.article_no || '',
            title: product.title || '',
            description: product.description || '',
            retail_price: product.retail_price || 0,
            wholesale_cost: product.wholesale_cost || 0,
            category: product.category || 'Ladies Wear',
            department: product.department || 'Ladies',
            fabric_type: product.fabric_type || '',
            images: getSafeImagesArray(product.images),
            in_stock: product.in_stock,
            stock_quantity: product.stock_quantity !== undefined ? product.stock_quantity : 10,
        });
        setIsModalOpen(true);
    };

    const handleToggleStock = async (product: Product) => {
        const newStock = !product.in_stock;
        const success = await toggleProductStock(product.id, newStock);
        if (success) {
            showToast(`Updated stock status for ${product.title}`, 'success');
            setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, in_stock: newStock } : p)));
        } else {
            showToast('Stock status update failed', 'error');
        }
    };

<<<<<<< HEAD
=======
    const handleQuickQtyChange = async (product: Product, delta: number) => {
        const currentQty = product.stock_quantity !== undefined ? product.stock_quantity : (product.in_stock ? 10 : 0);
        const targetQty = Math.max(0, currentQty + delta);
        const updated = await updateStockQuantity(product.id, targetQty);
        if (updated) {
            setProducts((prev) =>
                prev.map((p) =>
                    p.id === product.id
                        ? { ...p, stock_quantity: targetQty, in_stock: targetQty > 0 }
                        : p
                )
            );
            showToast(`Updated stock for "${product.title}" to ${targetQty} units`, 'success');
        } else {
            showToast('Stock quantity update failed', 'error');
        }
    };

    const [imageUrlInput, setImageUrlInput] = useState('');

>>>>>>> a6e2b54 (feat(admin): stock-out metrics, stock status filters, quick inline quantity controls and mobile responsiveness)
    const handleAddImageUrl = (e?: React.MouseEvent) => {
        if (e) e.preventDefault();
        if (!imageUrlInput.trim()) return;
        
        setFormData((prev) => ({
            ...prev,
            images: [...getSafeImagesArray(prev.images), imageUrlInput.trim()],
        }));
        setImageUrlInput('');
        showToast('Image URL added!', 'success');
    };

    const handleRemoveImage = (indexToRemove: number) => {
        setFormData((prev) => ({
            ...prev,
            images: getSafeImagesArray(prev.images).filter((_, idx) => idx !== indexToRemove),
        }));
        showToast('Image removed.', 'info');
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        setUploadingImage(true);
        setUploadProgress(5);
        try {
            const uploadedUrls: string[] = [];
            let currentCount = 0;

            for (const file of files) {
                const publicUrl = await processAndUploadImage(file, 'products', (progress) => {
                    const stepProgress = Math.round(((currentCount + (progress / 100)) / files.length) * 100);
                    setUploadProgress(Math.max(5, stepProgress));
                });
                if (publicUrl) {
                    uploadedUrls.push(publicUrl);
                }
                currentCount++;
            }

            if (uploadedUrls.length > 0) {
                setFormData((prev) => ({
                    ...prev,
                    images: [...getSafeImagesArray(prev.images), ...uploadedUrls],
                }));
                showToast(`Uploaded ${uploadedUrls.length} image(s) successfully!`, 'success');
            } else {
                showToast('Image upload failed to return URL.', 'error');
            }
        } catch (err) {
            console.error('Image upload error:', err);
            showToast('Failed to process image.', 'error');
        } finally {
            setUploadingImage(false);
            setUploadProgress(0);
            e.target.value = '';
        }
    };

    const handleOpenCreateModal = () => {
        setEditingId(null);
        const isKids = selectedDepartment === 'Kids';
        setFormData({
            article_no: isKids ? `OMN-K-${Math.floor(100 + Math.random() * 900)}` : `OMN-L-${Math.floor(100 + Math.random() * 900)}`,
            title: '',
            description: '',
            retail_price: isKids ? 3500 : 6500,
            wholesale_cost: 0,
            category: isKids ? 'Girls' : 'Ladies Wear',
            department: selectedDepartment !== 'All' ? selectedDepartment : 'Ladies',
            fabric_type: isKids ? 'Cotton Lawn' : 'Plush Velvet & Silk',
            images: [],
            stock_quantity: 10,
            in_stock: true,
        });
        setIsModalOpen(true);
    };

    const handleDirectSave = async () => {
        if (!formData.title || !formData.title.trim()) {
            alert('Title / Design Name is required.');
            return;
        }
        if (formData.retail_price === undefined || formData.retail_price === null || isNaN(Number(formData.retail_price)) || Number(formData.retail_price) <= 0) {
            alert('Please provide a valid Retail Price (> 0).');
            return;
        }

        setSaving(true);
        try {
            const margin = (Number(formData.retail_price) || 0) - (Number(formData.wholesale_cost) || 0);
            const stockQty = formData.stock_quantity !== undefined && !isNaN(Number(formData.stock_quantity)) 
                ? Number(formData.stock_quantity) 
                : 10;

            const safeFinalImages = getSafeImagesArray(formData.images);
            const fallbackImages = safeFinalImages.length > 0 
                ? safeFinalImages 
                : ['https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=800&q=80'];

            const targetDepartment = formData.department || (selectedDepartment !== 'All' ? selectedDepartment : 'Ladies');

            const payload: Partial<Product> = {
                ...(editingId ? { id: editingId } : {}),
                article_no: formData.article_no?.trim() || `CB-${Math.floor(100 + Math.random() * 900)}`,
                title: formData.title.trim(),
                description: formData.description || '',
                retail_price: Number(formData.retail_price),
                wholesale_cost: Number(formData.wholesale_cost || 0),
                margin: margin > 0 ? margin : 0,
                category: formData.category || (targetDepartment === 'Kids' ? 'Girls' : 'Ladies Wear'),
                department: targetDepartment,
                fabric_type: formData.fabric_type || 'Pure Raw Silk',
                images: fallbackImages, 
                stock_quantity: stockQty,
                in_stock: stockQty > 0 ? (formData.in_stock ?? true) : false,
            };

            const result = await upsertProduct(payload);
            if (result) {
                showToast(editingId ? 'Article updated successfully!' : 'New article created!', 'success');
                
                if (editingId) {
                    setProducts((prev) => prev.map((p) => (p.id === result.id ? result : p)));
                } else {
                    setProducts((prev) => [result, ...prev]);
                }

                setIsModalOpen(false);
                setEditingId(null);
                setFormData(INITIAL_FORM_STATE);
                window.dispatchEvent(new Event('products-updated'));
            }
        } catch (err: any) {
            console.error('Save error:', err);
            alert(`Save Exception: ${err.message || err}`);
        } finally {
            setSaving(false);
        }
    };

    const lightInputStyle: React.CSSProperties = {
        width: '100%',
        padding: '10px 12px',
        borderRadius: '8px',
        border: '1px solid #D1D5DB',
        backgroundColor: '#FFFFFF',
        color: '#111827',
        fontSize: '14px',
        marginTop: '4px',
        outline: 'none',
        boxSizing: 'border-box'
    };

    return (
<<<<<<< HEAD
        <div className="admin-products-container" style={{ padding: '16px', backgroundColor: '#F9FAFB', minHeight: '100vh' }}>
            {/* DEPARTMENT TABS */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                <button 
                    type="button"
                    onClick={() => setSelectedDepartment('Ladies')} 
                    style={{ backgroundColor: selectedDepartment === 'Ladies' ? '#111827' : '#FFFFFF', color: selectedDepartment === 'Ladies' ? '#F59E0B' : '#374151', fontWeight: 700, border: '1px solid #E5E7EB', padding: '10px 16px', cursor: 'pointer', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
=======
        <div className="admin-products-container">
            {/* INVENTORY SUMMARY METRICS BAR */}
            <div className="stock-metrics-grid">
                <div
                    className={`stock-metric-card ${stockFilter === 'all' ? 'active' : ''}`}
                    onClick={() => { setStockFilter('all'); setCurrentPage(1); }}
                >
                    <div className="stock-metric-info">
                        <span className="stock-metric-label">Total Articles</span>
                        <span className="stock-metric-value">{metrics.total}</span>
                    </div>
                    <div className="stock-metric-icon" style={{ background: '#f1f5f9', color: '#475569' }}>
                        <Layers size={20} />
                    </div>
                </div>

                <div
                    className={`stock-metric-card ${stockFilter === 'in_stock' ? 'active' : ''}`}
                    onClick={() => { setStockFilter('in_stock'); setCurrentPage(1); }}
                >
                    <div className="stock-metric-info">
                        <span className="stock-metric-label">In Stock</span>
                        <span className="stock-metric-value" style={{ color: '#059669' }}>{metrics.inStock}</span>
                    </div>
                    <div className="stock-metric-icon" style={{ background: '#ecfdf5', color: '#059669' }}>
                        <Package size={20} />
                    </div>
                </div>

                <div
                    className={`stock-metric-card ${stockFilter === 'low_stock' ? 'active' : ''}`}
                    onClick={() => { setStockFilter('low_stock'); setCurrentPage(1); }}
                >
                    <div className="stock-metric-info">
                        <span className="stock-metric-label">Low Stock (≤3)</span>
                        <span className="stock-metric-value" style={{ color: '#d97706' }}>{metrics.lowStock}</span>
                    </div>
                    <div className="stock-metric-icon" style={{ background: '#fffbeb', color: '#d97706' }}>
                        <AlertTriangle size={20} />
                    </div>
                </div>

                <div
                    className={`stock-metric-card ${stockFilter === 'out_of_stock' ? 'active' : ''}`}
                    onClick={() => { setStockFilter('out_of_stock'); setCurrentPage(1); }}
                >
                    <div className="stock-metric-info">
                        <span className="stock-metric-label">Out of Stock</span>
                        <span className="stock-metric-value" style={{ color: '#dc2626' }}>{metrics.outOfStock}</span>
                    </div>
                    <div className="stock-metric-icon" style={{ background: '#fef2f2', color: '#dc2626' }}>
                        <PackageX size={20} />
                    </div>
                </div>
            </div>

            {/* DEPARTMENT SELECTION TABS */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <button
                    onClick={() => setSelectedDepartment('Ladies')}
                    className="btn"
                    style={{
                        backgroundColor: selectedDepartment === 'Ladies' ? '#111827' : 'var(--bg-card)',
                        color: selectedDepartment === 'Ladies' ? '#F59E0B' : 'var(--text-main)',
                        fontWeight: 700,
                        border: '1px solid var(--border-subtle)',
                        padding: '10px 18px',
                        cursor: 'pointer',
                        borderRadius: 'var(--radius-md)',
                        boxShadow: selectedDepartment === 'Ladies' ? '0 4px 12px rgba(17,24,39,0.15)' : 'none',
                    }}
>>>>>>> a6e2b54 (feat(admin): stock-out metrics, stock status filters, quick inline quantity controls and mobile responsiveness)
                >
                    ✨ Ladies Wear Admin
                </button>
                <button 
                    type="button"
                    onClick={() => setSelectedDepartment('Kids')} 
                    style={{ backgroundColor: selectedDepartment === 'Kids' ? '#E52535' : '#FFFFFF', color: selectedDepartment === 'Kids' ? '#FFFFFF' : '#374151', fontWeight: 700, border: '1px solid #E5E7EB', padding: '10px 16px', cursor: 'pointer', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
                >
                    👑 Kids Wear Admin
                </button>
                <button 
                    type="button"
                    onClick={() => setSelectedDepartment('All')} 
                    style={{ backgroundColor: selectedDepartment === 'All' ? '#4F46E5' : '#FFFFFF', color: selectedDepartment === 'All' ? '#FFFFFF' : '#374151', fontWeight: 700, border: '1px solid #E5E7EB', padding: '10px 16px', cursor: 'pointer', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
                >
                    📦 All Inventory
                </button>
            </div>

<<<<<<< HEAD
            {/* SEARCH & ACTIONS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                <div style={{ position: 'relative', width: '100%' }}>
                    <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                    <input 
                        type="text" 
                        placeholder="Search by title, article #..." 
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)} 
                        style={{ ...lightInputStyle, paddingLeft: '40px', marginTop: 0 }} 
                    />
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                        type="button" 
                        onClick={handleOpenCreateModal} 
                        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: '#E52535', color: '#FFFFFF', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
                    >
                        <Plus size={18} /> ADD ARTICLE
                    </button>
                    <button 
                        type="button" 
                        onClick={loadProducts} 
                        style={{ border: '1px solid #D1D5DB', padding: '10px 14px', borderRadius: '8px', background: '#FFFFFF', color: '#374151', cursor: 'pointer' }}
                    >
                        <RefreshCw size={18} />
                    </button>
=======
            {/* HEADER */}
            <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>
                        {selectedDepartment === 'Ladies' ? 'Omnora Ladies Wear Collection Management' : selectedDepartment === 'Kids' ? 'Candy Kids Wear Collection Management' : 'All Article Inventory Catalog'}
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '4px 0 0 0' }}>
                        {selectedDepartment === 'Ladies'
                            ? 'Manage, add, and edit hand-crafted velvet suits, raw silk tunics & luxury formals for Ladies.'
                            : selectedDepartment === 'Kids'
                                ? 'Manage, add, and edit handcrafted frocks, kurtas & garments for Kids.'
                                : 'Manage overall store product listings, drag-and-drop display ranking, bulk CSV imports, and image aspect locks.'}
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        className="btn btn-outline"
                        onClick={(e) => {
                            e.preventDefault();
                            setIsBulkModalOpen(true);
                        }}
                        style={{ height: '38px', fontSize: '13px', cursor: 'pointer' }}
                    >
                        <FileSpreadsheet size={16} /> Bulk Import CSV
                    </button>

                    <button
                        type="button"
                        className="btn btn-emerald"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleOpenCreateModal();
                        }}
                        style={{ height: '38px', fontSize: '13px', cursor: 'pointer', zIndex: 10 }}
                    >
                        <Plus size={16} /> New Article
                    </button>
                </div>
            </header>

            {/* CONTROLS BAR: SEARCH, STOCK STATUS FILTER & PAGINATION SELECTOR */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px', background: 'var(--bg-card)', padding: '12px 16px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
                {/* SEARCH */}
                <div style={{ position: 'relative', width: '280px' }}>
                    <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        placeholder="Search by title, article no..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="form-input"
                        style={{ paddingLeft: '36px', width: '100%', height: '36px', fontSize: '13px' }}
                    />
                </div>

                {/* STOCK STATUS FILTER TABS */}
                <div className="stock-filter-mobile-wrap" style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <button
                        onClick={() => { setStockFilter('all'); setCurrentPage(1); }}
                        style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            border: '1px solid var(--border-subtle)',
                            background: stockFilter === 'all' ? '#1e293b' : 'transparent',
                            color: stockFilter === 'all' ? '#ffffff' : 'var(--text-main)',
                        }}
                    >
                        All Stock ({metrics.total})
                    </button>

                    <button
                        onClick={() => { setStockFilter('in_stock'); setCurrentPage(1); }}
                        style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            border: '1px solid #a7f3d0',
                            background: stockFilter === 'in_stock' ? '#059669' : '#ecfdf5',
                            color: stockFilter === 'in_stock' ? '#ffffff' : '#047857',
                        }}
                    >
                        In Stock ({metrics.inStock})
                    </button>

                    <button
                        onClick={() => { setStockFilter('low_stock'); setCurrentPage(1); }}
                        style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            border: '1px solid #fde68a',
                            background: stockFilter === 'low_stock' ? '#d97706' : '#fffbeb',
                            color: stockFilter === 'low_stock' ? '#ffffff' : '#b45309',
                        }}
                    >
                        Low Stock ({metrics.lowStock})
                    </button>

                    <button
                        onClick={() => { setStockFilter('out_of_stock'); setCurrentPage(1); }}
                        style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            border: '1px solid #fca5a5',
                            background: stockFilter === 'out_of_stock' ? '#dc2626' : '#fef2f2',
                            color: stockFilter === 'out_of_stock' ? '#ffffff' : '#dc2626',
                        }}
                    >
                        Out of Stock ({metrics.outOfStock})
                    </button>
                </div>

                {/* PAGINATION PAGE SIZE SELECTOR */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px' }}>
                    <span className="text-muted">Items per page:</span>
                    <select
                        value={pageSize}
                        onChange={(e) => {
                            setPageSize(Number(e.target.value));
                            setCurrentPage(1);
                        }}
                        className="form-input"
                        style={{ height: '34px', padding: '0 8px', fontSize: '12px' }}
                    >
                        <option value={24}>24 per page</option>
                        <option value={48}>48 per page</option>
                        <option value={96}>96 per page</option>
                    </select>

                    <div className="font-mono text-muted" style={{ fontSize: '12px' }}>
                        Showing: {filteredProducts.length} Products
                    </div>
>>>>>>> a6e2b54 (feat(admin): stock-out metrics, stock status filters, quick inline quantity controls and mobile responsiveness)
                </div>
            </div>

            {/* CATALOG TABLE */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#6B7280' }}>Loading catalog...</div>
            ) : paginatedProducts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', background: '#FFFFFF', borderRadius: '8px', border: '1px solid #E5E7EB', color: '#6B7280' }}>
                    No products found in this category.
                </div>
            ) : (
                <div style={{ overflowX: 'auto', background: '#FFFFFF', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #E5E7EB', background: '#F3F4F6' }}>
                                <th style={{ padding: '12px 14px', color: '#374151', fontSize: '13px' }}>Image & Article</th>
                                <th style={{ padding: '12px 14px', color: '#374151', fontSize: '13px' }}>Retail Price</th>
                                <th style={{ padding: '12px 14px', color: '#374151', fontSize: '13px' }}>Stock</th>
                                <th style={{ padding: '12px 14px', color: '#374151', fontSize: '13px', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedProducts.map((product) => {
                                const safeImgs = getSafeImagesArray(product.images);
                                const firstImg = safeImgs.length > 0 ? safeImgs[0] : 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=100&q=80';
                                return (
                                <tr key={product.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                                    <td style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <img src={firstImg} alt={product.title} style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover', border: '1px solid #E5E7EB' }} />
                                        <div>
                                            <div style={{ fontWeight: 600, color: '#111827' }}>{product.title}</div>
                                            <div style={{ fontSize: '12px', color: '#6B7280' }}>{product.category} ({product.article_no})</div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '12px 14px', fontWeight: 700, color: '#111827' }}>Rs {product.retail_price?.toLocaleString()}</td>
                                    <td style={{ padding: '12px 14px' }}>
                                        <button 
                                            type="button" 
                                            onClick={() => handleToggleStock(product)} 
                                            style={{ padding: '5px 10px', borderRadius: '6px', border: 'none', cursor: 'pointer', background: product.in_stock ? '#D1FAE5' : '#FEE2E2', color: product.in_stock ? '#065F46' : '#991B1B', fontWeight: 600, fontSize: '12px' }}
                                        >
<<<<<<< HEAD
                                            {product.in_stock ? 'In Stock' : 'Out of Stock'}
                                        </button>
                                    </td>
                                    <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                                        <button 
                                            type="button" 
                                            onClick={() => handleEdit(product)} 
                                            style={{ marginRight: '10px', background: 'none', border: 'none', cursor: 'pointer', padding: '6px' }}
                                        >
                                            <Edit3 size={18} color="#374151" />
                                        </button>
                                        <button 
                                            type="button" 
                                            onClick={() => handleDeleteClick(product)} 
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', padding: '6px' }}
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
=======
                                            <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <GripVertical size={16} />
                                                    <span className="font-mono">{globalIndex + 1}</span>
                                                </div>
                                            </td>

                                            <td style={{ padding: '12px 16px' }}>
                                                <div style={{ width: '45px', height: '60px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
                                                    <img src={p.images?.[0] || '/images/omnora.jpg'} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                </div>
                                            </td>

                                            <td style={{ padding: '12px 16px' }}>
                                                <span className="article-no-badge">
                                                    {p.article_no || 'N/A'}
                                                </span>
                                            </td>

                                            <td style={{ padding: '12px 16px' }}>
                                                <span className="product-title-text">{p.title}</span>
                                            </td>

                                            <td style={{ padding: '12px 16px', color: '#9CA3AF' }}>
                                                {p.fabric_type || p.category}
                                            </td>

                                            <td style={{ padding: '12px 16px', fontWeight: 700, color: '#10B981' }} className="font-mono">
                                                PKR {p.retail_price.toLocaleString()}
                                            </td>

                                            <td style={{ padding: '12px 16px', color: '#9CA3AF' }} className="font-mono">
                                                PKR {(p.wholesale_cost || 0).toLocaleString()}
                                            </td>

                                            <td style={{ padding: '12px 16px' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                                    {/* STOCK STATUS TOGGLE BUTTON */}
                                                    <button
                                                        onClick={() => handleToggleStock(p)}
                                                        style={{
                                                            background: 'none',
                                                            border: 'none',
                                                            cursor: 'pointer',
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '4px',
                                                            color: p.in_stock && (p.stock_quantity === undefined || p.stock_quantity > 0) ? '#10B981' : '#EF4444',
                                                            fontWeight: 700,
                                                            fontSize: '12px',
                                                        }}
                                                    >
                                                        {p.in_stock && (p.stock_quantity === undefined || p.stock_quantity > 0) ? <CheckCircle size={15} /> : <XCircle size={15} />}
                                                        {p.in_stock && (p.stock_quantity === undefined || p.stock_quantity > 0) ? 'In Stock' : 'Out of Stock'}
                                                    </button>

                                                    {/* INLINE QUICK STOCK QUANTITY ADJUSTER */}
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <div className="stock-quick-adjuster">
                                                            <button
                                                                type="button"
                                                                className="stock-qty-btn"
                                                                onClick={(e) => { e.stopPropagation(); handleQuickQtyChange(p, -1); }}
                                                                title="Decrease Stock Quantity (-1)"
                                                            >
                                                                <Minus size={12} />
                                                            </button>
                                                            <span className="stock-qty-val font-mono">
                                                                {p.stock_quantity !== undefined ? p.stock_quantity : (p.in_stock ? 10 : 0)}
                                                            </span>
                                                            <button
                                                                type="button"
                                                                className="stock-qty-btn"
                                                                onClick={(e) => { e.stopPropagation(); handleQuickQtyChange(p, 1); }}
                                                                title="Increase Stock Quantity (+1)"
                                                            >
                                                                <Plus size={12} />
                                                            </button>
                                                        </div>

                                                        {/* STOCK STATUS PILL */}
                                                        {(() => {
                                                            const qty = p.stock_quantity !== undefined ? p.stock_quantity : (p.in_stock ? 10 : 0);
                                                            const isOut = !p.in_stock || qty <= 0;
                                                            const isLow = !isOut && qty <= 3;
                                                            return (
                                                                <span className={`stock-qty-pill ${isOut ? 'out-of-stock' : isLow ? 'low-stock' : ''}`}>
                                                                    {isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'In Stock'}
                                                                </span>
                                                            );
                                                        })()}
                                                    </div>
                                                </div>
                                            </td>

                                            <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                                                <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                                                    <button
                                                        className="btn btn-outline"
                                                        onClick={() => handleEdit(p)}
                                                        style={{ height: '32px', fontSize: '12px', padding: '0 10px' }}
                                                        title="Edit Article"
                                                    >
                                                        <Edit3 size={14} /> Edit
                                                    </button>
                                                    <button
                                                        className="btn btn-delete-danger"
                                                        onClick={() => handleDeleteClick(p)}
                                                        style={{ height: '32px', fontSize: '12px', padding: '0 10px', background: 'transparent' }}
                                                        title="Delete Article"
                                                    >
                                                        <Trash2 size={14} /> Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* PAGINATION CONTROLS FOOTER */}
                    {totalPages > 1 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'var(--bg-surface)', borderTop: '1px solid var(--border-subtle)' }}>
                            <span className="font-mono text-muted" style={{ fontSize: '12px' }}>
                                Showing Page {currentPage} of {totalPages}
                            </span>

                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                    className="btn btn-outline"
                                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    style={{ height: '32px', fontSize: '12px' }}
                                >
                                    <ChevronLeft size={16} /> Prev
                                </button>
                                <button
                                    className="btn btn-outline"
                                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    style={{ height: '32px', fontSize: '12px' }}
                                >
                                    Next <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}
>>>>>>> a6e2b54 (feat(admin): stock-out metrics, stock status filters, quick inline quantity controls and mobile responsiveness)
                </div>
            )}

            {/* ADD/EDIT ARTICLE MODAL */}
            {isModalOpen && typeof document !== 'undefined' && createPortal(
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(17, 24, 39, 0.6)', zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
                    <div style={{ background: '#FFFFFF', borderRadius: '12px', width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.15)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #E5E7EB', paddingBottom: '12px' }}>
                            <h3 style={{ margin: 0, fontSize: '18px', color: '#111827', fontWeight: 700 }}>{editingId ? 'Edit Article' : 'Add New Article'}</h3>
                            <button type="button" onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280' }}><X size={22} /></button>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                <div>
                                    <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>Article #</label>
                                    <input type="text" value={formData.article_no || ''} onChange={(e) => setFormData({ ...formData, article_no: e.target.value })} style={lightInputStyle} />
                                </div>
                                <div>
                                    <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>Department</label>
                                    <select value={formData.department || 'Ladies'} onChange={(e) => setFormData({ ...formData, department: e.target.value as any })} style={lightInputStyle}>
                                        <option value="Ladies">Ladies</option>
                                        <option value="Kids">Kids</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>Title / Design Name *</label>
                                <input type="text" value={formData.title || ''} onChange={(e) => setFormData({ ...formData, title: e.target.value })} style={lightInputStyle} />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                <div>
                                    <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>Retail Price (Rs) *</label>
                                    <input type="number" value={formData.retail_price || ''} onChange={(e) => setFormData({ ...formData, retail_price: Number(e.target.value) })} style={lightInputStyle} />
                                </div>
                                <div>
                                    <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>Wholesale Cost (Rs)</label>
                                    <input type="number" value={formData.wholesale_cost || ''} onChange={(e) => setFormData({ ...formData, wholesale_cost: Number(e.target.value) })} style={lightInputStyle} />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                <div>
                                    <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>Category</label>
                                    <input type="text" value={formData.category || ''} onChange={(e) => setFormData({ ...formData, category: e.target.value })} style={lightInputStyle} />
                                </div>
                                <div>
                                    <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>Fabric Type</label>
                                    <input type="text" value={formData.fabric_type || ''} onChange={(e) => setFormData({ ...formData, fabric_type: e.target.value })} style={lightInputStyle} />
                                </div>
                            </div>

                            {/* DUAL IMAGE UPLOAD SYSTEM */}
                            <div style={{ background: '#F9FAFB', padding: '12px', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
                                <label style={{ fontSize: '13px', fontWeight: 700, color: '#111827', display: 'block', marginBottom: '8px' }}>Product Images</label>
                                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                                    <input type="text" placeholder="Paste image URL here..." value={imageUrlInput} onChange={(e) => setImageUrlInput(e.target.value)} style={{ ...lightInputStyle, marginTop: 0, flex: 1 }} />
                                    <button type="button" onClick={handleAddImageUrl} style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #D1D5DB', background: '#FFFFFF', color: '#374151', fontWeight: 600, cursor: 'pointer' }}>Add URL</button>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <label style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #D1D5DB', background: '#FFFFFF', color: '#374151', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                        <Upload size={16} /> Upload Image
                                        <input type="file" multiple accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
                                    </label>
                                    {uploadingImage && <span style={{ fontSize: '12px', color: '#4F46E5', fontWeight: 600 }}>Uploading... {uploadProgress}%</span>}
                                </div>
                                {getSafeImagesArray(formData.images).length > 0 && (
                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
                                        {getSafeImagesArray(formData.images).map((img, i) => (
                                            <div key={i} style={{ position: 'relative', width: '64px', height: '64px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #D1D5DB' }}>
                                                <img src={img} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                <button type="button" onClick={() => handleRemoveImage(i)} style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(239,68,68,0.9)', color: '#fff', border: 'none', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '12px' }}>×</button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                                <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '10px 18px', borderRadius: '8px', border: '1px solid #D1D5DB', background: '#FFFFFF', color: '#374151', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                                <button type="button" disabled={saving} onClick={handleDirectSave} style={{ padding: '10px 18px', borderRadius: '8px', border: 'none', background: '#E52535', color: '#FFFFFF', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
                                    {saving ? 'Saving...' : (editingId ? 'Save Changes' : 'Create Article')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* DELETE MODAL */}
            {deleteId && typeof document !== 'undefined' && createPortal(
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(17, 24, 39, 0.6)', zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
                    <div style={{ background: '#FFFFFF', borderRadius: '12px', maxWidth: '400px', width: '100%', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.15)' }}>
                        <h3 style={{ margin: 0, color: '#111827', fontWeight: 700 }}>Confirm Delete</h3>
                        <p style={{ color: '#4B5563', margin: '12px 0 20px', fontSize: '14px' }}>Are you sure you want to delete "{deletingProduct?.title || 'this item'}"?</p>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                            <button type="button" onClick={() => setDeleteId(null)} style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #D1D5DB', background: '#FFFFFF', color: '#374151', cursor: 'pointer' }}>Cancel</button>
                            <button type="button" onClick={handleConfirmDelete} style={{ padding: '10px 16px', borderRadius: '8px', border: 'none', background: '#EF4444', color: '#FFFFFF', fontWeight: 700, cursor: 'pointer' }}>Delete</button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default AdminProducts;
