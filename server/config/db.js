// const mysql = require("mysql2");

// const connection = mysql.createConnection({
//     host: process.env.DB_HOST,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_NAME
// });

// connection.connect((err) => {
//     if (err) {
//         console.log("Database Connection Failed");
//         console.log(err);
//     } else {
//         console.log("Database Connected Successfully");
//     }
// });

// module.exports = connection;

const { Pool } = require("pg");

const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: 5432,
    ssl: {
        rejectUnauthorized: false
    }
});

pool.connect()
    .then(client => {
        console.log("Database Connected Successfully");
        client.release();
    })
    .catch(err => {
        console.error("Database Connection Failed");
        console.error(err);
    });