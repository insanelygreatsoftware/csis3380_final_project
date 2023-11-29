import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import Booking from "./components/Booking";
import { useState } from 'react';

function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const host = process.env.NODE_ENV === 'production' ? 'https://booking-app-frontend.vercel.app' : 'http://localhost:3001';

  console.log(host);

  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<Home isAdmin={isAdmin} setIsAdmin={setIsAdmin} host={host} />}  />
          <Route path="/booking" element={<Booking isAdmin={isAdmin} setIsAdmin={setIsAdmin} host={host} />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;