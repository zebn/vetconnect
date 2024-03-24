var express = require('express');
var router = express.Router();
var auth = require('../authenticate/auth');

router.get('/login', function (request, response, next) {
    if (request.cookies['token']&&request.cookies['username']) {
        response.redirect('/users');
    }
    else {
        response.render('login', {error: false});
    }
});

router.get('/signup', function (request, response, next) {
    if (request.cookies['token']&&request.cookies['username']) {
        response.redirect('/users');
    }
    else {
        response.render('signup', {error: false});
    }
});



router.post('/login',auth.checkLogin, function (request, response, next) {
    if (request.session.loggedin) {
        response.redirect('/users');
    }
    else {
        response.render('login', {error: request.error});
    }
});


router.post('/signup',auth.signUp, function (request, response, next) {
    if (request.session.loggedin) {
        response.redirect('/users');
    }
    else {
        response.render('signup', {error: request.error});
    }
});


router.get('/logout', function (request, response, next) {
    response.clearCookie('token');
    response.clearCookie('username');
    request.session.destroy((err) => {
        response.redirect('/');
      })
});







module.exports = router;