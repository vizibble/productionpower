require('dotenv').config()
const jwt = require("jsonwebtoken")

const JWTSecretKey = process.env.JWTSecretKey;
const JWTGeneration = (userData) => jwt.sign(userData, JWTSecretKey)

module.exports = { JWTGeneration }