export const AFTERNIC_CONFIG = {
  API_KEY: process.env.AFTERNIC_API_KEY || '',
  USERNAME: process.env.AFTERNIC_USERNAME || '',
  SYNC_INTERVAL: 12 * 60 * 60 * 1000, // 12 hours in milliseconds
  BATCH_SIZE: 100, // Number of domains to fetch per API call
};

// Category metadata for UI display
export const CATEGORIES_UI_CONFIG = {
  // Default colors for category badges
  defaultColor: '#6b7280', // Gray
  trendingIcon: '🔥', // Fire emoji for trending categories
  
  // Header text for different section types
  categoryHeaders: {
    trending: 'Trending Categories',
    popular: 'Popular Categories',
    all: 'All Categories'
  },
  
  // Sorting priorities - used to determine display order
  sortPriority: {
    'ai': 10,
    'crypto': 9,
    'business': 8,
    'technology': 7,
    'finance': 6,
    'gaming': 5,
    'social': 4,
    'entertainment': 3,
    'shopping': 2,
    'eco': 1
  }
};