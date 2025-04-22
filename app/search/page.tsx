'use client';

import { useEffect, useRef } from 'react';
import {
  searchBox,
  hits,
  refinementList,
  pagination,
  sortBy,
  rangeInput,
  configure,
} from 'instantsearch.js/es/widgets';
import { search, ALGOLIA_INDEX_NAME } from '../config/algolia';
import Image from 'next/image';
import { Product } from '../types/product';
import Link from 'next/link';
import { renderToStaticMarkup } from 'react-dom/server';
import { Header } from '../components/Header';

function Hit({ hit }: { hit: Product }) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="relative h-48 mb-4">
        <Image
          src={hit.image}
          alt={hit.name}
          fill
          className="object-cover rounded"
        />
      </div>
      <h3 className="font-semibold">{hit.name}</h3>
      <p className="text-gray-600 text-sm mt-1">{hit.brand}</p>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-lg font-bold">${hit.price}</span>
        <span className="text-sm text-gray-500">
          {hit.rating} ★ ({hit.reviews})
        </span>
      </div>
    </div>
    // <Link
    //   href={`/product/${hit.objectID}`}
    //   className="block px-4 py-2 hover:bg-gray-100"
    // >
    //   <div className="flex items-center space-x-4">
    //     <div className="w-12 h-12 relative">
    //       <img
    //         src={hit.image}
    //         alt={hit.name}
    //         className="object-cover rounded w-full h-full"
    //       />
    //     </div>
    //     <div className="flex-1 min-w-0">
    //       <p className="text-sm font-medium text-gray-800 truncate">{hit.name}</p>
    //       <p className="text-sm text-gray-500">{hit.brand}</p>
    //       <p className="text-sm font-medium text-teal-600">${hit.price}</p>
    //     </div>
    //   </div>
    // </Link>
  );
}

export default function SearchPage() {
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!searchRef.current) return;

    search.addWidgets([
      configure({
        hitsPerPage: 20,
        attributesToRetrieve: [
          'id',
          'name',
          'description',
          'price',
          'category',
          'brand',
          'image',
          'rating',
          'reviews',
          'inStock',
          'tags',
        ],
        attributesToHighlight: ['name', 'description'],
        attributesToSnippet: ['description:80'],
      }),

      searchBox({
        container: '#searchbox',
        placeholder: 'Search products...',
        cssClasses: {
          root: 'w-full',
          form: 'relative',
          input: 'w-full p-4 border rounded-lg',
          submit: 'absolute right-4 top-1/2 -translate-y-1/2',
          reset: 'hidden',
          loadingIndicator: 'hidden',
        },
      }),

      sortBy({
        container: '#sort-by',
        items: [
          { label: 'Featured', value: ALGOLIA_INDEX_NAME },
          { label: 'Price (low to high)', value: `${ALGOLIA_INDEX_NAME}_price_asc` },
          { label: 'Price (high to low)', value: `${ALGOLIA_INDEX_NAME}_price_desc` },
          { label: 'Rating', value: `${ALGOLIA_INDEX_NAME}_rating_desc` },
        ],
        cssClasses: {
          root: 'w-full p-2 border rounded',
        },
      }),

      refinementList({
        container: '#categories',
        attribute: 'category',
        cssClasses: {
          root: 'space-y-2',
          item: 'flex items-center',
          checkbox: 'mr-2',
          label: 'text-sm',
          count: 'ml-2 text-gray-500 text-sm',
        },
      }),

      refinementList({
        container: '#brands',
        attribute: 'brand',
        cssClasses: {
          root: 'space-y-2',
          item: 'flex items-center',
          checkbox: 'mr-2',
          label: 'text-sm',
          count: 'ml-2 text-gray-500 text-sm',
        },
      }),

      rangeInput({
        container: '#price-range',
        attribute: 'price',
        cssClasses: {
          form: 'flex items-center space-x-2',
          input: 'w-20 p-1 border rounded',
          separator: 'mx-2',
        },
      }),

      hits({
        container: '#hits',
        templates: {
          item: (hit: Product) => renderToStaticMarkup(<Hit hit={hit} />),
        },
      }),

      pagination({
        container: '#pagination',
        cssClasses: {
          root: 'flex items-center space-x-2',
          list: 'flex items-center space-x-2',
          item: 'px-3 py-1 border rounded',
          selectedItem: 'bg-teal-600 text-white border-indigo-600',
          disabledItem: 'opacity-50 cursor-not-allowed',
          link: 'hover:bg-gray-50',
        },
      }),
    ]);

    search.start();

    return () => {
      search.removeWidgets(search.getWidgets());
    };
  }, []);

  return (
    <div className="space-y-8">
      <Header noSearch/>
      {/* Hero Section */}
      <section className="bg-teal-500 text-white rounded-lg p-8">
        <h1 className="text-4xl font-bold mb-4">Find your products</h1>
        <p className="text-xl">Discover amazing products at great prices</p>
      </section>
      <div ref={searchRef} className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Filters</h3>
              <div id="clear-refinements"></div>
            </div>
            
            <div className="mb-6">
              <h4 className="font-medium mb-2">Sort By</h4>
              <div id="sort-by"></div>
            </div>

            <div className="mb-6">
              <h4 className="font-medium mb-2">Categories</h4>
              <div id="categories"></div>
            </div>

            <div className="mb-6">
              <h4 className="font-medium mb-2">Brands</h4>
              <div id="brands"></div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Price Range</h4>
              <div id="price-range"></div>
            </div>
          </div>
        </div>

        {/* Search Results */}
        <div className="lg:col-span-3">
          <div className="mb-6">
            <div id="searchbox"></div>
          </div>

          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div id="hits">
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <div id="pagination"></div>
          </div>
        </div>
      </div>
    </div>
  );
}