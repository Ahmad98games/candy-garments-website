const getCart = async (req, res) => {
  res.json({ status: 'success', items: [] });
};

const addToCart = async (req, res) => {
  res.json({ status: 'success', message: 'Item added' });
};

const removeFromCart = async (req, res) => {
  res.json({ status: 'success', message: 'Item removed' });
};

const clearCart = async (req, res) => {
  res.json({ status: 'success', message: 'Cart cleared' });
};

module.exports = {
  getCart,
  addToCart,
  removeFromCart,
  clearCart
};
