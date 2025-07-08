"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const router = express_1.default.Router();
const DATA_FILE = path_1.default.join(__dirname, '../user-eco-stats.json');
const REMINDERS_FILE = path_1.default.join(__dirname, '../user-reminders.json');
// Helper: Load and save user stats
function loadStats() {
    if (!fs_1.default.existsSync(DATA_FILE))
        return {};
    return JSON.parse(fs_1.default.readFileSync(DATA_FILE, 'utf-8'));
}
function saveStats(stats) {
    fs_1.default.writeFileSync(DATA_FILE, JSON.stringify(stats, null, 2));
}
// Helper: Load and save user reminders
function loadReminders() {
    if (!fs_1.default.existsSync(REMINDERS_FILE))
        return {};
    return JSON.parse(fs_1.default.readFileSync(REMINDERS_FILE, 'utf-8'));
}
function saveReminders(reminders) {
    fs_1.default.writeFileSync(REMINDERS_FILE, JSON.stringify(reminders, null, 2));
}
// GET /users/:id/eco-stats
router.get('/:id/eco-stats', (req, res) => {
    const stats = loadStats();
    const userStats = stats[req.params.id] || { reused: 0, recycled: 0, greenScore: 0, actions: 0, coupons: 0 };
    res.json(userStats);
});
// POST /users/:id/eco-action
// Body: { type: 'reuse' | 'recycle' }
router.post('/:id/eco-action', (req, res) => {
    const { type } = req.body;
    if (!['reuse', 'recycle'].includes(type)) {
        res.status(400).json({ error: 'Invalid type' });
        return;
    }
    const stats = loadStats();
    if (!stats[req.params.id])
        stats[req.params.id] = { reused: 0, recycled: 0, greenScore: 0, actions: 0, coupons: 0 };
    if (type === 'reuse')
        stats[req.params.id].reused++;
    if (type === 'recycle')
        stats[req.params.id].recycled++;
    stats[req.params.id].actions++;
    stats[req.params.id].greenScore = stats[req.params.id].reused * 10 + stats[req.params.id].recycled * 5;
    // Coupon logic: every 5 actions
    let coupon = false;
    if (stats[req.params.id].actions % 5 === 0) {
        stats[req.params.id].coupons++;
        coupon = true;
    }
    saveStats(stats);
    res.json({ ...stats[req.params.id], coupon });
});
// GET /users/:id/reminders
router.get('/:id/reminders', (req, res) => {
    const reminders = loadReminders();
    res.json(reminders[req.params.id] || []);
});
// POST /users/:id/reminders
// Body: { product: string, days: number }
router.post('/:id/reminders', (req, res) => {
    const { product, days } = req.body;
    if (!product || ![7, 15, 30].includes(days)) {
        res.status(400).json({ error: 'Invalid product or days' });
        return;
    }
    const reminders = loadReminders();
    if (!reminders[req.params.id])
        reminders[req.params.id] = [];
    const reminder = {
        id: Date.now().toString(),
        product,
        days,
        createdAt: new Date().toISOString(),
        remindAt: new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()
    };
    reminders[req.params.id].push(reminder);
    saveReminders(reminders);
    res.json(reminder);
});
// DELETE /users/:id/reminders/:reminderId
router.delete('/:id/reminders/:reminderId', (req, res) => {
    const reminders = loadReminders();
    if (!reminders[req.params.id]) {
        res.status(404).json({ error: 'No reminders found' });
        return;
    }
    reminders[req.params.id] = reminders[req.params.id].filter((r) => r.id !== req.params.reminderId);
    saveReminders(reminders);
    res.json({ success: true });
});
exports.default = router;
