var express = require('express');
var router = express.Router();
var auth = require('../authenticate/auth');
var user = require('../controller/user');

/* GET users listing. */
router.get('/:dataId', auth.checkAuthToken, async function (request, response, next) {

  var data;

  var columns;

  if (request.params.dataId = "users") {
    data = JSON.parse(JSON.stringify(await user.getAllUsers()));

    columns = [
      { "data": "idUser" },
      { "data": "username" },
      { "data": "nameRole" },
      { "data": "username" },
      { defaultContent: '<input type="button" class="btn btn-primary" value="Editar"/> <input type="button" class="btn btn-danger" value="Borrar"/>' }
    ];
  }

  if (request.params.dataId = "chats") {
    data = JSON.parse(JSON.stringify(await user.getAllUsers()));

    columns = [
      { "data": "idUser" },
      { "data": "username" },
      { "data": "nameRole" },
      { "data": "username" },
      { defaultContent: '<input type="button" class="btn btn-primary" value="Editar"/> <input type="button" class="btn btn-danger" value="Borrar"/>' }
    ];
  }

  console.log(data);

  if (request.session.role == "ROLE_ADMIN")
    response.render('admin', { username: request.session.username, role: request.session.role, userId: request.session.userId, data: data, columns: columns });
  else {
    response.render('error', { username: request.session.username, role: request.session.role, userId: request.session.userId, error: { status: "403 Forbidden", stack: "" } });
  }
});



module.exports = router;
