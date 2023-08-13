# clover

## Development
#### 参数配置
以 config\config.local backup.js 为参考；

文件应配置为  config\config.local.js

主要为数据库参数配置

#### 命令
```bash
# install dependencies
npm install
# start
npm run dev

# generate migration file
npx sequelize migration:generate
# migrate up
npx sequelize db:migrate
# migrate up for test database
NODE_ENV=test npx sequelize db:migrate
# migrate down
npx sequelize db:migrate:undo
npx sequelize db:migrate:undo:all
# migrate down for test database
NODE_ENV=test npx sequelize db:migrate:undo
NODE_ENV=test npx sequelize db:migrate:undo:all

# run migration and test, for CI environment
npm run ci

---

# 自动生成 sequelize 模型
# 配置文件 config\sequelize-automate.config.js
npm run seq
```

## Documents

[eggjs sequelize document](https://eggjs.org/zh-cn/tutorials/mysql.html)
[egg-sequelize](https://github.com/eggjs/egg-sequelize)
[sequelize](http://docs.sequelizejs.com)
[sequelize-cli and migrations](http://docs.sequelizejs.com/manual/tutorial/migrations.html)
[factory-girl](https://github.com/aexmachina/factory-girl)


## Production
#### 参数配置
同 Development


#### 命令
```bash
#运行
npm run start

# 或使用 pm2 进行管理
npm install pm2 -g
pm2 start npm -- start --name clover-api
```