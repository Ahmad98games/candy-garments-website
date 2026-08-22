/**
 * Enhanced Cart Service
 * Features:
 * - Discount code validation
 * - Tax calculation (Pakistan tax rules)
 * - Shipping cost estimation
 * - Coupon codes
 * - Stock validation
 * - Real-time price updates
 */

const mongoose = require('mongoose');
const { InventoryService } = require('../models/Inventory');

const toObjectId = (value) => {
  if (mongoose.Types.ObjectId.isValid(value)) {
    return new mongoose.Types.ObjectId(value);
  }
  return null;
};

class CartService {
  /**
   * Calculate cart total with discounts, tax, shipping
   */
  static async calculateCartTotal(cartItems, shippingMethod = 'standard', couponCode = null) {
    try {
      // Validate stock and get current prices
      let subtotal = 0;
      const validatedItems = [];

      for (const item of cartItems) {
        const productObjectId = toObjectId(item.productId);

        if (!productObjectId) {
          return {
            success: false,
            error: `Invalid productId provided for ${item.productId}`
          };
        }

        const stock = await InventoryService.getAvailableStock(productObjectId);
        
        if (stock < item.quantity) {
          return {
            success: false,
            error: `Insufficient stock for product ${item.productId}. Available: ${stock}`
          };
        }

        validatedItems.push({
          ...item,
          stockAvailable: stock
        });

        subtotal += (item.price || 0) * item.quantity;
      }

      // Calculate discount
      let discountAmount = 0;
      let discountCode = null;

      if (couponCode) {
        const coupon = await this._validateCoupon(couponCode, subtotal);
        if (coupon.valid) {
          discountAmount = coupon.discount;
          discountCode = coupon.code;
        }
      }

      const subtotalAfterDiscount = subtotal - discountAmount;

      // Calculate tax (Pakistan: 17% GST standard)
      const taxRate = 0.17; // 17% GST
      const taxAmount = Math.round(subtotalAfterDiscount * taxRate * 100) / 100;

      // Calculate shipping
      const shippingCost = this._calculateShipping(subtotalAfterDiscount, shippingMethod);

      // Total
      const total = subtotalAfterDiscount + taxAmount + shippingCost;

      return {
        success: true,
        breakdown: {
          subtotal: Math.round(subtotal * 100) / 100,
          discount: {
            code: discountCode,
            amount: Math.round(discountAmount * 100) / 100,
            percentage: coupon?.percentage || 0
          },
          subtotalAfterDiscount: Math.round(subtotalAfterDiscount * 100) / 100,
          tax: {
            rate: taxRate * 100,
            amount: taxAmount
          },
          shipping: {
            method: shippingMethod,
            cost: shippingCost
          },
          total: Math.round(total * 100) / 100
        },
        items: validatedItems
      };
    } catch (error) {
      console.error('Error calculating cart total:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Validate coupon code
   * @private
   */
  static async _validateCoupon(couponCode, subtotal) {
    const coupons = {
      'WELCOME10': {
        valid: true,
        percentage: 10,
        minAmount: 0,
        code: 'WELCOME10'
      },
      'SAVE20': {
        valid: true,
        percentage: 20,
        minAmount: 2000,
        code: 'SAVE20'
      },
      'SUMMER15': {
        valid: true,
        percentage: 15,
        minAmount: 1500,
        code: 'SUMMER15'
      },
      'FLASH25': {
        valid: true,
        percentage: 25,
        minAmount: 3000,
        code: 'FLASH25'
      }
    };

    const coupon = coupons[couponCode?.toUpperCase()];

    if (!coupon) {
      return {
        valid: false,
        message: 'Invalid coupon code'
      };
    }

    if (subtotal < coupon.minAmount) {
      return {
        valid: false,
        message: `Minimum order amount required: PKR ${coupon.minAmount}`
      };
    }

    return {
      valid: true,
      code: coupon.code,
      percentage: coupon.percentage,
      discount: Math.round((subtotal * coupon.percentage / 100) * 100) / 100
    };
  }

  /**
   * Calculate shipping cost based on method and subtotal
   * Pakistan-specific
   * @private
   */
  static _calculateShipping(subtotal, method = 'standard') {
    const shippingRates = {
      standard: {
        name: 'Standard Delivery (3-5 days)',
        baseCost: 250,
        freeAbove: 3000 // Free shipping on orders above 3000
      },
      express: {
        name: 'Express Delivery (1-2 days)',
        baseCost: 500,
        freeAbove: 5000
      },
      overnight: {
        name: 'Overnight Delivery',
        baseCost: 750,
        freeAbove: 7000
      },
      pickup: {
        name: 'Store Pickup (Free)',
        baseCost: 0,
        freeAbove: 0
      }
    };

    const rate = shippingRates[method] || shippingRates.standard;

    if (subtotal >= rate.freeAbove) {
      return 0;
    }

    return rate.baseCost;
  }

  /**
   * Get available shipping methods
   */
  static getShippingMethods() {
    return [
      {
        id: 'standard',
        name: 'Standard Delivery (3-5 days)',
        baseCost: 250,
        estimatedDays: '3-5'
      },
      {
        id: 'express',
        name: 'Express Delivery (1-2 days)',
        baseCost: 500,
        estimatedDays: '1-2'
      },
      {
        id: 'overnight',
        name: 'Overnight Delivery',
        baseCost: 750,
        estimatedDays: 'Next day'
      },
      {
        id: 'pickup',
        name: 'Store Pickup (Free)',
        baseCost: 0,
        estimatedDays: 'Same day'
      }
    ];
  }

  /**
   * Validate coupon code (without calculating)
   */
  static async validateCoupon(couponCode) {
    const result = await this._validateCoupon(couponCode, 0);

    if (result.valid) {
      return {
        success: true,
        coupon: {
          code: result.code,
          percentage: result.percentage,
          message: `${result.percentage}% discount applied!`
        }
      };
    } else {
      return {
        success: false,
        error: result.message
      };
    }
  }

  /**
   * Get available coupon codes (for display)
   */
  static getAvailableCoupons() {
    return [
      {
        code: 'WELCOME10',
        description: 'Welcome bonus - 10% off on first purchase',
        discount: 10,
        minAmount: 0
      },
      {
        code: 'SAVE20',
        description: 'Save 20% on orders above PKR 2000',
        discount: 20,
        minAmount: 2000
      },
      {
        code: 'SUMMER15',
        description: 'Summer sale - 15% off on orders above PKR 1500',
        discount: 15,
        minAmount: 1500
      },
      {
        code: 'FLASH25',
        description: 'Flash sale - 25% off on orders above PKR 3000',
        discount: 25,
        minAmount: 3000
      }
    ];
  }

  /**
   * Calculate bulk discount
   */
  static calculateBulkDiscount(cartItems) {
    const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    
    let discount = 0;
    if (totalQuantity >= 5) discount = 0.05; // 5% for 5+ items
    if (totalQuantity >= 10) discount = 0.10; // 10% for 10+ items
    if (totalQuantity >= 20) discount = 0.15; // 15% for 20+ items

    return {
      applicable: discount > 0,
      percentage: discount * 100,
      minQuantity: totalQuantity
    };
  }

  /**
   * Get price in installments (for marketing)
   */
  static getInstallmentOptions(totalAmount) {
    const installmentPlans = [
      {
        months: 3,
        monthlyAmount: Math.round((totalAmount / 3) * 100) / 100
      },
      {
        months: 6,
        monthlyAmount: Math.round((totalAmount / 6) * 100) / 100
      },
      {
        months: 12,
        monthlyAmount: Math.round((totalAmount / 12) * 100) / 100
      }
    ];

    return {
      available: totalAmount > 5000, // Available for orders above 5000
      plans: installmentPlans,
      provider: 'JazzCash/EasyPaisa Installments'
    };
  }

  /**
   * Estimate delivery date
   */
  static estimateDeliveryDate(shippingMethod) {
    const today = new Date();
    const estimates = {
      standard: 5, // 5 days
      express: 2,  // 2 days
      overnight: 1, // 1 day
      pickup: 0 // Same day
    };

    const days = estimates[shippingMethod] || 5;
    const deliveryDate = new Date(today);
    deliveryDate.setDate(deliveryDate.getDate() + days);

    return {
      method: shippingMethod,
      estimatedDate: deliveryDate.toISOString().split('T')[0],
      estimatedDays: days
    };
  }
}

module.exports = CartService;
