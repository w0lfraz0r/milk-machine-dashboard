-- ============================
-- Optical counts per machine
-- ============================
CREATE OR REPLACE VIEW vwOpticalByMachine AS
SELECT
    machine_id,
    day,
    hour,
    total_count
FROM (
    -- Historical data
    SELECT
        machine_id,
        day,
        0 AS hour, -- historical totals are daily
        total_count
    FROM tabOpticalHistoryByMachine
    UNION ALL
    -- Live current day data not yet in history
    SELECT
        oc.machine_id,
        DATE(oc.creation) AS day,
        HOUR(oc.creation) AS hour,
        SUM(oc.counted_packets) AS total_count
    FROM tabOpticalCount oc
    LEFT JOIN tabOpticalHistoryByMachine hm
      ON oc.machine_id = hm.machine_id
     AND DATE(oc.creation) = hm.day
    WHERE oc.creation >= CURDATE()
      AND hm.id IS NULL
    GROUP BY oc.machine_id, day, hour
) AS combined;

-- ============================
-- Optical counts per assembly line
-- ============================
CREATE OR REPLACE VIEW vwOpticalByAssembly AS
SELECT
    assembly_line,
    day,
    hour,
    total_count
FROM (
    SELECT assembly_line, day, 0 AS hour, total_count
    FROM tabOpticalHistoryByAssembly
    UNION ALL
    SELECT
        oc.assembly_line,
        DATE(oc.creation) AS day,
        HOUR(oc.creation) AS hour,
        SUM(oc.counted_packets) AS total_count
    FROM tabOpticalCount oc
    LEFT JOIN tabOpticalHistoryByAssembly ha
      ON oc.assembly_line = ha.assembly_line
     AND DATE(oc.creation) = ha.day
    WHERE oc.creation >= CURDATE()
      AND ha.id IS NULL
    GROUP BY oc.assembly_line, day, hour
) AS combined;

-- ============================
-- Tray counts per conveyor
-- ============================
CREATE OR REPLACE VIEW vwTrayByConveyor AS
SELECT
    conveyor_belt_number,
    day,
    hour,
    total_identified_packets
FROM (
    SELECT conveyor_belt_number, day, 0 AS hour, total_identified_packets
    FROM tabTrayHistoryByConveyor
    UNION ALL
    SELECT
        t.conveyor_belt_number,
        DATE(t.creation) AS day,
        HOUR(t.creation) AS hour,
        SUM(t.identified_packet_count) AS total_identified_packets
    FROM tabTrays t
    LEFT JOIN tabTrayHistoryByConveyor hc
      ON t.conveyor_belt_number = hc.conveyor_belt_number
     AND DATE(t.creation) = hc.day
    WHERE t.creation >= CURDATE()
      AND hc.id IS NULL
    GROUP BY t.conveyor_belt_number, day, hour
) AS combined;

-- ============================
-- Tray counts per color + type
-- ============================
CREATE OR REPLACE VIEW vwTrayByColorType AS
SELECT
    conveyor_belt_number,
    identified_color,
    type,
    day,
    hour,
    count
FROM (
    SELECT conveyor_belt_number, identified_color, type, day, 0 AS hour, count
    FROM tabTrayHistoryByColorType
    UNION ALL
    SELECT
        t.conveyor_belt_number,
        t.identified_color,
        t.type,
        DATE(t.creation) AS day,
        HOUR(t.creation) AS hour,
        SUM(t.identified_packet_count) AS count
    FROM tabTrays t
    LEFT JOIN tabTrayHistoryByColorType hc
      ON t.conveyor_belt_number = hc.conveyor_belt_number
     AND t.identified_color = hc.identified_color
     AND t.type = hc.type
     AND DATE(t.creation) = hc.day
    WHERE t.creation >= CURDATE()
      AND hc.id IS NULL
    GROUP BY t.conveyor_belt_number, t.identified_color, t.type, day, hour
) AS combined;
