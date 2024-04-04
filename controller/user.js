const db = require('../model/db');

async function getAllUsers(){
    return new Promise((resolve, reject) => {
        db.connection.query('select u.idUser,u.username,r.nameRole,u.isActive from user u inner join role r on r.idRole = u.idRole', function (error, results, fields) {
            if (error) {reject(error)};                
            resolve(results)
        });
    });
}

module.exports = {
    getAllUsers
};

