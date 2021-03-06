var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var ejs = require('ejs');
var system = require('./system/index');
var session = require('express-session');
var RedisStore = require('connect-redis')(session);
var Redis = require('ioredis');
var app = express();


// let env = vector.config('env');
// let redisEnv = env.redis;
let redisCfg = vector.config('db').redis;
// if(redisCfg && redisCfg.host && redisCfg.family){
//   let keys = Object.keys(redisEnv.db);
//   for(let key of keys){
//     redisCfg.db = redisEnv.db[key];
//     if(redisCfg.db == 1) continue;
//     vector.redis[key] = new Redis(redisCfg);
//   }
// }
// view engine setup
app.engine('.html', ejs.__express)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


//session 的redis 存储对象 
var sessionRedisStore = new RedisStore({
    host: redisCfg.host,
    port: redisCfg.port,
    pass: redisCfg.password,
    ttl: 2 * 3600 * 1000, //过期时间2小时，
    cookies: {
      maxAge: 2 * 3600 * 1000, //过期时间2小时
      httpOnly: true
    },
    db: 1 
})
/**
 * session选项配置
 */
let sessionOpts = {
    store: sessionRedisStore,
    secret: 'vector'
}
app.use(session(sessionOpts));

app.use(function(req, res, next){
  if(!req.session){
    return next(new Error('oh no'));
  }
  next();
})
system.routers.dispatch(app);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  console.log(err)
  res.render('error');
});

module.exports = app;
