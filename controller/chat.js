const db = require('../model/db');

async function getAllChats(){
    return new Promise((resolve, reject) => {
        db.connection.query('select * from chat c', function (error, results, fields) {
            if (error) {reject(error)};                
            resolve(results)
        });
    });
}

module.exports = {
    getAllChats
};
