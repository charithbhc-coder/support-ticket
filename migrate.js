const db = require('./src/config/database');

async function migrate() {
  try {
    await db.query(`ALTER TABLE Tickets ADD COLUMN source VARCHAR(100) DEFAULT 'Microsoft Teams'`);
    console.log('Migration successful: Added source column');
  } catch (error) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('Column source already exists.');
    } else {
      console.error('Migration failed:', error);
    }
  } finally {
    process.exit(0);
  }
}

migrate();
