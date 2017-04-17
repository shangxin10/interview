var express = require('express');
var router = express.Router();
router.get('/test',async function(req,res,next){
	
	await res.render('index1',{title: 'test',name:'test'});
})
module.exports = router;