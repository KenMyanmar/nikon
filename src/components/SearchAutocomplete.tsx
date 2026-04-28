import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { SearchProductRow } from "@/integrations/supabase/rpc-types";

interface SearchAutocompleteProps {
  className?: string;
  inputClassName?: string;
  placeholder?: string;
  showButton?: boolean;
}

type SearchResult = SearchProductRow;

const SearchAutocomplete = ({
  className = "",
  inputClassName = "",
  placeholder = "Search by product name, brand, or SKU...",
  showButton = true,
}: SearchAutocompleteProps) => {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Debounce
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Fetch results
  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }
    setIsLoading(true);
    supabase
      .rpc("search_products", { search_term: debouncedQuery, result_limit: 5 })
      .then(({ data, error }) => {
        setIsLoading(false);
        if (!error && data) {
          setResults((data as unknown) as SearchResult[]);
          setIsOpen(true);
        }
      });
  }, [debouncedQuery]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSubmit = () => {
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setIsOpen(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ikon-text-tertiary z-10" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => results.length > 0 && setIsOpen(true)}
        placeholder={placeholder}
        className={inputClassName}
      />
      {showButton && (
        <button
          onClick={handleSubmit}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-accent text-accent-foreground px-6 py-2 rounded-md font-semibold hover:bg-accent/90 transition text-sm"
        >
          Search
        </button>
      )}

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-ikon-border rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
          {isLoading && (
            <div className="px-4 py-3 text-sm text-ikon-text-tertiary">Searching...</div>
          )}
          {!isLoading && results.length === 0 && debouncedQuery.length >= 2 && (
            <div className="px-4 py-3 text-sm text-ikon-text-tertiary">No results found</div>
          )}
          {results.map((r) => (
            <button
              key={r.id}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-ikon-bg-secondary transition text-left"
              onClick={() => {
                navigate(`/product/${r.slug || r.id}`);
                setIsOpen(false);
                setQuery("");
              }}
            >
              <img
                src={r.thumbnail_url || "/placeholder.svg"}
                alt=""
                className="w-10 h-10 object-contain rounded bg-ikon-bg-secondary flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground line-clamp-1">{r.description}</p>
                <p className="text-xs text-ikon-text-tertiary">{r.brand_name}</p>
              </div>
              <div className="text-right flex-shrink-0">
                {r.selling_price ? (
                  <span className="text-sm font-bold text-accent">{r.currency} {Number(r.selling_price).toLocaleString()}</span>
                ) : (
                  <span className="text-xs font-semibold text-primary">Request Quote</span>
                )}
              </div>
            </button>
          ))}
          {results.length > 0 && (
            <button
              className="w-full px-4 py-3 text-sm font-semibold text-primary hover:bg-ikon-bg-secondary transition border-t border-ikon-border"
              onClick={handleSubmit}
            >
              View all results for "{query}"
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchAutocomplete;
