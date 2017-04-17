var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

/* GET home page. */
router.get('/', async function(req,res,next){
  let created = {
    name: 'vector',
    password: '123456'
  }
  let user = mongoose.model("User");
  
  await user.create(created);

  let data = await user.findOne({
    name: 'vector'
  })

  if(vector.isEmpty(data)){
    console.log("user null")
  }else{
    console.log("name==",data.name);
    console.log("password==",data.password);
  }
  res.render('index', { title: 'Express',name:'vector' });
});

router.get('/test',async function(req,res,next){
	
	await res.render('index1',{title: 'test',name:'test'});
})

module.exports = router;
