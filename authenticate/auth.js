const socketIo = require('socket.io')
const db = require('../model/db');

var checkLogin = (request, response, next) => {
    let username = request.body.username;
    let password = request.body.password;
    // Ensure the input fields exists and are not empty
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
                response.cookie('username', results[0].username, { maxAge: 2 * 60 * 60 * 1000, httpOnly: true });
                response.cookie('role', results[0].nameRole, { maxAge: 2 * 60 * 60 * 1000, httpOnly: true });
                db.connection.query("UPDATE user SET AuthToken=?, PasswordToken =? WHERE username = ?", [token, token, results[0].username], function (error, results, fields) {
                    if (error) throw error;
                });
                if (request.body.rememberme) {
                    response.cookie('token', token, { maxAge: 2 * 60 * 60 * 1000, httpOnly: true });
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
    if (err) { return next(err); }
    db.connection.query('INSERT INTO user (username, password) VALUES (?, ?, ?)', [request.body.username, request.body.password], function (err, results, fields) {
        if (err) { return next(err); }
        // checkLogin(request, response, function (err) {
        //     if (err) { return next(err); }
        // });
    });
};

module.exports = {
    checkLogin,
    checkAuthToken,
    signUp
};

