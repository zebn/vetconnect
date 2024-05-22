var express = require('express');
var router = express.Router();
var auth = require('../authenticate/auth');
var user = require('../controller/user');
var chat = require('../controller/chat');

/* GET users listing. */
router.get('/:result?', auth.checkAuthToken, async function (request, response, next) {
  const userInfo = await user.getUserInfo(request.session.userId);
  const chats = await chat.getAllChatsForUser(request.session.userId);
  const chatsWithoutDoctor = await chat.getAllChatsWithoutDoctor();
  const chatsFinished = await chat.getAllFinishedChatsForUser(request.session.userId);
  response.render('users', { username: request.session.username, role: request.session.role, userId: request.session.userId,userInfo:userInfo, chats: chats, chatsWithoutDoctor: chatsWithoutDoctor, result:request.params.result,chatsFinished:chatsFinished});
});

router.post('/passwordchange', auth.checkAuthToken, async function(request, response, next) {
  let  result=await user.changeOldPassword(request.body.oldPassword,request.body.newPassword,request.body.confirmPassword,request.session.userId);
  response.redirect('/users/'+result);
});

router.post('/finalize/:chatId', auth.checkAuthToken, async function (request, response, next) {
  await chat.finalizeChat(request.params.chatId);
  response.redirect('/users/')
});

router.post('/imagedchange', auth.checkAuthToken, async function(request, response, next) {
  await user.changeImage(request.files.profileimage,request.session.userId);
  response.redirect('/users');
});


module.exports = router;
