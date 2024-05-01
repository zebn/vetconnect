const socketIo = require('socket.io')
const db = require('../model/db');
var moment = require('moment');
var path = require('path');
const fs = require('fs');
var crypto = require("crypto");


class SocketController {
    constructor(server) {


        const io = socketIo(server);

        io.on('connection', (socket) => {

            function joinRoom(data) {
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
                        console.log(results);
                        if (results.affectedRows>0)
                        {
                            io.to(data.roomId).emit('join', data);
                            io.to(data.roomId).emit('make online', data);
                        } else
                        {
                            io.to(data.roomId).emit('make online', data);
                        }                         
                    });
            };

            socket.on('chat message', (data) => {
                if (data.file)
                 {
                    var filename=data.userId + '_'+data.roomId + '_' + data.filename
                 }
                db.connection.query("INSERT INTO message (textMessage,idChat,idUser,dateMessage,file) VALUES (?);"
                    , [[data.message, data.roomId, data.userId, new Date(), filename]], function (error, results, fields) {
                        if (error) throw error;
                        data.dateMessage = moment(new Date().toUTCString()).fromNow();
                        // if ((data.nameRole == "ROLE_ADMIN") || (data.nameRole == "ROLE_DOCTOR")) {
                        //     data.img = "/img/doctor.png"
                        // } else {
                        //     data.img = "/img/user.png"
                        // }
                        if (data.file) {
                            let uploadPath;
                            // name of the input is sampleFile
                            uploadPath = path.join(__dirname, '..', 'public', 'upload',filename );
                            fs.writeFile(uploadPath, data.file, (err) => {
                                if (err) throw console.log(error);
                                data.file=filename;
                                console.log('message with file',data);
                                io.to(data.roomId).emit('chat message', data);
                            });
                        }
                        else { 
                            console.log('message without file',data);
                            io.to(data.roomId).emit('make online', data);
                            io.to(data.roomId).emit('chat message', data); }
                    });
            });

            socket.on('create', (data, callback) => {
                db.connection.query("INSERT INTO chat (nameChat) VALUES (?);"
                    , [`Consulta ${data.nickname}`], function (error, results, fields) {
                        if (error) throw error;
                        console.log(`${data.userId} created room ${results.insertId}`);
                        joinRoom({ userId: data.userId, roomId: results.insertId });
                        callback({
                            roomId: results.insertId,
                            roomName: `Consulta ${data.nickname}`
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

            socket.on('disconnect', () => {
                // console.log(session.username + ' user disconnected');
            });
        });
    }


}

module.exports = SocketController