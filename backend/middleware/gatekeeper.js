const CAPABILITIES = {
  STATE_MUTATING: 'STATE_MUTATING',
  READ_ONLY: 'READ_ONLY',
  ADMIN_ACCESS: 'ADMIN_ACCESS'
};

const gatekeeper = (_capability) => (req, res, next) => next();

module.exports = { gatekeeper, CAPABILITIES };
