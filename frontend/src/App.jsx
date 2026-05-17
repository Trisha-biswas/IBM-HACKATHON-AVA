import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Theme } from '@carbon/react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import CreateItinerary from './components/CreateItinerary';

function App() {
  return (
    <Theme theme="white">
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/packages" replace />} />
            <Route path="/packages" element={<Dashboard />} />
            <Route path="/create" element={<CreateItinerary />} />
          </Routes>
        </Layout>
      </Router>
    </Theme>
  );
}

export default App;

// Made with Bob
