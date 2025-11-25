// //backend/Controllers/categoryController.js

const Category = require('../models/Category');
const CalendarEvent = require('../models/calendarEvent');

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

// Delete category
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user && (req.user._id || req.user.id);

    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    console.log('Attempting to delete category:', id, 'for user:', userId);

    // Find the category first
    const category = await Category.findById(id);
    if (!category) {
      console.log('Category not found with ID:', id);
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    // Check if user owns the category
    if (String(category.createdBy) !== String(userId)) {
      console.log('User not authorized to delete this category. User:', userId, 'Category createdBy:', category.createdBy);
      return res.status(403).json({ success: false, message: 'Not authorized to delete this category' });
    }

    // Check if category is used in any calendar events for this user
    const eventsUsingCategory = await CalendarEvent.findOne({
      category: category.category,
      userId: userId
    });

    console.log('Events using category:', eventsUsingCategory);

    if (eventsUsingCategory) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category "${category.category}" because it is used in existing events. Please delete or update those events first.`
      });
    }

    // Delete the category
    await Category.findByIdAndDelete(id);
    console.log('Category deleted successfully:', id);

    return res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting category:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
