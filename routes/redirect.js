const { Router } = require('express')
const Link = require('../models/links')

const router = Router()

router.get('/:code', async (req, res) => {
  try {
    const link = await Link.findOne({ code: req.params.code })

    if (link) {
      // eslint-disable-next-line no-plusplus
      link.clicks++
      await link.save()
      return res.redirect(link.from)
    }

    return res.status(404).json('Link is not found')
  } catch (error) {
    return res.status(500).json({ message: 'Something went wrong, please try again' })
  }
})
module.exports = router
