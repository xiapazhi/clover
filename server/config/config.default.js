'use strict';

module.exports = (appInfo = {}) => {
    const config = exports = {};
    // use for cookie sign key, should change to your own and keep security
    config.keys = appInfo.name + '_{{keys}}';

    // add your config here
    config.middleware = [];
    config.proxy = true;
    config.ipHeaders = 'X-Real-Ip, X-Forwarded-For';
    config.protocolHeaders = 'X-Real-Proto, X-Forwarded-Proto';
    config.maxIpsCount = 1;

    config.static = {
        // maxAge: 31536000,
        // preload: true,
    };

    // https://eggjs.org/zh-cn/tutorials/socketio.html
    config.io = {
        init: {}, // passed to engine.io
        namespace: {
            '/clover': {
                // connectionMiddleware: ['connection'],
                connectionMiddleware: [],
                packetMiddleware: [],
            },
        },
    };

    // change to your own sequelize configurations
    config.sequelize = {
        // dialect: 'mysql',
        // host: 'localhost',
        // port: 3306,
        // database: 'egg-sequelize-default',
        // username: 'root',
        // password: '',
        define: {
            // underscored: false,
            // freezeTableName: false,
            // charset: 'utf8mb4',
            timezone: '+08:00',
            // dialectOptions: {
            //   collate: 'utf8_general_ci',
            // },
            timestamps: false,
        },
    };

    config.nsfw = true
    return config;
};
