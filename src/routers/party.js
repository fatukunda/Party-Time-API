const express = require('express')
const Party = require('../models/Party')
const auth = require('../middleware/auth')

const router = express.Router()

router.post('/parties', auth, async(req, res) => {
    const party = new Party({
        ...req.body,
        host: req.user._id
    })
    try {
        await party.save()
        await req.user.addToPartiesHosted(party._id)
        res.status(201).send(party)
    } catch (error) {
        res.status(400).send(error)
    }
})

module.exports = router