module.exports = {
  apps: [
    {
      name: 'erp-chips-backend',
      script: 'dist/server.js',
      cwd: __dirname,
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      out_file: '/var/log/snackcraft/stdout.log',
      error_file: '/var/log/snackcraft/error.log',
      merge_logs: true,
      time: true,
      env: {
        NODE_ENV: 'production',
        PORT: 5005,
      },
    },
  ],
};
