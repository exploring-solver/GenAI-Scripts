const { GoogleGenerativeAI } = require('@google/generative-ai');
const Embedding = require('../models/embedding.model');
const History = require('../models/history.model');

class EmbeddingController {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  // Generate and store embedding
  generateEmbedding = async (req, res) => {
    const startTime = Date.now();
    try {
      const { text, metadata = {} } = req.body;

      if (!text) {
        return res.status(400).json({
          success: false,
          error: 'Text is required'
        });
      }

      // Generate embedding using Gemini
      const result = await this.model.embedText(text);
      const embedding = result.embedding;

      // Store in MongoDB
      const newEmbedding = await Embedding.create({
        text,
        embedding,
        metadata: {
          ...metadata,
          source: 'gemini',
          timestamp: new Date(),
          textLength: text.length
        }
      });

      // Log to history
      await History.create({
        type: 'embedding',
        prompt: text,
        response: { embeddingId: newEmbedding._id },
        metadata: {
          model: 'gemini-1.5-flash',
          processingTime: Date.now() - startTime,
          textLength: text.length
        }
      });

      res.json({
        success: true,
        data: {
          id: newEmbedding._id,
          metadata: newEmbedding.metadata
        }
      });
    } catch (error) {
      console.error('Embedding generation error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  };

  // Find similar texts using cosine similarity
  findSimilar = async (req, res) => {
    try {
      const { text, limit = 5, threshold = 0.7 } = req.body;

      if (!text) {
        return res.status(400).json({
          success: false,
          error: 'Text is required'
        });
      }

      // Generate embedding for query text
      const result = await this.model.embedText(text);
      const queryEmbedding = result.embedding;

      // Find similar embeddings using aggregation pipeline
      const similar = await Embedding.aggregate([
        {
          $addFields: {
            similarity: {
              $function: {
                body: function(a, b) {
                  let dotProduct = 0.0;
                  let normA = 0.0;
                  let normB = 0.0;
                  for (let i = 0; i < a.length; i++) {
                    dotProduct += a[i] * b[i];
                    normA += a[i] * a[i];
                    normB += b[i] * b[i];
                  }
                  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
                },
                args: ["$embedding", queryEmbedding],
                lang: "js"
              }
            }
          }
        },
        {
          $match: {
            similarity: { $gte: threshold }
          }
        },
        {
          $sort: { similarity: -1 }
        },
        {
          $limit: parseInt(limit)
        },
        {
          $project: {
            text: 1,
            similarity: 1,
            metadata: 1
          }
        }
      ]);

      res.json({
        success: true,
        data: similar
      });
    } catch (error) {
      console.error('Similar search error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  };

  // Bulk generate embeddings
  bulkGenerate = async (req, res) => {
    const startTime = Date.now();
    try {
      const { texts, metadata = {} } = req.body;

      if (!Array.isArray(texts)) {
        return res.status(400).json({
          success: false,
          error: 'Texts must be an array'
        });
      }

      const results = await Promise.all(
        texts.map(async (text) => {
          try {
            const result = await this.model.embedText(text);
            return {
              text,
              embedding: result.embedding,
              metadata: {
                ...metadata,
                source: 'gemini',
                timestamp: new Date(),
                textLength: text.length
              }
            };
          } catch (error) {
            return { text, error: error.message };
          }
        })
      );

      // Filter successful generations and failed ones
      const successful = results.filter(r => !r.error);
      const failed = results.filter(r => r.error);

      // Bulk insert successful embeddings
      const inserted = await Embedding.insertMany(successful);

      // Log to history
      await History.create({
        type: 'embedding',
        prompt: `Bulk generation of ${texts.length} embeddings`,
        response: {
          successful: successful.length,
          failed: failed.length,
          embeddingIds: inserted.map(e => e._id)
        },
        metadata: {
          model: 'gemini-1.5-flash',
          processingTime: Date.now() - startTime,
          batchSize: texts.length
        }
      });

      res.json({
        success: true,
        data: {
          successful: successful.length,
          failed: failed.length,
          failedTexts: failed.map(f => ({ text: f.text, error: f.error }))
        }
      });
    } catch (error) {
      console.error('Bulk generation error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  };

  // Delete embeddings
  deleteEmbeddings = async (req, res) => {
    try {
      const { ids } = req.body;

      if (!Array.isArray(ids)) {
        return res.status(400).json({
          success: false,
          error: 'IDs must be an array'
        });
      }

      const result = await Embedding.deleteMany({
        _id: { $in: ids }
      });

      res.json({
        success: true,
        data: {
          deleted: result.deletedCount
        }
      });
    } catch (error) {
      console.error('Deletion error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  };

  // Get embeddings with filtering and pagination
  getEmbeddings = async (req, res) => {
    try {
      const {
        page = 1,
        limit = 10,
        metadata = {},
        sortBy = 'createdAt',
        sortOrder = -1
      } = req.query;

      const query = {};
      
      // Build metadata query
      Object.entries(metadata).forEach(([key, value]) => {
        query[`metadata.${key}`] = value;
      });

      const skip = (page - 1) * limit;
      
      const [embeddings, total] = await Promise.all([
        Embedding.find(query)
          .sort({ [sortBy]: sortOrder })
          .skip(skip)
          .limit(parseInt(limit))
          .select('-embedding'), // Exclude the embedding vector for performance
        Embedding.countDocuments(query)
      ]);

      res.json({
        success: true,
        data: embeddings,
        pagination: {
          current: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Get embeddings error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  };

  // Update embedding metadata
  updateMetadata = async (req, res) => {
    try {
      const { id } = req.params;
      const { metadata } = req.body;

      const embedding = await Embedding.findByIdAndUpdate(
        id,
        { $set: { metadata } },
        { new: true }
      );

      if (!embedding) {
        return res.status(404).json({
          success: false,
          error: 'Embedding not found'
        });
      }

      res.json({
        success: true,
        data: embedding
      });
    } catch (error) {
      console.error('Update metadata error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  };
}

module.exports = new EmbeddingController();