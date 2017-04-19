var express = require('express');
var router = express.Router();

router.get("/", async (req, res, next) => {
	req.end({dfjakdjf: 12312})
})

router.get('/test',async function(req,res,next){
	let user = req.user;
	let user1 = res.locals.user;
	let user2 = req.session.user;
	console.log("test user =>",user2);
	await res.render('home/index1',{title: 'test',name:'test'});
})

module.exports = router;