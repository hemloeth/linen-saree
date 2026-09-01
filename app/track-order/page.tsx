'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from '@/components/ui/button';
import { 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  ExternalLink, 
  Copy, 
  Check, 
  Search, 
  AlertCircle, 
  ArrowRight,
  MessageCircle,
  Building2
} from 'lucide-react';
import { resolveMediaUrl } from '@/lib/media';
import { toast } from 'sonner';

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const [trackMode, setTrackMode] = useState<'awb' | 'order'>('awb');
  
  const [awbInput, setAwbInput] = useState('');
  const [orderId, setOrderId] = useState('');
  const [billingEmail, setBillingEmail] = useState('');
  
  const [trackingResult, setTrackingResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedAwb, setCopiedAwb] = useState(false);

  // Auto-fill from query parameters if present (e.g. ?awb=... or ?orderId=...)
  useEffect(() => {
    const awbParam = searchParams.get('awb') || searchParams.get('tracking');
    const orderParam = searchParams.get('orderId') || searchParams.get('id');

    if (awbParam) {
      setTrackMode('awb');
      setAwbInput(awbParam);
      executeTracking({ awb: awbParam });
    } else if (orderParam) {
      setTrackMode('order');
      setOrderId(orderParam);
      executeTracking({ orderId: orderParam });
    }
  }, [searchParams]);

  const executeTracking = async (payload: { awb?: string; orderId?: string; email?: string }) => {
    setLoading(true);
    setError('');
    setTrackingResult(null);

    try {
      const { apiPost } = await import("@/lib/api");
      const data = await apiPost('/api/order/track-public', payload);

      if (data.success) {
        setTrackingResult(data);
      } else {
        setError(data.message || 'No tracking information found for this query.');
      }
    } catch (err: any) {
      setError(err.message || 'Unable to fetch tracking details. Please verify your details and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (trackMode === 'awb') {
      if (!awbInput.trim()) {
        setError('Please enter an AWB / Tracking number.');
        return;
      }
      executeTracking({ awb: awbInput.trim() });
    } else {
      if (!orderId.trim()) {
        setError('Please enter your Order ID.');
        return;
      }
      executeTracking({ 
        orderId: orderId.trim(), 
        email: billingEmail.trim() || undefined 
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAwb(true);
    toast.success('Tracking number copied to clipboard!');
    setTimeout(() => setCopiedAwb(false), 2000);
  };

  // Helper to extract Shiprocket raw track data
  const getShiprocketData = () => {
    if (!trackingResult?.tracking) return null;
    const raw = trackingResult.tracking;

    // Handle standard Shiprocket payload variations
    if (raw.tracking_data) return raw.tracking_data;
    if (raw.data) return raw.data;
    
    // Check if key is the AWB code itself: { "123456": { tracking_data: ... } }
    const firstKey = Object.keys(raw)[0];
    if (firstKey && raw[firstKey]?.tracking_data) {
      return raw[firstKey].tracking_data;
    }

    return raw;
  };

  const srData = getShiprocketData();

  // Extract courier info
  const courierName = 
    srData?.courier_name || 
    trackingResult?.order?.shiprocket?.courierName || 
    'Express Courier';

  const awbCode = 
    srData?.track_url?.split('/')?.pop() || 
    srData?.awb_code || 
    trackingResult?.awb || 
    trackingResult?.order?.shiprocket?.awbCode || 
    null;

  const currentStatus = 
    srData?.current_status || 
    srData?.shipment_status || 
    trackingResult?.order?.shiprocket?.status || 
    trackingResult?.order?.status || 
    'Processing';

  const estimatedDelivery = 
    srData?.etd || 
    srData?.expected_date || 
    srData?.edd || 
    null;

  // Extract activities array
  const rawActivities = 
    srData?.shipment_track_activities || 
    srData?.track_activities || 
    srData?.activities || 
    [];

  // Normalize steps for progress bar
  const statusSteps = [
    { key: 'placed', label: 'Order Placed', desc: 'Confirmed by store' },
    { key: 'packed', label: 'Packed & Ready', desc: 'Handled with care' },
    { key: 'shipped', label: 'Handed to Courier', desc: courierName },
    { key: 'transit', label: 'In Transit', desc: 'On its way' },
    { key: 'out_for_delivery', label: 'Out for Delivery', desc: 'Arriving today' },
    { key: 'delivered', label: 'Delivered', desc: 'Handover complete' },
  ];

  const getActiveStepIndex = (statusStr: string) => {
    const s = String(statusStr).toLowerCase();
    if (s.includes('deliver')) return 5;
    if (s.includes('out for') || s.includes('reaching')) return 4;
    if (s.includes('transit') || s.includes('in-transit') || s.includes('dispatched')) return 3;
    if (s.includes('ship') || s.includes('pickup') || s.includes('picked')) return 2;
    if (s.includes('pack') || s.includes('manifest')) return 1;
    return 0; // placed/confirmed
  };

  const currentStepIndex = getActiveStepIndex(currentStatus);

  return (
    <div className="min-h-screen bg-[#faf8f5] dark:bg-[#121212] text-foreground">
      <Header />

      {/* Hero Header */}
      <div className="relative pt-[104px] lg:pt-[120px] pb-12 bg-gradient-to-b from-stone-100 to-[#faf8f5] dark:from-stone-900/60 dark:to-[#121212] border-b border-border/50">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-stone-900 text-white dark:bg-stone-800 mb-3 shadow-sm">
            <Truck className="w-3.5 h-3.5 text-amber-300" />
            Shiprocket Live Tracker
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-foreground">
            Track Your Consignment
          </h1>
          <p className="font-sans text-xs sm:text-sm text-muted-foreground mt-2 max-w-xl mx-auto">
            Live real-time courier tracking powered by Shiprocket. Track with your AWB number or Order ID.
          </p>
        </div>
      </div>

      <div className="max-w-[1000px] mx-auto px-4 sm:px-6 py-8 lg:py-12">
        
        {/* Tracking Search Card */}
        <div className="bg-card rounded-2xl p-6 sm:p-8 border border-border shadow-sm mb-10">
          
          {/* Mode Switch Tabs */}
          <div className="flex p-1 bg-stone-100 dark:bg-stone-900 rounded-xl mb-6 max-w-md mx-auto">
            <button
              type="button"
              onClick={() => { setTrackMode('awb'); setError(''); }}
              className={`flex-1 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all ${
                trackMode === 'awb'
                  ? 'bg-white dark:bg-stone-800 text-foreground shadow-sm font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Track by AWB / Tracking Code
            </button>
            <button
              type="button"
              onClick={() => { setTrackMode('order'); setError(''); }}
              className={`flex-1 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all ${
                trackMode === 'order'
                  ? 'bg-white dark:bg-stone-800 text-foreground shadow-sm font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Track by Order ID
            </button>
          </div>

          <form onSubmit={handleTrackSubmit} className="space-y-4 max-w-2xl mx-auto">
            {trackMode === 'awb' ? (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Shiprocket AWB / Courier Tracking Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={awbInput}
                    onChange={(e) => setAwbInput(e.target.value)}
                    placeholder="e.g. 143243242342 or DELHIVERY-12345"
                    className="w-full px-4 py-3.5 bg-background border border-border rounded-xl text-sm font-medium placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-stone-500 transition-all shadow-inner"
                    required
                  />
                  <Search className="w-5 h-5 text-muted-foreground absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Order ID *
                  </label>
                  <input
                    type="text"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    placeholder="e.g. LS-20260311-ABCD"
                    className="w-full px-4 py-3.5 bg-background border border-border rounded-xl text-sm font-medium placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-stone-500 transition-all shadow-inner"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Billing Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={billingEmail}
                    onChange={(e) => setBillingEmail(e.target.value)}
                    placeholder="Enter email if available"
                    className="w-full px-4 py-3.5 bg-background border border-border rounded-xl text-sm font-medium placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-stone-500 transition-all shadow-inner"
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full py-4 text-sm font-medium rounded-xl bg-stone-900 hover:bg-stone-800 text-white dark:bg-stone-100 dark:text-stone-900 transition-all shadow-sm flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Querying Shiprocket API...</span>
              ) : (
                <>
                  <span>Track Live Consignment</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Live Tracking Result Display */}
        {trackingResult && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            
            {/* Main Status Header Card */}
            <div className="bg-card rounded-2xl border border-border p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border">
                
                {/* Left Info: Status & Courier */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300/40 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      {currentStatus}
                    </span>
                    {courierName && (
                      <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5" />
                        {courierName}
                      </span>
                    )}
                  </div>

                  {awbCode && (
                    <div className="flex items-center gap-2 text-sm text-foreground pt-1">
                      <span className="text-muted-foreground">AWB:</span>
                      <strong className="font-mono font-bold tracking-wide">{awbCode}</strong>
                      <button
                        onClick={() => copyToClipboard(awbCode)}
                        className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        title="Copy AWB Number"
                      >
                        {copiedAwb ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  )}

                  {trackingResult.order?.orderId && (
                    <p className="text-xs text-muted-foreground">
                      Order Reference: <strong className="text-foreground">{trackingResult.order.orderId}</strong>
                    </p>
                  )}
                </div>

                {/* Right Info: ETD & Direct Courier Link */}
                <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-3 text-left md:text-right">
                  {estimatedDelivery && (
                    <div className="bg-stone-50 dark:bg-stone-900 border border-border px-4 py-2 rounded-xl">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground block">Estimated Delivery</span>
                      <span className="text-sm font-bold text-foreground">{estimatedDelivery}</span>
                    </div>
                  )}

                  {awbCode && (
                    <a
                      href={`https://shiprocket.co/tracking/${awbCode}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-900 dark:text-stone-100 hover:underline pt-1"
                    >
                      <span>Shiprocket Courier Portal</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>

              {/* Visual Shipment Progress Stepper */}
              <div className="pt-8 pb-4">
                <div className="relative">
                  {/* Progress Line */}
                  <div className="absolute top-4 left-4 right-4 h-1 bg-stone-200 dark:bg-stone-800 -z-0 hidden md:block" />
                  <div 
                    className="absolute top-4 left-4 h-1 bg-emerald-500 -z-0 hidden md:block transition-all duration-700" 
                    style={{ width: `${Math.min(100, (currentStepIndex / (statusSteps.length - 1)) * 100)}%` }}
                  />

                  <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                    {statusSteps.map((step, idx) => {
                      const isComplete = idx <= currentStepIndex;
                      const isCurrent = idx === currentStepIndex;

                      return (
                        <div key={step.key} className="flex flex-col md:items-center text-left md:text-center gap-2 relative">
                          <div 
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold z-10 transition-all ${
                              isCurrent
                                ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 ring-4 ring-emerald-400/40'
                                : isComplete
                                ? 'bg-emerald-600 text-white'
                                : 'bg-stone-200 dark:bg-stone-800 text-muted-foreground'
                            }`}
                          >
                            {isComplete ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                          </div>
                          <div>
                            <p className={`text-xs font-semibold ${isComplete ? 'text-foreground' : 'text-muted-foreground'}`}>
                              {step.label}
                            </p>
                            <p className="text-[11px] text-muted-foreground/80 hidden sm:block">
                              {step.desc}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Live Shiprocket Scan Timeline */}
            <div className="bg-card rounded-2xl border border-border p-6 sm:p-8 shadow-sm">
              <h3 className="font-serif text-xl font-semibold mb-6 flex items-center gap-2 text-foreground">
                <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                Live Checkpoint History
              </h3>

              {rawActivities && rawActivities.length > 0 ? (
                <div className="space-y-6 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-200 dark:before:bg-stone-800">
                  {rawActivities.map((act: any, index: number) => {
                    const isLatest = index === 0;
                    const dateStr = act.date || act['activity-date'] || act.time || 'Recent';
                    const title = act['sr-status-label'] || act.activity || act.status || 'Package Scanned';
                    const location = act.location || act.city || '';

                    return (
                      <div key={index} className="flex items-start gap-4 relative">
                        <div 
                          className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${
                            isLatest 
                              ? 'bg-emerald-600 text-white ring-4 ring-emerald-400/20' 
                              : 'bg-stone-200 dark:bg-stone-800 text-stone-500'
                          }`}
                        >
                          <MapPin className="w-3.5 h-3.5" />
                        </div>

                        <div className="flex-1 bg-stone-50/80 dark:bg-stone-900/60 p-4 rounded-xl border border-border/60">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                            <span className={`text-sm font-semibold ${isLatest ? 'text-foreground' : 'text-muted-foreground'}`}>
                              {title}
                            </span>
                            <span className="text-xs text-muted-foreground font-mono">
                              {dateStr}
                            </span>
                          </div>
                          {location && (
                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                              <span>Location:</span>
                              <strong className="text-foreground font-medium">{location}</strong>
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-6 rounded-xl bg-stone-50 dark:bg-stone-900 text-center text-xs text-muted-foreground space-y-2">
                  <Package className="w-8 h-8 mx-auto text-stone-400" />
                  <p className="font-medium text-foreground">Awaiting initial courier scan</p>
                  <p>Your package has been generated with Shiprocket and is pending origin hub intake.</p>
                </div>
              )}
            </div>

            {/* Ordered Products (If attached to order) */}
            {trackingResult.order?.items && trackingResult.order.items.length > 0 && (
              <div className="bg-card rounded-2xl border border-border p-6 sm:p-8 shadow-sm">
                <h3 className="font-serif text-xl font-semibold mb-4 text-foreground">
                  Consignment Contents
                </h3>
                <div className="divide-y divide-border">
                  {trackingResult.order.items.map((item: any, idx: number) => (
                    <div key={idx} className="py-4 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                      <div className="flex items-center gap-4">
                        {item.image ? (
                          <img 
                            src={resolveMediaUrl(item.image)} 
                            alt={item.name} 
                            className="w-16 h-16 rounded-xl object-cover border border-border flex-shrink-0"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center flex-shrink-0">
                            <Package className="w-6 h-6 text-stone-400" />
                          </div>
                        )}
                        <div>
                          <h4 className="text-sm font-semibold text-foreground line-clamp-1">{item.name}</h4>
                          <p className="text-xs text-muted-foreground mt-0.5">Quantity: {item.quantity}</p>
                        </div>
                      </div>
                      <span className="text-sm font-bold font-mono">
                        ₹{((item.price || 0) * (item.quantity || 1)).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Need Help / Direct WhatsApp Support Box */}
            <div className="bg-gradient-to-r from-stone-900 to-stone-950 text-white rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
              <div className="space-y-1 text-center sm:text-left">
                <h4 className="font-serif text-lg font-semibold text-amber-200">
                  Need Help with Your Delivery?
                </h4>
                <p className="text-xs text-stone-400 max-w-md">
                  Our artisan fulfillment desk is ready to expedite or assist with courier routing inquiries.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href="https://wa.me/919264151111?text=Hi%20The%20Handloomer,%20I%20need%20help%20tracking%20my%20consignment."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all flex items-center gap-2 shadow-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp Concierge</span>
                </a>
                <a
                  href="mailto:support@handloomer.com"
                  className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold transition-all"
                >
                  support@handloomer.com
                </a>
              </div>
            </div>

          </div>
        )}

      </div>

      <Footer />
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#faf8f5] dark:bg-[#121212] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-stone-800 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <TrackOrderContent />
    </Suspense>
  );
}
