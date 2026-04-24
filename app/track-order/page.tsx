'use client';

import { useState } from 'react';
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from '@/components/ui/button';
import { Package, Truck, CheckCircle, Clock, MapPin, ExternalLink } from 'lucide-react';
import { resolveMediaUrl } from '@/lib/media';

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
    setTrackingResult(null);

    try {
      const { apiPost } = await import("@/lib/api");
      const data = await apiPost('/api/order/track-public', {
        orderId: orderId.trim(),
        email: billingEmail.trim(),
      });

      if (data.success) {
        setTrackingResult(data);
      }
    } catch (err: any) {
      setError(err.message || 'Unable to track order. Please check your details and try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('deliver')) return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (s.includes('ship') || s.includes('transit') || s.includes('out for'))
      return <Truck className="w-5 h-5 text-blue-600" />;
    if (s.includes('placed') || s.includes('confirm') || s.includes('process'))
      return <Clock className="w-5 h-5 text-yellow-600" />;
    return <Package className="w-5 h-5 text-muted-foreground" />;
  };

  const formatStatus = (status: string) =>
    status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  // Extract Shiprocket tracking activities if available
  const getTrackingActivities = () => {
    if (!trackingResult?.tracking) return null;

    const trackData = trackingResult.tracking;
    // Shiprocket tracking structure varies — handle common shapes
    const activities =
      trackData?.tracking_data?.shipment_track_activities ||
      trackData?.tracking_data?.track_activities ||
      trackData?.shipment_track_activities ||
      null;

    return activities;
  };

  const activities = trackingResult ? getTrackingActivities() : null;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="relative bg-gradient-to-b from-muted/50 to-background pt-[96px] lg:pt-[104px]">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-12 lg:py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-serif text-3xl lg:text-5xl font-light mb-4">
              Order Tracking
            </h1>
            <p className="font-sans text-base lg:text-lg text-muted-foreground leading-relaxed">
              Enter your Order ID and billing email to track your shipment in real-time.
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
                placeholder="e.g. LS-20260311-ABCD"
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

            <Button type="submit" disabled={loading} className="w-full py-3 text-base">
              {loading ? 'Tracking...' : 'Track Order'}
            </Button>
          </form>
        </div>

        {trackingResult && (
          <div className="bg-card rounded-xl shadow-lg border border-border overflow-hidden">
            {/* Order Header */}
            <div className="bg-secondary px-6 py-4 border-b border-border">
              <h2 className="font-serif text-2xl font-light mb-4">
                Order #{trackingResult.order.orderId}
              </h2>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span>Status: <span className="font-medium text-primary">{formatStatus(trackingResult.order.status)}</span></span>
                {trackingResult.order.shiprocket?.courierName && (
                  <span>Courier: <span className="font-medium text-foreground">{trackingResult.order.shiprocket.courierName}</span></span>
                )}
                {trackingResult.order.shiprocket?.awbCode && (
                  <span>AWB: <span className="font-medium text-foreground">{trackingResult.order.shiprocket.awbCode}</span></span>
                )}
                {trackingResult.order.shiprocket?.trackingUrl && (
                  <a
                    href={trackingResult.order.shiprocket.trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-primary hover:underline"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Track on courier site
                  </a>
                )}
              </div>
            </div>

            {/* Order Items */}
            <div className="px-6 py-6">
              <h3 className="font-serif text-xl font-light mb-4">Order Items</h3>
              <div className="space-y-3">
                {trackingResult.order.items?.map((item: any, index: number) => (
                  <div key={index} className="flex items-center justify-between py-3 border-b border-border last:border-b-0">
                    <div className="flex items-center space-x-4">
                      {item.image ? (
                        <img src={resolveMediaUrl(item.image)} alt={item.name} className="w-16 h-16 object-cover rounded-lg" />
                      ) : (
                        <div className="w-16 h-16 bg-muted rounded-lg"></div>
                      )}
                      <div>
                        <span className="font-medium text-foreground">{item.name}</span>
                        <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                      </div>
                    </div>
                    <span className="font-semibold text-foreground">₹{item.price?.toLocaleString()}</span>
                  </div>
                ))}
              </div>
              {trackingResult.order.pricing && (
                <div className="mt-4 pt-4 border-t border-border text-right">
                  <span className="text-lg font-bold">Total: ₹{trackingResult.order.pricing.total?.toLocaleString()}</span>
                </div>
              )}
            </div>

            {/* Shiprocket Live Tracking Activities */}
            {activities && activities.length > 0 && (
              <div className="px-6 pb-6">
                <h3 className="font-serif text-xl font-light mb-6">Shipment Tracking</h3>
                <div className="space-y-4">
                  {activities.map((activity: any, index: number) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full flex-shrink-0">
                        <div className={`w-4 h-4 rounded-full ${index === 0 ? 'bg-primary' : 'bg-muted'}`}></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(activity['sr-status-label'] || activity.activity || '')}
                            <span className={`font-medium ${index === 0 ? 'text-foreground' : 'text-muted-foreground'}`}>
                              {activity['sr-status-label'] || activity.activity || 'Update'}
                            </span>
                          </div>
                          <span className="text-sm text-muted-foreground mt-1 sm:mt-0">
                            {activity.date}
                          </span>
                        </div>
                        {activity.location && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                            <MapPin className="w-3.5 h-3.5" />
                            {activity.location}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Fallback: Our internal timeline */}
            {(!activities || activities.length === 0) && trackingResult.order.timeline?.length > 0 && (
              <div className="px-6 pb-6">
                <h3 className="font-serif text-xl font-light mb-6">Order Timeline</h3>
                <div className="space-y-4">
                  {trackingResult.order.timeline.map((step: any, index: number) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full flex-shrink-0">
                        <div className={`w-4 h-4 rounded-full ${index === trackingResult.order.timeline.length - 1 ? 'bg-primary' : 'bg-muted'}`}></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(step.status)}
                            <span className="font-medium text-foreground">{step.status}</span>
                          </div>
                          <span className="text-sm text-muted-foreground mt-1 sm:mt-0">
                            {new Date(step.date).toLocaleDateString('en-IN', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        {step.description && (
                          <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Help Section */}
        <div className="mt-16 lg:mt-24 bg-muted/30 rounded-2xl p-8 lg:p-12 text-center">
          <h2 className="font-serif text-2xl lg:text-3xl font-light mb-6">
            Need Help?
          </h2>
          <p className="font-sans text-muted-foreground leading-relaxed mb-8 max-w-2xl mx-auto">
            If you&apos;re having trouble tracking your order or have any questions, our customer support team is here to help.
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