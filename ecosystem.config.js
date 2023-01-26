module.exports = {
    apps: [
        {
            name: 'juejin_post_service',
            script: 'bin/www',
            exec_mode: 'cluster',
            instances: 'max',
            log_date_format: 'YYYY-MM-DD HH:mm:ss',
            error_file: './logs/app-err.log',
            max_memory_restart: '1G',
            source_map_support: true,
            env: { NODE_ENV: 'production' },
        },
    ],
};
