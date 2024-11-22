import React, { useEffect, useState } from 'react';
import L from 'leaflet';

import { MapContainer, Marker, Popup, TileLayer, GeoJSON } from 'react-leaflet';

import 'leaflet/dist/leaflet.css';

import { getData, convertToGeoJSON } from './_map';

import MarkerClusterGroup from 'react-leaflet-cluster'

var customIcon: L.Icon = L.icon({
    iconUrl: 'marker.png',
    iconSize: [35, 50],
});

function createMarkers(geoJsonData: any, markers: any[]) {
    var greenIcon = L.icon({
        iconUrl: 'marker.png',
        iconSize: [35, 50],
    });

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
}

export default function Map() {
    const [geoJsonData, setGeoJsonData] = useState<any>(null);
    const markers: any[] = [];

    useEffect(() => {
        const fetchData = async () => {
            const data = await getData();
            const geoJson = convertToGeoJSON(data);
            if (data) {
                setGeoJsonData(geoJson);
            }
        };
        fetchData();
    }, []);

    createMarkers(geoJsonData, markers);

    return (
        <MapContainer center={[-21.1151, 55.5364]} style={{ height: "100vh" }} zoom={10} scrollWheelZoom={true}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {geoJsonData && <GeoJSON data={geoJsonData} />}
            {markers.length > 0 && <MarkerClusterGroup chunkedLoading>
                {markers.map((marker) => (
                    console.log(marker),
                    <Marker key={marker.index} position={[marker.lat, marker.lng]} icon={customIcon}>
                        <Popup>
                            <span>{marker.name}</span>
                        </Popup>
                    </Marker>
                ))}
            </MarkerClusterGroup>}
        </MapContainer>
    );
}