const { supabase } = require('../utils/supabase/server');
const logger = require('../services/logger');

// In-memory refund claims cache
let mockRefunds = [
  {
    id: 'ref_001',
    orderId: 'ord_101',
    orderNumber: 1042,
    customerName: 'Fatima Tariq',
    customerPhone: '0300 8472910',
    totalAmount: 18500,
    reason: 'Sleeve cuff embroidery thread loose and 1.5 inch measurement variance on chest.',
    evidenceUrls: ['https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600'],
    dispatchVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    status: 'UNDER_REVIEW',
    slaDeadline: new Date(Date.now() + 1.5 * 3600000).toISOString(),
    createdAt: new Date(Date.now() - 22.5 * 3600000).toISOString(),
  },
];

const createClaim = async (req, res) => {
  const { orderId, reason, evidenceUrls } = req.body;

  if (!orderId || !reason || !evidenceUrls || evidenceUrls.length === 0) {
    return res.status(400).json({ error: 'orderId, reason, and at least 1 evidenceUrl are required' });
  }

  const slaDeadline = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours SLA promise
  const claimId = `ref_${Date.now()}`;

  const newClaim = {
    id: claimId,
    orderId,
    orderNumber: Math.floor(1000 + Math.random() * 9000),
    customerName: 'Customer Claim',
    customerPhone: '0300 **** 1234',
    totalAmount: 18500,
    reason,
    evidenceUrls,
    dispatchVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    status: 'REQUESTED',
    slaDeadline,
    createdAt: new Date().toISOString(),
  };

  try {
    await supabase.from('refund_requests').insert({
      id: claimId,
      order_id: orderId,
      reason,
      evidence_urls: evidenceUrls,
      status: 'REQUESTED',
      sla_deadline: slaDeadline,
    });
  } catch {}

  mockRefunds = [newClaim, ...mockRefunds];
  logger.info(`New 24h SLA refund claim registered for order ${orderId}`);

  return res.json({ success: true, claim: newClaim });
};

const getAdminQueue = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('refund_requests')
      .select('*')
      .order('sla_deadline', { ascending: true });

    if (data && data.length > 0) {
      return res.json({ refunds: data });
    }
  } catch {}

  return res.json({ refunds: mockRefunds });
};

const updateStatus = async (req, res) => {
  const { id } = req.params;
  const { status, reviewNotes, payoutRef } = req.body;

  try {
    await supabase
      .from('refund_requests')
      .update({
        status,
        review_notes: reviewNotes,
        payout_ref: payoutRef,
        resolved_at: status === 'PAID_OUT' || status === 'REJECTED' ? new Date().toISOString() : null,
      })
      .eq('id', id);
  } catch {}

  mockRefunds = mockRefunds.map((r) =>
    r.id === id ? { ...r, status, reviewNotes: reviewNotes || r.reviewNotes, payoutRef: payoutRef || r.payoutRef } : r
  );

  logger.info(`Refund claim ${id} transitioned to ${status}`);
  return res.json({ success: true, message: `Status updated to ${status}` });
};

module.exports = {
  createClaim,
  getAdminQueue,
  updateStatus,
};
