import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './routes/Home';
import About from './routes/About';
import Contact from './routes/Contact';
import Work from './routes/Work';
import VideoDetail from './routes/VideoDetail';
import AdminLogin from './routes/AdminLogin';
import AdminDashboard from './routes/AdminDashboard';
import './index.css';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/work" element={<Work />} />
        <Route path="/work/:id" element={<VideoDetail />} />
        <Route path="/admin/:secretPath" element={<AdminLogin />} />
        <Route path="/admin/:secretPath/dashboard" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}


export default App;
