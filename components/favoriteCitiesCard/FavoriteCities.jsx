"use client";

import React, { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { getFavoriteCities } from "@/lib/getFavoriteCities";
import TransitionLink from "../utils/TransitionLink";
import Image from "next/image";

const FavoriteCities = () => {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCities = async () => {
      const citiesData = await getFavoriteCities();

      if (!citiesData) {
        console.log("Error fetching data");
        return [];
      }

      setCities(citiesData.data);
      setLoading(false);
    };

    fetchCities();
  }, []);

  const citiesWithImages = cities.filter((city) => city.image);
  const citiesWithoutImages = cities.filter((city) => !city.image);

  return (
    <>
      {loading ? (
        <div className="flex gap-4 mb-2 w-full bg-dynamic lg:p-8 border rounded-[3rem]  m-auto min-h-96 pointer-events-none opacity-50 p-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              className="flex flex-col justify-center w-fit h-fit border rounded-[3rem] bg-dynamic bg-dynamic-h h transition-all m-auto p-4"
              key={index}
            >
              <div className="w-80 h-96 border relative rounded-[2rem] bg-gray-500/20"></div>
              <div className="flex flex-col justify-center h-24">
                <div className="text-lg font-semibold mb-2">
                  <Skeleton className="h-5 w-[140px]" />
                </div>
                <div className="text-sm opacity-50 mb-2">
                  <Skeleton className="h-4 w-[110px]" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : cities.length > 0 ? (
        <div className="">
          <div className="lg:flex flex-col items-center justify-center xl:max-w-screen-lg text-center mb-8 mx-auto hidden ">
            <h2 className="text-6xl font-bold mb-4 relative font-serif">
              View your saved destinations!
            </h2>
            <p className="text-xl font-light opacity-80 max-w-2xl">
              The &quot;Favorite Cities&quot; feature allows you to save cities
              you love or wish to visit. You can create your personal list,
              making it easier to keep track of the cities that interest you the
              most.
            </p>
          </div>

          <div className="flex gap-8 overflow-x-scroll">
            <div className="flex gap-4 overflow-x-auto p-4 w-full max-w-screen-3xl">
              {citiesWithImages.map((city, index) => (
                <div key={index}>
                  <TransitionLink href={`/cities/${city.name}`} className="">
                    <div className="p-4 border rounded-[3rem] shadow-inner flex flex-col justify-between bg-dynamic bg-dynamic-h hover:shadow-md active:shadow-lg transition-all group">
                      <div className="relative w-80 h-96 border rounded-[2rem] overflow-hidden">
                        <div className="relative w-full h-full">
                          <Image
                            src={city.image}
                            alt={`${city.name} image`}
                            layout="fill"
                            objectFit="cover"
                            className="rounded-[2rem] group-hover:brightness-110 group-hover:scale-105 transition-all"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col justify-center pl-2 h-24">
                        <h3 className="text-2xl font-semibold">{city.name}</h3>
                        <p className="text-sm opacity-50">
                          {city.country}, {city.countrycode}
                        </p>
                      </div>
                    </div>
                  </TransitionLink>
                </div>
              ))}
              {citiesWithoutImages.length > 0 && (
                <div className="grid grid-cols-2 auto-cols-fr auto-rows-1fr gap-2 min-w-96 max-h-[514px] overflow-y-auto pr-4 ">
                  {citiesWithoutImages.map((city, index) => (
                    <div key={index}>
                      <TransitionLink
                        href={`/cities/${city.name}`}
                        className="h-fit"
                      >
                        <div className="flex flex-col justify-center h-[253px] w-full p-4 border rounded-[3rem] shadow-inner hover:shadow-md active:shadow-lg bg-dynamic bg-dynamic-h transition-all text-center m-auto">
                          <h3 className="text-xl font-semibold">{city.name}</h3>
                          <p className="text-sm opacity-50">
                            {city.country}, {city.countrycode}
                          </p>
                        </div>
                      </TransitionLink>
                    </div>
                  ))}
                </div>
              )}
              {cities.length > 0 && citiesWithImages.length < 4 && (
                <div className="flex justify-center items-center bg-dynamic h-[515px] min-w-[200px] w-auto flex-grow p-4 border rounded-[3rem]  transition-all">
                  <p className="text-center font-semibold text-lg">
                    Great! You can add more!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex justify-center items-center bg-dynamic max-h-[512px] max-w-screen-lg w-full mx-auto flex-grow lg:p-8 border rounded-[4rem] relative overflow-hidden">
          <div className="mb-8 max-w-md hidden lg:block">
            <h2 className="text-6xl font-bold mb-4 relative font-serif">
              Explore Your Favorite Cities!
            </h2>
            <p className="text-2xl font-light opacity-80 ">
              Keep track of the places you love or dream of visiting with our
              &quot;Favorite Cities&quot; feature. Create a personalized list of
              destinations and easily revisit them anytime, helping you plan
              your travels or simply celebrate the cities that inspire you most.
            </p>
          </div>
          <div className="relative">
            <Image
              src={"/images/illustrations/navigation-94.svg"}
              alt="Navigation"
              width={600}
              height={700}
              style={{
                objectFit: "cover",
                width: "full",
                height: "full",
                right: 0,
              }}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default FavoriteCities;
