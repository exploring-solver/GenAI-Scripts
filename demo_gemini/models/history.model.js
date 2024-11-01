const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['text', 'image', 'embedding', 'document', 'chat', 'search'],
    default: 'text'
  },
  prompt: {
    type: String,
    required: true
  },
  response: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  metadata: {
    model: {
      type: String,
      default: 'gemini-1.5-flash'
    },
    processingTime: Number,
    tokenCount: Number,
    imageDetails: {
      filename: String,
      mimeType: String,
      size: Number
    }
  },
  status: {
    type: String,
    enum: ['success', 'error', 'processing'],
    default: 'success'
  },
  error: {
    message: String,
    code: String,
    stack: String
  },
  userId: {
    type: String,
    index: true
  },
  tags: [String],
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
historySchema.index({ type: 1, createdAt: -1 });
historySchema.index({ userId: 1, type: 1, createdAt: -1 });
historySchema.index({ tags: 1 });

// Middleware to update processing time
historySchema.pre('save', function(next) {
  if (this.metadata && this.metadata.startTime) {
    this.metadata.processingTime = Date.now() - this.metadata.startTime;
    delete this.metadata.startTime;
  }
  next();
});

// Instance methods
historySchema.methods.markAsError = function(error) {
  this.status = 'error';
  this.error = {
    message: error.message,
    code: error.code,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
  };
  return this.save();
};

historySchema.methods.addTags = function(newTags) {
  this.tags = [...new Set([...this.tags, ...newTags])];
  return this.save();
};

// Static methods
historySchema.statics.getRecentByType = function(type, limit = 10) {
  return this.find({ type })
    .sort({ createdAt: -1 })
    .limit(limit)
    .exec();
};

historySchema.statics.getStats = async function(userId = null) {
  const match = userId ? { userId } : {};
  return this.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        avgProcessingTime: { $avg: '$metadata.processingTime' },
        successRate: {
          $avg: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] }
        }
      }
    }
  ]);
};

module.exports = mongoose.model('History', historySchema);