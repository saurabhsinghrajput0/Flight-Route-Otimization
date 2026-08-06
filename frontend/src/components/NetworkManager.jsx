import React, { useState } from 'react';
import axios from 'axios';
import { Database, Plus, MapPin } from 'lucide-react';

const API_URL = 'http://localhost:5000/api/flights';

const NetworkManager = ({ cities, onDataChanged, onSeed, user }) => {
  const [newCity, setNewCity] = useState('');
  const [routeSource, setRouteSource] = useState('');
  const [routeDest, setRouteDest] = useState('');
  const [routeDist, setRouteDist] = useState('');

  const getConfig = () => ({
      headers: { Authorization: `Bearer ${user?.token}` }
  });

  const handleAddCity = async (e) => {
    e.preventDefault();
    if (!newCity) return;
    try {
      await axios.post(`${API_URL}/cities`, { name: newCity }, getConfig());
      setNewCity('');
      onDataChanged();
    } catch (error) {
      alert('Error adding city: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleAddRoute = async (e) => {
    e.preventDefault();
    if (!routeSource || !routeDest || !routeDist) return;
    try {
      await axios.post(`${API_URL}/routes`, {
        source: routeSource,
        destination: routeDest,
        distance: Number(routeDist)
      }, getConfig());
      setRouteSource('');
      setRouteDest('');
      setRouteDist('');
      onDataChanged();
      alert('Route added successfully!');
    } catch (error) {
      alert('Error adding route: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="glass-panel">
      <h2><Database /> Network Management</h2>
      
      <div style={{ marginBottom: '24px' }}>
        <button type="button" className="btn btn-secondary" onClick={onSeed}>
          Seed Initial Data (Delhi, Mumbai, etc.)
        </button>
      </div>

      <form onSubmit={handleAddCity} className="form-group" style={{ marginBottom: '32px' }}>
        <label>Add New City</label>
        <div style={{ display: 'flex', gap: '12px' }}>
          <input 
            type="text" 
            placeholder="e.g. Bangalore" 
            value={newCity}
            onChange={(e) => setNewCity(e.target.value)}
          />
          <button type="submit" className="btn" style={{ width: 'auto' }}>
            <Plus size={20} /> Add
          </button>
        </div>
      </form>

      <form onSubmit={handleAddRoute}>
        <label>Add New Flight Route</label>
        <div className="form-group">
          <select value={routeSource} onChange={(e) => setRouteSource(e.target.value)}>
            <option value="">Select Source City</option>
            {cities.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
          </select>
        </div>
        <div className="form-group">
          <select value={routeDest} onChange={(e) => setRouteDest(e.target.value)}>
            <option value="">Select Destination City</option>
            {cities.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
          </select>
        </div>
        <div className="form-group">
          <input 
            type="number" 
            placeholder="Distance (km)" 
            value={routeDist}
            onChange={(e) => setRouteDist(e.target.value)}
            min="1"
          />
        </div>
        <button type="submit" className="btn">
          <MapPin size={20} /> Add Route
        </button>
      </form>
    </div>
  );
};

export default NetworkManager;
