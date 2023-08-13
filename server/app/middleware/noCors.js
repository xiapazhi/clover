'use strict';

module.exports = () => {
  return async function noCors(ctx, next) {
    // ctx.set('Access-Control-Allow-Origin', '*');
    // ctx.set('Access-Control-Allow-Credentials', true);
    // ctx.set('Access-Control-Allow-Methods', 'OPTIONS, GET, PUT, POST, DELETE');
    // ctx.set('Access-Control-Allow-Headers', 'x-requested-with, accept, origin, content-type');
    // ctx.set('X-Powered-By', ' 3.2.1');
    // ctx.set('Content-Type', 'application/json;charset=utf-8');
    // if (ctx.request.method === 'OPTIONS') {
    //   ctx.response.status = 200;
    // }
    await next();
  };
};
