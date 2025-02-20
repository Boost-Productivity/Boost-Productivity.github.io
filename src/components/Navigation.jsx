import React from 'react';
import { Link } from 'react-router-dom';

export default function Navigation() {
    return (
        <nav className="nav-container">
            <div className="nav-links">
                <Link to="/account" className="nav-button">Account</Link>
                <Link to="/connections" className="nav-button">Connections</Link>
            </div>
        </nav>
    );
} 