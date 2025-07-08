import express from 'express';
import axios from 'axios';
import * as dotenv from 'dotenv';
import multer from 'multer';
import Tesseract from 'tesseract.js';
import path from 'path';
import fs from 'fs';
import { Request, Response } from 'express';
dotenv.config();

const router = express.Router();

const receiptStorage = multer.diskStorage({
  destination: function (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) {
    const dir = path.join(__dirname, '../public/images/receipts');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: receiptStorage });

// POST /analyze
router.post('/', async (req, res) => {
  const { barcode, imageBase64, productName } = req.body;
  
  console.log('Analyze request received:', {
    hasBarcode: !!barcode,
    hasImage: !!imageBase64,
    hasProductName: !!productName,
    imageSize: imageBase64 ? imageBase64.length : 0
  });
  
  try {
    let productInfo = '';
    let material = '';
    
    if (barcode) {
      // Lookup product info from Open Food Facts
      try {
        const offRes = await axios.get(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
        productInfo = offRes.data.product?.product_name || '';
        material = offRes.data.product?.packaging_materials || '';
      } catch (error) {
        console.log('Open Food Facts lookup failed, using barcode as product name');
        productInfo = `Product with barcode: ${barcode}`;
      }
    } else if (productName) {
      productInfo = productName;
    }

    // Call Gemini Vision API
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured');
    }

    let geminiResponse;
    if (imageBase64) {
      console.log('Processing image analysis...');
      // Analyze image with Gemini Vision
      const geminiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`;
      
      const prompt = `You are an eco-friendly assistant. Analyze this image and suggest 3 creative, sustainable ways to reuse, upcycle, or recycle the item shown. Be specific and practical. Format your response as a JSON array with objects containing: type (reuse/recycle/upcycle), title, description, difficulty (Easy/Medium/Hard), and materials (array of strings). Example: [{"type": "reuse", "title": "Plant Watering Can", "description": "Transform into a gentle watering can", "difficulty": "Easy", "materials": ["Item", "Drill", "Hot glue"]}]`;
      
      try {
        const response = await axios.post(geminiUrl, {
          contents: [{
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: "image/jpeg",
                  data: imageBase64.replace('data:image/jpeg;base64,', '').replace('data:image/png;base64,', '')
                }
              }
            ]
          }]
        });

        geminiResponse = response.data.candidates[0].content.parts[0].text;
        console.log('Gemini API response received');
      } catch (geminiError: any) {
        console.error('Gemini API error:', geminiError.response?.data || geminiError.message);
        throw new Error(`Gemini API error: ${geminiError.response?.data?.error?.message || geminiError.message}`);
      }
    } else if (productInfo) {
      console.log('Processing text analysis...');
      // Text-based analysis
      const geminiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`;
      
      const prompt = `You are an eco-friendly assistant. A user has a ${productInfo}. Suggest 3 creative, sustainable ways to reuse, upcycle, or recycle it. Be specific and practical. Format your response as a JSON array with objects containing: type (reuse/recycle/upcycle), title, description, difficulty (Easy/Medium/Hard), and materials (array of strings). Example: [{"type": "reuse", "title": "Plant Watering Can", "description": "Transform into a gentle watering can", "difficulty": "Easy", "materials": ["Item", "Drill", "Hot glue"]}]`;
      
      try {
        const response = await axios.post(geminiUrl, {
          contents: [{
            parts: [{ text: prompt }]
          }]
        });

        geminiResponse = response.data.candidates[0].content.parts[0].text;
        console.log('Gemini API response received');
      } catch (geminiError: any) {
        console.error('Gemini API error:', geminiError.response?.data || geminiError.message);
        throw new Error(`Gemini API error: ${geminiError.response?.data?.error?.message || geminiError.message}`);
      }
    } else {
      throw new Error('No image or product name provided for analysis');
    }

    // Parse Gemini response
    let suggestions;
    try {
      // Extract JSON from response (Gemini might wrap it in markdown)
      const jsonMatch = geminiResponse.match(/\[[\s\S]*\]/);
      suggestions = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
    } catch (error) {
      // Fallback to mock suggestions if parsing fails
      suggestions = [
        {
          type: "reuse",
          title: "Creative Reuse",
          description: `Transform your ${productInfo} into something useful!`,
          difficulty: "Easy",
          materials: [productInfo, "Basic tools"]
        },
        {
          type: "recycle",
          title: "Proper Recycling",
          description: `Recycle your ${productInfo} at a local center.`,
          difficulty: "Easy", 
          materials: ["Clean item"]
        },
        {
          type: "upcycle",
          title: "Upcycle Project",
          description: `Turn your ${productInfo} into a unique creation!`,
          difficulty: "Medium",
          materials: [productInfo, "Craft supplies", "Creativity"]
        }
      ];
    }

    res.json({ 
      productName: productInfo, 
      material, 
      suggestions 
    });
    
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ 
      error: 'Failed to analyze item.',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /analyze/receipt
router.post('/receipt', upload.single('receipt'), async (req: Request, res: Response): Promise<void> => {
  if (!req.file) {
    res.status(400).json({ error: 'No file uploaded' });
    return;
  }
  try {
    const filePath = req.file.path;
    const result: any = await Tesseract.recognize(filePath, 'eng');
    const text = result.data.text;
    // Simple product name extraction: split lines, filter for likely product lines
    const lines = text.split('\n').map((l: string) => l.trim()).filter((l: string) => l.length > 2);
    // Heuristic: skip lines with prices, totals, or store info
    const productLines = lines.filter((l: string) => !/\d+\.\d{2}/.test(l) && !/total|subtotal|tax|change|cash|visa|mastercard|debit|walmart|thank/i.test(l));
    res.json({ products: productLines });
  } catch (err: any) {
    res.status(500).json({ error: 'OCR failed', details: err instanceof Error ? err.message : err });
  }
});

export default router; 