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
const ChildProfileModel = require('../models/ChildProfile');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, async (req, res) => {
  try {
    console.log('Fetching children for user:', req.user._id);
    
    const children = await ChildProfileModel.getAllChildrenByUser(req.user._id);
    
    console.log('Found children:', children.length);

    res.json({ 
      success: true, 
      children: children.map(child => ({
        _id: child._id,
        name: child.name,
        dateOfBirth: child.dateOfBirth, 
        age: child.age
      }))
    });
  } catch (err) {
    console.error('Fetch children error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching children',
      error: err.message 
    });
  }
});

module.exports = router;