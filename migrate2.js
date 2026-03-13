const db = require('./src/config/database');

async function migrate2() {
  try {
    await db.query(`ALTER TABLE Tickets ADD COLUMN userEmail VARCHAR(255)`);
    console.log('Added userEmail column');
  } catch (e) { if (e.code !== 'ER_DUP_FIELDNAME') console.error(e); }

  try {
    await db.query(`ALTER TABLE Tickets ADD COLUMN status VARCHAR(50) DEFAULT 'Open'`);
    console.log('Added status column');
  } catch (e) { if (e.code !== 'ER_DUP_FIELDNAME') console.error(e); }

  try {
    await db.query(`ALTER TABLE Tickets ADD COLUMN replyText TEXT`);
    console.log('Added replyText column');
  } catch (e) { if (e.code !== 'ER_DUP_FIELDNAME') console.error(e); }

  console.log('Migration 2 complete');
  process.exit(0);
}

migrate2();
