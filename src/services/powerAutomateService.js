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
 * @param {Object} ticket - The ticket object to broadcast to Teams.
 * @param {string} ticket.title       - Ticket title
 * @param {string} ticket.description - Ticket description
 * @param {string} ticket.priority    - Ticket priority (Low/Medium/High)
 * @param {string} ticket.createdBy   - Name of the creator
 */
const triggerPowerAutomate = async (ticket) => {
  const flowUrl = process.env.POWER_AUTOMATE_URL;

  // If no URL is configured, log a warning and skip (useful for local dev)
  if (!flowUrl || flowUrl.includes('YOUR_FLOW_ID')) {
    console.warn('⚠️  Power Automate URL not configured. Skipping Teams notification.');
    return { skipped: true };
  }

  try {
    const payload = {
      title:       ticket.title,
      description: ticket.description,
      priority:    ticket.priority,
      createdBy:   ticket.createdBy,
    };

    console.log('📤 Sending ticket to Power Automate:', payload);

    const response = await axios.post(flowUrl, payload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000, // 10 second timeout
    });

    console.log('✅ Power Automate triggered successfully. Status:', response.status);
    return { success: true, status: response.status };
  } catch (error) {
    // Log but do NOT fail the API - Teams is a side-effect, not critical
    console.error('❌ Failed to trigger Power Automate:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Triggers the outbound Power Automate HTTP flow with the reply data.
 * @param {Object} ticket - The updated ticket object.
 */
const triggerPowerAutomateReply = async (ticket) => {
  const replyUrl = process.env.POWER_AUTOMATE_REPLY_URL;

  if (!replyUrl || replyUrl.includes('YOUR_FLOW_ID')) {
    console.warn('⚠️  Power Automate Reply URL not configured. Skipping outbound Teams notification.');
    return { skipped: true };
  }

  try {
    const payload = {
      ticketId:    ticket.id,
      title:       ticket.title,
      userEmail:   ticket.userEmail,
      replyText:   ticket.replyText,
      adminName:   'System Admin'
    };

    console.log('📤 Sending reply to Power Automate:', payload);

    const response = await axios.post(replyUrl, payload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000,
    });

    console.log('✅ Power Automate Reply triggered successfully. Status:', response.status);
    return { success: true, status: response.status };
  } catch (error) {
    console.error('❌ Failed to trigger Power Automate Reply:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = { triggerPowerAutomate, triggerPowerAutomateReply };
