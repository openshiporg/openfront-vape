"use client";
import { Stripe, StripeElementsOptions } from "@stripe/stripe-js"
import { Elements } from "@stripe/react-stripe-js"
import { createContext } from "react"

export const StripeContext = createContext(false)

interface StripeWrapperProps {
  paymentSession: {
    data?: {
      clientSecret?: string;
    };
  };
  stripeKey: string | null | undefined;
  stripePromise: any;
  children: React.ReactNode;
}

const StripeWrapper = ({
  paymentSession,
  stripeKey,
  stripePromise,
  children,
}: StripeWrapperProps) => {
  // Light shelf ground: Stripe iframes cannot read CSS variables, so the vp-* values are mirrored here.
  const options = {
    clientSecret: paymentSession?.data?.clientSecret,
    appearance: {
      theme: "stripe" as const,
      variables: {
        colorPrimary: "#121816",
        colorBackground: "#ffffff",
        colorText: "#121816",
        colorTextSecondary: "#3c4743",
        colorTextPlaceholder: "#5b6763",
        colorDanger: "#b3261e",
        borderRadius: "4px",
      },
    },
  }

  if (!stripeKey) {
    throw new Error(
      "Stripe key is missing. Set NEXT_PUBLIC_STRIPE_KEY environment variable."
    )
  }

  if (!stripePromise) {
    throw new Error(
      "Stripe promise is missing. Make sure you have provided a valid Stripe key."
    )
  }

  // if (!paymentSession?.data?.client_secret) {
  //   throw new Error(
  //     "Stripe client secret is missing. Cannot initialize Stripe."
  //   )
  // }

  return (
    <StripeContext.Provider value={true}>
      <Elements options={options} stripe={stripePromise}>
        {children}
      </Elements>
    </StripeContext.Provider>
  )
}

export default StripeWrapper
