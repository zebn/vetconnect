const db = require('../model/db');

async function getAllChats(){
    return new Promise((resolve, reject) => {
        db.connection.query('select * from chat c inner join chatuser cu on c.idChat = cu.idChat left join user u on c.idUser = cu.idUser', [idChat], function (error, results, fields) {
            if (error) {reject(error)};                
            resolve(results)
        });
    });
}

module.exports = {
    getAllChats
};
