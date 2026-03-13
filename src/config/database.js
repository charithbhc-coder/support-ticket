// src/config/database.js
// =====================================================
// MySQL Database Connection using mysql2
// =====================================================
const mysql = require('mysql2/promise');
require('dotenv').config();

// Create a connection pool for performance and reliability
// Support Railway's MYSQL_URL out of the box
const connectionUri = process.env.MYSQL_URL || process.env.DATABASE_URL;

let pool;

if (connectionUri) {
  pool = mysql.createPool(connectionUri);
} else {
  pool = mysql.createPool({
    host:     process.env.DB_HOST     || process.env.MYSQLHOST     || process.env.MYSQL_HOST     || 'localhost',
    port:     parseInt(process.env.DB_PORT || process.env.MYSQLPORT || process.env.MYSQL_PORT || '3306'),
    user:     process.env.DB_USER     || process.env.MYSQLUSER     || process.env.MYSQL_USER     || 'root',
    password: process.env.DB_PASSWORD || process.env.MYSQLPASSWORD || process.env.MYSQL_PASSWORD || '',
    database: process.env.DB_NAME     || process.env.MYSQLDATABASE || process.env.MYSQL_DATABASE || 'ticket_management',
    waitForConnections: true,
    connectionLimit:    10,
    queueLimit:         0,
  });
}

// Test connection on startup
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ MySQL database connected successfully.');
    connection.release();
  } catch (err) {
    console.error('❌ MySQL connection failed:', err.message);
    process.exit(1);
  }
})();

module.exports = pool;
