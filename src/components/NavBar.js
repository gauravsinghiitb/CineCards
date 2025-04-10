// src/components/NavBar.js
import React from 'react';
import { Link } from 'react-router-dom';
import './NavBar.css';

function NavBar() {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link className="navbar-brand" to="/">CineCards</Link>
        <ul className="navbar-menu">
          <li className="navbar-item">
            <Link to="/">Movies & TV Shows</Link>
          </li>
          <li className="navbar-item">
            <Link to="/songs">Songs</Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default NavBar;
