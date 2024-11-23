import React, { useRef, useEffect, useState } from 'react';

import { Style, Icon, Text, Fill, Stroke, Circle as CircleStyle } from 'ol/style';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource, Cluster, OSM } from 'ol/source';
import { Map, View, Feature, Overlay } from 'ol';
import { fromLonLat } from 'ol/proj';
import { Point } from 'ol/geom';

import { convertToGeoJSON, getData } from './_map';

interface MapProps {
  center: [number, number];
  zoom: number;
}

const MapComponent: React.FC<MapProps> = ({ center, zoom }) => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ type: '', keyword: '' });
  const [vectorSource, setVectorSource] = useState<VectorSource | null>(null);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [displayPopup, setDisplayPopup] = useState(false);

  useEffect(() => {
    if (!mapRef.current) return;

    const source = new VectorSource();
    setVectorSource(source);

    const addMarkers = (markers: any) => {
      markers.forEach((marker: any) => {
        const feature = new Feature({
          geometry: new Point(fromLonLat(marker.coordinates)),
          properties: marker.properties,
        });
        if (marker.iconUrl) {
          feature.setStyle(
            new Style({
              image: new Icon({
                src: marker.iconUrl,
                scale: 0.1,
              }),
            })
          );
        }
        feature.addEventListener('click', function () {
          console.log('Feature clicked:', feature.get('properties'));
          setDisplayPopup(true);
        });
        source.addFeature(feature);
      });
    };

    getData()
      .then((data) => {
        if (data) {
          const geojson = convertToGeoJSON(data);
          const updatedMarkers = geojson.features.map((feature: any) => ({
            coordinates: feature.geometry.coordinates,
            properties: feature.properties,
            iconUrl: "marker.png",
          }));
          addMarkers(updatedMarkers);
        }
      })
      .finally(() => setLoading(false));

    const clusterSource = new Cluster({
      distance: 40,
      source: source,
    });

    const clusterLayer = new VectorLayer({
      source: clusterSource,
      style: (feature) => {
        const size = feature.get('features').length;
        let style;
        if (size > 1) {
          style = new Style({
            image: new CircleStyle({
              radius: 10,
              stroke: new Stroke({
                color: '#fff',
              }),
              fill: new Fill({
                color: '#3399CC',
              }),
            }),
            text: new Text({
              text: size.toString(),
              fill: new Fill({
                color: '#fff',
              }),
            }),
          });
        } else {
          const originalFeature = feature.get('features')[0];
          style = originalFeature.getStyle();
        }
        return style;
      },
    });

    const map = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
        clusterLayer,
      ],
      view: new View({
        center: fromLonLat(center),
        zoom: zoom,
      }),
      overlays: [],
    });

    var container = document.getElementById("popup") || document.createElement("div");
    var content = document.getElementById("popup-content") || document.createElement("div");
    var overlay = new Overlay({
      element: container,
      autoPan: true
    });

    map.on('click', function (e) {
      var pixel = map.getEventPixel(e.originalEvent);
      map.forEachFeatureAtPixel(pixel, function (feature) {
        var coodinate = e.coordinate;
        var name = feature.get('name');
        var time = feature.get('time');
        content.innerHTML =
          '<p>Name:' + name + '</p>' +
          '<p>Time:' + time + '</p>' +
          '<p>Coordinate:' + coodinate + '</p>';
        overlay.setPosition(coodinate);
        map.addOverlay(overlay);
      });
    });

    return () => map.setTarget(undefined);
  }, [center, zoom]);


  const applyFilters = () => {
    if (vectorSource) {
      const features = vectorSource.getFeatures();
      features.forEach((feature) => {
        const properties = feature.get('properties');
        const matchesType =
          !filters.type || properties.type === filters.type;
        const matchesKeyword =
          !filters.keyword || properties.name.includes(filters.keyword);

        if (matchesType && matchesKeyword) {
          feature.setStyle(
            new Style({
              image: new Icon({
                src: 'marker.png',
                scale: 0.1,
              }),
            })
          );
        } else {
          feature.setStyle(undefined);
        }
      });
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setUploadedImage(event.target.files[0]);
      console.log('Image uploaded:', event.target.files[0]);
    }
  };

  const sendImage = () => {
    if (uploadedImage) {
      const reader = new FileReader();

      reader.readAsDataURL(uploadedImage);

      reader.onload = () => {
        if (reader.result && typeof reader.result === 'string') {
          const base64String = reader.result.split(',')[1];
          console.log(base64String);
        } else {
          console.error("Erreur : Le résultat de la lecture n'est pas une chaîne.");
        }
      };
      reader.onerror = () => {
        console.error('Erreur lors de la lecture du fichier.');
      };
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div style={{ width: '300px', padding: '10px', background: '#f7f7f7', borderRight: '1px solid #ddd' }}>
        <h3>Filtres</h3>
        <div style={{ marginBottom: '10px' }}>
          <label>Type : </label>
          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
          >
            <option value="">Tous</option>
            <option value="restaurant">Restaurant</option>
            <option value="park">Parc</option>
            <option value="shop">Magasin</option>
          </select>
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Mot-clé : </label>
          <input
            type="text"
            value={filters.keyword}
            onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
            placeholder="Rechercher..."
          />
        </div>
        <button onClick={applyFilters} style={{ padding: '10px 20px', background: '#007BFF', color: '#fff', border: 'none', borderRadius: '4px' }}>
          Appliquer
        </button>
        <div style={{ marginBottom: '10px', marginTop: '10px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Importer une image :</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={{
              display: 'block',
              padding: '10px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              backgroundColor: '#f9f9f9',
              cursor: 'pointer',
              transition: 'background-color 0.3s ease',
              fontSize: '14px',
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#eaeaea')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#f9f9f9')}
          />
        </div>
        <button onClick={sendImage} style={{ padding: '10px 20px', background: '#007BFF', color: '#fff', border: 'none', borderRadius: '4px' }}> Publier </button>
      </div>

      <div style={{ flex: 1, position: 'relative' }}>
        {loading && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              zIndex: 1000,
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                border: '4px solid rgba(0, 0, 0, 0.2)',
                borderTop: '4px solid #000',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
              }}
            ></div>
          </div>
        )}
        <div ref={mapRef} style={{ height: '100vh', visibility: loading ? 'hidden' : 'visible' }} />
        {displayPopup && (
          <div
            id="popup"
            style={{
              position: 'absolute',
              backgroundColor: 'white',
              padding: '10px',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
              borderRadius: '4px',
              zIndex: 1000,
            }}
          >
            <div id="popup-content">
              <p>Popup content</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const spinnerStyle: React.CSSProperties = {
  width: "40px",
  height: "40px",
  border: "4px solid rgba(0, 0, 0, 0.2)",
  borderTop: "4px solid #000",
  borderRadius: "50%",
  animation: "spin 1s linear infinite",
};

const spinnerKeyframes = `
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
`;

const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = spinnerKeyframes;
document.head.appendChild(styleSheet);

export default MapComponent;
