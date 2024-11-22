import React, { useRef, useEffect } from 'react';
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

  useEffect(() => {
    if (!mapRef.current) return;

    const vectorSource = new VectorSource();

    const addMarkers = (markers: any) => {
      markers.forEach((marker: any) => {
        const feature = new Feature({
          geometry: new Point(fromLonLat(marker.coordinates)),
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
        vectorSource.addFeature(feature);
      });
    };

    getData().then((data) => {
      if (data) {
        const geojson = convertToGeoJSON(data);
        const updatedMarkers = geojson.features.map((feature: any) => ({
          coordinates: feature.geometry.coordinates,
          iconUrl: "marker.png",
        }));
        addMarkers(updatedMarkers);
      }
    });

    const clusterSource = new Cluster({
      distance: 40,
      source: vectorSource,
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

  return <div ref={mapRef} style={{ height: "100vh" }} />;
};

export default MapComponent;