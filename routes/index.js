var express = require('express');
var router = express.Router();

router.get('/', function(request, response, next) {
  if (!request.cookies['username']){
    username=null;
  }  
  else{
    username=request.cookies['username']
  }
  console.log("test"+username);
  response.render('index', { username: username});
});


module.exports = router;
