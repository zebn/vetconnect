var express = require('express');
var router = express.Router();
var auth = require('../controller/authenticate/auth');

/* GET users listing. */
router.get('/', function (request, response, next) {
    if (request.cookies['token']&&request.cookies['username']) {
        response.redirect('/users');
    }
    else {
        response.render('login', {error: false});
    }
});

/* Login user */
router.post('/',auth.checkLogin, function (request, response, next) {
    if (request.session.loggedin) {
        response.redirect('/users');
    }
    else {
        response.render('login', {error: request.error});
    }
});




module.exports = router;