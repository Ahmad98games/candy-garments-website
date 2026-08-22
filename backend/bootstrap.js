async function bootstrap() {
  return {
    config: {
      port: process.env.PORT || 3001,
      env: process.env.NODE_ENV || 'development'
    }
  };
}

module.exports = bootstrap;
