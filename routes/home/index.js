var express = require('express');
var router = express.Router();
import fs from "fs";
import path from "path";

let access_dirs = ['public','private'];
fs.readdirSync(__dirname).filter(name =>{
  return name.indexOf('.') && access_dirs.indexOf(name) !== -1;
}).forEach(name => {
  let entryPath = path.join(__dirname, name);
  let initFile = path.join(entryPath,"__init.js");
  if(fs.existsSync(initFile)){
    let route = require(initFile);
    router.use('/user',route);
  }else{
    vector.readdir(entryPath).forEach(fname =>{
      let indexFile = path.join(entryPath, fname);
      let route = require(indexFile);
      router.use('',route)
    })
  }
})

module.exports = router;
