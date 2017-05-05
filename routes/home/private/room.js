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

	
	let personCount = vector.sockets.get(roomNum) ? vector.sockets.get(roomNum).size : 0;
	let limit = Room.type == 0 ? 2 : 3;

	personCount = parseInt(personCount);
	if(personCount >= limit){
		return res.json({
			errcode: 10003,
			errmsg: "房间人数已满"
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

	await vector.redis.room.del(removed.num)
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

router.post('/upload',async(req, res, next)=>{
	var mime = require('mime');
    var formidable = require('formidable');
    var util = require('util');

    var form = new formidable.IncomingForm();

    var dir = !!process.platform.match(/^win/) ? '\\uploads\\' : '/uploads/';

    form.uploadDir = __dirname + dir;
    form.keepExtensions = true;
    form.maxFieldsSize = 10 * 1024 * 1024;
    form.maxFields = 1000;
    form.multiples = false;

    form.parse(req, function(err, fields, files) {
        var file = util.inspect(files);


        var fileName = file.split('path:')[1].split('\',')[0].split(dir)[1].toString().replace(/\\/g, '').replace(/\//g, '');
        var fileURL = 'http://' + app.address + ':' + port + '/uploads/' + fileName;

        console.log('fileURL: ', fileURL);
        return res.json({
			errcode: 0,
			errmsg: '上传成功',
			data: fileURL
		})
    });
})
module.exports = router;