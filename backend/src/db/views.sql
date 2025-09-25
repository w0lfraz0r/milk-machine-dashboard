-- ============================
-- Optical counts per machine (live today)
-- ============================
CREATE OR REPLACE VIEW vwOpticalTodayByMachine AS
SELECT
    machine_id,
    DATE(creation) AS day,
    HOUR(creation) AS hour,
    SUM(counted_packets) AS total_count
FROM tabOpticalCount
WHERE creation >= CURDATE()
GROUP BY machine_id, day, hour;


-- ============================
-- Optical counts per assembly line (live today)
-- ============================
CREATE OR REPLACE VIEW vwOpticalTodayByAssembly AS
SELECT
    assembly_line,
    DATE(creation) AS day,
    HOUR(creation) AS hour,
    SUM(counted_packets) AS total_count
FROM tabOpticalCount
WHERE creation >= CURDATE()
GROUP BY assembly_line, day, hour;


-- ============================
-- Tray counts per conveyor (live today)
-- ============================
CREATE OR REPLACE VIEW vwTrayTodayByConveyor AS
SELECT
    conveyor_belt_number,
    DATE(creation) AS day,
    HOUR(creation) AS hour,
    SUM(identified_packet_count) AS total_identified_packets
FROM tabTrays
WHERE creation >= CURDATE()
GROUP BY conveyor_belt_number, day, hour;


-- ============================
-- Tray counts per color + type (live today)
-- ============================
CREATE OR REPLACE VIEW vwTrayTodayByColorType AS
SELECT
    conveyor_belt_number,
    identified_color,
    type,
    DATE(creation) AS day,
    HOUR(creation) AS hour,
    SUM(identified_packet_count) AS count
FROM tabTrays
WHERE creation >= CURDATE()
GROUP BY conveyor_belt_number, identified_color, type, day, hour;
