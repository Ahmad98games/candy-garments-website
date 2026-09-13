const registerUser = async (req, res) => {
  res.json({ status: 'success', message: 'User created' });
};

const loginUser = async (req, res) => {
  res.json({ status: 'success', token: 'simulated_jwt_token' });
};

const refreshToken = async (req, res) => {
  res.json({ status: 'success', token: 'simulated_jwt_token' });
};

const logout = async (req, res) => {
  res.json({ status: 'success', message: 'Logged out' });
};

const getUserProfile = async (req, res) => {
  res.json({ status: 'success', profile: { name: 'Admin', email: 'support@candykids.pk' } });
};

const updateUserProfile = async (req, res) => {
  res.json({ status: 'success', message: 'Profile updated' });
};

const fs = require('fs');
const path = require('path');
const { supabase } = require('../utils/supabase/server');
const OVERRIDES_FILE = path.join(__dirname, '..', 'data', 'trust_overrides.json');

function getStoredOverrides() {
  try {
    if (fs.existsSync(OVERRIDES_FILE)) {
      return JSON.parse(fs.readFileSync(OVERRIDES_FILE, 'utf8'));
    }
  } catch (e) {}
  return {};
}

const getAllUsers = async (req, res) => {
  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ status: 'error', message: error.message, users: [] });
    }

    const overrides = getStoredOverrides();
    const customerMap = new Map();

    (orders || []).forEach((order) => {
      const rawPhone = (order.customer_phone || '').trim();
      const cleanPhone = rawPhone.replace(/[^\d+]/g, '') || rawPhone || 'Unknown Phone';
      const key = cleanPhone.toLowerCase();

      if (!customerMap.has(key)) {
        customerMap.set(key, {
          _id: 'cust-' + (cleanPhone !== 'Unknown Phone' ? cleanPhone : order.id),
          name: (order.customer_name || 'Valued Customer').trim(),
          email: `${cleanPhone}@customer.candygarments.com`,
          phone: rawPhone || 'No Phone Provided',
          city: order.city || 'Pakistan',
          shippingAddress: order.shipping_address || '',
          isAdmin: false,
          trustTier: 'STANDARD',
          codRefusalCount: 0,
          completedOrders: 0,
          totalOrders: 0,
          totalSpent: 0,
          createdAt: order.created_at,
          orders: [],
        });
      }

      const c = customerMap.get(key);
      c.totalOrders += 1;
      c.totalSpent += Number(order.total_amount) || 0;
      c.orders.push({
        id: order.id,
        total_amount: Number(order.total_amount) || 0,
        status: order.status || 'Pending',
        created_at: order.created_at,
        payment_method: order.payment_method,
        shipping_address: order.shipping_address,
        city: order.city,
        items: order.items || [],
      });

      const st = (order.status || '').toLowerCase();
      if (st === 'delivered' || st === 'confirmed_prepaid') {
        c.completedOrders += 1;
      } else if (st === 'cancelled' || st === 'delivery_refused_rto') {
        c.codRefusalCount += 1;
      }
    });

    const users = Array.from(customerMap.values()).map((c) => {
      const norm = (c.phone || '').replace(/[^\d+]/g, '').toLowerCase();
      const override = overrides[norm] || overrides[c._id];

      let computedTier = 'STANDARD';
      if (c.codRefusalCount >= 2) {
        computedTier = 'RESTRICTED';
      } else if (c.completedOrders >= 3) {
        computedTier = 'TRUSTED';
      } else if (c.completedOrders > 0) {
        computedTier = 'STANDARD';
      } else {
        computedTier = 'UNVERIFIED';
      }

      if (override && override.newTrustTier) {
        c.trustTier = override.newTrustTier;
        c.isOverridden = true;
        c.overrideReason = override.reason;
      } else {
        c.trustTier = computedTier;
      }

      return c;
    });

    return res.json({ status: 'success', users });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: err.message, users: [] });
  }
};

const deleteUser = async (req, res) => {
  res.json({ status: 'success', message: 'User deleted' });
};

const updateUserRole = async (req, res) => {
  res.json({ status: 'success', message: 'Role updated' });
};

module.exports = {
  registerUser,
  loginUser,
  refreshToken,
  logout,
  getUserProfile,
  updateUserProfile,
  getAllUsers,
  deleteUser,
  updateUserRole
};
