import React, { useState, useEffect } from 'react';
import { Percent, Plus, Edit2, Trash2, CheckCircle2, XCircle, RefreshCw, Save, AlertCircle } from 'lucide-react';
import './AdminDiscountRules.css';

export interface DiscountRuleItem {
  id: string;
  code: string;
  label: string;
  percentOff?: number | null;
  flatAmountOff?: number | null;
  appliesTo: string[];
  isActive: boolean;
  createdAt: string;
}

export default function AdminDiscountRules() {
  const [rules, setRules] = useState<DiscountRuleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRule, setEditingRule] = useState<Partial<DiscountRuleItem> | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/discount-rules');
      if (res.ok) {
        const data = await res.json();
        setRules(data.rules || []);
      } else {
        setRules(defaultRules());
      }
    } catch {
      setRules(defaultRules());
    } finally {
      setLoading(false);
    }
  };

  const defaultRules = (): DiscountRuleItem[] => [
    {
      id: 'dr_prepaid_auto',
      code: 'PREPAID_AUTO',
      label: 'Instant Payment Discount (10% Off + Free Shipping)',
      percentOff: 10.0,
      flatAmountOff: null,
      appliesTo: ['PREPAID_RAAST', 'PREPAID_WALLET', 'PREPAID_CARD'],
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'dr_festive_prepaid',
      code: 'FESTIVE_PREPAID_15',
      label: 'Eid Festive Flash Incentive (15% Off)',
      percentOff: 15.0,
      flatAmountOff: null,
      appliesTo: ['PREPAID_RAAST', 'PREPAID_CARD'],
      isActive: false,
      createdAt: new Date().toISOString(),
    },
  ];

  const handleSaveRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRule?.code || !editingRule?.label) return;

    setIsSaving(true);
    try {
      const isNew = !editingRule.id;
      const ruleToSave = {
        ...editingRule,
        id: editingRule.id || `dr_${Date.now()}`,
        percentOff: editingRule.percentOff ? Number(editingRule.percentOff) : null,
        flatAmountOff: editingRule.flatAmountOff ? Number(editingRule.flatAmountOff) : null,
        appliesTo: editingRule.appliesTo?.length ? editingRule.appliesTo : ['PREPAID_RAAST', 'PREPAID_CARD'],
        isActive: editingRule.isActive ?? true,
        createdAt: editingRule.createdAt || new Date().toISOString(),
      } as DiscountRuleItem;

      await fetch('/api/discount-rules', {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ruleToSave),
      });

      if (isNew) {
        setRules((prev) => [ruleToSave, ...prev]);
      } else {
        setRules((prev) => prev.map((r) => (r.id === ruleToSave.id ? ruleToSave : r)));
      }

      setEditingRule(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteRule = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this discount rule?')) return;
    try {
      await fetch(`/api/discount-rules/${id}`, { method: 'DELETE' });
    } catch {}
    setRules((prev) => prev.filter((r) => r.id !== id));
  };

  const handleToggleActive = async (rule: DiscountRuleItem) => {
    const updated = { ...rule, isActive: !rule.isActive };
    try {
      await fetch('/api/discount-rules', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
    } catch {}
    setRules((prev) => prev.map((r) => (r.id === rule.id ? updated : r)));
  };

  return (
    <div className="admin-discount-rules-page">
      {/* HEADER */}
      <div className="rules-page-header">
        <div>
          <h2>Dynamic Discount Rules & Prepaid Incentives</h2>
          <p>
            Tuning incentives dynamically from admin without code deployment to drive higher prepaid conversion rates.
          </p>
        </div>
        <button
          type="button"
          className="create-rule-btn"
          onClick={() =>
            setEditingRule({
              code: '',
              label: '',
              percentOff: 10,
              appliesTo: ['PREPAID_RAAST', 'PREPAID_WALLET', 'PREPAID_CARD'],
              isActive: true,
            })
          }
        >
          <Plus size={16} />
          <span>New Discount Rule</span>
        </button>
      </div>

      {/* RULES LIST TABLE */}
      <div className="rules-table-wrapper">
        <table className="rules-table">
          <thead>
            <tr>
              <th>Rule Code</th>
              <th>Customer Label</th>
              <th>Incentive Value</th>
              <th>Applies To</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rules.map((rule) => (
              <tr key={rule.id}>
                <td>
                  <code className="code-badge">{rule.code}</code>
                </td>
                <td>
                  <strong>{rule.label}</strong>
                </td>
                <td>
                  {rule.percentOff ? (
                    <span className="percent-tag">{rule.percentOff}% OFF</span>
                  ) : rule.flatAmountOff ? (
                    <span className="flat-tag">Rs. {rule.flatAmountOff} OFF</span>
                  ) : (
                    '—'
                  )}
                </td>
                <td>
                  <div className="applies-pill-row">
                    {rule.appliesTo.map((t, idx) => (
                      <span key={idx} className="applies-chip">
                        {t.replace('PREPAID_', '')}
                      </span>
                    ))}
                  </div>
                </td>
                <td>
                  <button
                    type="button"
                    className={`status-toggle-btn ${rule.isActive ? 'active' : 'inactive'}`}
                    onClick={() => handleToggleActive(rule)}
                  >
                    {rule.isActive ? (
                      <>
                        <CheckCircle2 size={13} /> Active
                      </>
                    ) : (
                      <>
                        <XCircle size={13} /> Inactive
                      </>
                    )}
                  </button>
                </td>
                <td>
                  <div className="row-actions">
                    <button
                      type="button"
                      className="icon-action-btn edit"
                      onClick={() => setEditingRule(rule)}
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      type="button"
                      className="icon-action-btn delete"
                      onClick={() => handleDeleteRule(rule.id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* CREATE/EDIT MODAL */}
      {editingRule && (
        <div className="rule-modal-backdrop" onClick={() => setEditingRule(null)}>
          <div className="rule-modal-card animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingRule.id ? 'Edit Discount Rule' : 'Create New Discount Rule'}</h3>
              <button type="button" className="close-btn" onClick={() => setEditingRule(null)}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveRule} className="rule-form">
              <div className="form-field">
                <label>Rule Code (Uppercase ID) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PREPAID_AUTO"
                  value={editingRule.code || ''}
                  onChange={(e) => setEditingRule({ ...editingRule, code: e.target.value.toUpperCase() })}
                  className="input-text"
                />
              </div>

              <div className="form-field">
                <label>Customer Display Label *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Instant Payment Discount (10% Off)"
                  value={editingRule.label || ''}
                  onChange={(e) => setEditingRule({ ...editingRule, label: e.target.value })}
                  className="input-text"
                />
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label>Percentage Off (%)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="100"
                    placeholder="e.g. 10"
                    value={editingRule.percentOff ?? ''}
                    onChange={(e) =>
                      setEditingRule({
                        ...editingRule,
                        percentOff: e.target.value ? Number(e.target.value) : null,
                        flatAmountOff: null,
                      })
                    }
                    className="input-text"
                  />
                </div>
                <div className="form-field">
                  <label>Or Flat Amount Off (Rs.)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 500"
                    value={editingRule.flatAmountOff ?? ''}
                    onChange={(e) =>
                      setEditingRule({
                        ...editingRule,
                        flatAmountOff: e.target.value ? Number(e.target.value) : null,
                        percentOff: null,
                      })
                    }
                    className="input-text"
                  />
                </div>
              </div>

              <div className="form-field checkbox-field">
                <label>
                  <input
                    type="checkbox"
                    checked={editingRule.isActive ?? true}
                    onChange={(e) => setEditingRule({ ...editingRule, isActive: e.target.checked })}
                  />
                  <span>Active & currently auto-applied on checkout</span>
                </label>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setEditingRule(null)}
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button type="submit" className="save-btn" disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save Discount Rule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
