module.exports = {
    apps: [
        {
            name: 'juejin_post_service',
            script: 'bin/www',
            exec_mode: 'cluster',
            instances: 'max',
            max_memory_restart: '400M',
            env: { NODE_ENV: 'production' },
        },
    ],
};
