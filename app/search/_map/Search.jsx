"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { IoMdSearch } from "react-icons/io";
import MapDisplay from "./Map";
import CityCard from "../_city-card/CityCard";

const Search = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedCityArea, setSelectedCityArea] = useState(null);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query) {
        fetchLocations(query);
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const fetchLocations = async (searchQuery) => {
    try {
      const response = await fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(searchQuery)}`
      );
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      setResults(data.features || []);
    } catch (error) {
      console.error("Failed to fetch locations:", error);
    }
  };

  const handleCitySelect = async (city) => {
    setSelectedCity(city);
    console.log(city);

    const area = city.properties.extent;
    setSelectedCityArea(area);
    setQuery("");
    setResults([]);
  };

  return (
    <>
      <MapDisplay selectedCityArea={selectedCityArea} />

      <div className="absolute w-full h-auto md:block md:p-4 md:w-80 z-20">
        <div className="backdrop-blur-md m-auto border-b border-white/20 md:border md:rounded-2xl shadow-md">
          <div className="p-4 flex flex-col justify-end items-center">
            <div className="relative w-full ">
              <IoMdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10" />
              <Input
                type="text"
                id="search"
                placeholder="Search cities..."
                className="bg-dynamic rounded-xl pl-10"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            <div className={`mt-4 w-full ${query ? "" : "hidden"}`}>
              {results.length > 0 ? (
                <ul className="bg-dynamic rounded-lg shadow-md max-h-60 overflow-y-auto">
                  {results.map((result, index) => (
                    <li
                      key={result.properties.osm_id + index}
                      className="p-2 cursor-pointer hover:bg-gray-500/10 "
                      onClick={() => handleCitySelect(result)}
                    >
                      {result.properties.name} - {result.properties.country}
                    </li>
                  ))}
                </ul>
              ) : query ? (
                <p className="text-gray-500 text-sm">No results found</p>
              ) : null}
            </div>
          </div>
        </div>

        {selectedCity && <CityCard selectedCity={selectedCity} />}
      </div>
    </>
  );
};

export default Search;
