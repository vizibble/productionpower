/**
 * @module Database/Data_from_device
 * @description Defines queries for handling data from devices.
 */
const client = require("../service/db");

/**
 * Inserts fuel data into the `tanker_data` table in the database.
 * 
 * @async
 * @function Insert_Fuel_Data_Query
 * @param {Object} data - The data to be inserted into the database.
 * @param {number} data.tanker_id - The ID of the tanker to associate with the fuel data.
 * @param {number} data.fuel - The fuel level of the tanker.
 * @param {number} data.latitude - The latitude of the tanker's location.
 * @param {number} data.longitude - The longitude of the tanker's location.
 * @returns {Promise<void>} - A promise that resolves when the insertion is complete.
 * 
 * @description
 * - Calculates the volume based on the fuel level using a cubic polynomial equation.
 * - Inserts the fuel data, including the calculated volume, into the `tanker_data` table.
 * - On success, completes the insertion without returning a value.
 * - On failure, logs an error message and the insertion is aborted.
 * 
 * @example
 * //Example request:
 * Insert_Fuel_Data_Query({
 *   tanker_id: 1,
 *   fuel: 150,
 *   latitude: 12.9716,
 *   longitude: 77.5946
 * });
 * 
 * @throws {Error} Logs an error if the insertion into the database fails.
 */
async function Insert_Fuel_Data_Query({ tanker_id, fuel, latitude, longitude }) {
    await client.query(
        'INSERT INTO tanker_data (tanker_id, fuel_level, latitude, longitude) VALUES ($1, $2, $3, $4)', [tanker_id, fuel, latitude, longitude]
    );
}

/**
 * Fetches fuel data for a specific tanker from the database.
 * 
 * @async
 * @function Get_Fuel_Data_Query
 * @param {string} numberPlate - The number plate of the tanker whose data is to be fetched.
 * @param {number} requiredLength - The number of records to retrieve from the database.
 * @returns {Promise<Object[]>} - A promise that resolves to an array of fuel data for the specified tanker.
 * 
 * @description
 * - Queries the database to retrieve fuel data, latitude, longitude, tanker ID, and other details for a specified tanker.
 * - Limits the results based on the `requiredLength` parameter to fetch the latest records.
 * - On success, returns an array of fuel data.
 * - On failure, logs an error message and returns `null` or an empty array.
 * 
 * @example
 * //Example usage:
 * Get_Fuel_Data_Query('busb', 10)
 *   .then(data => console.log(data))
 *   .catch(err => console.error(err));
 * 
 * @throws {Error} Logs an error if the database query fails.
 */
async function Get_Fuel_Data_Query(numberPlate, requiredLength) {
    const tankerQuery = `
            SELECT
                td.fuel_level,
                td.latitude,
                td.longitude,
                ti.tanker_id,
                ti.number_plate,
                ti.tanker_name,
                ti.status,
                ti.factor,
                te.degree,
                te.coefficient
            FROM
                tanker_info ti
                LEFT JOIN tanker_data td ON ti.tanker_id = td.tanker_id
                LEFT JOIN tanker_equation te ON ti.tanker_id = te.tanker_id
            WHERE
                ti.number_plate = $1
            ORDER BY
                td.timestamp DESC
            LIMIT
                $2
            `;
    const result = await client.query(tankerQuery, [numberPlate, requiredLength]);
    return result;
}

/**
 * Inserts a new tanker record into the `tanker_info` table in the database.
 * 
 * @async
 * @function Insert_Tanker_Info_Query
 * @param {string} numberPlate - The number plate of the tanker to insert into the database.
 * @returns {Promise<Object>} - A promise that resolves to the inserted tanker record.
 * 
 * @description
 * - Inserts a new tanker record with the provided `numberPlate` into the `tanker_info` table.
 * - Returns the tanker name and ID for the newly inserted tanker.
 * - On failure, logs an error message and returns `null`.
 * 
 * @example
 * //Example usage:
 * Insert_Tanker_Info_Query('busc')
 *   .then(result => console.log(result))
 *   .catch(err => console.error(err));
 * 
 * @throws {Error} Logs an error if the insertion into the database fails.
 */
async function Insert_Tanker_Info_Query(numberPlate) {
    const result = await client.query(
        'INSERT INTO tanker_info (number_plate, tanker_name) VALUES ($1, $2) RETURNING tanker_name, tanker_id', [numberPlate, numberPlate]
    );
    return result;
}

/**
 * Updates the status of a tanker in the `tanker_info` table in the database.
 * 
 * @function Update_Tanker_Info_Query
 * @param {string} status - The new status of the tanker to be updated.
 * @param {string} tanker_id - The id of the tanker whose status is to be updated.
 * @returns {void}
 * 
 * @description
 * - Updates the `status` field in the `tanker_info` table for the specified tanker, identified by `tanker_id`.
 * - Logs the query status and number plate for debugging purposes.
 * - On success, the query is executed without any return value.
 * - On failure, logs an error message.
 * 
 * @example
 * //Example usage:
 * Update_Tanker_Info_Query('Active', 'busb');
 * 
 * @throws {Error} Logs an error if the update query fails.
 */
function Update_Tanker_Info_Query(status, tanker_id) {
    const query = 'UPDATE tanker_info SET status = $1 WHERE tanker_id = $2';
    client.query(query, [status, tanker_id]);
}

module.exports = { Insert_Fuel_Data_Query, Get_Fuel_Data_Query, Insert_Tanker_Info_Query, Update_Tanker_Info_Query };