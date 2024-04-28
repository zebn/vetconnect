var express = require('express');
var router = express.Router();
var auth = require('../authenticate/auth');
var review = require('../controller/review');

router.get('/', async function (request, response, next) {
  const reviews = await review.getAllReviews();
  console.log(reviews)
  response.render('index', { username: response.locals.username, role: response.locals.role, reviews: reviews });
});


module.exports = router;

