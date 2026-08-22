import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Mail, Phone, Send, Clock, MessageSquare, CheckCircle } from 'lucide-react';
import './OmnoraContact.css';

export default function Contact() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setSubmitting(true);

    setTimeout(() => {
      setSuccess(true);
      setSubmitting(false);
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
      setTimeout(() => setSuccess(false), 5000);
    }, 800);
  };

  return (
    <div style={{ backgroundColor: '#FAFAFA', color: '#111827', paddingTop: '30px', paddingBottom: '80px', minHeight: '100vh' }}>
      <div className="container">

        {/* BREADCRUMB & HEADER */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ fontSize: '0.8rem', color: '#6B7280', marginBottom: '4px' }}>
            <Link to="/" style={{ color: '#6B7280', textDecoration: 'none' }}>Home</Link> / <span style={{ color: '#E52535', fontWeight: 600 }}>Contact Us</span>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#111827', margin: 0 }}>
            Contact Candy Kids Garments
          </h1>
          <p style={{ color: '#4B5563', fontSize: '0.95rem', marginTop: '4px' }}>
            Have questions about orders, sizing, delivery, or bulk inquiries? Contact our team directly.
          </p>
        </div>

        {/* MAIN CONTACT LAYOUT */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem', marginBottom: '3rem' }}>

          {/* LEFT COLUMN: CONTACT DETAILS & HELPLINES */}
          <div style={{ backgroundColor: '#FFFFFF', padding: '2rem', borderRadius: '16px', border: '1px solid #E5E7EB', boxShadow: '0 2px 12px rgba(0,0,0,0.03)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827', marginBottom: '1.5rem', borderBottom: '2px solid #E52535', paddingBottom: '0.5rem', display: 'inline-block' }}>
              Helplines & Store Info
            </h2>

            {/* DIRECT PHONES */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#111827', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Phone size={18} style={{ color: '#E52535' }} /> Direct Helpline Numbers
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <a
                  href="tel:03311498773"
                  className="btn btn-outline"
                  style={{ justifyContent: 'flex-start', fontSize: '0.88rem', height: '42px', borderColor: '#E52535', color: '#E52535', fontWeight: 700 }}
                >
                  <Phone size={16} /> 0331-1498773 (Call Now)
                </a>
                <a
                  href="tel:03341495788"
                  className="btn btn-outline"
                  style={{ justifyContent: 'flex-start', fontSize: '0.88rem', height: '42px', borderColor: '#E52535', color: '#E52535', fontWeight: 700 }}
                >
                  <Phone size={16} /> 0334-1495788 (Call Now)
                </a>
              </div>
            </div>

            {/* WHATSAPP DIRECT */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#111827', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MessageSquare size={18} style={{ color: '#0F9D58' }} /> WhatsApp Support
              </div>
              <a
                href="whatsapp://send?phone=923311498773&text=Assalamu%20Alaikum%20Candy%20Kids"
                className="btn btn-whatsapp"
                style={{ width: '100%', justifyContent: 'center', fontSize: '0.88rem', height: '42px' }}
              >
                Launch WhatsApp Chat
              </a>
            </div>

            {/* OPERATIONAL HOURS */}
            <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#F9FAFB', borderRadius: '10px', border: '1px solid #E5E7EB' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#111827', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={16} style={{ color: '#1A73E8' }} /> Operational Hours
              </div>
              <p style={{ margin: 0, fontSize: '0.82rem', color: '#4B5563' }}>
                Monday – Saturday: 10:00 AM – 9:00 PM <br />
                Sunday: 12:00 PM – 6:00 PM <br />
                WhatsApp Assistance: 24/7
              </p>
            </div>

            {/* LOCATION ADDRESS */}
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#111827', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={16} style={{ color: '#E52535' }} /> Store / Outlet Address
              </div>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#4B5563', lineHeight: 1.5 }}>
                Candy Kids Garments Store, <br />
                Main Retail Market, Shadbagh / Azam Market, <br />
                Lahore, Punjab, Pakistan.
              </p>
            </div>

          </div>

          {/* RIGHT COLUMN: INTERACTIVE FORM */}
          <div style={{ backgroundColor: '#FFFFFF', padding: '2rem', borderRadius: '16px', border: '1px solid #E5E7EB', boxShadow: '0 2px 12px rgba(0,0,0,0.03)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827', marginBottom: '1.25rem' }}>
              Send Us a Direct Message
            </h2>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#111827', display: 'block', marginBottom: '4px' }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Muhammad Ali"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '0.88rem', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#111827', display: 'block', marginBottom: '4px' }}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    placeholder="name@domain.com"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '0.88rem', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#111827', display: 'block', marginBottom: '4px' }}>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="0300-1234567"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '0.88rem', outline: 'none' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#111827', display: 'block', marginBottom: '4px' }}>
                  Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  placeholder="Order Inquiry / Custom Request"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '0.88rem', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#111827', display: 'block', marginBottom: '4px' }}>
                  Your Message *
                </label>
                <textarea
                  name="message"
                  rows={4}
                  value={form.message}
                  onChange={handleChange}
                  required
                  placeholder="How can we assist you today?"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '0.88rem', outline: 'none' }}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary"
                style={{ height: '44px', fontSize: '0.9rem', width: '100%', justifyContent: 'center' }}
              >
                {submitting ? 'Sending Message...' : 'Send Message'} <Send size={16} />
              </button>

              {success && (
                <div style={{ backgroundColor: '#ECFDF5', border: '1px solid #0F9D58', color: '#0F9D58', padding: '10px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle size={16} /> Thank you! Your message has been sent successfully. We will call/email you back soon.
                </div>
              )}
            </form>
          </div>

        </div>

        {/* LIVE EMBEDDED MAP */}
        <div style={{ backgroundColor: '#FFFFFF', padding: '1rem', borderRadius: '16px', border: '1px solid #E5E7EB' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#111827', marginBottom: '0.75rem' }}>Store Location Map</h3>
          <iframe
            title="Candy Kids Location Map"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d54415.82527236526!2d74.3000!3d31.5800!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39191c71360c7a5f%3A0xc39722393226759c!2sShadbagh%2C%20Lahore%2C%20Punjab%2C%20Pakistan!5e0!3m2!1sen!2s!4v1700000000000!5m2!1sen!2s"
            style={{ width: '100%', height: '320px', border: 'none', borderRadius: '12px' }}
            allowFullScreen
            loading="lazy"
          />
        </div>

      </div>
    </div>
  );
}