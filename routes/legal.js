var express = require('express');
var router = express.Router();

router.get('/terms',  function(request, response, next) {  

 
    response.render('conditionsContract', { username: response.locals.username, role:response.locals.role});
  });
  

  router.get('/legal',  function(request, response, next) {  

 
    response.render('legalNotice', { username: response.locals.username, role:response.locals.role});
  });

  router.get('/privacy',  function(request, response, next) {  

 
    response.render('privacyPolicy', { username: response.locals.username, role:response.locals.role});
  });
  
  router.get('/cookies',  function(request, response, next) {  

 
    response.render('cookies', { username: response.locals.username, role:response.locals.role});
  });
  

module.exports = router;