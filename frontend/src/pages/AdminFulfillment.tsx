import React, { useState, useEffect, useRef } from 'react';
import {
  Video, CheckCircle2, Truck, AlertTriangle, Clock, Camera,
  RefreshCw, ChevronRight, Upload, X, ShieldCheck, Play, ArrowRight
} from 'lucide-react';
import './AdminFulfillment.css';

export interface FulfillmentOrder {
  id: string;
  orderNumber: number;
  customerName: string;
  customerPhone: string;
  shippingCity: string;
  shippingAddress: string;
  addressPinLat?: number;
  addressPinLng?: number;
  items: { title: string; size?: string; color?: string; quantity: number }[];
  totalAmount: number;
  paymentType: string;
  status:
    | 'PAYMENT_PENDING'
    | 'CONFIRMED_PREPAID'
    | 'DEPOSIT_PAID_COD'
    | 'VIDEO_INSPECTION_PENDING'
    | 'VIDEO_DISPATCHED_TO_CUSTOMER'
    | 'IN_TRANSIT'
    | 'DELIVERED'
    | 'DELIVERY_REFUSED_RTO'
    | 'REFUND_REQUESTED'
    | 'REFUND_APPROVED'
    | 'REFUNDED'
    | 'CANCELLED';
  dispatchVideoUrl?: string;
  videoUploadedAt?: string;
  videoViewedByCustomer?: boolean;
  trackingNumber?: string;
  createdAt: string;
}

