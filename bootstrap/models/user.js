'use strict'

import mongoose from "mongoose";
let Schema = mongoose.Schema;


/**
 * 用户账号
 */

let UserSchema = new Schema({
    username: {type: String, required: true}, //用户名
    password: {type: String, required: true}, //密码
    nickname:{type: String, required: true},  //昵称
    email: {type: String, required: true},  //邮箱
    sex: {type: Number, required: true,  default: 0}, // 性别：0为未知，1为男，2位女
    company: {type: String}, //公司
    code: {type: String}, //邮箱找回密码
    role: {type: Number, required: true, default: 0} //0为普通用户,1为面试者
})

let RoomSchema = new Schema({
    num: {type: Number, required: true}, //房间号
    password: {type: String, required: true},  //房间密码
    type: {type: Number, required: true, default: 0}, //房间类型 0为一对一面试，1为二对一面试
    company: {type: String, required: true}, //公司_id
    name: {type: String, required: true}, //房间名称
    interviewer: {type: String, required: true}, //面试者姓名
    phone:{type: String, required: true}, //面试者手机
    email: {type: String, required: true}, //面试者邮箱
    startDate: {type: Number, required: true}, //面试开始时间
    endDate: {type: Number, required: true}, //面试结束时间
    createor: {type: String, required: true} //房间创建者
})

let CompanySchema = new Schema({
    name: {type: String, required: true}, //公司名称
    createor: {type: String, required: true}, //公司法人
    license: {type: String, required: true} //营业执照
})

let CompanyApplySchema = new Schema({
    user: {type: String, required: true}, //申请人
    state: {type: Number, required: true, default: 0}, //申请状态，0为未审核，-1为不通过，1为通过
    companyName: {type: String, required: true}, //公司名称
    companyCreateor: {type: String, required: true}, //公司法人
    companyLicense: {type: String, required: true} //公司营业执照
})

let MessageSchema = new Schema({
    title: {type: String, required: true},  //标题
    content: {type: String, required: true},   //内容
    isAdmin: {type: Boolean, required: true, default: false}, //是否为系统管理员添加的消息
    owner: {type: String}, //消息所有者
    state: {type: Number, required: true, default: 0} //状态
})

//文件上传
let UploadFileSchema = new Schema({
    diskPath: String, //文件在服务器中的绝对路径,如E:\filesupload\123.jpg
    path: String,   //文件路径,如果/uploads/123.jpg
    mimeType: String,   //文件mime,如果image/png
    name: String,   //文件名
    uploadDate: {type: Number, default:Date.now}, //上传上期
    uid: String,    //所属用户_id,
    size: Number,   //文件大小
    isPrivate: {type: Boolean, default: false},  //是否是私有化，默认为私有文件
    remark:String   //备注哪个字段上传
});

mongoose.model("Company",CompanySchema);
mongoose.model('User',UserSchema);
mongoose.model('Room',RoomSchema);
mongoose.model("CompanyApply",CompanyApplySchema);
mongoose.model("Message",MessageSchema);
mongoose.model('UploadFile',UploadFileSchema);