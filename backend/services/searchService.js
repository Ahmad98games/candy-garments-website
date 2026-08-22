/**
 * Advanced Search & Filter Service
 * Features:
 * - Full-text search with auto-suggestions
 * - Price range filtering
 * - Category, tags, ratings filters
 * - Sort options
 * - Search analytics
 */

const mongoose = require('mongoose');

const SearchHistorySchema = new mongoose.Schema({
  userId: String, // Optional: track for personalization
  query: {
    type: String,
    required: true,
    index: true
  },
  filters: mongoose.Schema.Types.Mixed,
  resultsCount: Number,
  clickedProductId: Number, // Which product user clicked
  timestamp: {
    type: Date,
    default: Date.now,
    expires: 2592000 // Auto-delete after 30 days
  }
});

class SearchService {
  constructor(products = []) {
    this.products = products;
    this.SearchHistory = mongoose.model('SearchHistory', SearchHistorySchema);
  }

  /**
   * Advanced search with filters
   * @param {String} query - Search query
   * @param {Object} filters - { minPrice, maxPrice, category, tags, minRating, inStock }
   * @param {String} sortBy - 'price-asc', 'price-desc', 'newest', 'rating', 'popularity'
   * @returns {Array} Filtered and sorted products
   */
  search(query, filters = {}, sortBy = 'relevance') {
    let results = [...this.products];

    // 1. TEXT SEARCH - Full-text matching
    if (query && query.trim()) {
      const q = query.toLowerCase();
      results = results.filter(p => 
        p.title?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.ingredients?.some(ing => ing.toLowerCase().includes(q))
      );
      
      // Rank by relevance
      results = results.map(p => ({
        ...p,
        relevanceScore: this._calculateRelevance(p, q)
      }));
    }

    // 2. PRICE FILTER
    if (filters.minPrice !== undefined) {
      results = results.filter(p => p.price >= filters.minPrice);
    }
    if (filters.maxPrice !== undefined) {
      results = results.filter(p => p.price <= filters.maxPrice);
    }

    // 3. CATEGORY FILTER
    if (filters.category && filters.category.length > 0) {
      if (typeof filters.category === 'string') {
        results = results.filter(p => p.category === filters.category);
      } else {
        results = results.filter(p => filters.category.includes(p.category));
      }
    }

    // 4. TAGS/INGREDIENTS FILTER
    if (filters.tags && filters.tags.length > 0) {
      results = results.filter(p => {
        if (!p.ingredients) return false;
        return filters.tags.some(tag => 
          p.ingredients.some(ing => ing.toLowerCase().includes(tag.toLowerCase()))
        );
      });
    }

    // 5. RATING FILTER
    if (filters.minRating !== undefined) {
      results = results.filter(p => (p.rating || 0) >= filters.minRating);
    }

    // 6. STOCK FILTER
    if (filters.inStock === true) {
      results = results.filter(p => p.inStock !== false);
    }

    // 7. SKIN TYPE FILTER
    if (filters.skinType && filters.skinType.length > 0) {
      if (typeof filters.skinType === 'string') {
        results = results.filter(p => p.skinType === filters.skinType);
      } else {
        results = results.filter(p => filters.skinType.includes(p.skinType));
      }
    }

    // 8. SORT
    results = this._applySort(results, sortBy);

    return results;
  }

  /**
   * Get auto-suggestions based on query
   * @param {String} query - Partial query
   * @param {Number} limit - Max suggestions
   */
  getSuggestions(query, limit = 8) {
    if (!query || query.length < 2) return [];

    const q = query.toLowerCase();
    const suggestions = new Set();

    // Suggest from product titles
    this.products.forEach(p => {
      if (p.title.toLowerCase().includes(q)) {
        suggestions.add(p.title);
      }
    });

    // Suggest from ingredients
    this.products.forEach(p => {
      if (p.ingredients) {
        p.ingredients.forEach(ing => {
          if (ing.toLowerCase().includes(q)) {
            suggestions.add(ing);
          }
        });
      }
    });

    // Suggest from categories
    this.products.forEach(p => {
      if (p.category && p.category.toLowerCase().includes(q)) {
        suggestions.add(p.category);
      }
    });

    return Array.from(suggestions).slice(0, limit);
  }

