var express = require('express');
var router = express.Router();

router.get("/create", async (req, res, next) => {
	res.locals.createDate = Date.now();
	res.locals.roomType = ['一对一面试','二对一面试'];
	await res.render('home/createRoom');
})

router.post('/create',async(req, res, next) =>{
	let {
		roomNum, roomPwd, roomCreateor,
		roomName, roomType
	} = req.body;

	let Room = await model("Room").findOne({
		num: roomNum
	})

	if(!vector.isEmpty(Room)){
		return res.json({
			errcode: 10001,
			errmsg: '创建失败，房间已存在'
		})
	}
	let created = await model("Room").create({
		num: roomNum,
		password: roomPwd,
		createor: roomCreateor,
		name: roomName,
		type: roomType
	})
	await res.json({
		errcode: 0,
		errmsg: "ok",
		data: created
	})
})

router.get('/join', async(req, res, next)=>{
	await res.render('home/joinRoom')
})

router.post('/join',async(req, res, next) =>{
	let {
		roomNum, roomPwd
	} = req.body;

	let Room = await model("Room").findOne({
		num: roomNum
	})

	if(vector.isEmpty(Room)){
		return res.json({
			errcode: 10001,
			errmsg: '房间不存在'
		})
	}

	if(Room.password != roomPwd){
		return res.json({
			errcode: 10002,
			errmsg: "密码错误"
		})
	}
	await res.json({
		errcode: 0,
		errmsg: 'ok',
		data: Room
	})
})

router.get('/list',async(req, res, next)=>{
	let user = res.locals.user;
	let rooms = await model("Room").find({
		createor: user._id
	}).sort({
		createDate: -1
	})
	res.locals.rooms = rooms;
	await res.render('home/roomlist');
})

router.get('/del',async(req, res, next)=>{
	let id = req.query.id;
	if(!vector.isObjectId(id)){
		return res.json({
			errcode: 10001,
			errmsg: 'id异常,删除失败'
		})
	}

	let removed = await model('Room').remove({
		_id: id
	})

	if(vector.isEmpty(removed)){
		return res.json({
			errcode: 10002,
			errmsg: '数据丢失，删除失败'
		})
	}else{
		return res.json({
			errcode: 0,
			errmsg: 'ok'
		})
	}
})
module.exports = router;