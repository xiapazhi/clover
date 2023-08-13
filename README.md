# 三叶草 [ CLOVER ]

借鉴 [4chan](https://4chan.org/) 和 [贴吧](https://tieba.baidu.com/) 编码设计的匿名论坛

除简单的内容发布，验证码验证，ip 频率限制外，还可以根据查看者喜欢/厌恶进行投票，以决定内容的删除时间；


#### 软件架构
软件架构说明

/site 是 [vue-cli](https://cli.vuejs.org/zh/) 搭建的前端，使用 [vue2](https://cn.vuejs.org/) 渐进式 JavaScript 框架、[Vuetify](https://vuetifyjs.com/zh-Hans/) UI 组件等

/server 是 [egg](https://eggjs.org/zh-cn/) 搭建的 node 后端，使用 [postgresql](https://www.postgresql.org/) 数据库、 sequelize [中](https://www.sequelize.com.cn/)/[英](https://sequelize.org/) 进行对象关系映射（ORM）进行数据库操作

### 时序图

![](/时序图.png)

#### 安装教程

各文件夹下有详细安装说明

#### 参与贡献

1.  Fork 本仓库
2.  新建 Feat_xxx 分支
3.  提交代码
4.  新建 Pull Request