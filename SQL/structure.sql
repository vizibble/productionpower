-- Sequence for tanker_info
CREATE SEQUENCE tanker_info_tanker_id_seq;
-- Table: tanker_info
CREATE TABLE tanker_info (
    tanker_id INTEGER NOT NULL DEFAULT nextval('tanker_info_tanker_id_seq' :: regclass),
    number_plate CHARACTER VARYING(10) NOT NULL,
    tanker_name CHARACTER VARYING(25) NOT NULL,
    factor NUMERIC(5, 2) NOT NULL DEFAULT 100.00,
    status CHARACTER VARYING(10) DEFAULT 'stable',
    CONSTRAINT tanker_info_tanker_id_key UNIQUE (tanker_id),
    CONSTRAINT tanker_info_number_plate_key UNIQUE (number_plate)
);
-- Indexes for tanker_info
CREATE INDEX idx_tanker_info_number_plate ON tanker_info (number_plate);
/*
CREATE
OR REPLACE FUNCTION insert_default_equation() 
RETURNS TRIGGER AS $$ 
BEGIN 
    -- Insert default coefficients for the equation
    INSERT INTO tanker_equation (tanker_id, degree, coefficient)
    VALUES
        (NEW.tanker_id, 0, -162.31254432306943),
        (NEW.tanker_id, 1, 4.150072958151474),
        (NEW.tanker_id, 2, 0.009927196796148),
        (NEW.tanker_id, 3, -0.000005744628532);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER insert_default_equation_trigger
AFTER INSERT
ON tanker_info 
FOR EACH ROW 
EXECUTE FUNCTION insert_default_equation();
*/
/*
-- Trigger function
CREATE OR REPLACE FUNCTION insert_record_on_status_change() 
RETURNS TRIGGER AS $$ 
DECLARE 
    ninteenth_record RECORD;
BEGIN 
    -- Check if the "status" column is updated
    IF NEW.status IS DISTINCT FROM OLD.status THEN 
        -- Retrieve the 9th most recent record for the given tanker_id
        SELECT volume_level, latitude, longitude, timestamp 
        INTO ninteenth_record
        FROM tanker_data
        WHERE tanker_id = NEW.tanker_id
        ORDER BY timestamp DESC 
        OFFSET 18 LIMIT 1;

        -- Insert a new record into the "records" table
        INSERT INTO tanker_events (tanker_id, event_type, latitude, longitude, volume_level, timestamp)
        VALUES (
            NEW.tanker_id,
            NEW.status,
            ninteenth_record.latitude,
            ninteenth_record.longitude,
            ninteenth_record.volume_level,
            ninteenth_record.timestamp
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- Create the trigger
CREATE TRIGGER tanker_info_status_update_trigger
AFTER UPDATE OF status ON tanker_info 
FOR EACH ROW 
EXECUTE FUNCTION insert_record_on_status_change();
*/

-- Sequence for tanker_equation
CREATE SEQUENCE tanker_equation_equation_id_seq;
-- Table: tanker_equation
CREATE TABLE tanker_equation (
    equation_id INTEGER NOT NULL DEFAULT nextval('tanker_equation_equation_id_seq' :: regclass),
    tanker_id SMALLINT NOT NULL,
    degree SMALLINT NOT NULL,
    coefficient NUMERIC NOT NULL,
    PRIMARY KEY (equation_id),
    CONSTRAINT tanker_equation_tanker_id_fkey FOREIGN KEY (tanker_id) REFERENCES tanker_info(tanker_id) ON UPDATE CASCADE ON DELETE CASCADE
);
ALTER TABLE
    tanker_equation
ADD
    CONSTRAINT unique_tanker_degree UNIQUE (tanker_id, degree);

-- Table: tanker_data
CREATE TABLE tanker_data (
    tanker_id SMALLINT NOT NULL,
    fuel_level NUMERIC(6, 2),
    latitude NUMERIC(8, 6),
    longitude NUMERIC(8, 6),
    timestamp TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    volume_level NUMERIC,
    CONSTRAINT idx_tanker_data_tanker_id UNIQUE (tanker_id)
);
-- Indexes for tanker_data
CREATE INDEX idx_tanker_data_time ON tanker_data ((timestamp :: time without time zone));
CREATE INDEX idx_tanker_data_timestamp ON tanker_data (timestamp DESC);
/*
CREATE OR REPLACE FUNCTION calculate_volume_from_equation() 
RETURNS TRIGGER AS $$ 
DECLARE 
    coefficients RECORD; -- To iterate through polynomial coefficients
    volume NUMERIC := 0; -- Calculated volume level
BEGIN 
    -- Loop through all coefficients for the given tanker_id
    FOR coefficients IN
        SELECT degree, coefficient
        FROM tanker_equation
        WHERE tanker_id = NEW.tanker_id 
    LOOP 
        -- Accumulate volume using the polynomial equation
        volume := volume + coefficients.coefficient * power(NEW.fuel_level, coefficients.degree);
    END LOOP;

    -- Assign the calculated volume to the NEW row
    NEW.volume_level := volume;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_volume_trigger 
BEFORE INSERT ON tanker_data 
FOR EACH ROW 
EXECUTE FUNCTION calculate_volume_from_equation();
 */




-- Table: tanker_events
CREATE TABLE tanker_events (
    tanker_id SMALLINT NOT NULL,
    event_type CHARACTER VARYING(10) NOT NULL,
    latitude NUMERIC(8, 6) NOT NULL,
    longitude NUMERIC(8, 6) NOT NULL,
    volume_level NUMERIC NOT NULL,
    location CHARACTER VARYING(100),
    timestamp TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT tanker_events_tanker_id_fkey FOREIGN KEY (tanker_id) REFERENCES tanker_info(tanker_id) ON UPDATE CASCADE ON DELETE CASCADE
);