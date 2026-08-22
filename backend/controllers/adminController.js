const getAdminStats = async (req, res) => {
  res.json({ status: 'success', stats: { totalSales: 0, totalOrders: 0 } });
};

const getSystemLogs = async (req, res) => {
  res.json({ status: 'success', logs: [] });
};

module.exports = {
  getAdminStats,
  getSystemLogs
};
