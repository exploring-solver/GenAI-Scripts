const express = require('express');
const genaiRoutes = require('./routes/genaiRoutes');
const subAppRoutes = require('./routes/subAppRoutes');

const app = express();

// Use your GenAI routes
app.use('/api/genai', genaiRoutes);

// Use other sub-app routes
app.use('/api/subapp', subAppRoutes);

module.exports = app;