import { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useToast } from '../context/ToastContext';
import client from '../api/client';
import './Payment.css';

interface StripePaymentProps {
    amount: number;
    onSuccess: (paymentIntentId: string) => void;
    onError: (error: string) => void;
}

export default function StripePayment({ amount, onSuccess, onError }: StripePaymentProps) {
    const stripe = useStripe();
    const elements = useElements();
    const { showToast } = useToast();
    const [processing, setProcessing] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setProcessing(true);

        try {
            // Create payment intent
            const { data } = await client.post('/payments/stripe/create-intent', {
                amount,
                currency: 'pkr'
            });

            const { clientSecret, paymentIntentId } = data;

            // Confirm payment
            const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: elements.getElement(CardElement)!
                }
            });

            if (error) {
                onError(error.message || 'Payment failed');
                showToast(error.message || 'Payment failed', 'error');
            } else if (paymentIntent?.status === 'succeeded') {
                onSuccess(paymentIntentId);
                showToast('Payment successful!', 'success');
            }
        } catch (error: any) {
            onError(error.response?.data?.error || 'Payment failed');
            showToast('Payment failed', 'error');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="stripe-payment-form">
            <div className="card-element-wrapper">
                <CardElement
                    options={{
                        style: {
                            base: {
                                fontSize: '16px',
                                color: '#424770',
                                '::placeholder': {
                                    color: '#aab7c4',
                                },
                            },
                            invalid: {
                                color: '#9e2146',
                            },
                        },
                    }}
                />
            </div>

            <button
                type="submit"
                disabled={!stripe || processing}
                className="luxury-button payment-button"
            >
                {processing ? 'Processing...' : `Pay PKR ${amount.toLocaleString()}`}
            </button>

            <div className="payment-security">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L3 7V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V7L12 2Z" stroke="currentColor" strokeWidth="2" />
                </svg>
                <span>Secured by Stripe</span>
            </div>
        </form>
    );
}
