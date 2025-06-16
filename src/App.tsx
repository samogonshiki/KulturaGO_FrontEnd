import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import StartPage from "./components/StartPage";
import InfoFrame from "./components/InfoFrame";
import RegistrationPage from "./components/Registration";
import WelcomeScreen from "./components/WelcomeScreen";
import HomePage from "./components/HomePage";
import ProfilePage from "./components/ProfilePage";
import MapPage from "./pages/MapPage";
import EventsPage from './pages/EventsPage';
import InDevelopmentPage from './pages/InDevelopmentPage';
import PaymentMethods from './components/PaymentMethods';
import Navbar from "./components/Navbar";
import "./styles/App.scss";

const pageVariants = {
  initial: {
    opacity: 0,
    x: 20,
  },
  animate: {
    opacity: 1,
    x: 0,
  },
  exit: {
    opacity: 0,
    x: -20,
  },
};

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.5,
};

const MotionContainer: React.FC<{ children: React.ReactNode; pathname: string }> = ({ children, pathname }) => (
  <motion.div
    key={pathname}
    initial="initial"
    animate="animate"
    exit="exit"
    variants={pageVariants}
    transition={pageTransition}
    style={{ width: '100%', height: '100%' }}
  >
    {children}
  </motion.div>
);

const AppContent = () => {
  const location = useLocation();
  const [showNavbar, setShowNavbar] = useState(true);
  const [profileImage, setProfileImage] = useState<string>(() => {
    const savedImage = localStorage.getItem('profileImage');
    return savedImage || '/image/profile/default-avatar.jpg';
  });

  useEffect(() => {
    const hideNavbarPaths = ['/', '/info', '/registration', '/welcome', '/payment-methods'];
    setShowNavbar(!hideNavbarPaths.includes(location.pathname));
  }, [location.pathname]);

  const updateProfileImage = (newImage: string) => {
    setProfileImage(newImage);
    localStorage.setItem('profileImage', newImage);
  };

  return (
    <div className={`app ${!showNavbar ? 'no-navbar' : ''}`}>
      <div className={`pages-container ${!showNavbar ? 'no-padding' : ''}`}>
        <AnimatePresence mode="wait">
          <MotionContainer pathname={location.pathname}>
            <Routes location={location}>
              <Route path="/" element={<StartPage />} />
              <Route path="/info" element={<InfoFrame />} />
              <Route path="/registration" element={<RegistrationPage />} />
              <Route path="/welcome" element={<WelcomeScreen />} />
              <Route path="/home-page" element={<HomePage profileImage={profileImage} />} />
              <Route path="/map" element={<MapPage />} />
              <Route path="/events" element={<EventsPage />} />
              <Route path="/online" element={<InDevelopmentPage />} />
              <Route path="/payment-methods" element={<PaymentMethods />} />
              <Route 
                path="/profile" 
                element={
                  <ProfilePage 
                    profileImage={profileImage} 
                    onUpdateImage={updateProfileImage}
                  />
                } 
              />
            </Routes>
          </MotionContainer>
        </AnimatePresence>
      </div>
      {showNavbar && <Navbar />}
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;