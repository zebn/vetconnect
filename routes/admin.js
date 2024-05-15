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

    var columnDefs = [
      {
          target: 0,
          visible: false,
          searchable: false
      }
  ]


    title="Usuarios"

    columns = [  "ID" ,"Nick" ,"Imagen" , "Correo" , "Nombre" , "Nombre de mascota", "Tipo de mascota", "Rol" ,"Estado", "","" ];

    data.forEach(element => {
      if(element.img)
      element.img=`<img class="rounded-circle" width="50px" src="/upload/${element.img}" alt="${element.nickname}"></img>`
      else
      element.img = "Sin imagen"
      element.edit = `<a class="btn btn-primary" href="/admin/users/edit/${element.idUser}" role="button">Editar</a>`;
      element.delete = `<form action="/admin/users/delete/${element.idUser}" method="POST"><button type="submit" class="btn btn-danger">Borrar</button></form>`;            
      if (element.isActive==0){
        element.isFinished="Desactivado"
      }
      else{
        element.isActive="Activo"
      }
      if (element.nameRole=="ROLE_ADMIN"){
        element.nameRole="Administrador"
      }
      if (element.nameRole=="ROLE_USER"){
        element.nameRole="Usuario"
      }
      if (element.nameRole=="ROLE_DOCTOR"){
        element.nameRole="Veterinario"
      }
    });
  }

  if (request.params.dataId == "chats") {

    title="Consultas"

    data = JSON.parse(JSON.stringify(await chat.getAllChats()));

    var columnDefs = [
      {
          target: 0,
          visible: false,
          searchable: false
      },
      {
        target: 4,
        visible: false,
        searchable: false
    },
    {
      targets: [5,6,7], // Columnas para las que deseas definir el ancho
      width: '5%' // Tamaño deseado para las columnas
    }
  ]

    columns = [  "idChat",  "Nombre de consulta" , "Finalizada" ,"Atendida","Foto","","",""];
    data.forEach(element => {
      element.edit=`<a class="btn btn-primary" href="/chat/${element.idChat}" role="button">Unir</a>`;
      
      
      
      if (element.isFinished==0){
        element.isFinished="No"
        element.activate=`<form action="/admin/chats/finalize/${element.idChat}" method="POST"><button type="submit" class="btn btn-outline-warning">Finalizar</form>`;
      }
      else{
        element.isFinished="Si";
        element.activate=`<form action="/admin/chats/activate/${element.idChat}" method="POST"><button type="submit" class="btn btn-warning">Activar</form>`;
      }
      if (element.isNeedDoctor==0){
        element.isNeedDoctor="Si"
      }
      else{
        element.isNeedDoctor="No"
      }
      element.delete=`<form action="/admin/chats/delete/${element.idChat}" method="POST"><button type="submit" class="btn btn-danger">Borrar</button> </form> `;
      element.nameChat=`<img class="rounded-circle" width="50px" src="/upload/${element.img}" alt="Sin imagen"></img> ${element.nameChat}`
    });
  
  }

  if (request.params.dataId == "reviews") {

    title="Opiniones";

    var columnDefs = [
      {
          target: 0,
          visible: false,
          searchable: false
      }
  ]

    data = JSON.parse(JSON.stringify(await review.getAllReviews()));

    columns = [  "ID" ,  "Usuario" ,   "Comentario" ,"Estrellas","",""];
    data.forEach(element => {
      element.edit = `<a class="btn btn-primary" href="/admin/reviews/edit/${element.idReview}" role="button">Editar</a>`;      
      element.delete = `<form action="/admin/reviews/delete/${element.idReview}" method="POST"> <button type="submit" class="btn btn-danger">Borrar</button></form>`;      
    });
  
  }

  if (request.session.role == "ROLE_ADMIN"){
    let userInfo = await user.getUserInfo(request.session.userId);
    response.render('admin', { username: request.session.username, role: request.session.role, userId: request.session.userId, data: data, columns: columns,columnDefs:JSON.stringify(columnDefs),title:title,dataId: request.params.dataId, userInfo:userInfo});
  }
  else {
    response.render('error', { username: request.session.username, role: request.session.role, userId: request.session.userId, error: { status: "403 Forbidden", stack: "" } });
  }
});

router.get('/users/edit/:userId', auth.checkAuthToken,async function (request, response, next) {
  var userInfo = await user.getUserInfo(request.params.userId);
  response.render('useredit', { username: response.locals.username, role: response.locals.role, userInfo: userInfo });
});

router.post('/users/edit/:userId', auth.checkAuthToken,async function (request, response, next) {
   await user.editUser(request.body.username, request.body.name, request.body.familiarName, request.body.familiarType, request.body.role,request.body.isActive,request.params.userId,request.body.nickname);
  response.redirect('/admin/users/')
});

router.get('/reviews/edit/:reviewId', auth.checkAuthToken,async function (request, response, next) {
  var reviewInfo = await review.getReviewInfo(request.params.reviewId);
  response.render('reviewedit', { username: response.locals.username, role: response.locals.role, reviewInfo: reviewInfo });
});

router.post('/reviews/edit/:reviewId', auth.checkAuthToken,async function (request, response, next) {
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

router.get('/users/add', auth.checkAuthToken,async function (request, response, next) {
  response.render('useradd', { username: response.locals.username, role: response.locals.role });
});

router.post('/users/add', auth.checkAuthToken,async function (request, response, next) {
  console.log(request.body.isActive);   
  const result = await user.addUser(request.body.username, request.body.name,request.body.familiarName, request.body.familiarType,  request.body.role,  request.body.isActive, request.body.nickname);
  if (result == true) {
    response.redirect('/admin/users/')
  } else {
    response.render('useradd', { username: response.locals.username, role: response.locals.role, error: result });
  }
});

router.get('/reviews/add', auth.checkAuthToken,async function (request, response, next) {
  response.render('reviewadd', { username: response.locals.username, role: response.locals.role });
});

router.post('/reviews/add', auth.checkAuthToken,async function (request, response, next) {
  await review.addReview(request.body.user, request.body.reviewBody, request.body.reviewStars);
  response.redirect('/admin/reviews/')
});

router.post('/chats/delete/:chatId', auth.checkAuthToken, async function (request, response, next) {
  await chat.deleteChat(request.params.chatId);
  response.redirect('/admin/chats/')
});

router.post('/chats/finalize/:chatId', auth.checkAuthToken, async function (request, response, next) {
  await chat.finalizeChat(request.params.chatId);
  response.redirect('/admin/chats/')
});

router.post('/chats/activate/:chatId', auth.checkAuthToken, async function (request, response, next) {
  await chat.activateChat(request.params.chatId);
  response.redirect('/admin/chats/')
});

module.exports = router;
