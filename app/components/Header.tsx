// Step 1: Install dependencies (if not already)
// npm install react-instantsearch algoliasearch

'use client';

import { algoliasearch } from 'algoliasearch';
import {
  InstantSearch,
  // Index,
  Configure,
  SearchBox,
  Hits,
  useInstantSearch,
  useSearchBox,
  useHits,
  useInfiniteHits,
} from 'react-instantsearch';
import Link from 'next/link';
import { ShoppingCart, User } from 'lucide-react';
import { ALGOLIA_INDEX_NAME } from '../config/algolia';
import { useEffect, useState } from 'react';

const searchClient = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!,
  process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY!
);

function useDynamicSuggestions(query: string) {
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    const trimmedQuery = query.trim();

    if (trimmedQuery.length > 0 && trimmedQuery.length <= 5) {
      searchClient
        .search([
          {
            indexName: ALGOLIA_INDEX_NAME,
            params: {
              query: trimmedQuery,
              hitsPerPage: 10,
              attributesToRetrieve: ['name', 'brand', 'category', 'rating'],
              queryType: 'prefixAll',
              typoTolerance: 'min',
            },
          },
        ])
        .then(({ results }) => {
          const hits = results[0]?.hits || [];

          const pool = [
            ...hits.map((hit: any) => hit.name),
            ...hits.map((hit: any) => hit.brand),
            ...hits.map((hit: any) => hit.category),
            ...hits.map((hit: any) => hit.rating?.toString()),
          ];

          const suggestionsSet = new Set(
            pool.filter((v): v is string => typeof v === 'string' && v.toLowerCase().includes(trimmedQuery.toLowerCase()))
          );

          setSuggestions(Array.from(suggestionsSet).slice(0, 3));
        });
    } else {
      setSuggestions([]);
    }
  }, [query]);

  return suggestions;
}

// function getAutocompleteSuggestions(input: string): string[] {
//   const trimmed = input.trim();
//   if (trimmed.length === 0 || trimmed.length > 5) return Promise.resolve([]);

//   return searchClient
//     .search([
//       {
//         indexName: ALGOLIA_INDEX_NAME,
//         params: {
//           query: trimmed,
//           hitsPerPage: 10,
//           attributesToRetrieve: ['name', 'brand', 'category', 'rating'],
//           queryType: 'prefixAll',
//           typoTolerance: 'min',
//         },
//       },
//     ])
//     .then(({ results }) => {
//       const hits = results[0]?.hits || [];
//       const pool = [
//         ...hits.map((hit: any) => hit.name),
//         ...hits.map((hit: any) => hit.brand),
//         ...hits.map((hit: any) => hit.category),
//         ...hits.map((hit: any) => hit.rating?.toString()),
//       ];

//       const suggestionsSet = new Set(
//         pool.filter((v): v is string => typeof v === 'string' && v.toLowerCase().includes(trimmed.toLowerCase()))
//       );

//       return Array.from(suggestionsSet).slice(0, 5);
//     });
// }


function Hit({ hit }: any) {
  return (
    <Link
      href={`/product/${hit.objectID}`}
      className="block px-4 py-2 hover:bg-gray-100"
    >
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 relative">
          <img
            src={hit.image}
            alt={hit.name}
            className="object-cover rounded w-full h-full"
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-800 truncate">{hit.name}</p>
          <p className="text-sm text-gray-500">{hit.brand}</p>
          <p className="text-sm font-medium text-teal-600">${hit.price}</p>
        </div>
      </div>
    </Link>
  );
}

function ConditionalHits() {
  // const { indexUiState } = useInstantSearch();
  // const query = indexUiState?.query || '';
  const { query, refine } = useSearchBox();
  const { items } = useInfiniteHits();
  console.log("indexUiState query: ", query)
  const autocompleteSuggestions = useDynamicSuggestions(query);
  console.log("suggestions: ", autocompleteSuggestions)
  // const autocompleteOptions = await getAutocompleteSuggestions(query);
  // console.log("options: ", autocompleteOptions)

  if (!query.trim()) return <></>;

  return (
    // <div className="absolute mt-1 w-full z-50 bg-white border rounded-lg shadow-lg">
    //   <Hits hitComponent={Hit} />
    // </div>
    <div className="absolute mt-1 w-full z-50 bg-white border rounded-lg shadow-lg">
      <div className="px-4 py-3 text-gray-700 space-y-1">
          {autocompleteSuggestions.map((suggestion, index) => (
            <button
              key={index}
              className="block text-left w-full hover:bg-gray-100 px-2 py-1 text-sm text-gray-700"
              onClick={() => refine(suggestion)}
            >
              {suggestion}
            </button>
          ))}
        </div>
        
        <div className="px-4 py-3 text-gray-700 space-y-1">
          {autocompleteOptions.map((option, index) => (
            <button
              key={index}
              className="block text-left w-full hover:bg-gray-100 px-2 py-1 text-sm text-gray-700"
              onClick={() => refine(option)}
            >
              {option}
            </button>
          ))}
        </div>
      {items.length > 0 ? (
        items.slice(0, 5).map((hit: any) => <Hit key={hit.objectID} hit={hit} />)
      ) : (
        <div className="px-4 py-3 text-gray-500">No results found</div>
      )}
    </div>
  );
}

export function Header({ noSearch }: { noSearch?: boolean }) {
  // const [searchState, setSearchState] = useState({});

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-teal-500 to-teal-600 text-transparent bg-clip-text">
              FakeStore
            </span>
          </Link>

          {/* SearchBar using react-instantsearch */}
          {
            !noSearch && <div className="hidden md:block w-full max-w-md mx-6">
            <InstantSearch searchClient={searchClient} indexName={ALGOLIA_INDEX_NAME} 
              // searchState={searchState}
              // onSearchStateChange={setSearchState}
              >
              <Configure 
                hitsPerPage={5}
                attributesToRetrieve={["name", "brand", "price", "image"]}
                queryType="prefixAll"
                removeWordsIfNoResults="none"
                typoTolerance="min" />
              <SearchBox
                placeholder="Search products with InstantSearch..."
                classNames={{
                  root: 'relative',
                  input: 'w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500',
                  submit: 'hidden',
                  reset: 'hidden',
                }}
              />
              {/* {query  && query.length ? ( */}
                {/* <div className="absolute mt-1 w-full z-50 bg-white border rounded-lg shadow-lg"> */}
                  <ConditionalHits />
                {/* </div> */}
              {/* ) : <></>} */}
            </InstantSearch>
          </div>
          }

          {/* Icons */}
          <div className="flex items-center space-x-4">
            <Link href="/cart" className="text-gray-600 hover:text-teal-600 transition-colors">
              <ShoppingCart className="w-5 h-5" />
            </Link>
            <Link href="/account" className="text-gray-600 hover:text-teal-600 transition-colors">
              <User className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
