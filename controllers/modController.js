// controllers/modController.js

const modSecret = process.env.MOD_SECRET;

exports.getStatus = async (req, res) => {
  res.json({ status: 'Mod API ready' });
};

exports.handleEvent = async (req, res) => {
  const { secret, event, data } = req.body;
  if (!secret || secret !== modSecret) {
    return res.status(401).json({ error: 'Invalid or missing secret' });
  }
  if (!event) {
    return res.status(400).json({ error: 'Missing event type' });
  }
  console.log(`[Mod] Event received: ${event}`, data);
  if (global.triggerWebhooks) {
    global.triggerWebhooks('mod_event', { event, data });
  }
  res.json({ received: { event, data } });
}; 