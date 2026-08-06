import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Plane } from 'lucide-react';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await login(username, password);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            {/* Realistic Airport Animated Background */}
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

            <div className="glass-panel auth-panel" style={{ zIndex: 10 }}>
                <div className="auth-header">
                    <Plane className="auth-icon" size={48} />
                    <h2>Welcome Back</h2>
                    <p>Log in to access your flight dashboard</p>
                </div>
                
                {error && <div className="error-card">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Username</label>
                        <input 
                            type="text" 
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required 
                            placeholder="Enter your username"
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required 
                            placeholder="Enter your password"
                        />
                        <div style={{ textAlign: 'right', marginTop: '8px' }}>
                            <a href="#" style={{ fontSize: '0.8rem', color: 'var(--indigo-light-blue)', textDecoration: 'none' }}>Forgot Password?</a>
                        </div>
                    </div>
                    <button type="submit" className="btn" disabled={loading}>
                        {loading ? 'Logging in...' : 'Log In'}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>Don't have an account? <Link to="/register">Register here</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Login;
