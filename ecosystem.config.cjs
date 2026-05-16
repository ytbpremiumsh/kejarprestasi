// PM2 config untuk deployment VPS.
// Jalankan: pm2 start ecosystem.config.cjs
module.exports = {
  apps: [
    {
      name: "kejar-prestasi",
      script: ".output/server/index.mjs",
      cwd: __dirname,
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: process.env.PORT || 3000,
        HOST: "0.0.0.0",
      },
      out_file: "./logs/pm2-out.log",
      error_file: "./logs/pm2-err.log",
      merge_logs: true,
      time: true,
    },
  ],
};
