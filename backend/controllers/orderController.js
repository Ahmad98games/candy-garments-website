const createOrder = async (req, res) => {
  res.json({ status: 'success', orderId: 'ORD-' + Date.now() });
};

const getOrders = async (req, res) => {
  res.json({ status: 'success', orders: [] });
};

const getOrderById = async (req, res) => {
  res.json({ status: 'success', order: null });
};

const updateOrderStatus = async (req, res) => {
  res.json({ status: 'success', message: 'Status updated' });
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus
};
