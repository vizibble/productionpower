-- Create welding_devices table
CREATE TABLE welding_devices (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    machine_name TEXT NOT NULL,
    product TEXT NOT NULL,
    operator_name TEXT NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
    CONSTRAINT welding_devices_pkey PRIMARY KEY (id)
);

-- Create device_thresholds table
CREATE TABLE device_thresholds (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    device_id UUID NOT NULL,
    min_voltage DOUBLE PRECISION NOT NULL,
    max_voltage DOUBLE PRECISION NOT NULL,
    min_current DOUBLE PRECISION NOT NULL,
    max_current DOUBLE PRECISION NOT NULL,
    CONSTRAINT device_thresholds_pkey PRIMARY KEY (id),
    CONSTRAINT device_thresholds_device_id_fkey FOREIGN KEY (device_id) REFERENCES welding_devices(id) ON DELETE CASCADE
);

-- Create telemetry_data table
CREATE TABLE telemetry_data (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    device_id UUID NOT NULL,
    timestamp TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    voltage DOUBLE PRECISION NOT NULL,
    current DOUBLE PRECISION NOT NULL,
    CONSTRAINT telemetry_data_pkey PRIMARY KEY (id),
    CONSTRAINT telemetry_data_device_id_fkey FOREIGN KEY (device_id) REFERENCES welding_devices(id) ON DELETE CASCADE
);

-- Create alerts table
CREATE TABLE alerts (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    device_id UUID NOT NULL,
    timestamp TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
    type TEXT NOT NULL,
    measured_value DOUBLE PRECISION NOT NULL,
    threshold_value DOUBLE PRECISION NOT NULL,
    CONSTRAINT alerts_pkey PRIMARY KEY (id),
    CONSTRAINT alerts_device_id_fkey FOREIGN KEY (device_id) REFERENCES welding_devices(id) ON DELETE CASCADE,
    CONSTRAINT alerts_type_check CHECK (
        type = ANY (
            ARRAY ['over_voltage'::text, 'under_voltage'::text, 'over_current'::text, 'under_current'::text]
        )
    )
);

-- Create indexes for better query performance
CREATE INDEX idx_telemetry_device_time ON telemetry_data (device_id, timestamp);

-- Add comments for documentation
COMMENT ON TABLE welding_devices IS 'Stores information about welding machines and their operators';

COMMENT ON TABLE device_thresholds IS 'Stores voltage and current thresholds for each welding device';

COMMENT ON TABLE telemetry_data IS 'Stores real-time voltage and current measurements from welding devices';

COMMENT ON TABLE alerts IS 'Stores alerts generated when measurements exceed defined thresholds';

COMMENT ON COLUMN alerts.type IS 'Type of alert: over_voltage, under_voltage, over_current, or under_current';

COMMENT ON COLUMN telemetry_data.timestamp IS 'Timestamp when the measurement was taken';

COMMENT ON COLUMN alerts.measured_value IS 'The actual measured value that triggered the alert';

COMMENT ON COLUMN alerts.threshold_value IS 'The threshold value that was exceeded';