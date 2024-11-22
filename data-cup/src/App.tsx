import React, { useEffect, useState } from 'react';
import './App.css';
import Map from './componants/Map';
import MapComponent from './componants/openMap';
import { convertToGeoJSON, getData } from './componants/_map';

function createMarkers(geoJsonData: any, markers: any[]) {
  if (geoJsonData) {
      geoJsonData.features.forEach((feature: any, index: number) => {
          if (feature.geometry.type === 'Point') {
              const [lng, lat] = feature.geometry.coordinates;

              markers.push(
                  {
                      index: index,
                      lat: lat,
                      lng: lng,
                      name: feature.geometry.image_name,
                  }
              );
          }
      });
  }
};

function App() {
  const center: [number, number] = [55.5364, -21.1151];

  return (
      <MapComponent center={center} zoom={10} />
  );
}

export default App;

