import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Plane, LogOut } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import NetworkManager from '../components/NetworkManager';
import RouteOptimizer from '../components/RouteOptimizer';

const API_URL = 'http://localhost:5000/api/flights';

const Dashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const [cities, setCities] = useState([]);
    const [routes, setRoutes] = useState([]);

    const getAuthConfig = () => ({
        headers: { Authorization: `Bearer ${user?.token}` }
    });

    const fetchData = async () => {
        try {
            const config = getAuthConfig();
            const [citiesRes, routesRes] = await Promise.all([
                axios.get(`${API_URL}/cities`, config),
                axios.get(`${API_URL}/routes`, config)
            ]);
            setCities(citiesRes.data);
            setRoutes(routesRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const seedData = async () => {
        try {
            await axios.post(`${API_URL}/seed`, {}, getAuthConfig());
            fetchData();
        } catch (error) {
            console.error('Error seeding data:', error);
        }
    };

    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [user]);

    return (
        <div className="app-container" style={{ position: 'relative' }}>
            {/* Dashboard Animated Flights Background */}
            <div className="dashboard-bg">
                <div className="runway" style={{ background: 'linear-gradient(to top, #1e293b, #0f172a)' }}></div>
                <div className="plane-swarm">
                    {/* Highly detailed SVG Plane instead of Emojis */}
                    {[1,2,3,4,5].map(i => (
                        <div key={i} className={`p${i}`} style={{ opacity: 0.85, filter: 'drop-shadow(0 20px 15px rgba(0,0,0,0.5))' }}>
                            <svg width="120" height="120" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ transform: 'rotate(45deg)' }}>
                                <path d="M21 16V14L13 9V3.5C13 2.67 12.33 2 11.5 2C10.67 2 10 2.67 10 3.5V9L2 14V16L10 13.5V19L8 20.5V22L11.5 21L15 22V20.5L13 19V13.5L21 16Z" fill="#ffffff"/>
                            </svg>
                        </div>
                    ))}
                </div>
            </div>

            <header className="header dashboard-header">
                <div className="header-title">
                    <Plane style={{ display: 'inline', marginRight: '16px', verticalAlign: 'middle', width: '48px', height: '48px', color: '#001b94' }} />
                    <h1>Flight Route Optimization</h1>
                </div>
                
                <div className="user-controls">
                    <span className="welcome-text">Welcome, {user?.username}</span>
                    <button onClick={logout} className="btn-secondary btn-sm">
                        <LogOut size={16} /> Logout
                    </button>
                </div>
            </header>
            <p className="subtitle">Advanced routing system using Dijkstra's algorithm</p>

            <div className="grid-container">
                <NetworkManager 
                    cities={cities} 
                    onDataChanged={fetchData} 
                    onSeed={seedData}
                    user={user}
                />
                <RouteOptimizer 
                    cities={cities} 
                    user={user}
                />
            </div>
        </div>
    );
};

export default Dashboard;
