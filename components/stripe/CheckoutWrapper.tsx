"use client";

import { Elements } from '@stripe/react-stripe-js';
import { getStripe } from '@/lib/stripe-client';
import { CheckoutForm } from './CheckoutForm';

interface CheckoutWrapperProps {
  clientSecret: string;
  amount: number;
  serviceTitle: string;
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
}

export function CheckoutWrapper({
  clientSecret,
  amount,
  serviceTitle,
  onSuccess,
  onError,
}: CheckoutWrapperProps) {
  const stripePromise = getStripe();

  return (
    <Elements 
      stripe={stripePromise} 
      options={{ 
        clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#3b82f6',
            colorBackground: '#ffffff',
            colorText: '#1f2937',
            colorDanger: '#ef4444',
            fontFamily: 'Inter, system-ui, sans-serif',
            spacingUnit: '4px',
            borderRadius: '8px',
          },
        },
      }}
    >
      <CheckoutForm
        clientSecret={clientSecret}
        amount={amount}
        serviceTitle={serviceTitle}
        onSuccess={onSuccess}
        onError={onError}
      />
    </Elements>
  );
}



















