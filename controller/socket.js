const socketIo = require('socket.io')
const db = require('../model/db');
var moment = require('moment');
var path = require('path');
const fs = require('fs');
var crypto = require("crypto");
const chatbot = require('../controller/chatbot');
const chat = require('../controller/chat');


class SocketController {
    constructor(server) {
        const io = socketIo(server);
        io.on('connection', (socket) => {

            function joinRoom(data) {
                db.connection.query("INSERT IGNORE INTO chatuser (idChat, idUser) VALUES (?);"
                    , [[data.roomId, data.userId]], async function (error, results, fields) {
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
                        console.log(results);
                        if (results.affectedRows > 0) {
                            io.to(data.roomId).emit('join', data);
                            io.to(data.roomId).emit('make online', data);
                        } else {
                            io.to(data.roomId).emit('make online', data);
                        }
                    });
            };

            async function insertMessageDb(data) {
                if (data.file) {
                    var filename = data.userId + '_' + data.roomId + '_' + data.filename
                }
                db.connection.query("INSERT INTO message (textMessage,idChat,idUser,dateMessage,file) VALUES (?);"
                    , [[data.message, data.roomId, data.userId, new Date(), filename]], async function (error, results, fields) {
                        if (error) throw error;
                        data.dateMessage = moment(new Date().toUTCString()).fromNow();
                        if (data.file) {
                            let uploadPath;
                            // name of the input is sampleFile
                            uploadPath = path.join(__dirname, '..', 'public', 'upload', filename);
                            fs.writeFile(uploadPath, data.file, (err) => {
                                if (err) throw console.log(error);
                                data.file = filename;
                                console.log('message with file', data);
                            });
                        }
                        else {
                            console.log('message without file', data);
                        }
                        return results;
                    });
            }

            socket.on('chat message', async (data, callback) => {
                let results = await insertMessageDb(data);
                io.to(data.roomId).emit('make online', data);
                io.to(data.roomId).emit('chat message', data);
                let chatinfo = await chat.getChatInfo(data.roomId)
                console.log(chatinfo['nameChat'])
                if (chatinfo['isNeedDoctor'] == true) {
                    console.log("test")
                    let response = await chatbot.generateResponseAI(data.message);
                    console.log(response)
                    let databotanswer = {
                        message: response.answer !== undefined ? response.answer : "Lo siento, no entiendo :(",
                        roomId: data.roomId,
                        username: "Bot@bot.com",
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
                db.connection.query("INSERT INTO chat (nameChat) VALUES (?);"
                    , [`Consulta con ${data.nickname}`], function (error, results, fields) {
                        if (error) throw error;
                        console.log(`${data.userId} created room ${results.insertId}`);
                        joinRoom({ userId: data.userId, roomId: results.insertId });
                        callback({
                            roomId: results.insertId,
                            roomName: `Consulta con ${data.nickname} ${results.insertId}`
                        });
                        // io.sockets.socket(data.socketId).emit('new room', { userId: data.userId, roomId: results.insertId,roomName:`Consulta ${data.username}`});
                    });
            });

            socket.on('join', (data) => {
                joinRoom(data);
            });


            socket.on('leave', (room) => {
                console.log(`Socket ${data.username} leaving ${room}`);
                socket.leave(room);
            });

            socket.on('make offline', (data) => {
                console.log(`Socket ${data.username} became offline ${data.roomId}`);
                io.to(data.roomId).emit('make offline', data);
            });

            socket.on('disconnect', (data, callback) => {
                socket.broadcast.emit('user disconnected', socket.id);
            })
        });
    }


}

module.exports = SocketController