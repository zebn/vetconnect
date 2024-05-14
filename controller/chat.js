const db = require('../model/db');

async function getAllChats(){
    return new Promise((resolve, reject) => {
        db.connection.query('SELECT c.idChat, c.nameChat, c.isFinished, c.isNeedDoctor, MIN(u.img) AS img FROM chat c INNER JOIN chatuser cu ON cu.idChat = c.idChat INNER JOIN user u ON cu.idUser = u.idUser GROUP BY c.idChat, c.nameChat, c.isFinished, c.isNeedDoctor', function (error, results, fields) {
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

module.exports = {
    activateChat,
    getAllChats,
    getChatInfo,
    deleteChat,
    finalizeChat
};
