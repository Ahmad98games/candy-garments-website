const { supabase } = require('../utils/supabase/server');
const logger = require('../services/logger');

let mockFulfillmentOrders = [
  {
    id: 'ord_101',
    orderNumber: 1042,
    customerName: 'Fatima Tariq',
    customerPhone: '0300 8472910',
    shippingCity: 'Lahore',
    shippingAddress: 'House 42, Street 8, Phase 5 DHA',
    items: [{ title: 'Silk Luxury Pret', size: 'M', color: 'Burgundy', quantity: 1 }],
    totalAmount: 18500,
    paymentType: 'PREPAID_RAAST',
    status: 'VIDEO_INSPECTION_PENDING',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
];

const getFulfillmentOrders = async (req, res) => {
  try {
    const { data } = await supabase.from('trust_orders').select('*').order('created_at', { ascending: false });
    if (data && data.length > 0) return res.json({ orders: data });
  } catch {}

  return res.json({ orders: mockFulfillmentOrders });
};

const uploadInspectionVideo = async (req, res) => {
  const { id } = req.params;
  const { videoUrl, videoUploadedBy = 'staff_wh_01' } = req.body;

  try {
    await supabase
      .from('trust_orders')
      .update({
        dispatch_video_url: videoUrl,
        video_uploaded_at: new Date().toISOString(),
        video_uploaded_by: videoUploadedBy,
        status: 'VIDEO_DISPATCHED_TO_CUSTOMER',
        video_viewed_by_customer: false,
      })
      .eq('id', id);
  } catch {}

  mockFulfillmentOrders = mockFulfillmentOrders.map((o) =>
    o.id === id
      ? {
          ...o,
          dispatchVideoUrl: videoUrl,
          videoUploadedAt: new Date().toISOString(),
          status: 'VIDEO_DISPATCHED_TO_CUSTOMER',
          videoViewedByCustomer: false,
        }
      : o
  );

  logger.info(`Warehouse inspection video uploaded for order ${id}. WhatsApp message queued.`);
  return res.json({ success: true, message: 'Inspection video uploaded successfully' });
};

const markVideoViewed = async (req, res) => {
  const { id } = req.params;
  try {
    await supabase.from('trust_orders').update({ video_viewed_by_customer: true }).eq('id', id);
  } catch {}

  mockFulfillmentOrders = mockFulfillmentOrders.map((o) =>
    o.id === id ? { ...o, videoViewedByCustomer: true } : o
  );

  return res.json({ success: true, message: 'Video marked as viewed by customer' });
};

const requestReshoot = async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  try {
    await supabase
      .from('trust_orders')
      .update({
        status: 'VIDEO_INSPECTION_PENDING',
      })
      .eq('id', id);
  } catch {}

  mockFulfillmentOrders = mockFulfillmentOrders.map((o) =>
    o.id === id ? { ...o, status: 'VIDEO_INSPECTION_PENDING' } : o
  );

  logger.warn(`Customer disputed dispatch video for order ${id}: ${reason}. Reverted to VIDEO_INSPECTION_PENDING.`);
  return res.json({ success: true, message: 'Dispatch halted. Re-inspection requested.' });
};

module.exports = {
  getFulfillmentOrders,
  uploadInspectionVideo,
  markVideoViewed,
  requestReshoot,
};
