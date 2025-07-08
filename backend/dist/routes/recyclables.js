"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
// GET /recyclables/:zipcode
router.get('/:zipcode', (req, res) => {
    const { zipcode } = req.params;
    // Mock recycling tips
    res.json({
        zipcode,
        tips: [
            'Plastic bottles can be recycled curbside.',
            'Drop off electronics at your local e-waste center.',
            'Check Walmart for plastic bag recycling bins.'
        ]
    });
});
exports.default = router;
