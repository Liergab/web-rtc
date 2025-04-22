import express from 'express';

const router = express.Router();

// Simple status endpoint for WebRTC service
router.get('/status', (req, res) => {
  res.json({
    status: 'online',
    message: 'WebRTC Signaling Service is running'
  });
});

export default router; 