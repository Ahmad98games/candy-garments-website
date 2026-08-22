const getReviews = async (req, res) => {
  res.json({ status: 'success', reviews: [] });
};

const addReview = async (req, res) => {
  res.json({ status: 'success', message: 'Review added' });
};

module.exports = {
  getReviews,
  addReview
};
