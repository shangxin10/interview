module.exports = {
  apps : [{
    name        : "interview",
    script      : "bin/run",
    watch       : true,
    env: {
        COMMON_VARIABLE: "true"
    },
    env_production : {
       "NODE_ENV": "production"
    },
    exec_mode: "cluster",
    ignore_watch: [
        "node_modules",
        ".git",
        ".md",
        '*.html',
        "public",
        "views"
      ],
      max_memory_restart: "500M",
      source_map_support: true,
      log_date_format: "YYYY-MM-DD HH:mm Z",
      error_file: "../datas/pm2logs/web.error.log",
      out_file: "../datas/pm2logs/web.out.log",
      pid_file: "../datas/pm2logs/web.pid.log",
      merge_logs: false,
      combine_logs: false
  }]
}