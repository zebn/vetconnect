const db = require('../model/db');
var path = require('path');

async function getReviewsInfo(reviewId) {
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

async function deleteTournament(tournamentId) {
    return new Promise((resolve, reject) => {
        db.connection.query('DELETE FROM tourney WHERE tourney_id = ?;',
            [tournamentId], function (error, results, fields) {
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

async function changeImage(image, tournamentId) {
    return new Promise((resolve, reject) => {
        let uploadPath;
        if (!image) {
            throw 'No files were uploaded.';
        }
        // name of the input is sampleFile
        uploadPath = path.join(__dirname, '..', 'public', 'upload', tournamentId.toString() + '_' + image.name);
        // console.log(sampleFile);
        // Use mv() to place file on the server
        image.mv(uploadPath, function (err) {
            if (err) throw err;
            db.connection.query('UPDATE tourney SET tourney_img = ? WHERE tourney_id = ? ', [tournamentId.toString() + '_' + image.name, tournamentId], function (error, results, fields) {
                if (error) console.log(error);
                resolve();
            });
        });
    }
    )
};


module.exports = {
    getReviewsInfo,
    getAllReviews,
    deleteTournament,
    editReview,
    addReview,
    changeImage
};