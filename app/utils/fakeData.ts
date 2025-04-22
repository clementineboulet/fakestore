import { faker } from '@faker-js/faker';
import { Product, Category } from '../types/product';

const categories: Category[] = [
  {
    id: 'electronics',
    name: 'Electronics',
    slug: 'electronics',
    description: 'Electronic devices and accessories',
    productCount: 0,
  },
  {
    id: 'clothing',
    name: 'Clothing',
    slug: 'clothing',
    description: 'Fashion items and accessories',
    productCount: 0,
  },
  {
    id: 'home',
    name: 'Home & Living',
    slug: 'home-living',
    description: 'Home decor and furniture',
    productCount: 0,
  },
  {
    id: 'books',
    name: 'Books',
    slug: 'books',
    description: 'Books and publications',
    productCount: 0,
  },
];

const brands = [
  'TechPro',
  'FashionFlex',
  'HomeStyle',
  'BookWorld',
  'SmartLife',
  'EcoFriendly',
  'LuxuryBrand',
  'BudgetChoice',
];

export const generateProducts = (count: number = 100): Product[] => {
  const products: Product[] = [];

  for (let i = 0; i < count; i++) {
    const category = faker.helpers.arrayElement(categories);
    const brand = faker.helpers.arrayElement(brands);
    const price = faker.number.int({ min: 10, max: 1000 });

    products.push({
      id: faker.string.uuid(),
      name: faker.commerce.productName(),
      description: faker.lorem.paragraph(),
      price,
      category: category.id,
      brand,
      image: faker.image.urlLoremFlickr({ width: 400, height: 400, category: 'product' }),
      rating: faker.number.float({ min: 1, max: 5, fractionDigits: 1 }),
      reviews: faker.number.int({ min: 0, max: 100 }),
      inStock: faker.datatype.boolean(),
      tags: faker.helpers.arrayElements(['new', 'sale', 'popular', 'trending'], 2),
      createdAt: faker.date.past().toISOString(),
      updatedAt: faker.date.recent().toISOString(),
    });
  }

  // Update product counts in categories
  categories.forEach(category => {
    category.productCount = products.filter(p => p.category === category.id).length;
  });

  return products;
};

export { categories, brands };
