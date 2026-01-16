import express from 'express'
import Stripe from 'stripe'
import paypal from 'paypal-rest-sdk'

const router = express.Router()

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

// Configure PayPal
paypal.configure({
  mode: process.env.PAYPAL_MODE || 'sandbox',
  client_id: process.env.PAYPAL_CLIENT_ID,
  client_secret: process.env.PAYPAL_CLIENT_SECRET,
})

// Create Stripe payment intent
router.post('/stripe/create-intent', async (req, res) => {
  try {
    const { amount, currency = 'usd' } = req.body

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
    })

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// Create PayPal payment
router.post('/paypal/create', (req, res) => {
  try {
    const { amount, currency = 'USD' } = req.body

    const create_payment_json = {
      intent: 'sale',
      payer: {
        payment_method: 'paypal',
      },
      redirect_urls: {
        return_url: `${process.env.FRONTEND_URL}/checkout/success`,
        cancel_url: `${process.env.FRONTEND_URL}/checkout/cancel`,
      },
      transactions: [
        {
          item_list: {
            items: [
              {
                name: 'Shoe Purchase',
                sku: 'item',
                price: amount.toFixed(2),
                currency,
                quantity: 1,
              },
            ],
          },
          amount: {
            currency,
            total: amount.toFixed(2),
          },
          description: 'Shoe purchase',
        },
      ],
    }

    paypal.payment.create(create_payment_json, (error, payment) => {
      if (error) {
        return res.status(500).json({ success: false, message: error.message })
      }

      const approvalUrl = payment.links.find((link) => link.rel === 'approval_url')

      res.json({
        success: true,
        paymentId: payment.id,
        approvalUrl: approvalUrl.href,
      })
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// Execute PayPal payment
router.post('/paypal/execute', (req, res) => {
  try {
    const { paymentId, payerId } = req.body

    const execute_payment_json = {
      payer_id: payerId,
    }

    paypal.payment.execute(paymentId, execute_payment_json, (error, payment) => {
      if (error) {
        return res.status(500).json({ success: false, message: error.message })
      }

      res.json({ success: true, payment })
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// M-Pesa payment (simplified - requires actual M-Pesa API integration)
router.post('/mpesa/initiate', async (req, res) => {
  try {
    const { phoneNumber, amount, orderId } = req.body

    // This is a placeholder - actual M-Pesa integration requires:
    // 1. OAuth token generation
    // 2. STK Push API call
    // 3. Callback handling

    res.json({
      success: true,
      message: 'M-Pesa payment initiated',
      checkoutRequestId: `MPESA_${Date.now()}`,
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

export default router
