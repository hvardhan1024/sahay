const express = require('express');
const { getAIResponse } = require('../services/geminiAI');
const router = express.Router();

// Middleware to check if user is logged in
const requireAuth = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  next();
};

// AI Chat page
router.get('/educate', requireAuth, (req, res) => {
  res.render('pages/ai-chat', {
    title: 'AI Educator - Sahay',
    user: req.session.user
  });
});

// AI Chat API
router.post('/educate', requireAuth, async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const aiResponse = await getAIResponse(message);
    
    res.json({ 
      response: aiResponse,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({ 
      error: 'Sorry, I\'m having trouble processing your request right now. Please try again later.' 
    });
  }
});

module.exports = router;