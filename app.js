var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const session = require("express-session");
const fileUpload = require('express-fileupload');
var chatbot = require('./controller/chatbot');
require('dotenv').config({ path:path.join(__dirname, '.env'),override: true, });



var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var loginRouter = require('./routes/login');
var chatRouter = require('./routes/chat');
var adminRouter = require('./routes/admin');
var contactRouter = require('./routes/contact');
var legalRouter = require('./routes/legal');
var questionsRouter = require('./routes/questions');



var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(fileUpload());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  // store: new SQLiteStore({ db: 'sessions.db', dir: './var/db' })
}));

app.use(function (req, res, next) {
  var loggedin;
  var username;
  var userId;
  var role;
  if (req.cookies['username'] && req.cookies['role']) {
    username = req.cookies['username'];
    role = req.cookies['role'];
  }
  else {
    if (req.session.username && req.session.role && req.session.loggedin) {
      username = req.session.username;
      role = req.session.role;
      userId = req.session.userId;
    }
  }
  res.locals = { loggedin: loggedin, username: username, userId: userId, role: role };
  next();
});


app.use('/', indexRouter);
app.use('/', loginRouter);
app.use('/', legalRouter);
app.use('/users', usersRouter);
app.use('/chat', chatRouter);
app.use('/admin', adminRouter);
app.use('/contact', contactRouter);
app.use('/questions', questionsRouter);

chatbot.trainChatBotIA();



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});



// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
