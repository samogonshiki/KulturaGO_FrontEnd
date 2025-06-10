import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaHome, FaMap, FaVideo, FaCalendar, FaUser } from 'react-icons/fa';
import { IconType } from 'react-icons';
import './Navbar.scss';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const HomeIcon = FaHome as IconType;
  const MapIcon = FaMap as IconType;
  const VideoIcon = FaVideo as IconType;
  const CalendarIcon = FaCalendar as IconType;
  const UserIcon = FaUser as IconType;

  return (
    <nav className="navbar">
      <div className="nav-container">
        <button 
          className={`nav-item ${location.pathname === '/home-page' ? 'active' : ''}`}
          onClick={() => navigate('/home-page')}
        >
           {/* @ts-ignore */}
          <HomeIcon />
        </button>
        <button 
          className={`nav-item ${location.pathname === '/map' ? 'active' : ''}`}
          onClick={() => navigate('/map')}
        >
           {/* @ts-ignore */}
          <MapIcon />
        </button>
        <button 
          className={`nav-item in-development ${location.pathname === '/online' ? 'active' : ''}`}
          onClick={() => navigate('/online')}
        >
           {/* @ts-ignore */}
          <VideoIcon />
        </button>
        <button 
          className={`nav-item ${location.pathname === '/events' ? 'active' : ''}`}
          onClick={() => navigate('/events')}
        >
           {/* @ts-ignore */}
          <CalendarIcon />
        </button>
        <button 
          className={`nav-item ${location.pathname === '/profile' ? 'active' : ''}`}
          onClick={() => navigate('/profile')}
        >
           {/* @ts-ignore */}
          <UserIcon />
        </button>
      </div>
    </nav>
  );
};

export default Navbar; 