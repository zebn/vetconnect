var express = require('express');
var router = express.Router();
var auth = require('../controller/authController');

router.get('/', function(request, response, next) {
  if (!request.user){
    username=null;
  }  
  else{
    username=request.user.username
  }
  console.log("test"+username);
  response.render('index', { username: username});
});


module.exports = router;
