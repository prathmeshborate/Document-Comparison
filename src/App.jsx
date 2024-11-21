import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Compare from './Compare';
import Results from './Results';

function App() {
    return (
        <Routes>
            <Route path="/" element={<Compare />} />
            <Route path="/results" element={<Results />} />
        </Routes>
    );
}

export default App;