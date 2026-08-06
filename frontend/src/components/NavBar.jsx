import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Plane, LogOut, Home, Ticket, BarChart2 } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const NavBar = () => {
    const { user, logout } = useContext(AuthContext);
    const location = useLocation();

    if (!user) return null;

    const isActive = (path) => location.pathname === path ? 'active' : '';

    return (
        <nav className="navbar">
            <div className="nav-brand">
                <Plane className="nav-logo" size={28} />
                <span>FlightOptimizer</span>
            </div>
            
            <div className="nav-links">
                <Link to="/" className={`nav-link ${isActive('/')}`}>
                    <Home size={18} /> Dashboard
                </Link>
                <Link to="/bookings" className={`nav-link ${isActive('/bookings')}`}>
                    <Ticket size={18} /> My Bookings
                </Link>
                <Link to="/charts" className={`nav-link ${isActive('/charts')}`}>
                    <BarChart2 size={18} /> Network Charts
                </Link>
            </div>

            <div className="nav-user">
                <span className="welcome-text">Hi, {user.username}</span>
                <button onClick={logout} className="btn-logout">
                    <LogOut size={16} />
                </button>
            </div>
        </nav>
    );
};

export default NavBar;
