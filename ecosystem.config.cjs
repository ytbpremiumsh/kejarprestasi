// PM2 config untuk deployment VPS Node SSR.
// Jalankan dari /var/www/kejarprestasi: pm2 start ecosystem.config.cjs
module.exports = {
  apps: [
    {
      name: "kejarprestasi",
      script: ".node-server/server.node.js",
      cwd: "/var/www/kejarprestasi",
      instances: "max",
      exec_mode: "cluster",
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        HOST: "127.0.0.1",
      },
      out_file: "./logs/out.log",
      error_file: "./logs/err.log",
      merge_logs: true,
      time: true,
    },
  ],
};
