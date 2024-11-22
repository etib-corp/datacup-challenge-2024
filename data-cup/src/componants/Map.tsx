import React, { useEffect, useState } from 'react';
import L from 'leaflet';

import { MapContainer, Marker, Popup, TileLayer, GeoJSON } from 'react-leaflet';

import 'leaflet/dist/leaflet.css';

import { getData, convertToGeoJSON } from './_map';

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
                    <Marker key={index} position={[lat, lng]} icon={greenIcon}>
                        <Popup>{feature.geometry.image_name}</Popup>
                    </Marker>
                );
            }
        });
    }
}

export default function Map() {
    const [geoJsonData, setGeoJsonData] = useState<any>(null);
    const markers :any[] = [];

    useEffect(() => {
        const fetchData = async () => {
            const data = await getData();
            console.log(data);
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
            {markers}
        </MapContainer>
    );
}