import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { fetchProducts, upsertProduct, toggleProductStock, deleteProduct, Product, supabase } from '../lib/supabase';
import { useToast } from '../context/ToastContext';
import { processAndUploadImage } from '../utils/imageUpload';
import {
    Plus, Edit3, Trash2, X, Upload, CheckCircle, XCircle, RefreshCw, Search,
    Download, FileSpreadsheet, GripVertical, ChevronLeft, ChevronRight, AlertTriangle
} from 'lucide-react';
import './AdminProducts.css';

const INITIAL_FORM_STATE: Partial<Product> = {
    article_no: '',
    title: '',
    description: '',
    retail_price: 0,
    wholesale_cost: 0,
    category: 'Girls',
    fabric_type: 'Cotton Lawn',
    images: [],
    in_stock: true,
};

interface BulkRowResult {
    rowNumber: number;
    title: string;
    valid: boolean;
    error?: string;
    data?: Partial<Product>;
}

interface AdminProductsProps {
    defaultDepartment?: 'Ladies' | 'Kids';
}

const AdminProducts: React.FC<AdminProductsProps> = ({ defaultDepartment }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [selectedDepartment, setSelectedDepartment] = useState<'Ladies' | 'Kids' | 'All'>(
        defaultDepartment || 'All'
    );
    const [formData, setFormData] = useState<Partial<Product>>(INITIAL_FORM_STATE);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (defaultDepartment) {
            setSelectedDepartment(defaultDepartment);
        }
    }, [defaultDepartment]);

    // Body scroll lock containment when any admin modal is active
    useEffect(() => {
        const isAnyModalOpen = isModalOpen || isBulkModalOpen || !!deleteId;
        if (isAnyModalOpen) {
            const originalOverflow = document.body.style.overflow;
            const originalTouchAction = document.body.style.touchAction;
            document.body.style.overflow = 'hidden';
            document.body.style.touchAction = 'none';
            return () => {
                document.body.style.overflow = originalOverflow;
                document.body.style.touchAction = originalTouchAction;
            };
        }
    }, [isModalOpen, isBulkModalOpen, deleteId]);

    // Pagination State (24, 48, 96 per page)
    const [pageSize, setPageSize] = useState<number>(24);
    const [currentPage, setCurrentPage] = useState<number>(1);

    // Bulk Import Modal State
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    const [bulkResults, setBulkResults] = useState<BulkRowResult[]>([]);
    const [bulkImporting, setBulkImporting] = useState(false);

    // Drag and Drop reordering state
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

    const { showToast } = useToast();

    const loadProducts = useCallback(async () => {
        setLoading(true);
        try {
            const data = await fetchProducts({
                search_term: searchTerm,
                department: selectedDepartment !== 'All' ? selectedDepartment : undefined,
            });
            data.sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0));
            setProducts(data);
        } catch (err) {
            showToast('Failed to load products', 'error');
        } finally {
            setLoading(false);
        }
    }, [searchTerm, selectedDepartment, showToast]);

    useEffect(() => {
        loadProducts();
    }, [loadProducts]);

    // PAGINATION CALCULATIONS
    const totalPages = Math.ceil(products.length / pageSize) || 1;
    const paginatedProducts = products.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    // Delete Article state
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

    const handleDeleteClick = (product: Product) => {
        setDeletingProduct(product);
        setDeleteId(product.id);
    };

    const handleConfirmDelete = async () => {
        if (!deleteId) return;
        const success = await deleteProduct(deleteId);
        if (success) {
            showToast(`Article "${deletingProduct?.title || deleteId}" deleted permanently!`, 'success');
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
            title: product.title,
            description: product.description || '',
            retail_price: product.retail_price,
            wholesale_cost: product.wholesale_cost || 0,
            category: product.category || 'Girls',
            fabric_type: product.fabric_type || '',
            images: product.images || [],
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
            setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, in_stock: newStock, stock_quantity: newStock ? (p.stock_quantity || 10) : 0 } : p)));
        } else {
            showToast('Stock status update failed', 'error');
        }
    };

    const [imageUrlInput, setImageUrlInput] = useState('');

    const handleAddImageUrl = (e?: React.MouseEvent) => {
        if (e) e.preventDefault();
        if (!imageUrlInput.trim()) return;
        setFormData((prev) => ({
            ...prev,
            images: [...(prev.images || []), imageUrlInput.trim()],
        }));
        setImageUrlInput('');
        showToast('Image URL added to article listing!', 'success');
    };

    const handleRemoveImage = (indexToRemove: number) => {
        setFormData((prev) => ({
            ...prev,
            images: (prev.images || []).filter((_, idx) => idx !== indexToRemove),
        }));
        showToast('Image removed.', 'info');
    };

    const [uploadProgress, setUploadProgress] = useState<number>(0);

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
                    images: [...(prev.images || []), ...uploadedUrls],
                }));
                showToast(`Converted to WebP (1200px max, ~100KB) & uploaded ${uploadedUrls.length} file(s)!`, 'success');
            } else {
                showToast('Image processing or upload failed.', 'error');
            }
        } catch (err) {
            console.error('Image WebP conversion & upload error:', err);
            showToast('Failed to process or upload image.', 'error');
        } finally {
            setUploadingImage(false);
            setUploadProgress(0);
            e.target.value = '';
        }
    };

    const handleOpenCreateModal = () => {
        setEditingId(null);
        const isLadies = selectedDepartment === 'Ladies';
        setFormData({
            article_no: isLadies ? `OMN-L-${Math.floor(100 + Math.random() * 900)}` : `OMN-K-${Math.floor(100 + Math.random() * 900)}`,
            title: '',
            description: '',
            retail_price: isLadies ? 6500 : undefined,
            wholesale_cost: 0,
            category: isLadies ? 'Ladies Wear' : 'Girls',
            department: selectedDepartment !== 'All' ? selectedDepartment : 'Ladies',
            fabric_type: isLadies ? 'Plush Velvet & Silk' : 'Cotton Lawn',
            images: [],
            stock_quantity: 10,
            in_stock: true,
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.title.trim() || formData.retail_price === undefined || formData.retail_price === null || isNaN(Number(formData.retail_price))) {
            showToast('Valid Title and Retail Price are required', 'error');
            return;
        }

        const margin = (Number(formData.retail_price) || 0) - (Number(formData.wholesale_cost) || 0);
        const stockQty = formData.stock_quantity !== undefined && !isNaN(Number(formData.stock_quantity)) 
            ? Number(formData.stock_quantity) 
            : 10;

        const payload: Partial<Product> = {
            ...(editingId ? { id: editingId } : {}),
            article_no: formData.article_no?.trim() || `CB-${Math.floor(100 + Math.random() * 900)}`,
            title: formData.title.trim(),
            description: formData.description || '',
            retail_price: Number(formData.retail_price),
            wholesale_cost: Number(formData.wholesale_cost || 0),
            margin: margin > 0 ? margin : 0,
            category: formData.category || 'Ladies Wear',
            department: formData.department || (selectedDepartment !== 'All' ? selectedDepartment : 'Ladies'),
            fabric_type: formData.fabric_type || 'Pure Raw Silk 80g',
            images: formData.images && formData.images.length > 0 ? formData.images : ['https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=800&q=80'],
            stock_quantity: stockQty,
            in_stock: stockQty > 0 ? (formData.in_stock ?? true) : false,
        };

        const result = await upsertProduct(payload);
        if (result) {
            showToast(editingId ? 'Article inventory updated successfully!' : 'New article created & auto-aligned at top!', 'success');
            setIsModalOpen(false);
            setEditingId(null);
            setFormData(INITIAL_FORM_STATE);

            // Auto-align new/updated article prepended at index 0 and reset pagination to page 1
            setProducts((prev) => {
                const filtered = prev.filter((p) => p.id !== result.id && (!editingId || p.id !== editingId));
                return [result, ...filtered];
            });
            setCurrentPage(1);

            // Notify storefront & all components
            window.dispatchEvent(new Event('products-updated'));
            loadProducts();
        } else {
            showToast('Save failed. Please check inputs and try again.', 'error');
        }
    };

    // 2. DRAG AND DROP REORDERING HANDLERS
    const handleDragStart = (e: React.DragEvent, index: number) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = async (e: React.DragEvent, targetIndex: number) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === targetIndex) return;

        const updated = [...products];
        const [movedItem] = updated.splice(draggedIndex, 1);
        updated.splice(targetIndex, 0, movedItem);

        // Update display_order property
        const reordered = updated.map((item, idx) => ({
            ...item,
            display_order: idx + 1,
        }));

        setProducts(reordered);
        setDraggedIndex(null);

        // Batch update display_order to Supabase
        try {
            const updates = reordered.map((item) => ({
                id: item.id,
                title: item.title,
                retail_price: item.retail_price,
                category: item.category,
                display_order: item.display_order,
            }));
            await supabase.from('products').upsert(updates);
            showToast('Product display order saved!', 'success');
        } catch (err) {
            console.error('Reorder error:', err);
        }
    };

    // 3. BULK CSV TEMPLATE DOWNLOAD & IMPORT
    const handleDownloadCsvTemplate = () => {
        const csvContent =
            'title,article_no,retail_price,wholesale_cost,category,fabric_type,description,in_stock,images\n' +
            'Noor-e-Zari Velvet Suit,CB-201,18500,9500,Luxury Formals,Plush Micro-Velvet,Hand-embroidered zardozi velvet suit,true,https://images.unsplash.com/photo-1583391733956-6c78276477e2\n' +
            'Mah-ru Raw Silk Co-ord,CB-202,14200,7200,Pret / Ready-to-Wear,Pure Raw Silk 80g,Tailored raw silk tunic with pearl embellishments,true,https://images.unsplash.com/photo-1610030469983-98e550d6193c';

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'omnora_product_import_template.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleCsvFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            if (!text) return;

            const lines = text.split('\n').map((line) => line.trim()).filter(Boolean);
            if (lines.length <= 1) {
                showToast('CSV file is empty or missing data rows.', 'error');
                return;
            }

            const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
            const results: BulkRowResult[] = [];

            for (let i = 1; i < lines.length; i++) {
                const row = lines[i].split(',').map((cell) => cell.trim());
                if (row.length === 0 || (row.length === 1 && !row[0])) continue;

                const getVal = (headerName: string) => {
                    const idx = headers.indexOf(headerName);
                    return idx > -1 ? row[idx] : '';
                };

                const title = getVal('title');
                const article_no = getVal('article_no');
                const retailPriceStr = getVal('retail_price');
                const wholesaleCostStr = getVal('wholesale_cost');
                const category = getVal('category') || 'Unstitched Luxury';
                const fabric_type = getVal('fabric_type') || 'Pure Raw Silk 80g';
                const description = getVal('description');
                const inStockStr = getVal('in_stock');
                const imageStr = getVal('images');

                const retail_price = Number(retailPriceStr);
                const wholesale_cost = Number(wholesaleCostStr || 0);

                if (!title) {
                    results.push({ rowNumber: i, title: title || `Row ${i}`, valid: false, error: 'Missing required field: title' });
                    continue;
                }

                if (isNaN(retail_price) || retail_price <= 0) {
                    results.push({ rowNumber: i, title, valid: false, error: `Invalid retail_price: "${retailPriceStr}". Must be a number > 0.` });
                    continue;
                }

                results.push({
                    rowNumber: i,
                    title,
                    valid: true,
                    data: {
                        title,
                        article_no,
                        retail_price,
                        wholesale_cost,
                        margin: retail_price - wholesale_cost,
                        category,
                        fabric_type,
                        description,
                        in_stock: inStockStr.toLowerCase() !== 'false',
                        images: imageStr ? [imageStr] : ['/images/omnora.jpg'],
                    },
                });
            }

            setBulkResults(results);
        };
        reader.readAsText(file);
    };

    const handleCommitBulkImport = async () => {
        const validRows = bulkResults.filter((r) => r.valid && r.data).map((r) => r.data!);
        if (validRows.length === 0) {
            showToast('No valid rows available to import.', 'error');
            return;
        }

        setBulkImporting(true);
        try {
            const { error } = await supabase.from('products').insert(validRows);
            if (error) {
                showToast(`Bulk insert failed: ${error.message}`, 'error');
            } else {
                showToast(`Successfully imported ${validRows.length} products!`, 'success');
                setIsBulkModalOpen(false);
                setBulkResults([]);
                loadProducts();
            }
        } catch (err) {
            console.error('Bulk insert error:', err);
            showToast('Bulk import failed.', 'error');
        } finally {
            setBulkImporting(false);
        }
    };

    return (
        <div className="admin-products-container">
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
                >
                    ✨ Ladies Wear Admin
                </button>
                <button
                    onClick={() => setSelectedDepartment('Kids')}
                    className="btn"
                    style={{
                        backgroundColor: selectedDepartment === 'Kids' ? '#E52535' : 'var(--bg-card)',
                        color: selectedDepartment === 'Kids' ? '#FFFFFF' : 'var(--text-main)',
                        fontWeight: 700,
                        border: '1px solid var(--border-subtle)',
                        padding: '10px 18px',
                        cursor: 'pointer',
                        borderRadius: 'var(--radius-md)',
                        boxShadow: selectedDepartment === 'Kids' ? '0 4px 12px rgba(229,37,53,0.2)' : 'none',
                    }}
                >
                    👑 Kids Wear Admin
                </button>
                <button
                    onClick={() => setSelectedDepartment('All')}
                    className="btn"
                    style={{
                        backgroundColor: selectedDepartment === 'All' ? 'var(--bg-surface)' : 'var(--bg-card)',
                        color: 'var(--text-main)',
                        fontWeight: 600,
                        border: '1px solid var(--border-subtle)',
                        padding: '10px 16px',
                        cursor: 'pointer',
                        borderRadius: 'var(--radius-md)',
                    }}
                >
                    All Inventory
                </button>
            </div>

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

            {/* CONTROLS BAR: SEARCH & PAGINATION SELECTOR */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px', background: 'var(--bg-card)', padding: '12px 16px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
                {/* SEARCH */}
                <div style={{ position: 'relative', width: '320px' }}>
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
                        Total: {products.length} Products
                    </div>
                </div>
            </div>

            {/* PRODUCTS DATA TABLE WITH DRAG & DROP REORDERING */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
                    <RefreshCw size={24} className="spin" style={{ marginBottom: '10px' }} />
                    <p style={{ fontSize: '13px' }}>Fetching article inventory...</p>
                </div>
            ) : (
                <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                            <thead>
                                <tr style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                                    <th style={{ padding: '12px 16px', width: '40px' }}>Rank</th>
                                    <th style={{ padding: '12px 16px' }}>Image (3:4 Aspect)</th>
                                    <th style={{ padding: '12px 16px' }}>Article No</th>
                                    <th style={{ padding: '12px 16px' }}>Title</th>
                                    <th style={{ padding: '12px 16px' }}>Category / Blend</th>
                                    <th style={{ padding: '12px 16px' }}>Retail Price</th>
                                    <th style={{ padding: '12px 16px' }}>Wholesale Cost</th>
                                    <th style={{ padding: '12px 16px' }}>Stock</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedProducts.map((p, index) => {
                                    const globalIndex = (currentPage - 1) * pageSize + index;
                                    return (
                                        <tr
                                            key={p.id}
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, globalIndex)}
                                            onDragOver={handleDragOver}
                                            onDrop={(e) => handleDrop(e, globalIndex)}
                                            style={{
                                                borderBottom: '1px solid var(--border-subtle)',
                                                transition: 'background 0.15s ease',
                                                cursor: 'grab',
                                            }}
                                        >
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
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
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
                                                    <span className={`stock-qty-pill ${(!p.in_stock || (p.stock_quantity !== undefined && p.stock_quantity <= 0)) ? 'out-of-stock' : ''}`}>
                                                        {p.stock_quantity !== undefined ? `${p.stock_quantity} Units` : '10 Units'}
                                                    </span>
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
                </div>
            )}

            {/* CREATE / EDIT ARTICLE MODAL WITH ASPECT RATIO LOCK */}
            {isModalOpen && createPortal(
                <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="modal-card font-sans" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 style={{ margin: 0 }}>{editingId ? 'Edit Article' : 'Create New Article'}</h3>
                            <button
                                type="button"
                                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px' }}
                                onClick={() => setIsModalOpen(false)}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: '1 1 auto', minHeight: 0, overflow: 'hidden' }}>
                            <div className="modal-scrollable-body">
                                <div className="admin-form-grid">
                                    <div className="admin-form-group">
                                        <label>Article Number *</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. CB-101"
                                            value={formData.article_no || ''}
                                            onChange={(e) => setFormData((prev) => ({ ...prev, article_no: e.target.value }))}
                                            className="form-input font-mono"
                                            required
                                        />
                                    </div>

                                    <div className="admin-form-group">
                                        <label>Title *</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Noor-e-Zari Hand-Embroidered Velvet Suit"
                                            value={formData.title || ''}
                                            onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                                            className="form-input"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="admin-form-grid">
                                    <div className="admin-form-group">
                                        <label>Department / Wear Group</label>
                                        <select
                                            value={formData.department || 'Ladies'}
                                            onChange={(e) => setFormData((prev) => ({ ...prev, department: e.target.value as any }))}
                                            className="form-input"
                                        >
                                            <option value="Ladies">Ladies Wear Collection</option>
                                            <option value="Kids">Kids Wear Collection</option>
                                        </select>
                                    </div>

                                    <div className="admin-form-group">
                                        <label>Category</label>
                                        <select
                                            value={formData.category || 'Ladies Wear'}
                                            onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                                            className="form-input"
                                        >
                                            <option value="Ladies Wear">Ladies Wear</option>
                                            <option value="Luxury Formals">Luxury Formals</option>
                                            <option value="Pret / Ready-to-Wear">Pret / Ready-to-Wear</option>
                                            <option value="Unstitched Luxury">Unstitched Luxury</option>
                                            <option value="Girls">Girls Wear</option>
                                            <option value="Kids Wear">Kids Wear</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="admin-form-grid">
                                    <div className="admin-form-group">
                                        <label>Retail Price (PKR) *</label>
                                        <input
                                            type="number"
                                            value={formData.retail_price || ''}
                                            onChange={(e) => setFormData((prev) => ({ ...prev, retail_price: Number(e.target.value) }))}
                                            className="form-input font-mono"
                                            required
                                        />
                                    </div>

                                    <div className="admin-form-group">
                                        <label>Wholesale Cost (PKR)</label>
                                        <input
                                            type="number"
                                            value={formData.wholesale_cost || ''}
                                            onChange={(e) => setFormData((prev) => ({ ...prev, wholesale_cost: Number(e.target.value) }))}
                                            className="form-input font-mono"
                                        />
                                    </div>

                                    <div className="admin-form-group">
                                        <label>Available Stock Quantity (Units) *</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={formData.stock_quantity !== undefined ? formData.stock_quantity : 10}
                                            onChange={(e) => {
                                                const qty = Number(e.target.value);
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    stock_quantity: qty,
                                                    in_stock: qty > 0
                                                }));
                                            }}
                                            className="form-input font-mono"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="admin-form-group">
                                    <label>Description</label>
                                    <textarea
                                        value={formData.description || ''}
                                        onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                                        className="form-input"
                                        rows={3}
                                    />
                                </div>

                                {/* DUAL IMAGE MANAGEMENT: FILE UPLOAD OR URL INPUT */}
                                <div className="admin-form-group">
                                    <label>Product Images (File Upload or Image URL)</label>
                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '10px' }}>
                                        <label className="btn btn-outline" style={{ cursor: 'pointer', height: '36px', fontSize: '12px' }}>
                                            <Upload size={14} /> {uploadingImage ? 'Cropping & Processing...' : 'Upload Image (3:4 Lock)'}
                                            <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} disabled={uploadingImage} />
                                        </label>

                                        <div style={{ display: 'flex', gap: '6px', flex: 1, minWidth: '220px' }}>
                                            <input
                                                type="url"
                                                placeholder="Or paste Image URL (e.g. https://...)"
                                                value={imageUrlInput}
                                                onChange={(e) => setImageUrlInput(e.target.value)}
                                                className="form-input"
                                                style={{ fontSize: '12px', height: '36px', flex: 1 }}
                                            />
                                            <button
                                                type="button"
                                                className="btn btn-outline"
                                                onClick={handleAddImageUrl}
                                                style={{ height: '36px', fontSize: '12px', padding: '0 12px' }}
                                            >
                                                + Add
                                            </button>
                                        </div>
                                    </div>

                                    {/* PREVIEW THUMBNAILS WITH REMOVE BADGE */}
                                    {formData.images && formData.images.length > 0 && (
                                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
                                            {formData.images.map((url, i) => (
                                                <div key={i} style={{ position: 'relative', width: '64px', height: '85px', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border-subtle)', background: '#000' }}>
                                                    <img src={url} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveImage(i)}
                                                        title="Remove image"
                                                        style={{
                                                            position: 'absolute',
                                                            top: '3px',
                                                            right: '3px',
                                                            background: 'rgba(239, 68, 68, 0.95)',
                                                            color: '#fff',
                                                            border: 'none',
                                                            borderRadius: '50%',
                                                            width: '18px',
                                                            height: '18px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            cursor: 'pointer',
                                                            padding: 0
                                                        }}
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-emerald">
                                    Save Article
                                </button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}

            {/* BULK IMPORT MODAL WITH VALIDATION REPORT */}
            {isBulkModalOpen && createPortal(
                <div className="modal-overlay" onClick={() => setIsBulkModalOpen(false)}>
                    <div className="modal-card" style={{ maxWidth: '720px' }} onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <FileSpreadsheet size={20} className="text-emerald" />
                                <h3 style={{ margin: 0 }}>Bulk Import Product Catalog (CSV)</h3>
                            </div>
                            <button
                                type="button"
                                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px' }}
                                onClick={() => setIsBulkModalOpen(false)}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="modal-scrollable-body">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', background: 'var(--bg-surface, #f8fafc)', padding: '12px', borderRadius: 'var(--radius-md, 8px)', flexWrap: 'wrap', gap: '10px' }}>
                                <div>
                                    <h4 style={{ margin: 0, fontSize: '14px' }}>Step 1: Download CSV Template</h4>
                                    <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>Contains required headers: title, article_no, retail_price, category, etc.</p>
                                </div>
                                <button className="btn btn-outline" onClick={handleDownloadCsvTemplate} style={{ fontSize: '12px', height: '34px' }}>
                                    <Download size={14} /> Download Template
                                </button>
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                                    Step 2: Upload Completed CSV File
                                </label>
                                <input type="file" accept=".csv" onChange={handleCsvFileUpload} className="form-input" style={{ width: '100%' }} />
                            </div>

                            {/* VALIDATION REPORT TABLE */}
                            {bulkResults.length > 0 && (
                                <div style={{ marginTop: '16px', background: 'var(--bg-surface, #f8fafc)', borderRadius: 'var(--radius-md, 8px)', padding: '12px', border: '1px solid var(--border-subtle, #e2e8f0)' }}>
                                    <h4 style={{ margin: '0 0 8px 0', fontSize: '13px' }}>Validation Summary Report</h4>
                                    <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                        <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
                                            <thead>
                                                <tr style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border-subtle, #e2e8f0)' }}>
                                                    <th style={{ textAlign: 'left', padding: '6px' }}>Row #</th>
                                                    <th style={{ textAlign: 'left', padding: '6px' }}>Title</th>
                                                    <th style={{ textAlign: 'center', padding: '6px' }}>Status</th>
                                                    <th style={{ textAlign: 'left', padding: '6px' }}>Validation Details</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {bulkResults.map((r, idx) => (
                                                    <tr key={idx} style={{ borderBottom: '1px solid var(--border-subtle, #e2e8f0)' }}>
                                                        <td style={{ padding: '6px' }}>{r.rowNumber}</td>
                                                        <td style={{ padding: '6px' }}>{r.title || 'N/A'}</td>
                                                        <td style={{ padding: '6px', textAlign: 'center' }}>
                                                            {r.valid ? (
                                                                <CheckCircle size={16} className="text-emerald" style={{ display: 'inline' }} />
                                                            ) : (
                                                                <XCircle size={16} style={{ color: '#ef4444', display: 'inline' }} />
                                                            )}
                                                        </td>
                                                        <td style={{ padding: '6px', color: r.valid ? 'var(--text-muted)' : '#ef4444' }}>
                                                            {r.valid ? 'Valid format' : r.error}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="modal-footer">
                            <button type="button" className="btn btn-outline" onClick={() => setIsBulkModalOpen(false)}>
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="btn btn-emerald"
                                onClick={handleCommitBulkImport}
                                disabled={bulkImporting || bulkResults.filter((r) => r.valid).length === 0}
                            >
                                {bulkImporting ? 'Importing...' : `Commit ${bulkResults.filter((r) => r.valid).length} Valid Products`}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* DELETE ARTICLE CONFIRMATION MODAL */}
            {deleteId && createPortal(
                <div className="modal-overlay" onClick={() => setDeleteId(null)}>
                    <div className="modal-card" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header" style={{ borderColor: 'rgba(239, 68, 68, 0.3)' }}>
                            <h3 style={{ color: '#EF4444', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                                <AlertTriangle size={18} /> Delete Article Permanently
                            </h3>
                            <button
                                type="button"
                                style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px' }}
                                onClick={() => setDeleteId(null)}
                            >
                                <X size={18} />
                            </button>
                        </div>
                        <div className="modal-scrollable-body" style={{ color: '#1E293B', fontSize: '14px', lineHeight: 1.5 }}>
                            Are you sure you want to delete <strong>"{deletingProduct?.title || deleteId}"</strong> (Article No: {deletingProduct?.article_no || 'N/A'})?
                            <p style={{ margin: '10px 0 0 0', color: '#64748B', fontSize: '12px' }}>This action cannot be undone and will remove it permanently from the store inventory catalog.</p>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-outline" onClick={() => setDeleteId(null)}>Cancel</button>
                            <button 
                                type="button"
                                className="btn" 
                                onClick={handleConfirmDelete} 
                                style={{ background: '#EF4444', color: '#FFFFFF', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
                            >
                                Delete Article
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default AdminProducts;