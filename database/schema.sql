-- ============================================================
-- Enterprise Ticket Management System
-- MySQL Database Setup Script
-- ============================================================

-- Note: The CREATE DATABASE statement has been removed
-- so this script can be safely executed directly inside
-- your Railway MySQL 'Data' tab query editor.

-- Create the Tickets table
CREATE TABLE IF NOT EXISTS Tickets (
    id          INT           NOT NULL AUTO_INCREMENT,
    title       VARCHAR(255)  NOT NULL,
    description TEXT          NOT NULL,
    priority    VARCHAR(50)   NOT NULL DEFAULT 'Medium',
    createdBy   VARCHAR(150)  NOT NULL,
    source      VARCHAR(100)  DEFAULT 'Microsoft Teams',
    status      VARCHAR(50)   DEFAULT 'Open',
    replyText   TEXT,
    createdAt   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample seed data (optional)
INSERT INTO Tickets (title, description, priority, createdBy) VALUES
  ('Login page not loading',    'Users cannot access the login page on Chrome v120',    'High',   'Alice Johnson'),
  ('Report export is slow',     'Exporting large reports takes more than 5 minutes',    'Medium', 'Bob Smith'),
  ('Update user profile photo', 'Allow users to upload a custom profile picture',       'Low',    'Carol White');

SELECT * FROM Tickets;
