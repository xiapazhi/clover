'use strict';

const Subscription = require('egg').Subscription;
const moment = require('moment')
const fs = require('fs')
const path = require('path');

class Scavenger extends Subscription {
    // Scavenger 清道夫
    // 通过 schedule 属性来设置定时任务的执行间隔等配置
    static get schedule () {
        return {
            // interval: '5s',
            cron: '0 0 4 * * * ',
            type: 'worker',
            // immediate: true,//在应用启动并 ready 后立刻执行一次这个定时任务
        };
    }

    // subscribe 是真正定时任务执行时被运行的函数
    async subscribe () {
        try {
            const { model, logger, app } = this.ctx;

            // 清除缓存的、判断频率的 ip 数据
            this.ctx.app.captchaData = {}
            this.ctx.app.ipRateData = {}
            this.ctx.app.ipMannerToday = {}

            const totalCount = await model.Content.count()
            if (totalCount < 24) {
                return
            }

            // 判断每篇内容的生命周期 
            // do 将内容的剩余时间展示在前端，倒计时  xx小时xx秒
            /**
             * 每个文章默认7d
             * 1 个评论 + commentAddDay d;
             * 1 个 like + likeAddDay d;
             * 1 个 disgust - disgustSubtractDay d
             */

            const defaultExistDay = 7
            const likeAddDay = 3
            const commentAddDay = 5
            const disgustSubtractDay = 1

            let hasContent = true
            let times = 0
            const perPageCount = 9
            while (hasContent) {
                const contentRes = await model.Content.findAll({
                    limit: perPageCount,
                    offset: times * perPageCount,
                    attributes: {
                        include: [[app.Sequelize.fn('COUNT', app.Sequelize.col('comment.id')), 'commentCount']],
                    },
                    order: [["id", "desc"]],
                    include: {
                        model: model.Comment,
                        as: 'comment',
                        duplicating: false,
                        attributes: [],
                    },
                    group: ['content.id']
                })

                for (let c of contentRes) {
                    let overTime = moment(c.publishTime)
                        .add(
                            defaultExistDay
                            + c.like * likeAddDay
                            + parseInt(c.dataValues.commentCount) * commentAddDay,
                            'd'
                        )
                        .subtract(
                            c.disgust * disgustSubtractDay,
                            'd'
                        )
                    if (moment().isAfter(overTime)) {
                        // 此刻超出结束时间，进入删帖流程

                        // 删除图片
                        c.content.replace(/<img [^>]*src=['"]([^'"]+)[^>]*>/g, (match, capture) => {
                            if (capture.indexOf('/_file') == 0) {
                                let fileUrl = path.normalize(capture.replace('/_file', 'app'))
                                if (fs.existsSync(fileUrl)) {
                                    fs.unlinkSync(fileUrl);
                                }
                            }
                        });
                        // 删除记录
                        await model.Content.destroy({
                            where: {
                                id: c.id
                            }
                        })
                        await model.Comment.destroy({
                            where: {
                                contentId: c.id
                            }
                        })
                    }
                }

                times++
                hasContent = Boolean(contentRes.length)
            }

            // 遍历除今天外的所有文件夹，空则删除
            const contentPath = path.normalize('app/public/content')
            const dirs = fs.readdirSync(contentPath);
            if (dirs && dirs.length) {
                for (let d of dirs) {
                    try {
                        let dirPath = path.join(contentPath, d)
                        if (fs.statSync(dirPath).isDirectory()) {
                            if (moment(d).endOf('d').isBefore(moment())) {
                                let files = fs.readdirSync(dirPath)
                                if (!files || !files.length) {
                                    fs.rmdirSync(dirPath);
                                }
                            }
                        }
                    } catch (error) {
                        this.ctx.logger.error(error)
                    }
                }
            }
        } catch (error) {
            this.ctx.logger.error(error)
        }
    }
}

module.exports = Scavenger;
