const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '../.env' }); // Load environment variables

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware setup
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Multer setup for file uploads
const upload = multer();

// Initialize OpenAI client
if (!process.env.OPENAI_API_KEY) {
    console.error('Error: OPENAI_API_KEY is missing in the environment variables.');
    process.exit(1); // Exit if API key is not provided
}

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Load the standard PDF document
const standardDocumentPath = path.join(__dirname, 'standard.pdf');
let standardDocumentText = '';

async function loadStandardDocument() {
    try {
        const standardPDFBuffer = fs.readFileSync(standardDocumentPath);
        const data = await pdfParse(standardPDFBuffer);
        standardDocumentText = data.text;
        console.log('Standard document loaded successfully.');
    } catch (error) {
        console.error('Error loading standard document:', error);
        process.exit(1); // Exit if the standard document cannot be loaded
    }
}
loadStandardDocument();

// Endpoint for comparing PDFs
app.post('/compare-pdfs', upload.single('userDocument'), async (req, res) => {
    const userPDF = req.file;

    if (!userPDF) {
        return res.status(400).send({ error: 'User document is required. Please upload a PDF file.' });
    }

    try {
        // Parse the uploaded PDF
        const userPDFData = await pdfParse(userPDF.buffer);
        const userPDFText = userPDFData.text;

        // Use OpenAI API for comparison
        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: 'You are an expert in document analysis. Compare the standard document with the user-uploaded document and highlight differences.',
                },
                {
                    role: 'user',
                    content: `Standard Document:\n${standardDocumentText}\n\nUser Document:\n${userPDFText}`,
                },
            ],
        });

        // Extract the comparison result from the OpenAI response
        const comparison = response.choices[0].message.content;
        res.send({ comparison });
    } catch (error) {
        console.error('Error comparing PDFs:', error);
        res.status(500).send({ error: 'Failed to compare documents. Please try again later.' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});