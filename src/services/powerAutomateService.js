// src/services/powerAutomateService.js
// =====================================================
// Power Automate HTTP Trigger Service
// Two dedicated flows:
//   POWER_AUTOMATE_TICKET_URL → new ticket → Teams channel
//   POWER_AUTOMATE_REPLY_URL  → admin reply → Teams DM to user
// =====================================================
const axios = require('axios');
require('dotenv').config();

/**
 * Post helper — sends payload to a flow URL, logs result.
 */
const postToFlow = async (label, url, payload) => {
  if (!url || url.includes('YOUR_FLOW')) {
    console.warn(`⚠️  ${label} URL not configured. Skipping.`);
    return { skipped: true };
  }
  try {
    console.log(`📤 Sending ${label} to Power Automate:`, payload);
    const response = await axios.post(url, payload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000,
    });
    console.log(`✅ Power Automate (${label}) triggered. Status:`, response.status);
    return { success: true, status: response.status };
  } catch (error) {
    console.error(`❌ Failed to trigger Power Automate (${label}):`, error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Notify Teams channel about a new ticket.
 * Uses POWER_AUTOMATE_TICKET_URL flow.
 */
const triggerTicketFlow = (ticket) => {
  const payload = {
    title:       ticket.title,
    description: ticket.description,
    priority:    ticket.priority,
    createdBy:   ticket.createdBy,
  };
  return postToFlow('ticket', process.env.POWER_AUTOMATE_TICKET_URL, payload);
};

/**
 * Send admin reply DM to the original user in Teams.
 * Uses POWER_AUTOMATE_REPLY_URL flow.
 */
const triggerReplyFlow = (ticket) => {
  const payload = {
    userEmail:  ticket.userEmail,
    ticketId:   ticket.id,
    title:      ticket.title,
    replyText:  ticket.replyText,
    adminName:  'System Admin',
  };
  return postToFlow('reply', process.env.POWER_AUTOMATE_REPLY_URL, payload);
};

// Legacy wrapper — kept for any callers still using the old signature
const triggerPowerAutomate = (ticket, type = 'ticket') => {
  return type === 'reply' ? triggerReplyFlow(ticket) : triggerTicketFlow(ticket);
};

module.exports = { triggerPowerAutomate, triggerTicketFlow, triggerReplyFlow };
