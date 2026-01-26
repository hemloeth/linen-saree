'use client';

import { useState } from 'react';
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from '@/components/ui/button';
import { Package, Truck, CheckCircle, Clock } from 'lucide-react';

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState('');
  const [billingEmail, setBillingEmail] = useState('');
  const [trackingResult, setTrackingResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrackOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!orderId.trim() || !billingEmail.trim()) {
      setError('Please enter both Order ID and Billing Email');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // Simulate API call - replace with actual tracking API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock tracking data - replace with actual API response
      const mockTrackingData = {
        orderId: orderId,
        status: 'In Transit',
        estimatedDelivery: '2026-02-15',
        trackingNumber: 'TRK' + Math.random().toString(36).substr(2, 9).toUpperCase(),
        items: [
          { name: 'Banarasi Silk Saree', quantity: 1, price: 12999 }
        ],
        timeline: [
          { date: '2026-02-10', status: 'Order Placed', completed: true },
          { date: '2026-02-11', status: 'Order Confirmed', completed: true },
          { date: '2026-02-12', status: 'Shipped', completed: true },
          { date: '2026-02-13', status: 'In Transit', completed: true },
          { date: '2026-02-15', status: 'Out for Delivery', completed: false },
          { date: '2026-02-15', status: 'Delivered', completed: false }
        ]
      };
      
      setTrackingResult(mockTrackingData);
    } catch (err) {
      setError('Unable to track order. Please check your details and try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'shipped':
      case 'in transit':
      case 'out for delivery':
        return <Truck className="w-5 h-5 text-blue-600" />
      case 'order placed':
      case 'order confirmed':
        return <Clock className="w-5 h-5 text-yellow-600" />
      default:
        return <Package className="w-5 h-5 text-muted-foreground" />
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <div className="relative bg-gradient-to-b from-muted/50 to-background pt-[96px] lg:pt-[104px]">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-12 lg:py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-serif text-3xl lg:text-5xl font-light mb-4">
              Order Tracking
            </h1>
            <p className="font-sans text-base lg:text-lg text-muted-foreground leading-relaxed">
              To track your order please enter your Order ID in the box below and press the "Track" button. 
              This was given to you on your receipt and in the confirmation email you should have received.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-[1000px] mx-auto px-4 lg:px-8 py-8 lg:py-12">
        <div className="bg-muted/30 rounded-2xl p-8 lg:p-12 mb-8">
          <form onSubmit={handleTrackOrder} className="space-y-6">
            <div>
              <label htmlFor="orderId" className="block font-sans text-sm font-medium mb-2">
                Order ID *
              </label>
              <input
                type="text"
                id="orderId"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="Enter your order ID"
                className="w-full px-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              />
            </div>

            <div>
              <label htmlFor="billingEmail" className="block font-sans text-sm font-medium mb-2">
                Billing Email *
              </label>
              <input
                type="email"
                id="billingEmail"
                value={billingEmail}
                onChange={(e) => setBillingEmail(e.target.value)}
                placeholder="Enter your billing email"
                className="w-full px-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              />
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-base"
            >
              {loading ? 'Tracking...' : 'Track Order'}
            </Button>
          </form>
        </div>

        {trackingResult && (
          <div className="bg-card rounded-xl shadow-lg border border-border overflow-hidden">
            {/* Order Header */}
            <div className="bg-secondary px-6 py-4 border-b border-border">
              <h2 className="font-serif text-2xl font-light mb-4">
                Order #{trackingResult.orderId}
              </h2>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span>Status: <span className="font-medium text-primary">{trackingResult.status}</span></span>
                <span>Tracking: <span className="font-medium text-foreground">{trackingResult.trackingNumber}</span></span>
                <span>Est. Delivery: <span className="font-medium text-foreground">{trackingResult.estimatedDelivery}</span></span>
              </div>
            </div>

            {/* Order Items */}
            <div className="px-6 py-6">
              <h3 className="font-serif text-xl font-light mb-4">Order Items</h3>
              <div className="space-y-3">
                {trackingResult.items.map((item: any, index: number) => (
                  <div key={index} className="flex items-center justify-between py-3 border-b border-border last:border-b-0">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-muted rounded-lg"></div>
                      <div>
                        <span className="font-medium text-foreground">{item.name}</span>
                        <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                      </div>
                    </div>
                    <span className="font-semibold text-foreground">₹{item.price.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tracking Timeline */}
            <div className="px-6 pb-6">
              <h3 className="font-serif text-xl font-light mb-6">Tracking Timeline</h3>
              <div className="space-y-4">
                {trackingResult.timeline.map((step: any, index: number) => (
                  <div key={index} className="flex items-center">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full mr-4 flex-shrink-0">
                      {step.completed ? (
                        <div className="w-4 h-4 bg-primary rounded-full"></div>
                      ) : (
                        <div className="w-4 h-4 bg-muted rounded-full"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(step.status)}
                          <span className={`font-medium ${
                            step.completed ? 'text-foreground' : 'text-muted-foreground'
                          }`}>
                            {step.status}
                          </span>
                        </div>
                        <span className="text-sm text-muted-foreground mt-1 sm:mt-0">
                          {new Date(step.date).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="mt-16 lg:mt-24 bg-muted/30 rounded-2xl p-8 lg:p-12 text-center">
          <h2 className="font-serif text-2xl lg:text-3xl font-light mb-6">
            Need Help?
          </h2>
          <p className="font-sans text-muted-foreground leading-relaxed mb-8 max-w-2xl mx-auto">
            If you're having trouble tracking your order or have any questions, our customer support team is here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="tel:+919264151111"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Call/WhatsApp: +91 92641-51111
            </a>
            <a
              href="mailto:support@linensaree.com"
              className="inline-flex items-center gap-2 px-6 py-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
            >
              Email: support@linensaree.com
            </a>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}