export default function AdminFulfillment() {
  const [orders, setOrders] = useState<FulfillmentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrderForVideo, setSelectedOrderForVideo] = useState<FulfillmentOrder | null>(null);

  // Camera recording modal state
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlobUrl, setRecordedBlobUrl] = useState<string | null>(null);
  const [recordedFile, setRecordedFile] = useState<File | null>(null);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/fulfillment/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      } else {
        // Mock seed data for development
        setOrders(generateMockOrders());
      }
    } catch {
      setOrders(generateMockOrders());
    } finally {
      setLoading(false);
    }
  };

  const generateMockOrders = (): FulfillmentOrder[] => [
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
    {
      id: 'ord_102',
      orderNumber: 1041,
      customerName: 'Zainab Qureshi',
      customerPhone: '0321 9923847',
      shippingCity: 'Karachi',
      shippingAddress: 'Apartment 4B, Clifton Block 4',
      items: [{ title: 'Embroidered Velvet Formal', size: 'L', color: 'Emerald', quantity: 1 }],
      totalAmount: 24000,
      paymentType: 'PREPAID_CARD',
      status: 'VIDEO_DISPATCHED_TO_CUSTOMER',
      dispatchVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      videoUploadedAt: new Date(Date.now() - 7200000).toISOString(),
      videoViewedByCustomer: true,
      createdAt: new Date(Date.now() - 14400000).toISOString(),
    },
    {
      id: 'ord_103',
      orderNumber: 1040,
      customerName: 'Ayesha Bilal',
      customerPhone: '0333 4567890',
      shippingCity: 'Islamabad',
      shippingAddress: 'Street 15, F-7/2',
      items: [{ title: 'Candy Kids Festive Chiffon', size: '26', color: 'Rose Gold', quantity: 2 }],
      totalAmount: 14200,
      paymentType: 'COD_WITH_DEPOSIT',
      status: 'IN_TRANSIT',
      trackingNumber: 'TCS-928374610',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 'ord_104',
      orderNumber: 1039,
      customerName: 'Mariam Raza',
      customerPhone: '0312 3456789',
      shippingCity: 'Faisalabad',
      shippingAddress: 'Canal Road, Kohinoor City',
      items: [{ title: 'Raw Silk Festive', size: 'S', color: 'Teal', quantity: 1 }],
      totalAmount: 19800,
      paymentType: 'PREPAID_WALLET',
      status: 'DELIVERED',
      trackingNumber: 'TCS-928374111',
      createdAt: new Date(Date.now() - 172800000).toISOString(),
    },
    {
      id: 'ord_105',
      orderNumber: 1038,
      customerName: 'Khadija Malik',
      customerPhone: '0301 2233445',
      shippingCity: 'Rawalpindi',
      shippingAddress: 'Bahria Town Phase 7',
      items: [{ title: 'Chiffon Maxi', size: 'M', color: 'Blush', quantity: 1 }],
      totalAmount: 16500,
      paymentType: 'COD_WITH_DEPOSIT',
      status: 'DELIVERY_REFUSED_RTO',
      trackingNumber: 'TCS-928374999',
      createdAt: new Date(Date.now() - 259200000).toISOString(),
    },
  ];

  const handleUpdateStatus = async (orderId: string, newStatus: FulfillmentOrder['status']) => {
    try {
      await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch {
      // Dev mode local update
    }

    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
  };

  const handleCaptureVideo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setRecordedFile(file);
    const url = URL.createObjectURL(file);
    setRecordedBlobUrl(url);
  };

  const handleUploadInspectionVideo = async () => {
    if (!selectedOrderForVideo || !recordedBlobUrl) return;
    setIsUploadingVideo(true);

    try {
      // In production: upload to Mux or Cloudflare Stream or Supabase storage
      const uploadedVideoUrl = recordedBlobUrl;

      await fetch(`/api/admin/fulfillment/orders/${selectedOrderForVideo.id}/video`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoUrl: uploadedVideoUrl,
          videoUploadedBy: 'staff_wh_01',
        }),
      });

      // Update local state: transition to VIDEO_DISPATCHED_TO_CUSTOMER
      setOrders((prev) =>
        prev.map((o) =>
          o.id === selectedOrderForVideo.id
            ? {
                ...o,
                dispatchVideoUrl: uploadedVideoUrl,
                videoUploadedAt: new Date().toISOString(),
                status: 'VIDEO_DISPATCHED_TO_CUSTOMER',
                videoViewedByCustomer: false,
              }
            : o
        )
      );

      setSelectedOrderForVideo(null);
      setRecordedBlobUrl(null);
      setRecordedFile(null);
    } catch (err) {
      console.error('Video upload failed:', err);
    } finally {
      setIsUploadingVideo(false);
    }
  };

  // Group orders by Kanban Columns
  const columns = [
    {
      title: 'Payment Pending',
      statusGroup: ['PAYMENT_PENDING'],
      color: '#64748b',
    },
    {
      title: 'Video Pending',
      statusGroup: ['CONFIRMED_PREPAID', 'DEPOSIT_PAID_COD', 'VIDEO_INSPECTION_PENDING'],
      color: '#f59e0b',
    },
    {
      title: 'Video Dispatched',
      statusGroup: ['VIDEO_DISPATCHED_TO_CUSTOMER'],
      color: '#3b82f6',
    },
    {
      title: 'In Transit (TCS)',
      statusGroup: ['IN_TRANSIT'],
      color: '#8b5cf6',
    },
    {
      title: 'Delivered / RTO',
      statusGroup: ['DELIVERED', 'DELIVERY_REFUSED_RTO'],
      color: '#10b981',
    },
  ];

  return (
    <div className="admin-fulfillment-page">
      {/* PAGE HEADER */}
      <div className="fulfillment-header">
        <div>
          <h2>Order Fulfillment & Video Inspection Kanban</h2>
          <p>
            Pakistani Warehouse Operations: Mandatory 360° video verification before TCS courier handover.
          </p>
        </div>
        <button type="button" className="refresh-btn" onClick={fetchOrders}>
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* KANBAN BOARD */}
      <div className="kanban-board">
        {columns.map((col, idx) => {
          const colOrders = orders.filter((o) => col.statusGroup.includes(o.status));
          return (
            <div key={idx} className="kanban-column">
              <div className="column-header" style={{ borderTopColor: col.color }}>
                <div className="column-title">
                  <span>{col.title}</span>
                  <span className="count-pill">{colOrders.length}</span>
                </div>
              </div>

              <div className="column-cards-list">
                {colOrders.map((order) => (
                  <div key={order.id} className="kanban-card">
                    <div className="card-top">
                      <span className="order-number">#{order.orderNumber}</span>
                      <span className="order-price">Rs. {order.totalAmount.toLocaleString()}</span>
                    </div>

                    <div className="card-customer">
                      <strong>{order.customerName}</strong>
                      <span>{order.customerPhone}</span>
                      <div className="city-tag">{order.shippingCity}</div>
                    </div>

                    <div className="card-items">
                      {order.items.map((it, i) => (
                        <div key={i} className="item-line">
                          <span>{it.title}</span>
                          <span className="specs">
                            ({it.size}/{it.color}) x{it.quantity}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* STATUS-SPECIFIC ACTIONS */}
                    <div className="card-actions">
                      {col.title === 'Video Pending' && (
                        <button
                          type="button"
                          className="action-btn record-video-btn"
                          onClick={() => setSelectedOrderForVideo(order)}
                        >
                          <Camera size={14} />
                          <span>Record Inspection Video</span>
                        </button>
                      )}

                      {col.title === 'Video Dispatched' && (
                        <div className="video-dispatched-meta">
                          {order.videoViewedByCustomer ? (
                            <span className="view-status seen">
                              <CheckCircle2 size={13} /> Seen by Customer
                            </span>
                          ) : (
                            <span className="view-status waiting">
                              <Clock size={13} /> Video Sent, Awaiting Customer
                            </span>
                          )}

                          <button
                            type="button"
                            className="action-btn dispatch-btn"
                            onClick={() => handleUpdateStatus(order.id, 'IN_TRANSIT')}
                          >
                            <Truck size={14} />
                            <span>Handover to TCS Courier</span>
                          </button>
                        </div>
                      )}

                      {col.title === 'In Transit (TCS)' && (
                        <div className="transit-actions">
                          <button
                            type="button"
                            className="action-btn deliver-btn"
                            onClick={() => handleUpdateStatus(order.id, 'DELIVERED')}
                          >
                            <CheckCircle2 size={14} />
                            <span>Mark Delivered</span>
                          </button>
                          <button
                            type="button"
                            className="action-btn rto-btn"
                            onClick={() => handleUpdateStatus(order.id, 'DELIVERY_REFUSED_RTO')}
                          >
                            <AlertTriangle size={14} />
                            <span>Courier Refused (RTO)</span>
                          </button>
                        </div>
                      )}

                      {col.title === 'Delivered / RTO' && (
                        <div className="final-status-badge">
                          {order.status === 'DELIVERED' ? (
                            <span className="badge-delivered">
                              <CheckCircle2 size={13} /> Completed Delivery
                            </span>
                          ) : (
                            <span className="badge-rto">
                              <AlertTriangle size={13} /> Refused / Downgraded Trust
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {colOrders.length === 0 && (
                  <div className="empty-column-placeholder">No orders in this stage</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* NATIVE MOBILE CAMERA VIDEO RECORDING MODAL */}
      {selectedOrderForVideo && (
        <div className="camera-modal-backdrop" onClick={() => setSelectedOrderForVideo(null)}>
          <div className="camera-modal-card animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <Camera size={18} className="text-amber-500" />
                <h3>Record Pre-Dispatch Video for #{selectedOrderForVideo.orderNumber}</h3>
              </div>
              <button
                type="button"
                className="close-btn"
                onClick={() => setSelectedOrderForVideo(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <p className="modal-instruction">
                Use your smartphone or warehouse camera to record a 10-15 second 360° unboxing scan showing fabric quality, embroidery tags, and sealed TCS polybag.
              </p>

              {/* VIDEO PREVIEW OR CAMERA TRIGGER */}
              <div className="camera-preview-zone">
                {recordedBlobUrl ? (
                  <div className="recorded-playback">
                    <video src={recordedBlobUrl} controls autoPlay className="preview-video" />
                    <button
                      type="button"
                      className="re-record-btn"
                      onClick={() => {
                        setRecordedBlobUrl(null);
                        setRecordedFile(null);
                      }}
                    >
                      <RefreshCw size={14} />
                      <span>Re-record Video</span>
                    </button>
                  </div>
                ) : (
                  <div className="trigger-box" onClick={() => fileInputRef.current?.click()}>
                    <Camera size={44} className="camera-big-icon" />
                    <span className="trigger-title">Tap to Launch Mobile Video Camera</span>
                    <span className="trigger-desc">Capture directly from warehouse device</span>
                  </div>
                )}

                {/* HIDDEN NATIVE CAMERA INPUT */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  capture="environment" // Forces rear warehouse camera on mobile devices
                  onChange={handleCaptureVideo}
                  style={{ display: 'none' }}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="cancel-btn"
                onClick={() => setSelectedOrderForVideo(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="upload-and-dispatch-btn"
                disabled={!recordedBlobUrl || isUploadingVideo}
                onClick={handleUploadInspectionVideo}
              >
                {isUploadingVideo ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>Uploading & Triggering WhatsApp Notification...</span>
                  </>
                ) : (
                  <>
                    <Upload size={16} />
                    <span>Upload & Dispatch Video Link to Customer</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
