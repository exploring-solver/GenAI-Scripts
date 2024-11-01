const History = require('../models/history.model');

exports.getHistory = async (req, res) => {
  try {
    const { type, limit = 10, page = 1, userId, tags } = req.query;
    const query = {};
    
    if (type) query.type = type;
    if (userId) query.userId = userId;
    if (tags) query.tags = { $all: tags.split(',') };

    const skip = (page - 1) * limit;
    
    const [records, total] = await Promise.all([
      History.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      History.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: records,
      pagination: {
        current: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.getStats = async (req, res) => {
  try {
    const { userId } = req.query;
    const stats = await History.getStats(userId);
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.addTags = async (req, res) => {
  try {
    const { id } = req.params;
    const { tags } = req.body;
    
    const history = await History.findById(id);
    if (!history) {
      return res.status(404).json({
        success: false,
        error: 'History record not found'
      });
    }

    await history.addTags(tags);
    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};