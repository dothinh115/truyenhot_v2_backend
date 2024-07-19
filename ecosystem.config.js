module.exports = {
  apps: [
    {
      name: 'truyenhot-backend',
      script: 'dist/main.js',
      instances: '6',
      exec_mode: 'cluster',
      watch: false,
      env_production: {
        NODE_ENV: 'production',
        PORT: 4567,
      },
    },
  ],
};
