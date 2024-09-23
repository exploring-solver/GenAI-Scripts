require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const genaiRoutes = require('./src/general/routes/genairoutes');
const connectDB = require('./config/db');

// Initialize express app
const app = express();

// Middlewares
app.use(cors());
app.use(bodyParser.json());
connectDB();

// Database connection (You can implement this later)

// Routes
app.use('/api/genai', genaiRoutes);
// Port setup
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
