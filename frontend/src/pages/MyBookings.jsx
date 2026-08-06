import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Ticket, Calendar, Navigation, Clock, Briefcase, User, CheckCircle } from 'lucide-react';

const API_URL = 'http://localhost:5000/api/bookings';

const MyBookings = () => {
    const { user } = useContext(AuthContext);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const { data } = await axios.get(API_URL, {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                setBookings(data);
            } catch (err) {
                setError('Failed to load bookings');
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchBookings();
        }
    }, [user]);

    if (loading) return <div className="loading-state">Loading your itinerary...</div>;
    if (error) return <div className="error-card">{error}</div>;

    return (
        <div className="app-container">
            <header className="header dashboard-header">
                <div className="header-title">
                    <Ticket style={{ display: 'inline', marginRight: '16px', verticalAlign: 'middle', width: '48px', height: '48px', color: '#001b94' }} />
                    <h1>My Flights</h1>
                </div>
            </header>
            <p className="subtitle">View your boarding passes and travel history.</p>

            <div className="bookings-grid">
                {bookings.length === 0 ? (
                    <div className="glass-panel" style={{ textAlign: 'center', padding: '40px', gridColumn: '1 / -1' }}>
                        <p>You have no bookings yet. Go to the Dashboard to optimize a route and book a ticket!</p>
                    </div>
                ) : (
                    bookings.map(booking => (
                        <div key={booking._id} className="boarding-pass">
                            <div className="bp-header">
                                <div className="bp-airline">INDIGO CLONE</div>
                                <div className="bp-status"><CheckCircle size={14} style={{ marginRight: '4px' }} /> {booking.status || 'CONFIRMED'}</div>
                            </div>
                            
                            <div className="bp-body">
                                <div className="bp-route">
                                    <div className="bp-city">
                                        <h2>{booking.source.substring(0, 3).toUpperCase()}</h2>
                                        <span>{booking.source}</span>
                                    </div>
                                    <div className="bp-icon">
                                        <Navigation size={24} color="#00b0ff" style={{ transform: 'rotate(90deg)' }} />
                                        <span style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '4px' }}>{booking.distance} km</span>
                                    </div>
                                    <div className="bp-city">
                                        <h2>{booking.destination.substring(0, 3).toUpperCase()}</h2>
                                        <span>{booking.destination}</span>
                                    </div>
                                </div>

                                <div className="bp-details">
                                    <div className="bp-detail-box">
                                        <span className="bp-label">Passenger</span>
                                        <span className="bp-value" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <User size={14} /> {user.username.toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="bp-detail-box">
                                        <span className="bp-label">Date</span>
                                        <span className="bp-value" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Calendar size={14} /> {new Date(booking.departureDate).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="bp-detail-box">
                                        <span className="bp-label">Flight Time</span>
                                        <span className="bp-value" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Clock size={14} /> {Math.max(1, Math.round(booking.distance / 800))}h {Math.round((booking.distance % 800) / 13)}m
                                        </span>
                                    </div>
                                </div>

                                <div className="bp-details">
                                    <div className="bp-detail-box">
                                        <span className="bp-label">Class</span>
                                        <span className="bp-value">{booking.cabinClass || 'Economy'}</span>
                                    </div>
                                    <div className="bp-detail-box">
                                        <span className="bp-label">Seat</span>
                                        <span className="bp-value">{Math.floor(Math.random() * 30 + 1)}{['A','B','C','D','E','F'][Math.floor(Math.random() * 6)]}</span>
                                    </div>
                                    <div className="bp-detail-box">
                                        <span className="bp-label">Baggage</span>
                                        <span className="bp-value" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Briefcase size={14} /> 15kg + 7kg
                                        </span>
                                    </div>
                                </div>

                                <div className="bp-footer">
                                    <div className="bp-pnr">
                                        <span className="bp-label">PNR</span>
                                        <span className="bp-value" style={{ fontSize: '1.2rem', letterSpacing: '2px', color: '#001b94' }}>{booking.pnr || 'X49B2V'}</span>
                                    </div>
                                    <div className="bp-price">
                                        <span className="bp-label">Total Paid ({booking.tripType})</span>
                                        <span className="bp-value" style={{ fontSize: '1.2rem', color: '#10b981' }}>₹{Math.round(booking.price).toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className="bp-barcode">
                                    || ||| || ||| | || |||| || | || ||
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default MyBookings;
