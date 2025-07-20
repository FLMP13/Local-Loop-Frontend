import React from 'react';
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";

// PayPal payment component for both transactions and subscriptions
export default function PayPalPayment({ 
  clientId, 
  type = 'transaction', 
  amount, 
  planId,
  onSuccess, 
  onError,
  description = "Payment" 
}) {
  
  if (type === 'subscription') {
    return (
      <PayPalScriptProvider
        options={{
          "client-id": clientId,
          "vault": true,
          "intent": "subscription",
          "currency": "EUR"
        }}
      >
        <PayPalButtons
          style={{ layout: "vertical" }}
          createSubscription={(data, actions) => {
            return actions.subscription.create({
              plan_id: planId,
              application_context: {
                brand_name: "RentMate Premium",
                user_action: "SUBSCRIBE_NOW",
                payee_email: "localloop@business.example.com"
              }
            });
          }}
          onApprove={async (data, actions) => {
            try {
              const subscriptionID = data.subscriptionID;
              await onSuccess({ subscriptionID });
            } catch (error) {
              onError(error);
            }
          }}
          onError={onError}
        />
      </PayPalScriptProvider>
    );
  }

  // Transaction payment
  return (
    <PayPalScriptProvider options={{ "client-id": clientId, currency: "EUR" }}>
      <PayPalButtons
        style={{ layout: "vertical" }}
        createOrder={(data, actions) => {
          return actions.order.create({
            purchase_units: [
              {
                amount: {
                  value: amount.toString(),
                },
                payee: {
                  email_address: "localloop@business.example.com"
                },
                description
              },
            ],
          });
        }}
        onApprove={async (data, actions) => {
          try {
            const details = await actions.order.capture();
            await onSuccess({ details });
          } catch (error) {
            onError(error);
          }
        }}
        onError={onError}
      />
    </PayPalScriptProvider>
  );
}
