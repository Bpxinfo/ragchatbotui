// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './Login';
import Fileprocess from './Fileprocess';
import Chatbot from './Chatbot';
import Networkdiagram from './NetworkDiagram';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Chatbot />} />
        <Route path="/login" element={<Login />} />
        <Route path="/file-management" element={<Fileprocess />} />
        <Route path="/network-diagram" element={<Networkdiagram />} /> {/* Corrected path */}
      </Routes>
    </Router>
  );
};

export default App;
