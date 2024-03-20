const socketIo = require('socket.io')
const db = require('../model/db');

class Message {
    constructor(idMessage, dateMessage, textMessage, binaryMessage, idChat, idUser) {
        this.idMessage = idMessage;
        this.dateMessage = dateMessage;
        this.textMessage = textMessage;
        this.binaryMessage = binaryMessage;
        this.idChat = idChat;
        this.idUser = idUser;
    }

    async getAllMessages(idChat){
        return new Promise((resolve, reject) => {
            db.connection.query('select * from message m inner join user u on m.idUser = u.idUser where idChat = ?', [idChat], function (error, results, fields) {
                if (error) {reject(err)};
                resolve(results)
            });
        });
    }

    async getAllChatsForUser(idUser){
        return new Promise((resolve, reject) => {
            db.connection.query('select * from chatuser cu inner join chat c on cu.idChat = c.idChat where idUser = ? AND isFinished = 0', [idUser], function (error, results, fields) {
                if (error) {reject(err)};
                resolve(results)
            });
        });
    }

    async getAllChatsWithoutDoctor(idUser){
        return new Promise((resolve, reject) => {
            db.connection.query('select * from chatuser cu inner join chat c on cu.idChat = c.idChat where c.isNeedDoctor = 1 AND c.isFinished = 0', [idUser], function (error, results, fields) {
                if (error) {reject(err)};
                resolve(results)
            });
        });
    }
}

module.exports = new Message()