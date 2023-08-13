'use strict';

// 需要将中间件写在 config/confix.xxx.js 文件的 connectionMiddleware 中才生效

module.exports = app => {
    return async (ctx, next) => {
        console.info('connected!');
        ctx.socket.emit('res', 'connected!');
        await next();
        // execute when disconnect.
        console.info('disconnection!');
    };
};
