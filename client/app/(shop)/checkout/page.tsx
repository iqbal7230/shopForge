'use client';

import Script from 'next/script';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, CheckCircle2, CreditCard, MapPin, Wallet } from 'lucide-react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { checkoutAPI, couponAPI, userAPI } from '@/lib/api';
import { ROUTES } from '@/lib/constants';
import { useAppDispatch, useAuth, useCart, useUser } from '@/lib/store/hooks';
import { addAddress, setAddresses } from '@/lib/store/slices/userSlice';
import { formatPrice, mockAddresses } from '@/lib/mock-data';

declare global {
  interface Window {
    Razorpay?: new (options: any) => { open: () => void };
  }
}

const steps = [
  { id: 1, title: 'Address' },
  { id: 2, title: 'Payment' },
  { id: 3, title: 'Review' },
];

const extractPayload = (response: any) => response?.data?.data ?? response?.data ?? response ?? {};

export default function CheckoutPage() {
  return (
    <ProtectedRoute redirectTo={ROUTES.CHECKOUT}>
      <CheckoutContent />
    </ProtectedRoute>
  );
}

function CheckoutContent() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAuth();
  const { items, subtotal, shipping, discount, total } = useCart();
  const { addresses } = useUser();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'cod'>('razorpay');
  const [couponCode, setCouponCode] = useState('');
  const [couponMessage, setCouponMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [orderMessage, setOrderMessage] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const loadAddresses = async () => {
      try {
        const response = await userAPI.getAddresses();
        const payload = extractPayload(response);
        const remoteAddresses = payload.addresses ?? payload.items ?? payload ?? [];
        if (Array.isArray(remoteAddresses) && remoteAddresses.length > 0) {
          dispatch(setAddresses(remoteAddresses));
          return;
        }
      } catch {
        // fall back to local samples below
      }

      if (addresses.length === 0) {
        dispatch(setAddresses(mockAddresses));
      }
    };

    loadAddresses();
  }, [addresses.length, dispatch, isAuthenticated]);

  useEffect(() => {
    const defaultAddress = addresses.find((address) => address.is_default) ?? addresses[0];
    if (defaultAddress && !selectedAddressId) {
      setSelectedAddressId(defaultAddress.id);
    }
  }, [addresses, selectedAddressId]);

  const selectedAddress = useMemo(() => addresses.find((address) => address.id === selectedAddressId) ?? addresses[0] ?? null, [addresses, selectedAddressId]);

  const handleApplyCoupon = async () => {
    setCouponMessage('');
    if (!couponCode.trim()) {
      setCouponMessage('Enter a coupon code to validate it.');
      return;
    }

    try {
      const response = await couponAPI.validateCoupon(couponCode.trim());
      const payload = extractPayload(response);
      setCouponMessage(payload.message ?? 'Coupon validated successfully.');
    } catch {
      setCouponMessage('Coupon code is not valid for this order.');
    }
  };

  const handleRazorpayPayment = async () => {
    if (!selectedAddress) {
      setOrderMessage('Select an address before placing the order.');
      return;
    }

    setLoading(true);
    setOrderMessage('');

    try {
      const response = await checkoutAPI.initiateCheckout({
        items,
        shipping_address_id: selectedAddress.id,
        coupon_code: couponCode || undefined,
        payment_method: paymentMethod,
      });

      const payload = extractPayload(response);
      const razorpayOrderId = payload.order_id ?? payload.razorpayOrderId ?? payload.razorpay_order_id;
      const amount = payload.amount ?? total * 100;
      const key = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

      if (paymentMethod === 'cod' || !window.Razorpay || !key || !razorpayOrderId) {
        router.push(`${ROUTES.ORDER_CONFIRMATION}/${payload.order_id ?? payload.id ?? 'pending'}`);
        return;
      }

      const razorpay = new window.Razorpay({
        key,
        amount,
        currency: payload.currency ?? 'INR',
        name: 'ShopForge',
        description: 'Order payment',
        order_id: razorpayOrderId,
        prefill: {
          name: user?.full_name ?? '',
          email: user?.email ?? '',
          contact: selectedAddress.phone,
        },
        theme: {
          color: '#111111',
        },
        handler: async (paymentResponse: any) => {
          try {
            const confirmation = await checkoutAPI.confirmPayment({
              order_id: razorpayOrderId,
              payment_id: paymentResponse.razorpay_payment_id,
              signature: paymentResponse.razorpay_signature,
              coupon_code: couponCode || undefined,
            });

            const confirmationPayload = extractPayload(confirmation);
            router.push(`${ROUTES.ORDER_CONFIRMATION}/${confirmationPayload.order_id ?? confirmationPayload.id ?? razorpayOrderId}`);
          } catch {
            router.push(`${ROUTES.ORDER_CONFIRMATION}/${razorpayOrderId}`);
          }
        },
      });

      razorpay.open();
    } catch {
      router.push(`${ROUTES.ORDER_CONFIRMATION}/pending-${Date.now()}`);
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto flex min-h-[60vh] w-full max-w-3xl items-center justify-center px-4 py-10">
        <div className="rounded-[2rem] border border-stone-200 bg-white p-8 text-center shadow-lg shadow-stone-950/5">
          <h1 className="text-2xl font-semibold">Your cart is empty</h1>
          <p className="mt-2 text-sm text-stone-600">Add items before starting checkout.</p>
          <Link href={ROUTES.PRODUCTS} className="mt-6 inline-flex items-center gap-2 rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-stone-50">
            Browse products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-lg shadow-stone-950/5 sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-stone-500">Checkout</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-stone-950">Complete your order in a few steps</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600">The flow includes address selection, coupon validation, and Razorpay payment handoff.</p>
            </div>
            <div className="flex gap-2">
              {steps.map((step) => (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => setCurrentStep(step.id)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${currentStep === step.id ? 'bg-stone-950 text-stone-50' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
                >
                  {step.id}. {step.title}
                </button>
              ))}
            </div>
          </div>

          {orderMessage ? <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{orderMessage}</div> : null}

          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
            <section className="space-y-6">
              {currentStep === 1 ? (
                <div className="rounded-[1.75rem] border border-stone-200 bg-stone-50 p-6">
                  <div className="flex items-center gap-2 text-sm font-semibold text-stone-900">
                    <MapPin className="h-4 w-4" />
                    Delivery address
                  </div>
                  <div className="mt-5 grid gap-4">
                    {addresses.map((address) => (
                      <label key={address.id} className={`cursor-pointer rounded-[1.5rem] border p-4 transition ${selectedAddressId === address.id ? 'border-stone-950 bg-white' : 'border-stone-200 bg-white/70 hover:border-stone-300'}`}>
                        <div className="flex items-start gap-3">
                          <input
                            type="radio"
                            name="address"
                            checked={selectedAddressId === address.id}
                            onChange={() => setSelectedAddressId(address.id)}
                            className="mt-1 accent-stone-950"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-stone-950">{address.full_name}</p>
                              {address.is_default ? <span className="rounded-full bg-stone-100 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-600">Default</span> : null}
                            </div>
                            <p className="mt-1 text-sm text-stone-600">{address.street}, {address.city}, {address.state} {address.postal_code}</p>
                            <p className="text-sm text-stone-600">{address.country} · {address.phone}</p>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => dispatch(addAddress(mockAddresses[0]))}
                    className="mt-5 inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-100"
                  >
                    <MapPin className="h-4 w-4" />
                    Add sample address
                  </button>
                </div>
              ) : null}

              {currentStep === 2 ? (
                <div className="rounded-[1.75rem] border border-stone-200 bg-stone-50 p-6">
                  <div className="flex items-center gap-2 text-sm font-semibold text-stone-900">
                    <CreditCard className="h-4 w-4" />
                    Payment method
                  </div>
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    {[
                      { value: 'razorpay', label: 'Razorpay', description: 'Card, UPI, wallet, and netbanking support.', icon: CreditCard },
                      { value: 'cod', label: 'Cash on delivery', description: 'Useful for a frontend fallback and testing.', icon: Wallet },
                    ].map((method) => (
                      <label key={method.value} className={`cursor-pointer rounded-[1.5rem] border p-4 transition ${paymentMethod === method.value ? 'border-stone-950 bg-white' : 'border-stone-200 bg-white/70 hover:border-stone-300'}`}>
                        <div className="flex items-start gap-3">
                          <input
                            type="radio"
                            name="payment"
                            checked={paymentMethod === method.value}
                            onChange={() => setPaymentMethod(method.value as 'razorpay' | 'cod')}
                            className="mt-1 accent-stone-950"
                          />
                          <div>
                            <p className="font-semibold text-stone-950">{method.label}</p>
                            <p className="mt-1 text-sm leading-6 text-stone-600">{method.description}</p>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>

                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <input
                      value={couponCode}
                      onChange={(event) => setCouponCode(event.target.value)}
                      placeholder="Coupon code"
                      className="min-w-56 rounded-full border border-stone-200 bg-white px-4 py-3 text-sm outline-none focus:border-stone-400"
                    />
                    <button type="button" onClick={handleApplyCoupon} className="rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-stone-50 transition hover:bg-stone-800">
                      Apply coupon
                    </button>
                  </div>
                  {couponMessage ? <p className="mt-3 text-sm text-stone-600">{couponMessage}</p> : null}
                </div>
              ) : null}

              {currentStep === 3 ? (
                <div className="rounded-[1.75rem] border border-stone-200 bg-stone-50 p-6">
                  <div className="flex items-center gap-2 text-sm font-semibold text-stone-900">
                    <CheckCircle2 className="h-4 w-4" />
                    Review and place order
                  </div>
                  <div className="mt-5 grid gap-3 text-sm text-stone-700">
                    <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3">
                      <span>Items</span>
                      <span className="font-medium">{items.length}</span>
                    </div>
                    <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3">
                      <span>Delivery address</span>
                      <span className="font-medium text-right">{selectedAddress ? `${selectedAddress.city}, ${selectedAddress.state}` : 'Select an address'}</span>
                    </div>
                    <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3">
                      <span>Payment</span>
                      <span className="font-medium">{paymentMethod === 'razorpay' ? 'Razorpay' : 'Cash on delivery'}</span>
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep((step) => Math.max(1, step - 1))}
                  className="rounded-full border border-stone-200 bg-white px-5 py-3 text-sm font-semibold text-stone-700 transition hover:bg-stone-100"
                >
                  Back
                </button>
                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentStep((step) => Math.min(3, step + 1))}
                    className="inline-flex items-center gap-2 rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-stone-50 transition hover:bg-stone-800"
                  >
                    Next
                    <ArrowRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleRazorpayPayment}
                    disabled={loading}
                    className="inline-flex items-center gap-2 rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-stone-50 transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {loading ? 'Processing...' : 'Place order'}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </section>

            <aside className="h-fit rounded-[1.75rem] border border-stone-200 bg-white p-6 shadow-lg shadow-stone-950/5">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-stone-500">Order summary</p>
              <div className="mt-5 grid gap-4 text-sm text-stone-700">
                {items.map((item) => (
                  <div key={item.id} className="flex items-start justify-between gap-4 border-b border-stone-100 pb-3 last:border-none last:pb-0">
                    <div>
                      <p className="font-medium text-stone-950">{item.product.name}</p>
                      <p className="text-xs text-stone-500">Qty {item.quantity}</p>
                    </div>
                    <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}

                <div className="mt-2 flex items-center justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Shipping</span>
                  <span className="font-medium">{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Discount</span>
                  <span className="font-medium">-{formatPrice(discount)}</span>
                </div>
                <div className="border-t border-stone-200 pt-4 text-base font-semibold text-stone-950">
                  <div className="flex items-center justify-between">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}
