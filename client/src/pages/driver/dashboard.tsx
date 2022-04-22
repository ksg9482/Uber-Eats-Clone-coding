import React, { useEffect, useState } from "react";
import GoogleMapReact from "google-map-react";

interface ICoords {
    lat: number;
    lng: number;
};

export const DashBoard = () => {
    const [driverCoords, setDriverCoords] = useState<ICoords>({ lng: 0, lat: 0 });
    const [map, setMap] = useState<any>();
    const [maps, setMaps] = useState<any>();

    const onSucces = ({ coords: { latitude, longitude } }: GeolocationPosition) => {
        setDriverCoords({ lat: latitude, lng: longitude })
    };
    const onError = (error: GeolocationPositionError) => {
        console.log(error);
    };
    useEffect(() => {
        navigator.geolocation.watchPosition(onSucces, onError, {
            enableHighAccuracy: true
        });
    }, []);
    useEffect(() => {
        if (map && maps) {
            map.panTo(new maps.LatLng(driverCoords.lat, driverCoords.lng));
        } //gps값 변하면 자동으로 상태 갱신
    }, [driverCoords.lat, driverCoords.lng]);

    const onApiLoaded = ({ map, maps }: { map: any; maps: any }) => {
        map.panTo(new maps.LatLng(driverCoords.lat, driverCoords.lng));
        setMap(map);
        setMaps(maps);
    };
    //map은 내가있는 지도정보, maps는 google maps의 객체
    return (
        <div>
            <div
                className="overflow-hidden"
                style={{ width: window.innerWidth, height: "50vh" }}
            >
                <GoogleMapReact
                    yesIWantToUseGoogleMapApiInternals
                    onGoogleApiLoaded={onApiLoaded}
                    defaultZoom={16}
                    draggable={false}
                    defaultCenter={{
                        lat: 36.58,
                        lng: 125.95
                    }}
                    bootstrapURLKeys={{ key: "임시보안" }}
                >
                    <div
                        // @ts-ignore
                        lat={driverCoords.lat}
                        lng={driverCoords.lng}
                        className="text-lg"
                    >
                        🚖
                    </div>
                </GoogleMapReact>
            </div>
        </div>
    );
};