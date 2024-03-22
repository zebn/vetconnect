var express = require('express');
var router = express.Router();
var auth = require('../controller/authController');
const message = require('../controller/message');

/* GET users listing. */
router.get('/', auth.checkAuthToken, async function (request, response, next) {
  const chats = await message.getAllChatsForUser(request.session.userId)
  const chatsWithoutDoctor = await message.getAllChatsWithoutDoctor(request.params.roomId)
  console.log(request.user);
  response.render('users', { username: request.user.username, role:request.session.role, userId: request.session.userId,chats:chats,chatsWithoutDoctor:chatsWithoutDoctor});
});

module.exports = router;
