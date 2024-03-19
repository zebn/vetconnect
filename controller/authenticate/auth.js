const mysql = require('mysql');


const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'vetconnect'
});



var checkLogin = (request, response, next) => {
    let username = request.body.username
    let password = request.body.password
    // Ensure the input fields exists and are not empty
    if (username && password) {
        // Execute SQL query that'll select the account from the database based on the specified username and password
        connection.query('select * from user u inner join role r on r.idRole = u.idRole where u.Email = ? AND u.Password = ?', [username, password], function (error, results, fields) {
            // If there is an issue with the query, output the error
            if (error) throw error;
            // If the account exists
            if (results.length > 0) {
                // Authenticate the user
                console.log(`${results[0].Email} logged in with role ${results[0].nameRole}`);
                request.session.loggedin = true;
                request.session.username = username;
                request.session.role = results[0].nameRole;
                token = require('crypto').randomBytes(32).toString('hex');
                request.session.token = token;
                response.cookie('username', username, { maxAge: 2 * 60 * 60 * 1000, httpOnly: true });
                response.cookie('token', token, { maxAge: 2 * 60 * 60 * 1000, httpOnly: true });
                connection.query("UPDATE user SET AuthToken=?, PasswordToken =? WHERE Email = ?", [token, token, username], function (error, results, fields) {
                    if (error) throw error;
                });
                next();
                return true
            } else {
                request.session.loggedin = false;
                request.error = "Wrong username or password";
                next();
                return false
            }
        });
    } else {
        request.session.loggedin = false;
        request.error = "Field Empty";
        next();
        return false
    }
};


var checkAuthToken = (request, response, next) => {

    if (!request.cookies['username']||!request.cookies['token']) {
        // response.status(403).send('Not logged in');
        response.redirect('/login');
    }
    else {
        connection.query('select * from user u inner join role r on r.idRole = u.idRole where u.Email = ? AND u.AuthToken = ?', [request.cookies['username'], request.cookies['token']], function (error, results, fields) {
            if (error) throw error;
            // If the account exists
            if (results.length > 0) {
                console.log(`${results[0].Email} with id ${results[0].idUser} entered in with role ${results[0].nameRole}`);
                request.session.loggedin = true;
                request.session.username = results[0].Email;
                request.session.userId = results[0].idUser;
                request.session.token = request.cookies['token'];
                request.session.role = results[0].nameRole;
                // Access is granted, proceed to the next middleware or route handler
                next();
            }
            else {
                // response.status(403).send('Access denied.');
                response.redirect('/login');
                return;
            }
        });
    }
};


module.exports = {
    checkLogin,
    checkAuthToken
};

