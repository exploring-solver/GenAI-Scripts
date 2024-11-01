const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');
const embeddingController = require('../controllers/embedding.controller');
const historyController = require('../controllers/history.controller');

router.get('/history', historyController.getHistory);
router.get('/history/stats', historyController.getStats);
router.post('/history/:id/tags', historyController.addTags);
router.post('/generate-text', aiController.generateText);
router.post('/generate-embedding', embeddingController.generateEmbedding);
router.post('/analyze-image', aiController.analyzeImage);
router.post('/embeddings', embeddingController.generateEmbedding);
router.post('/embeddings/bulk', embeddingController.bulkGenerate);
router.post('/embeddings/similar', embeddingController.findSimilar);
router.delete('/embeddings', embeddingController.deleteEmbeddings);
router.get('/embeddings', embeddingController.getEmbeddings);
router.patch('/embeddings/:id/metadata', embeddingController.updateMetadata);

module.exports = router;