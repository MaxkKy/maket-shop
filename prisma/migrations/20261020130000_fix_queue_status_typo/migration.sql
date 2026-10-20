ALTER TABLE `Buy`
  MODIFY `status` ENUM('Waitng', 'Waiting', 'Shipping', 'Received') NOT NULL DEFAULT 'Shipping';

UPDATE `Buy`
SET `status` = 'Waiting'
WHERE `status` = 'Waitng';

ALTER TABLE `Buy`
  MODIFY `status` ENUM('Waiting', 'Shipping', 'Received') NOT NULL DEFAULT 'Shipping';
