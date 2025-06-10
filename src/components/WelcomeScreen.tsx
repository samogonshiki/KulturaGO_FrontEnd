import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './WelcomeScreen.scss';

const Logo: React.FC = () => (
  <svg
    className="logo-svg"
    width="200"
    height="200"
    viewBox="0 0 300 300"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      className="logo-path"
      d="M150 227.064C153.216 227.064 155.82 229.668 155.82 232.884C155.82 236.1 153.216 238.704 150 238.704C146.784 238.704 144.18 236.1 144.18 232.884C144.18 229.668 146.784 227.064 150 227.064ZM150 209.064C136.86 209.064 126.18 219.756 126.18 232.884C126.18 246.012 136.872 256.704 150 256.704C163.128 256.704 173.82 246.012 173.82 232.884C173.82 219.756 163.128 209.064 150 209.064Z"
      fill="currentColor"
    />
    <path
      className="logo-path"
      d="M145.608 209.508L130.644 131.616C123.444 94.1641 133.908 50.1001 150 50.1001C108.132 50.1001 80.8918 94.1641 99.6238 131.616L139.596 211.56C141.48 210.624 143.484 209.916 145.608 209.508Z"
      stroke="currentColor"
      strokeWidth="13"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      className="logo-path"
      d="M150 50.1C166.092 50.1 176.556 94.164 169.356 131.616L154.404 209.448C156.54 209.832 158.58 210.504 160.476 211.416L200.376 131.604C219.108 94.152 191.868 50.088 150 50.088V50.1Z"
      stroke="currentColor"
      strokeWidth="13"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const WelcomeScreen: React.FC = () => {
  const navigate = useNavigate();
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, 5000);
    const navigateTimer = setTimeout(() => {
      navigate('/home-page');
    }, 6500);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(navigateTimer);
    };
  }, [navigate]);

  return (
    <div className={`welcome-screen ${isExiting ? 'fade-out' : ''}`}>
      <div className="welcome-content">
        <div className="logo-container">
          <div className="logo">
            <Logo />
          </div>
          <div className="logo-text">
            <span>Kultura</span>
            <span>Go</span>
          </div>
        </div>
        <div className="welcome-message">
          <h1>Добро пожаловать!</h1>
          <p>Мы рады видеть вас в нашем приложении</p>
        </div>
        <div className="loading">
          <div className="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen; 