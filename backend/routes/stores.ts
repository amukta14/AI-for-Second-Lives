import express, { Request, Response } from 'express';

const router = express.Router();

// Mock Walmart store data
const stores = [
  {
    zip: '10001',
    name: 'Walmart Supercenter - Chelsea',
    address: '123 6th Ave, New York, NY 10001',
    recyclingPolicy: 'Accepts plastic bags, electronics, batteries, and ink cartridges.',
    events: [
      { name: 'Bottle Drop Day', date: '2024-07-10', description: 'Bring your bottles for recycling and get a $5 coupon!' },
      { name: 'DIY Saturday', date: '2024-07-13', description: 'Join us for upcycling workshops in-store.' }
    ]
  },
  {
    zip: '94103',
    name: 'Walmart Supercenter - SF Market',
    address: '456 Market St, San Francisco, CA 94103',
    recyclingPolicy: 'Accepts plastic bags, electronics, and glass bottles.',
    events: [
      { name: 'E-Waste Collection', date: '2024-07-12', description: 'Drop off your old electronics for safe recycling.' },
      { name: 'DIY Saturday', date: '2024-07-20', description: 'Learn to upcycle household items.' }
    ]
  }
]

// GET /stores?zip=XXXXX
router.get('/', (req: Request, res: Response): void => {
  const { zip } = req.query
  if (!zip) {
    res.status(400).json({ error: 'ZIP code required' })
    return
  }
  const store = stores.find(s => s.zip === zip)
  if (!store) {
    res.status(404).json({ error: 'No Walmart found for this ZIP' })
    return
  }
  res.json(store)
})

export default router; 