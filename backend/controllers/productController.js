const getProducts = async (req, res) => {
  res.json({ status: 'success', products: [] });
};

const getProductById = async (req, res) => {
  res.json({ status: 'success', product: null });
};

const createProduct = async (req, res) => {
  res.json({ status: 'success', message: 'Product created' });
};

const updateProduct = async (req, res) => {
  res.json({ status: 'success', message: 'Product updated' });
};

const deleteProduct = async (req, res) => {
  res.json({ status: 'success', message: 'Product deleted' });
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
