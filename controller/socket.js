const socketIo = require('socket.io')
const db = require('../model/db');
var moment = require('moment');
var path = require('path');
const fs = require('fs').promises;
var crypto = require("crypto");
const chatbot = require('../controller/chatbot');
const chat = require('../controller/chat');


class SocketController {
    constructor(server) {
        const io = socketIo(server,{
            maxHttpBufferSize: 1e7
          });
        io.on('connection', (socket) => {
            async function joinRoom(data) {
                return new Promise((resolve, reject) => {
                    db.connection.query("INSERT IGNORE INTO chatuser (idChat, idUser) VALUES (?);"
                        , [[data.roomId, data.userId]], function (error, results, fields) {
                            if (error) throw error;
                            console.log(`${data.userId} with ${data.role} joined ${data.roomId}`);
                            if (data.role == "ROLE_DOCTOR" || data.role == "ROLE_ADMIN") {
                                db.connection.query("UPDATE chat SET isNeedDoctor = 0 WHERE idChat = ?;"
                                    , [[data.roomId]], function (error, results, fields) {
                                        if (error) throw error;
                                        console.log(`${data.userId} doctor assigned to ${data.roomId}`);
                                    });
                            }
                            socket.join(data.roomId);
                            if (results.affectedRows > 0) {
                                io.to(data.roomId).emit('join', data);
                                io.to(data.roomId).emit('make online', data);
                            } else {
                                io.to(data.roomId).emit('make online', data);
                            }
                        });
                });
            }

            async function insertMessageDb(data) {
                if (data.file) {
                    var filename = data.userId + '_' + data.roomId + '_' + data.filename
                }
                return new Promise((resolve, reject) => {
                    db.connection.query("INSERT INTO message (textMessage,idChat,idUser,dateMessage,file) VALUES (?);",
                        [[data.message, data.roomId, data.userId, new Date(), filename]], async function (error, results, fields) {
                            if (error) throw error;
                            data.dateMessage = moment(new Date().toUTCString()).fromNow();
                            console.log('message', data);
                            if (data.file) {
                                let uploadPath;
                                uploadPath = path.join(__dirname, '..', 'public', 'upload', filename);
                                await fs.writeFile(uploadPath, data.file, (err) => {
                                    if (err) throw console.log(err);
                                    resolve(results);
                                });
                            }
                            resolve(results);
                        });
                });
            }

            socket.on('chat message', async (data, callback) => {
                console.log("test")
                let results = await insertMessageDb(data);
                if (data.file) {
                    var filename = data.userId + '_' + data.roomId + '_' + data.filename
                    data.file = filename;
                }
                data.dateMessage = moment(new Date().toUTCString()).fromNow();
                io.to(data.roomId).emit('make online', data);
                io.to(data.roomId).emit('chat message', data);
                let chatinfo = await chat.getChatInfo(data.roomId)
                if (chatinfo['isNeedDoctor'] == true && data.message) {
                    let response = await chatbot.generateResponseAI(data.message);
                    console.log(response)
                    let databotanswer = {
                        message: response.answer !== undefined ? response.answer : "Lo siento, no entiendo. Necesitas esperar al veterinario.",
                        roomId: data.roomId,
                        username: "Bot@bot.com",
                        file: null,
                        filename: null,
                        name: "VetBot",
                        userId: 1,
                        nameRole: "ROLE_ADMIN",
                        img: "bot.jpg"
                    }
                    await insertMessageDb(databotanswer);
                    io.to(data.roomId).emit('chat message', databotanswer);
                }
                if (callback) callback({
                    messageId: results.insertId
                });
            });

            socket.on('create', (data, callback) => {
                return new Promise((resolve, reject) => {
                    db.connection.query('select * from chat c left join chatuser cu on cu.idChat = c.idChat where idUser = ? AND c.isFinished = 0', [data.userId], function (error, results, fields) {
                        if (results.length > 0) {
                            callback({
                                isConsultCreated:true,
                                roomId: results[0].idChat,
                            });
                            }
                        else {
                            db.connection.query("INSERT INTO chat (nameChat) VALUES (?);"
                                , [`Consulta con ${data.nickname}`], function (error, results, fields) {
                                    if (error) throw error;
                                    console.log(`${data.userId} created room ${results.insertId}`);
                                    joinRoom({ userId: data.userId, roomId: results.insertId });
                                    callback({
                                        roomId: results.insertId,
                                        roomName: `Consulta con ${data.nickname} ${results.insertId}`
                                    });
                                });
                        }

                    });
                });
            });

            socket.on('join', async (data) => {
                await joinRoom(data);
            });


            socket.on('leave', (room) => {
                console.log(`Socket ${data.username} leaving ${room}`);
                socket.leave(room);
            });

            socket.on('make offline', (data) => {
                console.log(`Socket ${data.username} became offline ${data.roomId}`);
                io.to(data.roomId).emit('make offline', data);
            });


            socket.on('make online', (data) => {
                console.log(`Socket ${data.username} became offline ${data.roomId}`);
                io.to(data.roomId).emit('make online', data);
            });

            socket.on('disconnect', (data, callback) => {
                socket.broadcast.emit('user disconnected', socket.id);
            })

            socket.on('connect_error', function(err) {
                console.log("client connect_error: ", err);
            });
            
            socket.on('connect_timeout', function(err) {
                console.log("client connect_timeout: ", err);
            });
        });
    }


}

module.exports = SocketController