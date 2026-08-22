import React, { useState, useEffect } from 'react';
import { fetchPersonnel, upsertPersonnel, deletePersonnel, Personnel } from '../lib/supabase';
import { useToast } from '../context/ToastContext';
import { Users, Plus, Edit3, Trash2, Smartphone, CheckCircle, Clock, AlertCircle, RefreshCw } from 'lucide-react';

export default function AdminPersonnel() {
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Personnel | null>(null);
  const [formData, setFormData] = useState<Partial<Personnel>>({
    name: '',
    role: 'Master Tailor',
    phone: '',
    status: 'Active',
    assigned_articles: []
  });

  const { showToast } = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchPersonnel();
      setPersonnel(data);
    } catch (err) {
      showToast('Failed to load personnel database', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenModal = (item?: Personnel) => {
    if (item) {
      setEditingItem(item);
      setFormData(item);
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        role: 'Master Tailor',
        phone: '0331-1498773',
        status: 'Active',
        assigned_articles: []
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      showToast('Personnel Name is required', 'error');
      return;
    }

    const saved = await upsertPersonnel({
      ...formData,
      id: editingItem?.id
    });

    showToast(editingItem ? 'Karigar / Staff updated!' : 'New Personnel added to database!', 'success');
    setIsModalOpen(false);
    loadData();
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Remove "${name}" from Personnel database?`)) {
      await deletePersonnel(id);
      showToast(`Removed "${name}"`, 'info');
      setPersonnel(prev => prev.filter(p => p.id !== id));
    }
  };

  return (
    <div style={{ padding: '24px', color: '#F9FAFB' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#FFFFFF', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={24} style={{ color: '#F59E0B' }} /> Karigars & Personnel Database
          </h1>
          <p style={{ color: '#9CA3AF', fontSize: '13px', marginTop: '4px', margin: 0 }}>
            Management catalog of Karigars, Master Tailors, Embroidery Specialists, and Quality Inspectors.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={loadData}
            className="btn btn-outline"
            style={{ height: '36px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#1F2937', color: '#F9FAFB', borderColor: '#4B5563' }}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh
          </button>
          <button
            onClick={() => handleOpenModal()}
            style={{
              height: '36px',
              padding: '0 16px',
              backgroundColor: '#E52535',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Plus size={16} /> Add Personnel
          </button>
        </div>
      </div>

      {/* PERSONNEL LIST */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#9CA3AF' }}>
          <RefreshCw size={24} className="spin" style={{ color: '#F59E0B' }} />
          <p style={{ fontSize: '13px', marginTop: '12px', fontWeight: 600 }}>Loading Personnel Database...</p>
        </div>
      ) : personnel.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px', backgroundColor: '#111827', borderRadius: '12px', border: '1px solid #374151' }}>
          <Users size={40} style={{ color: '#9CA3AF', marginBottom: '12px' }} />
          <h3 style={{ fontSize: '18px', color: '#F9FAFB', margin: '0 0 6px 0', fontWeight: 700 }}>No Personnel Registered</h3>
          <p style={{ fontSize: '13px', color: '#9CA3AF', margin: '0 0 16px 0' }}>Add Karigars and Tailoring Masters to assign production articles.</p>
          <button onClick={() => handleOpenModal()} className="btn btn-primary" style={{ backgroundColor: '#E52535', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer', color: '#FFF' }}>
            + Add First Karigar
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {personnel.map((p) => (
            <div key={p.id} style={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div>
                    <span style={{ fontSize: '15px', fontWeight: 800, color: '#FFFFFF', display: 'block' }}>{p.name}</span>
                    <span style={{ fontSize: '12px', color: '#F59E0B', fontWeight: 700 }}>{p.role}</span>
                  </div>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: '4px',
                    backgroundColor: p.status === 'Active' ? 'rgba(16, 185, 129, 0.15)' : p.status === 'Busy' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    color: p.status === 'Active' ? '#10B981' : p.status === 'Busy' ? '#F59E0B' : '#EF4444',
                    border: '1px solid ' + (p.status === 'Active' ? 'rgba(16, 185, 129, 0.3)' : p.status === 'Busy' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(239, 68, 68, 0.3)')
                  }}>
                    {p.status}
                  </span>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <a href={`https://wa.me/${p.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: '13px', color: '#25D366', textDecoration: 'none', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <Smartphone size={14} /> {p.phone}
                  </a>
                </div>

                {p.assigned_articles && p.assigned_articles.length > 0 && (
                  <div style={{ backgroundColor: '#1F2937', padding: '8px 10px', borderRadius: '6px', border: '1px solid #374151', marginBottom: '12px' }}>
                    <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Assigned Articles:</span>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {p.assigned_articles.map((art) => (
                        <span key={art} className="font-mono" style={{ backgroundColor: '#374151', color: '#F9FAFB', fontSize: '11px', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                          {art}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', borderTop: '1px solid #1F2937', paddingTop: '10px' }}>
                <button
                  onClick={() => handleOpenModal(p)}
                  style={{ height: '30px', padding: '0 10px', backgroundColor: '#1F2937', color: '#F9FAFB', border: '1px solid #4B5563', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}
                >
                  <Edit3 size={13} /> Edit
                </button>
                <button
                  onClick={() => handleDelete(p.id, p.name)}
                  style={{ height: '30px', padding: '0 10px', backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#EF4444', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}
                >
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD / EDIT MODAL */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '440px', padding: '0' }}>
            <div className="modal-header">
              <h3>{editingItem ? 'Edit Karigar / Personnel' : 'Add New Personnel'}</h3>
              <button style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer' }} onClick={() => setIsModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="admin-form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Master Ahmad Ali"
                  className="form-input"
                  required
                />
              </div>

              <div className="admin-form-group">
                <label>Role / Craft Specialization</label>
                <select
                  value={formData.role || 'Master Tailor'}
                  onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                  className="form-input"
                >
                  <option value="Master Tailor (Pret & Velvet)">Master Tailor (Pret & Velvet)</option>
                  <option value="Embroidery Master (Zardozi & Adda)">Embroidery Master (Zardozi & Adda)</option>
                  <option value="Cutting Specialist">Cutting Specialist</option>
                  <option value="Quality Checker & Dispatch">Quality Checker & Dispatch</option>
                  <option value="Finishing & Packing">Finishing & Packing</option>
                </select>
              </div>

              <div className="admin-form-group">
                <label>Phone / WhatsApp Number</label>
                <input
                  type="text"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="e.g. 0331-1498773"
                  className="form-input font-mono"
                />
              </div>

              <div className="admin-form-group">
                <label>Status</label>
                <select
                  value={formData.status || 'Active'}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                  className="form-input"
                >
                  <option value="Active">Active (Available)</option>
                  <option value="Busy">Busy (Working on Batch)</option>
                  <option value="On Leave">On Leave</option>
                </select>
              </div>

              <div className="modal-footer" style={{ marginTop: '10px', padding: 0, background: 'none', border: 'none' }}>
                <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" style={{ padding: '8px 16px', backgroundColor: '#E52535', color: '#FFF', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}>
                  {editingItem ? 'Save Changes' : 'Create Personnel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
