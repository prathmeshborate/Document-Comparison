import React from 'react';
import { useLocation } from 'react-router-dom';
import { jsPDF } from 'jspdf';

function Results() {
    const location = useLocation();
    const { comparisonResult } = location.state || { comparisonResult: '' };

    const handleDownloadPDF = () => {
        const doc = new jsPDF();
        doc.text("PDF Comparison Results", 10, 10);
        doc.text(comparisonResult, 10, 20);
        doc.save('comparison-results.pdf');
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
            <div className="flex justify-between w-full max-w-4xl">
                <h1 className="text-2xl font-bold text-gray-800">Comparison Results</h1>
                <button
                    onClick={handleDownloadPDF}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    Download
                </button>
            </div>
            <div className="bg-white border rounded-lg p-6 mt-6 w-full max-w-4xl">
                <pre className="whitespace-pre-wrap">{comparisonResult || 'No results available.'}</pre>
            </div>
        </div>
    );
}

export default Results;