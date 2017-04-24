'use strict'

import mongoose from "mongoose";
let Schema = mongoose.Schema;

/**
 * 用户账号
 */

let UserSchema = new Schema({
    username: {type: String, required: true},
    password: {type: String, required: true},
    email: {type: String, required: true},
    sex: {type: Number, required: true, default: 0}
})

let RoomSchema = new Schema({
    num: {type: Number, required: true},
    name: String,
    password: {type: String, required: true},
    type: {type: Number, required: true, default: 0},
    createor : {type: String, required: true}
})

mongoose.model('User',UserSchema);
mongoose.model('Room',RoomSchema);