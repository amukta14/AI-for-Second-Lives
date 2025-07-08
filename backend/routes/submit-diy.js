"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = require('express');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const router = express.Router();
// Initialize Firebase Admin
try {
    initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID || 'ai-for-second-lives-c113b'
    });
}
catch (error) {
    console.log('Firebase already initialized or using default credentials');
}
const db = getFirestore();
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
            status: 'pending' // For moderation if needed
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
// GET /submit-diy - Get all DIYs (for admin/moderator use)
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
module.exports = router;
