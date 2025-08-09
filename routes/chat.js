const express = require('express');
const Message = require('../models/Message');
const router = express.Router();

// Middleware to check if user is logged in
const requireAuth = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  next();
};

// Chat page
router.get('/', requireAuth, (req, res) => {
  res.render('pages/chat', {
    title: 'Group Chat - Sahay',
    user: req.session.user
  });
});

// Get messages API
router.get('/messages', requireAuth, async (req, res) => {
  try {
    const messages = await Message.find({ room: 'general' })
      .populate('user', 'name')
      .sort({ timestamp: -1 })
      .limit(50);
    
    res.json(messages.reverse());
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to load messages' });
  }
});

module.exports = router;