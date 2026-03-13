// src/routes/tickets.js
// =====================================================
// Ticket API Routes
// POST /api/tickets  - Create a new ticket
// GET  /api/tickets  - Retrieve all tickets
// =====================================================
const express = require('express');
const router  = express.Router();
const db      = require('../config/database');
const { triggerPowerAutomate, triggerPowerAutomateReply } = require('../services/powerAutomateService');

// ---------------------------------------------------------
// POST /api/tickets
// Body: { title, description, priority, createdBy, userEmail, source }
// ---------------------------------------------------------
router.post('/', async (req, res) => {
  let { title, description, priority, createdBy, source } = req.body;

  // --- Clean up Teams HTML JSON if necessary ---
  try {
    let parsed = null;
    if (typeof description === 'object' && description !== null) {
      parsed = description;
    } else if (typeof description === 'string' && description.trim().startsWith('{')) {
      parsed = JSON.parse(description);
    }

    if (parsed && parsed.content) {
      // Strip HTML tags for the database
      description = parsed.content.replace(/<[^>]*>?/gm, '');
    }
  } catch (e) {
    // Not valid JSON or parsing failed, leave as is
  }


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
    const ticketSource = source || 'Microsoft Teams';
    const [result] = await db.execute(
      `INSERT INTO Tickets (title, description, priority, createdBy, source) VALUES (?, ?, ?, ?, ?)`,
      [title, description, priority, createdBy, ticketSource]
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

// ---------------------------------------------------------
// POST /api/tickets/:id/reply
// Body: { replyText }
// ---------------------------------------------------------
router.post('/:id/reply', async (req, res) => {
  const ticketId = req.params.id;
  const { replyText } = req.body;

  if (!replyText) {
    return res.status(400).json({ success: false, message: 'replyText is required' });
  }

  try {
    // 1. Verify ticket exists
    const [existingRows] = await db.execute(`SELECT * FROM Tickets WHERE id = ?`, [ticketId]);
    if (existingRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    // 2. Update the ticket
    await db.execute(
      `UPDATE Tickets SET status = 'Replied', replyText = ? WHERE id = ?`,
      [replyText, ticketId]
    );

    // 3. Fetch the updated ticket
    const [updatedRows] = await db.execute(`SELECT * FROM Tickets WHERE id = ?`, [ticketId]);
    const updatedTicket = updatedRows[0];

    // 4. Trigger the outbound Power Automate notification
    const automationResult = await triggerPowerAutomateReply(updatedTicket);

    res.status(200).json({
      success: true,
      message: 'Reply sent successfully.',
      ticket: updatedTicket,
      automation: automationResult,
    });
  } catch (error) {
    console.error('Error sending reply:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while replying.',
      error: error.message,
    });
  }
});

module.exports = router;
