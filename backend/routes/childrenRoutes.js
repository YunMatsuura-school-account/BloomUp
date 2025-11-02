// const express = require('express');
// const router = express.Router();
// const ChildProfile = require('../models/ChildProfile');
// const authMiddleware = require('../middleware/authMiddleware');

// router.get('/', authMiddleware, async (req, res) => {
//   try {
//     const children = await ChildProfile.find({ userId: req.user._id });
//     res.json({ children });
//   } catch (err) {
//     console.error('Fetch children error', err);
//     res.status(500).json({ message: 'Error fetching children' });
//   }
// });

// module.exports = router;



const express = require('express');
const router = express.Router();
const ChildProfile = require('../models/ChildProfile');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, async (req, res) => {
  try {
    const children = await ChildProfile.find({ userId: req.user._id });
    res.json({ children });
  } catch (err) {
    console.error('Fetch children error', err);
    res.status(500).json({ message: 'Error fetching children' });
  }
});

module.exports = router;