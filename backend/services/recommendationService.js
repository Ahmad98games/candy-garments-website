/**
 * Recommendation Engine Service
 * Rule-based intelligent product recommendations
 */

const { Recommendation, RecentlyViewed, BoughtTogether } = require('../models/Recommendation');
const axios = require('axios');

class RecommendationService {
  /**
   * Track recently viewed product
   */
  static async trackRecentView(userId, productId, timeSpent = 0) {
    try {
      const view = new RecentlyViewed({
        userId,
        productId,
        timeSpent
      });
      await view.save();

      // Keep only last 20 viewed products
      const views = await RecentlyViewed.find({ userId })
        .sort({ viewedAt: -1 })
        .skip(20);
      
      if (views.length > 0) {
        await RecentlyViewed.deleteMany({ 
          _id: { $in: views.map(v => v._id) } 
        });
      }

      return true;
    } catch (error) {
      console.error('Error tracking view:', error);
      return false;
    }
  }

  /**
   * Get similar products based on:
   * - Same category
   * - Similar price range (±20%)
   * - Common tags/ingredients
   */
  static async getSimilarProducts(productId, products, limit = 5) {
    try {
      const currentProduct = products.find(p => p.id === productId);
      if (!currentProduct) return [];

      const priceRange = {
        min: currentProduct.price * 0.8,
        max: currentProduct.price * 1.2
      };

      const similar = products
        .filter(p => 
          p.id !== productId &&
          p.category === currentProduct.category &&
          p.price >= priceRange.min &&
          p.price <= priceRange.max
        )
        .slice(0, limit)
        .map(p => ({
          ...p,
          matchScore: this._calculateSimilarityScore(currentProduct, p)
        }))
        .sort((a, b) => b.matchScore - a.matchScore);

      return similar;
    } catch (error) {
      console.error('Error getting similar products:', error);
      return [];
    }
  }

  /**
   * Get frequently bought together products
   */
  static async getFrequentlyBoughtTogether(productId, limit = 4) {
    try {
      const bought = await BoughtTogether.find({
        $or: [
          { product1Id: productId },
          { product2Id: productId }
        ]
      })
      .sort({ frequency: -1 })
      .limit(limit);

      return bought.map(item => ({
        productId: item.product1Id === productId ? item.product2Id : item.product1Id,
        frequency: item.frequency,
        reason: `Customers often buy this with your selection`
      }));
    } catch (error) {
      console.error('Error getting frequently bought together:', error);
      return [];
    }
  }

  /**
   * Get recently viewed products for user
   */
  static async getRecentlyViewed(userId, limit = 5) {
    try {
      const viewed = await RecentlyViewed.find({ userId })
        .sort({ viewedAt: -1 })
        .limit(limit)
        .select('productId viewedAt');

      return viewed.map(item => ({
        productId: item.productId,
        viewedAt: item.viewedAt
      }));
    } catch (error) {
      console.error('Error getting recently viewed:', error);
      return [];
    }
  }

  /**
   * Get trending products (frequently viewed + bought)
   */
  static async getTrendingProducts(products, limit = 6, timeframeDays = 7) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - timeframeDays);

      const trending = await RecentlyViewed.aggregate([
        {
          $match: { viewedAt: { $gte: cutoffDate } }
        },
        {
          $group: {
            _id: '$productId',
            viewCount: { $sum: 1 },
            lastViewed: { $max: '$viewedAt' }
          }
        },
        {
          $sort: { viewCount: -1 }
        },
        {
          $limit: limit
        }
      ]);

      return trending.map(item => {
        const product = products.find(p => p.id === item._id);
        return {
          ...product,
          views: item.viewCount,
          badge: 'Trending'
        };
      }).filter(p => p);
    } catch (error) {
      console.error('Error getting trending products:', error);
      return [];
    }
  }

  /**
   * Track purchase for "frequently bought together" analysis
   */
  static async trackPurchase(orderedProductIds) {
    try {
      // Create pairs of products bought together
      for (let i = 0; i < orderedProductIds.length; i++) {
        for (let j = i + 1; j < orderedProductIds.length; j++) {
          const product1Id = Math.min(orderedProductIds[i], orderedProductIds[j]);
          const product2Id = Math.max(orderedProductIds[i], orderedProductIds[j]);

          await BoughtTogether.findOneAndUpdate(
            { product1Id, product2Id },
            { $inc: { frequency: 1 }, lastUpdated: new Date() },
            { upsert: true }
          );
        }
      }

      return true;
    } catch (error) {
      console.error('Error tracking purchase:', error);
      return false;
    }
  }

  /**
   * Get personalized recommendations for logged-in user
   */
  static async getPersonalizedRecommendations(userId, products, limit = 8) {
    try {
      // Get user's viewing history
      const recentlyViewed = await RecentlyViewed.find({ userId })
        .sort({ viewedAt: -1 })
        .limit(3)
        .select('productId');

      if (recentlyViewed.length === 0) {
        // No history - return trending products
        return this.getTrendingProducts(products, limit);
      }

      // Get similar products to what they viewed
      const recommendations = new Set();
      
      for (const view of recentlyViewed) {
        const similar = await this.getSimilarProducts(view.productId, products, 3);
        similar.forEach(p => recommendations.add(p.id));
      }

      // Get frequently bought together with their viewed items
      for (const view of recentlyViewed) {
        const fbt = await this.getFrequentlyBoughtTogether(view.productId, 2);
        fbt.forEach(p => recommendations.add(p.productId));
      }

      // Convert to array and get product details
      const recommendedIds = Array.from(recommendations).slice(0, limit);
      return recommendedIds.map(id => products.find(p => p.id === id)).filter(p => p);
    } catch (error) {
      console.error('Error getting personalized recommendations:', error);
      return [];
    }
  }

  /**
   * Calculate similarity score between two products (0-100)
   * @private
   */
  static _calculateSimilarityScore(product1, product2) {
    let score = 50; // Base score

    // Same category: +20 points
    if (product1.category === product2.category) score += 20;

    // Price similarity: up to +30 points
    const priceDiff = Math.abs(product1.price - product2.price);
    const avgPrice = (product1.price + product2.price) / 2;
    const priceSimilarity = 1 - (priceDiff / avgPrice);
    score += priceSimilarity * 30;

    // Same skin type (if available): +10 points
    if (product1.skinType === product2.skinType) score += 10;

    // Common ingredients: +10 points
    if (product1.ingredients && product2.ingredients) {
      const commonIngredients = product1.ingredients.filter(ing => 
        product2.ingredients.includes(ing)
      );
      if (commonIngredients.length > 0) score += 10;
    }

    return Math.min(100, Math.round(score));
  }

  /**
   * Get seasonal recommendations
   */
  static async getSeasonalRecommendations(products, limit = 5) {
    const month = new Date().getMonth();
    const season = month >= 2 && month <= 4 ? 'spring' :
                   month >= 5 && month <= 7 ? 'summer' :
                   month >= 8 && month <= 10 ? 'autumn' : 'winter';

    // Filter products by seasonal tags
    const seasonal = products
      .filter(p => p.season === season || p.seasons?.includes(season))
      .slice(0, limit)
      .map(p => ({ ...p, badge: `Perfect for ${season}!` }));

    return seasonal;
  }
}

module.exports = RecommendationService;
