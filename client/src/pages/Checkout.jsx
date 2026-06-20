import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Truck, ClipboardList, CheckCircle, ArrowLeft, ArrowRight, MapPin, Plus } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import orderService from '../services/orderService';
import { formatCurrency } from '../utils/format';

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, cartTotal, clearCart } = useCart();
  const { user, updateProfile } = useAuth();

  // Redirect if cart is empty
  useEffect(() => {
    if (cart.length === 0) {
      navigate('/cart');
    }
  }, [cart, navigate]);

  const [step, setStep] = useState(1); // 1: Shipping, 2: Payment, 3: Review

  // Shipping form state
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(
    user?.addresses?.findIndex((addr) => addr.isDefault) ?? -1
  );
  const [showNewAddressForm, setShowNewAddressForm] = useState(
    !(user?.addresses && user.addresses.length > 0)
  );

  const [newAddress, setNewAddress] = useState({
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
  });
  
  const [saveToProfile, setSaveToProfile] = useState(true);
  const [shippingErrors, setShippingErrors] = useState({});

  // Payment form state
  const [paymentMethod, setPaymentMethod] = useState('Card'); // 'Card' or 'COD'
  const [cardDetails, setCardDetails] = useState({
    number: '',
    holder: '',
    expiry: '',
    cvv: '',
  });
  const [paymentErrors, setPaymentErrors] = useState({});
  
  // Submit state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Financial calculations
  const shippingThreshold = 1000;
  const shippingPrice = cartTotal >= shippingThreshold ? 0 : 99;
  const taxPrice = cartTotal * 0.18; // 18% GST
  const totalPrice = cartTotal + shippingPrice + taxPrice;

  // Handle shipping step validation
  const handleShippingNext = async () => {
    if (showNewAddressForm) {
      // Validate new address form
      const errors = {};
      if (!newAddress.address.trim()) errors.address = 'Street address is required';
      if (!newAddress.city.trim()) errors.city = 'City is required';
      if (!newAddress.postalCode.trim()) errors.postalCode = 'Postal code is required';
      else if (!/^\d{6}$/.test(newAddress.postalCode)) errors.postalCode = 'Must be a 6-digit pin code';

      if (Object.keys(errors).length > 0) {
        setShippingErrors(errors);
        return;
      }

      // If user wants to save this to their profile
      if (saveToProfile && user) {
        try {
          const updatedAddresses = [...(user.addresses || []), { ...newAddress, isDefault: user.addresses?.length === 0 }];
          await updateProfile({ addresses: updatedAddresses });
          // Set selection to newly added address
          setSelectedAddressIndex(updatedAddresses.length - 1);
          setShowNewAddressForm(false);
        } catch (err) {
          console.error('Failed to save address to profile:', err);
        }
      }
    } else {
      if (selectedAddressIndex === -1) {
        alert('Please select a shipping address');
        return;
      }
    }
    
    setStep(2);
  };

  // Validate Card Details
  const handlePaymentNext = () => {
    setStep(3);
  };

  // Submit order placement
  const handlePlaceOrder = async () => {
    setIsSubmitting(true);
    try {
      // Pick the correct address
      let finalAddress;
      if (showNewAddressForm) {
        finalAddress = newAddress;
      } else {
        const selectedAddr = user.addresses[selectedAddressIndex];
        finalAddress = {
          address: selectedAddr.address,
          city: selectedAddr.city,
          state: selectedAddr.state,
          postalCode: selectedAddr.postalCode,
          country: selectedAddr.country,
        };
      }

      // Format items
      const orderItems = cart.map((item) => ({
        product: item.product._id,
        quantity: item.quantity,
        price: item.product.price * (1 - item.product.discountPercent / 100),
      }));

      // Create Order
      const res = await orderService.createOrder({
        orderItems,
        shippingAddress: finalAddress,
        paymentMethod,
        taxPrice,
        shippingPrice,
        totalPrice,
      });

      if (res.success && res.order) {
        const orderId = res.order._id;
        clearCart();
        navigate(`/orders/${orderId}`);
      }
    } catch (err) {
      alert(err.message || 'Error placing order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  document.title = "Checkout - ShopSphere";

  return (
    <div className="container-custom py-10">
      {/* Checkout Steps Stepper */}
      <div className="max-w-3xl mx-auto mb-10">
        <div className="flex justify-between items-center relative">
          {/* Background Line */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/5 -translate-y-1/2 z-0" />
          
          {/* Active indicator bar */}
          <div 
            className="absolute top-1/2 left-0 h-0.5 bg-gradient-to-r from-electric to-neon transition-all duration-500 -translate-y-1/2 z-0"
            style={{ width: `${((step - 1) / 2) * 100}%` }}
          />

          {[
            { num: 1, label: 'Shipping', icon: Truck },
            { num: 2, label: 'Payment', icon: CreditCard },
            { num: 3, label: 'Review', icon: ClipboardList }
          ].map((s) => {
            const Icon = s.icon;
            const isActive = step >= s.num;
            const isCurrent = step === s.num;
            return (
              <div key={s.num} className="flex flex-col items-center relative z-10">
                <div 
                  className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all duration-300 ${
                    isCurrent 
                      ? 'bg-electric text-obsidian border-electric scale-110 shadow-glow' 
                      : isActive 
                        ? 'bg-electric/10 text-electric border-electric/50'
                        : 'bg-onyx text-smoke border-white/10'
                  }`}
                >
                  {isActive && step > s.num ? <CheckCircle className="h-5 w-5 fill-current" /> : <Icon className="h-[18px] w-[18px]" />}
                </div>
                <span className={`text-xs font-bold mt-2.5 ${isActive ? 'text-frost' : 'text-smoke'}`}>
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Step Body */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: 0.25 }}
                className="card p-6 space-y-6"
              >
                <div>
                  <h2 className="text-xl font-bold text-frost">Shipping Address</h2>
                  <p className="text-xs text-smoke mt-1">Specify where your items should be delivered</p>
                </div>

                {/* Existing addresses checklist */}
                {user?.addresses && user.addresses.length > 0 && !showNewAddressForm && (
                  <div className="space-y-4">
                    <label className="block text-xs font-bold text-smoke uppercase tracking-widest">
                      Select Delivery Address
                    </label>
                    <div className="grid grid-cols-1 gap-3.5">
                      {user.addresses.map((addr, idx) => (
                        <div
                          key={idx}
                          onClick={() => setSelectedAddressIndex(idx)}
                          className={`p-4 border rounded-xl cursor-pointer flex items-start gap-3.5 transition-all ${
                            selectedAddressIndex === idx
                              ? 'border-electric/50 bg-electric/5 shadow-glow-blue-sm'
                              : 'border-white/10 hover:border-white/20'
                          }`}
                        >
                          <input
                            type="radio"
                            checked={selectedAddressIndex === idx}
                            onChange={() => setSelectedAddressIndex(idx)}
                            className="mt-1 accent-electric"
                          />
                          <div className="text-sm">
                            <p className="font-bold text-frost flex items-center gap-1.5">
                              <MapPin className="h-3.5 w-3.5 text-electric" />
                              Address #{idx + 1} {addr.isDefault && <span className="badge-primary px-1.5 py-0.5 text-[9px] rounded-md">Default</span>}
                            </p>
                            <p className="text-smoke mt-1 leading-relaxed">
                              {addr.address}, {addr.city}, {addr.state} - {addr.postalCode}, {addr.country}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => setShowNewAddressForm(true)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-electric hover:underline"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add new address
                    </button>
                  </div>
                )}

                {/* New address entry form */}
                {showNewAddressForm && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <label className="block text-xs font-bold text-smoke uppercase tracking-widest">
                        Enter Address Details
                      </label>
                      {user?.addresses && user.addresses.length > 0 && (
                        <button
                          onClick={() => {
                            setShowNewAddressForm(false);
                            setShippingErrors({});
                          }}
                          className="text-xs text-smoke hover:text-electric hover:underline font-semibold"
                        >
                          Use saved address
                        </button>
                      )}
                    </div>

                    <div className="space-y-3.5">
                      <div>
                        <input
                          type="text"
                          placeholder="Street address / Suite / Apartment"
                          value={newAddress.address}
                          onChange={(e) => {
                            setNewAddress({ ...newAddress, address: e.target.value });
                            setShippingErrors({ ...shippingErrors, address: '' });
                          }}
                          className={`input-field text-sm py-2.5 ${shippingErrors.address ? 'border-crimson focus:border-crimson' : ''}`}
                        />
                        {shippingErrors.address && <p className="text-[10px] text-crimson font-semibold mt-1">{shippingErrors.address}</p>}
                      </div>

                      <div className="grid grid-cols-2 gap-3.5">
                        <div>
                          <input
                            type="text"
                            placeholder="City"
                            value={newAddress.city}
                            onChange={(e) => {
                              setNewAddress({ ...newAddress, city: e.target.value });
                              setShippingErrors({ ...shippingErrors, city: '' });
                            }}
                            className={`input-field text-sm py-2.5 ${shippingErrors.city ? 'border-crimson focus:border-crimson' : ''}`}
                          />
                          {shippingErrors.city && <p className="text-[10px] text-crimson font-semibold mt-1">{shippingErrors.city}</p>}
                        </div>
                        <div>
                          <input
                            type="text"
                            placeholder="State"
                            value={newAddress.state}
                            onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                            className="input-field text-sm py-2.5"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3.5">
                        <div>
                          <input
                            type="text"
                            placeholder="PIN code (6 digits)"
                            value={newAddress.postalCode}
                            maxLength={6}
                            onChange={(e) => {
                              setNewAddress({ ...newAddress, postalCode: e.target.value });
                              setShippingErrors({ ...shippingErrors, postalCode: '' });
                            }}
                            className={`input-field text-sm py-2.5 ${shippingErrors.postalCode ? 'border-crimson focus:border-crimson' : ''}`}
                          />
                          {shippingErrors.postalCode && <p className="text-[10px] text-crimson font-semibold mt-1">{shippingErrors.postalCode}</p>}
                        </div>
                        <div>
                          <input
                            type="text"
                            placeholder="Country"
                            value={newAddress.country}
                            disabled
                            className="input-field text-sm py-2.5 opacity-50"
                          />
                        </div>
                      </div>

                      {user && (
                        <label className="flex items-center gap-2 text-xs font-bold text-mist pt-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={saveToProfile}
                            onChange={(e) => setSaveToProfile(e.target.checked)}
                            className="accent-electric rounded"
                          />
                          Save this address to my profile
                        </label>
                      )}
                    </div>
                  </div>
                )}

                <div className="pt-4 flex justify-end">
                  <button onClick={handleShippingNext} className="btn-primary gap-1.5 text-sm py-2.5 pr-4 pl-5">
                    Continue <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: 0.25 }}
                className="card p-6 space-y-6"
              >
                <div>
                  <h2 className="text-xl font-bold text-frost">Payment Method</h2>
                  <p className="text-xs text-smoke mt-1">Choose your preferred transaction system</p>
                </div>

                {/* Tabs */}
                <div className="grid grid-cols-2 gap-3.5">
                  <div
                    onClick={() => {
                      setPaymentMethod('Card');
                      setPaymentErrors({});
                    }}
                    className={`p-4 border rounded-xl cursor-pointer text-center space-y-2.5 transition-all ${
                      paymentMethod === 'Card'
                        ? 'border-electric/50 bg-electric/5 shadow-glow-blue-sm font-bold'
                        : 'border-white/10 hover:border-white/20'
                    }`}
                  >
                    <CreditCard className="h-6 w-6 mx-auto text-electric" />
                    <span className="text-sm text-frost block">Credit / Debit Card</span>
                  </div>
                  <div
                    onClick={() => {
                      setPaymentMethod('COD');
                      setPaymentErrors({});
                    }}
                    className={`p-4 border rounded-xl cursor-pointer text-center space-y-2.5 transition-all ${
                      paymentMethod === 'COD'
                        ? 'border-electric/50 bg-electric/5 shadow-glow-blue-sm font-bold'
                        : 'border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="h-6 w-6 mx-auto bg-white/5 border border-white/10 rounded flex items-center justify-center text-[10px] font-extrabold text-mist">₹</div>
                    <span className="text-sm text-frost block">Cash on Delivery (COD)</span>
                  </div>
                </div>

                {/* Card input details replaced by message */}
                {paymentMethod === 'Card' && (
                  <div className="p-5 bg-white/3 border border-white/8 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-white/5">
                      <span className="text-xs font-bold text-mist uppercase tracking-wider">Stripe Payment Options</span>
                      <div className="flex gap-1">
                        <div className="h-5 w-8 bg-white/5 rounded border border-white/10 flex items-center justify-center text-[8px] font-bold text-smoke">VISA</div>
                        <div className="h-5 w-8 bg-white/5 rounded border border-white/10 flex items-center justify-center text-[8px] font-bold text-smoke">MC</div>
                      </div>
                    </div>
                    <p className="text-xs text-smoke leading-relaxed">
                      You will process card payments securely via the Stripe Gateway on the order details page after placing your order.
                    </p>
                  </div>
                )}

                {paymentMethod === 'COD' && (
                  <div className="p-5 bg-amber/10 border border-amber/20 rounded-2xl text-amber-bright text-xs leading-relaxed space-y-1.5">
                    <p className="font-bold flex items-center gap-1.5">💡 Payment on Delivery Notice</p>
                    <p>You can pay in cash or via UPI when the courier agent delivers the package to your address. Please verify the order details in the next step.</p>
                  </div>
                )}

                <div className="pt-4 flex justify-between">
                  <button
                    onClick={() => setStep(1)}
                    className="btn-secondary gap-1.5 text-sm py-2.5 pl-4 pr-5"
                  >
                    <ArrowLeft className="h-4 w-4" /> Back
                  </button>
                  <button
                    onClick={handlePaymentNext}
                    className="btn-primary gap-1.5 text-sm py-2.5 pr-4 pl-5"
                  >
                    Continue <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: 0.25 }}
                className="card p-6 space-y-6"
              >
                <div>
                  <h2 className="text-xl font-bold text-frost">Review Order</h2>
                  <p className="text-xs text-smoke mt-1">Ensure everything looks correct before submitting</p>
                </div>

                <div className="space-y-4">
                  {/* Shipping preview */}
                  <div className="p-4 bg-white/3 border border-white/5 rounded-xl">
                    <h4 className="text-xs font-bold text-smoke uppercase tracking-widest mb-1.5">Shipping Destination</h4>
                    <p className="text-sm font-semibold text-frost">
                      {showNewAddressForm ? (
                        `${newAddress.address}, ${newAddress.city}, ${newAddress.state} - ${newAddress.postalCode}`
                      ) : (
                        (() => {
                          const addr = user?.addresses?.[selectedAddressIndex];
                          return addr ? `${addr.address}, ${addr.city}, ${addr.state} - ${addr.postalCode}` : '';
                        })()
                      )}
                    </p>
                  </div>

                  {/* Payment preview */}
                  <div className="p-4 bg-white/3 border border-white/5 rounded-xl">
                    <h4 className="text-xs font-bold text-smoke uppercase tracking-widest mb-1.5">Payment Selection</h4>
                    <p className="text-sm font-semibold text-frost">
                      {paymentMethod === 'Card' ? (
                        <span className="flex items-center gap-1.5">
                          <CreditCard className="h-4 w-4 text-electric" />
                          Credit / Debit Card (via Stripe)
                        </span>
                      ) : (
                        'Cash on Delivery (COD)'
                      )}
                    </p>
                  </div>
                </div>

                <div className="pt-4 flex justify-between">
                  <button
                    onClick={() => setStep(2)}
                    disabled={isSubmitting}
                    className="btn-secondary gap-1.5 text-sm py-2.5 pl-4 pr-5 disabled:opacity-40"
                  >
                    <ArrowLeft className="h-4 w-4" /> Back
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={isSubmitting}
                    className="btn-primary gap-1.5 text-sm py-2.5 shadow-glow hover:shadow-glow-lg disabled:opacity-50"
                  >
                    {isSubmitting ? 'Processing Order...' : 'Place Order'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Side: Order summary layout */}
        <div className="lg:col-span-4">
          <div className="glass-card p-5 space-y-5 sticky top-24">
            <h3 className="text-base font-bold text-frost">
              Order Items ({cart.reduce((sum, x) => sum + x.quantity, 0)})
            </h3>

            {/* Item list */}
            <div className="max-h-[220px] overflow-y-auto space-y-3.5 pr-1.5 scrollbar-thin">
              {cart.map((item) => {
                if (!item.product) return null;
                const price = item.product.price * (1 - item.product.discountPercent / 100);
                return (
                  <div key={item.product._id} className="flex gap-3 items-center justify-between text-xs">
                    <div className="flex gap-2.5 items-center min-w-0">
                      <div className="h-10 w-10 bg-white/3 p-0.5 rounded border border-white/10 shrink-0">
                        <img src={item.product.images?.[0]} alt="" className="h-full w-full object-contain rounded" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-frost truncate">{item.product.title}</p>
                        <p className="text-smoke mt-0.5">{item.quantity} x {formatCurrency(price)}</p>
                      </div>
                    </div>
                    <span className="font-bold shrink-0 text-frost">{formatCurrency(price * item.quantity)}</span>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-white/5" />

            {/* Calculations block */}
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-smoke">
                <span>Items Subtotal</span>
                <span className="font-semibold text-frost">{formatCurrency(cartTotal)}</span>
              </div>
              <div className="flex justify-between text-smoke">
                <span>Shipping Fee</span>
                <span className="font-semibold text-frost">
                  {shippingPrice === 0 ? <span className="text-plasma uppercase font-bold text-[10px]">Free</span> : formatCurrency(shippingPrice)}
                </span>
              </div>
              <div className="flex justify-between text-smoke">
                <span>GST (18%)</span>
                <span className="font-semibold text-frost">{formatCurrency(taxPrice)}</span>
              </div>
            </div>

            <div className="border-t border-white/5" />

            <div className="flex justify-between items-baseline pt-1">
              <span className="text-sm font-bold text-frost">Amount Pay</span>
              <span className="text-lg font-extrabold text-electric">{formatCurrency(totalPrice)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
