module.exports = {
  apps: [
    {
      name: 'truyenhot-backend',
      script: 'dist/src/main.js',
      instances: '4',
      exec_mode: 'cluster',
      watch: false,
      autorestart: true,
      env_production: {
        NODE_ENV: 'production',
        PORT: 4567,
      },
    },
  ],
};
