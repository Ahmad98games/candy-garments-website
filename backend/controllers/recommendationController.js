const getRecommendations = async (req, res) => {
  res.json({ status: 'success', recommendations: [] });
};

module.exports = {
  getRecommendations
};
