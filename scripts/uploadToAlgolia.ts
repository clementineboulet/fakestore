import { algoliasearch } from 'algoliasearch';
import { generateProducts } from '../app/utils/fakeData';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

if (!process.env.NEXT_PUBLIC_ALGOLIA_APP_ID) {
  throw new Error('NEXT_PUBLIC_ALGOLIA_APP_ID is not defined');
}

if (!process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY) {
  throw new Error('NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY is not defined');
}

if (!process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME) {
  throw new Error('NEXT_PUBLIC_ALGOLIA_INDEX_NAME is not defined');
}

const client = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID,
  process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY
);

// const index = client.initIndex(process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME);

// const result = await client.searchSingleIndex({
//   indexName: 'IndexName',
//   searchParams: { query: 'query' }
// });

async function uploadToAlgolia() {
  try {
    // Generate 1000 fake products
    const products = generateProducts(1000);

    // Configure the index
    await client.setSettings({
      indexName: process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME || "",
      indexSettings: {
        searchableAttributes: ['name', 'description', 'brand', 'category'],
        attributesForFaceting: ['category', 'brand'],
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
        customRanking: ['desc(rating)', 'desc(reviews)'],
        replicas: [
          `${process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME}_price_asc`,
          `${process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME}_price_desc`,
          `${process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME}_rating_desc`,
        ],
      }
    });

    // Upload the products
    await client.saveObjects({
      indexName: process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME || "",
      objects: products as unknown as Record<string, unknown>[],
    });
    console.log(`Successfully uploaded ${products.length} products to Algolia`);

    // Configure replica indices
    const replicaIndices = [
      `${process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME}_price_asc`,
      `${process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME}_price_desc`,
      `${process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME}_rating_desc`,
    ];

    for (const replicaIndex of replicaIndices) {
      // const replica = client.initIndex(replicaIndex);
      await client.setSettings({
        indexName: replicaIndex || "",
        indexSettings: {
          ranking: [
            replicaIndex.includes('price_asc') ? 'asc(price)' : 
            replicaIndex.includes('price_desc') ? 'desc(price)' : 
            'desc(rating)',
          ],
        }
      });
    }
  } catch (error) {
    console.error('Error uploading to Algolia:', error);
  }
}

uploadToAlgolia();