var express = require('express');
var router = express.Router();
var auth = require('../authenticate/auth');
var user = require('../controller/user');
var chat = require('../controller/chat');
var review = require('../controller/review');

/* GET users listing. */
router.get('/:dataId', auth.checkAuthToken, async function (request, response, next) {

  var data;

  var columns;

  var title;

  if (request.params.dataId == "users") {
    data = JSON.parse(JSON.stringify(await user.getAllUsers()));

    

    title="Usuarios"

    columns = [  "ID" ,"Nick" ,"Imagen" , "Correo" , "Nombre" , "Nombre de mascota", "Tipo de mascota", "Rol" ,"Estado", "" ];

    data.forEach(element => {
      element.img=`<img class="rounded-circle" width="50px" src="/upload/${element.img}"></img>`
      element.edit = `<form action="/admin/users/delete/${element.idUser}" method="POST"> <a class="btn btn-primary" href="/admin/users/edit/${element.idUser}" role="button">Editar</a> <button type="submit" class="btn btn-danger">Borrar</button></form>`;      
    });
  }

  if (request.params.dataId == "chats") {

    title="Consultas"

    data = JSON.parse(JSON.stringify(await chat.getAllChats()));

    columns = [  "idChat" ,  "nameChat" ,   "isFinished" ,"isNeedDoctor","edit"  ];
    data.forEach(element => {
      element.edit=`<a class="btn btn-primary" href="/chat/${element.idChat}" role="button">Unir</a> <form action="/admin/chats/delete/${element.idChat}" method="POST"><button type="submit" class="btn btn-danger">Borrar</button> </form> `;
    });
  
  }

  if (request.params.dataId == "reviews") {

    title="Opiniones"

    data = JSON.parse(JSON.stringify(await review.getAllReviews()));

    columns = [  "ID" ,  "Usuario" ,   "Comentario" ,"Estrellas","",""];
    data.forEach(element => {
      element.edit = `<a class="btn btn-primary" href="/admin/reviews/edit/${element.idReview}" role="button">Editar</a>`;      
      element.delete = `<form action="/admin/reviews/delete/${element.idReview}" method="POST"> <button type="submit" class="btn btn-danger">Borrar</button></form>`;      
    });
  
  }

  if (request.session.role == "ROLE_ADMIN")
    response.render('admin', { username: request.session.username, role: request.session.role, userId: request.session.userId, data: data, columns: columns,title:title,dataId: request.params.dataId  });
  else {
    response.render('error', { username: request.session.username, role: request.session.role, userId: request.session.userId, error: { status: "403 Forbidden", stack: "" } });
  }
});

router.get('/users/edit/:userId', async function (request, response, next) {
  var userInfo = await user.getUserInfo(request.params.userId);
  response.render('useredit', { username: response.locals.username, role: response.locals.role, userInfo: userInfo });
});

router.post('/users/edit/:userId', async function (request, response, next) {
   await user.editUser(request.body.username, request.body.name, request.body.familiarName, request.body.familiarType, request.body.role,request.body.isActive,request.params.userId);
  response.redirect('/admin/users/')
});

router.get('/reviews/edit/:reviewId', async function (request, response, next) {
  var reviewInfo = await review.getReviewInfo(request.params.reviewId);
  response.render('reviewedit', { username: response.locals.username, role: response.locals.role, reviewInfo: reviewInfo });
});

router.post('/reviews/edit/:reviewId', async function (request, response, next) {
   await review.editReview(request.body.reviewUser, request.body.reviewBody, request.body.reviewStars,request.params.reviewId);
  response.redirect('/admin/reviews/')
});

router.post('/users/delete/:userId', auth.checkAuthToken, async function (request, response, next) {
  await user.deleteUser(request.params.userId);
  response.redirect('/admin/users/')
});

router.post('/reviews/delete/:reviewId', auth.checkAuthToken, async function (request, response, next) {
  await review.deleteReview(request.params.reviewId);
  response.redirect('/admin/reviews/')
});

router.get('/users/add', async function (request, response, next) {
  response.render('useradd', { username: response.locals.username, role: response.locals.role });
});

router.post('/users/add', async function (request, response, next) {
  console.log(request.body.isActive);   
  await user.addUser(request.body.username, request.body.name,request.body.familiarName, request.body.familiarType,  request.body.role,  request.body.isActive);
  response.redirect('/admin/users/')
});

router.get('/reviews/add', async function (request, response, next) {
  response.render('reviewadd', { username: response.locals.username, role: response.locals.role });
});

router.post('/reviews/add', async function (request, response, next) {
  await review.addReview(request.body.user, request.body.reviewBody, request.body.reviewStars);
  response.redirect('/admin/reviews/')
});

router.post('/chats/delete/:chatId', auth.checkAuthToken, async function (request, response, next) {
  await chat.deleteChat(request.params.chatId);
  response.redirect('/admin/chats/')
});

module.exports = router;
