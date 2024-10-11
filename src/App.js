
import './App.css';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import MyShift from './Pages/MyShift';
import AvailableShift from './Pages/AvailableShift';
import { useState } from 'react';

function App() {
  const [activeLink, setActiveLink] = useState("/MyShift");

  const handleClick = (link) => {
    setActiveLink(link);
  }

  return (
    <BrowserRouter>
      <nav className='App'>
        <Link to="/MyShift" onClick={() => handleClick('/MyShift')} className={activeLink === '/MyShift' ? "active" : " "}>
          My Shift
        </Link>
        
        <Link to="/AvailableShift" onClick={() => handleClick('/AvailableShift')} className={activeLink === '/AvailableShift' ? "active" : " "}>
          Available Shift
        </Link>
      </nav>
      <Routes>
        <Route path="/" element={<Navigate to="/MyShift" replace />} /> {/* Redirect to /MyShift */}
        <Route path="/MyShift" element={<MyShift />} />
        <Route path="/AvailableShift" element={<AvailableShift />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
