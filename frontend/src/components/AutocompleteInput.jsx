import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { searchLocations } from "../utils/autoCompleteApiClient"
import { simplifyLocation } from "../utils/simplyfyLocations";
import { toast } from "react-toastify";

const AutocompleteInput = ({
  placeholder = "Search location...",
  value,
  onChange,
  onSelect,
  rideType,
  field,
  airportDirection,
  minChars = 2,
}) => {
  const [q, setQ] = useState(value?.name || value || "");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isExactMatch, setIsExactMatch] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [error, setError] = useState(null);
  const [isSelected, setIsSelected] = useState(false); // ✅ NEW STATE

  const controllerRef = useRef(null);
  const boxRef = useRef();
  const retryCountRef = useRef(0);
  const MAX_RETRIES = 2;

  const deduplicateSuggestions = (places) => {
    const seen = new Map();
    
    return places.filter((place) => {
      const simplifiedName = simplifyLocation(place).toLowerCase().trim();
      const coordKey = `${parseFloat(place.lat).toFixed(4)},${parseFloat(place.lon).toFixed(4)}`;
      const uniqueKey = `${simplifiedName}-${coordKey}`;
      
      if (seen.has(uniqueKey)) {
        return false;
      }
      
      for (const [key, _] of seen) {
        const existingName = key.split('-')[0];
        if (existingName === simplifiedName) {
          return false;
        }
      }
      
      seen.set(uniqueKey, true);
      return true;
    });
  };

  useEffect(() => {
    const newValue = value?.name || value || "";
    setQ(newValue);

    if (!newValue) {
      setSuggestions([]);
      setShowDropdown(false);
      setError(null);
      setIsSelected(false);
    } else {
      setIsSelected(true);
    }
  }, [value]);

  useEffect(() => {
    if (isSelected) {
      return;
    }

    if (controllerRef.current) controllerRef.current.abort();

    if (!q || q.length < minChars) {
      setSuggestions([]);
      setIsExactMatch(true);
      setShowDropdown(false);
      setError(null);
      return;
    }

    const c = new AbortController();
    controllerRef.current = c;

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        setShowDropdown(true);
        setError(null);

        const res = await searchLocations({
          query: q,
          rideType,
          airportDirection,
          field,
          signal: c.signal,
        });

        retryCountRef.current = 0;

        let dataList = res.data?.places || [];

        const isAirport = (name) =>
          name.toLowerCase().includes("airport") ||
          name.toLowerCase().includes("terminal");

        if (rideType !== "airport") {
          dataList = dataList.filter((p) => !isAirport(p.name));
        }

        if (rideType === "airport") {
          if (airportDirection === "pickup-airport") {
            if (field === "pickup") {
              dataList = dataList.filter((p) => isAirport(p.name));
            } else if (field === "drop") {
              dataList = dataList.filter((p) => !isAirport(p.name));
            }
          }

          if (airportDirection === "drop-airport") {
            if (field === "pickup") {
              dataList = dataList.filter((p) => !isAirport(p.name));
            } else if (field === "drop") {
              dataList = dataList.filter((p) => isAirport(p.name));
            }
          }
        }

        dataList = deduplicateSuggestions(dataList);

        setSuggestions(dataList);
        setIsExactMatch(res.data?.match ?? true);

        if (res.data?.error) {
          setError(res.data.error);
        }

      } catch (err) {
        if (!["AbortError", "CanceledError"].includes(err.name)) {
          console.error("Autocomplete error:", err);
          
          if (err.code === 'ETIMEDOUT' || err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
            if (retryCountRef.current < MAX_RETRIES) {
              retryCountRef.current++;
              setError(`Connection timeout. Retrying... (${retryCountRef.current}/${MAX_RETRIES})`);
              setTimeout(() => {
                setQ(q);
              }, 1000);
            } else {
              setError("Location service is temporarily unavailable. Please try again later.");
              retryCountRef.current = 0;
            }
          } else {
            setError("Unable to search locations. Please check your connection.");
          }
        }
        setSuggestions([]);
        setIsExactMatch(true);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => {
      clearTimeout(timer);
      c.abort();
    };
  }, [q, minChars, isSelected]);
  
  useEffect(() => {
    const handler = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const shouldShowCustomOption = () => {
    if (loading || isExactMatch || !q || q.length < minChars) {
      return false;
    }

    if (suggestions.length === 0) {
      return true;
    }

    const queryLower = q.toLowerCase().trim();
    const hasCloseMatch = suggestions.some((s) => {
      const nameLower = s.name.toLowerCase();

      if (nameLower === queryLower) return true;
      if (nameLower.startsWith(queryLower)) return true;

      const firstPart = nameLower.split(',')[0].trim();
      if (firstPart === queryLower) return true;
      if (firstPart.startsWith(queryLower)) return true;

      const queryWords = queryLower.split(' ').filter(w => w.length > 0).slice(0, 3);
      const nameWords = firstPart.split(' ').filter(w => w.length > 0).slice(0, 3);

      if (queryWords.length >= 2 && nameWords.length >= 2) {
        const matchCount = queryWords.filter((qw, idx) => nameWords[idx] === qw).length;
        if (matchCount === queryWords.length) return true;
      }

      return false;
    });

    return !hasCloseMatch;
  };

  const handleSelect = (item) => {
    setShowDropdown(false);
    setSuggestions([]);
    setError(null);
    setIsSelected(true);
    controllerRef.current?.abort();

    const clean = simplifyLocation(item);
    setQ(clean);

    const isAirportName =
      clean.toLowerCase().includes("airport") ||
      clean.toLowerCase().includes("terminal");

    if (rideType === "airport" && airportDirection === "pickup-airport") {
      if (field === "pickup" && !isAirportName) {
        return toast.error("Pickup must be an airport");
      }
      if (field === "drop" && isAirportName) {
        return toast.error("Drop cannot be an airport");
      }
    }

    if (rideType === "airport" && airportDirection === "drop-airport") {
      if (field === "drop" && !isAirportName) {
        return toast.error("Drop must be an airport");
      }
      if (field === "pickup" && isAirportName) {
        return toast.error("Pickup cannot be an airport");
      }
    }

    onSelect?.({
      ...item,
      name: clean,
    });
  };

  return (
    <div className="relative" ref={boxRef}>
      <input
        value={q}
        onChange={(e) => {
          const val = e.target.value;
          setQ(val);
          setIsSelected(false);
          onChange?.(val);
        }}
        onFocus={() => {
          if (!isSelected && q.length >= minChars && (suggestions.length > 0 || !isExactMatch)) {
            setShowDropdown(true);
          }
        }}
        placeholder={placeholder}
        className="
          w-full p-3 rounded-lg border 
          border-gray-300 
          [[data-theme=dark]_&]:border-gray-700 
          bg-transparent 
          text-gray-900 
          [[data-theme=dark]_&]:text-gray-100
          focus:ring-2 focus:ring-yellow-400 outline-none
        "
      />

      {showDropdown && !isSelected && (suggestions.length > 0 || shouldShowCustomOption() || loading || error) && (
        <motion.ul
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="
            absolute z-50 w-full mt-2 
            bg-white 
            [[data-theme=dark]_&]:bg-gray-800 
            rounded-lg shadow-lg 
            max-h-64 overflow-auto
            border border-gray-200
            [[data-theme=dark]_&]:border-gray-700
          "
        >
          {loading && (
            <li className="p-3 text-sm text-gray-500 [[data-theme=dark]_&]:text-gray-300">
              <div className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Searching...
              </div>
            </li>
          )}

          {error && !loading && (
            <li className="p-3 text-sm text-red-600 [[data-theme=dark]_&]:text-red-400 bg-red-50 [[data-theme=dark]_&]:bg-red-900/20">
              ⚠️ {error}
            </li>
          )}

          {!loading && !error && suggestions.map((s, idx) => (
            <li
              key={idx}
              className={`
                p-3 cursor-pointer 
                hover:bg-yellow-50 
                [[data-theme=dark]_&]:hover:bg-gray-700
                transition-colors
                border-b border-gray-100
                [[data-theme=dark]_&]:border-gray-700
                last:border-b-0
                ${s.isFallback ? 'bg-green-50 [[data-theme=dark]_&]:bg-green-900/20' : ''}
              `}
              onClick={() => handleSelect(s)}
            >
              <div className="text-sm font-medium text-gray-900 [[data-theme=dark]_&]:text-gray-100">
                {simplifyLocation(s)}
              </div>
            </li>
          ))}
        </motion.ul>
      )}
    </div>
  );
};

export default AutocompleteInput;