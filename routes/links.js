const { Router } = require('express')

const config = require('config')
const { nanoid } = require('nanoid');

const Links = require('../models/links');
const authMiddleware = require('../middleware/auth.middleware')

const router = Router()

router.post('/generate', authMiddleware, async (req, res) => {
  try {
    const baseUrl = config.get('baseUrl')
    const { from } = req.body

    const code = nanoid()
    const exist = await Links.findOne({ from })

    if (exist) {
      res.json({ link: exist })
    }

    const to = `${baseUrl}/t/${code}`

    const link = new Links({
      code,
      to,
      from,
      owner: req.user.userId,
    })

    await link.save()

    res.status(201).json({ link })
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Something went wrong, please try again' })
  }
})

router.get('/', authMiddleware, async (req, res) => {
  try {
    const links = await Links.find({ owner: req.user.userId })

    res.json(links)

  } catch (error) {
    res.status(500).json({ message: 'Something went wrong, please try again' })
  }
})

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const link = await Links.findById(req.params.id)

    console.log(link);
    res.json(link)
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong, please try again' })
  }
})

module.exports = router
