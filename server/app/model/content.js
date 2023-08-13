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
            unique: "content_id_uindex"
        },
        title: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null,
            comment: null,
            primaryKey: false,
            field: "title",
            autoIncrement: false
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: true,
            defaultValue: null,
            comment: null,
            primaryKey: false,
            field: "content",
            autoIncrement: false
        },
        publishTime: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: null,
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
        like: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: "0",
            comment: null,
            primaryKey: false,
            field: "like",
            autoIncrement: false
        },
        disgust: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: "0",
            comment: null,
            primaryKey: false,
            field: "disgust",
            autoIncrement: false
        },
        over: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: null,
            comment: null,
            primaryKey: false,
            field: "over",
            autoIncrement: false
        },
        updateTime: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: null,
            comment: null,
            primaryKey: false,
            field: "update_time",
            autoIncrement: false
        },
    };
    const options = {
        tableName: "content",
        comment: "",
        indexes: []
    };
    const Content = sequelize.define("content", attributes, options);

    Content.associate = function () {
        app.model.Content.hasMany(app.model.Comment, { as: 'comment' });
    };

    return Content;
};