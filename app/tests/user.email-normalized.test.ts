// Minimal test: create a user document and ensure email_normalized is set
// This is a lightweight test; running it requires a test DB or mocking. It's provided as guidance.

import mongoose from 'mongoose'
import connectDB from '@/app/mongoDB/db'
import User from '@/app/mongoDB/models/user'

describe('User email_normalized', () => {
  beforeAll(async () => {
    // This test assumes a test DB; set MONGODB_URI to a test instance before running.
    await connectDB()
  })

  afterAll(async () => {
    await mongoose.disconnect()
  })

  it('should set email_normalized on save', async () => {
    const now = new Date().toISOString()
    const email = `test.USER+${Date.now()}@example.com`
    const user = new User({
      email,
      password: 'dummyPassword123',
      full_name: 'Test User',
      role: 'company_admin',
      created_at: now,
      updated_at: now
    })
    const saved = await user.save()
    expect(saved.email_normalized).toBe(email.toLowerCase().trim())
    // cleanup
    await User.deleteOne({ _id: saved._id })
  })
})
