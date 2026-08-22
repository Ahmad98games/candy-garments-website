const processPayment = async (req, res) => {
  res.json({ status: 'success', paymentId: 'PAY-' + Date.now() });
};

const verifyPayment = async (req, res) => {
  res.json({ status: 'success', verified: true });
};

module.exports = {
  processPayment,
  verifyPayment
};
