import { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { ShieldCheck, RefreshCw, CreditCard } from 'lucide-react';
import Spinner from '../common/Spinner';
import { formatCurrency } from '../../utils/format';

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: '#E2E8F0', // text-frost / slate-200
      fontFamily: 'Inter, sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '14px',
      '::placeholder': {
        color: '#94a3b8', // slate-400
      },
    },
    invalid: {
      color: '#ef4444', // red-500
      iconColor: '#ef4444',
    },
  },
};

export default function StripeCardForm({
  clientSecret,
  amount,
  isSimulated,
  onSuccess,
  onError,
}) {
  const stripe = useStripe();
  const elements = useElements();

  const [loading, setLoading] = useState(false);
  const [cardError, setCardError] = useState(null);

  // Simulated Payment fields
  const [mockCard, setMockCard] = useState({
    number: '4242 4242 4242 4242',
    holder: 'Ashwani Sharma',
    expiry: '12/29',
    cvv: '123',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCardError(null);
    setLoading(true);

    if (isSimulated) {
      // Simulator Mode: Wait 1.5s and trigger success
      setTimeout(() => {
        setLoading(false);
        onSuccess({
          id: `PAY-STRIPE-SIM-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
          status: 'succeeded',
          update_time: new Date().toISOString(),
          email_address: 'customer@shopsphere.com',
        });
      }, 1500);
      return;
    }

    if (!stripe || !elements) {
      setCardError('Stripe SDK has not loaded. Please try again.');
      setLoading(false);
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setCardError('Card input form not found.');
      setLoading(false);
      return;
    }

    try {
      const { paymentIntent, error } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: mockCard.holder || 'ShopSphere Customer',
            },
          },
        }
      );

      if (error) {
        setCardError(error.message || 'Payment confirmation failed');
        onError(error.message || 'Payment confirmation failed');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        onSuccess({
          id: paymentIntent.id,
          status: paymentIntent.status,
          update_time: new Date().toISOString(),
          email_address: paymentIntent.receipt_email || 'paid@stripe.com',
        });
      }
    } catch (err) {
      setCardError(err.message || 'An error occurred during payment');
      onError(err.message || 'An error occurred during payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card p-5 space-y-4">
      <h3 className="text-sm font-bold text-frost uppercase tracking-wider flex items-center gap-1.5">
        <ShieldCheck className="h-4.5 w-4.5 text-electric" /> Secure Payment Gateway
      </h3>

      {isSimulated && (
        <div className="p-3 bg-amber/10 border border-amber/20 rounded-xl text-[10px] text-amber-bright font-bold uppercase tracking-wider text-center">
          ⚠️ Stripe Simulator Mode Active
        </div>
      )}

      {cardError && (
        <div className="p-3 bg-crimson/10 border border-crimson/20 text-crimson-bright font-semibold text-xs rounded-xl">
          {cardError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {isSimulated ? (
          // Simulation Fields (Editable, but visual)
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Card Number"
              value={mockCard.number}
              onChange={(e) => setMockCard({ ...mockCard, number: e.target.value })}
              className="input-field text-xs py-2"
            />
            <input
              type="text"
              placeholder="Cardholder Name"
              value={mockCard.holder}
              onChange={(e) => setMockCard({ ...mockCard, holder: e.target.value })}
              className="input-field text-xs py-2"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Expiry (MM/YY)"
                value={mockCard.expiry}
                onChange={(e) => setMockCard({ ...mockCard, expiry: e.target.value })}
                className="input-field text-xs py-2"
              />
              <input
                type="password"
                placeholder="CVV"
                value={mockCard.cvv}
                onChange={(e) => setMockCard({ ...mockCard, cvv: e.target.value })}
                className="input-field text-xs py-2"
              />
            </div>
          </div>
        ) : (
          // Production Stripe CardElement
          <div className="p-4 rounded-xl border border-white/5 bg-white/3">
            <CardElement options={CARD_ELEMENT_OPTIONS} />
          </div>
        )}

        <button
          type="submit"
          disabled={loading || (!isSimulated && !stripe)}
          className="w-full btn-primary py-3 text-xs rounded-xl flex items-center justify-center gap-1.5"
        >
          {loading ? (
            <>
              <RefreshCw className="h-4.5 w-4.5 animate-spin" /> Processing Payment...
            </>
          ) : (
            `Pay ${formatCurrency(amount)}`
          )}
        </button>
      </form>
    </div>
  );
}
