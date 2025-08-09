
const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');

// Get feedback form
router.get('/', (req, res) => {
    res.render('pages/feedback', {
        title: 'Share Your Feedback - Sahay',
        success: null,
        error: null,
        user: req.session.user || null // Use session user
    });
});

// Submit feedback
router.post('/submit', async (req, res) => {
    try {
        // Log request body for debugging
        console.log('Request body:', req.body);

        // Validate required fields
        const requiredFields = [
            'name', 'email', 'phoneNumber', 'userType', 'ageRange',
            'appUsageDuration', 'primaryFeatureUsed', 'overallExperience',
            'easeOfUse', 'helpfulnessRating', 'designRating',
            'recommendationLikelihood', 'suggestionForImprovement',
            'privacyComfortLevel', 'safetyRating', 'wouldUseAgain', 'deviceType'
        ];
        const missingFields = requiredFields.filter(field => !req.body[field] || (typeof req.body[field] === 'string' && req.body[field].trim() === ''));
        if (missingFields.length > 0) {
            throw new Error(`Please fill out all required fields: ${missingFields.join(', ')}`);
        }

        // Validate primaryFeatureUsed
        const primaryFeatureUsed = Array.isArray(req.body.primaryFeatureUsed)
            ? req.body.primaryFeatureUsed
            : (req.body.primaryFeatureUsed ? [req.body.primaryFeatureUsed] : []);
        if (primaryFeatureUsed.length === 0) {
            throw new Error('Please select at least one primary feature used.');
        }

        // Extract and validate data from request body
        const feedbackData = {
            // Personal Information
            name: req.body.name.trim(),
            email: req.body.email.trim().toLowerCase(),
            phoneNumber: req.body.phoneNumber.trim(),
            userType: req.body.userType,
            ageRange: req.body.ageRange,
            educationLevel: req.body.educationLevel || undefined,

            // App Usage Experience
            appUsageDuration: req.body.appUsageDuration,
            primaryFeatureUsed,
            deviceType: req.body.deviceType,

            // Experience Ratings
            overallExperience: parseInt(req.body.overallExperience) || 0,
            easeOfUse: parseInt(req.body.easeOfUse) || 0,
            helpfulnessRating: parseInt(req.body.helpfulnessRating) || 0,
            designRating: parseInt(req.body.designRating) || 0,

            // Feature-specific feedback
            peerChatExperience: {
                rating: req.body.peerChatRating ? parseInt(req.body.peerChatRating) : undefined,
                comments: req.body.peerChatComments ? req.body.peerChatComments.trim() : undefined
            },
            aiEducatorExperience: {
                rating: req.body.aiEducatorRating ? parseInt(req.body.aiEducatorRating) : undefined,
                comments: req.body.aiEducatorComments ? req.body.aiEducatorComments.trim() : undefined
            },
            resourcesExperience: {
                rating: req.body.resourcesRating ? parseInt(req.body.resourcesRating) : undefined,
                comments: req.body.resourcesComments ? req.body.resourcesComments.trim() : undefined
            },

            // Mental Health Impact
            stressReductionLevel: req.body.stressReductionLevel || undefined,
            recommendationLikelihood: parseInt(req.body.recommendationLikelihood) || 0,

            // Open-ended Feedback
            mostHelpfulFeature: req.body.mostHelpfulFeature ? req.body.mostHelpfulFeature.trim() : undefined,
            leastHelpfulFeature: req.body.leastHelpfulFeature ? req.body.leastHelpfulFeature.trim() : undefined,
            suggestionForImprovement: req.body.suggestionForImprovement.trim(),
            additionalFeatureRequest: req.body.additionalFeatureRequest ? req.body.additionalFeatureRequest.trim() : undefined,
            generalComments: req.body.generalComments ? req.body.generalComments.trim() : undefined,

            // Technical Issues
            technicalIssuesEncountered: Array.isArray(req.body.technicalIssuesEncountered)
                ? req.body.technicalIssuesEncountered
                : (req.body.technicalIssuesEncountered ? [req.body.technicalIssuesEncountered] : []),
            // Privacy and Safety
            privacyComfortLevel: req.body.privacyComfortLevel,
            safetyRating: parseInt(req.body.safetyRating) || 0,

            // Emotional Impact
            emotionalSupportReceived: req.body.emotionalSupportReceived || undefined,
            wouldUseAgain: req.body.wouldUseAgain === 'true',

            // Metadata
            ipAddress: req.ip || req.connection.remoteAddress
        };

        // Create and save feedback
        const feedback = new Feedback(feedbackData);
        await feedback.save();

        res.render('pages/feedback', {
            title: 'Share Your Feedback - Sahay',
            success: 'Thank you for your valuable feedback! Your insights help us improve Sahay for everyone.',
            error: null,
            user: req.session.user || null // Use session user
        });

    } catch (error) {
        console.error('Error saving feedback:', error);

        let errorMessage = 'An error occurred while submitting your feedback. Please try again.';

        // Handle validation errors
        if (error.name === 'ValidationError') {
            const firstError = Object.values(error.errors)[0];
            errorMessage = firstError.message;
        } else {
            errorMessage = error.message;
        }

        res.render('pages/feedback', {
            title: 'Share Your Feedback - Sahay',
            success: null,
            error: errorMessage,
            user: req.session.user || null // Use session user
        });
    }
});

// Get feedback statistics
router.get('/stats', async (req, res) => {
    try {
        const stats = {
            totalFeedbacks: await Feedback.countDocuments(),
            averageRatings: await Feedback.aggregate([
                {
                    $group: {
                        _id: null,
                        avgOverallExperience: { $avg: '$overallExperience' },
                        avgEaseOfUse: { $avg: '$easeOfUse' },
                        avgHelpfulness: { $avg: '$helpfulnessRating' },
                        avgDesign: { $avg: '$designRating' },
                        avgRecommendation: { $avg: '$recommendationLikelihood' }
                    }
                }
            ]),
            userTypeDistribution: await Feedback.aggregate([
                { $group: { _id: '$userType', count: { $sum: 1 } } }
            ]),
            recentFeedbacks: await Feedback.find()
                .select('name userType overallExperience submissionDate')
                .sort({ submissionDate: -1 })
                .limit(10)
        };

        res.json(stats);
    } catch (error) {
        console.error('Error fetching feedback stats:', error);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});

module.exports = router;
