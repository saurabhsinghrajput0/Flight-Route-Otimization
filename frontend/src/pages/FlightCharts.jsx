import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { BarChart2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const API_URL = 'http://localhost:5000/api/flights/routes';

const FlightCharts = () => {
    const { user } = useContext(AuthContext);
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRoutes = async () => {
            try {
                const { data } = await axios.get(API_URL, {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                
                // Format data for Recharts
                const formattedData = data.map(route => ({
                    name: `${route.source} - ${route.destination}`,
                    distance: route.distance
                }));
                
                setChartData(formattedData);
            } catch (err) {
                console.error('Failed to load chart data');
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchRoutes();
        }
    }, [user]);

    if (loading) return <div className="loading-state">Loading charts...</div>;

    return (
        <div className="app-container">
            <header className="header dashboard-header">
                <div className="header-title">
                    <BarChart2 style={{ display: 'inline', marginRight: '16px', verticalAlign: 'middle', width: '48px', height: '48px', color: '#3b82f6' }} />
                    <h1>Flight Network Analytics</h1>
                </div>
            </header>
            <p className="subtitle">Visualizing distances across all active flight routes.</p>

            <div className="glass-panel" style={{ height: '500px', padding: '30px' }}>
                {chartData.length === 0 ? (
                    <div style={{ textAlign: 'center', marginTop: '100px' }}>No route data available for charts.</div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={chartData}
                            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis 
                                dataKey="name" 
                                stroke="#94a3b8" 
                                angle={-45}
                                textAnchor="end"
                                height={80}
                            />
                            <YAxis stroke="#94a3b8" label={{ value: 'Distance (km)', angle: -90, position: 'insideLeft', fill: '#94a3b8' }} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                itemStyle={{ color: '#3b82f6' }}
                            />
                            <Legend wrapperStyle={{ paddingTop: '20px' }} />
                            <Bar dataKey="distance" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Flight Distance (km)" />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
};

export default FlightCharts;
