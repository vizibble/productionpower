/**
 * @module service/email
 * @description Provides a function to send email alerts using Nodemailer with Gmail as the email service.
 * 
 * @requires nodemailer - For sending email messages.
 * @requires dotenv - Loads environment variables for email configuration (email address and password).
 * 
*/
const nodemailer = require("nodemailer");
require("dotenv").config();

/**
 * @constant {Object} emailTransporter - The configured Nodemailer transporter object for sending emails.
 * 
*/
const emailTransporter = nodemailer.createTransport({
    service: "gmail",
    secure: true,
    port: 465,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
    },
});

/**
 * @function send_Email_Alert
 * @param {string} subject - The subject line of the email.
 * @param {string} message - The body content of the email.
 * @param {number} [retryCount=3] - The number of retries in case of failure. Defaults to 3 retries.
 * @param {string} reciever - mail to which the email is sent.
 * @returns {void} - Sends an email or retries the operation if it fails.
 * 
 * @description
 * This function:
 * 1. Constructs an email message with the given subject and message body.
 * 2. Attempts to send the email using the configured Nodemailer transporter.
 * 3. If sending fails, retries the operation a specified number of times (default is 3).
 * 4. Logs the status of email delivery and any errors encountered during the process.
 * 
 * @throws {Error} Logs an error if email sending fails after all retries are exhausted.
 * 
 * @example
 * // Example usage:
 * send_Email_Alert("Alert: Tanker Data", "Fuel level is low on tanker #5");
*/
function send_Email_Alert(subject, message, retryCount = 3, reciever) {
    const mailOptions = {
        from: process.env.EMAIL,
        to: reciever,
        subject,
        text: message,
    };

    try {
        emailTransporter.sendMail(mailOptions);
        console.log(`\x1b[42m Email Sent: ${subject} \x1b[0m`);
    }
    catch (error) {
        console.error(`[${new Date().toLocaleString("en-GB")}] Error sending email: ${error.message}`);
        if (retryCount > 0) {
            console.log(`Retrying... Attempts left: ${retryCount}`);
            setTimeout(() => send_Email_Alert(subject, message, retryCount - 1, reciever), 5000);
        } else {
            console.error('Failed to send email:', error);
        }
    }
}

module.exports = { send_Email_Alert };