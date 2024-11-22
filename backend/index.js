const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const OpenAI = require('openai');
require('dotenv').config({ path: '../.env' });

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const upload = multer();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const fs = require('fs');
const path = require('path');
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
    }
}
loadStandardDocument();

app.get('/', (req, res) => {
    res.send('Backend is running! Use the correct endpoint to compare PDFs.');
});

app.post('/compare-pdfs', upload.single('userDocument'), async (req, res) => {
    const userPDF = req.file;

    if (!userPDF) {
        return res.status(400).send({ error: 'User document is required.' });
    }

    try {
        const userPDFText = await pdfParse(userPDF.buffer);

        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: 'You are an expert in document analysis. Compare the standard document with the user-uploaded document and highlight differences.',
                },
                {
                    role: 'user',
                    content: `Standard Document:\n${standardDocumentText}\n\nUser Document:\n${userPDFText.text}`,
                },
            ],
        });

        const comparison = response.choices[0].message.content;
        res.send({ comparison });
    } catch (error) {
        console.error('Error comparing PDFs:', error);
        res.status(500).send({ error: 'Failed to compare documents.' });
    }
});

// Export the app for Vercel
module.exports = app;