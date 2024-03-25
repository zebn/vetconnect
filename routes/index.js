var express = require('express');
var router = express.Router();
var auth = require('../authenticate/auth');

router.get('/', function(request, response, next) {
  if (!request.cookies['username']||!request.cookies['role']){
    username=null;
    role=null;
  }  
  else{
    username=request.cookies['username'];
    role=request.cookies['role'];
  }
  response.render('index', { username: username, role:role});
});


module.exports = router;
