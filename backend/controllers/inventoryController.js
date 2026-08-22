const getInventory = async (req, res) => {
  res.json({ status: 'success', inventory: [] });
};

const updateStock = async (req, res) => {
  res.json({ status: 'success', message: 'Stock updated' });
};

module.exports = {
  getInventory,
  updateStock
};
