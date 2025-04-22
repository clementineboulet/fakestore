import { algoliasearch } from 'algoliasearch';
import instantsearch from 'instantsearch.js';
import { history } from 'instantsearch.js/es/lib/routers';
import type { UiState } from 'instantsearch.js';

if (!process.env.NEXT_PUBLIC_ALGOLIA_APP_ID) {
  throw new Error('NEXT_PUBLIC_ALGOLIA_APP_ID is not defined');
}

if (!process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY) {
  throw new Error('NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY is not defined');
}

if (!process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME) {
  throw new Error('NEXT_PUBLIC_ALGOLIA_INDEX_NAME is not defined');
}

export const searchClient = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID,
  process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY
);

export const ALGOLIA_INDEX_NAME = process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME;

export const search = instantsearch({
  searchClient,
  indexName: ALGOLIA_INDEX_NAME,
  routing: {
    stateMapping: {
      stateToRoute(uiState: UiState) {
        const indexState = uiState[ALGOLIA_INDEX_NAME] || {};
        return {
          q: indexState.query,
          page: indexState.page,
          sortBy: indexState.sortBy,
          refinementList: {
            category: indexState.refinementList?.category,
            brand: indexState.refinementList?.brand,
          },
          range: {
            price: indexState.range?.price,
          },
        };
      },
      routeToState(routeState: any) {
        return {
          [ALGOLIA_INDEX_NAME]: {
            query: routeState.q,
            page: routeState.page,
            sortBy: routeState.sortBy,
            refinementList: {
              category: routeState.refinementList?.category,
              brand: routeState.refinementList?.brand,
            },
            range: {
              price: routeState.range?.price,
            },
          },
        };
      },
    },
    router: history(),
  },
});