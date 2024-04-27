const db = require('../model/db');
var path = require('path');

async function getReviewInfo(reviewId) {
    return new Promise((resolve, reject) => {
        db.connection.query('select * from review r where r.idReview =?',
            [reviewId], function (error, results, fields) {
                if (error) console.log(error);
                resolve(results[0]);
            });
    });
}

async function getAllReviews() {
    return new Promise((resolve, reject) => {
        db.connection.query('select r.idReview,r.userReview, r.bodyReview, r.starsReview  from review r', function (error, results, fields) {
            if (error) { reject(error) };
            resolve(results)
        });
    });
}

async function deleteReview(reviewId) {
    return new Promise((resolve, reject) => {
        db.connection.query('DELETE FROM review WHERE idReview = ?;',
            [reviewId], function (error, results, fields) {
                if (error) console.log(error);
                resolve();
            });
    });
}

async function editReview(reviewUser, reviewBody, reviewStars, reviewId) {
    return new Promise((resolve, reject) => {

        db.connection.query('UPDATE review SET userReview = ?, bodyReview = ?, starsReview = ? WHERE idReview = ?;',
            [reviewUser, reviewBody, reviewStars, reviewId], function (error, results, fields) {
                if (error) console.log(error);
                resolve();
            });
    });
}

async function addReview(reviewUser, reviewBody, reviewStars) {
    return new Promise((resolve, reject) => {
        db.connection.query('INSERT INTO review (userReview, bodyReview, starsReview) VALUES (?,?,?);',
            [reviewUser, reviewBody, reviewStars], function (error, results, fields) {
                if (error) console.log(error);
                resolve();

            });
    });
}

module.exports = {
    getReviewInfo,
    getAllReviews,
    deleteReview,
    editReview,
    addReview,
};