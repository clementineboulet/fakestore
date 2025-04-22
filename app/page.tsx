import { algoliasearch } from 'algoliasearch';
import { ALGOLIA_INDEX_NAME } from './config/algolia';
import Link from 'next/link';
import Image from 'next/image';
import { SearchBar } from './components/SearchBar';
import { Category } from './types/product';
import { Header } from './components/Header';
import { ShoppingBag } from 'lucide-react';
// import { categories } from './utils/fakeData';

const client = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!,
  process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY!
);

interface Product {
  objectID: string;
  type: 'product';
  title: string;
  description: string;
  url: string;
  image: string;
  price: number;
  brand: string;
  category: string;
  rating: number;
  reviews: number;
}

async function getRandomProducts(count: number): Promise<Product[]> {
  try {
    const { hits } = await client.searchSingleIndex({
      indexName: ALGOLIA_INDEX_NAME,
      searchParams: {
        query: '',
        filters: '',
        hitsPerPage: count,
        page: Math.floor(Math.random() * 10), // Get a random page of results
      },
    });

    return hits as Product[];
  } catch (error) {
    console.error('Error fetching random products:', error);
    return [];
  }
}

export async function getAllCategories(): Promise<Category[]> {
  try {
    const { facets } = await client.searchSingleIndex({
      indexName: ALGOLIA_INDEX_NAME,
      searchParams: {
        query: '',
        facets: ['category'],
        hitsPerPage: 0,
      },
    });

    const categoryCounts = facets?.category || {};
    const categories = await Promise.all(
      Object.entries(categoryCounts).map(async ([name, count]) => {
        // For each category, fetch one product to get its categoryId
        const { hits } = await client.searchSingleIndex({
          indexName: ALGOLIA_INDEX_NAME,
          searchParams: {
            query: '',
            filters: `category:${name}`,
            hitsPerPage: 1,
            attributesToRetrieve: ['category', 'categoryId'],
          },
        });
        console.log("hits: ", hits)

        // Use the categoryId from the product, or generate one if not found
        const category = hits[0] as unknown as Category || {} ;
        
        return {
          id: category.objectID,
          slug: name,
          name,
          description: category.description,
          productCount: count as number,
        };
      })
    );
    console.log("categoryCounts: ", categories)
    return categories;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

export default async function Home() {
  const products = await getRandomProducts(12); // Fetch 12 random products
  const categories = await getAllCategories();

  return (
    <div className="space-y-8">
      <Header />
      {/* Hero Section */}
      <section className="bg-teal-500 text-white rounded-lg p-8">
        <h1 className="text-4xl font-bold mb-4">Welcome to FakeStore</h1>
        <p className="text-xl">Discover amazing products at great prices</p>
      </section>

      {/* Search Bar */}
      <section className="bg-white p-4 rounded-lg shadow text-gray-800">
        <p className="text-xl text-gray-800" >Search amongst all of our products with Algolia</p>
        <SearchBar />
      </section>

      {/* Categories */}
      <section className="p-4">
        <h2 className="text-2xl font-bold mb-4">Shop by Category</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/category/${category.slug}`}
              className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow text-gray-800"
            >
              <h3 className="font-semibold text-gray-800"><ShoppingBag className="w-5 h-5" />{category.name}</h3>
              <p className="text-sm text-gray-500">{category.description}</p>
              <p className="text-sm text-teal-600 mt-2">
                {category.productCount} products
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="p-4">
        <h2 className="text-2xl font-bold mb-4">Featured Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <Link
              key={product.objectID}
              href={`/product/${product.objectID}`}
              className="bg-white rounded-lg shadow hover:shadow-md transition-shadow overflow-hidden"
            >
              <div className="relative h-48">
                <Image
                  src={product.image}
                  alt={product.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900">{product.title}</h3>
                <p className="text-gray-600 text-sm mt-1">{product.brand}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-lg font-bold">${product.price}</span>
                  <span className="text-sm text-gray-500">
                    {product.rating} <span className="text-yellow-400">★</span> ({product.reviews})
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}