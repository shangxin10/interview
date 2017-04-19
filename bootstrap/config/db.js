'use strict'

let defaultHost = 'localhost';
export default {
    mongodb:{
        host: defaultHost,
        port: '27017',
        user: 'root',
        password: "vector101520",
        db: 'interview'
    },
    redis:{
        host: defaultHost,
        port: 6379,
        family: 4, //4(IPv4)或(IPv6)
        password: 'vector101520',
        db: 0,
        dropBufferSupport: true,    // 使用hiredis 时，开启可提高性能
        retryStrategy: (times) =>{ //重连策略
            return Math.min(times * 2,2000);
        },
        reconnectOnError: (err) =>{
            //出错后重连
            let targetError = "READONLY";
            if(err.message.slice(0, targetError.length) === targetError){
                return true;
            }
        }
    }
}