const handleStripeWebhook = async (req, res) => {
  res.json({ received: true });
};

module.exports = {
  handleStripeWebhook
};
