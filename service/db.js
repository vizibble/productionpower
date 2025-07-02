/**
 * @module service/db
 * @description Configures and exports a PostgreSQL client for database interactions.
 * 
 * @requires pg.Client - PostgreSQL client for connecting and executing queries.
 * @requires dotenv - Loads environment variables from a `.env` file.
 * 
 * @configuration
 * - `user`: Database username, sourced from `DB_USER` environment variable.
 * - `password`: Database password, sourced from `DB_PW` environment variable.
 * - `host`: Database host, sourced from `DB_HOST` environment variable.
 * - `port`: Database port, sourced from `DB_PORT` environment variable.
 * - `database`: Database name, sourced from `DB_NAME` environment variable.
 * - `ssl`: Configured for secure connection, with `rejectUnauthorized` set to `true`.
 * 
 * @exports {Client} - An instance of the PostgreSQL client.
 */
const Client = require("pg").Client;
require("dotenv").config()
const client = new Client({
    user: process.env.DB_USER,
    password: process.env.DB_PW,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    // ssl: { rejectUnauthorized: true }
});

module.exports = client