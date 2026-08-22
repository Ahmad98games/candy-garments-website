const Order = require('../models/Order');
const { validateEnv } = require('../config/env');
const crypto = require('crypto');
const axios = require('axios');

const config = validateEnv();

/**
 * Payment Service
 * Handles payment processing for different payment methods
 */

// Process bank transfer payment
exports.processBankTransfer = async (paymentData) => {
  try {
    const { orderId, transactionId } = paymentData;

    // In a real implementation, you would validate the transaction ID
    // and update the order status accordingly

    // For now, we'll just mark the payment as pending
    await Order.findByIdAndUpdate(orderId, {
      'payment.status': 'pending',
      'payment.transactionId': transactionId,
      'status': 'processing'
    });

    return {
      success: true,
      status: 'pending',
      message: 'Bank transfer payment is being processed'
    };
  } catch (error) {
    console.error('Error processing bank transfer:', error);
    return {
      success: false,
      error: 'Failed to process bank transfer'
    };
  }
};

// Process JazzCash payment
exports.processJazzCashPayment = async (paymentData) => {
  try {
    const { orderId, amount, phoneNumber } = paymentData;

    // Get JazzCash credentials from central config
    const { jazzcash } = config.payments;
    const merchantId = jazzcash.merchantId;
    const password = jazzcash.password;
    const hashKey = jazzcash.hashKey;
    const returnUrl = jazzcash.returnUrl;

    // Generate a unique transaction ID
    const txnId = `OMN-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;

    // Get order details
    const order = await Order.findById(orderId);

    // Prepare data for JazzCash API
    const dateTime = new Date().toISOString().replace(/[-T:.Z]/g, '').substring(0, 14);
    const expiryDateTime = new Date(Date.now() + 24 * 60 * 60 * 1000)
      .toISOString().replace(/[-T:.Z]/g, '').substring(0, 14);

    const totalAmount = Math.round(parseFloat(amount) * 100); // Convert to lowest denomination

    // Create hash for security
    const hashString = `${hashKey}&${txnId}&${merchantId}&${password}&${totalAmount}&${expiryDateTime}`;
    const hash = crypto.createHash('sha256').update(hashString).digest('hex');

    // Prepare API request payload
    const payload = {
      pp_Version: '1.1',
      pp_TxnType: 'MWALLET',
      pp_Language: 'EN',
      pp_MerchantID: merchantId,
      pp_SubMerchantID: '',
      pp_Password: password,
      pp_BankID: '',
      pp_ProductID: '',
      pp_TxnRefNo: txnId,
      pp_Amount: totalAmount,
      pp_TxnCurrency: 'PKR',
      pp_TxnDateTime: dateTime,
      pp_BillReference: order.orderNumber,
      pp_Description: `Payment for order ${order.orderNumber}`,
      pp_CustomerID: order.customer.email,
      pp_CustomerMobile: phoneNumber,
      pp_CustomerEmail: order.customer.email,
      pp_MobileNumber: phoneNumber,
      pp_CNIC: '',
      pp_SecureHash: hash,
      ppmpf_1: orderId,
      pp_ReturnURL: returnUrl
    };

    // In development, return a mock response
    // In production, uncomment the following code to make the actual API call
    /*
    const response = await axios.post(
      'https://sandbox.jazzcash.com.pk/ApplicationAPI/API/2.0/Purchase/DoMWalletTransaction', 
      payload
    );
    */

    // Mock response for development
    const mockResponse = {
      data: {
        pp_ResponseCode: '000',
        pp_ResponseMessage: 'Success',
        pp_TxnRefNo: txnId,
        pp_Amount: totalAmount,
        pp_TxnDateTime: dateTime,
        pp_TxnCurrency: 'PKR',
        pp_AuthCode: '123456',
        pp_SettlementExpiry: expiryDateTime,
        pp_SecureHash: hash,
        pp_BankID: 'TBANK',
        pp_ProductID: 'RETL',
        pp_ResponseURL: `${returnUrl}?pp_ResponseCode=000&pp_TxnRefNo=${txnId}&ppmpf_1=${orderId}`
      }
    };

    // Update order with transaction details
    await Order.findByIdAndUpdate(orderId, {
      'payment.status': 'pending',
      'payment.transactionId': txnId,
      'payment.method': 'jazzcash',
      'payment.details': {
        phoneNumber,
        requestPayload: payload,
        responseData: mockResponse.data // In production, use response.data
      },
      'status': 'processing'
    });

    return {
      success: true,
      status: 'pending',
      transactionId: txnId,
      redirectUrl: mockResponse.data.pp_ResponseURL || null, // In production, use response.data.pp_ResponseURL
      message: 'JazzCash payment initiated'
    };
  } catch (error) {
    console.error('Error processing JazzCash payment:', error);
    return {
      success: false,
      error: 'Failed to process JazzCash payment'
    };
  }
};

// Process EasyPaisa payment
exports.processEasyPaisaPayment = async (paymentData) => {
  try {
    const { orderId, amount, phoneNumber } = paymentData;

    // Get EasyPaisa credentials from central config
    const { easypaisa } = config.payments;
    const merchantId = easypaisa.merchantId;
    const secretKey = easypaisa.secretKey;
    const returnUrl = easypaisa.returnUrl;

    // Generate a unique transaction ID
    const txnId = `OMN-EP-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;

    // Get order details
    const order = await Order.findById(orderId);

    // Format amount (EasyPaisa expects amount in PKR without decimal)
    const formattedAmount = Math.round(parseFloat(amount));

    // Generate checksum
    const checksumString = `${merchantId}${txnId}${formattedAmount}${secretKey}`;
    const checksum = crypto.createHash('md5').update(checksumString).digest('hex');

    // Prepare API request payload
    const payload = {
      merchantId: merchantId,
      storeId: merchantId,
      orderId: order.orderNumber,
      transactionAmount: formattedAmount,
      transactionType: 'MA', // Mobile Account
      mobileAccountNo: phoneNumber,
      emailAddress: order.customer.email,
      transactionId: txnId,
      tokenExpiry: '20', // Minutes
      checksum: checksum,
      returnUrl: returnUrl,
      merchantPaymentMethod: 'MWALLET'
    };

    // In development, return a mock response
    // In production, uncomment the following code to make the actual API call
    /*
    const response = await axios.post(
      'https://easypaystg.easypaisa.com.pk/easypay/Index.jsf', 
      payload
    );
    */

    // Mock response for development
    const mockResponse = {
      data: {
        status: 'SUCCESS',
        message: 'Transaction initiated successfully',
        transactionId: txnId,
        redirectUrl: `${returnUrl}?status=PAID&orderRefNumber=${order.orderNumber}&transactionId=${txnId}`
      }
    };

    // Update order with transaction details
    await Order.findByIdAndUpdate(orderId, {
      'payment.status': 'pending',
      'payment.transactionId': txnId,
      'payment.method': 'easypaisa',
      'payment.details': {
        phoneNumber,
        requestPayload: payload,
        responseData: mockResponse.data // In production, use response.data
      },
      'status': 'processing'
    });

    return {
      success: true,
      status: 'pending',
      transactionId: txnId,
      redirectUrl: mockResponse.data.redirectUrl || null, // In production, use response.data.redirectUrl
      message: 'EasyPaisa payment initiated'
    };
  } catch (error) {
    console.error('Error processing EasyPaisa payment:', error);
    return {
      success: false,
      error: 'Failed to process EasyPaisa payment'
    };
  }
};

