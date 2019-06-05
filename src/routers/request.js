const express = require('express')
const Party = require('../models/Party')
const auth = require('../middleware/auth')
const Request = require('../models/Request')

const router = express.Router()

router.post('/parties/:id/requests', auth, async(req, res) => {
    // Make a request to attend a party.
    const partyId = req.params.id
    const request = new Request({
        party: partyId,
        requestor: req.user._id
    })
    try {
        await request.save()
        res.status(201).send(request)
    } catch (error) {
        res.status(500).send(error)
    }
})


module.exports = router