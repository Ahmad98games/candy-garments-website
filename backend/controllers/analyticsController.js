const trackEvent = async (req, res) => {
  res.json({ status: 'success' });
};

const getAnalytics = async (req, res) => {
  res.json({ status: 'success', analytics: {} });
};

module.exports = {
  trackEvent,
  getAnalytics
};
