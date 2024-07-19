module.exports = {
  apps: [
    {
      name: 'truyenhot-backend',
      script: 'dist/main.js',
      instances: '8',
      exec_mode: 'cluster',
      watch: false,
      env_production: {
        NODE_ENV: 'production',
        PORT: 4567,
      },
    },
  ],
};
