import React from "react";
import { Link } from "react-router-dom";
import "./Header.css";

function Header({ isLoggedIn, onLogout }) {
  return (
    <header className="header">
      <div className="logo">
        <Link to="/">Content-Based Trend Identifier</Link>
      </div>
      <nav className="nav">
        {isLoggedIn ? (
          <button onClick={onLogout} className="logout-button">
            Logout
          </button>
        ) : (
          <div className="auth-buttons">
            <Link to="/login" className="login-link">
              Login
            </Link>
            <Link to="/signup" className="signup-link">
              Sign Up
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}

export default Header;
