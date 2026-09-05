import { useState, useEffect, useCallback } from 'react';
import { fetchOrders, Order, supabase } from '../lib/supabase';
import {
  Activity,
  DollarSign,
  Users,
  ShoppingBag,
  RefreshCw,
  TrendingUp,
  ArrowUpRight,
  Share2,
  ShieldCheck,
  Crown
} from 'lucide-react';
import './AdminDashboard.css';

interface DashboardStats {
  revenue: number;
  customers: number;
  activeOrders: number;
  avgOrderValue: number;
}

interface OrderFunnel {
  initiated: number;
  pending: number;
  processing: number;
  completed: number;
}

interface ChannelMetric {
  channel: string;
  count: number;
  percentage: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    revenue: 0, customers: 0, activeOrders: 0, avgOrderValue: 0
  });
  const [funnel, setFunnel] = useState<OrderFunnel>({
    initiated: 0, pending: 0, processing: 0, completed: 0
  });
  const [channels, setChannels] = useState<ChannelMetric[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const processData = (orders: Order[]) => {
    if (!Array.isArray(orders)) return;

    const validOrders = orders.filter((o) => o.status !== 'Cancelled');
    const totalRevenue = validOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
    const uniqueCustomers = new Set(orders.map((o) => o.customer_phone || o.customer_name)).size;

    const newFunnel = {
      initiated: orders.length,
      pending: orders.filter((o) => o.status === 'Pending').length,
      processing: orders.filter((o) => o.status === 'Dispatched').length,
      completed: orders.filter((o) => o.status === 'Delivered').length,
    };

    setStats({
      revenue: totalRevenue,
      customers: uniqueCustomers,
      activeOrders: newFunnel.pending + newFunnel.processing,
      avgOrderValue: validOrders.length ? totalRevenue / validOrders.length : 0,
    });

    setFunnel(newFunnel);
    setRecentOrders(orders.slice(0, 8));
  };

  const fetchChannels = async () => {
    try {
      const { data, error } = await supabase.from('customer_profiles').select('acquisition_channel');
      const counts: Record<string, number> = {
        'Instagram Atelier': 0,
        'Google Search': 0,
        'Facebook VIP': 0,
        'Direct Atelier Concierge': 0
      };

      let total = 0;
      if (data && data.length > 0 && !error) {
        data.forEach((row: any) => {
          const rawCh = (row.acquisition_channel || '').toLowerCase();
          let key = 'Direct Atelier Concierge';
          if (rawCh.includes('instagram')) key = 'Instagram Atelier';
          else if (rawCh.includes('google')) key = 'Google Search';
          else if (rawCh.includes('facebook')) key = 'Facebook VIP';

          counts[key] = (counts[key] || 0) + 1;
          total++;
        });
      }

      const metrics: ChannelMetric[] = Object.keys(counts).map((ch) => ({
        channel: ch,
        count: counts[ch],
        percentage: total > 0 ? Math.round((counts[ch] / total) * 100) : 0,
      }));

      metrics.sort((a, b) => b.count - a.count);
      setChannels(metrics);
    } catch (e) {
      console.warn('Fetch channels error:', e);
      setChannels([
        { channel: 'Instagram Atelier', count: 0, percentage: 0 },
        { channel: 'Google Search', count: 0, percentage: 0 },
        { channel: 'Facebook VIP', count: 0, percentage: 0 },
        { channel: 'Direct Atelier Concierge', count: 0, percentage: 0 },
      ]);
    }
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const orders = await fetchOrders();
      processData(orders);
      await fetchChannels();
      setLastUpdated(new Date());
    } catch (e) {
      console.warn('Dashboard fetch error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  return (
    <div className="dashboard-container animate-fade-in" style={{ padding: '24px' }}>
      
      {/* HEADER */}
      <header className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', borderBottom: '1px solid #E2E8F0', paddingBottom: '20px' }}>
        <div className="header-left">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Crown size={18} style={{ color: '#E52535' }} />
            <span style={{ fontSize: '11px', letterSpacing: '0.15em', color: '#E52535', fontWeight: 700, fontFamily: 'Cinzel, serif' }}>
              CANDY BOUTIQUE · AHMAD MAHBOOB
            </span>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', margin: 0, fontFamily: 'Cinzel, serif', letterSpacing: '0.04em' }}>
            CANDY BOUTIQUE COMMAND DECK
          </h1>
          <div className="live-badge font-mono" style={{ fontSize: '11px', color: '#059669', marginTop: '6px', background: '#ECFDF5', border: '1px solid #A7F3D0', padding: '4px 10px', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <span className="pulse-dot"></span> LIVE TELEMETRY • {lastUpdated.toLocaleTimeString()}
          </div>
        </div>

        <div className="header-right" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '6px', fontSize: '12px', color: '#E52535', fontWeight: 700 }}>
            <ShieldCheck size={16} /> OWNER: AHMAD MAHBOOB
          </div>
          <button className="btn btn-outline" onClick={fetchData} disabled={loading} style={{ height: '36px', fontSize: '12px', borderColor: '#CBD5E1', color: '#0F172A', background: '#FFFFFF', fontWeight: 700 }}>
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            {loading ? 'SYNCING...' : 'SYNC SYSTEM'}
          </button>
        </div>
      </header>

      {/* KPI CARDS */}
      <div className="kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px', marginBottom: '28px' }}>
        
        <div className="industrial-card" style={{ background: '#FFFFFF', padding: '20px', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ color: '#E52535' }}><DollarSign size={22} /></div>
            <span style={{ fontSize: '11px', color: '#059669', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', background: '#ECFDF5', padding: '2px 8px', borderRadius: '4px' }}>
              <TrendingUp size={12} /> REVENUE TELEMETRY
            </span>
          </div>
          <div>
            <span style={{ fontSize: '11px', color: '#64748B', display: 'block', fontWeight: 700, letterSpacing: '0.08em' }}>TOTAL REVENUE</span>
            <span className="font-mono" style={{ fontSize: '22px', fontWeight: 900, color: '#E52535' }}>
              PKR {stats.revenue.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="industrial-card" style={{ background: '#FFFFFF', padding: '20px', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <div style={{ marginBottom: '14px', color: '#0284C7' }}>
            <Users size={22} />
          </div>
          <div>
            <span style={{ fontSize: '11px', color: '#64748B', display: 'block', fontWeight: 700, letterSpacing: '0.08em' }}>CLIENTELE ARCHIVE</span>
            <span className="font-mono" style={{ fontSize: '22px', fontWeight: 900, color: '#0F172A' }}>
              {stats.customers} Verified
            </span>
          </div>
        </div>

        <div className="industrial-card" style={{ background: '#FFFFFF', padding: '20px', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <div style={{ marginBottom: '14px', color: '#7C3AED' }}>
            <ShoppingBag size={22} />
          </div>
          <div>
            <span style={{ fontSize: '11px', color: '#64748B', display: 'block', fontWeight: 700, letterSpacing: '0.08em' }}>AVG. ORDER VALUE</span>
            <span className="font-mono" style={{ fontSize: '22px', fontWeight: 900, color: '#0F172A' }}>
              PKR {Math.round(stats.avgOrderValue).toLocaleString()}
            </span>
          </div>
        </div>

        <div className="industrial-card" style={{ background: '#FFFFFF', padding: '20px', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <div style={{ marginBottom: '14px', color: '#D97706' }}>
            <Activity size={22} />
          </div>
          <div>
            <span style={{ fontSize: '11px', color: '#64748B', display: 'block', fontWeight: 700, letterSpacing: '0.08em' }}>ACTIVE ORDERS</span>
            <span className="font-mono" style={{ fontSize: '22px', fontWeight: 900, color: '#D97706' }}>
              {stats.activeOrders} In-Flight
            </span>
          </div>
        </div>

      </div>

      {/* MAIN GRID */}
      <div className="main-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '22px' }}>

        {/* CONVERSION PIPELINE */}
        <div className="industrial-card" style={{ background: '#FFFFFF', padding: '22px', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 800, margin: 0, color: '#0F172A', fontFamily: 'Cinzel, serif', letterSpacing: '0.05em' }}>COUTURE CONVERSION PIPELINE</h3>
            <Activity size={18} style={{ color: '#E52535' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', height: '170px', alignItems: 'end', paddingTop: '20px' }}>
            {[
              { label: 'Initiated', val: funnel.initiated, color: '#94A3B8' },
              { label: 'Pending', val: funnel.pending, color: '#F59E0B' },
              { label: 'Dispatched', val: funnel.processing, color: '#0284C7' },
              { label: 'Delivered', val: funnel.completed, color: '#059669' },
            ].map((step, i) => (
              <div key={i} style={{ textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center' }}>
                <div
                  style={{
                    width: '100%',
                    maxWidth: '42px',
                    height: `${Math.min(100, Math.max(16, step.val * 20))}%`,
                    background: step.color,
                    borderRadius: '4px 4px 0 0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF',
                    fontSize: '11px',
                    fontWeight: 800,
                  }}
                  className="font-mono"
                >
                  {step.val}
                </div>
                <span className="font-mono" style={{ fontSize: '11px', color: '#475569', marginTop: '8px', fontWeight: 700 }}>{step.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ACQUISITION CHANNELS CARD — ELEGANT LIGHT METALLIC DESIGN */}
        <div className="industrial-card" style={{ background: '#FFFFFF', padding: '22px', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: 800, margin: 0, color: '#0F172A', fontFamily: 'Cinzel, serif', letterSpacing: '0.05em' }}>CLIENT ACQUISITION & TELEMETRY</h3>
              <span style={{ fontSize: '11px', color: '#64748B' }}>Owner: Ahmad Mahboob · Personal Channel Analytics</span>
            </div>
            <Share2 size={18} style={{ color: '#E52535' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {channels.map((ch, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ fontWeight: 700, color: '#0F172A' }}>{ch.channel}</span>
                  <span className="font-mono" style={{ fontSize: '12px', color: '#E52535', fontWeight: 800 }}>
                    {ch.count} Client Signups ({ch.percentage}%)
                  </span>
                </div>
                <div style={{ width: '100%', height: '10px', background: '#F1F5F9', borderRadius: '6px', overflow: 'hidden', padding: '1px', border: '1px solid #E2E8F0' }}>
                  <div
                    style={{
                      width: `${ch.percentage}%`,
                      height: '100%',
                      background: ch.channel.includes('Instagram')
                        ? 'linear-gradient(90deg, #E1306C, #E52535)'
                        : ch.channel.includes('Facebook')
                        ? 'linear-gradient(90deg, #1877F2, #2563EB)'
                        : ch.channel.includes('Google')
                        ? 'linear-gradient(90deg, #0284C7, #38BDF8)'
                        : 'linear-gradient(90deg, #059669, #10B981)',
                      borderRadius: '4px',
                      transition: 'width 0.4s ease',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RECENT ORDERS PANEL */}
        <div className="industrial-card" style={{ background: '#FFFFFF', padding: '22px', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 800, margin: 0, color: '#0F172A', fontFamily: 'Cinzel, serif', letterSpacing: '0.05em' }}>LIVE CLIENT TRANSMISSIONS</h3>
            <ArrowUpRight size={18} style={{ color: '#E52535' }} />
          </div>

          <div className="table-wrapper" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #E2E8F0', color: '#475569', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', background: '#F8FAFC' }}>
                  <th style={{ padding: '8px 10px' }}>ORDER ID</th>
                  <th style={{ padding: '8px 10px' }}>CLIENT NAME</th>
                  <th style={{ padding: '8px 10px' }}>STATUS</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right' }}>VALUE</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td className="font-mono" style={{ padding: '9px 10px', fontWeight: 800, color: '#E52535' }}>
                      #{order.id?.slice(-6) || '----'}
                    </td>
                    <td style={{ padding: '9px 10px', color: '#0F172A', fontWeight: 600 }}>
                      {order.customer_name}
                    </td>
                    <td style={{ padding: '9px 10px' }}>
                      <span style={{ fontSize: '10px', fontWeight: 800, padding: '3px 8px', borderRadius: '4px', background: order.status === 'Delivered' ? '#ECFDF5' : '#FEF3C7', color: order.status === 'Delivered' ? '#059669' : '#D97706', border: order.status === 'Delivered' ? '1px solid #A7F3D0' : '1px solid #FDE68A' }}>
                        {order.status}
                      </span>
                    </td>
                    <td className="font-mono" style={{ padding: '9px 10px', textAlign: 'right', fontWeight: 800, color: '#0F172A' }}>
                      PKR {order.total_amount.toLocaleString()}
                    </td>
                  </tr>
                ))}
                {recentOrders.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '24px', color: '#64748B' }}>
                      No live client transmissions recorded yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* FOOTER */}
      <footer className="dashboard-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '36px', paddingTop: '18px', borderTop: '1px solid #E2E8F0', fontSize: '12px', color: '#64748B' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '8px', height: '8px', background: '#059669', borderRadius: '50%', display: 'inline-block', boxShadow: '0 0 8px #059669' }}></span> SUPABASE ENCRYPTED ENGINE CONNECTED
        </div>
        <div>
          PRIVATE ATELIER ENGINE · OPERATED EXCLUSIVELY BY <span style={{ color: '#E52535', fontWeight: 800, fontFamily: 'Cinzel, serif' }}>AHMAD MAHBOOB</span>
        </div>
      </footer>
    </div>
  );
}