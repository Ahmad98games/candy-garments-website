import React, { useState, useEffect, useCallback } from 'react';
import { fetchProducts, upsertProduct, toggleProductStock, deleteProduct, Product, supabase } from '../lib/supabase';
import { useToast } from '../context/ToastContext';
import { processAndUploadImage } from '../utils/imageUpload';
import {
    Plus, Edit3, Trash2, X, Upload, CheckCircle, XCircle, RefreshCw, Search,
    FileSpreadsheet, GripVertical, AlertTriangle
} from 'lucide-react';
import './AdminProducts.css';

const INITIAL_FORM_STATE: Partial<Product> = {
    article_no: '',
    title: '',
    description: '',
    retail_price: 0,
    wholesale_cost: 0,
    category: 'Girls',
    department: 'Ladies',
    fabric_type: 'Cotton Lawn',
    images: [],
    stock_quantity: 10,
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
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

    const [editingId, setEditingId] = useState<string | null>(null);
    const [selectedDepartment, setSelectedDepartment] = useState<'Ladies' | 'Kids' | 'All'>(
        defaultDepartment || 'All'
    );
    const [formData, setFormData] = useState<Partial<Product>>(INITIAL_FORM_STATE);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const [pageSize, setPageSize] = useState<number>(24);
    const [currentPage, setCurrentPage] = useState<number>(1);

    const [bulkResults, setBulkResults] = useState<BulkRowResult[]>([]);
    const [bulkImporting, setBulkImporting] = useState(false);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [imageUrlInput, setImageUrlInput] = useState('');
    const [uploadProgress, setUploadProgress] = useState<number>(0);

    const { showToast } = useToast();

    useEffect(() => {
        if (defaultDepartment) {
            setSelectedDepartment(defaultDepartment);
        }
    }, [defaultDepartment]);

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

    const loadProducts = useCallback(async () => {
        setLoading(true);
        try {
            const data = await fetchProducts({
                search_term: searchTerm,
                department: selectedDepartment !== 'All' ? selectedDepartment : undefined,
            });
            const safeData = Array.isArray(data) ? data : [];
            safeData.sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0));
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

    const totalPages = Math.ceil((products || []).length / pageSize) || 1;
    const paginatedProducts = (products || []).slice((currentPage - 1) * pageSize, currentPage * pageSize);

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
            department: product.department || 'Ladies',
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
                showToast(`Uploaded ${uploadedUrls.length} file(s)!`, 'success');
            } else {
                showToast('Image processing or upload failed.', 'error');
            }
        } catch (err) {
            console.error('Image upload error:', err);
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
            retail_price: isLadies ? 6500 : 3500,
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
            showToast(editingId ? 'Article updated successfully!' : 'New article created!', 'success');
            setIsModalOpen(false);
            setEditingId(null);
            setFormData(INITIAL_FORM_STATE);

            setProducts((prev) => {
                const filtered = prev.filter((p) => p.id !== result.id && (!editingId || p.id !== editingId));
                return [result, ...filtered];
            });
            setCurrentPage(1);

            window.dispatchEvent(new Event('products-updated'));
            loadProducts();
        } else {
            showToast('Save failed. Please check inputs and try again.', 'error');
        }
    };

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

        const reordered = updated.map((item, idx) => ({
            ...item,
            display_order: idx + 1,
        }));

        setProducts(reordered);
        setDraggedIndex(null);

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
                const category = getVal('category') || 'Ladies Wear';
                const fabric_type = getVal('fabric_type') || 'Pure Raw Silk 80g';
                const description = getVal('description');
                const inStockStr = getVal('in_stock');
                const imageStr = getVal('images');

                const retail_price = Number(retailPriceStr);
                const wholesale_cost = Number(wholesaleCostStr || 0);

                if (!title) {
                    results.push({ rowNumber: i, title: `Row ${i}`, valid: false, error: 'Missing title' });
                    continue;
                }

                if (isNaN(retail_price) || retail_price <= 0) {
                    results.push({ rowNumber: i, title, valid: false, error: 'Invalid retail price' });
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
                        images: imageStr ? [imageStr] : ['https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=800&q=80'],
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
                        backgroundColor: selectedDepartment === 'All' ? 'var(--primary-color, #4F46E5)' : 'var(--bg-card)',
                        color: '#FFFFFF',
                        fontWeight: 700,
                        border: '1px solid var(--border-subtle)',
                        padding: '10px 18px',
                        cursor: 'pointer',
                        borderRadius: 'var(--radius-md)',
                    }}
                >
                    📦 All Inventory
                </button>
            </div>

            {/* ACTION BAR: SEARCH & BUTTONS */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '10px', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', minWidth: '240px', flex: 1 }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                    <input
                        type="text"
                        placeholder="Search by title, article #..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: '100%', padding: '10px 10px 10px 38px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                    />
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={handleOpenCreateModal} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Plus size={18} /> Add Article
                    </button>
                    <button onClick={() => setIsBulkModalOpen(true)} className="btn" style={{ display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid var(--border-subtle)' }}>
                        <FileSpreadsheet size={18} /> Bulk CSV
                    </button>
                    <button onClick={loadProducts} className="btn" style={{ border: '1px solid var(--border-subtle)' }}>
                        <RefreshCw size={18} />
                    </button>
                </div>
            </div>

            {/* PRODUCT LISTING / TABLE */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>Loading catalog...</div>
            ) : paginatedProducts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)' }}>
                    No products found in this category.
                </div>
            ) : (
                <div className="product-table-wrapper" style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                                <th style={{ padding: '12px' }}>#</th>
                                <th style={{ padding: '12px' }}>Article</th>
                                <th style={{ padding: '12px' }}>Title</th>
                                <th style={{ padding: '12px' }}>Category</th>
                                <th style={{ padding: '12px' }}>Retail Price</th>
                                <th style={{ padding: '12px' }}>Stock</th>
                                <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedProducts.map((product, idx) => (
                                <tr
                                    key={product.id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, idx)}
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => handleDrop(e, idx)}
                                    style={{ borderBottom: '1px solid var(--border-subtle)', cursor: 'grab' }}
                                >
                                    <td style={{ padding: '12px' }}>
                                        <GripVertical size={16} style={{ opacity: 0.4 }} />
                                    </td>
                                    <td style={{ padding: '12px', fontWeight: 600 }}>{product.article_no || 'N/A'}</td>
                                    <td style={{ padding: '12px' }}>{product.title}</td>
                                    <td style={{ padding: '12px' }}>{product.category}</td>
                                    <td style={{ padding: '12px', fontWeight: 600 }}>Rs {product.retail_price?.toLocaleString()}</td>
                                    <td style={{ padding: '12px' }}>
                                        <button
                                            onClick={() => handleToggleStock(product)}
                                            style={{
                                                padding: '4px 8px',
                                                borderRadius: '4px',
                                                border: 'none',
                                                cursor: 'pointer',
                                                background: product.in_stock ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                                color: product.in_stock ? '#10B981' : '#EF4444',
                                                fontWeight: 600,
                                            }}
                                        >
                                            {product.in_stock ? 'In Stock' : 'Out of Stock'}
                                        </button>
                                    </td>
                                    <td style={{ padding: '12px', textAlign: 'right' }}>
                                        <button onClick={() => handleEdit(product)} style={{ marginRight: '8px', background: 'none', border: 'none', cursor: 'pointer' }}>
                                            <Edit3 size={16} />
                                        </button>
                                        <button onClick={() => handleDeleteClick(product)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444' }}>
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* ADD / EDIT ARTICLE MODAL */}
            {isModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: '20px' }}>
                    <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: 'var(--radius-md)', maxWidth: '600px', width: '100%', maxHeight: '90vh', overflowY: 'auto', border: '1px solid var(--border-subtle)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h3 style={{ margin: 0 }}>{editingId ? 'Edit Article' : 'Create New Article'}</h3>
                            <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-main)' }}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                <div>
                                    <label style={{ fontSize: '12px', opacity: 0.8 }}>Article #</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.article_no || ''}
                                        onChange={(e) => setFormData({ ...formData, article_no: e.target.value })}
                                        style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-subtle)', background: 'var(--bg-main)', color: 'var(--text-main)' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: '12px', opacity: 0.8 }}>Department</label>
                                    <select
                                        value={formData.department || 'Ladies'}
                                        onChange={(e) => setFormData({ ...formData, department: e.target.value as any })}
                                        style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-subtle)', background: 'var(--bg-main)', color: 'var(--text-main)' }}
                                    >
                                        <option value="Ladies">Ladies</option>
                                        <option value="Kids">Kids</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label style={{ fontSize: '12px', opacity: 0.8 }}>Title / Design Name</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Royal Velvet Embroidered Suit"
                                    value={formData.title || ''}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-subtle)', background: 'var(--bg-main)', color: 'var(--text-main)' }}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                <div>
                                    <label style={{ fontSize: '12px', opacity: 0.8 }}>Retail Price (Rs)</label>
                                    <input
                                        type="number"
                                        required
                                        value={formData.retail_price || ''}
                                        onChange={(e) => setFormData({ ...formData, retail_price: Number(e.target.value) })}
                                        style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-subtle)', background: 'var(--bg-main)', color: 'var(--text-main)' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: '12px', opacity: 0.8 }}>Wholesale Cost (Rs)</label>
                                    <input
                                        type="number"
                                        value={formData.wholesale_cost || ''}
                                        onChange={(e) => setFormData({ ...formData, wholesale_cost: Number(e.target.value) })}
                                        style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-subtle)', background: 'var(--bg-main)', color: 'var(--text-main)' }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                <div>
                                    <label style={{ fontSize: '12px', opacity: 0.8 }}>Category</label>
                                    <input
                                        type="text"
                                        value={formData.category || ''}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-subtle)', background: 'var(--bg-main)', color: 'var(--text-main)' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: '12px', opacity: 0.8 }}>Fabric Type</label>
                                    <input
                                        type="text"
                                        value={formData.fabric_type || ''}
                                        onChange={(e) => setFormData({ ...formData, fabric_type: e.target.value })}
                                        style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-subtle)', background: 'var(--bg-main)', color: 'var(--text-main)' }}
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ fontSize: '12px', opacity: 0.8 }}>Images</label>
                                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                                    <input
                                        type="text"
                                        placeholder="Paste image URL..."
                                        value={imageUrlInput}
                                        onChange={(e) => setImageUrlInput(e.target.value)}
                                        style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid var(--border-subtle)', background: 'var(--bg-main)', color: 'var(--text-main)' }}
                                    />
                                    <button type="button" onClick={handleAddImageUrl} className="btn" style={{ border: '1px solid var(--border-subtle)' }}>Add URL</button>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <label className="btn" style={{ border: '1px solid var(--border-subtle)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Upload size={16} /> Upload Image
                                        <input type="file" multiple accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
                                    </label>
                                    {uploadingImage && <span style={{ fontSize: '12px' }}>Uploading... {uploadProgress}%</span>}
                                </div>

                                {formData.images && formData.images.length > 0 && (
                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px' }}>
                                        {formData.images.map((img, i) => (
                                            <div key={i} style={{ position: 'relative', width: '60px', height: '60px', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
                                                <img src={img} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                <button type="button" onClick={() => handleRemoveImage(i)} style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>×</button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                                <button type="button" className="btn" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">{editingId ? 'Save Changes' : 'Create Article'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* BULK CSV MODAL */}
            {isBulkModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: '20px' }}>
                    <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: 'var(--radius-md)', maxWidth: '500px', width: '100%', border: '1px solid var(--border-subtle)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h3 style={{ margin: 0 }}>Bulk Import Products</h3>
                            <button onClick={() => setIsBulkModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-main)' }}>
                                <X size={20} />
                            </button>
                        </div>
                        <p style={{ fontSize: '13px', opacity: 0.8 }}>Upload your CSV catalog file to import multiple articles at once.</p>
                        <div style={{ display: 'flex', gap: '10px', margin: '20px 0' }}>
                            <button onClick={handleDownloadCsvTemplate} className="btn" style={{ border: '1px solid var(--border-subtle)' }}>Download Template</button>
                            <label className="btn btn-primary" style={{ cursor: 'pointer' }}>
                                Select CSV File
                                <input type="file" accept=".csv" onChange={handleCsvFileUpload} style={{ display: 'none' }} />
                            </label>
                        </div>
                        {bulkResults.length > 0 && (
                            <div style={{ marginBottom: '16px' }}>
                                <p style={{ fontSize: '12px', fontWeight: 600 }}>Ready to import: {bulkResults.filter(r => r.valid).length} valid articles</p>
                            </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                            <button className="btn" onClick={() => setIsBulkModalOpen(false)}>Cancel</button>
                            {bulkResults.length > 0 && (
                                <button className="btn btn-primary" disabled={bulkImporting} onClick={handleCommitBulkImport}>
                                    {bulkImporting ? 'Importing...' : 'Commit Import'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* DELETE MODAL */}
            {deleteId && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999 }}>
                    <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: 'var(--radius-md)', maxWidth: '400px', width: '90%' }}>
                        <h3>Confirm Delete</h3>
                        <p style={{ marginTop: '8px', opacity: 0.8 }}>Are you sure you want to delete "{deletingProduct?.title}"?</p>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                            <button className="btn" onClick={() => setDeleteId(null)}>Cancel</button>
                            <button className="btn btn-danger" onClick={handleConfirmDelete}>Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminProducts;
