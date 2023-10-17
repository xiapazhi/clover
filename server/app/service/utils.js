'use strict';

const Service = require('egg').Service;
const fs = require("fs");
const path = require("path")

class Utils extends Service {
    //递归创建目录 同步方法  
    async makeDir (dir) {
        if (!fs.existsSync(dir)) {
            this.makeDir(path.dirname(dir))
            fs.mkdirSync(dir, function (err) {
                if (err) {
                    throw err
                }
            });
        }
    }
}

module.exports = Utils;