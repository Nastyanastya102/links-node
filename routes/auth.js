const { Router } = require('express')
const bcrypt = require('bcryptjs')
const { check, validationResult } = require('express-validator')
const jwt = require('jsonwebtoken')
// Added secure token
const config = require('config')

const router = Router()
const User = require('../models/user')

// /api/auth/register
router.post(
  '/register',
  [
    check('email', 'Please enter a valid email').isEmail(),
    check('password', 'Minimum lengt for password is 6')
      .isLength({ min: 6 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)

      if (!errors.isEmpty()) {
        return res.status(400).json({
          errors: errors.array(),
          message: 'Incorrect registration data',
        })
      }

      const { email, password } = req.body

      // check if email was used
      const candidate = await User.findOne({ email })

      if (candidate) {
        return res.status(400).json({ message: 'User with this email already exists' })
      }
      // hash password
      const hashedPassword = await bcrypt.hash(password, 12)
      const user = new User({ email, password: hashedPassword })
      // save a new user

      await user.save()

      return res.status(201).json({ message: 'User created' })

    } catch (e) {
      return res.status(500).json({ message: 'Something went wrong, please try again' })
    }
  },
)

// /api/auth/login
router.post(
  '/login',
  [
    check('email', 'Please enter a valid email').normalizeEmail().isEmail(),
    check('password', 'Enter password').exists(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)

      if (!errors.isEmpty()) {
        return res.status(400).json({
          errors: errors.array(),
          message: 'Incorrect login data',
        })
      }

      const { email, password } = req.body

      const user = await User.findOne({ email })

      if (!user) {
        return res.status(400).json({ message: 'User is not found' })
      }

      const isMatch = await bcrypt.compare(password, user.password)

      if (!isMatch) {
        // Invalid password, please try again. Better do not show what was wrong
        return res.status(400).json({ message: 'Invalid email or password, please try again' })
      }

      const token = jwt.sign(
        { userId: user.id },
        config.get('jwtSecret'),
        // reconmended time of token life
        { expiresIn: '1h' },
      )

      return res.json({ token, userId: user.id })

    } catch (e) {
      return res.status(500).json({ message: 'Something went wrong, please try again' })
    }
  },
)

module.exports = router
