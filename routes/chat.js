var express = require('express');
var router = express.Router();
var auth = require('../authenticate/auth');
const message = require('../controller/message');

router.get('/:roomId', auth.checkAuthToken, async function (request, response, next) {
  const messages = await message.getAllMessages(request.params.roomId)
  console.log(messages);
  response.render('chat', { username: request.session.username, roomId: request.params.roomId, role:request.session.role, userId: request.session.userId,messages:messages});
});

// router.get('/create/:roomId',auth.checkAuthToken, function (request, response, next) {
//   response.render('chat', { username: request.session.username, roomId:req.params.roomId});
// });


module.exports = router;
