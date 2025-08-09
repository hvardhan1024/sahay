const express = require('express');
const User = require('../models/User');
const router = express.Router();

// Middleware to check if user is logged in
const requireAuth = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  next();
};

// Student dashboard
router.get('/dashboard', requireAuth, (req, res) => {
  res.render('pages/student/dashboard', {
    title: 'Student Dashboard - Sahay',
    user: req.session.user
  });
});

// Student profile
router.get('/profile', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.session.user.id);
    res.render('pages/student/profile', {
      title: 'Profile - Sahay',
      user: user
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.redirect('/dashboard');
  }
});

// Update profile
router.post('/profile', requireAuth, async (req, res) => {
  try {
    const { name, age, institution, bio } = req.body;
    
    await User.findByIdAndUpdate(req.session.user.id, {
      name,
      age: age ? parseInt(age) : undefined,
      institution,
      bio
    });

    // Update session
    req.session.user.name = name;

    res.render('pages/student/profile', {
      title: 'Profile - Sahay',
      user: await User.findById(req.session.user.id),
      success: 'Profile updated successfully!'
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.render('pages/student/profile', {
      title: 'Profile - Sahay',
      user: await User.findById(req.session.user.id),
      error: 'Failed to update profile'
    });
  }
});

module.exports = router;