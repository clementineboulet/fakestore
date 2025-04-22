import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const crawlerConfig = {
  name: "my-programmatic-crawler",
  config: {
    startUrls: [
      "https://reaches-cincinnati-electronics-coat.trycloudflare.com/",
    ],
    schedule: "every 1 day at 2:00 am",
    renderJavaScript: true,
    rateLimit: 8,
    maxUrls: 100,
    ignoreQueryParams: ["utm_*", "ref"],
    actions: [
      {
        indexName: "algolia_categories",
        pathsToMatch: [
          "https://reaches-cincinnati-electronics-coat.trycloudflare.com/category/**",
        ],
        recordExtractor: ({ $, url }: {
          $: unknown;
          url: string;
        }) => {
          return [
            {
              objectID: url.toString(),
              name: $("h1").text().trim(),
              description: $("p.text-gray-600").text().trim(),
              productCount: parseInt(
                $("p.text-sm.text-gray-500").text().replace(/\D/g, "")
              ),
              url: url.toString(),
            },
          ];
        },
      },
      {
        indexName: "algolia_products",
        pathsToMatch: [
          "https://reaches-cincinnati-electronics-coat.trycloudflare.com/product/**",
        ],
        recordExtractor: ({ $, url }: {
          $: unknown;
          url: string;
        }) => {
          return [
            {
              objectID: url.toString(),
              title: $("h1").text().trim(),
              description: $("div.prose p").text().trim(),
              price: parseFloat(
                $("span.text-3xl.font-bold").first().text().replace(/[^0-9.]/g, "")
              ),
              brand: $("p.text-gray-600").first().text().trim(),
              category: $("a.text-indigo-600").text().trim().split(" ")[2],
              rating: parseFloat($("span.text-gray-600").first().text()),
              reviews: parseInt(
                $("span.text-gray-500").last().text().replace(/\D/g, "")
              ),
              image: $("img").first().attr("src"),
              url: url.toString(),
            },
          ];
        },
      },
    ],
    initialIndexSettings: {
      algolia_test_categories: {
        distinct: true,
        attributeForDistinct: "url",
        searchableAttributes: [
          "unordered(name)",
          "unordered(description)",
        ],
        customRanking: ["desc(productCount)"],
      },
      algolia_test_products: {
        distinct: true,
        attributeForDistinct: "url",
        searchableAttributes: [
          "unordered(title)",
          "unordered(description)",
          "unordered(brand)",
          "unordered(category)",
        ],
        customRanking: ["desc(rating)", "desc(reviews)"],
        attributesForFaceting: ["category", "brand"],
      },
    },
  },
};

(async () => {
  try {
    const res = await fetch('https://crawler.algolia.com/api/1/crawlers', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${process.env.CRAWLER_USER_ID||""}:${process.env.CRAWLER_API_KEY || ""}`,
        'Content-Type': 'application/json',
        'x-crawler-user-id': process.env.CRAWLER_USER_ID || "",
        'x-crawler-api-key': process.env.CRAWLER_API_KEY || "",
      },
      body: JSON.stringify(crawlerConfig),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`HTTP error! status: ${res.status}, body: ${errorText}`);
    }

    const result = await res.json();
    console.log('Crawler created:', result);
  } catch (err) {
    console.log("Crawler creation error: ", err);
    throw Error("Crawler creation error")
  }

  try {
    const res2 = await fetch('https://crawler.algolia.com/api/1/crawlers/my-programmatic-crawler/reindex', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-crawler-user-id': process.env.CRAWLER_USER_ID || "",
        'x-crawler-api-key': process.env.CRAWLER_API_KEY || "",
      },
      body: JSON.stringify(crawlerConfig),
    });

    const result2 = await res2.json();
    console.log('Crawler reindexed:', result2);
  } catch(err) {
    console.log("Crawler crawl error: ", err);
    throw Error("Crawler crawl error");
  }
})();
