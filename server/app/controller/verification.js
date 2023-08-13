'use strict';

const Controller = require('egg').Controller;
const moment = require('moment')
const svgCaptcha = require('ppfun-captcha');
const { v4: uuidv4 } = require('uuid');

class Verification extends Controller {

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
            console.log(captcha);
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
}

module.exports = Verification;
