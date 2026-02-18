module.exports = {
  apps: [
    {
      name: 'ordenv',
      cwd: '/var/www/ordenv.org',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: 3031
      },
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      error_file: '/var/www/ordenv.org/logs/pm2-error.log',
      out_file: '/var/www/ordenv.org/logs/pm2-out.log',
      log_file: '/var/www/ordenv.org/logs/pm2-combined.log',
      time: true
    }
  ]
};
