var express = require('express');
var router = express.Router();
var auth = require('../authenticate/auth');
var user = require('../controller/user');
var Recaptcha = require('express-recaptcha').RecaptchaV2
var recaptcha = new Recaptcha(process.env.CAP1, process.env.CAP2)

router.get('/login/:result', recaptcha.middleware.renderWith({ hl: 'es' }),function (request, response, next) {
    if (request.session.loggedin) {
        response.redirect('/users');
    }
    else {
        response.render('login', { error: false, result: request.params.result, captcha: response.recaptcha  });
    }
});



router.get('/login', recaptcha.middleware.renderWith({ hl: 'es' }), function (request, response, next) {
    if (request.session.loggedin) {
        response.redirect('/users');
    }
    else {
        response.render('login', { error: false,result: false, captcha: response.recaptcha });
    }
});


router.post('/login', recaptcha.middleware.renderWith({ hl: 'es' }), recaptcha.middleware.verify, auth.checkLogin, function (request, response, next) {
    if (request.session.loggedin) {
        response.redirect('/users');
    }
    else {
        response.render('login', { error: request.error,result: request.params.result, captcha: response.recaptcha});
    }
});

router.get('/signup',  recaptcha.middleware.renderWith({ hl: 'es' }), function (request, response, next) {
    if (request.cookies['token'] && request.cookies['username']) {
        response.redirect('/users');
    }
    else {
        response.render('signup', { error: false ,captcha: response.recaptcha});
    }
});


router.post('/signup',recaptcha.middleware.renderWith({ hl: 'es' }), recaptcha.middleware.verify, auth.signUp, function (request, response, next) {
    if (request.error) {
        response.render('signup', { error: request.error ,captcha: response.recaptcha});
    }
});


router.get('/logout', function (request, response, next) {
    response.clearCookie('token');
    response.clearCookie('username');
    request.session.destroy((err) => {
        response.redirect('/');
    })
});

router.get('/passwordremind', function (request, response, next) {
    response.render('passwordremind', { error: false });
});


router.post('/passwordremind', async function (request, response, next) {
    await auth.remindPassword(request.body.email);
    response.redirect('passwordrestore');
});



router.get('/passwordrestore', function (request, response, next) {
    response.render('passwordrestore', { error: false });
});



router.post('/passwordrestore', async function (request, response, next) {
    const result = JSON.parse(JSON.stringify(await auth.getUserByPasswordToken(request.body.passwordtoken)));
    if (result.length > 0) {
        request.session.userId = result[0].idUser;
        response.redirect('passwordchange');
    }
    else {
        response.render('passwordrestore', { error: "Clave temporal no es valida" });
    }
});



router.get('/passwordchange', function (request, response, next) {
    response.render('passwordchange', { error: false });

});

router.post('/passwordchange', async function (request, response, next) {
    result = await user.changePassword(request.body.newPassword, request.body.confirmPassword,  request.session.userId);
    console.log(result)
    if (result===true) {
        response.redirect('/login/changePasswordSuccess');
    }
    else {
        response.render('passwordchange', { error: result });
    }


});


module.exports = router;