/**
 * @module service/tankerData
 * @description Provides functionality to initialize or retrieve tanker data from the database.
 * 
 * @function getTankerData
 * @param {string} numberPlate - The number plate of the tanker to retrieve or initialize data for.
 * @param {number} requiredLength - The required length of fuel data to fetch from the database.
 * @returns {Object} - An object containing tanker data, including:
 *   - `fuelDataArray`: Array of fuel levels retrieved from the database or empty if no data exists.
 *   - `status`: The current status of the tanker, e.g., `'stable'`.
 *   - `tanker_name`: The name of the tanker.
 *   - `tanker_id`: The unique identifier for the tanker.
 *   - `factor`: A numerical value associated with the tanker.
 *   - `stableCount`: A count used for detecting stable conditions.
 * 
 * @description
 * This function:
 * 1. Attempts to fetch existing fuel data for the tanker identified by `numberPlate`.
 * 2. If no data is found, it inserts a new record for the tanker and returns an initial state.
 * 3. If data is found, it returns the existing fuel data along with other tanker-related information.
 * 4. The function ensures that the tanker data is properly initialized, with empty fuel data if needed.
 * 
 * @example
 * // Example usage:
 * const tankerData = await getTankerData("AB123CD", 10);
 * console.log(tankerData); // Logs the tanker data object.
 * 
 * @throws {Error} Throws an error if fetching or inserting tanker data fails, with the message `"Failed to initialize tanker data"`.
 */
const { Get_Fuel_Data_Query, Insert_Tanker_Info_Query } = require("../Database/Data_from_device.js")

// Initialize or retrieve tanker data from the database
async function getTankerData(numberPlate, requiredLength) {
    try {
        const result = await Get_Fuel_Data_Query(numberPlate, requiredLength);
        if (result.rows.length === 0) {
            const insertResult = await Insert_Tanker_Info_Query(numberPlate);
            const newDevice = insertResult.rows[0];
            return {
                fuelDataArray: [],
                status: 'stable',
                tanker_name: newDevice.tanker_name,
                tanker_id: newDevice.tanker_id,
                factor: 100.00,
                stableCount: 0,
                tanker_equation: {
                    "0": -162.31254432306943,
                    "1": 4.150072958151474,
                    "2": 0.009927196796148,
                    "3": -0.000005744628532
                }
            };
        }
        else {
            const { tanker_id, tanker_name, status, factor } = result.rows[0];
            const tanker_equation = {};
            result.rows.forEach(row => {
                const { degree, coefficient } = row;
                tanker_equation[degree] = coefficient;
            });
            return {
                fuelDataArray: result.rows.map(data => Number(data.fuel_level)),
                status: status,
                tanker_name: tanker_name,
                tanker_id: tanker_id,
                factor: Number(factor),
                stableCount: 0,
                tanker_equation: tanker_equation
            };
        }
    }
    catch (err) {
        console.error(`[${new Date().toLocaleString("en-GB")}] Error fetching data for tanker ${numberPlate}: ${err.message}`);
        throw new Error("Failed to initialize tanker data");
    }
}

module.exports = { getTankerData }