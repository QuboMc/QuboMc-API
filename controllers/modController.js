// controllers/modController.js

const modSecret = process.env.MOD_SECRET;

exports.getStatus = async (req, res) => {
  // You can add real status logic here if your mod supports it
  res.json({ status: 'Mod API ready' });
};

exports.handleEvent = async (req, res) => {
  // Example: Basic secret validation
  const { secret, event, data } = req.body;
  if (!secret || secret !== modSecret) {
    return res.status(401).json({ error: 'Invalid or missing secret' });
  }
  if (!event) {
    return res.status(400).json({ error: 'Missing event type' });
  }
  // Log the event
  console.log(`[Mod] Event received: ${event}`, data);
  // Trigger webhooks for 'mod_event'
  if (global.triggerWebhooks) {
    global.triggerWebhooks('mod_event', { event, data });
  }
  // TODO: Add your custom event handling logic here
  // For now, just echo the event and data
  res.json({ received: { event, data } });
}; 