const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/student');
const helperRoutes = require('./routes/helper');
const chatRoutes = require('./routes/chat');
const aiRoutes = require('./routes/ai');

const Message = require('./models/Message');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);


const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sahay'; // Use local if env not set

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
app.use(session({
  secret: 'sahay-secret-key-2024',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: MONGODB_URI }),
  cookie: {
    secure: false,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Global user availability for views
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

// Routes

// Add this import with your other route imports at the top
const feedbackRoutes = require('./routes/feedback');
// Add this line with your other route definitions
app.use('/feedback', feedbackRoutes);
app.use('/', authRoutes);
app.use('/student', studentRoutes);
app.use('/helper', helperRoutes);
app.use('/chat', chatRoutes);
app.use('/ai', aiRoutes);

// Home route
app.get('/', (req, res) => {
  if (req.session.user) return res.redirect('/dashboard');
  res.render('pages/index', { title: 'Sahay - Your Mental Wellness Companion' });
});

// Dashboard route
app.get('/dashboard', (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  res.render('pages/dashboard', { title: 'Dashboard - Sahay' });
});

// Resources route
app.get('/resources', (req, res) => {
  if (!req.session.user) return res.redirect('/login');

  const resources = [
    {
      title: "Understanding Stress",
      description: "Learn about the science behind stress and its effects on your body and mind.",
      type: "article",
      url: "https://www.apa.org/topics/stress",
      category: "education"
    },
    {
      title: "Breathing Exercises for Anxiety",
      description: "Simple breathing techniques to help calm your mind during stressful moments.",
      type: "video",
      url: "https://www.youtube.com/watch?v=tybOi4hjZFQ",
      category: "techniques"
    },
    {
      title: "Mindfulness Meditation Guide",
      description: "A beginner's guide to mindfulness and meditation practices.",
      type: "article",
      url: "https://www.headspace.com/meditation/mindfulness",
      category: "meditation"
    },
    {
      title: "Study Stress Management",
      description: "Effective strategies for managing academic stress and improving focus.",
      type: "article",
      url: "https://www.khanacademy.org/college-careers-more/study-skills",
      category: "academic"
    }
  ];

  res.render('pages/resources', { title: 'Resources - Sahay', resources });
});

// Socket.io for real-time chat
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join default room
  socket.join('general');

  // Load recent messages
  Message.find()
    .populate('user', 'name')
    .sort({ timestamp: -1 })
    .limit(50)
    .then(messages => {
      socket.emit('load_messages', messages.reverse());
    });

  // Handle new messages
  socket.on('send_message', async (data) => {
    try {
      const message = new Message({
        content: data.content,
        user: data.userId,
        room: 'general'
      });

      await message.save();
      await message.populate('user', 'name');

      io.to('general').emit('new_message', {
        _id: message._id,
        content: message.content,
        user: message.user,
        timestamp: message.timestamp
      });
    } catch (error) {
      console.error('Error saving message:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('pages/error', {
    title: 'Error - Sahay',
    error: err.message || 'Something went wrong!'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).render('pages/404', {
    title: '404 - Page Not Found - Sahay'
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`🌱 Sahay server running on port ${PORT}`);
  console.log(`🔗 Visit: http://localhost:${PORT}`);
});
