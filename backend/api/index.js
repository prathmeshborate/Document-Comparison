const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();

app.use(cors({
    origin: 'https://document-comparison-frontend-lilac.vercel.app',
    credentials: true
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const upload = multer();
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

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

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', 'https://document-comparison-frontend-lilac.vercel.app');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    next();
});

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

module.exports = app;