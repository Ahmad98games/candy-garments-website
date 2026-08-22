const getPhase2Data = async (req, res) => {
  res.json({ status: 'success', phase: 2 });
};

module.exports = {
  getPhase2Data
};
