/* eslint-disable*/
'use strict';

module.exports = app => {
    const DataTypes = app.Sequelize;
    const sequelize = app.model;
    const attributes = {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: null,
            comment: null,
            primaryKey: true,
            field: "id",
            autoIncrement: true,
            unique: "comment_id_uindex"
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false,
            defaultValue: null,
            comment: null,
            primaryKey: false,
            field: "content",
            autoIncrement: false
        },
        publishTime: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize.fn('now'),
            comment: null,
            primaryKey: false,
            field: "publish_time",
            autoIncrement: false
        },
        ip: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null,
            comment: null,
            primaryKey: false,
            field: "ip",
            autoIncrement: false
        },
        contentId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: null,
            comment: "所属内容、帖子的id",
            primaryKey: false,
            field: "content_id",
            autoIncrement: false
        },
        commentId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: null,
            comment: "所属评论的id，评论可以回复",
            primaryKey: false,
            field: "comment_id",
            autoIncrement: false
        }
    };
    const options = {
        tableName: "comment",
        comment: "",
        indexes: []
    };
    const Comment = sequelize.define("comment", attributes, options);

    Comment.associate = function () {
        app.model.Comment.belongsTo(app.model.Content, { as: 'Content', foreignKey: 'content_id' });
    };

    return Comment;
};