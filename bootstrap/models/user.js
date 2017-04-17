'use strict'

import mongoose from "mongoose";
let Schema = mongoose.Schema;

/**
 * 用户账号
 */

let UserSchema = new Schema({
    name: {type: String, required: true},
    password: {type: String, required: true},
    sex: {type: Number, required: true, default: 0}
})


mongoose.model('User',UserSchema);