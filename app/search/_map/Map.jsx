import { Map, Source, Layer } from "@vis.gl/react-maplibre";
import { middleOfRo } from "@/globals/constants";
import YouAreHere from "@/components/location/YouAreHere";
import { useTheme } from "next-themes";
import { useMemo, useEffect, useRef, useState } from "react";
import axios from "axios";
import polyline from "polyline"; // Import the polyline package

export default function MapDisplay({
  selectedCityArea,
  rounded = [0, 0, 0, 0],
  zIndex,
  noFetch,
  startLocation,
  endLocation,
  waypoints = [],
}) {
  const { theme, resolvedTheme } = useTheme();
  const mapRef = useRef(null);
  const [polygonData, setPolygonData] = useState(null);
  const [routeData, setRouteData] = useState(null); // To store route data

  const mapStyle = useMemo(() => {
    const lightMapStyle = "https://tiles.openfreemap.org/styles/liberty";
    const darkMapStyle = "https://tiles.openfreemap.org/styles/dark";

    return (theme === "system" ? resolvedTheme : theme) === "dark"
      ? darkMapStyle
      : lightMapStyle;
  }, [theme, resolvedTheme]);

  useEffect(() => {
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
    if (startLocation && endLocation) {
      const fetchRoute = async () => {
        try {
          const apiUrl = "/api/directions";

          const response = await axios.post(apiUrl, {
            startLocation,
            endLocation,
            waypoints,
          });

          const routeGeometry = response.data.routes[0].geometry;

          // Decode the polyline into an array of [longitude, latitude] coordinates
          const decodedCoordinates = polyline.decode(routeGeometry);

          setRouteData(decodedCoordinates); // Set the decoded coordinates as routeData
        } catch (error) {
          console.error(
            "Error fetching route:",
            error.response?.data || error.message
          );
        }
      };

      fetchRoute();
    }
  }, [startLocation, endLocation, waypoints]);

  return (
    <Map
      ref={mapRef}
      initialViewState={{
        longitude: middleOfRo[0],
        latitude: middleOfRo[1],
        zoom: 2,
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
              "line-width": 2,
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

      <YouAreHere noFetch={noFetch} />
    </Map>
  );
}
