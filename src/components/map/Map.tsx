"use client";

import { Map, Source, Layer } from "@vis.gl/react-maplibre";
import mapboxgl from "mapbox-gl"; // Import mapbox-gl for advanced features
import { middleOfRo } from "@/globals/constants";
import YouAreHere from "../you-are-here/YouAreHere";
import { useTheme } from "next-themes";
import { useMemo, useEffect, useRef, useState } from "react";
import axios from "axios";
import polyline from "polyline";
import { Marker } from "@vis.gl/react-maplibre";
import { FaLocationDot } from "react-icons/fa6";

export type Location = {
  lon: Number;
  lat: number;
};

type MapDisplayProps = {
  selectedCityArea?: number[];
  rounded?: [string, string, string, string] | string;
  zIndex?: number;
  noFetch?: boolean;
  advancedView?: boolean; // Prop for enabling advanced features
  onRoute?: {
    routeStatus: boolean;
    route: {
      from: Location;
      to: Location;
    };
  };
};

export default function MapDisplay({
  selectedCityArea,
  rounded = ["0px", "0px", "0px", "0px"],
  zIndex,
  noFetch,
  advancedView = false,
  onRoute,
}: MapDisplayProps) {
  const { theme, resolvedTheme } = useTheme();
  const mapRef = useRef<any>(null);
  const [location, setLocation] = useState<Location | null>(null);
  const [polygonData, setPolygonData] = useState<any | null>(null);
  const [routeData, setRouteData] = useState<Array<[number, number]> | null>(
    null
  );

  const mapStyle = useMemo(() => {
    const lightMapStyle = "https://tiles.openfreemap.org/styles/liberty";
    const darkMapStyle = "/map/dark-map.json";

    return (theme === "system" ? resolvedTheme : theme) === "dark"
      ? darkMapStyle
      : lightMapStyle;
  }, [theme, resolvedTheme]);

  useEffect(() => {
    if (!selectedCityArea) return;
    if (mapRef.current && selectedCityArea) {
      const [minLon, minLat, maxLon, maxLat] = selectedCityArea;
      const polygon = [
        [
          [minLon, minLat],
          [maxLon, minLat],
          [maxLon, maxLat],
          [minLon, maxLat],
          [minLon, minLat],
        ],
      ];
      setPolygonData(polygon);

      const bounds = [minLon - 0.1, minLat - 0.1, maxLon + 0.1, maxLat + 0.1];

      mapRef.current.fitBounds(bounds, {
        padding: { top: 50, bottom: 50, left: 50, right: 50 },
        duration: 1000,
      });
    }
  }, [selectedCityArea]);

  useEffect(() => {
    if (advancedView && location && mapRef.current) {
      const map = mapRef.current.getMap();

      // Perform zoom-in and centering with pitch and initial bearing
      map.flyTo({
        center: [location.lon, location.lat],
        zoom: 18, // Very close zoom
        pitch: 60, // Add pitch for a 3D perspective
        bearing: 0, // Start with no rotation
        duration: 2000, // Smooth animation
      });

      let animationFrameId: number; // To store the ID for cleanup
      let startTime: number | null = null; // For smooth rotation timing

      const startContinuousRotation = () => {
        const rotateMap = (timestamp: number) => {
          if (!startTime) startTime = timestamp;
          const elapsed = timestamp - startTime;

          // Rotate at 10 degrees per second (adjust for desired speed)
          const newBearing = map.getBearing() + 2 * (elapsed / 1000);
          map.setBearing(newBearing % 360); // Keep bearing within 0-360 degrees

          startTime = timestamp; // Reset the start time for the next frame
          animationFrameId = requestAnimationFrame(rotateMap); // Request the next frame
        };

        animationFrameId = requestAnimationFrame(rotateMap); // Start the animation loop
      };

      // Start rotation after the zoom-in animation completes
      const handleMoveEnd = () => {
        map.off("moveend", handleMoveEnd); // Remove the listener
        startContinuousRotation(); // Start the rotation
      };

      map.on("moveend", handleMoveEnd); // Attach the listener

      // Cleanup the animation when component unmounts
      return () => {
        map.off("moveend", handleMoveEnd);
        if (animationFrameId) cancelAnimationFrame(animationFrameId); // Cancel the animation loop
      };
    }
  }, [advancedView, location]);

  useEffect(() => {
    const fetchRoute = async () => {
      if (!onRoute) return;
      if (onRoute.routeStatus === false) return setRouteData([]);

      const startLocation = onRoute?.route?.from;
      const endLocation = onRoute?.route?.to;

      if (!endLocation) {
        return console.log("No endpoint location");
      }

      const start =
        startLocation && startLocation.lon && startLocation.lat
          ? startLocation
          : location;

      if (!start || !start.lon || !start.lat) {
        return console.log("No valid start location available.");
      }

      try {
        const apiUrl = "/api/directions";

        const response = await axios.post(apiUrl, {
          startLocation: start,
          endLocation,
        });

        const routeGeometry = response.data.routes[0].geometry;
        const decodedCoordinates = polyline.decode(routeGeometry);

        setRouteData(decodedCoordinates);
      } catch (error) {
        console.error(
          "Error fetching route:",
          error.response?.data || error.message
        );
      }
    };

    fetchRoute();
  }, [onRoute, location]);

  useEffect(() => {
    if (!routeData || routeData.length === 0 || !mapRef.current) return;

    const { minLng, minLat, maxLng, maxLat } = calculateBoundingBox(routeData);
    mapRef.current.fitBounds(
      [
        [minLng, minLat],
        [maxLng, maxLat],
      ],
      { padding: 50 }
    );
  }, [routeData]);

  const calculateBoundingBox = (coordinates) => {
    let minLng = Infinity,
      minLat = Infinity,
      maxLng = -Infinity,
      maxLat = -Infinity;
    coordinates.forEach(([lat, lng]) => {
      if (lng < minLng) minLng = lng;
      if (lng > maxLng) maxLng = lng;
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
    });
    return { minLng, minLat, maxLng, maxLat };
  };

  return (
    <Map
      ref={mapRef}
      antialias={advancedView}
      touchInteraction={advancedView ? "none" : "on"}
      clickInteraction={advancedView ? "none" : "on"}
      initialViewState={{
        longitude: middleOfRo[0],
        latitude: middleOfRo[1],
        zoom: advancedView ? 8 : 2, // Higher zoom for advanced view
        pitch: advancedView ? 60 : 0, // Add pitch for a 3D view
        bearing: advancedView ? 0 : 0, // Initial bearing for camera rotation
      }}
      style={{
        borderTopLeftRadius: rounded[0],
        borderBottomLeftRadius: rounded[1],
        borderBottomRightRadius: rounded[1],
        borderTopRightRadius: rounded[0],
        zIndex: zIndex,
      }}
      mapStyle={mapStyle}
    >
      {polygonData && (
        <Source
          id="highlight-area"
          type="geojson"
          data={{
            type: "FeatureCollection",
            features: [
              {
                type: "Feature",
                geometry: { type: "Polygon", coordinates: polygonData },
              },
            ],
          }}
        >
          <Layer
            id="highlight-area-outline"
            type="line"
            paint={{
              "line-color": "#7c7c7c",
              "line-width": 1,
              "line-dasharray": [2, 4],
              "line-opacity": 0.4,
            }}
          />
        </Source>
      )}

      {routeData && (
        <Source
          id="route-line"
          type="geojson"
          data={{
            type: "FeatureCollection",
            features: [
              {
                type: "Feature",
                geometry: {
                  type: "LineString",
                  coordinates: routeData.map((coord) => [coord[1], coord[0]]),
                },
              },
            ],
          }}
        >
          <Layer
            id="route-line-layer"
            type="line"
            paint={{
              "line-color": "#007bff",
              "line-width": 4,
              "line-opacity": 0.8,
            }}
          />
        </Source>
      )}

      {routeData && routeData.length > 0 && (
        <>
          <Marker
            longitude={routeData[routeData.length - 1][1]}
            latitude={routeData[routeData.length - 1][0]}
          >
            <div className="flex flex-col justify-center items-center mb-10">
              <FaLocationDot className="h-8 w-8 text-red-500 translate-y-2" />
              <div className="h-4 w-4 bg-slate-50 rounded-full border-2 border-gray-400"></div>
            </div>
          </Marker>
        </>
      )}

      <YouAreHere
        noFetch={noFetch}
        setLocation={setLocation}
        advancedView={advancedView}
      />
    </Map>
  );
}
