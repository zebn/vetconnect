var express = require('express');
var router = express.Router();
var auth = require('../controller/authController');

/* GET users listing. */
router.get('/', auth.checkLogin, function(req, res, next) {
  res.send('respond with a resource');
});



module.exports = router;
