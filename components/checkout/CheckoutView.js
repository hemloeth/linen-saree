"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useStore } from "@/components/StoreProvider";
import { apiConfigured } from "@/lib/api/client";
import { ordersApi } from "@/lib/api/orders";
import { couponApi } from "@/lib/api/coupon";
import ShippingAddressForm, { EMPTY_ADDRESS } from "./ShippingAddressForm";
import { formatINR } from "@/lib/data";

const PAYMENT_LOGOS = [
  { name: "UPI", src: "/images/payments/upi.svg", w: 38, h: 20 },
  { name: "Google Pay", src: "/images/payments/gpay.svg", w: 38, h: 20 },
  { name: "PhonePe", src: "/images/payments/phonepe.svg", w: 32, h: 20 },
  { name: "Paytm", src: "/images/payments/paytm.svg", w: 38, h: 20 },
  { name: "Visa", src: "/images/payments/visa.svg", w: 36, h: 20 },
  { name: "Mastercard", src: "/images/payments/mastercard.svg", w: 32, h: 20 },
  { name: "RuPay", src: "/images/payments/rupay.svg", w: 38, h: 20 },
];

const CHECKOUT_ATTEMPT_KEY = "hoq_checkout_attempt_v2";

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function CheckoutView() {
  const { items, subtotal, clear, setQty, remove, user, notify } = useStore();
  const [step, setStep] = useState(1); // 1 = Address Form, 2 = Payment Method
  const [address, setAddress] = useState(EMPTY_ADDRESS);
  const [selectedSavedAddrId, setSelectedSavedAddrId] = useState(null);
  const [serviceability, setServiceability] = useState(null);
  const [checking, setChecking] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");
  const [confirmed, setConfirmed] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [copiedToken, setCopiedToken] = useState(false);

  // In-flight payment recovery state if gateway verification times out
  const [pendingVerification, setPendingVerification] = useState(null);
  const [verifyingPending, setVerifyingPending] = useState(false);

  // Payment method selection: "cod" or "online"
  const [paymentMethod, setPaymentMethod] = useState("cod");

  // Coupon state
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponMessage, setCouponMessage] = useState("");
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  // Concurrency guard ref
  const isSubmittingRef = useRef(false);

  // Feature Flag: Check if checkout is enabled in environment
  const isCheckoutEnabled =
    process.env.NEXT_PUBLIC_ENABLE_STORE_CHECKOUT === "true" ||
    process.env.NEXT_PUBLIC_ENABLE_STORE_CHECKOUT === true;

  const updatePendingVerification = useCallback((data) => {
    setPendingVerification(data);
    try {
      const raw = window.sessionStorage.getItem(CHECKOUT_ATTEMPT_KEY);
      if (raw) {
        const current = JSON.parse(raw);
        if (data) {
          current.pendingVerification = data;
        } else {
          delete current.pendingVerification;
        }
        window.sessionStorage.setItem(CHECKOUT_ATTEMPT_KEY, JSON.stringify(current));
      }
    } catch {}
  }, []);

  // Restore active checkout attempt from sessionStorage to prevent duplicate orders across refreshes
  // Authoritative server orders (with orderId) are NEVER discarded solely because a local timer expires!
  useEffect(() => {
    try {
      const savedAttempt = window.sessionStorage.getItem(CHECKOUT_ATTEMPT_KEY);
      if (savedAttempt) {
        const parsed = JSON.parse(savedAttempt);
        if (parsed?.orderId) {
          // Authoritative server order: restore attempt state and actively check backend status
          setAttempt(parsed);
          if (parsed.pendingVerification) {
            setPendingVerification(parsed.pendingVerification);
          }
          const token = parsed.checkoutToken || parsed.checkoutRecoverySecret;
          setVerifyingPending(true);
          ordersApi
            .verifyPayment({
              orderId: parsed.orderId,
              checkoutToken: token,
              razorpay_payment_id: parsed.pendingVerification?.razorpay_payment_id,
              razorpay_order_id: parsed.pendingVerification?.razorpay_order_id,
              razorpay_signature: parsed.pendingVerification?.razorpay_signature,
            })
            .then((res) => {
              if (res?.success && res.status === "paid") {
                const isHeld = res.outcome === "held" || Boolean(res.order?.fulfillmentHold?.active);
                clear();
                setConfirmed({
                  ...(res.order || { orderId: parsed.orderId }),
                  outcome: isHeld ? "held" : "paid",
                  holdReason: isHeld ? (res.order?.fulfillmentHold?.reason || res.message) : undefined,
                });
                updatePendingVerification(null);
                setAttempt(null);
                try {
                  window.sessionStorage.removeItem(CHECKOUT_ATTEMPT_KEY);
                } catch {}
              } else if (res?.status === "cancelled" || res?.status === "refunded") {
                setAttempt(null);
                updatePendingVerification(null);
                try {
                  window.sessionStorage.removeItem(CHECKOUT_ATTEMPT_KEY);
                } catch {}
                if (notify) notify(`Previous attempt for Order #${parsed.orderId} was ${res.status}.`);
              } else if (res?.outcome === "verification_pending" || res?.status === "pending") {
                updatePendingVerification({
                  orderId: parsed.orderId,
                  checkoutToken: token,
                  status: "pending",
                  message: res.message || "Payment verification is in progress.",
                });
              }
            })
            .catch((err) => {
              console.warn("[Checkout] Auto-reconciliation check notice:", err.message);
              updatePendingVerification({
                orderId: parsed.orderId,
                checkoutToken: token,
                status: "pending",
                message: "Unable to check payment status automatically. You can check status below.",
              });
            })
            .finally(() => {
              setVerifyingPending(false);
            });
        } else if (parsed?.checkoutKey && Date.now() - (parsed.createdAt || 0) < 30 * 60 * 1000) {
          // Unsubmitted client-side draft within 30 minutes
          setAttempt(parsed);
        } else {
          // Stale local client draft without any server order — clean up draft key
          window.sessionStorage.removeItem(CHECKOUT_ATTEMPT_KEY);
        }
      }
    } catch {
      /* ignore storage read error */
    }
  }, [clear, notify, updatePendingVerification]);

  const handleDiscardAttempt = useCallback(async () => {
    const orderId = attempt?.orderId || pendingVerification?.orderId;
    const checkoutToken =
      attempt?.checkoutToken ||
      attempt?.checkoutRecoverySecret ||
      pendingVerification?.checkoutToken;

    // If no order exists yet on the server (i.e. attempt was only client-side state without orderId):
    if (!orderId) {
      setAttempt(null);
      updatePendingVerification(null);
      setError("");
      try {
        window.sessionStorage.removeItem(CHECKOUT_ATTEMPT_KEY);
      } catch {}
      if (notify) notify("Checkout attempt reset. You can place a fresh order.");
      return;
    }

    // An order was created on the server with reserved inventory or a payment attempt
    setVerifyingPending(true);
    setError("");

    try {
      // Step 1: Query backend payment status first to verify if captured, pending, or unpaid
      let verifyRes = null;
      try {
        verifyRes = await ordersApi.verifyPayment({
          orderId,
          checkoutToken,
          razorpay_payment_id: pendingVerification?.razorpay_payment_id,
          razorpay_order_id: pendingVerification?.razorpay_order_id,
          razorpay_signature: pendingVerification?.razorpay_signature,
        });
      } catch (verifyErr) {
        // Network error or gateway failure — NEVER discard unresolved state!
        setError(
          `Unable to verify payment status (${verifyErr.message}). Your checkout attempt has been preserved to protect against duplicate charges. Please re-check payment status when your connection is restored.`
        );
        return;
      }

      // Step 2: If payment was captured or already paid, display confirmed or held order screen
      if (verifyRes?.success && verifyRes.status === "paid") {
        const isHeld = verifyRes.outcome === "held" || Boolean(verifyRes.order?.fulfillmentHold?.active);
        clear();
        setConfirmed({
          ...(verifyRes.order || { orderId }),
          outcome: isHeld ? "held" : "paid",
          holdReason: isHeld ? (verifyRes.order?.fulfillmentHold?.reason || verifyRes.message) : undefined,
        });
        updatePendingVerification(null);
        setAttempt(null);
        try {
          window.sessionStorage.removeItem(CHECKOUT_ATTEMPT_KEY);
        } catch {}
        if (notify) {
          notify(isHeld ? "Payment received and held for review." : "Payment confirmed! Here is your order confirmation.");
        }
        return;
      }

      // Step 3: If payment is pending or held for review by the gateway, preserve recovery state
      if (
        verifyRes?.outcome === "held" ||
        verifyRes?.outcome === "verification_pending" ||
        verifyRes?.status === "pending"
      ) {
        updatePendingVerification({
          orderId,
          checkoutToken,
          status: "pending",
          message: verifyRes.message || "Payment is pending gateway confirmation.",
        });
        setError(
          verifyRes?.message ||
            "Your payment is currently being confirmed by the payment gateway or bank. This attempt cannot be discarded while pending. Please re-check payment status in a moment."
        );
        return;
      }

      // Step 4: Payment confirmed unpaid by server. Ask backend to cleanly abandon and release inventory.
      try {
        const abandonRes = await ordersApi.abandonCheckout({
          orderId,
          checkoutToken,
          reason: "Customer discarded unresolved attempt to start fresh",
        });

        if (abandonRes?.success && (abandonRes.finalized || abandonRes.alreadyCancelled)) {
          // Authoritative backend confirmation that inventory was restored!
          setAttempt(null);
          updatePendingVerification(null);
          setError("");
          try {
            window.sessionStorage.removeItem(CHECKOUT_ATTEMPT_KEY);
          } catch {}
          if (notify) {
            notify(
              abandonRes.message ||
                "Previous unpaid attempt cancelled and reserved inventory restored. You can place a fresh order."
            );
          }
          return;
        }

        setError(
          abandonRes?.message ||
            "Unable to cancel checkout attempt on server. Please try again or re-check payment status."
        );
      } catch (abandonErr) {
        // If abandonCheckout returned HTTP 409 (e.g. PAYMENT_CAPTURED) or network error:
        // Do NOT clear the attempt!
        if (abandonErr.status === 409 || abandonErr.code === "PAYMENT_CAPTURED") {
          updatePendingVerification({
            orderId,
            checkoutToken,
            status: "pending",
            message: abandonErr.message,
          });
          setError(
            abandonErr.message ||
              "A payment was detected for this order. It cannot be cancelled as unpaid. Please click 'Check Payment Status' to view your order."
          );
        } else {
          setError(
            `Unable to cancel previous order on server (${abandonErr.message}). Your attempt has been preserved to protect reserved inventory.`
          );
        }
      }
    } finally {
      setVerifyingPending(false);
    }
  }, [attempt, pendingVerification, updatePendingVerification, clear, notify]);

  // Prefill address from authenticated user if available
  useEffect(() => {
    if (user && !address.email) {
      const names = (user.name || "").trim().split(" ");
      const firstName = names[0] || "";
      const lastName = names.slice(1).join(" ") || "";
      const savedAddresses = Array.isArray(user.address) ? user.address : [];

      if (savedAddresses.length > 0) {
        const defaultAddr = savedAddresses[0];
        setSelectedSavedAddrId(defaultAddr._id);
        const addrNames = (defaultAddr.fullName || "").trim().split(" ");
        setAddress({
          firstName: addrNames[0] || firstName,
          lastName: addrNames.slice(1).join(" ") || lastName,
          email: user.email || "",
          phone: defaultAddr.mobile || user.phone || "",
          address: defaultAddr.address || "",
          landmark: defaultAddr.landmark || "",
          city: defaultAddr.city || "",
          state: defaultAddr.state || "",
          pincode: defaultAddr.pincode || "",
        });
      } else {
        setAddress((prev) => ({
          ...prev,
          firstName: prev.firstName || firstName,
          lastName: prev.lastName || lastName,
          email: prev.email || user.email || "",
          phone: prev.phone || user.phone || "",
        }));
      }
    }
  }, [user]);

  useEffect(() => {
    setServiceability(null);
  }, [address.pincode]);

  // Discount calculation
  const discountAmount = appliedCoupon?.discountAmount || 0;
  // Free Shipping for orders >= ₹999
  const shippingCost = subtotal >= 999 ? 0 : 100;
  const grandTotal = Math.max(0, subtotal - discountAmount + shippingCost);

  // Select a saved address
  function selectSavedAddress(addr) {
    setSelectedSavedAddrId(addr._id);
    const names = (addr.fullName || "").trim().split(" ");
    setAddress({
      firstName: names[0] || "",
      lastName: names.slice(1).join(" ") || "",
      email: user?.email || address.email || "",
      phone: addr.mobile || "",
      address: addr.address || "",
      landmark: addr.landmark || "",
      city: addr.city || "",
      state: addr.state || "",
      pincode: addr.pincode || "",
    });
  }

  // Real backend coupon validation
  async function handleApplyCoupon(e) {
    e.preventDefault();
    const code = couponInput.trim().toUpperCase();
    if (!code) return;

    setError("");
    setCouponMessage("");

    if (!user) {
      setCouponMessage("Please sign in to apply discount coupons.");
      return;
    }

    setApplyingCoupon(true);
    try {
      const res = await couponApi.apply(code, subtotal);
      if (res?.success && res.coupon) {
        setAppliedCoupon({
          code: res.coupon.code,
          discountAmount: Number(res.coupon.discountAmount || 0),
        });
        setCouponMessage(`Coupon "${res.coupon.code}" applied successfully! You saved ${formatINR(res.coupon.discountAmount)}.`);
      } else {
        setCouponMessage(res?.message || "Invalid coupon code.");
        setAppliedCoupon(null);
      }
    } catch (err) {
      setCouponMessage(err.message || "Failed to apply coupon. Please check code or minimum purchase requirement.");
      setAppliedCoupon(null);
    } finally {
      setApplyingCoupon(false);
    }
  }

  function removeCoupon() {
    setAppliedCoupon(null);
    setCouponInput("");
    setCouponMessage("");
  }

  function validateAddress() {
    if (!address.firstName?.trim()) {
      return "Please enter your First Name.";
    }
    if (!address.email?.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(address.email.trim())) {
      return "Please enter a valid email address for order confirmation.";
    }
    const cleanPhone = address.phone?.replace(/\D/g, "") || "";
    if (cleanPhone.length !== 10) {
      return "Please enter a valid 10-digit mobile number.";
    }
    if (!address.address?.trim()) {
      return "Please enter your flat, house number, and street address.";
    }
    if (!address.pincode?.trim() || !/^\d{6}$/.test(address.pincode.trim())) {
      return "Please enter a valid 6-digit PIN code.";
    }
    if (!address.city?.trim() || !address.state?.trim()) {
      return "Please enter your City and State.";
    }
    return null;
  }

  function proceedToPayment() {
    setError("");
    const validationError = validateAddress();
    if (validationError) {
      setError(validationError);
      return;
    }
    setStep(2);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 120, behavior: "smooth" });
    }
  }

  async function checkPincode() {
    if (!/^\d{6}$/.test(address.pincode)) {
      setError("Please enter a valid 6-digit PIN code.");
      return;
    }
    setChecking(true);
    setError("");
    try {
      if (apiConfigured) {
        const result = await ordersApi.serviceability(address.pincode, paymentMethod === "cod");
        setServiceability(result);
      } else {
        setServiceability({ serviceable: true, codAvailable: true });
      }
    } catch (err) {
      setError(err.message || "Unable to check pincode delivery.");
    } finally {
      setChecking(false);
    }
  }

  // Retry verifying a pending payment without charging the customer again
  async function handleRetryVerification() {
    const targetOrder = pendingVerification || (attempt?.orderId ? {
      orderId: attempt.orderId,
      checkoutToken: attempt.checkoutToken || attempt.checkoutRecoverySecret,
    } : null);

    if (!targetOrder?.orderId) return;
    setVerifyingPending(true);
    setError("");

    try {
      const verifyRes = await ordersApi.verifyPayment({
        orderId: targetOrder.orderId,
        checkoutToken: targetOrder.checkoutToken,
        razorpay_payment_id: targetOrder.razorpay_payment_id,
        razorpay_order_id: targetOrder.razorpay_order_id,
        razorpay_signature: targetOrder.razorpay_signature,
      });

      if (verifyRes?.success && verifyRes.status === "paid") {
        const isHeld = verifyRes.outcome === "held" || Boolean(verifyRes.order?.fulfillmentHold?.active);
        clear();
        setConfirmed({
          ...(verifyRes.order || { orderId: targetOrder.orderId }),
          outcome: isHeld ? "held" : "paid",
          holdReason: isHeld ? (verifyRes.order?.fulfillmentHold?.reason || verifyRes.message) : undefined,
        });
        updatePendingVerification(null);
        setAttempt(null);
        try {
          window.sessionStorage.removeItem(CHECKOUT_ATTEMPT_KEY);
        } catch {}
        return;
      }

      if (verifyRes?.status === "cancelled" || verifyRes?.status === "refunded") {
        setAttempt(null);
        updatePendingVerification(null);
        try {
          window.sessionStorage.removeItem(CHECKOUT_ATTEMPT_KEY);
        } catch {}
        setError(`Order #${targetOrder.orderId} was ${verifyRes.status}. Your reserved inventory has been released.`);
        return;
      }

      setError(
        verifyRes?.message ||
          "Payment status is still pending gateway reconciliation. If you have already completed payment in your UPI app/netbanking, please wait a minute and re-check."
      );
    } catch (err) {
      setError(err.message || "Verification request failed. Please check your internet connection.");
    } finally {
      setVerifyingPending(false);
    }
  }

  // Copy Capability Token for Guest
  function copyCapabilityToken(token) {
    if (!token) return;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(token);
      setCopiedToken(true);
      notify("Capability token copied to clipboard");
      setTimeout(() => setCopiedToken(false), 3000);
    }
  }

  // Submit Order (Real backend COD or Razorpay with full failure protection)
  async function submit(e) {
    if (e) e.preventDefault();
    setError("");

    // Feature Flag Enforcement
    if (!isCheckoutEnabled) {
      setError("Online checkout is temporarily paused for scheduled system readiness. Your shopping bag and saved details are preserved.");
      return;
    }

    if (!items.length) {
      setError("Your shopping bag is empty.");
      return;
    }

    const validationError = validateAddress();
    if (validationError) {
      setStep(1);
      setError(validationError);
      return;
    }

    // Concurrency guard to prevent duplicate order submissions
    if (placing || isSubmittingRef.current) return;

    // Prevent fresh payment initiation while an unresolved pending verification exists
    if (pendingVerification?.orderId) {
      setError(
        `You have an unresolved payment verification for Order #${pendingVerification.orderId}. Please click "Re-check Payment" or resolve that attempt before starting a new payment.`
      );
      return;
    }

    // If an existing order was already initialized on the server for this attempt:
    // Ensure that if switching to COD, the customer discards the unpaid prepaid attempt first to release reserved stock
    if (attempt?.orderId && paymentMethod === "cod") {
      setError(
        `You have an active online checkout attempt (Order #${attempt.orderId}). Please click "Discard & Start Fresh" to cancel that attempt and restore reserved inventory before placing a Cash on Delivery order.`
      );
      return;
    }

    isSubmittingRef.current = true;
    setPlacing(true);

    let currentAttempt = attempt;
    if (!currentAttempt) {
      currentAttempt = {
        checkoutKey: crypto.randomUUID(),
        checkoutRecoverySecret: crypto.randomUUID().replaceAll("-", ""),
        createdAt: Date.now(),
      };
      setAttempt(currentAttempt);
      try {
        window.sessionStorage.setItem(CHECKOUT_ATTEMPT_KEY, JSON.stringify(currentAttempt));
      } catch {
        /* storage unavailable */
      }
    }

    try {
      const orderPayload = {
        items: items.map(({ product, qty }) => ({
          productId: product.id,
          quantity: qty,
        })),
        shippingAddress: {
          firstName: address.firstName.trim(),
          lastName: (address.lastName || "").trim(),
          email: address.email.trim().toLowerCase(),
          phone: address.phone.replace(/\D/g, "").trim(),
          address: address.address.trim(),
          landmark: (address.landmark || "").trim(),
          city: address.city.trim(),
          state: address.state.trim(),
          pincode: address.pincode.trim(),
        },
        couponCode: appliedCoupon?.code || undefined,
        checkoutKey: currentAttempt.checkoutKey,
        checkoutRecoverySecret: currentAttempt.checkoutRecoverySecret,
      };

      // ---------------------------------------------------------------------
      // 1. CASH ON DELIVERY (COD) FLOW
      // ---------------------------------------------------------------------
      if (paymentMethod === "cod") {
        const result = await ordersApi.createCod(orderPayload);

        if (result?.success && result.order?.orderId) {
          clear();
          setConfirmed(result.order);
          setAttempt(null);
          try {
            window.sessionStorage.removeItem(CHECKOUT_ATTEMPT_KEY);
            // Save last guest order info for seamless claim on account page
            if (!user && result.order.checkoutToken) {
              window.sessionStorage.setItem(
                "hoq_last_guest_order",
                JSON.stringify({
                  orderId: result.order.orderId,
                  token: result.order.checkoutToken,
                  createdAt: Date.now(),
                })
              );
            }
          } catch {}
          return;
        }

        throw new Error(result?.message || "Failed to confirm your COD order. Please try again.");
      }

      // ---------------------------------------------------------------------
      // 2. PREPAID ONLINE PAYMENT (RAZORPAY) FLOW
      // ---------------------------------------------------------------------
      const isSdkLoaded = await loadRazorpayScript();
      if (!isSdkLoaded) {
        throw new Error("Unable to load secure payment gateway. Please check your internet connection.");
      }

      const initResult = await ordersApi.createOrder({
        ...orderPayload,
        paymentMethod: "prepaid",
      });

      const serverOrder = initResult?.order;
      if (!serverOrder || !serverOrder.orderId) {
        throw new Error(initResult?.message || "Payment initialization failed. Please try again.");
      }

      // Update attempt with server assigned orderId for seamless recovery
      currentAttempt.orderId = serverOrder.orderId;
      try {
        window.sessionStorage.setItem(CHECKOUT_ATTEMPT_KEY, JSON.stringify(currentAttempt));
      } catch {}

      // Handle 100% coupon zero-payable prepaid orders (already settled without gateway)
      if (serverOrder.isZeroPayable || serverOrder.outcome === "paid_settled") {
        clear();
        setConfirmed(serverOrder);
        setAttempt(null);
        try {
          window.sessionStorage.removeItem(CHECKOUT_ATTEMPT_KEY);
        } catch {}
        return;
      }

      // Launch Razorpay Checkout Modal
      const razorpayOptions = {
        key: serverOrder.key || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: serverOrder.amount || serverOrder.payablePaise,
        currency: serverOrder.currency || "INR",
        name: "House of Qalakari",
        description: `Order ${serverOrder.orderId}`,
        order_id: serverOrder.razorpayOrderId,
        prefill: {
          name: `${serverOrder.shippingAddress?.firstName || address.firstName} ${serverOrder.shippingAddress?.lastName || address.lastName || ""}`.trim(),
          email: serverOrder.shippingAddress?.email || address.email,
          contact: serverOrder.shippingAddress?.phone || address.phone,
        },
        theme: {
          color: "#1c2e24", // Deep pine luxury brand color
        },
        modal: {
          ondismiss: async function () {
            // NEVER clear cart when modal is closed!
            setPlacing(false);
            isSubmittingRef.current = false;
            setError("Payment window was dismissed. Your bag and checkout details have been preserved. You can resume payment whenever you are ready.");
          },
        },
        handler: async function (response) {
          try {
            setPlacing(true);
            const tokenToVerify = serverOrder.checkoutToken || currentAttempt.checkoutRecoverySecret;
            const verifyRes = await ordersApi.verifyPayment({
              orderId: serverOrder.orderId,
              checkoutToken: tokenToVerify,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            // NEVER display paid status without verified backend response
            if (verifyRes?.success && verifyRes.status === "paid") {
              const isHeld = verifyRes.outcome === "held" || Boolean(verifyRes.order?.fulfillmentHold?.active);
              clear();
              setConfirmed({
                ...(verifyRes.order || serverOrder),
                outcome: isHeld ? "held" : "paid",
                holdReason: isHeld ? (verifyRes.order?.fulfillmentHold?.reason || verifyRes.message) : undefined,
              });
              setAttempt(null);
              updatePendingVerification(null);
              try {
                window.sessionStorage.removeItem(CHECKOUT_ATTEMPT_KEY);
                if (!user && (serverOrder.checkoutToken || tokenToVerify)) {
                  window.sessionStorage.setItem(
                    "hoq_last_guest_order",
                    JSON.stringify({
                      orderId: serverOrder.orderId,
                      token: serverOrder.checkoutToken || tokenToVerify,
                      createdAt: Date.now(),
                    })
                  );
                }
              } catch {}
            } else {
              // Gateway captured payment but server reconciliation pending
              updatePendingVerification({
                orderId: serverOrder.orderId,
                checkoutToken: tokenToVerify,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });
              setError("Payment was captured by gateway, but order settlement is pending. Please click 'Check Payment Status' below to finalize.");
            }
          } catch (verifyErr) {
            // Verification network failure — allow customer to re-verify safely
            updatePendingVerification({
              orderId: serverOrder.orderId,
              checkoutToken: serverOrder.checkoutToken || currentAttempt.checkoutRecoverySecret,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            setError(`Network timeout during payment verification. If funds were deducted, click 'Check Payment Status' below to complete your order without paying again.`);
          } finally {
            setPlacing(false);
            isSubmittingRef.current = false;
          }
        },
      };

      const rzpInstance = new window.Razorpay(razorpayOptions);

      rzpInstance.on("payment.failed", function (response) {
        setPlacing(false);
        isSubmittingRef.current = false;
        const reason = response.error?.description || response.error?.reason || "Gateway declined transaction.";
        setError(`Payment failed: ${reason}. Your bag items have been preserved.`);
      });

      rzpInstance.open();
    } catch (err) {
      setError(err.message || "An unexpected error occurred while placing your order. Your bag is preserved.");
      setPlacing(false);
      isSubmittingRef.current = false;
    } finally {
      if (paymentMethod === "cod") {
        setPlacing(false);
        isSubmittingRef.current = false;
      }
    }
  }

  // -------------------------------------------------------------------------
  // ORDER CONFIRMED VIEW (Only reached after verified backend confirmation)
  // -------------------------------------------------------------------------
  if (confirmed) {
    const isGuest = !user;
    const checkoutToken = confirmed.checkoutToken || attempt?.checkoutRecoverySecret;
    const isHeld = confirmed.outcome === "held" || Boolean(confirmed.fulfillmentHold?.active);

    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center sm:py-24">
        {isHeld ? (
          <>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-800 shadow-sm">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h1 className="mt-4 font-display text-3xl font-semibold text-pine-950 sm:text-4xl">
              Payment Received — Under Review
            </h1>
            <p className="mt-3 text-sm text-amber-950 bg-amber-50/90 border border-amber-200/80 rounded-xl p-3.5 leading-relaxed">
              {confirmed.holdReason ||
                confirmed.message ||
                "Your payment was confirmed by the payment gateway, but this order is temporarily held for routine verification before fulfillment. You do NOT need to submit payment again."}
            </p>
          </>
        ) : (
          <>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 shadow-sm">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h1 className="mt-4 font-display text-3xl font-semibold text-pine-950 sm:text-4xl">
              Order Placed Successfully!
            </h1>
            <p className="mt-2 text-sm text-muted">
              Thank you for choosing House of Qalakari. Your order has been registered and is being carefully hand-inspected and packed.
            </p>
          </>
        )}

        <div className="mt-6 rounded-2xl border border-pine-950/10 bg-sand-50/60 p-6 text-center space-y-3">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted">Order Reference</p>
            <p className="mt-1 font-mono text-xl font-bold text-pine-950">
              {confirmed.orderId || confirmed._id}
            </p>
          </div>

          <div className="border-t border-pine-950/10 pt-3 flex justify-between text-xs text-muted">
            <span>Payment Mode:</span>
            <strong className="text-pine-950">
              {confirmed.paymentMethod === "cod" || confirmed.payment?.method === "cod"
                ? "Cash on Delivery"
                : "Prepaid Online Payment"}
            </strong>
          </div>

          <div className="flex justify-between text-xs text-muted">
            <span>Payment Status:</span>
            <strong className={isHeld ? "text-amber-800" : "text-emerald-800"}>
              {isHeld
                ? "Paid (Review in Progress)"
                : confirmed.paymentMethod === "cod" || confirmed.payment?.method === "cod"
                ? "Pending Delivery (COD)"
                : "Payment Verified & Paid"}
            </strong>
          </div>

          <div className="flex justify-between text-xs text-muted">
            <span>Deliver To:</span>
            <span className="font-medium text-pine-950">
              {confirmed.shippingAddress?.firstName} ({confirmed.shippingAddress?.city},{" "}
              {confirmed.shippingAddress?.state})
            </span>
          </div>

          {/* Secure Guest Order Recovery Capability Token Section */}
          {isGuest && checkoutToken && (
            <div className="mt-4 rounded-xl border border-pine-900/20 bg-white p-4 text-left">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-pine-900">
                  Guest Order Capability Token
                </span>
                <button
                  type="button"
                  onClick={() => copyCapabilityToken(checkoutToken)}
                  className="text-[11px] font-semibold text-pine-900 underline hover:text-pine-700 cursor-pointer"
                >
                  {copiedToken ? "Copied! ✓" : "Copy Token"}
                </button>
              </div>
              <p className="mt-1.5 font-mono text-xs break-all text-pine-950 bg-linen/40 p-2 rounded">
                {checkoutToken}
              </p>
              <p className="mt-2 text-[11px] text-muted leading-relaxed">
                Save this capability token. If you sign up or log in later, you can securely claim and link this order to your account from the <strong>My Orders</strong> page.
              </p>
            </div>
          )}
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            href="/orders"
            className="cursor-pointer rounded-lg bg-pine-900 px-6 py-3 font-inter text-xs font-semibold uppercase tracking-wider text-white shadow transition-colors hover:bg-pine-950"
          >
            View Your Orders
          </Link>
          <Link
            href="/shop"
            className="cursor-pointer rounded-lg border border-pine-950/20 bg-white px-6 py-3 font-inter text-xs font-semibold uppercase tracking-wider text-pine-950 transition-colors hover:bg-sand-50"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // MAIN CHECKOUT VIEW
  // -------------------------------------------------------------------------
  const savedAddresses = user && Array.isArray(user.address) ? user.address : [];

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8 lg:px-8 lg:py-12">
      {/* Checkout Feature Flag Notification Banner */}
      {!isCheckoutEnabled && (
        <div
          role="alert"
          className="mb-8 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900 flex items-start gap-3 shadow-xs"
        >
          <span className="text-base">ℹ️</span>
          <div>
            <p className="font-semibold text-sm text-amber-950">
              Checkout Under Scheduled Readiness Verification
            </p>
            <p className="mt-0.5 leading-relaxed">
              Order submission is temporarily paused while store readiness and migration checks complete. You can continue exploring sarees, updating your shopping bag, and managing your wishlist.
            </p>
          </div>
        </div>
      )}

      {/* In-Flight Payment Recovery Banner if verification timed out or attempt is unresolved */}
      {pendingVerification ? (
        <div
          role="alert"
          className="mb-8 rounded-xl border border-blue-200 bg-blue-50 p-4 text-xs text-blue-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs"
        >
          <div>
            <p className="font-semibold text-sm text-blue-950">
              Payment Verification Pending for Order #{pendingVerification.orderId}
            </p>
            <p className="mt-0.5 leading-relaxed text-blue-800">
              Your gateway transaction was submitted. Click below to verify and finalize your order without making a duplicate payment.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              disabled={verifyingPending}
              onClick={handleRetryVerification}
              className="rounded-lg bg-pine-900 px-4 py-2 font-inter text-xs font-semibold text-white shadow hover:bg-pine-950 disabled:opacity-50"
            >
              {verifyingPending ? "Verifying…" : "Check Payment Status"}
            </button>
            <button
              type="button"
              disabled={verifyingPending}
              onClick={handleDiscardAttempt}
              className="rounded-lg border border-pine-900/20 bg-white px-3 py-2 font-inter text-xs font-medium text-pine-900 hover:bg-pine-50"
            >
              Start Fresh
            </button>
          </div>
        </div>
      ) : attempt?.orderId && !confirmed ? (
        <div
          role="alert"
          className="mb-8 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs"
        >
          <div>
            <p className="font-semibold text-sm text-amber-950">
              Previous Order Attempt Found (#{attempt.orderId})
            </p>
            <p className="mt-0.5 leading-relaxed text-amber-800">
              An online payment attempt was initiated. If you completed payment in your UPI app, check status to finalize; otherwise, you can discard and start fresh.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              disabled={verifyingPending}
              onClick={handleRetryVerification}
              className="rounded-lg bg-pine-900 px-4 py-2 font-inter text-xs font-semibold text-white shadow hover:bg-pine-950 disabled:opacity-50"
            >
              {verifyingPending ? "Checking…" : "Re-check Payment"}
            </button>
            <button
              type="button"
              disabled={verifyingPending}
              onClick={handleDiscardAttempt}
              className="rounded-lg border border-pine-900/20 bg-white px-3 py-2 font-inter text-xs font-medium text-pine-900 hover:bg-amber-100/50"
            >
              Discard & Start Fresh
            </button>
          </div>
        </div>
      ) : null}

      {/* Checkout Header & Steps Indicator */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-pine-950/10 pb-6">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-pine-950 sm:text-3xl">
              Secure Checkout
            </h1>
            <p className="mt-1 font-inter text-xs text-muted sm:text-sm">
              Authentic handwoven pure linen sarees dispatched directly from artisan looms.
            </p>
          </div>

          {/* Stepper Progress */}
          <div className="flex items-center gap-2 font-inter text-xs">
            <button
              type="button"
              onClick={() => setStep(1)}
              className={`flex items-center gap-2 rounded-full px-3.5 py-1.5 font-semibold transition ${
                step === 1
                  ? "bg-pine-900 text-white"
                  : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
              }`}
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-[11px]">
                {step > 1 ? "✓" : "1"}
              </span>
              <span>Delivery Address</span>
            </button>

            <span className="text-muted">──</span>

            <button
              type="button"
              onClick={() => {
                const err = validateAddress();
                if (!err) setStep(2);
                else setError(err);
              }}
              className={`flex items-center gap-2 rounded-full px-3.5 py-1.5 font-semibold transition ${
                step === 2
                  ? "bg-pine-900 text-white"
                  : "bg-neutral-100 text-muted hover:text-pine-950"
              }`}
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-[11px]">
                2
              </span>
              <span>Payment Option</span>
            </button>
          </div>
        </div>
      </div>

      {!items.length ? (
        <div className="rounded-2xl border border-pine-950/10 bg-white p-12 text-center shadow-sm">
          <p className="font-display text-lg text-pine-950">Your shopping bag is empty</p>
          <p className="mt-1 text-xs text-muted">
            Discover our handwoven pure linen sarees to place an order.
          </p>
          <Link
            href="/shop"
            className="mt-6 inline-block cursor-pointer rounded-lg bg-pine-900 px-6 py-2.5 font-inter text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-pine-950"
          >
            Explore Sarees
          </Link>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_390px] lg:items-start">
          {/* Left Column */}
          <div className="space-y-6">
            {step === 1 ? (
              /* STEP 1: Address Entry */
              <div className="space-y-6">
                {/* Saved Address Selector for Logged In Customer */}
                {savedAddresses.length > 0 && (
                  <div className="rounded-2xl border border-pine-950/10 bg-white p-6 shadow-sm">
                    <h3 className="font-display text-base font-semibold text-pine-950">
                      Select Delivery Address
                    </h3>
                    <p className="mt-0.5 text-xs text-muted">
                      Choose from your saved addresses or fill a new delivery location below.
                    </p>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {savedAddresses.map((addr) => {
                        const isSelected = selectedSavedAddrId === addr._id;
                        return (
                          <div
                            key={addr._id}
                            onClick={() => selectSavedAddress(addr)}
                            className={`cursor-pointer rounded-xl border p-4 text-xs transition-all ${
                              isSelected
                                ? "border-pine-900 bg-neutral-50 shadow-xs ring-1 ring-pine-900"
                                : "border-pine-950/15 bg-white hover:border-pine-900/40"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-sm text-pine-950">{addr.fullName}</span>
                              {isSelected && (
                                <span className="rounded-full bg-pine-900 px-2 py-0.5 text-[10px] font-bold text-white">
                                  Selected
                                </span>
                              )}
                            </div>
                            <p className="mt-1 text-muted leading-relaxed line-clamp-2">{addr.address}</p>
                            <p className="mt-1 font-medium text-pine-950">
                              {addr.city}, {addr.state} - {addr.pincode}
                            </p>
                            <p className="mt-1 text-[11px] text-muted">Mobile: {addr.mobile}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <ShippingAddressForm
                  value={address}
                  onChange={setAddress}
                  error={error}
                />

                <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-pine-950/10 bg-white p-6 shadow-sm sm:p-8">
                  <div>
                    <p className="font-display text-base font-semibold text-pine-950">
                      Ready for Payment?
                    </p>
                    <p className="mt-0.5 text-xs text-muted">
                      Proceed to choose Cash on Delivery or Secure Online Payment.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={proceedToPayment}
                    className="cursor-pointer inline-flex items-center gap-2 rounded-lg bg-pine-900 px-7 py-3.5 font-inter text-xs font-semibold uppercase tracking-wider text-white shadow-sm transition hover:bg-pine-950 shrink-0"
                  >
                    <span>Continue to Payment</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            ) : (
              /* STEP 2: Payment Method */
              <div className="space-y-6">
                {/* Delivery Address Summary Card */}
                <div className="rounded-2xl border border-pine-950/10 bg-neutral-50 p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-pine-900">
                        <span className="h-2 w-2 rounded-full bg-emerald-600" />
                        Delivering To
                      </span>
                      <h3 className="mt-1 font-display text-base font-semibold text-pine-950">
                        {address.firstName} {address.lastName}
                      </h3>
                      <p className="mt-0.5 text-xs text-muted leading-relaxed">
                        {address.address}
                        {address.landmark ? `, ${address.landmark}` : ""}
                        <br />
                        {address.city}, {address.state} - <strong className="text-pine-950">{address.pincode}</strong>
                      </p>
                      <p className="mt-1 text-xs text-muted">
                        Phone: <span className="font-medium text-pine-950">{address.phone}</span> · Email:{" "}
                        <span className="font-medium text-pine-950">{address.email}</span>
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="cursor-pointer inline-flex items-center gap-1 rounded-lg border border-pine-950/20 bg-white px-3 py-1.5 text-xs font-semibold text-pine-900 transition hover:bg-neutral-50 shrink-0"
                    >
                      ✏️ Edit Address
                    </button>
                  </div>
                </div>

                {/* Payment Option Selection */}
                <div className="rounded-2xl border border-pine-950/10 bg-white p-6 shadow-sm sm:p-8">
                  <div className="flex items-center justify-between border-b border-pine-950/10 pb-4">
                    <div>
                      <h2 className="font-display text-xl font-semibold text-pine-950">
                        Choose Payment Method
                      </h2>
                      <p className="mt-1 text-xs text-muted">
                        Select your preferred payment mode to place your order.
                      </p>
                    </div>
                    <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-pine-900">
                      Step 2 of 2
                    </span>
                  </div>

                  <div className="mt-6 space-y-4">
                    {/* Option 1: Cash on Delivery */}
                    <label
                      className={`block cursor-pointer rounded-2xl border p-5 transition-all ${
                        paymentMethod === "cod"
                          ? "border-pine-900 bg-neutral-50/70 shadow-sm ring-1 ring-pine-900"
                          : "border-pine-950/10 bg-white hover:border-pine-950/30"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="cod"
                          checked={paymentMethod === "cod"}
                          onChange={() => setPaymentMethod("cod")}
                          className="mt-1 h-4 w-4 text-pine-900 cursor-pointer accent-pine-900"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="font-inter text-sm font-semibold text-pine-950">
                              Cash on Delivery (COD)
                            </span>
                            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                              Zero Extra Fee
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-muted leading-relaxed">
                            Pay with cash or digital UPI at your doorstep when your saree parcel is delivered.
                          </p>
                          <div className="mt-3 flex items-center gap-3 text-[11px] text-pine-900 font-medium">
                            <span>✓ Doorstep verification</span>
                            <span>✓ Digital UPI on delivery accepted</span>
                          </div>
                        </div>
                      </div>
                    </label>

                    {/* Option 2: Prepaid Online Payment */}
                    <label
                      className={`block cursor-pointer rounded-2xl border p-5 transition-all ${
                        paymentMethod === "online"
                          ? "border-pine-900 bg-neutral-50/70 shadow-sm ring-1 ring-pine-900"
                          : "border-pine-950/10 bg-white hover:border-pine-950/30"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="online"
                          checked={paymentMethod === "online"}
                          onChange={() => setPaymentMethod("online")}
                          className="mt-1 h-4 w-4 text-pine-900 cursor-pointer accent-pine-900"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="font-inter text-sm font-semibold text-pine-950">
                              Prepaid Online Payment (Instant &amp; 100% Secure)
                            </span>
                            <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-800">
                              Fastest Dispatch
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-muted leading-relaxed">
                            Pay securely via Google Pay, PhonePe, Paytm, BHIM UPI, Debit/Credit Card, or Net Banking.
                          </p>

                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            {PAYMENT_LOGOS.map((logo) => (
                              <div
                                key={logo.name}
                                className="flex h-7 items-center justify-center rounded border border-pine-950/10 bg-white px-2 shadow-xs"
                                title={logo.name}
                              >
                                <Image
                                  src={logo.src}
                                  alt={logo.name}
                                  width={logo.w}
                                  height={logo.h}
                                  unoptimized
                                  className="h-4 w-auto object-contain"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </label>
                  </div>

                  {error && (
                    <div role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-xs text-red-700">
                      ⚠️ {error}
                    </div>
                  )}

                  <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-pine-950/10 pt-5">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="inline-flex cursor-pointer items-center gap-1 text-xs font-semibold text-pine-900 underline hover:text-pine-950"
                    >
                      ← Back to Delivery Address
                    </button>

                    <button
                      type="button"
                      onClick={submit}
                      disabled={!isCheckoutEnabled || placing}
                      className="inline-flex cursor-pointer items-center justify-center rounded-lg bg-pine-900 px-7 py-3.5 font-inter text-xs font-semibold uppercase tracking-wider text-white shadow-sm transition hover:bg-pine-950 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {!isCheckoutEnabled
                        ? "Checkout Paused"
                        : placing
                        ? "Confirming Order…"
                        : paymentMethod === "cod"
                        ? "Place Cash on Delivery Order"
                        : `Pay ${formatINR(grandTotal)} Online`}
                    </button>
                  </div>
                </div>

                {/* Real Backend Coupon Section */}
                <div className="rounded-2xl border border-pine-950/10 bg-white p-6 shadow-sm sm:p-8">
                  <div className="flex items-center justify-between border-b border-pine-950/10 pb-4">
                    <div>
                      <h3 className="font-display text-lg font-semibold text-pine-950">
                        Have a Coupon Code?
                      </h3>
                      <p className="mt-0.5 text-xs text-muted">
                        Apply special promotion codes to your order.
                      </p>
                    </div>
                  </div>

                  {appliedCoupon ? (
                    <div className="mt-4 flex items-center justify-between rounded-lg bg-emerald-50 px-4 py-3 text-xs text-emerald-800">
                      <span>
                        <strong>{appliedCoupon.code}</strong> applied (-{formatINR(appliedCoupon.discountAmount)})
                      </span>
                      <button
                        type="button"
                        onClick={removeCoupon}
                        className="font-bold text-red-700 hover:underline cursor-pointer"
                      >
                        Remove Coupon
                      </button>
                    </div>
                  ) : (
                    <div className="mt-4 flex gap-2">
                      <input
                        id="coupon"
                        type="text"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        placeholder="e.g. WELCOME10, LINEN20"
                        className="h-10 w-full rounded-md border border-pine-950/20 px-3 font-inter text-xs uppercase outline-pine-900 placeholder:text-muted/60"
                      />
                      <button
                        type="button"
                        disabled={applyingCoupon}
                        onClick={handleApplyCoupon}
                        className="cursor-pointer rounded-md bg-pine-900 px-5 font-inter text-xs font-semibold text-white transition-colors hover:bg-pine-950 disabled:opacity-50 shrink-0"
                      >
                        {applyingCoupon ? "Checking…" : "Apply"}
                      </button>
                    </div>
                  )}

                  {couponMessage && (
                    <p
                      className={`mt-2 text-[11px] font-medium ${
                        appliedCoupon ? "text-emerald-700" : "text-red-700"
                      }`}
                    >
                      {couponMessage}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Order Summary */}
          <aside className="rounded-2xl border border-pine-950/10 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-center justify-between border-b border-pine-950/10 pb-4">
              <h2 className="font-display text-lg font-semibold text-pine-950">Order Summary</h2>
              <span className="text-xs font-semibold text-muted">
                {items.length} {items.length === 1 ? "item" : "items"}
              </span>
            </div>

            <ul className="mt-4 divide-y divide-pine-950/10 max-h-[360px] overflow-y-auto pr-1">
              {items.map(({ product, qty }) => {
                const thumb = product.image || product.gallery?.[0] || "/images/product-1.png";
                return (
                  <li key={product.id} className="flex items-center gap-3.5 py-3.5">
                    <div className="relative h-18 w-14 shrink-0 overflow-hidden rounded-lg border border-pine-950/10 bg-neutral-50">
                      <Image
                        src={thumb}
                        alt={product.name}
                        fill
                        unoptimized={/^https?:\/\//.test(thumb)}
                        className="object-cover object-top"
                        sizes="56px"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h4 className="line-clamp-1 font-display text-xs font-semibold text-pine-950">
                        {product.name}
                      </h4>
                      <p className="mt-0.5 text-[11px] text-muted">
                        {product.fabric || "Pure Linen"} · {product.colour || "Standard"}
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="font-inter text-xs font-semibold text-pine-950">
                        {formatINR((product.price || 0) * qty)}
                      </p>
                      <div className="mt-1.5 flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            if (qty <= 1) {
                              remove(product.id);
                            } else {
                              setQty(product.id, qty - 1);
                            }
                          }}
                          aria-label={qty <= 1 ? "Remove item" : "Decrease quantity"}
                          className="flex h-5 w-5 cursor-pointer items-center justify-center rounded border border-pine-900/30 text-pine-900 transition hover:bg-pine-900/10 active:scale-95"
                        >
                          {qty <= 1 ? (
                            <svg
                              width="10"
                              height="10"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                          ) : (
                            <svg
                              width="10"
                              height="10"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                            >
                              <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                          )}
                        </button>
                        <span className="min-w-[16px] text-center font-inter text-xs font-semibold text-pine-950">
                          {qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => setQty(product.id, qty + 1)}
                          aria-label="Increase quantity"
                          className="flex h-5 w-5 cursor-pointer items-center justify-center rounded border border-pine-900/30 text-pine-900 transition hover:bg-pine-900/10 active:scale-95"
                        >
                          <svg
                            width="10"
                            height="10"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                          >
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="mt-5 space-y-2.5 border-t border-pine-950/10 pt-4 text-xs">
              <div className="flex justify-between text-muted">
                <span>Subtotal</span>
                <span>{formatINR(subtotal)}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Discount ({appliedCoupon.code})</span>
                  <span>- {formatINR(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-muted">
                <span>Estimated Shipping</span>
                <span className={shippingCost === 0 ? "font-semibold text-emerald-700" : ""}>
                  {shippingCost === 0 ? "FREE" : formatINR(shippingCost)}
                </span>
              </div>
              <div className="flex justify-between border-t border-pine-950/10 pt-3 text-sm font-semibold text-pine-950">
                <span>Total Amount</span>
                <span>{formatINR(grandTotal)}</span>
              </div>
            </div>

            {error && step === 1 && (
              <div role="alert" className="mt-4 rounded-md bg-red-50 p-2.5 text-xs text-red-700">
                {error}
              </div>
            )}

            {step === 2 && (
              <button
                type="button"
                onClick={submit}
                disabled={!isCheckoutEnabled || placing}
                className="mt-6 w-full cursor-pointer rounded-lg bg-pine-900 px-4 py-3.5 font-inter text-xs font-semibold uppercase tracking-wider text-white shadow transition-all hover:bg-pine-950 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {!isCheckoutEnabled
                  ? "Checkout Paused"
                  : placing
                  ? "Confirming Order…"
                  : paymentMethod === "cod"
                  ? "Place Cash on Delivery Order"
                  : `Pay ${formatINR(grandTotal)} Online`}
              </button>
            )}

            <div className="mt-4 space-y-1.5 border-t border-pine-950/10 pt-4 text-[11px] text-muted">
              <p className="flex items-center gap-1.5">
                <span className="text-emerald-700">✓</span> 100% Pure Handloom Verified Saree
              </p>
              <p className="flex items-center gap-1.5">
                <span className="text-emerald-700">✓</span> 7-Day Hassle-Free Returns &amp; Exchanges
              </p>
              <p className="flex items-center gap-1.5">
                <span className="text-emerald-700">✓</span> 256-bit Bank-Grade SSL Secure Checkout
              </p>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
