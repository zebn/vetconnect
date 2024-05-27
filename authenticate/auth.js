const db = require('../model/db');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

var checkLogin = (request, response, next) => {
    let username = request.body.username;
    let password = crypto.createHash('sha256').update(request.body.password).digest('hex');
    // Ensure the input fields exists and are not empty
    if (!request.recaptcha.error) {
        if (username && password) {
            // Execute SQL query that'll select the account from the database based on the specified username and password
            db.connection.query('select * from user u inner join role r on r.idRole = u.idRole where u.username =? AND u.password =?', [username, password], function (error, results, fields) {
                // If there is an issue with the query, output the error
                if (error) throw error;
                // If the account exists
                if (results.length > 0) {
                    // Authenticate the user
                    console.log(`${results[0].username} logged in with role ${results[0].nameRole}`);
                    request.session.loggedin = true;
                    request.session.username = results[0].username;
                    request.session.role = results[0].nameRole;
                    token = require('crypto').randomBytes(32).toString('hex');
                    request.session.token = token;
                    response.cookie('username', results[0].username, { maxAge: 5 * 60 * 60 * 1000, httpOnly: true });
                    response.cookie('role', results[0].nameRole, { maxAge: 5 * 60 * 60 * 1000, httpOnly: true });
                    db.connection.query("UPDATE user SET AuthToken=?, PasswordToken =? WHERE username = ?", [token, token, results[0].username], function (error, results, fields) {
                        if (error) throw error;
                    });
                    if (request.body.rememberme) {
                        response.cookie('token', token, { maxAge: 5 * 60 * 60 * 1000, httpOnly: true });
                    }
                    next();
                    return true
                } else {
                    request.session.loggedin = false;
                    request.error = "Contrasena incorrecta";
                    next();
                    return false
                }
            });
        } else {
            request.session.loggedin = false;
            request.error = "Campo obligatorio";
            next();
            return false
        }
    } else {
        request.session.loggedin = false;
        request.error = "Error en captcha";
        next();
        return false
    }
};


var checkAuthToken = (request, response, next) => {
    if (request.cookies['username'] && request.cookies['token']) {
        db.connection.query('select * from user u inner join role r on r.idRole = u.idRole where u.username = ? AND u.AuthToken = ?', [request.cookies['username'], request.cookies['token']], function (error, results, fields) {
            if (error) throw error;
            if (results.length > 0) {
                console.log(`${results[0].username} with id ${results[0].idUser} entered in with role ${results[0].nameRole}`);
                request.session.loggedin = true;
                request.session.username = results[0].username;
                request.session.userId = results[0].idUser;
                request.session.role = results[0].nameRole;
                next();
                return true
            }
            else {
                response.clearCookie("username");
                response.clearCookie("role");
                response.clearCookie("token");
                request.session.destroy((err) => {
                    response.redirect('/login');
                })
                return false
            }
        });
    } else {
        if (!request.session.username || !request.session.loggedin) {
            request.session.destroy((err) => {
                response.redirect('/login');
            })
            return false
        }
        else {
            db.connection.query('select * from user u inner join role r on r.idRole = u.idRole where u.username = ? AND u.AuthToken = ?', [request.session.username, request.session.token], function (error, results, fields) {
                if (error) throw error;
                if (results.length > 0) {
                    console.log(`${results[0].username} with id ${results[0].idUser} entered in with role ${results[0].nameRole}`);
                    request.session.loggedin = true;
                    request.session.username = results[0].username;
                    request.session.userId = results[0].idUser;
                    request.session.role = results[0].nameRole;
                    next();
                }
                else {
                    request.session.destroy((err) => {
                        response.redirect('/login');
                    })
                    return true;
                }
            });
        }
    }

};


var signUp = (request, response, next) => {
    response.clearCookie("username");
    response.clearCookie("role");
    response.clearCookie("token");
    request.session.destroy();
    if (!request.recaptcha.error) {
        if (request.body.username && request.body.password) {
            request.body.password = crypto.createHash('sha256').update(request.body.password).digest('hex');

            if (request.body.mascotname === '') {
                request.body.hand = null;
            }
            if (request.body.mascottype === '') {
                request.body.backhand = null;
            }

            let token = require('crypto').randomBytes(32).toString('hex');

        db.connection.query('INSERT INTO user (name, username , password, familiarName, familiarType, nickname, authToken, passwordToken ) VALUES (?, ?, ?, ?, ?, ?,?,?)', [request.body.name + ' ' + request.body.surname, request.body.username, request.body.password, request.body.mascotname, request.body.mascottype, request.body.nickname,token,token], function (error, results, fields) {
                if (error) {
                    if (error.errno == 1062) { request.error = "Este correo ya está registrado"; }
                    else { request.error = error.message }
                    next();
                }
                else {
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
                        to: request.body.username,   // list of receivers
                        subject: 'Alta en VETCONNECT',
                        text: 'That was easy!',
                        html: `¡Hola <b>${request.body.nickname}!</b>  <br>¡Gracias por registarse en VETCONNECT!`
                    };

                    return new Promise((resolve, reject) => {
                        transporter.sendMail(mailData, function (err, info) {
                            if (err) {
                                console.log(err);
                                response.redirect('/login/successRegister');
                                resolve(err)
                            }
                            else {
                                console.log(info);
                                response.redirect('/login/successRegister');
                                resolve('Correo enviado')
                            }
                        });
                    });

                }
            });
        } else {
            request.error = "Campo obligatorio";
            next();
            return false
        }
    }
    else {
        request.error = "Error in captcha";
        next();
        return false
    }
};



async function getUserByPasswordToken(passwordToken) {
    return new Promise((resolve, reject) => {
        db.connection.query('select * from user u where u.passwordToken = ?', [passwordToken], function (error, results, fields) {
            if (error) resolve(error);
            resolve(results);
        });
    });

};


async function remindPassword(email) {
    db.connection.query('select * from user u where u.username = ?', [email], function (error, results, fields) {
        if (error) console.log(error);
        if (results.length > 0) {
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
                to: email,   // list of receivers
                subject: 'Recordar contraseña',
                text: 'That was easy!',
                html: `¡Hola!</b><br>Tu clave temporal es <b>${results[0].passwordToken}</b>.<br>Por favor, utiliza el enlace proporcionado para restablecer tu contraseña: <a href="https://clubtenisigformacion.es/passwordrestore">clubtenisigformacion.es/passwordrestore</a>`
            };

            return new Promise((resolve, reject) => {
                transporter.sendMail(mailData, function (err, info) {
                    if (err) {
                        console.log(err);
                        resolve(err)
                    }
                    else {
                        console.log(info);
                        resolve('Correo enviado')
                    }
                });
            });
        }
        else {
            return false
        }

    });
};

module.exports = {
    checkLogin,
    checkAuthToken,
    signUp,
    getUserByPasswordToken,
    remindPassword
};