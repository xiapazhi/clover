'use strict';

const Controller = require('egg').Controller;
const moment = require('moment')

class Comment extends Controller {
    async get () {
        const { ctx } = this;
        try {
            const { request, model } = ctx;
            const { contentId } = request.query
            const commentRes = await model.Comment.findAll({
                attributes: { exclude: ['ip'] },
                order: [['publish_time', 'DESC']],
                where: {
                    contentId,
                },
            })
            ctx.status = 200;
            ctx.body = commentRes
        } catch (error) {
            ctx.logger.error(new Error(error));
            ctx.throw(400, {});
        }
    }

    async comment () {
        const { ctx } = this;
        let errMsg = '诶呀，评论未成功~'
        try {
            const { request, model, app } = ctx;
            const { content, verification, contentId, commentId, _csrf } = request.body;
            if (!content || !contentId) {
                // 没有内容
                errMsg = `评论了个寂寞~`
                throw errMsg
            } else if (
                app.ipCommentRate &&
                app.ipCommentRate[request.ip || 'outlaw'] &&
                moment().isBefore(moment(app.ipCommentRate[request.ip || 'outlaw'].expires))
            ) {
                // 评论频繁
                let remainderTime = moment(app.ipCommentRate[request.ip || 'outlaw'].expires).diff(moment(), 'second')
                errMsg = `操作频繁，请稍待 ${remainderTime} s`
                throw errMsg
            } else if (
                verification &&
                verification.uuid &&
                app.captchaData &&
                app.captchaData[verification.uuid]
            ) {
                const verificationData = app.captchaData[verification.uuid]
                if (moment().isAfter(moment(verificationData.expires))) {
                    errMsg = `验证码超时，点击更新~`
                    throw errMsg
                } else if ((verification.verificationCode || '').toUpperCase() !== verificationData.text) {
                    errMsg = `验证码错误~`
                    throw errMsg
                } else {
                    await model.Comment.create({
                        content,
                        contentId: contentId,
                        commentId: commentId,
                        publishTime: moment().format(),
                        ip: request.ip,
                    });

                    //记录ip及评论时间以限制频率
                    if (app.ipCommentRate) {
                        app.ipCommentRate[request.ip || 'outlaw'] = {
                            expires: moment().add(1, 'minute').format()
                        }
                    } else {
                        app.ipCommentRate = {
                            [request.ip || 'outlaw']: {
                                expires: moment().add(1, 'minute').format()
                            }
                        }
                    }
                    // 记录结束

                    const nsp = app.io.of('/clover');
                    nsp.server.emit('commentUpdate', {
                        contentId: contentId,
                    });

                    ctx.status = 204;
                }
            } else {
                errMsg = '服务器和你肯定有一个开小差了~'
                throw errMsg
            }
        } catch (error) {
            ctx.logger.error(new Error(error));
            ctx.status = 400
            ctx.body = {
                message: errMsg
            }
        }
    }
}

module.exports = Comment;
