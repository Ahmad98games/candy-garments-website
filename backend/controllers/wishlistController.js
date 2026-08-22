const getWishlist = async (req, res) => {
  res.json({ status: 'success', wishlist: [] });
};

const addToWishlist = async (req, res) => {
  res.json({ status: 'success', message: 'Added to wishlist' });
};

const removeFromWishlist = async (req, res) => {
  res.json({ status: 'success', message: 'Removed from wishlist' });
};

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist
};
