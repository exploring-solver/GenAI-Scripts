const express = require('express');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI("env");
const app = express();

app.get('/generate-story', async (req, res) => {
  const model = genAI.getGenerativeModel({ model: "gemini-pro"});
  const prompt = "Write a story about a magic backpack.";
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  res.json({ result: text });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