// Process PayPal payment
exports.processPayPalPayment = async (paymentData) => {
  try {
    const { orderId, paypalOrderId } = paymentData;

    // In a real implementation, you would verify the PayPal payment
    // using the PayPal API and the order ID

    // Update the order status
    await Order.findByIdAndUpdate(orderId, {
      'payment.status': 'completed',
      'payment.transactionId': paypalOrderId,
      'status': 'processing'
    });

    return {
      success: true,
      status: 'completed',
      message: 'PayPal payment completed successfully'
    };
  } catch (error) {
    console.error('Error processing PayPal payment:', error);
    return {
      success: false,
      error: 'Failed to process PayPal payment'
    };
  }
};

// Process Western Union payment
exports.processWesternUnionPayment = async (paymentData) => {
  try {
    const { orderId, mtcnNumber } = paymentData;

    // In a real implementation, you would validate the MTCN number
    // and update the order status accordingly

    // For now, we'll just mark the payment as pending
    await Order.findByIdAndUpdate(orderId, {
      'payment.status': 'pending',
      'payment.transactionId': mtcnNumber,
      'status': 'processing'
    });

    return {
      success: true,
      status: 'pending',
      message: 'Western Union payment is being verified'
    };
  } catch (error) {
    console.error('Error processing Western Union payment:', error);
    return {
      success: false,
      error: 'Failed to process Western Union payment'
    };
  }
};

