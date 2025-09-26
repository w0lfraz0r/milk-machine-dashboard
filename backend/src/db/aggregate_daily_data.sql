DELIMITER $$

DROP PROCEDURE IF EXISTS aggregate_daily_data$$

CREATE PROCEDURE aggregate_daily_data(IN target_date DATE)
BEGIN
  -- Optical Machine History
  INSERT INTO tabOpticalHistoryByMachine (
    machine_id, day, total_count, calculated_by
  )
  SELECT
    machine_id,
    target_date,
    SUM(counted_packets),
    'daily_job'
  FROM tabOpticalCount
  WHERE creation >= target_date
    AND creation < target_date + INTERVAL 1 DAY
  GROUP BY machine_id;

  -- Optical Assembly History
  INSERT INTO tabOpticalHistoryByAssembly (
    assembly_line, day, total_count, calculated_by
  )
  SELECT
    assembly_line,
    target_date,
    SUM(counted_packets),
    'daily_job'
  FROM tabOpticalCount
  WHERE creation >= target_date
    AND creation < target_date + INTERVAL 1 DAY
  GROUP BY assembly_line;

  -- Tray Conveyor History
  INSERT INTO tabTrayHistoryByConveyor (
    conveyor_belt_number, day, total_identified_packets, calculated_by
  )
  SELECT
    conveyor_belt_number,
    target_date,
    SUM(identified_packet_count),
    'daily_job'
  FROM tabTrays
  WHERE creation >= target_date
    AND creation < target_date + INTERVAL 1 DAY
  GROUP BY conveyor_belt_number;

  -- Tray Color+Type History
  INSERT INTO tabTrayHistoryByColorType (
    conveyor_belt_number, identified_color, type, day, count, calculated_by
  )
  SELECT
    conveyor_belt_number,
    identified_color,
    type,
    target_date,
    SUM(identified_packet_count),
    'daily_job'
  FROM tabTrays
  WHERE creation >= target_date
    AND creation < target_date + INTERVAL 1 DAY
  GROUP BY conveyor_belt_number, identified_color, type;

  -- Integrity Check
  IF EXISTS (
    SELECT 1
    FROM (
      SELECT
        c.conveyor_belt_number,
        c.total_identified_packets AS conveyor_total,
        COALESCE(SUM(ct.count), 0) AS color_type_total
      FROM tabTrayHistoryByConveyor c
      LEFT JOIN tabTrayHistoryByColorType ct
        ON c.conveyor_belt_number = ct.conveyor_belt_number
       AND c.day = ct.day
      WHERE c.day = target_date
      GROUP BY c.conveyor_belt_number, c.total_identified_packets
      HAVING conveyor_total <> color_type_total
    ) mismatches
  ) THEN
    SIGNAL SQLSTATE '01000'
      SET MESSAGE_TEXT = 'WARNING: Tray totals mismatch between conveyor and color-type breakdown';
  END IF;
END$$

DELIMITER ;
