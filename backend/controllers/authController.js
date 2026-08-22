const register = async (req, res) => {
  res.json({ status: 'success', message: 'User registered' });
};

const login = async (req, res) => {
  res.json({ status: 'success', token: 'simulated_jwt_token', user: { id: 'usr-1', email: req.body?.email || 'admin@candykids.pk' } });
};

const forgotPassword = async (req, res) => {
  res.json({ status: 'success', message: 'Password reset link sent' });
};

const resetPassword = async (req, res) => {
  res.json({ status: 'success', message: 'Password reset successful' });
};

const getMe = async (req, res) => {
  res.json({ status: 'success', user: req.user || { id: 'usr-1', email: 'admin@candykids.pk' } });
};

const refreshToken = async (req, res) => {
  res.json({ status: 'success', token: 'simulated_jwt_token' });
};

const logout = async (req, res) => {
  res.json({ status: 'success', message: 'Logged out successfully' });
};

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
  getMe,
  refreshToken,
  logout
};
