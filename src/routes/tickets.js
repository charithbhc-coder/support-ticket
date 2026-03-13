// src/routes/tickets.js
// =====================================================
// Ticket API Routes
// POST /api/tickets  - Create a new ticket
// GET  /api/tickets  - Retrieve all tickets
// =====================================================
const express = require('express');
const router  = express.Router();
const db      = require('../config/database');
const { triggerPowerAutomate } = require('../services/powerAutomateService');

// ---------------------------------------------------------
// POST /api/tickets
// Body: { title, description, priority, createdBy }
// ---------------------------------------------------------
router.post('/', async (req, res) => {
  const { title, description, priority, createdBy } = req.body;

  // --- Input Validation ---
  if (!title || !description || !priority || !createdBy) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required: title, description, priority, createdBy',
    });
  }

  const allowedPriorities = ['Low', 'Medium', 'High'];
  if (!allowedPriorities.includes(priority)) {
    return res.status(400).json({
      success: false,
      message: `Priority must be one of: ${allowedPriorities.join(', ')}`,
    });
  }

  try {
    // 1) Insert ticket into MySQL
    const [result] = await db.execute(
      `INSERT INTO Tickets (title, description, priority, createdBy) VALUES (?, ?, ?, ?)`,
      [title, description, priority, createdBy]
    );

    const insertedId = result.insertId;

    // 2) Fetch the newly created ticket from DB
    const [rows] = await db.execute(
      `SELECT * FROM Tickets WHERE id = ?`,
      [insertedId]
    );
    const newTicket = rows[0];

    // 3) Trigger Power Automate → Teams notification (non-blocking)
    const automationResult = await triggerPowerAutomate(newTicket);

    // 4) Respond with the created ticket
    res.status(201).json({
      success: true,
      message: 'Ticket created successfully.',
      ticket: newTicket,
      automation: automationResult,
    });
  } catch (error) {
    console.error('Error creating ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while creating ticket.',
      error: error.message,
    });
  }
});

// ---------------------------------------------------------
// GET /api/tickets
// Returns: Array of all tickets ordered by newest first
// ---------------------------------------------------------
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT * FROM Tickets ORDER BY createdAt DESC`
    );

    res.status(200).json({
      success: true,
      count:   rows.length,
      tickets: rows,
    });
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching tickets.',
      error: error.message,
    });
  }
});

module.exports = router;
