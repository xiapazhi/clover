'use strict';

const Controller = require('egg').Controller;
const moment = require('moment')
const fs = require('fs')
const path = require('path');
const svgCaptcha = require('ppfun-captcha');
const { v4: uuidv4 } = require('uuid');

class Content extends Controller {
    async publish () {
        const { ctx } = this;

        try {
            const { request, model, app } = ctx;
            const { title, content, verification, _csrf } = request.body;
            if (app.ipRateData && app.ipRateData[request.ip || 'outlaw'] && moment().isBefore(moment(app.ipRateData[request.ip || 'outlaw'].expires))) {
                // 发帖频繁
                ctx.status = 224;
            } else if (!title && !content) {
                // 没有内容
                ctx.status = 220;
            } else if (verification && verification.uuid && app.captchaData && app.captchaData[verification.uuid]) {
                const verificationData = app.captchaData[verification.uuid]
                if (moment().isAfter(moment(verificationData.expires))) {
                    // 超时
                    ctx.status = 221;
                } else if (verification.verificationCode !== verificationData.text) {
                    // 验证码错误
                    ctx.status = 222;
                } else {
                    let now = moment().format()
                    await model.Content.create({
                        title,
                        content,
                        publishTime: now,
                        ip: request.ip,
                        like: 0,
                        disgust: 0,
                        over: false,
                        updateTime: now,
                    });

                    //记录ip及发帖时间以限制频率
                    if (app.ipRateData) {
                        app.ipRateData[request.ip || 'outlaw'] = {
                            expires: moment().add(5, 'minute').format()
                        }
                    } else {
                        app.ipRateData = {
                            [request.ip || 'outlaw']: {
                                expires: moment().add(5, 'minute').format()
                            }
                        }
                    }
                    // 记录结束

                    ctx.status = 204;
                }
            } else {
                ctx.status = 223;
            }
        } catch (error) {
            ctx.logger.error(new Error(error));
            ctx.throw(400, {});
        }
    }

    async uploadImg () {
        const { ctx } = this;
        try {
            let parts = ctx.multipart({ autoFields: true });
            let stream, filePaths = []; // 图片访问地址集合
            while ((stream = await parts()) != null) {
                if (!stream.filename) {
                    break;
                }
                let filename = stream.filename;
                // 上传图片的目录
                let day = moment().format('YYYYMMDD')
                let target = 'app/public/content/' + day;
                if (!await fs.existsSync(target)) {
                    await fs.mkdirSync(target)
                }
                let suffix = filename.split('.').pop()
                let fileName = uuidv4() + '.' + suffix
                let filePath = '/public/content/' + day + '/' + fileName
                let writePath = path.posix.join(target, fileName)
                let writableStream = fs.createWriteStream(writePath);
                stream.pipe(writableStream);
                filePaths.push(filePath)
            }
            // console.log(parts.field) // 表单其他数据，可以根据需要处理
            ctx.status = 200
            ctx.body = {
                filePath: filePaths
            }
        } catch (error) {
            ctx.logger.error(new Error(error));
            ctx.throw(400, {});
        }
    }

    async generateVerificationCode () {
        // 验证码实现参考
        // https://github.com/Automattic/node-canvas
        // https://www.kancloud.cn/pimingzhao/vue-js/1334748
        // 不需要安装 c 就可以输出验证码图片的包
        // https://www.npmjs.com/package/captcha-generator-alphanumeric
        // https://www.npmjs.com/package/trek-captcha
        // https://github.com/produck/svg-captcha
        // https://www.npmjs.com/package/ppfun-captcha
        const { ctx } = this;
        try {
            const { request, model, service, app } = ctx;
            var captcha = svgCaptcha.create({
                ignoreChars: '0o1i', // filter out some characters like 0o1i
                width: 280,
                height: 100,
                fontSize: 116
            });
            const uuid = uuidv4()
            if (app.captchaData) {
                app.captchaData[uuid] = {
                    text: captcha.text,
                    expires: moment().add(5, 'minute').format()
                }
            } else {
                app.captchaData = {
                    [uuid]: {
                        text: captcha.text,
                        expires: moment().add(5, 'minute').format()
                    }
                }
            }
            ctx.status = 200;
            this.ctx.body = {
                captcha: captcha.data,
                uuid: uuid
            }
        } catch (error) {
            ctx.logger.error(new Error(error));
            ctx.throw(400, {});
        }
    }

    async get () {
        const { ctx } = this;
        try {
            const { request, model, app } = ctx;
            const { page = 0, keywords = '' } = request.query
            const perPageCount = 11
            const searchWhere = Object.assign(
                {
                    over: false,
                },
                keywords ?
                    {
                        title: {
                            $iLike: `%${keywords}%`
                        }
                    } : {

                    }
            )
            const contentRes = await model.Content.findAll({
                limit: perPageCount,
                offset: page * perPageCount,
                attributes: {
                    include: [[app.Sequelize.fn('COUNT', app.Sequelize.col('comment.id')), 'commentCount']],
                    exclude: ['ip', 'over', 'updateTime']
                },
                where: searchWhere,
                order: [["updateTime", "desc"]],
                include: {
                    model: model.Comment,
                    as: 'comment',
                    duplicating: false,
                    attributes: [],
                },
                group: ['content.id']
            })
            const contentCount = await model.Content.count({
                where: searchWhere
            })
            ctx.status = 200;
            ctx.body = {
                list: contentRes,
                pageCount: Math.ceil(contentCount / perPageCount)
            }
        } catch (error) {
            ctx.logger.error(new Error(error));
            ctx.throw(400, {});
        }
    }

    async onManner () {
        const { ctx } = this;
        let errMsg = '诶呀，赞同未成功~'
        try {
            const { model, app, request } = ctx;

            const { contentId, manner } = request.body;
            if (
                app.ipMannerToday &&
                app.ipMannerToday[request.ip || 'outlaw'] &&
                moment().isBefore(moment(app.ipMannerToday[request.ip || 'outlaw'].expires))
            ) {
                // 点赞频繁
                let remainderTime = moment(app.ipMannerToday[request.ip || 'outlaw'].expires).diff(moment(), 'second')
                errMsg = `操作频繁，请稍待 ${remainderTime} s`
                throw errMsg
            } else {
                //记录ip及赞同反对时间以限制频率
                if (app.ipMannerToday) {
                    app.ipMannerToday[request.ip || 'outlaw'] = {
                        expires: moment().add(30, 'second').format()
                    }
                } else {
                    app.ipMannerToday = {
                        [request.ip || 'outlaw']: {
                            expires: moment().add(30, 'second').format()
                        }
                    }
                }
                // 记录结束

                if (['like', 'disgust'].includes(manner)) {
                    await model.Content.findById(contentId).then(async c => {
                        if (manner == 'like') {
                            await c.increment('like')
                            // .then((cc) => { })
                        } else {
                            await c.increment('disgust')
                        }
                        await c.update({
                            updateTime: moment().format()
                        })
                    })

                    let nextRes = await model.Content.find({
                        attributes: ['id', 'like', 'disgust'],
                        where: {
                            id: contentId
                        }
                    })

                    // 集体发送更新 犇
                    const nsp = app.io.of('/');
                    nsp.server.emit('mannerUpdate', nextRes.dataValues);

                    ctx.status = 200;
                    ctx.body = nextRes.dataValues
                } else {
                    errMsg = '服务器和你之间肯定有一个开小差了~'
                    throw errMsg
                }
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

module.exports = Content;
