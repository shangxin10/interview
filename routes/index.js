var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express',name:'vector' });
});

router.get('/test',async function(req,res,next){
	
	await res.render('index',{title: 'test',name:'test'});
})

module.exports = router;
