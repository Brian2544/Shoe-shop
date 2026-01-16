import express from 'express'
import { supabase } from '../config/supabase.js'
import nodemailer from 'nodemailer'
import { getTwilioClient, checkTwilioConfig, getTwilioFromNumber } from '../config/twilio.js'

const router = express.Router()

// Email transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

// Send email
router.post('/email/send', async (req, res) => {
  try {
    const { to, subject, html } = req.body

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      html,
    })

    res.json({ success: true, message: 'Email sent successfully' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// Send SMS
router.post('/sms/send', async (req, res) => {
  try {
    // Check if Twilio is configured
    const { isConfigured, missingVars } = checkTwilioConfig()
    
    if (!isConfigured) {
      return res.status(503).json({
        ok: false,
        error: 'Twilio is not configured',
        missingVariables: missingVars,
      })
    }

    const twilioClient = await getTwilioClient()
    if (!twilioClient) {
      return res.status(503).json({
        ok: false,
        error: 'Twilio client could not be initialized',
      })
    }

    const { to, message } = req.body
    const fromNumber = getTwilioFromNumber()
    
    if (!fromNumber) {
      return res.status(503).json({
        ok: false,
        error: 'Twilio is not configured',
        missingVariables: ['TWILIO_FROM_NUMBER or TWILIO_MESSAGING_SERVICE_SID'],
      })
    }

    await twilioClient.messages.create({
      body: message,
      from: fromNumber,
      to,
    })

    res.json({ success: true, message: 'SMS sent successfully' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// Get loyalty points
router.get('/loyalty/:userId', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('loyalty_points')
      .select('*')
      .eq('user_id', req.params.userId)
      .single()

    if (error && error.code !== 'PGRST116') throw error

    res.json({ success: true, data: data || { points: 0 } })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// Add referral
router.post('/referral', async (req, res) => {
  try {
    const { referrer_id, referred_email } = req.body

    const { data, error } = await supabase
      .from('referrals')
      .insert({
        referrer_id,
        referred_email,
        status: 'pending',
      })
      .select()
      .single()

    if (error) throw error

    res.json({ success: true, data })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

export default router
