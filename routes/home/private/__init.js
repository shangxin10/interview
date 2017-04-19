'use strict';
import fs from 'fs';
import path from 'path';
var express = require('express');
var router = express.Router();


router.use(async (req,res,next)=>{
    let user = req.session.user;
    if(vector.isEmpty(user)){
        return res.redirect('/home/login');
    }else{
        res.locals.uesr = user;
    }
    console.log("users=>",user);
    await next();
})

vector.readdir(__dirname).forEach(fname =>{
    if(fname == '__init.js') return;
    let m = path.join(__dirname, fname);
    let route = require(m);
    let pathName = fname.split(".")[0].trim();
    pathName = pathName == 'users' ? '' : pathName;
    router.use("/" + pathName, route);
})
export default router;