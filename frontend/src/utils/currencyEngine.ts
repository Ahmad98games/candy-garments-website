/**
 * Candy E-Commerce High-Precision Financial Data & Currency Engine
 * Prevents floating-point rounding errors by performing calculations in integer cents/paisa.
 */

export const toCents = (amount: number): number => {
  if (isNaN(amount) || amount === undefined || amount === null) return 0;
  return Math.round(Number(amount) * 100);
};

export const fromCents = (cents: number): number => {
  if (isNaN(cents) || cents === undefined || cents === null) return 0;
  return cents / 100;
};

const pkrFormatter = new Intl.NumberFormat('en-PK', {
  style: 'currency',
  currency: 'PKR',
  maximumFractionDigits: 0,
});

export const formatCurrencyPKR = (amount: number | string): string => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return 'PKR 0';
  return pkrFormatter.format(num);
};

export interface OrderItemInput {
  price: number;
  quantity: number;
}

export interface CalculatedOrderTotal {
  subtotal: number;
  discountAmount: number;
  taxableAmount: number;
  deliveryFee: number;
  grandTotal: number;
  subtotalCents: number;
  discountCents: number;
  deliveryCents: number;
  grandTotalCents: number;
  formattedSubtotal: string;
  formattedGrandTotal: string;
}

export const calculateOrderTotal = ({
  items,
  discountPercent = 0,
  deliveryFee = 0,
}: {
  items: OrderItemInput[];
  discountPercent?: number;
  deliveryFee?: number;
}): CalculatedOrderTotal => {
  const safeItems = Array.isArray(items) ? items : [];

  const subtotalCents = safeItems.reduce((acc, item) => {
    const itemPriceCents = toCents(Number(item.price) || 0);
    const qty = Math.max(0, Number(item.quantity) || 0);
    return acc + itemPriceCents * qty;
  }, 0);

  const safeDiscountPercent = Math.min(100, Math.max(0, discountPercent));
  const discountCents = Math.round(subtotalCents * (safeDiscountPercent / 100));
  const taxableAmountCents = Math.max(0, subtotalCents - discountCents);
  const deliveryCents = toCents(deliveryFee);
  const grandTotalCents = taxableAmountCents + deliveryCents;

  const subtotal = fromCents(subtotalCents);
  const discountAmount = fromCents(discountCents);
  const taxableAmount = fromCents(taxableAmountCents);
  const delivery = fromCents(deliveryCents);
  const grandTotal = fromCents(grandTotalCents);

  return {
    subtotal,
    discountAmount,
    taxableAmount,
    deliveryFee: delivery,
    grandTotal,
    subtotalCents,
    discountCents,
    deliveryCents,
    grandTotalCents,
    formattedSubtotal: formatCurrencyPKR(subtotal),
    formattedGrandTotal: formatCurrencyPKR(grandTotal),
  };
};
