require('dotenv').config();
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const cors = require('cors');

const app = express();

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL,
}));

app.use(express.json());

// =============================
// Create Checkout Session
// =============================
app.post('/create-checkout-session', async (req, res) => {
  try {

    const { packageType } = req.body;

    let price = 0;
    let packageName = "";

    // Secure pricing (DO NOT trust frontend amount)
    if (packageType === "starter") {
      price = 499;
      packageName = "Starter Marketing Package";
    } 
    else if (packageType === "growth") {
      price = 999;
      packageName = "Growth Marketing Package";
    } 
    else if (packageType === "scale") {
      price = 1999;
      packageName = "Scale Marketing Package";
    } 
    else {
      return res.status(400).json({ error: "Invalid package" });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: packageName,
          },
          unit_amount: price * 100,
        },
        quantity: 1,
      }],
      success_url: `${process.env.FRONTEND_URL}/success.html`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel.html`,
    });

    res.json({ id: session.id });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// =============================
// Webhook
// =============================
app.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {

  const sig = req.headers['stripe-signature'];

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;

      console.log("Payment successful:");
      console.log("Customer Email:", session.customer_details.email);
      console.log("Amount:", session.amount_total / 100);

      // Here you would:
      // Save to database
      // Send invoice
      // Send email notification
    }

    res.json({ received: true });

  } catch (err) {
    console.error("Webhook error:", err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

const PORT = 4242;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
