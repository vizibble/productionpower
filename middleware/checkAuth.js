/**
 * @module Middleware/checkAuth
 * @description Defines middleware for user authentication using JWT tokens.
 */
require('dotenv').config();
const jwt = require("jsonwebtoken");

/**
 * Middleware to validate JWT tokens for user authentication.
 * 
 * @function JWTMiddleware
 * @param {Object} req - The HTTP request object.
 * @param {Object} req.cookies - Cookies sent with the request, containing the JWT token.
 * @param {Object} res - The HTTP response object.
 * @param {Function} next - The next middleware function to be called if validation succeeds.
 * @returns {void}
 * 
 * @description
 * - Extracts the JWT token from the `req.cookies.token`.
 * - If the token is missing, logs an "Unauthorized Access" error and redirects the user to the login page with a 401 status code.
 * - If the token is present, verifies its validity using the secret key from `process.env.JWTSecretKey`.
 * - On successful verification, attaches the decoded payload to `req.userData` and proceeds to the next middleware.
 * - On verification failure, logs the error and redirects the user to the login page.
 * 
 * @example
 * //Example middleware usage:
 * app.use(JWTMiddleware);
 * 
 * @throws {Error} Logs an error if the token verification fails.
 */
const JWTMiddleware = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        console.error(`[${new Date().toLocaleString("en-GB")}] Unauthorised Access`);
        return res.status(401).redirect(`/login`);
    }
    try {
        const JWTSecretKey = process.env.JWTSecretKey;
        const decodedPayload = jwt.verify(token, JWTSecretKey);
        req.userData = decodedPayload;
        next();
    } catch (err) {
        console.error(`[${new Date().toLocaleString("en-GB")}] Error validating user for admin access: ${err.message}`);
        return res.redirect(`/user/login`);
    }
}
module.exports = { JWTMiddleware }