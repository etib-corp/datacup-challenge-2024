import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';

export default function Map() {

    var greenIcon = L.icon({
        iconUrl: 'marker.png',
        iconSize:     [38, 95],
        iconAnchor:   [22, 94],
        popupAnchor:  [-3, -76]
    });

    return (
        <MapContainer center={[-21.1151, 55.5364]} style={{ height: "100vh" }} zoom={13} scrollWheelZoom={true}>
            <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker icon={greenIcon} position={[-21.1151, 55.5364]}>
                <Popup>
                    A pretty CSS3 popup. <br /> Easily customizable.
                </Popup>
            </Marker>
        </MapContainer>
    );
}