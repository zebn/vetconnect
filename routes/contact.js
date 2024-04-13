var express = require('express');
var router = express.Router();
var auth = require('../authenticate/auth');

router.get('/', function(request, response, next) {  
  response.render('index', { username: response.locals.username, role:response.locals.role});
});


module.exports = router;
