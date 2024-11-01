const geminiService = require('../services/gemini.service');
const History = require('../models/history.model');

// Generate text based on a prompt
exports.generateText = async (req, res) => {
  try {
    const { prompt } = req.body;
    const response = await geminiService.generateText(prompt);

    // Save the text generation history
    await History.create({
      type: 'text',
      prompt,
      response
    });

    res.json({ success: true, data: response });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Generate embedding based on input text
exports.generateEmbedding = async (req, res) => {
  try {
    const { text } = req.body;
    const embedding = await geminiService.generateEmbedding(text);

    // Save the embedding generation history
    await History.create({
      type: 'embedding',
      prompt: text,
      response: embedding
    });

    res.json({ success: true, data: embedding });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Analyze image based on an image path and an optional prompt
exports.analyzeImage = async (req, res) => {
  try {
    const { imagePath, prompt } = req.body;
    const response = await geminiService.analyzeImage(imagePath, prompt);

    // Save the image analysis history
    await History.create({
      type: 'image_analysis',
      prompt,
      response
    });

    res.json({ success: true, data: response });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
