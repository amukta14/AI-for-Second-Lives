"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const app_1 = require("firebase-admin/app");
const firestore_1 = require("firebase-admin/firestore");
const router = express_1.default.Router();
// Initialize Firebase Admin
try {
    (0, app_1.initializeApp)({
        projectId: process.env.FIREBASE_PROJECT_ID || 'ai-for-second-lives-c113b'
    });
}
catch (error) {
    console.log('Firebase already initialized or using default credentials');
}
const db = (0, firestore_1.getFirestore)();
// POST /submit-diy
router.post('/', async (req, res) => {
    const { title, description, type, difficulty, materials, imageUrl } = req.body;
    try {
        // Validate required fields
        if (!title || !description || !type || !difficulty) {
            return res.status(400).json({
                error: 'Missing required fields: title, description, type, difficulty'
            });
        }
        // Save to Firestore
        const diyRef = await db.collection('diys').add({
            title,
            description,
            type,
            difficulty,
            materials: materials || [],
            imageUrl: imageUrl || '',
            createdAt: new Date(),
            status: 'pending'
        });
        res.json({
            success: true,
            message: 'DIY project submitted successfully!',
            id: diyRef.id
        });
    }
    catch (error) {
        console.error('Firestore error:', error);
        res.status(500).json({
            error: 'Failed to submit DIY project.',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// GET /submit-diy - Get all DIYs
router.get('/', async (req, res) => {
    try {
        const snapshot = await db.collection('diys')
            .orderBy('createdAt', 'desc')
            .limit(50)
            .get();
        const diys = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        res.json({ diys });
    }
    catch (error) {
        console.error('Firestore error:', error);
        res.status(500).json({
            error: 'Failed to fetch DIY projects.',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.default = router;
