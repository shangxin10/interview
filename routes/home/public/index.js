var express = require('express');
var router = express.Router();
import fs from "fs";
import path from "path";
/* GET home page. */

router.get('/',async(req, res, next) =>{
    await res.render('home/index');
})
router.get('/login', async function(req, res, next){
    console.log("locals=>",res.locals);
    await res.render("home/login");
});

router.post('/login',async(req, res, next)=>{
   let {
     username, password
   } = req.body;
   
   let user = await model("User").findOne({
     username: username,
     password: password
   })
   
   if(vector.isEmpty(user)){
     return res.redirect('/home/login');
   } 
   
   req.session.user = user;
   await res.redirect('/home/user');
})

router.get('/register',async(req, res, next) =>{
    await res.render("home/register");
})

router.post('/register',async(req,res,next) =>{
    let {
        username, password,
        repassword, email,
        nickname
    } = req.body;

    let user = await model("User").findOne({
        username: username
    })

    if(password != repassword){
        return res.json({
            errcode: 10001,
            errmsg: "两次密码输入不一致"
        })
    }
    if(!vector.isEmpty(user)){
        return res.json({
            errcode: 10001,
            errmsg: "手机号码已存在"
        })
    }
    if(!(/^1[34578]\d{9}$/.test(username))){ 
        return res.json({
            errcode: 10001,
            errmsg: "手机号码有误，请重填"
        }) 
    }
    if(!(/^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/).test(email)){
        return res.json({
            errcode: 10001,
            errmsg: "邮箱有误，请重填"
        }) 
    } 
    let created = await model("User").create({
        username: username,
        password: password,
        email: email,
        nickname: nickname
    })
    return res.json({
        errcode: 0,
        errmsg: "ok",
        data: '/home/login'
    })
})

router.get('/forgetPwd', async(req, res, next)=>{
    await res.render("home/forgetPassword");
})

router.get('/sendEmail', async(req, res, next)=>{
    let username = req.query.username;
    if(vector.isEmpty(username)){
        return res.json({
            errcode: 10001,
            errmsg: "请输入手机号码"
        })
    }

    let user = await model('User').findOne({
        username: username
    })
    if(vector.isEmpty(user)){
        return res.json({
            errcode: 10002,
            errmsg: '用户不存在'
        })
    }

    let code = getRandomStr();
    let mailOptions = {
        from: vector.config('env').email.auth.user, // 发件地址
        to: user.email, // 收件列表
        subject: '忘记密码修改', // 标题
        //text和html两者只支持一种
        text: '忘记密码修改', // 标题
        html: "<b>验证码【"+code+"】</b>" // html 内容
    };
    let info = await transporter.sendMail(mailOptions);
    if(vector.isEmpty(info)){
        return res.json({
            errcode: 10004,
            errmsg: '发送失败'
        })
    }else{
        user.code = code + '-' + Date.now();
        await user.save();
        return res.json({
            errcode: 0,
            errmsg: 'ok'
        })
    }
})
router.post('/forgetPwd', async(req, res, next)=>{
    let {
        username, password, 
        repassword, code
    } = req.body;

    if(vector.isEmpty(username)){
        return res.json({
            errcode: 10001,
            errmsg: "请输入手机号"
        })
    }
     if(vector.isEmpty(password)){
        return res.json({
            errcode: 10001,
            errmsg: "请输入密码"
        })
    }
    if(vector.isEmpty(repassword)){
        return res.json({
            errcode: 10001,
            errmsg: "请再次输入密码"
        })
    }
    if(vector.isEmpty(code)){
        return res.json({
            errcode: 10001,
            errmsg: "请输入验证码"
        })
    }

    let user = await model('User').findOne({
        username: username
    })
    if(vector.isEmpty(user)){
        return res.json({
            errcode: 10002,
            errmsg: '用户不存在'
        })
    }

    let emailCode = user.code.split('-')[0];
    let createDate = user.code.split('-')[1];
    
    if(code.toUpperCase()!=emailCode.toUpperCase()){
        return res.json({
            errcode: 10003,
            errmsg: '验证码错误'
        })
    }
    if(Date.now() - parseInt(createDate) > vector.config('env').emailCodeExpireTime){
        return res.json({
            errcode: 10004,
            errmsg: '验证码已过期'
        })
    }
    user.password = password;
    user.code = '';
    await user.save();
    return res.json({
        errcode: 0,
        errmsg: '修改成功',
        data: '/home/login'
    })
})

module.exports = router;