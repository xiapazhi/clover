'use strict';

const Controller = require('egg').Controller;

class DefaultController extends Controller {
    async ping () {
        const { ctx, app } = this;
        try {
            const message = ctx.args[0];
            await ctx.socket.emit('pingSuccess', `Hi! I've got your message: ${JSON.stringify(message)} SUCCESS!!!`);
        } catch (error) {
            ctx.logger.error(new Error(error));
        }
    }
}

module.exports = DefaultController;
