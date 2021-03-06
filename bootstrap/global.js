'use strict'

import path from 'path';
import fs from 'fs';
import mongoose from 'mongoose';
import Bluebird from 'bluebird';
import moment from "moment";
import nodemailer  from "nodemailer";
let reconnected = 0; //重连mongodb 次数
let chars = 'abcdefgijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
global.connectToMongo = async (options) => {
    options = options || vector.config('db').mongodb;
    //替换默认Promise,避免报告过期的警告  Bluebird 封装了系统的Promise,速度比Promise快6倍
    mongoose.Promise = Bluebird;
    let url = 'mongodb://';
    if(options.user && options.password){
        url += options.user + ":" + options.password + '@';
    }
    url += options.host;
    if(options.port){
        url += ':' + options.port;
    }
    url += "/" + options.db;
    
    await mongoose.connect(url).catch(err =>{
        mongoose.disconnect();
        console.error("连接MongoDB出错：",err);
        console.log('正在重连Mongodb...(' + (++reconnected) + ")");
        setTimeout(() =>{
            process.nextTick(connectToMongo);
        }, 1000);
    })

    // 引入models文件夹下的model文件
    let model_path = path.join(vector.BOOTSTRAP_PATH,"models");
    vector.readdir(model_path).forEach(name =>{
        let mfpath = path.join(model_path, name);
        if(vector.isDir(mfpath)) return;

        let mdl = require(mfpath);
    })

    reconnected = 0;
}

/**
 * 获取相应的MongoDB操作model
 */
global.model = (modelName) => {
    try {
        return mongoose.model(modelName);
    } catch(e) {
        console.log("MongoDB连接未初始化或找不到该Schema!!", e.message)
        return null;
    }
}

global.formatDate = (datetime, pattern) => {
    if(vector.isEmpty(datetime)) return "";
    let m = moment(datetime);
    if(vector.isString(pattern) && !vector.isEmpty(pattern)) {
        return m.format(pattern);
    }
    return m.format();
};

/**
 * 获取随机字符串
 */
global.getRandomStr = (count, isNumber) => {
    count = count || 4; //默认返回为4个字符
    let str = "";
    let chs = chars;
    if(isNumber) {
        chs = chars.filter(ch => {
            return ch >= '0' && ch <= '9';
        });
    }
    let len = chs.length;
    for(let i = 0;i < count;i++) {
        str += chs[parseInt(Math.random() * len)];
    }
    return str;
};

//邮件发送
global.transporter = nodemailer.createTransport(vector.config('env').email);