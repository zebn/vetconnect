const db = require('../model/db');
var moment = require('moment');

async function getAllChats(){
    return new Promise((resolve, reject) => {
        db.connection.query('SELECT c.idChat, c.nameChat, c.isFinished, c.isNeedDoctor, MIN(u.img) AS img FROM chat c INNER JOIN chatuser cu ON cu.idChat = c.idChat INNER JOIN user u ON cu.idUser = u.idUser INNER JOIN role r ON u.idRole = r.idRole WHERE r.nameRole="ROLE_USER"  GROUP BY c.idChat, c.nameChat, c.isFinished, c.isNeedDoctor', function (error, results, fields) {
            if (error) {reject(error)};                
            resolve(results)
        });
    });
}

async function getChatInfo(idChat){
    return new Promise((resolve, reject) => {
        db.connection.query('select * from chat where idChat =?',
        [idChat], function (error, results, fields) {
            if (error) {reject(error)};                
            resolve(results[0])
        });
    });
}

async function deleteChat(idChat){
    return new Promise((resolve, reject) => {
        db.connection.query('DELETE FROM chat WHERE idChat = ?;',
            [idChat], function (error, results, fields) {
                if (error) throw error;
                resolve();
            });
    });
}

async function finalizeChat(idChat){
    return new Promise((resolve, reject) => {
        db.connection.query('UPDATE chat SET isFinished = 1 WHERE idChat = ?;',
            [idChat], function (error, results, fields) {
                if (error) throw error;
                resolve();
            });
    });
}

async function activateChat(idChat){
    return new Promise((resolve, reject) => {
        db.connection.query('UPDATE chat SET isFinished = 0 WHERE idChat = ?;',
            [idChat], function (error, results, fields) {
                if (error) throw error;
                resolve();
            });
    });
}

async function getAllMessages(idChat){
    return new Promise((resolve, reject) => {
        db.connection.query('select m.idMessage, m.dateMessage, m.textMessage, m.file, m.idChat, m.idUser, u.username, u.name, u.img, r.nameRole from message m left join user u on m.idUser = u.idUser left join  role r on r.idRole = u.idRole where idChat = ? ORDER BY m.dateMessage;', [idChat], function (error, results, fields) {
            if (error) {reject(error)};                
            results.forEach(element => {
                element.dateMessage=moment(element.dateMessage).fromNow();
            });
            resolve(results)
        });
    });
}

async function getAllChatsForUser(idUser){
    return new Promise((resolve, reject) => {
        db.connection.query('select * from chat c left join chatuser cu on cu.idChat = c.idChat where idUser = ? AND c.isFinished = 0', [idUser], function (error, results, fields) {
            if (error) {reject(error)};
            resolve(results)
        });
    });
}

async function getUsersForChat(idChat){
    return new Promise((resolve, reject) => {
        db.connection.query('select * from chatuser cu inner join user u on cu.idUser = u.idUser left join role r on r.idRole = u.idRole where cu.idChat = ?', [idChat], function (error, results, fields) {
            if (error) {reject(error)};
            resolve(results)
        });
    });
}

async function getAllChatsWithoutDoctor(){
    return new Promise((resolve, reject) => {
        db.connection.query('select c.* from chat c left join chatuser cu on c.idChat = cu.idChat where c.isNeedDoctor = 1 AND c.isFinished = 0', function (error, results, fields) {
            if (error) {reject(error)};
            console.log(results);
            resolve(results)
        });
    });
}

async function getAllFinishedChatsForUser(idUser){
    return new Promise((resolve, reject) => {
        db.connection.query('select * from chat c left join chatuser cu on cu.idChat = c.idChat where idUser = ? AND c.isFinished = 1', [idUser], function (error, results, fields) {
            if (error) {reject(error)};
            resolve(results)
        });
    });
}


module.exports = {
    activateChat,
    getAllChats,
    getChatInfo,
    deleteChat,
    finalizeChat,
    getAllMessages,
    getAllChatsForUser,
    getUsersForChat,
    getAllChatsWithoutDoctor,
    getAllFinishedChatsForUser
};
