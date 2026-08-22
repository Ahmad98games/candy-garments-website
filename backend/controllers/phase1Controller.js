const getPhase1Data = async (req, res) => {
  res.json({ status: 'success', phase: 1 });
};

module.exports = {
  getPhase1Data
};
