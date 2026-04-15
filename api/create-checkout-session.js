import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!stripeSecretKey) {
    return res.status(500).json({ error: 'Missing STRIPE_SECRET_KEY environment variable.' });
  }

  try {
    const stripe = new Stripe(stripeSecretKey, { apiVersion: '2025-02-24.acacia' });
    const { fullName, email, service, provider, date, time, deposit } = req.body;

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: email,
      success_url: `${req.headers.origin}/booking.html?status=success`,
      cancel_url: `${req.headers.origin}/booking.html?status=cancelled`,
      metadata: { fullName, service, provider, date, time },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'usd',
            product_data: { name: `${service || 'Beauty service'} deposit` },
            unit_amount: Number(deposit) * 100
          }
        }
      ]
    });

    return res.status(200).json({ url: session.url });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
