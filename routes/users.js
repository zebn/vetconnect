var express = require('express');
var router = express.Router();
var auth = require('../authenticate/auth');
const message = require('../controller/message');
var user = require('../controller/user');

/* GET users listing. */
router.get('/', auth.checkAuthToken, async function (request, response, next) {
  const userInfo = await user.getUserInfo(request.session.userId);
  const chats = await message.getAllChatsForUser(request.session.userId);
  const chatsWithoutDoctor = await message.getAllChatsWithoutDoctor();
  response.render('users', { username: request.session.username, role: request.session.role, userId: request.session.userId,userInfo:userInfo, chats: chats, chatsWithoutDoctor: chatsWithoutDoctor});
});

module.exports = router;
