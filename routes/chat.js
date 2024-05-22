var express = require('express');
var router = express.Router();
var auth = require('../authenticate/auth');
const chat = require('../controller/chat');
const user = require('../controller/user');

router.get('/:roomId', auth.checkAuthToken, async function (request, response, next) {
  const messages = await chat.getAllMessages(request.params.roomId);
  const users = await chat.getUsersForChat(request.params.roomId);
  const chats = await chat.getAllChatsForUser(request.session.userId);
  const chatInfo = await chat.getChatInfo(request.params.roomId);
  const userInfo = JSON.parse(JSON.stringify(await user.getUserInfo(request.session.userId)));
  console.log(chatInfo);
  response.render('chat', {
    chatInfo: chatInfo,
    username: request.session.username,
    name: userInfo.name,
    nickname: userInfo.nickname,
    familiarName:userInfo.familiarName,
    familiarType:userInfo.familiarType,
    img: userInfo.img,
    roomId: request.params.roomId,
    role: request.session.role,
    userId: request.session.userId,
    messages: messages,
    users: users,
    chats: chats
  });
});

// router.get('/create/:roomId',auth.checkAuthToken, function (request, response, next) {
//   response.render('chat', { username: request.session.username, roomId:req.params.roomId});
// });


module.exports = router;
