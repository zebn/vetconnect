var express = require('express');
var passport = require('passport');
var LocalStrategy = require('passport-local');
var crypto = require('crypto');
const db = require('../model/db');

var router = express.Router();


passport.use(new LocalStrategy(function verify(username, password, cb) {
    db.connection.query('select * from user u inner join role r on r.idRole = u.idRole where u.username = ?', [username], function (err, results, fields) {
        if (err) { return cb(err); }
        if (!results[0]) { return cb(null, false, { message: 'Incorrect username or password.' }); }
        crypto.pbkdf2(password, results[0].salt, 310000, 32, 'sha256', function (err, hashedPassword) {
            if (err) { return cb(err); }
            if (!crypto.timingSafeEqual(results[0].hashed_password, hashedPassword)) {
                return cb(null, false, { message: 'Incorrect username or password.' });
            }
            return cb(null, { id: results[0].idUser,
                username: results[0].username,
                role: results[0].role });
        });
    });
}));

passport.serializeUser(function (user, cb) {
    process.nextTick(function () {
        cb(null, { id: user.id,
            username: user.username,
            role: user.role });
    });
});

passport.deserializeUser(function (user, cb) {
    process.nextTick(function () {
        return cb(null, user);
    });
});


router.post('/login/password', passport.authenticate('local', {
    successRedirect: '/users',
    failureRedirect: '/login'
}));

router.get('/login', function (req, res, next) {
    res.render('login');
});


router.get('/logout', function (req, res, next) {
    req.logout(function (err) {
        if (err) { return next(err); }
        res.redirect('/');
    });
});

router.get('/signup', function (req, res, next) {
    res.render('signup');
});

router.post('/signup', function(req, res, next) {
    var salt = crypto.randomBytes(16);
    crypto.pbkdf2(req.body.password, salt, 310000, 32, 'sha256', function(err, hashedPassword) {
      if (err) { return next(err); }
      db.connection.query('INSERT INTO user (username, hashed_password, salt) VALUES (?, ?, ?)', [
        req.body.username,
        hashedPassword,
        salt
      ], function(err) {
        if (err) { return next(err); }
        var user = {
          id: this.lastID,
          username: req.body.username
        };
        req.login(user, function(err) {
          if (err) { return next(err); }
          res.redirect('/');
        });
      });
    });
  });

module.exports = router;