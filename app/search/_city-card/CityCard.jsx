"use client";

import React, { useState, useEffect } from "react";
import { FaXmark } from "react-icons/fa6";
import { MdOutlineDirections } from "react-icons/md";
import { MdOutlineDirectionsOff } from "react-icons/md";
import TransitionLink from "@/components/utils/TransitionLink";
import { Button } from "@/components/ui/button";
import Weather from "@/components/weather/Weather";
import { getWeatherData } from "@/lib/getWeather";

const CityCard = ({ selectedCity, onClose, endRoute, onRoute, setOnRoute }) => {
  const [weatherData, setWeatherData] = useState(null);

  useEffect(() => {
    const fetchWeatherData = async () => {
      if (!selectedCity) return null;
      const weather = await getWeatherData(selectedCity);
      setWeatherData(weather);
    };
    fetchWeatherData();
  }, [selectedCity]);

  return (
    <div className="w-full md:px-4">
      <TransitionLink
        href={`/cities/${selectedCity.properties.name}`}
        className="w-full h-fit p-4 border md:rounded-2xl shadow-inner mb-2 flex flex-col justify-between bg-dynamic bg-dynamic-h backdrop-blur-md md:backdrop-blur-none hover:shadow-md active:brightness-125 transition-all"
      >
        <div>
          <div className="w-full flex justify-end">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClose();
                setOnRoute({ routeStatus: false, from: [], to: [] });
              }}
              className="opacity-60 hover:opacity-100"
              aria-label="Close city card"
            >
              <FaXmark size={16} />
            </button>
          </div>
          <div className="flex justify-between">
            <div className="flex flex-col justify-center">
              <span className="text-2xl font-semibold">
                {selectedCity.properties.name}
              </span>
              <p className="text-sm opacity-50">
                {selectedCity.properties.country},{" "}
                {selectedCity.properties.countrycode}
              </p>
            </div>

            <div className="mt-auto">
              {weatherData !== null ? (
                <Weather weatherData={weatherData} tiny={true} />
              ) : (
                <p className="text-sm opacity-50">Loading weather...</p>
              )}
            </div>
          </div>
          <div className="">
            {!onRoute.routeStatus ? (
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setOnRoute({
                    routeStatus: true,
                    from: [],
                    to: selectedCity.geometry.coordinates,
                  });
                }}
                className="mt-4 rounded-3xl z-30"
              >
                <MdOutlineDirections size={24} />
                <span>Directions</span>
              </Button>
            ) : (
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  endRoute();
                }}
                className="mt-4 rounded-3xl z-30"
              >
                <MdOutlineDirectionsOff /> Stop drive
              </Button>
            )}
          </div>
        </div>
      </TransitionLink>
    </div>
  );
};

export default CityCard;
