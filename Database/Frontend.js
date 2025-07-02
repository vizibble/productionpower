const client = require("../service/db")

async function Get_All_Ids_Query() {
    try {
        const { rows } = await client.query("SELECT id AS device_id, machine_name AS device_name FROM welding_devices");
        return rows;
    }
    catch (error) {
        throw new Error(error.message);
    }
}

async function Get_Device_Info_Query() {
    try {
        const query = `
SELECT
  wd.id AS device_id,
  wd.machine_name,
  wd.product,
  wd.operator_name,
  dt.min_voltage,
  dt.max_voltage,
  dt.min_current,
  dt.max_current
FROM welding_devices wd
LEFT JOIN device_thresholds dt ON dt.device_id = wd.id
ORDER BY wd.machine_name;
            `
        const result = await client.query(query);
        return result;
    }
    catch (error) {
        throw new Error(error.message);
    }
}

async function Update_Device_Info_Query({ machine_name, product, operator_name, min_voltage, max_voltage, min_current, max_current, device_id }) {
    try {
        await client.query('BEGIN');

        // 1. Update welding_devices
        await client.query(`
            UPDATE welding_devices
            SET machine_name = $1,
                product = $2,
                operator_name = $3
            WHERE id = $4
        `, [machine_name, product, operator_name, device_id]);

        // 2. Update thresholds
        await client.query(`
            UPDATE device_thresholds
            SET min_voltage = $1,
                max_voltage = $2,
                min_current = $3,
                max_current = $4
            WHERE device_id = $5
        `, [min_voltage, max_voltage, min_current, max_current, device_id]);

        await client.query('COMMIT');
        return { success: true };
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Update_Device_Info_Query failed:', error);
        throw new Error(error.message)
    }
}

async function Get_Widget_Data_Query(range, selectedDevice) {
    const query = `
SELECT
    ROUND(AVG(td.voltage)::numeric, 2) AS voltage,
    ROUND(AVG(td.current)::numeric, 2) AS current,
    DATE_TRUNC('minute', td.timestamp) AS timestamp,
    MAX(dt.min_voltage) AS min_voltage_threshold,
    MAX(dt.max_voltage) AS max_voltage_threshold,
    MAX(dt.min_current) AS min_current_threshold,
    MAX(dt.max_current) AS max_current_threshold
FROM
    welding_devices wd
        LEFT JOIN telemetry_data td ON wd.id = td.device_id
    LEFT JOIN device_thresholds dt ON wd.id = dt.device_id
WHERE
    wd.id = $1
    AND td.timestamp >= NOW() - INTERVAL '1 ${range}'
GROUP BY
    DATE_TRUNC('minute', td.timestamp)
ORDER BY
    timestamp DESC;
`
    try {
        const { rows } = await client.query(query, [selectedDevice]);
        if (rows.length == 0)
            throw new Error("No data for this device in this range");
        return rows
    } catch (error) {
        throw new Error(error.message);
    }
};

async function Get_Records_Query(device) {
    let query = `
      SELECT
        a.type,
        a.timestamp,
        a.measured_value,
        a.threshold_value,
        wd.machine_name
      FROM
        alerts a
      JOIN welding_devices wd ON a.device_id = wd.id
    `;

    const params = [];
    const conditions = [];

    if (device !== 'all') {
        conditions.push(`a.device_id = $${params.length + 1}`);
        params.push(device);
    }

    if (conditions.length > 0) {
        query += ` WHERE ` + conditions.join(' AND ');
    }

    query += ` ORDER BY a.timestamp DESC`;

    try {
        const { rows } = await client.query(query, params);
        return rows;
    } catch (error) {
        throw new Error(error.message);
    }
}


module.exports = { Get_All_Ids_Query, Get_Device_Info_Query, Update_Device_Info_Query, Get_Widget_Data_Query, Get_Records_Query }