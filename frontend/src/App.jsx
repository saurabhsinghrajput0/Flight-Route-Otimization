import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import NavBar from './components/NavBar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import MyBookings from './pages/MyBookings';
import FlightCharts from './pages/FlightCharts';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useContext(AuthContext);
    
    if (loading) return <div className="loading-state">Loading...</div>;
    if (!user) return <Navigate to="/login" />;
    
    return children;
};

const AppRoutes = () => {
    return (
        <>
            <NavBar />
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
                <Route path="/charts" element={<ProtectedRoute><FlightCharts /></ProtectedRoute>} />
            </Routes>
        </>
    );
};

function App() {
  return (
    <AuthProvider>
        <Router>
            <AppRoutes />
        </Router>
    </AuthProvider>
  );
}

export default App;
