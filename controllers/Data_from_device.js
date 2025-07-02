const db = require('../service/db'); // adjust this path to your PG pool or client

const handleDataFromDevice = async (req, res) => {
    const deviceId = req.params.id;
    const { voltage, current } = req.body;

    if (!voltage || !current) {
        return res.status(400).json({ error: "Missing voltage or current in request body" });
    }

    try {
        const timestamp = new Date();

        // 1. Insert telemetry
        await db.query(`
                INSERT INTO telemetry_data (device_id, timestamp, voltage, current)
                VALUES ($1, $2, $3, $4)
            `, [deviceId, timestamp, voltage, current]);

        // 2. Fetch thresholds
        const { rows: thresholdRows } = await db.query(`
            SELECT 
                min_voltage, 
                max_voltage, 
                min_current, 
                max_current
            FROM 
                device_thresholds
            WHERE
                device_id = $1
        `, [deviceId]);

        if (!thresholdRows.length) {
            console.warn(`Thresholds not found for device: ${deviceId}`);
            return res.status(404).json({ error: 'Thresholds not found' });
        }

        const { min_voltage, max_voltage, min_current, max_current } = thresholdRows[0];

        // 3. Prepare alerts if needed
        const alerts = [];

        if (voltage < min_voltage) {
            alerts.push({ type: 'under_voltage', measured: voltage, threshold: min_voltage });
        } else if (voltage > max_voltage) {
            alerts.push({ type: 'over_voltage', measured: voltage, threshold: max_voltage });
        }

        if (current < min_current) {
            alerts.push({ type: 'under_current', measured: current, threshold: min_current });
        } else if (current > max_current) {
            alerts.push({ type: 'over_current', measured: current, threshold: max_current });
        }

        // 4. Insert alerts and emit via Socket.IO
        for (const alert of alerts) {
            await db.query(`
                INSERT INTO alerts (device_id, timestamp, type, measured_value, threshold_value)
                VALUES ($1, $2, $3, $4, $5)
            `, [deviceId, timestamp, alert.type, alert.measured, alert.threshold]);
        }

        // Emit live data even if no alert
        try {
            const socket = req.app.get('socket');
            if (socket) socket.emit("device_data", {
                device_id: deviceId,
                voltage,
                current,
                timestamp
            });
            else console.warn(`[${new Date().toLocaleString("en-GB")}] No socket connection for device ${deviceId}.`);
        }
        catch (err) {
            console.error(`[${new Date().toLocaleString("en-GB")}] Error emitting data for device ${deviceId}: ${err.message}`);
        }


        return res.status(200).json({ success: true, alerts });
    } catch (err) {
        console.error("Error handling device data:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
};

module.exports = { handleDataFromDevice };