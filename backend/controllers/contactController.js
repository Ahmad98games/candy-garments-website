const submitContact = async (req, res) => {
  res.json({ status: 'success', message: 'Message received' });
};

const getContactMessages = async (req, res) => {
  res.json({ status: 'success', messages: [] });
};

module.exports = {
  submitContact,
  getContactMessages
};
