const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    // Personal Information
    name: {
        type: String,
        required: true,
        trim: true,
        maxLength: 100
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    phoneNumber: {
        type: String,
        required: true,
        trim: true,
        match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
    },
    userType: {
        type: String,
        required: true,
        enum: ['student', 'parent', 'teacher', 'other']
    },

    // Demographics for better insights
    ageRange: {
        type: String,
        required: true,
        enum: ['13-17', '18-24', '25-34', '35-44', '45-54', '55+']
    },
    educationLevel: {
        type: String,
        enum: ['high-school', 'undergraduate', 'postgraduate', 'professional', 'other']
    },

    // App Usage Experience
    appUsageDuration: {
        type: String,
        required: true,
        enum: ['first-time', 'less-than-week', '1-4-weeks', '1-3-months', '3-6-months', '6-months-plus']
    },
    primaryFeatureUsed: {
        type: [String],
        required: true,
        validate: {
            validator: function (v) {
                return v && v.length > 0;
            },
            message: 'Please select at least one primary feature used'
        },
        enum: ['peer-chat', 'ai-educator', 'resources', 'dashboard', 'mood-tracking', 'profile']
    },

    // Experience Ratings (1-5 scale)
    overallExperience: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    easeOfUse: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    helpfulnessRating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    designRating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },

    // Feature-specific feedback
    peerChatExperience: {
        rating: { type: Number, min: 1, max: 5 },
        comments: { type: String, maxLength: 500 }
    },
    aiEducatorExperience: {
        rating: { type: Number, min: 1, max: 5 },
        comments: { type: String, maxLength: 500 }
    },
    resourcesExperience: {
        rating: { type: Number, min: 1, max: 5 },
        comments: { type: String, maxLength: 500 }
    },

    // Mental Health Impact Assessment
    stressReductionLevel: {
        type: String,
        enum: ['significant-improvement', 'moderate-improvement', 'slight-improvement', 'no-change', 'made-worse']
    },
    recommendationLikelihood: {
        type: Number,
        required: true,
        min: 0,
        max: 10
    },

    // Open-ended Feedback
    mostHelpfulFeature: {
        type: String,
        maxLength: 300
    },
    leastHelpfulFeature: {
        type: String,
        maxLength: 300
    },
    suggestionForImprovement: {
        type: String,
        required: true,
        maxLength: 1000
    },
    additionalFeatureRequest: {
        type: String,
        maxLength: 500
    },
    generalComments: {
        type: String,
        maxLength: 1000
    },

    // Technical Issues
    technicalIssuesEncountered: {
        type: [String],
        enum: ['slow-loading', 'crashes', 'login-issues', 'chat-problems', 'ai-not-responding', 'resource-loading', 'other', 'none']
    },
    deviceType: {
        type: String,
        required: true,
        enum: ['mobile-android', 'mobile-ios', 'desktop-windows', 'desktop-mac', 'tablet', 'other']
    },

    // Privacy and Safety
    privacyComfortLevel: {
        type: String,
        required: true,
        enum: ['very-comfortable', 'comfortable', 'neutral', 'uncomfortable', 'very-uncomfortable']
    },
    safetyRating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },

    // Emotional Impact
    emotionalSupportReceived: {
        type: String,
        enum: ['excellent', 'good', 'average', 'poor', 'very-poor']
    },
    wouldUseAgain: {
        type: Boolean,
        required: true
    },

    // Submission metadata
    submissionDate: {
        type: Date,
        default: Date.now
    },
    ipAddress: {
        type: String
    }
}, {
    timestamps: true
});

// Index for better query performance
feedbackSchema.index({ userType: 1, submissionDate: -1 });
feedbackSchema.index({ overallExperience: 1 });
feedbackSchema.index({ recommendationLikelihood: 1 });

module.exports = mongoose.model('Feedback', feedbackSchema);