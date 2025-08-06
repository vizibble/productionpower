const Pool = require("pg").Pool;
require("dotenv").config()
const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PW,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: true }
});

module.exports = pool