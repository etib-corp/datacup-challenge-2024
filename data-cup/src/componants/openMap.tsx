import React, { useRef, useEffect, useState } from 'react';
import { Map, View } from 'ol';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { OSM } from 'ol/source';
import { fromLonLat } from 'ol/proj';
import { Vector as VectorSource, Cluster } from 'ol/source';
import { Feature } from 'ol';
import { Point } from 'ol/geom';
import { Style, Icon, Text, Fill, Stroke, Circle as CircleStyle } from 'ol/style';
import { convertToGeoJSON, getData } from './_map';

interface MapProps {
  center: [number, number];
  zoom: number;
}

const MapComponent: React.FC<MapProps> = ({ center, zoom }) => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ type: '', keyword: '' }); // État pour les filtres
  const [vectorSource, setVectorSource] = useState<VectorSource | null>(null);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    const source = new VectorSource();
    setVectorSource(source); // Stocker la source vectorielle dans l'état

    const addMarkers = (markers: any) => {
      markers.forEach((marker: any) => {
        const feature = new Feature({
          geometry: new Point(fromLonLat(marker.coordinates)),
          properties: marker.properties, // Ajouter des propriétés pour le filtrage
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
        source.addFeature(feature);
      });
    };

    getData()
      .then((data) => {
        if (data) {
          const geojson = convertToGeoJSON(data);
          const updatedMarkers = geojson.features.map((feature: any) => ({
            coordinates: feature.geometry.coordinates,
            properties: feature.properties, // Propriétés pour le filtrage
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
    });

    return () => map.setTarget(undefined);
  }, [center, zoom]);

  // Fonction pour appliquer les filtres
  const applyFilters = () => {
    if (vectorSource) {
      const features = vectorSource.getFeatures();
      features.forEach((feature) => {
        const properties = feature.get('properties');
        const matchesType =
          !filters.type || properties.type === filters.type;
        const matchesKeyword =
          !filters.keyword || properties.name.includes(filters.keyword);

        // Appliquer ou retirer le style basé sur les filtres
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
          feature.setStyle(undefined); // Masquer les marqueurs qui ne correspondent pas
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
        <div style={{ marginBottom: '10px' }}>
          <label>Importer une image :</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={{ display: 'block', marginTop: '5px' }}
          />
        </div>
        <button onClick={sendImage}> Send </button>
        <button onClick={applyFilters} style={{ padding: '10px 20px', background: '#007BFF', color: '#fff', border: 'none', borderRadius: '4px' }}>
          Appliquer
        </button>
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
      </div>
    </div>
  );
};

const spinnerStyle: React.CSSProperties = {
  width: "40px",
  height: "40px",
  border: "4px solid rgba(0, 0, 0, 0.2)", // Couleur de fond
  borderTop: "4px solid #000", // Couleur principale
  borderRadius: "50%",
  animation: "spin 1s linear infinite",
};

// Animation CSS
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

// Injecter les styles dans le DOM
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = spinnerKeyframes;
document.head.appendChild(styleSheet);

export default MapComponent;
