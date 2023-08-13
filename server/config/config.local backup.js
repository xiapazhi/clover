'use strict';

module.exports = (appInfo = {}) => {
   const config = exports = {};

   // use for cookie sign key, should change to your own and keep security
   config.keys = appInfo.name + '_{{keys}}';

   // add your config here
   config.middleware = [];

   // change to your own sequelize configurations
   config.sequelize = {
      dialect: '',
      host: '',
      port: 5432,
      database: '',
      username: '',
      password: '',
   };

   return config;
};
