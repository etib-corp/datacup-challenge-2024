import React, { useEffect, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapContainer, Marker, Popup, TileLayer, GeoJSON } from 'react-leaflet';

export default function Map() {

    let offset: string = "100";
    let apiUrl = 'https://data.tco.re/api/explore/v2.1/catalog/datasets/signalements_depots_sauvages_citoyennes_10_2024/records?limit=100&offset=' + offset;

    const getData = async () => {
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            while (data.results.length === 100) {
                offset = (parseInt(offset) + 100).toString();
                apiUrl = 'https://data.tco.re/api/explore/v2.1/catalog/datasets/signalements_depots_sauvages_citoyennes_10_2024/records?limit=100&offset=' + offset;
                const response = await fetch(apiUrl);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const newData = await response.json();
                data.results = data.results.concat(newData.results);
            };
            return data;
        } catch (error) {
            console.error('Error fetching data:', error);
            return null;
        }
    };

    const convertToGeoJSON = (data: any) => {
        console.log('Data:', data);
        return {
            type: "FeatureCollection",
            features: data.results.map((item: any) => {
                return {
                    type: "Feature",
                    geometry: {
                        type: "Point",
                        coordinates: [item.geom.lon, item.geom.lat],
                        image_name: item.image_name,
                    },
                };
            })
        };
    };

    const [geoJsonData, setGeoJsonData] = useState<any>(null);

    useEffect(() => {
        const fetchData = async () => {
            const data = await getData();
            if (data) {
                const geoJson = convertToGeoJSON(data);
                setGeoJsonData(geoJson);
                console.log('Data set:', geoJson);
            }
        };
        fetchData();
    }, []);

    var greenIcon = L.icon({
        iconUrl: 'marker.png',
        iconSize: [35, 50],
    });

    const markers :any[] = [];

    if (geoJsonData) {
        geoJsonData.features.forEach((feature: any, index: number) => {
            if (feature.geometry.type === 'Point') {
                console.log('Feature:');
                const [lng, lat] = feature.geometry.coordinates;
                markers.push(
                    <Marker key={index} position={[lat, lng]} icon={greenIcon}>
                        <Popup>{feature.geometry.image_name}</Popup>
                    </Marker>
                );
            }
        });
    }

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