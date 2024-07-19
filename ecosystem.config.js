module.exports = {
  apps: [
    {
      name: 'truyenhot-backend',
      script: 'dist/main.js',
      instances: '6', // Số lượng instances tối đa sẽ bằng số CPU trên máy của bạn
      exec_mode: 'cluster', // Chạy trong chế độ cluster
      watch: false, // Tắt chế độ watch để tránh vấn đề khi cluster
      env_production: {
        NODE_ENV: 'production',
        PORT: 4567, // Đặt cổng cho ứng dụng trong môi trường production
      },
    },
  ],
};
