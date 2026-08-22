const protect = (req, res, next) => {
  req.user = req.user || { id: 'usr-admin', role: 'admin' };
  next();
};

const admin = (req, res, next) => {
  next();
};

const optionalAuth = (req, res, next) => {
  next();
};

module.exports = { protect, admin, optionalAuth };
