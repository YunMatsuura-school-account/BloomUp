const Category = require('../models/Category');

// Get all categories for user
exports.getCategories = async (req, res) => {
  try {
    const userId = req.user && (req.user._id || req.user.id);
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const categories = await Category.find({ 
      $or: [
        { createdBy: userId },
        { category: { $in: ['General Category', 'Shopping', 'School Function', 'Others'] } }
      ]
    }).sort({ category: 1 });

    return res.json({ success: true, categories });
  } catch (err) {
    console.error('Error fetching categories:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Create new category
exports.createCategory = async (req, res) => {
  try {
    const { category } = req.body;
    const userId = req.user && (req.user._id || req.user.id);
    
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
    if (!category) return res.status(400).json({ success: false, message: 'Category name required' });

    // Check if category already exists for this user
    const existingCategory = await Category.findOne({ 
      category: category.trim(),
      createdBy: userId 
    });

    if (existingCategory) {
      return res.status(400).json({ success: false, message: 'Category already exists' });
    }

    const newCategory = new Category({
      category: category.trim(),
      createdBy: userId,
      username: req.user.name || 'User'
    });

    await newCategory.save();
    return res.status(201).json({ success: true, category: newCategory });
  } catch (err) {
    console.error('Error creating category:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};