// Process wire transfer payment
exports.processWireTransfer = async (paymentData) => {
  try {
    const { orderId, wireTransferId } = paymentData;

    // In a real implementation, you would validate the wire transfer
    // and update the order status accordingly

    // For now, we'll just mark the payment as pending
    await Order.findByIdAndUpdate(orderId, {
      'payment.status': 'pending',
      'payment.transactionId': wireTransferId,
      'status': 'processing'
    });

    return {
      success: true,
      status: 'pending',
      message: 'Wire transfer payment is being processed'
    };
  } catch (error) {
    console.error('Error processing wire transfer:', error);
    return {
      success: false,
      error: 'Failed to process wire transfer'
    };
  }
};

// Process cash on delivery
exports.processCashOnDelivery = async (orderId) => {
  try {
    // Update the order status
    await Order.findByIdAndUpdate(orderId, {
      'payment.status': 'pending',
      'status': 'processing'
    });

    return {
      success: true,
      status: 'pending',
      message: 'Cash on delivery order placed successfully'
    };
  } catch (error) {
    console.error('Error processing COD order:', error);
    return {
      success: false,
      error: 'Failed to process cash on delivery order'
    };
  }
};

// Verify payment status
exports.verifyPayment = async (paymentId, paymentMethod) => {
  try {
    // In a real implementation, you would check the payment status
    // with the respective payment gateway or service

    let status = 'unknown';
    let verified = false;

    // Simulate verification based on payment method
    switch (paymentMethod) {
      case 'bank':
      case 'westernunion':
      case 'wire':
        // These methods require manual verification
        status = 'pending';
        verified = false;
        break;

      case 'jazzcash':
      case 'easypaisa':
        // Mobile payments might be pending or completed
        status = Math.random() > 0.5 ? 'completed' : 'pending';
        verified = status === 'completed';
        break;

      case 'paypal':
        // PayPal payments are usually completed immediately
        status = 'completed';
        verified = true;
        break;

      case 'cod':
        // COD is always pending until delivery
        status = 'pending';
        verified = false;
        break;

      default:
        status = 'unknown';
        verified = false;
    }

    return {
      success: true,
      verified,
      status,
      message: `Payment ${verified ? 'verified' : 'pending verification'}`
    };
  } catch (error) {
    console.error('Error verifying payment:', error);
    return {
      success: false,
      error: 'Failed to verify payment',
      verified: false,
      status: 'unknown'
    };
  }
};

// Calculate payment breakdown
exports.calculatePaymentBreakdown = (items, shippingAddress) => {
  // Calculate subtotal
  const subtotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);

  // Calculate tax (17% GST in Pakistan)
  const taxRate = 0.17;
  const tax = subtotal * taxRate;

  // Calculate shipping cost based on country
  let shipping = 500; // Default shipping cost for Pakistan (in PKR)

  if (shippingAddress.country && shippingAddress.country !== 'Pakistan') {
    // International shipping cost
    shipping = 5000; // Higher for international orders
  }

  // Calculate total
  const total = subtotal + tax + shipping;

  return {
    success: true,
    breakdown: {
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      shipping: shipping.toFixed(2),
      total: total.toFixed(2)
    }
  };
}; 