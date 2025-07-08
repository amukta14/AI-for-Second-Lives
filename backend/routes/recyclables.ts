import express from 'express';
const router = express.Router();

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

export default router; 