var express = require('express');
var router = express.Router();
var contact = require('../controller/contact');

router.get('/', function (request, response, next) {
  response.render('contact', { username: response.locals.username, role: response.locals.role, result: undefined });
});

router.post('/', async function (request, response, next) {
  console.log(request.files)
  const cv=null;
  if (request.files) cv=request.files.cv;
  var result = await contact.sendContact(request.body.email, request.body.telnumber, request.body.info, cv);
  
  response.render('contact', { username: response.locals.username, role: response.locals.role, result: result });
});


module.exports = router;
