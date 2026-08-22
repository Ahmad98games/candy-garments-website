const subscribeNewsletter = async (req, res) => {
  res.json({ status: 'success', message: 'Subscribed' });
};

const getSubscribers = async (req, res) => {
  res.json({ status: 'success', subscribers: [] });
};

module.exports = {
  subscribeNewsletter,
  getSubscribers
};
