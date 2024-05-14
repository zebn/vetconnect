var express = require('express');
var router = express.Router();
var contact = require('../controller/contact');
var Recaptcha = require('express-recaptcha').RecaptchaV2
var recaptcha = new Recaptcha(process.env.CAP1, process.env.CAP2)

router.get('/',recaptcha.middleware.renderWith({ hl: 'es' }), function (request, response, next) {
  response.render('contact', { username: response.locals.username, role: response.locals.role, result: undefined });
});

router.post('/',  recaptcha.middleware.renderWith({ hl: 'es' }), recaptcha.middleware.verify, async function (request, response, next) {
  console.log(request.files)
  const cv=null;
  if (request.files) cv=request.files.cv;
  var result = await contact.sendContact(request.body.email, request.body.telnumber, request.body.info, cv, request.recaptcha.error);  
  response.render('contact', { username: response.locals.username, role: response.locals.role, result: result ,captcha: response.recaptcha });
});


module.exports = router;
