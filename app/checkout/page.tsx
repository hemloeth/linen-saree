"use client"

import React from "react"

import { useState, useRef, useEffect } from "react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { useCart } from "@/context/cart-context"
import { Button } from "@/components/ui/button"
import { CheckoutProductMedia } from "@/components/common/checkout-product-media"
import Link from "next/link"
import { toast } from "sonner"
import { Check, CreditCard, Truck, ShieldCheck, ArrowLeft, Tag, X, ChevronDown, Search } from "lucide-react"

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (document.getElementById('razorpay-script')) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.id = 'razorpay-script';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function CheckoutPage() {
  const { items, totalPrice, clearCart, isHydrated } = useCart()
  const [step, setStep] = useState(1)
  const [stateDropdownOpen, setStateDropdownOpen] = useState(false)
  const [stateSearch, setStateSearch] = useState("")
  const stateDropdownRef = useRef<HTMLDivElement>(null)

  const indianStates = [
    { value: "AP", label: "Andhra Pradesh" },
    { value: "AR", label: "Arunachal Pradesh" },
    { value: "AS", label: "Assam" },
    { value: "BR", label: "Bihar" },
    { value: "CG", label: "Chhattisgarh" },
    { value: "GA", label: "Goa" },
    { value: "GJ", label: "Gujarat" },
    { value: "HR", label: "Haryana" },
    { value: "HP", label: "Himachal Pradesh" },
    { value: "JH", label: "Jharkhand" },
    { value: "KA", label: "Karnataka" },
    { value: "KL", label: "Kerala" },
    { value: "MP", label: "Madhya Pradesh" },
    { value: "MH", label: "Maharashtra" },
    { value: "MN", label: "Manipur" },
    { value: "ML", label: "Meghalaya" },
    { value: "MZ", label: "Mizoram" },
    { value: "NL", label: "Nagaland" },
    { value: "OD", label: "Odisha" },
    { value: "PB", label: "Punjab" },
    { value: "RJ", label: "Rajasthan" },
    { value: "SK", label: "Sikkim" },
    { value: "TN", label: "Tamil Nadu" },
    { value: "TS", label: "Telangana" },
    { value: "TR", label: "Tripura" },
    { value: "UP", label: "Uttar Pradesh" },
    { value: "UK", label: "Uttarakhand" },
    { value: "WB", label: "West Bengal" },
  ]

  const unionTerritories = [
    { value: "AN", label: "Andaman & Nicobar Islands" },
    { value: "CH", label: "Chandigarh" },
    { value: "DN", label: "Dadra & Nagar Haveli and Daman & Diu" },
    { value: "DL", label: "Delhi" },
    { value: "JK", label: "Jammu & Kashmir" },
    { value: "LA", label: "Ladakh" },
    { value: "LD", label: "Lakshadweep" },
    { value: "PY", label: "Puducherry" },
  ]

  const [orderPlaced, setOrderPlaced] = useState(false)

  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    landmark: "",
    city: "",
    state: "",
    pincode: "",
    phone: "",
    paymentMethod: "card"
  })

  const filteredStates = indianStates.filter(s => s.label.toLowerCase().includes(stateSearch.toLowerCase()))
  const filteredUTs = unionTerritories.filter(s => s.label.toLowerCase().includes(stateSearch.toLowerCase()))
  const selectedStateLabel = [...indianStates, ...unionTerritories].find(s => s.value === formData.state)?.label

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (stateDropdownRef.current && !stateDropdownRef.current.contains(e.target as Node)) {
        setStateDropdownOpen(false)
        setStateSearch("")
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const [couponCode, setCouponCode] = useState("")
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string, discountAmount: number } | null>(null)
  const [couponError, setCouponError] = useState("")
  const [applyingCoupon, setApplyingCoupon] = useState(false)

  const shipping = totalPrice >= 999 ? 0 : 199

  // Calculate discount using backend supplied amount
  const discount = appliedCoupon ? appliedCoupon.discountAmount : 0
  const total = totalPrice + shipping - discount

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    // Allow only digits for pincode and phone
    if (name === 'pincode') {
      const digits = value.replace(/\D/g, '').slice(0, 6)
      setFormData({ ...formData, [name]: digits })
      if (formErrors.pincode) setFormErrors(prev => ({ ...prev, pincode: '' }))
      return
    }
    if (name === 'phone') {
      const digits = value.replace(/\D/g, '').slice(0, 10)
      setFormData({ ...formData, [name]: digits })
      if (formErrors.phone) setFormErrors(prev => ({ ...prev, phone: '' }))
      return
    }
    setFormData({ ...formData, [name]: value })
  }

  const [formErrors, setFormErrors] = useState<{ pincode: string; phone: string; state: string }>({
    pincode: '',
    phone: '',
    state: '',
  })

  const validateAndContinue = () => {
    const errors = { pincode: '', phone: '', state: '' }
    let hasError = false

    if (!formData.state) {
      errors.state = 'Please select a state'
      hasError = true
    }

    if (!formData.pincode || formData.pincode.length !== 6) {
      errors.pincode = 'Enter a valid 6-digit PIN code'
      hasError = true
    }

    if (!formData.phone || formData.phone.length !== 10) {
      errors.phone = 'Enter a valid 10-digit phone number'
      hasError = true
    } else if (!/^[6-9]/.test(formData.phone)) {
      errors.phone = 'Phone number must start with 6, 7, 8 or 9'
      hasError = true
    }

    setFormErrors(errors)
    if (!hasError) {
      setStep(2)
    }
  }

  const handleApplyCoupon = async () => {
    setCouponError("")

    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code")
      return
    }

    setApplyingCoupon(true)
    try {
      const { apiPost } = await import("@/lib/api")
      const result = await apiPost('/api/coupon/apply', {
        code: couponCode,
        subtotal: totalPrice
      })

      if (result.success && result.coupon) {
        setAppliedCoupon({
          code: result.coupon.code,
          discountAmount: result.coupon.discountAmount
        })
        setCouponCode("")
      }
    } catch (error: any) {
      setCouponError(error.message || "Invalid or expired coupon")
      setAppliedCoupon(null)
    } finally {
      setApplyingCoupon(false)
    }
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setCouponCode("")
    setCouponError("")
  }

  const [isPlacingOrder, setIsPlacingOrder] = useState(false)
  const [placedOrderId, setPlacedOrderId] = useState("")

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsPlacingOrder(true)

    try {
      const { apiPost } = await import("@/lib/api")

      const orderData = {
        items: items.map(item => ({
          productId: item.product.id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          image: item.product.image,
        })),
        shippingAddress: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          landmark: formData.landmark,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
        },
        paymentMethod: formData.paymentMethod,
        couponCode: appliedCoupon?.code || "",
        discount,
      }

      const data = await apiPost('/api/order', orderData)

      if (data.success) {
        if (formData.paymentMethod !== "cod") {
          if (!data.order.razorpayOrderId) {
            toast.error("Payment ID missing from server. Please check backend keys.");
            setIsPlacingOrder(false);
            return;
          }
          // Online payment flow
          const res = await loadRazorpayScript()
          if (!res) {
            toast.error("Razorpay SDK failed to load. Are you online?")
            setIsPlacingOrder(false)
            return
          }

          const options = {
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || data.order.key,
            amount: data.order.amount,
            currency: data.order.currency,
            name: "Linen Saree",
            description: "Order Payment",
            order_id: data.order.razorpayOrderId,
            handler: async function (response: any) {
              setIsPlacingOrder(true) // re-set loading during verification
              try {
                const verifyData = await apiPost('/api/order/verify-payment', {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  orderId: data.order.orderId
                })

                if (verifyData.success) {
                  setPlacedOrderId(data.order.orderId)
                  setOrderPlaced(true)
                  clearCart()
                } else {
                  toast.error("Payment verification failed.")
                }
              } catch (verifyErr: any) {
                toast.error(verifyErr.message || "Payment verification failed.")
              } finally {
                setIsPlacingOrder(false)
              }
            },
            prefill: {
              name: `${formData.firstName} ${formData.lastName}`,
              email: formData.email,
              contact: formData.phone
            },
            theme: {
              color: "#0f172a"
            },
            modal: {
              ondismiss: function() {
                setIsPlacingOrder(false)
              }
            }
          }

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const paymentObject = new (window as any).Razorpay(options)
          paymentObject.on('payment.failed', function (response: any) {
             toast.error(response.error.description || "Payment failed")
             setIsPlacingOrder(false)
          })
          paymentObject.open()
          return // Keep isPlacingOrder true until modal is dismissed or payment completes
        } else {
          // COD flow
          setPlacedOrderId(data.order.orderId)
          setOrderPlaced(true)
          clearCart()
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to place order. Please try again.")
    } finally {
      setIsPlacingOrder(false)
    }
  }

  if (!isHydrated) {
    return (
      <main className="min-h-screen">
        <Header />
        <div className="pt-[96px] lg:pt-[104px] min-h-[80vh] flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading checkout...</div>
        </div>
        <Footer />
      </main>
    )
  }

  if (items.length === 0 && !orderPlaced) {
    return (
      <main className="min-h-screen">
        <Header />
        <div className="pt-[96px] lg:pt-[104px] min-h-[80vh] flex items-center justify-center">
          <div className="text-center px-4">
            <h1 className="font-serif text-3xl mb-4">Your cart is empty</h1>
            <p className="text-muted-foreground mb-8">Add some products to checkout</p>
            <Link href="/collections">
              <Button className="bg-primary hover:bg-primary/90">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  if (orderPlaced) {
    return (
      <main className="min-h-screen">
        <Header />
        <div className="pt-[96px] lg:pt-[104px] min-h-[80vh] flex items-center justify-center">
          <div className="text-center px-4 max-w-md">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-primary" />
            </div>
            <h1 className="font-serif text-3xl mb-4">Order Placed Successfully!</h1>
            <p className="text-muted-foreground mb-2">
              Thank you for your order. We{"'"}ve sent a confirmation email to {formData.email || "your email"}.
            </p>
            <div className="bg-muted/50 rounded-lg p-6 mb-8 text-left space-y-3 border border-border">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order ID</span>
                <span className="font-medium">#{placedOrderId || "Processing..."}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Method</span>
                <span className="font-medium">
                  {formData.paymentMethod === "cod" ? "Cash on Delivery" : "Paid Online (Razorpay)"}
                </span>
              </div>
            </div>
            <Link href="/collections">
              <Button className="bg-primary hover:bg-primary/90">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />

      <div className="pt-[96px] lg:pt-[104px]">
        <section className="py-8 lg:py-12 px-2">
          <div className="max-w-[1200px] mx-auto">
            {/* Back Link */}
            <Link
              href="/cart"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Cart
            </Link>

            <div className="grid lg:grid-cols-2 gap-12">
              {/* Checkout Form */}
              <div className="order-2 lg:order-1">
                <h1 className="font-serif text-3xl mb-8">Checkout</h1>

                {/* Progress Steps */}
                <div className="flex items-center gap-4 mb-8">
                  <div className={`flex items-center gap-2 ${step >= 1 ? "text-primary" : "text-muted-foreground"}`}>
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${step >= 1 ? "bg-primary text-primary-foreground" : "bg-muted"
                      }`}>1</span>
                    <span className="text-sm font-medium">Information</span>
                  </div>
                  <div className="flex-1 h-px bg-border" />
                  <div className={`flex items-center gap-2 ${step >= 2 ? "text-primary" : "text-muted-foreground"}`}>
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${step >= 2 ? "bg-primary text-primary-foreground" : "bg-muted"
                      }`}>2</span>
                    <span className="text-sm font-medium">Payment</span>
                  </div>
                </div>

                <form onSubmit={handlePlaceOrder}>
                  {step === 1 && (
                    <div className="space-y-6">
                      {/* Contact */}
                      <div>
                        <h2 className="font-medium text-lg mb-4">Contact Information</h2>
                        <input
                          type="email"
                          name="email"
                          placeholder="Email address"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-border bg-background text-sm"
                        />
                      </div>

                      {/* Shipping Address */}
                      <div>
                        <h2 className="font-medium text-lg mb-4">Shipping Address</h2>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <input
                              type="text"
                              name="firstName"
                              placeholder="First name"
                              value={formData.firstName}
                              onChange={handleInputChange}
                              required
                              className="w-full px-4 py-3 border border-border bg-background text-sm"
                            />
                            <input
                              type="text"
                              name="lastName"
                              placeholder="Last name"
                              value={formData.lastName}
                              onChange={handleInputChange}
                              required
                              className="w-full px-4 py-3 border border-border bg-background text-sm"
                            />
                          </div>
                          <input
                            type="text"
                            name="address"
                            placeholder="Address"
                            value={formData.address}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-3 border border-border bg-background text-sm"
                          />
                          <input
                            type="text"
                            name="landmark"
                            placeholder="Landmark (optional)"
                            value={formData.landmark}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-border bg-background text-sm"
                          />
                          <div className="grid grid-cols-2 gap-4">
                            <input
                              type="text"
                              name="city"
                              placeholder="City"
                              value={formData.city}
                              onChange={handleInputChange}
                              required
                              className="w-full px-4 py-3 border border-border bg-background text-sm"
                            />
                            <div ref={stateDropdownRef} className="relative">
                              <button
                                type="button"
                                onClick={() => { setStateDropdownOpen(!stateDropdownOpen); setStateSearch(""); }}
                                className={`w-full px-4 py-3 border border-border bg-background text-sm text-left flex items-center justify-between gap-2 transition-colors ${stateDropdownOpen ? 'border-primary' : ''
                                  }`}
                              >
                                <span className={formData.state ? 'text-foreground' : 'text-muted-foreground'}>
                                  {selectedStateLabel || 'Select State'}
                                </span>
                                <ChevronDown className={`w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform duration-200 ${stateDropdownOpen ? 'rotate-180' : ''
                                  }`} />
                              </button>
                              {stateDropdownOpen && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-md shadow-lg z-20 max-h-[280px] flex flex-col" onWheel={(e) => e.stopPropagation()}>
                                  <div className="p-2 border-b border-border">
                                    <div className="relative">
                                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                                      <input
                                        type="text"
                                        placeholder="Search state..."
                                        value={stateSearch}
                                        onChange={(e) => setStateSearch(e.target.value)}
                                        className="w-full pl-8 pr-3 py-2 text-sm bg-muted/50 border border-border rounded focus:outline-none focus:border-primary"
                                        autoFocus
                                      />
                                    </div>
                                  </div>
                                  <div className="overflow-y-auto overscroll-contain">
                                    {filteredStates.length > 0 && (
                                      <div>
                                        <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-muted/30">States</div>
                                        {filteredStates.map((state) => (
                                          <button
                                            key={state.value}
                                            type="button"
                                            onClick={() => {
                                              setFormData({ ...formData, state: state.value })
                                              setStateDropdownOpen(false)
                                              setStateSearch("")
                                            }}
                                            className={`w-full px-3 py-2.5 text-sm text-left hover:bg-primary/10 transition-colors flex items-center justify-between ${formData.state === state.value ? 'bg-primary/5 text-primary font-medium' : ''
                                              }`}
                                          >
                                            {state.label}
                                            {formData.state === state.value && <Check className="w-3.5 h-3.5 text-primary" />}
                                          </button>
                                        ))}
                                      </div>
                                    )}
                                    {filteredUTs.length > 0 && (
                                      <div>
                                        <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-muted/30">Union Territories</div>
                                        {filteredUTs.map((ut) => (
                                          <button
                                            key={ut.value}
                                            type="button"
                                            onClick={() => {
                                              setFormData({ ...formData, state: ut.value })
                                              setStateDropdownOpen(false)
                                              setStateSearch("")
                                            }}
                                            className={`w-full px-3 py-2.5 text-sm text-left hover:bg-primary/10 transition-colors flex items-center justify-between ${formData.state === ut.value ? 'bg-primary/5 text-primary font-medium' : ''
                                              }`}
                                          >
                                            {ut.label}
                                            {formData.state === ut.value && <Check className="w-3.5 h-3.5 text-primary" />}
                                          </button>
                                        ))}
                                      </div>
                                    )}
                                    {filteredStates.length === 0 && filteredUTs.length === 0 && (
                                      <div className="px-3 py-4 text-sm text-muted-foreground text-center">No results found</div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <input
                                type="text"
                                name="pincode"
                                placeholder="PIN Code"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                maxLength={6}
                                value={formData.pincode}
                                onChange={handleInputChange}
                                onKeyDown={(e) => {
                                  if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key) && !e.ctrlKey && !e.metaKey) {
                                    e.preventDefault()
                                  }
                                }}
                                required
                                className={`w-full px-4 py-3 border bg-background text-sm ${formErrors.pincode ? 'border-red-500' : 'border-border'
                                  }`}
                              />
                              {formErrors.pincode && (
                                <p className="text-xs text-red-500 mt-1">{formErrors.pincode}</p>
                              )}
                            </div>
                            <div>
                              <input
                                type="tel"
                                name="phone"
                                placeholder="Phone number"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                maxLength={10}
                                value={formData.phone}
                                onChange={handleInputChange}
                                onKeyDown={(e) => {
                                  if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key) && !e.ctrlKey && !e.metaKey) {
                                    e.preventDefault()
                                  }
                                }}
                                required
                                className={`w-full px-4 py-3 border bg-background text-sm ${formErrors.phone ? 'border-red-500' : 'border-border'
                                  }`}
                              />
                              {formErrors.phone && (
                                <p className="text-xs text-red-500 mt-1">{formErrors.phone}</p>
                              )}
                            </div>
                          </div>
                          {formErrors.state && (
                            <p className="text-xs text-red-500 -mt-2">{formErrors.state}</p>
                          )}
                        </div>
                      </div>

                      <Button
                        type="button"
                        className="w-full bg-primary hover:bg-primary/90 py-6"
                        onClick={validateAndContinue}
                      >
                        Continue to Payment
                      </Button>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="space-y-6">
                      {/* Coupon Code Section */}
                      <div>
                        <h2 className="font-medium text-lg mb-4">Coupon Code</h2>

                        {appliedCoupon ? (
                          <div className="flex items-center justify-between p-4 bg-primary/10 border border-primary/20 rounded">
                            <div className="flex items-center gap-2">
                              <Tag className="w-5 h-5 text-primary" />
                              <span className="font-medium text-primary">{appliedCoupon.code}</span>
                              <span className="text-sm text-primary/70">
                                (₹{appliedCoupon.discountAmount.toLocaleString('en-IN')} off)
                              </span>
                            </div>
                            <button
                              onClick={handleRemoveCoupon}
                              className="text-primary hover:text-primary/70 transition-colors p-1"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="flex gap-3">
                              <input
                                type="text"
                                placeholder="Enter coupon code"
                                value={couponCode}
                                onChange={(e) => setCouponCode(e.target.value)}
                                className="flex-1 px-4 py-3 border border-border bg-background text-sm"
                                onKeyPress={(e) => e.key === 'Enter' && handleApplyCoupon()}
                              />
                              <Button
                                type="button"
                                variant="outline"
                                onClick={handleApplyCoupon}
                                disabled={applyingCoupon}
                                className="px-6 py-3"
                              >
                                {applyingCoupon ? "Applying..." : "Apply"}
                              </Button>
                            </div>
                            {couponError && (
                              <p className="text-sm text-red-500">{couponError}</p>
                            )}
                            <div className="text-sm text-muted-foreground">
                              Enter a promotional code to apply a discount.
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Payment Method */}
                      <div>
                        <h2 className="font-medium text-lg mb-4">Payment Method</h2>
                        <div className="space-y-3">
                          <label className="flex items-center gap-4 p-4 border border-border cursor-pointer hover:bg-muted/50 transition-colors">
                            <input
                              type="radio"
                              name="paymentMethod"
                              value="card"
                              checked={formData.paymentMethod === "card"}
                              onChange={() => setFormData({ ...formData, paymentMethod: "card" })}
                              className="w-4 h-4 accent-primary"
                            />
                            <CreditCard className="w-5 h-5 text-primary" />
                            <div className="flex flex-col">
                              <span className="font-medium">Credit / Debit Card</span>
                              <span className="text-xs text-muted-foreground mt-0.5">Powered by Razorpay Secure</span>
                            </div>
                          </label>
                          
                          <label className="flex items-center gap-4 p-4 border border-border cursor-pointer hover:bg-muted/50 transition-colors">
                            <input
                              type="radio"
                              name="paymentMethod"
                              value="upi"
                              checked={formData.paymentMethod === "upi"}
                              onChange={() => setFormData({ ...formData, paymentMethod: "upi" })}
                              className="w-4 h-4 accent-primary"
                            />
                            <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                            </svg>
                            <div className="flex flex-col">
                              <span className="font-medium">UPI / NetBanking / Wallets</span>
                              <span className="text-xs text-muted-foreground mt-0.5">GPay, PhonePe, Paytm & more</span>
                            </div>
                          </label>

                          <label className="flex items-center gap-4 p-4 border border-border cursor-pointer hover:bg-muted/50 transition-colors">
                            <input
                              type="radio"
                              name="paymentMethod"
                              value="cod"
                              checked={formData.paymentMethod === "cod"}
                              onChange={() => setFormData({ ...formData, paymentMethod: "cod" })}
                              className="w-4 h-4 accent-primary"
                            />
                            <Truck className="w-5 h-5 text-primary" />
                            <div className="flex flex-col">
                              <span className="font-medium">Cash on Delivery</span>
                              <span className="text-xs text-muted-foreground mt-0.5">Pay when you receive your order</span>
                            </div>
                          </label>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <Button
                          type="button"
                          variant="outline"
                          className="flex-1 py-6 bg-transparent"
                          onClick={() => setStep(1)}
                        >
                          Back
                        </Button>
                        <Button
                          type="submit"
                          className="flex-1 bg-primary hover:bg-primary/90 py-6 text-primary-foreground font-medium flex items-center justify-center gap-2"
                          disabled={isPlacingOrder}
                        >
                          {isPlacingOrder ? "Processing..." : formData.paymentMethod === "cod" ? "Place Order (COD)" : "Pay Now with Razorpay"}
                        </Button>
                      </div>
                    </div>
                  )}
                </form>

                {/* Trust Badges */}
                <div className="flex items-center justify-center gap-6 mt-8 pt-8 border-t border-border">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ShieldCheck className="w-5 h-5" />
                    Secure Checkout
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Truck className="w-5 h-5" />
                    Free Shipping
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:pl-12 lg:border-l border-border order-1 lg:order-2">
                <h2 className="font-serif text-2xl mb-6">Order Summary</h2>

                {/* Items */}
                <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto">
                  {items.map((item) => (
                    <CheckoutProductMedia
                      key={item.product.id}
                      product={item.product}
                      quantity={item.quantity}
                    />
                  ))}
                </div>

                {/* Totals */}
                <div className="space-y-3 pt-6 border-t border-border">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>₹{totalPrice.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className={shipping === 0 ? "text-primary" : ""}>
                      {shipping === 0 ? "Free" : `₹${shipping}`}
                    </span>
                  </div>
                  {appliedCoupon && discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Discount ({appliedCoupon.code})</span>
                      <span className="text-primary">-₹{discount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-semibold pt-3 border-t border-border">
                    <span>Total</span>
                    <span>₹{total.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  )
}
