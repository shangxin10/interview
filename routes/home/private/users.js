var express = require('express');
var router = express.Router();

router.get("/", async (req, res, next) => {
	await res.render('home/index');
})

router.get('/logout',async(req,res,next) =>{
	req.session.user = null;
	await res.redirect('/home');
})
module.exports = router;