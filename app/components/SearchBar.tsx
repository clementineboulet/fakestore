'use client';

// import algoliasearch from 'algoliasearch/lite';
import { liteClient as algoliasearch } from 'algoliasearch/lite';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ALGOLIA_INDEX_NAME } from '../config/algolia';

// const client = algoliasearch(
//   process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!,
//   process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY!
// );

const client = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!,
  process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY!
);

export function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const searchProducts = async () => {
      if (!query.trim()) {
        setSuggestions([]);
        return;
      }

      try {
        // const { hits } = await client.searchSingleIndex({
        //   indexName: ALGOLIA_INDEX_NAME,
        //   searchParams: {
        //     query,
        //     hitsPerPage: 5,
        //     attributesToRetrieve: ['name', 'brand', 'price', 'image'],
        //   },
        // });

        const { results } = await client.search([
          {
            indexName: ALGOLIA_INDEX_NAME,
            query,
            params: {
              hitsPerPage: 5,
              attributesToRetrieve: ['name', 'brand', 'price', 'image'],
            },
          },
        ]);
        const hits = results[0]?.hits;

        setSuggestions(hits);
        setIsOpen(true);
      } catch (error) {
        console.error('Error searching products:', error);
      }
    };

    const timeoutId = setTimeout(searchProducts, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
      setIsOpen(false);
    }
  };

  return (
    <div ref={searchRef} className="relative">
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products..."
          className="w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="submit"
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </button>
      </form>

      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg">
          {suggestions.map((hit) => (
            <button
              key={hit.objectID}
              onClick={() => {
                router.push(`/product/${hit.objectID}`);
                setIsOpen(false);
              }}
              className="w-full px-4 py-3 text-left hover:bg-gray-100 flex items-center space-x-4"
            >
              <div className="relative w-12 h-12 flex-shrink-0">
                <img
                  src={hit.image}
                  alt={hit.name}
                  className="object-cover rounded"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {hit.name}
                </p>
                <p className="text-sm text-gray-500">{hit.brand}</p>
                <p className="text-sm font-medium text-teal-600">
                  ${hit.price}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
