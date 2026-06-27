import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store';

// Components
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import StudentView from './components/StudentView';
import Toast from './components/Toast';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRole }) => {
  const currentUser = useStore(state => state.currentUser);
  
  if (!currentUser) {
    return <Navigate to="/" replace />;
  }
  
  if (allowedRole && currentUser.role !== allowedRole) {
    // Redirect to their respective dashboard if they try to access the wrong route
    return <Navigate to={currentUser.role === 'admin' ? '/admin' : '/library'} replace />;
  }
  
  return children;
};

function App() {
  return (
    <Router>
      <div className="app-container">
        <Toast />
        <Routes>
          <Route path="/" element={<Login />} />
          
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/library" 
            element={
              <ProtectedRoute allowedRole="student">
                <StudentView />
              </ProtectedRoute>
            } 
          />
          
          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
