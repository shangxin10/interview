'use strict';

export default {
    redis: {
        db: {
            room: 0 //房间
        }
    },
    emailCodeExpireTime: 3*60*1000, //email验证码过期时间3分钟 
    email:{
        host: "smtp.163.com",
        port: '25',
        secureConnection: true,
        auth: {
            user: '18813973836@163.com',
            pass: '' 
        }
    },
    admin:{
        username: 'vector',
        password: '123456'
    }
}

