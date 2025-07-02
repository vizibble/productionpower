/**
 * @module utils/analyse_Fuel_Data
 * @description Handles the analysis of fuel data for a tanker, determines its status (rise, leak, drain, or stable), and sends appropriate alerts.
 * @requires {get_Fuel_Trend} - Function to calculate the trend of fuel data over time.
 * @requires {is_point_near_target_location} - Function to check if the tanker is near a target location.
 * @requires {send_Email_Alert} - Function to send email alerts based on tanker status changes.
 * @requires {getLocationName} - Function to get the location name from coordinates.
 * @requires {Update_Tanker_Info_Query} - Function to update the tanker status in the database.
 */
const { get_Fuel_Trend } = require("./check_Fuel_Trend");
const { is_point_near_target_location } = require("./check_target_location");
const { send_Email_Alert } = require("../service/send_Mail");
const { getLocationName } = require("../service/get_Location_from_coordinates");
const { Update_Tanker_Info_Query } = require("../Database/Data_from_device.js");
const { calculateVolume } = require("./calculate_volume");

/**
 * @function handleLocation
 * @param {Object} coordinates - The geographical coordinates (latitude, longitude) of the tanker.
 * @param {number} coordinates.latitude - The latitude of the tanker's location.
 * @param {number} coordinates.longitude - The longitude of the tanker's location.
 * @returns {Promise<string>} - The location name as a string, or a fallback message if location retrieval fails.
 * @description
 * This function calls `getLocationName` from service directory to fetch the location based on the given coordinates.
 * If an error occurs or no location is found, it returns a default message ("Location not found")
 */
async function handleLocation({ latitude, longitude }) {
    try {
        const location = await getLocationName({ latitude, longitude });
        return location || "Location not found";
    } catch (error) {
        console.error(`Error fetching location for coordinates (${latitude}, ${longitude}): ${error.message}`);
        return "Location not found";
    }
}

/**
 * Sends an alert to the frontend via a socket connection.
 * 
 * @param {string} status - The new status to alert (e.g., 'rise', 'leak', 'drain', 'stable').
 * @param {Object} socket - The socket connection used to emit the alert.
 * @param {string} number_plate - The unique identifier for the tanker.
 */
function send_alert_to_frontend(status, socket, number_plate) {
    if (socket) socket.emit("Popup-Alert", { status });
    else console.warn(`[${new Date().toLocaleString("en-GB")}] No socket connection for tanker ${number_plate}.`);
}

/**
 * Handles various alerts for tanker events, updating data and notifying stakeholders.
 * 
 * @param {string} newStatus - The new status of the tanker (e.g., 'rise', 'leak', 'drain', 'stable').
 * @param {string} messageType - The type of alert message to send (e.g., 'Fuel Increase Detected').
 * @param {string} number_plate - The unique identifier for the tanker.
 * @param {Object} deviceData - The data object for the tanker, including status, fuel data, and tanker details.
 * @param {number} latitude - The latitude of the tanker's location.
 * @param {number} longitude - The longitude of the tanker's location.
 * @param {Object} socket - The socket connection for sending frontend alerts.
 * 
 * @returns {Promise<void>} - Resolves when all operations (alert, email, and database updates) are complete.
 */
async function handleAlert(newStatus, messageType, number_plate, deviceData, latitude, longitude, socket) {
    send_alert_to_frontend(newStatus, socket, number_plate)
    console.log(`\x1b[41m Fuel is ${newStatus}ing \x1b[0m`);

    deviceData.status = newStatus;
    const { tanker_equation, fuelDataArray, tanker_id } = deviceData;
    const volume = calculateVolume(tanker_equation, fuelDataArray[0]);
    const location = await handleLocation({ latitude, longitude });
    const message = `Device ${number_plate}: Fuel level at ${volume} is ${newStatus}ing at ${location} with coordinates (${latitude}, ${longitude})`;

    try {
        send_Email_Alert(messageType, message, 3, "gmplant@jbrtechnologies.org");
    } catch (error) {
        console.error(`[${new Date().toLocaleString("en-GB")}] Error sending email for ${number_plate}: ${error.message}`);
    }

    try {
        Update_Tanker_Info_Query(newStatus, tanker_id);
    } catch (error) {
        console.error(`[${new Date().toLocaleString("en-GB")}] Error updating status for ${number_plate}: ${error.message}`);
    }
}

/**
 * @function analyzeFuelData
 * @param {string} number_plate - The unique identifier for the tanker.
 * @param {number} longitude - The longitude of the tanker's current location.
 * @param {number} latitude - The latitude of the tanker's current location.
 * @param {Object} deviceData - The device data including fuel levels and status of the tanker.
 * @param {Object} socket - The socket object for real-time communication with the frontend.
 * @returns {Promise<void>} - Analyzes the fuel data and triggers status updates or alerts.
 * 
 * @description
 * This function:
 * 1. Analyzes fuel data trends to detect changes in fuel levels (e.g., increase, leak, drain, or stable).
 * 2. Checks if the tanker is near a target location.
 * 3. Sends alerts to the frontend and email based on the detected trend and status.
 * 4. Updates the tanker status in the database and logs the events.
 * 
 * @throws {Error} Logs any errors encountered during status updates or alert sending.
 * 
 * @example
 * // Example usage:
 * analyzeFuelData("TN1234", 77.5946, 12.9716, deviceData, socket);
 */
async function analyzeFuelData(number_plate, longitude, latitude, deviceData, socket) {
    const { fuelDataArray } = deviceData;
    let { status } = deviceData;

    const trend = get_Fuel_Trend(fuelDataArray);
    deviceData.stableCount = trend === 0 ? deviceData.stableCount + 1 : 0;

    const withinRadius = is_point_near_target_location({ latitude, longitude });
    if (trend > 0 && status !== 'rise') {
        await handleAlert('rise', "Fuel Increase Detected", number_plate, deviceData, latitude, longitude, socket);
        return;
    } else if (trend < 0 && !withinRadius && status !== 'leak') {
        await handleAlert('leak', "Fuel Leak Detected", number_plate, deviceData, latitude, longitude, socket);
        return;
    } else if (trend < 0 && withinRadius && status !== 'drain') {
        await handleAlert('drain', "Fuel Drain Detected", number_plate, deviceData, latitude, longitude, socket);
        return;
    } else if (trend == 0 && deviceData.stableCount >= 40 && status !== 'stable') {
        await handleAlert('stable', "Fuel is Stable", number_plate, deviceData, latitude, longitude, socket);
        deviceData.stableCount = 0;
        return;
    }
}

module.exports = { analyzeFuelData };