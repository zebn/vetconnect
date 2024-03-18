var express = require('express');
var router = express.Router();
var auth = require('../controller/authenticate/auth');
const message = require('../model/message');

/* GET users listing. */
router.get('/', auth.checkAuthToken, async function (request, response, next) {
  const chats = await message.getAllChatsForUser(request.params.roomId)
  const chatsWithoutDoctor = await message.getAllChatsWithoutDoctor(request.params.roomId)
  response.render('users', { username: request.session.username, role:request.session.role, userId: request.session.userId,chats:chats,chatsWithoutDoctor:chatsWithoutDoctor});
});

module.exports = router;
