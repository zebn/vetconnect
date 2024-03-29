const socketIo = require('socket.io')
const db = require('../model/db');


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
                    });
            };

            socket.on('chat message', (data) => {
                db.connection.query("INSERT INTO message (textMessage,idChat,idUser,dateMessage) VALUES (?);"
                    , [[data.message, data.roomId, data.userId, new Date()]], function (error, results, fields) {
                        if (error) throw error;
                        console.log(`User: ${data.username},msg: ${data.message}, room: ${data.roomId}`);
                        data.dateMessage=new Date().toUTCString();
                        io.to(data.roomId).emit('chat message', data);
                    });
            });

            socket.on('create', (data, callback) => {
                db.connection.query("INSERT INTO chat (nameChat) VALUES (?);"
                    , [`Consulta ${data.username}`], function (error, results, fields) {
                        if (error) throw error;
                        console.log(`${data.userId} created room ${results.insertId}`);
                        joinRoom({ userId: data.userId, roomId: results.insertId });
                        callback({
                            roomId: results.insertId,
                            roomName: `Consulta ${data.username}`
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