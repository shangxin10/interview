'use strict'

import path from 'path';
import fs from 'fs';
import mongoose from 'mongoose';
import router from './router';
import moment from "moment";

global.vector = {
    APP_PATH: path.normalize(path.join(__dirname,'..'))
};
global.vector.SYSTEM_PATH = __dirname;
global.vector.PUBLIC_PATH = path.join(vector.APP_PATH,'public');
global.vector.ROUTES_PATH = path.join(vector.APP_PATH,'routes');

global.vector.getObjectType = obj =>{
    return toString.call(obj).split(' ')[1].replace(']','').toLowerCase();
}
global.vector.isBuffer = obj =>{
    return Buffer.isBuffer(obj);
}
global.vector.isString = obj =>{
    return global.vector.getObjectType(obj) === 'string';
}
global.vector.isUndefined = obj =>{
    return global.vector.getObjectType(obj) === 'undefined';
}
global.vector.isObject = obj =>{
    return global.vector.getObjectType(obj) === 'object';
}
global.vector.isNull = obj => {
    return global.vector.getObjectType(obj) === 'null';
};
global.vector.isArray = obj =>{
    return Array.isArray ? Array.isArray(obj)
        : global.vector.getObjectType(obj) === 'array';
}
global.vector.isDir = str => {
    if(!vector.isString(str)) return false;
    return fs.statSync(str).isDirectory();
}
global.vector.isEmpty = obj =>{
    if(!obj) return true;
    let v = global.vector;
    if(v.isObject(obj)) return Object.keys(obj).length === 0;
    else if(v.isNull(obj) || v.isUndefined(obj)) return true;
    else if(v.isArray(obj) || v.isBuffer(obj)) return obj.length === 0;
    else if(v.isString(obj)) return obj.trim().length === 0;
    else return false; 
}

global.vector.isObjectId = str => {
    if(!vector.isString(str) || vector.isEmpty(str)) return false;
    return mongoose.Types.ObjectId.isValid(str);
};

/**
 * 字符串转时间
 */
global.vector.strtotime = (str, pattern) => {
    if(vector.isString(pattern) && pattern.length) {
        return moment(str, pattern).valueOf();
    }
    return moment(str).valueOf();
}
/**
 * 读取目录,过滤掉Markdown文件
 */
global.vector.readdir = path =>{
    if(!vector.isString(path)) return null;
    try{
        return fs.readdirSync(path).filter(name =>{
            return name.indexOf('.') 
                    && name.substr(name.lastIndexOf('.')) !== '.md';
        });
    }catch(e){
        console.error("#vector readdir:",e);
    }
    return [];
}

/**
 * 读取APP_PATH/bootstrap/config目录下的配置
 */
global.vector.config = key =>{
    return bucket.config[key] || null;
}
global.vector.redis = {};
global.vector.sockets = new Map();
let bucket = {
    config: {}
}

global.vector.BOOTSTRAP_PATH = path.join(vector.APP_PATH, 'bootstrap');
vector.readdir(vector.BOOTSTRAP_PATH).forEach(name =>{
    let lspath = path.join(vector.BOOTSTRAP_PATH, name);
    if(vector.isDir(lspath)){
        //过滤了除config
        if(name === 'config'){
            vector.readdir(lspath).forEach(fsname =>{
                let md = path.join(lspath, fsname);
                fsname = fsname.substr(0, fsname.lastIndexOf('.'));
                bucket.config[fsname] = require(md);
            })
        }
    }else{
        require(lspath);
    }
})



export default {
    routers: router
}