var express = require('express');
var router = express.Router();
var auth = require('../authenticate/auth');
var user = require('../controller/user');
var chat = require('../controller/chat');

/* GET users listing. */
router.get('/:dataId', auth.checkAuthToken, async function (request, response, next) {

  var data;

  var columns;

  var title;

  if (request.params.dataId == "users") {
    data = JSON.parse(JSON.stringify(await user.getAllUsers()));

    

    title="Usuarios"

    columns = [  "ID" ,  "Email" ,   "Rol" ,"Estado", "" ];

    data.forEach(element => {
      element.edit = `<form action="/admin/users/delete/${element.idUser}" method="POST"> <a class="btn btn-primary" href="/admin/users/edit/${element.idUser}" role="button">Editar</a> <button type="submit" class="btn btn-danger">Borrar</button></form>`;      
    });
  }

  router.get('/users/edit/:userId', async function (request, response, next) {
    var userInfo = await user.getUserInfo(request.params.userId);
    response.render('useredit', { username: response.locals.username, role: response.locals.role, userInfo: userInfo });
  });
  
  router.post('/users/edit/:userId', async function (request, response, next) {
  
    await user.editUser(request.params.userId, request.body.role, request.body.group, request.body.name, request.body.surname, request.body.username, request.body.age, request.body.hand, request.body.backhand);
    response.redirect('/admin/users/')
  });

  if (request.params.dataId == "chats") {

    title="Consultas"

    data = JSON.parse(JSON.stringify(await chat.getAllChats()));

    columns = [  "idChat" ,  "nameChat" ,   "isFinished" ,"isNeedDoctor","edit"  ];
    data.forEach(element => {
      element.edit=`<a class="btn btn-primary" href="/chat/${element.idChat}" role="button">Unir</a> <a class="btn btn-danger" href="/admin/chats/delete/${element.idChat}" role="button">Borrar</a>`;
    });
  
  }

  console.log(data);

  if (request.session.role == "ROLE_ADMIN")
    response.render('admin', { username: request.session.username, role: request.session.role, userId: request.session.userId, data: data, columns: columns,title:title });
  else {
    response.render('error', { username: request.session.username, role: request.session.role, userId: request.session.userId, error: { status: "403 Forbidden", stack: "" } });
  }
});



module.exports = router;
