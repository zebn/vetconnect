const db = require('../model/db');
const crypto = require('crypto');
var path = require('path');

async function getUserInfo(userId) {
    return new Promise((resolve, reject) => {
        db.connection.query('select * from user u where u.idUser =?',
            [userId], function (error, results, fields) {
                if (error) throw error;
                resolve(results[0]);
            });
    });
}

async function changePassword(password, userId) {
    password = crypto.createHash('sha256').update(password).digest('hex');
    return new Promise((resolve, reject) => {
        db.connection.query('UPDATE user SET password = ? WHERE idUser = ?;',
            [password, userId], function (error, results, fields) {
                if (error) resolve(error);
                resolve(true);
            });
    });
}


async function getAllUsers(){
    return new Promise((resolve, reject) => {
        db.connection.query('select u.idUser,u.username,u.name,u.familiarName,u.familiarType,r.nameRole,u.isActive from user u inner join role r on r.idRole = u.idRole', function (error, results, fields) {
            if (error) {reject(error)};                
            resolve(results)
        });
    });
}

async function deleteUser(userId) {
    return new Promise((resolve, reject) => {
        db.connection.query('DELETE FROM user WHERE idUser = ?;',
            [userId], function (error, results, fields) {
                if (error) throw error;
                resolve();
            });
    });
}

async function editUser(username, name, familiarName, familiarType, idRole, isActive, idUser) {
    return new Promise((resolve, reject) => {
        db.connection.query('UPDATE user SET username = ?, name = ?, familiarName = ?, familiarType = ?, idRole = ?,  isActive = ? WHERE idUser = ?;',
            [username, name, familiarName, familiarType, idRole, isActive,idUser], function (error, results, fields) {
                if (error) {
                    if (error.errno == 1062) { resolve("Este correo ya está registrado"); }
                    else {  resolve(error.message); }
                }
                resolve(true);
            });
    });
}

async function addUser(username, name, familiarName, familiarType, role, isActive) {
    return new Promise((resolve, reject) => {
        db.connection.query('INSERT INTO user (username, name, familiarName, familiarType, idRole, isActive) VALUES (?, ?, ?, ?, ?, ?);',
            [username, name, familiarName, familiarType, role, isActive], function (error, results, fields) {
                if (error) {
                    if (error.errno == 1062) { resolve("Este correo ya está registrado"); }
                    else {  resolve(error.message); }
                }
                resolve(true);
            });
    });
}

async function changeImage(profileimage, userId) {
    return new Promise((resolve, reject) => {
        let uploadPath;
        if (!profileimage) {
            throw 'No files were uploaded.';
        }
        uploadPath = path.join(__dirname, '..', 'public', 'upload', userId.toString() + '_' + profileimage.name);
        profileimage.mv(uploadPath, function (err) {
            if (err) throw console.log(error);
            db.connection.query('UPDATE user SET img = ? WHERE idUser = ? ', [userId.toString() + '_' + profileimage.name, userId], function (error, results, fields) {
                if (error) console.log(error);
                resolve();
            });
        });
    }
    )
};


module.exports = {
    getUserInfo,
    changePassword,
    getAllUsers,
    deleteUser,
    editUser,
    addUser,
    changeImage
};

