import React, { useState } from 'react';
import axios from 'axios';
import { Plane, Calendar, Users, Shield, ArrowRight, CreditCard, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:5000/api/flights';
const BOOKING_API_URL = 'http://localhost:5000/api/bookings';

const RouteOptimizer = ({ cities, user }) => {
    // Search State
    const [tripType, setTripType] = useState('One Way');
    const [cabinClass, setCabinClass] = useState('Economy');
    const [source, setSource] = useState('');
    const [destination, setDestination] = useState('');
    const [departureDate, setDepartureDate] = useState('');
    const [returnDate, setReturnDate] = useState('');
    
    // Passenger State
    const [adults, setAdults] = useState(1);
    const [children, setChildren] = useState(0);
    const [infants, setInfants] = useState(0);
    
    // Special Fare State
    const [specialFare, setSpecialFare] = useState('None');
    
    // Result State
    const [result, setResult] = useState(null);
    const [fareBreakdown, setFareBreakdown] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [bookingLoading, setBookingLoading] = useState(false);
    
    const navigate = useNavigate();

    const getConfig = () => ({
        headers: { Authorization: `Bearer ${user?.token}` }
    });

    const fares = ['None', 'Armed Forces', 'Student', 'Senior Citizen', 'Unaccompanied Minor'];
    const cabinClasses = ['Economy', 'Premium Economy', 'Business'];

    const calculatePrice = (distance, depDateStr) => {
        // Industry-level INR Pricing Model
        let baseFare = 2500 + (distance * 4.5); 
        
        // Round trip logic
        if (tripType === 'Round Trip') baseFare *= 1.8; 

        // Cabin Class Multiplier
        let classMultiplier = 1;
        if (cabinClass === 'Premium Economy') classMultiplier = 1.5;
        if (cabinClass === 'Business') classMultiplier = 3.0;
        
        baseFare = baseFare * classMultiplier;

        // Proximity Surge Pricing
        let surge = 0;
        let surgeLabel = '';
        const daysToDeparture = (new Date(depDateStr) - new Date()) / (1000 * 60 * 60 * 24);
        
        if (daysToDeparture > 0 && daysToDeparture <= 7) {
            surge = baseFare * 0.40; // 40% surge if booking within 7 days
            surgeLabel = 'Last Minute Surge (+40%)';
        } else if (daysToDeparture > 7 && daysToDeparture <= 14) {
            surge = baseFare * 0.20; // 20% surge if booking within 14 days
            surgeLabel = 'Near Departure Surge (+20%)';
        }

        let adultTotal = (baseFare + surge) * adults;
        let childTotal = (baseFare + surge) * 0.75 * children;
        let infantTotal = (baseFare + surge) * 0.20 * infants;
        let subTotal = adultTotal + childTotal + infantTotal;

        // Special fare discounts
        let discount = 0;
        let discountLabel = '';
        if (specialFare === 'Student') { discount = subTotal * 0.10; discountLabel = '10% Student Discount'; }
        if (specialFare === 'Armed Forces') { discount = subTotal * 0.15; discountLabel = '15% Armed Forces Discount'; }
        if (specialFare === 'Senior Citizen') { discount = subTotal * 0.05; discountLabel = '5% Senior Citizen Discount'; }
        
        let taxes = (subTotal - discount) * 0.05; // 5% tax
        let total = (subTotal - discount) + taxes;

        return {
            baseFare,
            surge,
            surgeLabel,
            adultTotal,
            childTotal,
            infantTotal,
            subTotal,
            discount,
            discountLabel,
            taxes,
            total
        };
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!source || !destination || !departureDate) return;
        if (tripType === 'Round Trip' && !returnDate) return;

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const res = await axios.get(`${API_URL}/optimize`, {
                params: { source, destination },
                ...getConfig()
            });
            
            const breakdown = calculatePrice(res.data.totalDistance, departureDate);
            setFareBreakdown(breakdown);
            
            setResult({
                ...res.data,
                price: breakdown.total,
                departureDate,
                returnDate,
                tripType,
                cabinClass,
                passengers: { adults, children, infants },
                specialFare
            });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to calculate route.');
        } finally {
            setLoading(false);
        }
    };

    const handleBookTicket = async () => {
        if (!result) return;
        setBookingLoading(true);
        try {
            await axios.post(BOOKING_API_URL, {
                tripType: result.tripType,
                cabinClass: result.cabinClass,
                source: result.source,
                destination: result.destination,
                departureDate: result.departureDate,
                returnDate: result.returnDate,
                passengers: result.passengers,
                specialFare: result.specialFare,
                path: result.path,
                distance: result.totalDistance,
                price: result.price
            }, getConfig());
            alert('Flight booked successfully!');
            navigate('/bookings');
        } catch (err) {
            alert('Failed to book flight: ' + (err.response?.data?.message || err.message));
        } finally {
            setBookingLoading(false);
        }
    };

    return (
        <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: '24px', background: '#001b94', color: 'white' }}>
                <h2 style={{ color: 'white', border: 'none', margin: '0' }}><Plane /> Search Flights</h2>
            </div>
            
            <div style={{ padding: '32px' }}>
                <form onSubmit={handleSearch}>
                    {/* Trip Type & Cabin Class */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', marginBottom: '24px' }}>
                        <div className="trip-type-selector" style={{ marginBottom: '0' }}>
                            <label className="trip-type-label">
                                <input 
                                    type="radio" 
                                    checked={tripType === 'One Way'} 
                                    onChange={() => setTripType('One Way')} 
                                />
                                One Way
                            </label>
                            <label className="trip-type-label">
                                <input 
                                    type="radio" 
                                    checked={tripType === 'Round Trip'} 
                                    onChange={() => setTripType('Round Trip')} 
                                />
                                Round Trip
                            </label>
                        </div>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Cabin Class:</label>
                            <select value={cabinClass} onChange={(e) => setCabinClass(e.target.value)} style={{ padding: '8px', width: 'auto' }}>
                                {cabinClasses.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* From / To */}
                    <div className="search-form-row">
                        <div className="form-group">
                            <label>From</label>
                            <select value={source} onChange={(e) => setSource(e.target.value)} required>
                                <option value="">Select Origin</option>
                                {cities.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>To</label>
                            <select value={destination} onChange={(e) => setDestination(e.target.value)} required>
                                <option value="">Select Destination</option>
                                {cities.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Dates */}
                    <div className="search-form-row">
                        <div className="form-group">
                            <label>Departure Date</label>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <Calendar size={20} color="#001b94" />
                                <input 
                                    type="date" 
                                    value={departureDate} 
                                    onChange={(e) => setDepartureDate(e.target.value)} 
                                    required 
                                />
                            </div>
                        </div>
                        {tripType === 'Round Trip' && (
                            <div className="form-group">
                                <label>Return Date</label>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <Calendar size={20} color="#001b94" />
                                    <input 
                                        type="date" 
                                        value={returnDate} 
                                        onChange={(e) => setReturnDate(e.target.value)} 
                                        required 
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Passengers */}
                    <div className="search-form-row">
                        <div className="form-group">
                            <label>Adults (12+ yrs)</label>
                            <input type="number" min="1" max="9" value={adults} onChange={(e) => setAdults(Number(e.target.value))} />
                        </div>
                        <div className="form-group">
                            <label>Children (2-12 yrs)</label>
                            <input type="number" min="0" max="9" value={children} onChange={(e) => setChildren(Number(e.target.value))} />
                        </div>
                        <div className="form-group">
                            <label>Infants (0-2 yrs)</label>
                            <input type="number" min="0" max="9" value={infants} onChange={(e) => setInfants(Number(e.target.value))} />
                        </div>
                    </div>

                    {/* Special Fares */}
                    <div className="form-group">
                        <label>Special Fares (Optional)</label>
                        <div className="special-fares-container">
                            {fares.map(fare => (
                                <span 
                                    key={fare}
                                    className={`special-fare-badge ${specialFare === fare ? 'selected' : ''}`}
                                    onClick={() => setSpecialFare(fare)}
                                >
                                    {fare === 'Armed Forces' && <Shield size={14} style={{ display: 'inline', marginRight: '4px' }} />}
                                    {fare}
                                </span>
                            ))}
                        </div>
                    </div>

                    <button type="submit" className="btn" disabled={loading}>
                        {loading ? 'Searching Flights...' : 'Search Flight'} <ChevronRight size={20} />
                    </button>
                </form>

                {error && <div className="error-card" style={{ marginTop: '24px' }}>{error}</div>}

                {/* Airline Ticket Result */}
                {result && (
                    <div className="result-card">
                        <div className="ticket-header">
                            <span>IndiGo Flight Routing</span>
                            <span>{result.tripType} | {result.specialFare !== 'None' ? result.specialFare : 'Regular Fare'}</span>
                        </div>
                        
                        <div className="ticket-body">
                            <div className="ticket-route">
                                <div className="ticket-city">
                                    <h3>{result.source.substring(0, 3).toUpperCase()}</h3>
                                    <p>{result.source}</p>
                                </div>
                                
                                <div className="ticket-flight-icon">
                                    <span>{result.totalDistance} km</span>
                                    <hr />
                                    <Plane size={24} style={{ marginTop: '-12px', background: 'white', padding: '0 4px' }} />
                                </div>
                                
                                <div className="ticket-city">
                                    <h3>{result.destination.substring(0, 3).toUpperCase()}</h3>
                                    <p>{result.destination}</p>
                                </div>
                            </div>

                            <div className="ticket-details-row">
                                <div className="ticket-detail">
                                    <span>Depart</span>
                                    <span>{new Date(result.departureDate).toLocaleDateString()}</span>
                                </div>
                                {result.tripType === 'Round Trip' && (
                                    <div className="ticket-detail">
                                        <span>Return</span>
                                        <span>{new Date(result.returnDate).toLocaleDateString()}</span>
                                    </div>
                                )}
                                <div className="ticket-detail">
                                    <span>Passengers</span>
                                    <span>{result.passengers.adults + result.passengers.children + result.passengers.infants} Traveler(s)</span>
                                </div>
                            </div>

                            <div style={{ marginBottom: '24px' }}>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Optimal Path</span>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                                    {result.path.map((node, index) => (
                                        <React.Fragment key={index}>
                                            <span style={{ fontWeight: '600' }}>{node}</span>
                                            {index < result.path.length - 1 && <ArrowRight size={16} color="#94a3b8" />}
                                        </React.Fragment>
                                    ))}
                                </div>
                            </div>

                            {fareBreakdown && (
                                <div className="fare-breakdown" style={{ background: '#f5f5f5', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
                                    <h4 style={{ marginBottom: '12px', color: '#001b94', borderBottom: '1px solid #ddd', paddingBottom: '8px' }}>Fare Breakdown ({result.cabinClass})</h4>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '8px' }}>
                                        <span>Base Fare ({adults + children + infants} Passengers)</span>
                                        <span>₹{Math.round(fareBreakdown.baseFare * (adults + children * 0.75 + infants * 0.20)).toLocaleString()}</span>
                                    </div>
                                    {fareBreakdown.surge > 0 && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '8px', color: '#ef4444' }}>
                                            <span>{fareBreakdown.surgeLabel}</span>
                                            <span>+ ₹{Math.round(fareBreakdown.surge * (adults + children * 0.75 + infants * 0.20)).toLocaleString()}</span>
                                        </div>
                                    )}
                                    {fareBreakdown.discount > 0 && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '8px', color: '#10b981' }}>
                                            <span>{fareBreakdown.discountLabel}</span>
                                            <span>- ₹{Math.round(fareBreakdown.discount).toLocaleString()}</span>
                                        </div>
                                    )}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '8px', color: '#64748b' }}>
                                        <span>Taxes & Airport Fees (5%)</span>
                                        <span>₹{Math.round(fareBreakdown.taxes).toLocaleString()}</span>
                                    </div>
                                </div>
                            )}

                            <div className="ticket-price-row">
                                <div>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block' }}>Total Amount</span>
                                    <span className="ticket-price">₹{Math.round(result.price).toLocaleString()}</span>
                                </div>
                                
                                <button 
                                    onClick={handleBookTicket} 
                                    className="btn btn-book btn-success" 
                                    disabled={bookingLoading}
                                >
                                    <CreditCard size={20} style={{ marginRight: '8px' }} />
                                    {bookingLoading ? 'Processing...' : 'Book'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RouteOptimizer;
