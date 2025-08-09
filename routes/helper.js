const express = require('express');
const User = require('../models/User');
const Helper = require('../models/Helper');
const router = express.Router();

// Middleware to check if user is helper
const requireHelper = (req, res, next) => {
  if (!req.session.user || req.session.user.role !== 'helper') {
    return res.redirect('/login');
  }
  next();
};

// Helper dashboard
router.get('/dashboard', requireHelper, async (req, res) => {
  try {
    const helper = await Helper.findOne({ user: req.session.user.id }).populate('user');
    const students = await User.find({ role: 'student', isActive: true }).limit(20);
    
    res.render('pages/helper/dashboard', {
      title: 'Helper Dashboard - Sahay',
      helper: helper,
      students: students
    });
  } catch (error) {
    console.error('Helper dashboard error:', error);
    res.redirect('/dashboard');
  }
});

// Helper profile
router.get('/profile', requireHelper, async (req, res) => {
  try {
    const helper = await Helper.findOne({ user: req.session.user.id }).populate('user');
    res.render('pages/helper/profile', {
      title: 'Helper Profile - Sahay',
      helper: helper
    });
  } catch (error) {
    console.error('Helper profile error:', error);
    res.redirect('/dashboard');
  }
});

// Update helper profile
router.post('/profile', requireHelper, async (req, res) => {
  try {
    const { name, experience, specialization, availability } = req.body;
    
    // Update user info
    await User.findByIdAndUpdate(req.session.user.id, { name });
    
    // Update helper info
    await Helper.findOneAndUpdate(
      { user: req.session.user.id },
      {
        experience,
        specialization: Array.isArray(specialization) ? specialization : [specialization],
        availability
      }
    );

    // Update session
    req.session.user.name = name;

    const helper = await Helper.findOne({ user: req.session.user.id }).populate('user');
    res.render('pages/helper/profile', {
      title: 'Helper Profile - Sahay',
      helper: helper,
      success: 'Profile updated successfully!'
    });
  } catch (error) {
    console.error('Update helper profile error:', error);
    const helper = await Helper.findOne({ user: req.session.user.id }).populate('user');
    res.render('pages/helper/profile', {
      title: 'Helper Profile - Sahay',
      helper: helper,
      error: 'Failed to update profile'
    });
  }
});

// View students
router.get('/students', requireHelper, async (req, res) => {
  try {
    const students = await User.find({ role: 'student', isActive: true })
      .select('name email age institution bio joinedAt')
      .sort({ joinedAt: -1 });
    
    res.render('pages/helper/students', {
      title: 'Students - Sahay',
      students: students
    });
  } catch (error) {
    console.error('View students error:', error);
    res.redirect('/helper/dashboard');
  }
});

module.exports = router;