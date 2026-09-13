const { supabase } = require('../utils/supabase/server');
const logger = require('../services/logger');

// Fallback in-memory store for discount rules if DB is offline
let mockRules = [
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
];

const getActiveRule = async (req, res) => {
  try {
    const { data: rule, error } = await supabase
      .from('discount_rules')
      .select('*')
      .eq('is_active', true)
      .limit(1)
      .single();

    if (rule) {
      return res.json({
        rule: {
          id: rule.id,
          code: rule.code,
          label: rule.label,
          percentOff: Number(rule.percent_off),
          flatAmountOff: rule.flat_amount_off ? Number(rule.flat_amount_off) : null,
          appliesTo: rule.applies_to || ['PREPAID_RAAST', 'PREPAID_CARD'],
          isActive: rule.is_active,
        },
      });
    }

    const activeFallback = mockRules.find((r) => r.isActive) || mockRules[0];
    return res.json({ rule: activeFallback });
  } catch (err) {
    const activeFallback = mockRules.find((r) => r.isActive) || mockRules[0];
    return res.json({ rule: activeFallback });
  }
};

const getAllRules = async (req, res) => {
  try {
    const { data: rules, error } = await supabase
      .from('discount_rules')
      .select('*')
      .order('created_at', { ascending: false });

    if (rules && rules.length > 0) {
      const mapped = rules.map((r) => ({
        id: r.id,
        code: r.code,
        label: r.label,
        percentOff: Number(r.percent_off),
        flatAmountOff: r.flat_amount_off ? Number(r.flat_amount_off) : null,
        appliesTo: r.applies_to || ['PREPAID_RAAST'],
        isActive: r.is_active,
        createdAt: r.created_at,
      }));
      return res.json({ rules: mapped });
    }

    return res.json({ rules: mockRules });
  } catch (err) {
    return res.json({ rules: mockRules });
  }
};

const createRule = async (req, res) => {
  const rule = req.body;
  try {
    await supabase.from('discount_rules').insert({
      id: rule.id,
      code: rule.code,
      label: rule.label,
      percent_off: rule.percentOff,
      flat_amount_off: rule.flatAmountOff,
      applies_to: rule.appliesTo,
      is_active: rule.isActive ?? true,
    });
  } catch {}

  mockRules = [rule, ...mockRules];
  return res.json({ success: true, rule });
};

const updateRule = async (req, res) => {
  const rule = req.body;
  try {
    await supabase
      .from('discount_rules')
      .update({
        label: rule.label,
        percent_off: rule.percentOff,
        flat_amount_off: rule.flatAmountOff,
        applies_to: rule.appliesTo,
        is_active: rule.isActive,
      })
      .eq('id', rule.id);
  } catch {}

  mockRules = mockRules.map((r) => (r.id === rule.id ? { ...r, ...rule } : r));
  return res.json({ success: true, rule });
};

const deleteRule = async (req, res) => {
  const { id } = req.params;
  try {
    await supabase.from('discount_rules').delete().eq('id', id);
  } catch {}
  mockRules = mockRules.filter((r) => r.id !== id);
  return res.json({ success: true, message: 'Discount rule removed' });
};

module.exports = {
  getActiveRule,
  getAllRules,
  createRule,
  updateRule,
  deleteRule,
};
