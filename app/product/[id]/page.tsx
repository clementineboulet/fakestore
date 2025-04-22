import { algoliasearch } from 'algoliasearch';
import { ALGOLIA_INDEX_NAME } from '@/app/config/algolia';
import Image from 'next/image';
import Link from 'next/link';
import { Header } from '@/app/components/Header';
import { Breadcrumb } from '@/app/components/Breadcrumb';
import { Heart, Share2, Tag, Star, ShoppingBag } from 'lucide-react';

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

async function getProduct(id: string): Promise<Product | null> {
  try {
    console.log('Searching for product with ID:', id);
    const { hits } = await client.searchSingleIndex({
      indexName: ALGOLIA_INDEX_NAME,
      searchParams: {
        query: '',
        // filters: `id:"${id}"`,
        filters: `objectID:"${id}"`,
        hitsPerPage: 1,
      },
    });

    console.log('Search results:', hits);
    return hits[0] as Product || null;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

async function getRelatedProducts(category: string, currentId: string): Promise<Product[]> {
  try {
    const { hits } = await client.searchSingleIndex({
      indexName: ALGOLIA_INDEX_NAME,
      searchParams: {
        query: '',
        filters: `category:${category} AND NOT objectID:${currentId}`,
        hitsPerPage: 4,
      },
    });

    return hits as Product[];
  } catch (error) {
    console.error('Error fetching related products:', error);
    return [];
  }
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({
  params,
}: PageProps) {
  const { id } = await params || {};
  const product = await getProduct(id);
  const relatedProducts = product ? await getRelatedProducts(product.category, id) : [];

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold text-gray-900">Product not found</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <Breadcrumb items={[
          { label: 'Categories', href: '/categories' },
          { label: product.category, href: `/category/${product.category.toLowerCase().replace(/\s+/g, '-')}` },
          { label: product.title, href: `/product/${id}` }
        ]} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="relative h-96">
              <Image
                src={product.image}
                alt={product.title}
                fill
                className="object-contain rounded-lg"
              />
            </div>
            <div className="flex justify-center space-x-4 mt-4">
              <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                <Heart className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                <Share2 className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Product Info */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center space-x-2 mb-4">
              <div className="p-2 bg-teal-50 rounded-full">
                <Tag className="w-5 h-5 text-teal-600" />
              </div>
              <span className="text-teal-600">{product.category}</span>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.title}</h1>
            <p className="text-gray-600 mb-4">{product.brand}</p>

            <div className="flex items-center space-x-4 mb-6">
              <span className="text-3xl font-bold text-gray-900">${product.price}</span>
              <div className="flex items-center space-x-1">
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <span className="text-gray-600">{product.rating}</span>
                <span className="text-gray-500">({product.reviews} reviews)</span>
              </div>
            </div>

            <div className="prose max-w-none mb-6">
              <p className="text-gray-600">{product.description}</p>
            </div>

            <div className="flex items-center space-x-4">
              <Link
                href={`/category/${product.category.toLowerCase().replace(/\s+/g, '-')}`}
                className="text-teal-600 hover:text-teal-700 flex items-center space-x-2"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>View more {product.category} products</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Link
                  key={relatedProduct.objectID}
                  href={`/product/${relatedProduct.objectID}`}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden group"
                >
                  <div className="relative h-48">
                    <Image
                      src={relatedProduct.image}
                      alt={relatedProduct.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 group-hover:text-teal-600 transition-colors">
                      {relatedProduct.title}
                    </h3>
                    <p className="text-gray-600 text-sm mt-1">{relatedProduct.brand}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-lg font-bold text-gray-900">
                        ${relatedProduct.price}
                      </span>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-500">
                          {relatedProduct.rating} ({relatedProduct.reviews})
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}