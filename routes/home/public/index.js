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
    username,password,email
  } = req.body;

  let created = await model("User").create({
    username: username,
    password: password,
    email: email 
  })
  await res.redirect('/home/login');
})


module.exports = router;