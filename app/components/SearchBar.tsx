"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Autocomplete from "react-google-autocomplete";
import { Search, MapPin, Tag } from "lucide-react";
import { getCategories } from "@/app/actions/searchTools";

interface SearchBarProps {
  onSearch?: (params: { name: string; category: string; lat?: number; lng?: number }) => void;
}

const SearchBar: React.FC<SearchBarProps> = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [name, setName] = useState(searchParams.get("name") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "Toutes les catégories");
  const [categories, setCategories] = useState<string[]>([]);
  const [location, setLocation] = useState({
    name: searchParams.get("location") || "",
    lat: searchParams.get("lat") ? parseFloat(searchParams.get("lat")!) : undefined,
    lng: searchParams.get("lng") ? parseFloat(searchParams.get("lng")!) : undefined,
  });

  useEffect(() => {
    async function fetchCategories() {
      const cats = await getCategories();
      setCategories(cats);
    }
    fetchCategories();
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (name) params.set("name", name);
    if (category && category !== "Toutes les catégories") params.set("category", category);
    if (location.name) params.set("location", location.name);
    if (location.lat) params.set("lat", location.lat.toString());
    if (location.lng) params.set("lng", location.lng.toString());

    router.push(`/?${params.toString()}`);
  };

  return (
    <div className="w-full max-w-5xl mx-auto mb-10">
      <div className="bg-white dark:bg-slate-900 shadow-2xl rounded-3xl p-2 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center gap-2 group focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
        
        {/* Name Search */}
        <div className="flex items-center px-4 py-3 flex-1 w-full border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800">
          <Search className="text-slate-400 mr-3" size={20} />
          <input
            type="text"
            placeholder="Que recherchez-vous ?"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-transparent border-none outline-none w-full text-slate-800 dark:text-slate-100 placeholder:text-slate-400 font-medium"
          />
        </div>

        {/* Category Select */}
        <div className="flex items-center px-4 py-3 flex-1 w-full border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800 focus-within:bg-slate-50 dark:focus-within:bg-slate-800/50 transition-colors rounded-xl md:rounded-none">
          <Tag className="text-slate-400 mr-3" size={20} />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-transparent border-none outline-none w-full text-slate-800 dark:text-slate-100 font-medium cursor-pointer appearance-none"
          >
            <option>Toutes les catégories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Location Autocomplete */}
        <div className="flex items-center px-4 py-3 flex-[1.5] w-full group relative focus-within:bg-slate-50 dark:focus-within:bg-slate-800/50 transition-colors rounded-xl md:rounded-none">
          <MapPin className="text-slate-400 mr-3" size={20} />
          {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? (
            <Autocomplete
              apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
              onPlaceSelected={(place) => {
                if (place.geometry && place.geometry.location) {
                  setLocation({
                    name: place.formatted_address || "",
                    lat: place.geometry.location.lat(),
                    lng: place.geometry.location.lng(),
                  });
                }
              }}
              options={{
                types: ["(cities)"],
                componentRestrictions: { country: "fr" },
              }}
              defaultValue={location.name}
              placeholder="Où ? (Ville)"
              className="bg-transparent border-none outline-none w-full text-slate-800 dark:text-slate-100 placeholder:text-slate-400 font-medium"
            />
          ) : (
            <div className="text-red-500 text-xs">Clé API manquante</div>
          )}
        </div>

        {/* Search Button */}
        <button
          onClick={handleSearch}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-8 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30 active:scale-95 w-full md:w-auto"
        >
          <Search size={20} />
          <span>Rechercher</span>
        </button>
      </div>
    </div>
  );
};

export default SearchBar;
