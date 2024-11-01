const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    console.log(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  async generateText(prompt) {
    try {
      const result = await this.model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      throw new Error(`Text generation failed: ${error.message}`);
    }
  }

  async generateEmbedding(text) {
    try {
      const result = await this.model.embedText(text);
      return result.embedding;
    } catch (error) {
      throw new Error(`Embedding generation failed: ${error.message}`);
    }
  }

  async analyzeImage(imagePath, prompt) {
    try {
      const imageData = await fs.promises.readFile(imagePath);
      const result = await this.model.generateContent([prompt, imageData]);
      return result.response.text();
    } catch (error) {
      throw new Error(`Image analysis failed: ${error.message}`);
    }
  }
}

module.exports = new GeminiService();