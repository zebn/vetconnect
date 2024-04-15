const db = require('../model/db');

async function getUserInfo(userId) {
    return new Promise((resolve, reject) => {
        db.connection.query('select * from user u where u.idUser =?',
            [userId], function (error, results, fields) {
                if (error) throw error;
                resolve(results[0]);
            });
    });
}

async function changePassword(password,userId) {
    return new Promise((resolve, reject) => {
        db.connection.query('UPDATE user SET hashed_password = ? WHERE user_id = ?;',
            [password,userId], function (error, results, fields) {
                if (error) throw error;
                resolve();
            });
    });
}

async function getAllUsers(){
    return new Promise((resolve, reject) => {
        db.connection.query('select u.idUser,u.username,r.nameRole,u.isActive from user u inner join role r on r.idRole = u.idRole', function (error, results, fields) {
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

async function editUser(userId, roleId, groupId, levelId, name, surname, username, age, hand,  backhand) {
    return new Promise((resolve, reject) => {
        db.connection.query('UPDATE user SET role_id = ?, group_id = ?, level_id = ?, name = ?, surname = ?, email = ?,  hand = ?, backhand = ? WHERE user_id = ?;',
            [roleId, groupId, levelId, name, surname, username, hand,  backhand ,userId], function (error, results, fields) {
                if (error) throw error;
                resolve();
            });
    });
}

module.exports = {
    getUserInfo,
    changePassword,
    getAllUsers,
    deleteUser,
    editUser
};

