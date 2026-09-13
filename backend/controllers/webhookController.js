const { supabase } = require('../utils/supabase/server');
const logger = require('../services/logger');

// Set of processed webhook IDs for fast in-memory idempotency check (backed by DB unique constraint)
const processedWebhookEvents = new Set();

/**
 * Webhook Challenge Verification (GET)
 */
const verifyWebhook = (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === (process.env.WEBHOOK_VERIFY_TOKEN || 'omnora_trust_verify_token')) {
      logger.info('Webhook verification handshake succeeded');
      return res.status(200).send(challenge);
    }
    return res.sendStatus(403);
  }
  return res.json({ status: 'active', message: 'Omnora Webhook Gateway Active' });
};

/**
 * Idempotent Payment Confirmation Webhook (POST)
 * Safepay / PayFast / Raast / Stripe
 */
const handleWebhook = async (req, res) => {
  const event = req.body;
  const eventId =
    event.id ||
    event.eventId ||
    req.headers['x-event-id'] ||
    req.headers['x-safepay-event-id'] ||
    event.data?.object?.id;

  if (!eventId) {
    logger.warn('Webhook received without unique event id');
    return res.status(400).json({ error: 'Missing unique event ID header or payload attribute' });
  }

  // 1. IDEMPOTENCY GUARD: Check in-memory fast cache
  if (processedWebhookEvents.has(eventId)) {
    logger.info(`Idempotency guard: duplicate webhook event ${eventId} safely ignored (no-op)`);
    return res.status(200).json({
      status: 'already_processed',
      message: 'Event previously confirmed. No-op returned.',
      eventId,
    });
  }

  // 2. IDEMPOTENCY GUARD: Check database unique constraint for payment_webhook_event_id
  try {
    const { data: existingOrder } = await supabase
      .from('trust_orders')
      .select('id, payment_webhook_event_id')
      .eq('payment_webhook_event_id', eventId)
      .single();

    if (existingOrder) {
      processedWebhookEvents.add(eventId);
      logger.info(`Idempotency guard: DB record matches event ${eventId}. Webhook no-op.`);
      return res.status(200).json({
        status: 'already_processed',
        message: 'Order already confirmed with this gateway event id.',
        eventId,
      });
    }
  } catch {}

  // 3. Mark event ID as processed immediately
  processedWebhookEvents.add(eventId);

  // Extract order reference
  const orderId =
    event.data?.metadata?.orderId ||
    event.orderId ||
    event.payload?.order_id ||
    event.data?.object?.metadata?.orderId;

  const paymentGatewayRef =
    event.data?.object?.payment_intent ||
    event.transaction_id ||
    event.token ||
    eventId;

  logger.info(`Processing payment confirmation webhook for event ${eventId} (Order: ${orderId || 'N/A'})`);

  if (orderId) {
    try {
      await supabase
        .from('trust_orders')
        .update({
          payment_webhook_event_id: eventId,
          payment_gateway_ref: paymentGatewayRef,
          status: 'CONFIRMED_PREPAID',
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      // Log trust event
      await supabase.from('trust_event_logs').insert({
        order_id: orderId,
        event_type: 'PREPAID_COMPLETED',
        created_at: new Date().toISOString(),
      });
    } catch (err) {
      logger.error('Error updating order on webhook:', err);
    }
  }

  return res.status(200).json({
    status: 'success',
    processed: true,
    eventId,
    orderId,
  });
};

const handleStripeWebhook = handleWebhook;

module.exports = {
  verifyWebhook,
  handleWebhook,
  handleStripeWebhook,
};
