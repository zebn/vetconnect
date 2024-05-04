
const mysql = require('mysql2');
 
const connection = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DB,
    connectTimeout: 60000
});

connection.on('error', (error) => {
    console.error(error);
  });

module.exports = {
    connection: connection,
  };