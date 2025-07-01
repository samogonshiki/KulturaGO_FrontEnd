import React from 'react';
import Map3D from '../components/Map3D';
import './scss/MapPage.scss';

const MapPage: React.FC = () => {
  const apiKey = process.env.REACT_APP_MAP_API_KEY || 'API ADD';//TODO: ADD API

  return (
    <div className="map-page">
      <Map3D apiKey={apiKey} />
    </div>
  );
};

export default MapPage; 