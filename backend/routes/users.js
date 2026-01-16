import express from 'express'
import { supabase } from '../config/supabase.js'

const router = express.Router()

// Get user profile
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', req.params.id)
      .single()

    if (error) throw error

    res.json({ success: true, data })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// Update user profile
router.patch('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(req.body)
      .eq('id', req.params.id)
      .select()
      .single()

    if (error) throw error

    res.json({ success: true, data })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// Get user addresses
router.get('/:id/addresses', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', req.params.id)

    if (error) throw error

    res.json({ success: true, data: data || [] })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// Add user address
router.post('/:id/addresses', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('addresses')
      .insert({
        user_id: req.params.id,
        ...req.body,
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
