var express = require('express');
var router = express.Router();
var auth = require('../controller/authenticate/auth');

/* GET users listing. */
router.get('/', auth.checkAuthToken, function(req, res, next) {
  res.send('respond with a resource');
});



module.exports = router;
