var express = require('express');
var router = express.Router();
var auth = require('../authenticate/auth');
const message = require('../controller/message');

/* GET users listing. */
router.get('/', auth.checkAuthToken, async function (request, response, next) {
  const chats = await message.getAllChatsForUser(request.session.userId)
  const chatsWithoutDoctor = await message.getAllChatsWithoutDoctor(request.params.roomId)
  response.render('users', { username: request.session.username, role:request.session.role, userId: request.session.userId,chats:chats,chatsWithoutDoctor:chatsWithoutDoctor});
});

module.exports = router;
