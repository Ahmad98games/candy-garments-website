/**
 * OMNORA WHATSAPP UPLINK
 * Handles message generation and API redirects.
 */

interface OrderItem {
    id?: string;
    name: string;
    variant?: string; // Scent/Variant detail
    price: number;
    quantity: number;
}

// Flexible interface to handle both Backend Response and Local State
export interface OrderData {
    _id?: string;
    orderNumber: string; // Required now
    customerInfo?: { name: string; email: string; phone: string; };
    guestCustomer?: { name: string; email: string; phone: string; };
    customer?: { name: string; email: string; phone: string; }; // BACKEND FORMAT
    shippingAddress?: {
        address: string;
        city: string;
        state?: string;
        postalCode?: string;
        country: string;
    };
    items?: OrderItem[];
    paymentMethod?: string;
    total?: number;       // Frontend State
    totalAmount?: number; // Backend DB
    notes?: string;
}

const WHATSAPP_BUSINESS_NUMBER = '923311498773'; // Candy Official Line (0331-1498773)

/**
 * Format Currency
 */
const formatPrice = (amount: number) => `PKR ${amount.toLocaleString()}`;

/**
 * Format Payment Method for Human Reading
 */
function formatPaymentMethod(method?: string): string {
    if (!method) return '100% Advance Bank Transfer (Faysal Bank)';
    const methods: Record<string, string> = {
        cod: '100% Advance Bank Transfer',
        faysal: 'Faysal Bank Transfer (Official)',
        meezan: 'Meezan Bank Transfer',
        jazzcash: 'JazzCash Mobile',
        easypaisa: 'EasyPaisa Mobile',
        payoneer: 'Payoneer / Wise'
    };
    return methods[method] || method.toUpperCase();
}

/**
 * Get Total Amount Safely
 */
function getOrderTotal(orderData: OrderData): string {
    const amount = orderData.totalAmount ?? orderData.total ?? 0;
    return formatPrice(amount);
}

/**
 * Generate Core Message Body
 */
function formatOrderDetailsBody(orderData: OrderData): string {
    const { orderNumber, customerInfo, guestCustomer, customer, shippingAddress, items, paymentMethod, notes } = orderData;

    // Fallbacks - PRIORITIZE 'customer' (Backend Format)
    const name = customer?.name || customerInfo?.name || guestCustomer?.name || 'Guest';
    const email = customer?.email || customerInfo?.email || guestCustomer?.email || 'N/A';
    const phone = customer?.phone || customerInfo?.phone || guestCustomer?.phone || 'N/A';

    // Address Composition
    const addr = shippingAddress?.address || 'N/A';
    const city = shippingAddress?.city || 'Unknown';
    const country = shippingAddress?.country || 'Pakistan';

    // Items List - Include Scent if available
    const itemsList = items?.map(i => {
        const variantInfo = i.variant ? ` [${i.variant}]` : '';
        return `• ${i.name}${variantInfo} (x${i.quantity})`;
    }).join('\n') || 'No items listed';

    return `*ORDER ID:* ${orderNumber}
*AMOUNT:* ${getOrderTotal(orderData)}
--------------------------------
*STATUS:* 🟡 Pending Bank Transfer Verification
*DATE:* ${new Date().toLocaleString()}
*DELIVERY:* 🚚 TCS Express Courier (2-3 Business Days)
--------------------------------
*CUSTOMER DATA*
👤 Name: ${name}
📧 Email: ${email}
📞 Contact: ${phone}

*SHIPPING DETAILS*
🏠 Address: ${addr}
📍 City: ${city}
🌍 Country: ${country}

*MANIFEST*
${itemsList}

*PAYMENT CHANNEL*
💳 Method: ${formatPaymentMethod(paymentMethod)}
${notes ? `\n📝 *NOTES:* ${notes}` : ''}`;
}

/**
 * SCENARIO A: User clicks "I've Paid"
 */
export function generatePaymentReceiptMessage(orderData: OrderData): string {
    return `✨ *CANDY BOUTIQUE PAYMENT RECEIPT*
    
I have completed the payment for my luxury outfit order.
Please verify and prepare my ensemble for stitching & dispatch.

${formatOrderDetailsBody(orderData)}

*ATTACHMENT:* [Sending Receipt Image...]`;
}

/**
 * SCENARIO B: User clicks "Continue on WhatsApp" (Automation)
 */
export function generateNewOrderMessage(orderData: OrderData): string {
    return `✨ *NEW CANDY BOUTIQUE ORDER*

I would like to finalize my Candy Boutique order.

${formatOrderDetailsBody(orderData)}

Please confirm custom stitching & dispatch details.`;
}

/**
 * Build the URL
 */
export function generateWhatsAppURL(message: string): string {
    return `https://wa.me/${WHATSAPP_BUSINESS_NUMBER}?text=${encodeURIComponent(message)}`;
}

/**
 * Execute Redirect
 */
export function openWhatsApp(orderData: OrderData, type: 'payment' | 'automation' = 'automation'): boolean {
    try {
        const message = type === 'payment'
            ? generatePaymentReceiptMessage(orderData)
            : generateNewOrderMessage(orderData);

        const url = generateWhatsAppURL(message);
        window.open(url, '_blank');
        return true;
    } catch (error) {
        console.error('WhatsApp Uplink Failed:', error);
        return false;
    }
}