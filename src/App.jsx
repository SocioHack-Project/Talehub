// frontend/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Editor from './components/Editor';
import './App.css';

function App() {
  // Function to generate a unique ID
    const generateStoryId = () => {
        return Math.random().toString(36).substring(2, 15); // Simple random ID
    };

  return (
    <Router>
      <div className="App">
        <h1>Collaborative Storytelling</h1>
        <div style={{ textAlign: 'right', padding: '10px' }}>
            <Link to={`/editor/${generateStoryId()}`}> {/* Link to new editor page */}
              <button>Create</button>
            </Link>
        </div>
        <Routes>
          <Route path="/editor/:storyId" element={<Editor />} />
          <Route path="/" element={<div>Home Page</div>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;