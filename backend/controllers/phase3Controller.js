const getPhase3Data = async (req, res) => {
  res.json({ status: 'success', phase: 3 });
};

module.exports = {
  getPhase3Data
};
