import React, { useState } from 'react';
import './index.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AnimatedText from './AnimatedText';

function Compare() {
    const [file, setFile] = useState(null);
    const [result, setResult] = useState('');
    const [loading, setLoading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const navigate = useNavigate();

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setDragActive(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setDragActive(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragActive(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile && droppedFile.type === 'application/pdf') {
            setFile(droppedFile);
        } else {
            alert('Please upload a valid PDF file.');
        }
    };

    const handleCompare = async () => {
        if (!file) {
            setResult('Please upload a document.');
            return;
        }
    
        setLoading(true);
        setResult('');
    
        try {
            const formData = new FormData();
            formData.append('userDocument', file);
    
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/compare-pdfs`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
    
            navigate('/results', { state: { comparisonResult: response.data.comparison } });
        } catch (error) {
            setResult('Error comparing PDFs. Contact administrator.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-200 flex flex-col items-center justify-center p-4">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">UPLOAD • COMPARE • SHARE</h1>
            <AnimatedText />
            <br/>
            <br/>
            <div
                className={`w-full max-w-lg p-6 border-2 ${
                    dragActive ? 'border-blue-500' : 'border-dashed border-gray-400'
                } rounded-lg bg-white flex flex-col items-center justify-center relative`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <p className="text-gray-600 text-center mb-4">
                    Drag and drop your PDF here, or click to browse.
                </p>
                <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                {file ? (
                    <p className="text-green-600 font-semibold">{file.name}</p>
                ) : (
                    <div className="w-full h-24 flex items-center justify-center bg-blue-50 rounded-lg">
                        <img
                            src="/assets/file.svg"
                            alt="Document Icon"
                            className="h-12 w-12 text-blue-400"
                        />
                    </div>
                )}
            </div>
            <br/>
            <button
                className="bg-blue-500 text-white px-4 py-2 rounded"
                onClick={handleCompare}
                disabled={loading}
            >
                {loading ? 'Comparing...' : 'Compare'}
            </button>

            {result && (
                <div className="mt-8 w-full max-w-lg p-6 bg-white border rounded-lg">
                    <h2 className="text-xl font-semibold mb-2">Comparison Result:</h2>
                    <p>{result}</p>
                </div>
            )}
        </div>
    );
}

export default Compare;