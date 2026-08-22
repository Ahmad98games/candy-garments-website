function validateEnv() {
  return {
    apiPrefix: '/api',
    port: process.env.PORT || 3001,
    env: process.env.NODE_ENV || 'development'
  };
}

module.exports = { validateEnv };
