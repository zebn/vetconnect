const socketIo = require('socket.io')
const db = require('../model/db');
var moment = require('moment');

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
            db.connection.query('select m.idMessage, m.dateMessage, m.textMessage, m.file, m.idChat, m.idUser, u.username, u.name, u.img, r.nameRole from message m left join user u on m.idUser = u.idUser left join  role r on r.idRole = u.idRole where idChat = ? ORDER BY m.dateMessage;', [idChat], function (error, results, fields) {
                if (error) {reject(error)};                
                results.forEach(element => {
                    element.dateMessage=moment(element.dateMessage).fromNow();
                });
                resolve(results)
            });
        });
    }

    async getAllChatsForUser(idUser){
        return new Promise((resolve, reject) => {
            db.connection.query('select * from chat c left join chatuser cu on cu.idChat = c.idChat where idUser = ? AND c.isFinished = 0', [idUser], function (error, results, fields) {
                if (error) {reject(error)};
                resolve(results)
            });
        });
    }

    async getUsersForChat(idChat){
        return new Promise((resolve, reject) => {
            db.connection.query('select * from chatuser cu inner join user u on cu.idUser = u.idUser left join role r on r.idRole = u.idRole where cu.idChat = ?', [idChat], function (error, results, fields) {
                if (error) {reject(error)};
                resolve(results)
            });
        });
    }

    async getAllChatsWithoutDoctor(){
        return new Promise((resolve, reject) => {
            db.connection.query('select c.* from chat c left join chatuser cu on c.idChat = cu.idChat where c.isNeedDoctor = 1 AND c.isFinished = 0', function (error, results, fields) {
                if (error) {reject(error)};
                console.log(results);
                resolve(results)
            });
        });
    }

    async getAllFinishedChatsForUser(idUser){
        return new Promise((resolve, reject) => {
            db.connection.query('select * from chat c left join chatuser cu on cu.idChat = c.idChat where idUser = ? AND c.isFinished = 1', [idUser], function (error, results, fields) {
                if (error) {reject(error)};
                resolve(results)
            });
        });
    }

}

module.exports = new Message()