// src/services/powerAutomateService.js
// =====================================================
// Power Automate HTTP Trigger Service
// Sends ticket data to Power Automate Flow
// which then posts to Microsoft Teams
// =====================================================
const axios = require('axios');
require('dotenv').config();

/**
 * Triggers the Power Automate HTTP flow with the ticket payload.
 * @param {Object} ticket - The ticket object to send.
 * @param {'ticket'|'reply'} type - Either 'ticket' (new ticket) or 'reply' (admin reply).
 */
const triggerPowerAutomate = async (ticket, type = 'ticket') => {
  const flowUrl = process.env.POWER_AUTOMATE_URL;

  // If no URL is configured, log a warning and skip (useful for local dev)
  if (!flowUrl || flowUrl.includes('YOUR_FLOW_ID')) {
    console.warn('⚠️  Power Automate URL not configured. Skipping Teams notification.');
    return { skipped: true };
  }

  try {
    let payload;

    if (type === 'reply') {
      payload = {
        type:        'reply',
        ticketId:    ticket.id,
        title:       ticket.title,
        userName:    ticket.createdBy,
        userEmail:   ticket.userEmail,
        replyText:   ticket.replyText,
        adminName:   'System Admin',
      };
    } else {
      payload = {
        type:        'ticket',
        title:       ticket.title,
        description: ticket.description,
        priority:    ticket.priority,
        createdBy:   ticket.createdBy,
      };
    }

    console.log(`📤 Sending ${type} to Power Automate:`, payload);

    const response = await axios.post(flowUrl, payload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000, // 10 second timeout
    });

    console.log(`✅ Power Automate (${type}) triggered successfully. Status:`, response.status);
    return { success: true, status: response.status };
  } catch (error) {
    // Log but do NOT fail the API - Teams is a side-effect, not critical
    console.error(`❌ Failed to trigger Power Automate (${type}):`, error.message);
    return { success: false, error: error.message };
  }
};

module.exports = { triggerPowerAutomate };
