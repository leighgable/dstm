// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

// Assuming you will have a usage tracker and api routes
// const trackUsage = require('./db/usageTracker'); 
// const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3000;

// === MIDDLEWARE === //

// Enable Cross-Origin Resource Sharing for all origins
app.use(cors());

// Parse incoming JSON requests
app.use(express.json());

// Serve static files from the 'frontend' directory
// This makes your ai-chat.js, static assets, etc., available.
const frontendDir = path.join(__dirname, '../frontend');
app.use(express.static(frontendDir));

// Serve the top-level 'images' directory
const imagesDir = path.join(__dirname, '../images');
app.use('/images', express.static(imagesDir));



// === API ROUTES === //

// A sample implementation for the /api/design endpoint expected by ai-chat.js
app.post('/api/design', (req, res) => {
    const { prompt, sessionId } = req.body;

    // Log the received data for now.
    console.log('Received new design request:');
    console.log('  - Session ID:', sessionId);
    console.log('  - Prompt:', prompt);

    // Here you would typically call your AI image generation logic.
    // For now, we'll just send back a mock success response.
    
    // You could also track usage here using your usageTracker module
    // trackUsage(sessionId);

    const mockResponse = {
        design_output: `This is a mock design based on your prompt: "${prompt}". The actual image generation logic would go here.`
    };

    res.status(200).json(mockResponse);
});


// === FRONTEND HANDLER === //

// For any GET request that doesn't match a static file or API route,
// send the main HTML file. This is key for a Single Page Application.
const mainHtmlPath = path.join(__dirname, '../frontend/static/design/code.html');
app.get('*', (req, res) => {
    res.sendFile(mainHtmlPath);
});


// === SERVER START === //

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
