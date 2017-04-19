'use strict';

import fs from 'fs';
import path from 'path';
var express = require('express');
var router = express.Router();

let Dispatcher = {
    dispatch: app =>{
        connectToMongo();
        
        vector.readdir(vector.ROUTES_PATH).forEach(name =>{
            let dir = path.join(vector.ROUTES_PATH,name);
            if(!vector.isDir(dir)) return;
            vector.readdir(dir).forEach(sname =>{
                let sfile = path.join(dir,sname);
                if(vector.isDir(sfile)) return;
                let route = require(sfile);
                console.log("name==>",name);
                app.use('/'+name,route);
            })
        })
    }
}

export default Dispatcher;