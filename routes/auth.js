const express = require('express');
const User = require('../models/User');
const Helper = require('../models/Helper');
const router = express.Router();

// Register page
router.get('/register', (req, res) => {
  if (req.session.user) {
    return res.redirect('/dashboard');
  }
  res.render('pages/register', { 
    title: 'Register - Sahay',
    error: null,
    success: null 
  });
});

// Login page
router.get('/login', (req, res) => {
  if (req.session.user) {
    return res.redirect('/dashboard');
  }
  res.render('pages/login', { 
    title: 'Login - Sahay',
    error: null 
  });
});

// Register POST
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, confirmPassword, role, age, institution } = req.body;

    // Validation
    if (!name || !email || !password || !confirmPassword) {
      return res.render('pages/register', {
        title: 'Register - Sahay',
        error: 'All fields are required',
        success: null
      });
    }

    if (password !== confirmPassword) {
      return res.render('pages/register', {
        title: 'Register - Sahay',
        error: 'Passwords do not match',
        success: null
      });
    }

    if (password.length < 6) {
      return res.render('pages/register', {
        title: 'Register - Sahay',
        error: 'Password must be at least 6 characters long',
        success: null
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.render('pages/register', {
        title: 'Register - Sahay',
        error: 'Email already registered',
        success: null
      });
    }

    // Create user
    const user = new User({
      name,
      email,
      password,
      role: role || 'student',
      age: age ? parseInt(age) : undefined,
      institution
    });

    await user.save();

    // If registering as helper, create helper profile
    if (role === 'helper') {
      const helper = new Helper({
        user: user._id,
        specialization: ['general-support']
      });
      await helper.save();
    }

    res.render('pages/register', {
      title: 'Register - Sahay',
      error: null,
      success: 'Registration successful! Please login to continue.'
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.render('pages/register', {
      title: 'Register - Sahay',
      error: 'Registration failed. Please try again.',
      success: null
    });
  }
});

// Login POST
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.render('pages/login', {
        title: 'Login - Sahay',
        error: 'Email and password are required'
      });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.render('pages/login', {
        title: 'Login - Sahay',
        error: 'Invalid email or password'
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.render('pages/login', {
        title: 'Login - Sahay',
        error: 'Invalid email or password'
      });
    }

    // Create session
    req.session.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    res.redirect('/dashboard');

  } catch (error) {
    console.error('Login error:', error);
    res.render('pages/login', {
      title: 'Login - Sahay',
      error: 'Login failed. Please try again.'
    });
  }
});

// Logout
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
    }
    res.redirect('/');
  });
});

module.exports = router;