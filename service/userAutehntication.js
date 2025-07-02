/**
 * @module service/jwt
 * @description Provides functionality for generating JSON Web Tokens (JWT) for user authentication.
 * 
 * @requires dotenv - Loads environment variables from a `.env` file, including the JWT secret key.
 * @requires jsonwebtoken - Used for generating JWT tokens.
 */
require('dotenv').config()
const JWTSecretKey = process.env.JWTSecretKey;

/**
 * 
 * @constant {string} JWTSecretKey - The secret key used for signing the JWT, sourced from the `JWTSecretKey` environment variable.
*/
const jwt = require("jsonwebtoken")

/** 
 * @function JWTGeneration
 * @param {Object} userData - The user data to include in the JWT payload.
 * @returns {string} - The generated JWT token.
 * 
 * @description
 * This function generates a JWT token for a given user using the provided user data and the secret key stored in environment variables.
 * The token is signed using the `JWTSecretKey` to ensure secure token generation.
 * 
 * @example
 * // Example usage:
 * const token = JWTGeneration({ userId: 123, role: 'admin' });
 * console.log(token); // Outputs the generated JWT token.
 */
const JWTGeneration = (userData) => jwt.sign(userData, JWTSecretKey)

module.exports = { JWTGeneration }