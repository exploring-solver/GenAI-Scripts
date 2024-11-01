const mongoose = require('mongoose');

const embeddingSchema = new mongoose.Schema({
  text: String,
  embedding: [Number],
  metadata: Object,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Embedding', embeddingSchema);