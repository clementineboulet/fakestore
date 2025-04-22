import { algoliasearch } from 'algoliasearch';
import { ALGOLIA_INDEX_NAME } from '@/app/config/algolia';
import Image from 'next/image';
import Link from 'next/link';
import { categories } from '@/app/utils/fakeData';
import { Category } from '@/app/types/product';
import { Header } from '@/app/components/Header';
import { Breadcrumb } from '@/app/components/Breadcrumb';
import { Tag, ShoppingBag, Star } from 'lucide-react';

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

function getCategory(slug: string): Category | null {
  try {
    console.log("category slug: ", slug);
    // const { hits } = await client.searchSingleIndex({
    //   indexName: ALGOLIA_INDEX_NAME,
    //   searchParams: {
    //     query: '',
    //     filters: `category:"${slug}"`,
    //     hitsPerPage: 1,
    //   },
    // });

    // // console.log("hits: ", hits);
    // return hits[0] as Category || null;
    return categories.find(category => slug === category.id) || null;
  } catch (error) {
    console.error('Error fetching category:', error);
    return null;
  }
}

async function getCategoryProducts(categoryName: string): Promise<{ hits: Product[], nbHits: number} > {
  try {
    console.log("categoryName: ", categoryName)
    const results = await client.searchSingleIndex({
      indexName: ALGOLIA_INDEX_NAME,
      searchParams: {
        query: '',
        filters: `category:${categoryName}`,
        hitsPerPage: 100,
      },
    });

    return results as unknown as ({ hits: Product[], nbHits: number} | undefined) || { hits: [] as Product[], nbHits: 0 };
  } catch (error) {
    console.error('Error fetching products:', error);
    return { hits: [], nbHits: 0} ;
  }
}

export default async function CategoryPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = await params || {}; 
  const category = await getCategory(slug);
  const { hits: products, nbHits: productCount } = category ? await getCategoryProducts(category.id) : { hits: [], nbHits: 0 };

  if (!category) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold text-gray-900">Category not found</h1>
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
          { label: category.name, href: `/category/${category.id}` }
        ]} />

        {/* Category Header */}
        <div className="mb-8 bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-teal-50 rounded-full">
              <Tag className="w-6 h-6 text-teal-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{category.name}</h1>
              <p className="text-gray-600">{category.description}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-teal-600">
            <ShoppingBag className="w-5 h-5" />
            <span>{productCount} products in this category</span>
          </div>
        </div>

        {/* All Categories */}
        {/* <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">All Categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {allCategories.map((cat) => (
              <Link
                key={cat.id}
                href={`/category/${cat.id}`}
                className={`p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow ${
                  cat.id === category.id ? 'bg-teal-50' : 'bg-white'
                }`}
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-2 bg-teal-50 rounded-full">
                    <Tag className="w-5 h-5 text-teal-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">{cat.name}</h3>
                </div>
                <p className="text-sm text-gray-500 mb-2">{cat.description}</p>
                <div className="flex items-center space-x-2 text-teal-600">
                  <ShoppingBag className="w-4 h-4" />
                  <span className="text-sm">{cat.productCount} products</span>
                </div>
              </Link>
            ))}
          </div>
        </div> */}

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <Link
              key={product.objectID}
              href={`/product/${product.objectID}`}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden group"
            >
              <div className="relative h-48">
                <Image
                  src={product.image}
                  alt={product.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 group-hover:text-teal-600 transition-colors">
                  {product.title}
                </h3>
                <p className="text-gray-600 text-sm mt-1">{product.brand}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-lg font-bold text-gray-900">
                    ${product.price}
                  </span>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-500">
                      {product.rating} ({product.reviews})
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}