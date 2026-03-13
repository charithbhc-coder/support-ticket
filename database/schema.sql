-- ============================================================
-- Enterprise Ticket Management System
-- MySQL Database Setup Script
-- ============================================================

-- Create and use the database
CREATE DATABASE IF NOT EXISTS ticket_management;
USE ticket_management;

-- Create the Tickets table
CREATE TABLE IF NOT EXISTS Tickets (
    id          INT           NOT NULL AUTO_INCREMENT,
    title       VARCHAR(255)  NOT NULL,
    description TEXT          NOT NULL,
    priority    VARCHAR(50)   NOT NULL DEFAULT 'Medium',
    createdBy   VARCHAR(150)  NOT NULL,
    createdAt   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample seed data (optional)
INSERT INTO Tickets (title, description, priority, createdBy) VALUES
  ('Login page not loading',    'Users cannot access the login page on Chrome v120',    'High',   'Alice Johnson'),
  ('Report export is slow',     'Exporting large reports takes more than 5 minutes',    'Medium', 'Bob Smith'),
  ('Update user profile photo', 'Allow users to upload a custom profile picture',       'Low',    'Carol White');

SELECT * FROM Tickets;
