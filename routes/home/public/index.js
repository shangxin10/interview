var express = require('express');
var router = express.Router();
import fs from "fs";
import path from "path";
/* GET home page. */

router.get('/',async(req, res, next) =>{
    await res.render('home/index2');
})
router.get('/login', async function(req, res, next){
  
  await res.render("home/login");
});

router.post('/login',async(req, res, next)=>{
   let {
     username, password
   } = req.body;
   
   let user = await model("User").findOne({
     name: username,
     password: password
   })
   if(vector.isEmpty(user)){
     return res.redirect('/home/login');
   } 
   
   req.session.user = user;
   await res.redirect('/home/user/test');
})

router.get('/register',async(req, res, next) =>{
  await res.render("home/register");
})

router.post('/register',async(req,res,next) =>{
  let {
    username,password
  } = req.body;
})
router.get('/test',async function(req, res, next){
	await res.render('home/index1',{title: 'test',name:'test'});
})

module.exports = router;