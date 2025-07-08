"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const axios_1 = __importDefault(require("axios"));
const dotenv = __importStar(require("dotenv"));
const multer_1 = __importDefault(require("multer"));
const tesseract_js_1 = __importDefault(require("tesseract.js"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
dotenv.config();
const router = express_1.default.Router();
const receiptStorage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        const dir = path_1.default.join(__dirname, '../public/images/receipts');
        fs_1.default.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = (0, multer_1.default)({ storage: receiptStorage });
// POST /analyze
router.post('/', async (req, res) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
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
                const offRes = await axios_1.default.get(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
                productInfo = ((_a = offRes.data.product) === null || _a === void 0 ? void 0 : _a.product_name) || '';
                material = ((_b = offRes.data.product) === null || _b === void 0 ? void 0 : _b.packaging_materials) || '';
            }
            catch (error) {
                console.log('Open Food Facts lookup failed, using barcode as product name');
                productInfo = `Product with barcode: ${barcode}`;
            }
        }
        else if (productName) {
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
                const response = await axios_1.default.post(geminiUrl, {
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
            }
            catch (geminiError) {
                console.error('Gemini API error:', ((_c = geminiError.response) === null || _c === void 0 ? void 0 : _c.data) || geminiError.message);
                throw new Error(`Gemini API error: ${((_f = (_e = (_d = geminiError.response) === null || _d === void 0 ? void 0 : _d.data) === null || _e === void 0 ? void 0 : _e.error) === null || _f === void 0 ? void 0 : _f.message) || geminiError.message}`);
            }
        }
        else if (productInfo) {
            console.log('Processing text analysis...');
            // Text-based analysis
            const geminiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`;
            const prompt = `You are an eco-friendly assistant. A user has a ${productInfo}. Suggest 3 creative, sustainable ways to reuse, upcycle, or recycle it. Be specific and practical. Format your response as a JSON array with objects containing: type (reuse/recycle/upcycle), title, description, difficulty (Easy/Medium/Hard), and materials (array of strings). Example: [{"type": "reuse", "title": "Plant Watering Can", "description": "Transform into a gentle watering can", "difficulty": "Easy", "materials": ["Item", "Drill", "Hot glue"]}]`;
            try {
                const response = await axios_1.default.post(geminiUrl, {
                    contents: [{
                            parts: [{ text: prompt }]
                        }]
                });
                geminiResponse = response.data.candidates[0].content.parts[0].text;
                console.log('Gemini API response received');
            }
            catch (geminiError) {
                console.error('Gemini API error:', ((_g = geminiError.response) === null || _g === void 0 ? void 0 : _g.data) || geminiError.message);
                throw new Error(`Gemini API error: ${((_k = (_j = (_h = geminiError.response) === null || _h === void 0 ? void 0 : _h.data) === null || _j === void 0 ? void 0 : _j.error) === null || _k === void 0 ? void 0 : _k.message) || geminiError.message}`);
            }
        }
        else {
            throw new Error('No image or product name provided for analysis');
        }
        // Parse Gemini response
        let suggestions;
        try {
            // Extract JSON from response (Gemini might wrap it in markdown)
            const jsonMatch = geminiResponse.match(/\[[\s\S]*\]/);
            suggestions = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
        }
        catch (error) {
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
    }
    catch (error) {
        console.error('Analysis error:', error);
        res.status(500).json({
            error: 'Failed to analyze item.',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// POST /analyze/receipt
router.post('/receipt', upload.single('receipt'), async (req, res) => {
    if (!req.file) {
        res.status(400).json({ error: 'No file uploaded' });
        return;
    }
    try {
        const filePath = req.file.path;
        const result = await tesseract_js_1.default.recognize(filePath, 'eng');
        const text = result.data.text;
        // Simple product name extraction: split lines, filter for likely product lines
        const lines = text.split('\n').map((l) => l.trim()).filter((l) => l.length > 2);
        // Heuristic: skip lines with prices, totals, or store info
        const productLines = lines.filter((l) => !/\d+\.\d{2}/.test(l) && !/total|subtotal|tax|change|cash|visa|mastercard|debit|walmart|thank/i.test(l));
        res.json({ products: productLines });
    }
    catch (err) {
        res.status(500).json({ error: 'OCR failed', details: err instanceof Error ? err.message : err });
    }
});
exports.default = router;
