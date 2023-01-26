const DbClient = require('ali-mysql-client');
const dotenv = require('dotenv');
dotenv.config();

const database = new DbClient({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

module.exports = database;