const db = require('../model/db');
const crypto = require('crypto');
var path = require('path');
const nodemailer = require('nodemailer');

async function getUserInfo(userId) {
    return new Promise((resolve, reject) => {
        db.connection.query('select * from user u where u.idUser =?',
            [userId], function (error, results, fields) {
                if (error) throw error;
                resolve(results[0]);
            });
    });
}

async function changePassword(passwordNew, passwordConfirm, userId) {
    const token = require('crypto').randomBytes(32).toString('hex');
    return new Promise((resolve, reject) => {
        if (passwordNew == passwordConfirm) {
            passwordConfirm = crypto.createHash('sha256').update(passwordConfirm).digest('hex');
            db.connection.query('UPDATE user SET password = ?, PasswordToken =? WHERE idUser = ?;',
                [passwordConfirm, token, userId], function (error, results, fields) {
                    if (error) resolve(error);
                    resolve(true);
                });
        }
        else {
            resolve("notsame")
        }
    });
}



    async function changeOldPassword(passwordOld, passwordNew, passwordConfirm, userId) {
        const hashed_password = crypto.createHash('sha256').update(passwordOld).digest('hex');
        return new Promise((resolve, reject) => {
            db.connection.query('select * from user u inner join role r on r.idRole = u.idRole where u.idUser =? AND u.password =?', [userId, hashed_password], function (error, results, fields) {
                if (results.length > 0) {
                    if (passwordNew == passwordConfirm) {
                        const hashed_passwordConfirm = crypto.createHash('sha256').update(passwordConfirm).digest('hex');
                        db.connection.query('UPDATE user SET password = ? WHERE idUser = ?;',
                            [hashed_passwordConfirm, userId], function (error, results, fields) {
                                if (error) resolve(error);
                                resolve("success")
                            });
                    }
                    else {
                        resolve("notfound")
                    }
                }
                else {
                    resolve("notexist")
                }
            });
        });

    }


    async function getAllUsers() {
        return new Promise((resolve, reject) => {
            db.connection.query('select u.idUser,u.nickname,u.img,u.username,u.name,u.familiarName,u.familiarType,r.nameRole,u.isActive from user u inner join role r on r.idRole = u.idRole', function (error, results, fields) {
                if (error) { reject(error) };
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

    async function editUser(username, name, familiarName, familiarType, idRole, isActive, idUser, nickname) {
        return new Promise((resolve, reject) => {
            db.connection.query('UPDATE user SET username = ?, name = ?, familiarName = ?, familiarType = ?, idRole = ?,  isActive = ?, nickname = ? WHERE idUser = ?;',
                [username, name, familiarName, familiarType, idRole, isActive, nickname, idUser], function (error, results, fields) {
                    if (error) {
                        if (error.errno == 1062) { resolve("Este correo ya está registrado"); }
                        else { resolve(error.message); }
                    }
                    resolve(true);
                });
        });
    }

    async function addUser(username, name, familiarName, familiarType, role, isActive, nickname) {
        return new Promise((resolve, reject) => {
            let token = require('crypto').randomBytes(32).toString('hex');
            db.connection.query('INSERT INTO user (username, name, familiarName, familiarType, idRole, isActive, nickname,passwordToken,authToken) VALUES (?, ?, ?, ?, ?, ?, ?,?,?);',
                [username, name, familiarName, familiarType, role, isActive, nickname, token, token], function (error, results, fields) {
                    if (error) {
                        if (error.errno == 1062) { resolve("Este correo ya está registrado"); }
                        else { resolve(error.message); }
                    }
                    const transporter = nodemailer.createTransport({
                        port: 587,               // true for 465, false for other ports
                        host: process.env.MAILHOST,
                        auth: {
                            user: process.env.MAILUSER,
                            pass: process.env.MAILPASS,
                        },
                        secure: false,
                        tls: {
                            ciphers: 'SSLv3'
                        }
                    });

                    const mailData = {
                        from: 'ap7456@gmail.com',  // sender address
                        to: username,   // list of receivers
                        subject: 'Alta en club del tenis',
                        text: 'That was easy!',
                        html: `¡Hola <b>${nickname}!</b>  <br>¡Gracias por registarse en VETCONNECT! <br>Para acceder es necesario reestablecer su contraseña.`
                    };

                    transporter.sendMail(mailData, function (err, info) {
                        if (err) {
                            console.log(err);
                            resolve(err)
                        }
                        else {
                            console.log(info);
                            resolve(true);
                        }
                    });

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
        changeImage,
        changeOldPassword
    };

