var express = require('express');
var router = express.Router();

router.get('/',  function(request, response, next) {  

 
    response.render('review', { username: response.locals.username, role:response.locals.role});
  });
  
  module.exports = router;