  /**
   * Get available filter options (for UI dropdowns)
   */
  getFilterOptions() {
    const prices = this.products.map(p => p.price);
    const categories = [...new Set(this.products.map(p => p.category))];
    const ratings = [5, 4, 3, 2, 1];
    const skinTypes = [...new Set(this.products.map(p => p.skinType).filter(s => s))];
    
    let allIngredients = new Set();
    this.products.forEach(p => {
      if (p.ingredients) {
        p.ingredients.forEach(ing => allIngredients.add(ing));
      }
    });

    return {
      priceRange: {
        min: Math.min(...prices),
        max: Math.max(...prices),
        step: 50 // For price slider
      },
      categories: categories.filter(c => c),
      ratings: ratings,
      skinTypes: skinTypes,
      ingredients: Array.from(allIngredients)
    };
  }

  /**
   * Log search for analytics
   */
  async logSearch(query, filters, resultsCount, userId = null) {
    try {
      const search = new this.SearchHistory({
        userId,
        query,
        filters,
        resultsCount,
        timestamp: new Date()
      });
      await search.save();
      return true;
    } catch (error) {
      console.error('Error logging search:', error);
      return false;
    }
  }

  /**
   * Log product click from search results
   */
  async logSearchClick(query, productId, userId = null) {
    try {
      await this.SearchHistory.updateOne(
        { query, timestamp: { $gte: new Date(Date.now() - 60000) } },
        { clickedProductId: productId }
      );
      return true;
    } catch (error) {
      console.error('Error logging search click:', error);
      return false;
    }
  }

  /**
   * Get popular searches
   */
  async getPopularSearches(limit = 10, days = 7) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const popular = await this.SearchHistory.aggregate([
        {
          $match: { timestamp: { $gte: cutoffDate } }
        },
        {
          $group: {
            _id: '$query',
            count: { $sum: 1 },
            clicks: { $sum: { $cond: ['$clickedProductId', 1, 0] } }
          }
        },
        {
          $sort: { clicks: -1, count: -1 }
        },
        {
          $limit: limit
        }
      ]);

      return popular.map(item => ({
        query: item._id,
        searches: item.count,
        clicks: item.clicks,
        clickRate: ((item.clicks / item.count) * 100).toFixed(1) + '%'
      }));
    } catch (error) {
      console.error('Error getting popular searches:', error);
      return [];
    }
  }

  /**
   * Calculate relevance score for search results
   * @private
   */
  _calculateRelevance(product, query) {
    let score = 0;

    // Exact title match: 100 points
    if (product.title.toLowerCase() === query) score += 100;
    
    // Title starts with query: 80 points
    else if (product.title.toLowerCase().startsWith(query)) score += 80;
    
    // Title contains query: 60 points
    else if (product.title.toLowerCase().includes(query)) score += 60;

    // Description match: +20 points
    if (product.description?.toLowerCase().includes(query)) score += 20;

    // Ingredient match: +15 points
    if (product.ingredients?.some(ing => ing.toLowerCase().includes(query))) score += 15;

    // Featured product: +10 bonus
    if (product.featured) score += 10;

    // In stock bonus: +5
    if (product.inStock !== false) score += 5;

    // High rating bonus: +up to 10
    if (product.rating) score += (product.rating / 5) * 10;

    return score;
  }

  /**
   * Apply sorting to results
   * @private
   */
  _applySort(results, sortBy) {
    const sorted = [...results];

    switch (sortBy) {
      case 'price-asc':
        return sorted.sort((a, b) => a.price - b.price);
      
      case 'price-desc':
        return sorted.sort((a, b) => b.price - a.price);
      
      case 'newest':
        return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      case 'rating':
        return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      
      case 'popularity':
        return sorted.sort((a, b) => (b.views || 0) - (a.views || 0));
      
      case 'relevance':
      default:
        return sorted.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
    }
  }
}

module.exports = SearchService;
